/**
 * The stage: a small engine that runs a child's blocks. It is shown in the SAME kind of locked-down iframe as the
 * web previews (see lib/sandbox.ts): no cookies, no storage, no network, no access to our site.
 * The code it runs is generated from our own fixed set of blocks, so a child cannot type arbitrary JavaScript here.
 *
 * Conventions (same as Scratch): the stage is 480 x 360, (0,0) is the middle, y grows UPWARDS,
 * direction 90 = right, 0 = up, 180 = down, 270 = left, and turning right is clockwise.
 */
import { PREVIEW_CSP } from "../sandbox.ts";

export const STAGE_WIDTH = 480;
export const STAGE_HEIGHT = 360;

/** Written as plain JavaScript text: it runs inside the iframe. No backticks and no template placeholders in here. */
export const RUNTIME_SOURCE = String.raw`
(function () {
  var W = 480, H = 360, EDGE = 20;
  var TOKEN = __TOKEN__;
  var canvas = document.getElementById('stage');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;

  function send(type, text) {
    try { parent.postMessage({ __akili: TOKEN, type: type, text: String(text).slice(0, 500), line: null }, '*'); } catch (e) {}
  }

  var sprite = { x: 0, y: 0, dir: 90, size: 100, visible: true, costume: '🐱', bubble: null, bg: '#ffffff' };
  var handlers = { flag: [], click: [], keys: {} };
  var keys = {};
  var audio = null;
  var started = false;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }
  function norm(d) { return ((d % 360) + 360) % 360; }
  var halfW = W / 2 - EDGE, halfH = H / 2 - EDGE;
  function inside() { sprite.x = clamp(sprite.x, -W / 2, W / 2); sprite.y = clamp(sprite.y, -H / 2, H / 2); }
  var NEVER = new Promise(function () {});

  var S = {
    running: true,

    // -- events
    on: function (ev, fn) {
      if (ev === 'flag') handlers.flag.push(fn);
      else if (ev === 'click') handlers.click.push(fn);
      else if (ev.indexOf('key:') === 0) { var k = ev.slice(4); (handlers.keys[k] = handlers.keys[k] || []).push(fn); }
    },
    start: function () {
      if (started) return;
      started = true;
      handlers.flag.forEach(function (fn) { run(fn); });
    },
    stop: function () { S.running = false; },

    // -- motion
    move: function (n) {
      var rad = (90 - sprite.dir) * Math.PI / 180;
      sprite.x += num(n) * Math.cos(rad);
      sprite.y += num(n) * Math.sin(rad);
      inside();
    },
    turn: function (d) { sprite.dir = norm(sprite.dir + num(d)); },
    pointDir: function (d) { sprite.dir = norm(num(d)); },
    goTo: function (x, y) { sprite.x = num(x); sprite.y = num(y); inside(); },
    setX: function (x) { sprite.x = num(x); inside(); },
    setY: function (y) { sprite.y = num(y); inside(); },
    changeX: function (d) { sprite.x += num(d); inside(); },
    changeY: function (d) { sprite.y += num(d); inside(); },
    bounce: function () {
      if (sprite.x > halfW) { sprite.x = halfW; sprite.dir = norm(360 - sprite.dir); }
      else if (sprite.x < -halfW) { sprite.x = -halfW; sprite.dir = norm(360 - sprite.dir); }
      if (sprite.y > halfH) { sprite.y = halfH; sprite.dir = norm(180 - sprite.dir); }
      else if (sprite.y < -halfH) { sprite.y = -halfH; sprite.dir = norm(180 - sprite.dir); }
    },

    // -- looks
    say: function (m) { sprite.bubble = (m === undefined || m === null || m === '') ? null : String(m); },
    sayFor: function (m, secs) {
      var text = (m === undefined || m === null) ? '' : String(m);
      sprite.bubble = text || null;
      return S.wait(secs).then(function () { if (sprite.bubble === (text || null)) sprite.bubble = null; });
    },
    setSize: function (p) { sprite.size = clamp(num(p), 10, 500); },
    changeSize: function (d) { sprite.size = clamp(sprite.size + num(d), 10, 500); },
    show: function () { sprite.visible = true; },
    hide: function () { sprite.visible = false; },
    costume: function (c) { sprite.costume = String(c); },
    background: function (c) { sprite.bg = String(c); },

    // -- sound
    note: function (freq, beats) {
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          audio = audio || new AC();
          if (audio.resume) audio.resume();
          var osc = audio.createOscillator(), gain = audio.createGain(), secs = Math.max(0.05, num(beats) * 0.4);
          osc.frequency.value = num(freq) || 261.63;
          gain.gain.value = 0.15;
          osc.connect(gain); gain.connect(audio.destination);
          osc.start(); osc.stop(audio.currentTime + secs);
        }
      } catch (e) {}
      return S.wait(num(beats) * 0.4);
    },

    // -- control
    wait: function (secs) {
      return new Promise(function (resolve) {
        setTimeout(function () { if (S.running) resolve(); }, Math.max(0, num(secs)) * 1000);
      });
    },
    // One frame. A loop awaits this every time round, so loops animate and can never freeze the page.
    tick: function () {
      if (!S.running) return NEVER;
      return new Promise(function (resolve) {
        requestAnimationFrame(function () { if (S.running) resolve(); });
      });
    },

    // -- sensing and maths
    touchingEdge: function () { return Math.abs(sprite.x) >= halfW || Math.abs(sprite.y) >= halfH; },
    keyDown: function (k) { return !!keys[k]; },
    x: function () { return Math.round(sprite.x); },
    y: function () { return Math.round(sprite.y); },
    direction: function () { return Math.round(sprite.dir); },
    state: function () { return JSON.parse(JSON.stringify(sprite)); }
  };
  window.S = S;

  function run(fn) {
    Promise.resolve().then(fn).catch(function (e) {
      send('error', 'Something went wrong in your blocks: ' + (e && e.message ? e.message : e));
    });
  }

  // -- keyboard and mouse
  var KEYMAP = { ' ': 'space', ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'enter' };
  function keyName(e) { return KEYMAP[e.key] || String(e.key).toLowerCase(); }
  window.addEventListener('keydown', function (e) {
    var k = keyName(e);
    if (k === 'space' || k === 'up' || k === 'down' || k === 'left' || k === 'right') e.preventDefault();
    keys[k] = true;
    (handlers.keys[k] || []).forEach(function (fn) { run(fn); });
  });
  window.addEventListener('keyup', function (e) { keys[keyName(e)] = false; });
  window.addEventListener('blur', function () { keys = {}; });
  if (canvas) {
    canvas.addEventListener('mousedown', function (e) {
      canvas.focus();
      var r = canvas.getBoundingClientRect();
      var scale = Math.min(r.width / W, r.height / H) || 1;
      var offX = (r.width - W * scale) / 2, offY = (r.height - H * scale) / 2;
      var sx = (e.clientX - r.left - offX) / scale - W / 2, sy = H / 2 - (e.clientY - r.top - offY) / scale;
      var reach = 32 * sprite.size / 100;
      if (sprite.visible && Math.abs(sx - sprite.x) <= reach && Math.abs(sy - sprite.y) <= reach) {
        handlers.click.forEach(function (fn) { run(fn); });
      }
    });
  }

  // -- drawing
  function bubbleBox(text, cx, top) {
    ctx.font = 'bold 16px sans-serif';
    var w = Math.min(300, ctx.measureText(text).width + 24), h = 34;
    var x = clamp(cx - w / 2, 4, W - w - 4), y = clamp(top - h - 8, 4, H - h - 4);
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#555555'; ctx.lineWidth = 2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 14); else ctx.rect(x, y, w, h);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#222222'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2, w - 16);
  }
  function draw() {
    if (ctx) {
      ctx.fillStyle = sprite.bg; ctx.fillRect(0, 0, W, H);
      if (sprite.visible) {
        var px = W / 2 + sprite.x, py = H / 2 - sprite.y, px2 = 64 * sprite.size / 100;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate((sprite.dir - 90) * Math.PI / 180);
        ctx.font = px2 + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(sprite.costume, 0, 0);
        ctx.restore();
        if (sprite.bubble) bubbleBox(sprite.bubble, px, py - px2 / 2);
      }
    }
    requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('error', function (e) { send('error', e.message || 'Something went wrong'); });
  window.addEventListener('unhandledrejection', function (e) { send('error', (e.reason && e.reason.message) || String(e.reason)); });
})();
`;

const escapeScript = (code: string) => code.replace(/<\/script/gi, "<\\/script");

export interface StageParts {
  /** The JavaScript generated from the blocks. */
  code: string;
  /** Random per run: the parent ignores messages that do not carry it. */
  token: string;
}

/** The complete document for the stage iframe's srcdoc. */
export const buildStageDoc = ({ code, token }: StageParts): string =>
  '<!doctype html><html><head><meta charset="utf-8">' +
  `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">` +
  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
  "<style>html,body{margin:0;height:100%;overflow:hidden;background:#fff}canvas{display:block;width:100%;height:100%;outline:none}</style>" +
  '</head><body><canvas id="stage" width="480" height="360" tabindex="0" aria-label="Stage"></canvas>' +
  `<script>${RUNTIME_SOURCE.replace("__TOKEN__", () => JSON.stringify(token))}</script>` +
  `<script>${escapeScript(code)}</script>` +
  "<script>if (window.S) window.S.start();</script></body></html>";
