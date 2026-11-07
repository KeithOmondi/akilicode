import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { guardLoops, buildPreviewDoc, readBridgeMessage, PREVIEW_CSP, LOOP_LIMIT } from '../src/lib/sandbox.ts';

test('the page blocks all network and outside files, and only allows inline code', () => {
  const doc = buildPreviewDoc({ html: '<p>hi</p>', css: 'p{color:red}', js: 'console.log(1)', token: 't1' });
  assert.ok(doc.includes('Content-Security-Policy'));
  assert.match(PREVIEW_CSP, /default-src 'none'/);
  assert.doesNotMatch(PREVIEW_CSP, /connect-src|https?:|\*/);
  assert.ok(doc.includes('<p>hi</p>'));
  assert.ok(doc.includes('p{color:red}'));
});

test('child code cannot break out of its script or style tag', () => {
  const doc = buildPreviewDoc({ html: '', css: 'a{}</style><script>alert(1)</script>', js: 'var s = "</script><img src=x onerror=alert(1)>"', token: 't' });
  const dom = new JSDOM(doc).window.document;
  assert.equal(dom.querySelectorAll('script').length, 2, 'only our bridge and the child script exist');
  assert.equal(dom.querySelectorAll('img').length, 0);
  assert.equal(dom.querySelectorAll('style').length, 1);
});

test('loop guard stops a runaway while(true) loop instead of freezing', () => {
  const code = guardLoops('var n = 0; while (true) { n++; }');
  let counter = 0;
  const sandbox = {
    __akiliLoop: () => ++counter > LOOP_LIMIT,
  };
  assert.throws(() => vm.runInNewContext(code, sandbox, { timeout: 5000 }), /too many times/);
  assert.ok(counter > LOOP_LIMIT);
});

test('loop guard leaves normal loops working, including nested ones with brackets in the header', () => {
  const code = guardLoops('var t = 0; for (var i = 0; i < arr.length; i++) { for (var j = 0; j < (fn(2)); j++) { t++; } } do { t++; } while (t < 3);');
  const sandbox = { __akiliLoop: () => false, arr: [1, 2, 3], fn: (x) => x, t: 0 };
  vm.runInNewContext(code, sandbox);
  assert.equal(sandbox.t, 7); // 6 from the nested for loops + 1 from the do/while
});

test('guarding keeps line numbers unchanged (insertion happens on the same line)', () => {
  const src = 'var a = 1;\nwhile (a < 3) {\n  a++;\n}\nconsole.log(a);';
  assert.equal(guardLoops(src).split('\n').length, src.split('\n').length);
});

test('only messages carrying this run\'s token are believed', () => {
  assert.equal(readBridgeMessage({ __akili: 'other', type: 'log', text: 'x' }, 'mine'), null);
  assert.equal(readBridgeMessage('hello', 'mine'), null);
  assert.equal(readBridgeMessage({ __akili: 'mine', type: 'bad', text: 'x' }, 'mine'), null);
  assert.deepEqual(readBridgeMessage({ __akili: 'mine', type: 'error', text: 'oops', line: 3 }, 'mine'), { type: 'error', text: 'oops', line: 3 });
});

test('the reported line number matches the child\'s own code', () => {
  const token = 'tok';
  const doc = buildPreviewDoc({ html: '<div></div>\n<div></div>', css: 'a{}\nb{}', js: 'line1();\nline2();', token });
  const lines = doc.split('\n');
  const at = lines.findIndex((l) => l.includes('line1();')) + 1; // 1-based line of the child's first line in the document
  const m = doc.match(/OFFSET = (\d+)/);
  assert.equal(at - Number(m[1]), 1);
});
