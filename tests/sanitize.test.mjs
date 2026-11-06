// Run: node --test tests/*.test.mjs   (Node 22.18+ can import .ts files directly)
import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>');
globalThis.window = dom.window;
globalThis.document = dom.window.document;
const { sanitizeHtml } = await import('../src/lib/sanitize.ts');

test('scripts, event handlers and javascript: links are removed', () => {
  const dirty = `<p onclick="alert(1)">Hi</p><script>alert(2)</script><img src=x onerror="alert(3)">
    <a href="javascript:alert(4)">bad</a><iframe src="https://evil.example"></iframe><svg onload="alert(5)"></svg>
    <form action="https://evil.example"><input name="pw"></form><style>body{display:none}</style>`;
  const clean = sanitizeHtml(dirty);
  for (const bad of ['<script', 'onclick', 'onerror', 'onload', 'javascript:', '<iframe', '<svg', '<form', '<input', '<style']) {
    assert.equal(clean.toLowerCase().includes(bad), false, `still contains ${bad}: ${clean}`);
  }
  assert.ok(clean.includes('Hi'));
});

test('normal lesson content survives', () => {
  const ok = '<h2>Loops</h2><p>Use <code>for</code> loops.</p><ul><li>one</li></ul><pre class="x"><code>print(1)</code></pre><a href="https://example.org/x">link</a><img src="https://example.org/a.png" alt="a">';
  const clean = sanitizeHtml(ok);
  for (const keep of ['<h2>Loops</h2>', '<code>for</code>', '<li>one</li>', 'print(1)', 'alt="a"']) assert.ok(clean.includes(keep), `lost ${keep}: ${clean}`);
});

test('outside links open safely in a new tab', () => {
  const clean = sanitizeHtml('<a href="https://example.org">x</a>');
  assert.match(clean, /rel="noopener noreferrer nofollow"/);
  assert.match(clean, /target="_blank"/);
});

test('data: and vbscript: URLs are refused; null/undefined are fine', () => {
  assert.equal(sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">x</a>').includes('data:'), false);
  assert.equal(sanitizeHtml(null), '');
  assert.equal(sanitizeHtml(undefined), '');
});
