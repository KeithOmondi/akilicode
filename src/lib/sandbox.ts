/**
 * Builds the page that runs a child's HTML + CSS + JavaScript, and reads what it says back.
 *
 * Safety model (every layer is independent):
 *  1. The page is shown in an <iframe sandbox="allow-scripts allow-modals"> WITHOUT allow-same-origin.
 *     The code therefore runs on an opaque origin: it cannot read our cookies, localStorage, tokens or the
 *     parent page, and it cannot navigate the top window, open pop-ups or submit forms.
 *  2. A Content-Security-Policy inside the page blocks every network request and every outside file
 *     (no fetch, no remote images, no tracking pixels, no external scripts). Only data: and blob: are allowed.
 *  3. A loop guard stops runaway loops so one typo (while (true) {}) does not freeze the tab.
 */

/** A fresh id for every Run, so old messages and old iframes can never be mistaken for the new one. */
export const newRunId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `run-${Date.now().toString(36)}-${(performance.now() * 1000).toFixed(0)}`;

export const LOOP_LIMIT = 300000;

/** Content-Security-Policy for the child's page. */
export const PREVIEW_CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  'img-src data: blob:',
  'media-src data: blob:',
  'font-src data:',
].join('; ');

/**
 * Adds a check at the start of every `for`, `while` and `do` block.
 * It counts iterations that happen in one go (the counter resets between timer ticks), so a game loop that
 * runs for minutes is fine, but 300,000 iterations without a pause throws a friendly error.
 * Loops written without braces cannot be guarded this way and are left alone.
 */
export const guardLoops = (js: string): string => {
  const check = ' if (__akiliLoop()) { throw new Error("This loop ran too many times. Check that it can stop."); } ';
  return js
    .replace(/\b(for|while)\s*\(((?:[^()]|\((?:[^()]|\([^()]*\))*\))*)\)\s*\{/g, (m) => m + check)
    .replace(/\bdo\s*\{/g, (m) => m + check);
};

const escapeForTag = (code: string, tag: 'script' | 'style') =>
  code.replace(new RegExp(`</${tag}`, 'gi'), `<\\/${tag}`);

const bridge = (token: string, lineOffset: number) => `
(function () {
  var T = ${JSON.stringify(token)}, OFFSET = ${lineOffset}, count = 0;
  function send(type, text, line) {
    try { parent.postMessage({ __akili: T, type: type, text: String(text).slice(0, 2000), line: line || null }, '*'); } catch (e) {}
  }
  window.__akiliLoop = function () {
    if (count === 0) { setTimeout(function () { count = 0; }, 0); }
    return ++count > ${LOOP_LIMIT};
  };
  ['log', 'info', 'warn', 'error'].forEach(function (k) {
    var original = console[k];
    console[k] = function () {
      var parts = Array.prototype.map.call(arguments, function (a) {
        try { return typeof a === 'object' ? JSON.stringify(a) : String(a); } catch (e) { return String(a); }
      });
      send(k === 'info' ? 'log' : k, parts.join(' '));
      if (original) { try { original.apply(console, arguments); } catch (e) {} }
    };
  });
  window.addEventListener('error', function (e) {
    var line = e.lineno ? Math.max(1, e.lineno - OFFSET) : null;
    send('error', e.message || 'Something went wrong', line);
  });
  // Links. A page with menu links such as <a href="#about"> must scroll to that part of the page. Left alone, the
  // browser would try to load OUR editor page inside the preview. Links that leave the page cannot work (the page is
  // sealed off from the internet), so explain that instead of showing a broken screen.
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (!a) return;
    var href = a.getAttribute('href');
    if (href === null) return;
    e.preventDefault();
    if (href.charAt(0) === '#') {
      var id = href.slice(1);
      try { id = decodeURIComponent(id); } catch (err) {}
      var target = id ? (document.getElementById(id) || document.getElementsByName(id)[0]) : document.body;
      if (target && target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else if (!id) window.scrollTo(0, 0);
      else send('warn', 'There is nothing with id="' + id + '" on your page, so the link has nowhere to go.');
    } else if (href && href.indexOf('javascript:') !== 0) {
      send('warn', 'Links to other pages and websites do not open inside the editor. To make a menu, link to parts of your own page, like href="#about".');
    }
  }, true);

  // Files cannot be loaded here: the HTML, CSS and JavaScript all live in the three tabs.
  document.addEventListener('DOMContentLoaded', function () {
    var css = document.querySelectorAll('link[rel~="stylesheet"][href]');
    var js = document.querySelectorAll('script[src]');
    if (css.length) send('warn', 'Your page asks for a CSS file (' + css[0].getAttribute('href') + '). Here, put your CSS in the CSS tab instead, it is added for you.');
    if (js.length) send('warn', 'Your page asks for a JavaScript file (' + js[0].getAttribute('src') + '). Here, put your JavaScript in the JavaScript tab instead.');
  });

  window.addEventListener('unhandledrejection', function (e) {
    send('error', (e.reason && e.reason.message) || String(e.reason));
  });
})();`;

export interface PreviewParts {
  html: string;
  css: string;
  js: string;
  /** Random per run. The parent ignores messages that do not carry it. */
  token: string;
}

/** The complete document for the iframe's srcdoc. */
export const buildPreviewDoc = ({ html, css, js, token }: PreviewParts): string => {
  const head =
    '<!doctype html><html><head><meta charset="utf-8">' +
    `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">` +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    `<style>${escapeForTag(css, 'style')}</style></head><body>`;
  const afterBody = `${html}\n<script>`;
  const guarded = escapeForTag(guardLoops(js), 'script');

  // The child's line 1 must be line 1 of THEIR code, so count the lines that come before it.
  // (The number of lines in the bridge does not depend on the offset value, so one pass is enough.)
  const beforeUser = `${head}${afterBody}${bridge(token, 0)}</script><script>`;
  const offset = beforeUser.split('\n').length - 1;
  return `${head}${afterBody}${bridge(token, offset)}</script><script>${guarded}</script></body></html>`;
};

export interface BridgeMessage {
  type: 'log' | 'warn' | 'error';
  text: string;
  line: number | null;
}

/** Returns the message if (and only if) it came from the preview we started. */
export const readBridgeMessage = (data: unknown, token: string): BridgeMessage | null => {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (d.__akili !== token) return null;
  if (d.type !== 'log' && d.type !== 'warn' && d.type !== 'error') return null;
  return { type: d.type, text: String(d.text ?? ''), line: typeof d.line === 'number' ? d.line : null };
};
