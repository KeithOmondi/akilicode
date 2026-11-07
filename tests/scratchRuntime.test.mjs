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
  assert.equal(window.document.querySelectorAll('script').length, 4); // costumes, runtime, program, start
});

test('several sprites: each has its own position and blocks, and they can tell when they touch', async () => {
  const code = `
    (function (S) { S.on('flag', async function () { S.goTo(0, 0); S.move(20); }); })(S.forSprite(0, "🐱"));
    (function (S) { S.on('flag', async function () { S.goTo(30, 0); S.say(S.touching(0) ? 'bump' : 'far'); }); })(S.forSprite(1, "🐶"));
    (function (S) { S.on('flag', async function () { S.goTo(-200, 100); }); })(S.forSprite(2, "🐰"));`;
  const { S } = await stage(code);
  const all = S.states();
  assert.equal(all.length, 3);
  assert.equal(all.map((s) => s.costume).join(' '), '🐱 🐶 🐰');
  assert.equal(Math.round(all[0].x), 20); // moved only the cat
  assert.equal(Math.round(all[1].x), 30);
  assert.equal(all[1].bubble, 'bump'); // 10 apart: touching
  assert.equal(Math.round(all[2].y), 100);
});

test('clicking a sprite runs that sprite\'s click blocks only', async () => {
  const code = `
    (function (S) { S.on('click', async function () { S.say('cat'); }); })(S.forSprite(0, "🐱"));
    (function (S) { S.on('click', async function () { S.say('dog'); }); })(S.forSprite(1, "🐶"));`;
  const { window, S } = await stage(code);
  const canvas = window.document.getElementById('stage');
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 480, height: 360 });
  canvas.focus = () => {};
  // sprite 1 starts at x = -140: its centre on screen is (240 - 140, 180)
  canvas.dispatchEvent(new window.MouseEvent('mousedown', { clientX: 100, clientY: 180 }));
  await sleep(30);
  const all = S.states();
  assert.equal(all[1].bubble, 'dog');
  assert.equal(all[0].bubble, null);
});

test('costumes: switch by id or name, next costume wraps round, pictures are loaded from the page only', async () => {
  const costumes = [[
    { id: 'c1', name: 'Cat', src: 'data:image/png;base64,iVBORw0KGgo=' },
    { id: 'c2', name: 'Happy cat', src: 'data:image/png;base64,iVBORw0KGgo=' },
    { id: 'c3', name: 'Sleepy', src: 'emoji:😴' },
  ]];
  const token = 'tk';
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM(buildStageDoc({ code: '', token, costumes }), { runScripts: 'dangerously', pretendToBeVisual: true, beforeParse(w) { w.HTMLCanvasElement.prototype.getContext = () => null; } });
  windows.push(dom.window);
  await sleep(30);
  const S = dom.window.S;
  assert.equal(S.state().costume, 'Cat');
  S.nextCostume();
  assert.equal(S.state().costume, 'Happy cat');
  S.costume('c3');
  assert.equal(S.state().costume, '😴');
  S.nextCostume(); // wraps to the first
  assert.equal(S.state().costume, 'Cat');
  S.costume('Happy cat'); // by name
  assert.equal(S.state().costume, 'Happy cat');
  S.costume('🐶'); // an old project asks for an emoji that is not a costume: still shown
  assert.equal(S.state().costume, '🐶');
  assert.equal(S.states().length, 1);
});

test('a costume name cannot break out of the page', () => {
  const doc = buildStageDoc({ code: '', token: 't', costumes: [[{ id: 'c1', name: '</script><img src=x onerror=alert(1)>', src: 'emoji:x' }]] });
  assert.equal((doc.match(/<\/script>/g) || []).length, 4);
});

test('the stage waits when asked not to start, runs a stack the page sends, and stops on request', async () => {
  const { JSDOM } = await import('jsdom');
  const token = 'tk';
  const dom = new JSDOM(buildStageDoc({ code: "S.on('flag', async function () { S.move(500); });", token, autostart: false }), { runScripts: 'dangerously', pretendToBeVisual: true, beforeParse(w) { w.HTMLCanvasElement.prototype.getContext = () => null; } });
  windows.push(dom.window);
  await sleep(30);
  const S = dom.window.S;
  assert.equal(Math.round(S.state().x), 0); // the flag program did not start by itself
  const send = (data, source = dom.window) => dom.window.dispatchEvent(new dom.window.MessageEvent('message', { data, source }));
  send({ __akili: token, type: 'run', code: '(async function (S) { S.move(30); })(S.forSprite(0));' });
  await sleep(30);
  assert.equal(Math.round(S.state().x), 30);
  // a wrong token, or a sender that is not the page, is ignored
  send({ __akili: 'other', type: 'run', code: 'S.move(99)' });
  send({ __akili: token, type: 'run', code: 'S.move(99)' }, {});
  await sleep(30);
  assert.equal(Math.round(S.state().x), 30);
  send({ __akili: token, type: 'stop' });
  assert.equal(S.running, false);
  send({ __akili: token, type: 'run', code: '(async function (S) { S.move(5); })(S.forSprite(0));' }); // clicking a block after Stop works again
  await sleep(30);
  assert.equal(S.running, true);
  assert.equal(Math.round(S.state().x), 35);
});

test('sound effects: known names report their length, unknown names are silent, and no audio support is not an error', async () => {
  const { S } = await stage('');
  assert.ok(S.startSound('pop') > 0);
  assert.ok(S.startSound('meow') > 0);
  assert.equal(S.startSound('not-a-sound'), 0);
  await S.playSound('not-a-sound'); // resolves straight away
  assert.equal(S.audioState(), 'none'); // jsdom has no audio: nothing crashed
});

test('clones: a clone runs the "when I start as a clone" script on itself, the original is untouched, and a clone can delete itself', async () => {
  const code = `
    (function (S) {
      S.on('flag', async function (S) { S.createClone('_myself_'); S.createClone('_myself_'); });
      S.on('clone', async function (S) { S.changeY(50); await S.wait(0.05); S.deleteClone(); });
    })(S.forSprite(0));`;
  const { S } = await stage(code, { wait: 30 });
  assert.equal(S.cloneCount(), 2);
  assert.equal(Math.round(S.state().y), 0); // the original did not move
  await sleep(150);
  assert.equal(S.cloneCount(), 0); // both clones deleted themselves
});

test('clones are capped, and touching a sprite also counts its clones', async () => {
  const code = `
    (function (S) { S.on('flag', async function (S) { S.goTo(0, 0); }); })(S.forSprite(0));
    (function (S) { S.on('flag', async function (S) { S.goTo(200, 0); S.createClone('_myself_'); S.touchedOnce = true; }); })(S.forSprite(1));`;
  const { S } = await stage(code, { wait: 40 });
  assert.equal(S.cloneCount(), 1);
  const many = await stage("S.on('flag', async function (S) { for (var i = 0; i < 500; i++) S.createClone('_myself_'); });", { wait: 60 });
  assert.equal(many.S.cloneCount(), 100); // never more than 100
});

test('messages: broadcast reaches every sprite, and "and wait" really waits for the receivers', async () => {
  const code = `
    (function (S) { S.on('msg:go', async function (S) { await S.wait(0.06); S.setX(40); }); })(S.forSprite(0));
    (function (S) { S.on('msg:go', async function (S) { S.setX(-40); }); })(S.forSprite(1));
    (function (S) { S.on('flag', async function (S) { await S.broadcastAndWait('go'); S.say('done'); }); })(S.forSprite(2));`;
  const { S } = await stage(code, { wait: 20 });
  assert.equal(S.states()[2].bubble, null); // still waiting for the slow receiver
  await sleep(140);
  const all = S.states();
  assert.equal(Math.round(all[0].x), 40);
  assert.equal(Math.round(all[1].x), -40);
  assert.equal(all[2].bubble, 'done');
});

test('motion: glide arrives, point towards a sprite works, go to a sprite and distance agree', async () => {
  const code = `
    (function (S) { S.on('flag', async function (S) { await S.glide(0.05, 100, 50); }); })(S.forSprite(0));
    (function (S) { S.on('flag', async function (S) { S.goTo(-100, -50); S.pointTowards(0); }); })(S.forSprite(1));`;
  const { S } = await stage(code, { wait: 160 });
  const [a, b] = S.states();
  assert.equal(Math.round(a.x), 100);
  assert.equal(Math.round(a.y), 50);
  assert.equal(Math.round(b.dir), 63); // from (-100,-50) up and to the right: 90 - atan2(100, 200)
  assert.equal(S.forSprite(1).distanceTo(0), 224);
  S.forSprite(1).goToTarget(0);
  assert.equal(Math.round(S.forSprite(1).x()), 100);
});

test('looks: think is dashed, effects are limited to known ones, layers reorder, rotation style, size and costume reports', async () => {
  const { S } = await stage('', { wait: 20 });
  S.think('hmm');
  assert.equal(S.state().bubbleType, 'think');
  S.say('hi');
  assert.equal(S.state().bubbleType, 'say');
  S.setEffect('ghost', 30); S.changeEffect('ghost', 20); S.setEffect('nonsense', 5);
  const fx = S.state().fx;
  assert.equal(fx.ghost, 50);
  assert.equal(fx.nonsense, undefined);
  S.clearEffects();
  assert.equal(S.state().fx.ghost, 0);
  S.setRotation('lr'); assert.equal(S.state().rot, 'lr');
  S.setRotation('bogus'); assert.equal(S.state().rot, 'all');
  S.setSize(150); assert.equal(S.size(), 150);
  assert.equal(S.costumeNumber(), 1);
  S.background('#bfe3ff');
  assert.equal(S.backdropNumber(), 2);
  S.nextBackdrop();
  assert.equal(S.backdropNumber(), 3);
});

test('sound: volume stays between 0 and 100 and sounds can be stopped', async () => {
  const { S } = await stage('', { wait: 20 });
  S.setVolume(250); assert.equal(S.volume(), 100);
  S.changeVolume(-130); assert.equal(S.volume(), 0);
  S.setVolume(40); assert.equal(S.volumeLevel(), 40);
  S.stopSounds(); // nothing playing: must not fail
});

test('sensing: key pressed (including any key), timer, clock and "x of sprite"', async () => {
  const { S, window } = await stage('', { wait: 20 });
  assert.equal(S.keyDown('any'), false);
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a' }));
  assert.equal(S.keyDown('a'), true);
  assert.equal(S.keyDown('any'), true);
  window.dispatchEvent(new window.KeyboardEvent('keyup', { key: 'a' }));
  assert.equal(S.keyDown('any'), false);
  await sleep(120);
  assert.ok(S.timer() >= 0.1);
  S.resetTimer();
  assert.ok(S.timer() < 0.1);
  assert.equal(S.current('year'), new Date().getFullYear());
  assert.ok(S.daysSince2000() > 9000);
  assert.equal(S.attrOf(0, 'costumename'), '🐱');
  assert.equal(S.attrOf(7, 'x'), 0); // no such sprite
});

test('ask and wait: the answer box appears, typing in it is not game input, and the answer is kept', async () => {
  const { S, window } = await stage("S.on('key:a', async function () { S.say('pressed'); });", { wait: 20 });
  const asked = S.ask('Name?');
  await sleep(20);
  const input = window.document.querySelector('#ask input');
  assert.ok(input);
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true })); // typed into the box
  await sleep(20);
  assert.equal(S.state().bubble, null); // the "when a key pressed" script did not fire
  input.value = 'Amara';
  window.document.querySelector('#ask button').click();
  await asked;
  assert.equal(S.answer(), 'Amara');
  assert.equal(window.document.querySelector('#ask'), null);
});
