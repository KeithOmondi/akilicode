import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { buildStageDoc, RUNTIME_SOURCE } from '../src/lib/scratch/runtime.ts';
import { readBridgeMessage, PREVIEW_CSP } from '../src/lib/sandbox.ts';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The stage animates forever (requestAnimationFrame); close every window at the end so the test process can exit.
const windows = [];
after(() => windows.forEach((w) => w.close()));

/** Run generated code on the real stage engine inside a DOM, with the canvas stubbed out. */
const stage = async (code, { wait = 50 } = {}) => {
  const token = 'tk';
  const messages = [];
  const dom = new JSDOM(buildStageDoc({ code, token }), {
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = () => null;
      window.addEventListener('message', (e) => { const m = readBridgeMessage(e.data, token); if (m) messages.push(m); });
    },
  });
  windows.push(dom.window);
  await sleep(wait);
  return { window: dom.window, S: dom.window.S, messages, state: () => dom.window.S.state() };
};

test('the stage page is sealed like the web preview: no network, only inline code', () => {
  const doc = buildStageDoc({ code: '', token: 't' });
  assert.ok(doc.includes(PREVIEW_CSP));
  assert.doesNotMatch(RUNTIME_SOURCE, /fetch\(|XMLHttpRequest|WebSocket|localStorage|document\.cookie|eval\(|new Function/);
});

test('move and turn follow Scratch: 90 is right, turning right is clockwise, y grows upwards', async () => {
  const { state } = await stage("S.on('flag', async function () { S.move(10); S.turn(90); S.move(10); });");
  const s = state();
  assert.equal(Math.round(s.x), 10);
  assert.equal(Math.round(s.y), -10);
  assert.equal(s.dir, 180);
});

test('turning left and pointing in a direction wrap around correctly', async () => {
  const { state } = await stage("S.on('flag', async function () { S.turn(-100); });");
  assert.equal(state().dir, 350);
  const b = await stage("S.on('flag', async function () { S.pointDir(450); });");
  assert.equal(b.state().dir, 90);
});

test('the sprite cannot leave the stage, and bounce turns it around at an edge', async () => {
  const { state } = await stage("S.on('flag', async function () { S.move(10000); S.bounce(); });");
  const s = state();
  assert.ok(s.x <= 240 && s.x >= -240);
  assert.equal(s.dir, 270); // was heading right, now heading left
  const top = await stage("S.on('flag', async function () { S.pointDir(0); S.move(10000); S.bounce(); });");
  assert.equal(top.state().dir, 180); // was heading up, now heading down
});

test('a repeat loop runs every turn, one frame at a time', async () => {
  const code = "S.on('flag', async function () { for (var i = 0; i < 5; i++) { S.move(10); await S.tick(); } });";
  const { state } = await stage(code, { wait: 400 });
  assert.equal(Math.round(state().x), 50);
});

test('stop freezes everything: a forever loop does not move the sprite afterwards', async () => {
  const { S, state } = await stage("S.on('flag', async function () { while (S.running) { S.changeX(1); await S.tick(); } });", { wait: 120 });
  S.stop();
  await sleep(40);
  const frozen = state().x;
  assert.ok(frozen > 0);
  await sleep(150);
  assert.equal(state().x, frozen);
});

test('keys: pressing the right arrow runs the "when key pressed" blocks, and keyDown reports it', async () => {
  const { window, state, S } = await stage("S.on('key:right', async function () { S.changeX(10); });");
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'ArrowRight' }));
  await sleep(20);
  assert.equal(state().x, 10);
  assert.equal(S.keyDown('right'), true);
  window.dispatchEvent(new window.KeyboardEvent('keyup', { key: 'ArrowRight' }));
  assert.equal(S.keyDown('right'), false);
});

test('say and say-for show a speech bubble, and say-for clears it afterwards', async () => {
  const { state, S } = await stage("S.on('flag', async function () { S.say('hi'); });");
  assert.equal(state().bubble, 'hi');
  S.say('');
  assert.equal(state().bubble, null);
  await S.sayFor('bye', 0.05);
  assert.equal(state().bubble, null);
});

test('a mistake inside the blocks is reported to the page instead of crashing it', async () => {
  const { messages } = await stage("S.on('flag', async function () { throw new Error('boom'); });");
  assert.ok(messages.some((m) => m.type === 'error' && /boom/.test(m.text)));
});

test('costume, size, background, touching the edge and random-free sensing work', async () => {
  const { state, S } = await stage("S.on('flag', async function () { S.costume('🚀'); S.setSize(5000); S.changeSize(-4990); S.background('#123456'); S.goTo(1000, 0); });");
  const s = state();
  assert.equal(s.costume, '🚀');
  assert.equal(s.size, 10 + 0); // 5000 -> capped at 500, then -4990 -> floored at 10
  assert.equal(s.bg, '#123456');
  assert.equal(S.touchingEdge(), true);
  assert.equal(S.x(), 240);
});

test('a token from another page is not believed', () => {
  assert.equal(readBridgeMessage({ __akili: 'other', type: 'error', text: 'x' }, 'tk'), null);
});

test('</script> inside generated code cannot break out of the page', async () => {
  const { window } = await stage("S.on('flag', async function () { S.say('</script><img src=x onerror=alert(1)>'); });", { wait: 80 });
  assert.equal(window.document.querySelectorAll('img').length, 0);
  assert.equal(window.document.querySelectorAll('script').length, 3); // runtime, program, start
});
