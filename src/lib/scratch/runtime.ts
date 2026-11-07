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

  // One entry per sprite. Sprite 0 always exists (the cat); more are created by S.forSprite(i, costume).
  var sprites = [];
  var shared = { running: true, bg: '#ffffff' };
  var START_X = [0, -140, 140, -70, 70, -190, 190];
  // Costumes come from the page (window.__COSTUMES__[spriteNumber] = [{ id, name, src }]). A src is either
  // "emoji:<x>" (drawn as text) or a data: picture. Nothing is ever loaded from the network.
  var defs = window.__COSTUMES__ || [];
  function loadImages(list) {
    return list.map(function (c) {
      if (String(c.src).indexOf('data:') !== 0) return null;
      var im = new Image();
      im.src = c.src;
      return im;
    });
  }
  function newSprite(i, emoji) {
    var list = (defs[i] && defs[i].length) ? defs[i] : [{ id: 'c1', name: 'cat', src: 'emoji:' + (emoji || '🐱') }];
    var first = 0;
    list.forEach(function (c, k) { if (c.current) first = k; });
    return { x: START_X[i % START_X.length], y: 0, dir: 90, size: 100, visible: true, costumes: list, ci: first, imgs: loadImages(list), bubble: null, click: [] };
  }
  function costumeName(sp) {
    var c = sp.costumes[sp.ci] || { name: '', src: '' };
    return String(c.src).indexOf('emoji:') === 0 ? String(c.src).slice(6) : c.name;
  }
  function publicState(sp) {
    var c = JSON.parse(JSON.stringify(sp, function (k, v) { return (k === 'click' || k === 'imgs' || k === 'costumes') ? undefined : v; }));
    c.costume = costumeName(sp);
    return c;
  }
  sprites.push(newSprite(0, '🐱'));
  var handlers = { flag: [], keys: {} };
  var keys = {};
  var audio = null;
  var started = false;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }
  function norm(d) { return ((d % 360) + 360) % 360; }
  var halfW = W / 2 - EDGE, halfH = H / 2 - EDGE;
  var NEVER = new Promise(function () {});

  // The commands one sprite understands. Every sprite gets its own set, tied to its own position and costume.
  function makeApi(sprite) {
    function inside() { sprite.x = clamp(sprite.x, -W / 2, W / 2); sprite.y = clamp(sprite.y, -H / 2, H / 2); }
    var api = {
      // -- events
      on: function (ev, fn) {
        if (ev === 'flag') handlers.flag.push(fn);
        else if (ev === 'click') sprite.click.push(fn);
        else if (ev.indexOf('key:') === 0) { var k = ev.slice(4); (handlers.keys[k] = handlers.keys[k] || []).push(fn); }
      },
      start: function () {
        if (started) return;
        started = true;
        handlers.flag.forEach(function (fn) { run(fn); });
      },
      stop: function () { shared.running = false; },
      forSprite: function (i, emoji) {
        while (sprites.length <= i) sprites.push(newSprite(sprites.length));
        if (emoji && !(defs[i] && defs[i].length)) {
          sprites[i].costumes = [{ id: 'c1', name: 'costume', src: 'emoji:' + String(emoji) }];
          sprites[i].imgs = [null];
          sprites[i].ci = 0;
        }
        return makeApi(sprites[i]);
      },

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
        return api.wait(secs).then(function () { if (sprite.bubble === (text || null)) sprite.bubble = null; });
      },
      setSize: function (p) { sprite.size = clamp(num(p), 10, 500); },
      changeSize: function (d) { sprite.size = clamp(sprite.size + num(d), 10, 500); },
      show: function () { sprite.visible = true; },
      hide: function () { sprite.visible = false; },
      // by costume id or name; an emoji that is not one of the sprite's costumes (old projects) is drawn as text
      costume: function (c) {
        c = String(c);
        for (var k = 0; k < sprite.costumes.length; k++) {
          if (sprite.costumes[k].id === c || sprite.costumes[k].name === c) { sprite.ci = k; return; }
        }
        sprite.costumes.push({ id: 'x' + sprite.costumes.length, name: c, src: 'emoji:' + c });
        sprite.imgs.push(null);
        sprite.ci = sprite.costumes.length - 1;
      },
      nextCostume: function () { sprite.ci = (sprite.ci + 1) % sprite.costumes.length; },
      background: function (c) { shared.bg = String(c); },

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
        return api.wait(num(beats) * 0.4);
      },

      // -- control
      wait: function (secs) {
        return new Promise(function (resolve) {
          setTimeout(function () { if (shared.running) resolve(); }, Math.max(0, num(secs)) * 1000);
        });
      },
      // One frame. A loop awaits this every time round, so loops animate and can never freeze the page.
      tick: function () {
        if (!shared.running) return NEVER;
        return new Promise(function (resolve) {
          requestAnimationFrame(function () { if (shared.running) resolve(); });
        });
      },

      // -- sensing and maths
      touchingEdge: function () { return Math.abs(sprite.x) >= halfW || Math.abs(sprite.y) >= halfH; },
      touching: function (i) {
        var other = sprites[i];
        if (!other || other === sprite || !other.visible || !sprite.visible) return false;
        var reach = 40 * (sprite.size + other.size) / 100;
        return Math.abs(sprite.x - other.x) <= reach && Math.abs(sprite.y - other.y) <= reach;
      },
      keyDown: function (k) { return !!keys[k]; },
      x: function () { return Math.round(sprite.x); },
      y: function () { return Math.round(sprite.y); },
      direction: function () { return Math.round(sprite.dir); },
      state: function () { var s = publicState(sprite); s.bg = shared.bg; return s; }
    };
    Object.defineProperty(api, 'running', { get: function () { return shared.running; } });
    return api;
  }

  var S = makeApi(sprites[0]);
  S.states = function () { return sprites.map(publicState); };
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
      // the sprite in front (drawn last) that was hit gets the click
      for (var i = sprites.length - 1; i >= 0; i--) {
        var sp = sprites[i], reach = 40 * sp.size / 100;
        if (sp.visible && Math.abs(sx - sp.x) <= reach && Math.abs(sy - sp.y) <= reach) {
          sp.click.forEach(function (fn) { run(fn); });
          break;
        }
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
      ctx.fillStyle = shared.bg; ctx.fillRect(0, 0, W, H);
      sprites.forEach(function (sprite) {
        if (!sprite.visible) return;
        var px = W / 2 + sprite.x, py = H / 2 - sprite.y, px2 = 64 * sprite.size / 100;
        var cos = sprite.costumes[sprite.ci], img = sprite.imgs[sprite.ci];
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate((sprite.dir - 90) * Math.PI / 180);
        if (img) {
          // a picture: fitted into a square, keeping its shape
          if (img.complete && img.naturalWidth) {
            var box = 80 * sprite.size / 100, k = Math.min(box / img.naturalWidth, box / img.naturalHeight);
            ctx.drawImage(img, -img.naturalWidth * k / 2, -img.naturalHeight * k / 2, img.naturalWidth * k, img.naturalHeight * k);
          }
        } else if (cos) {
          ctx.font = px2 + 'px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(costumeName(sprite), 0, 0);
        }
        ctx.restore();
        if (sprite.bubble) bubbleBox(sprite.bubble, px, py - px2 / 2);
      });
    }
    requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('error', function (e) { send('error', e.message || 'Something went wrong'); });
  window.addEventListener('unhandledrejection', function (e) { send('error', (e.reason && e.reason.message) || String(e.reason)); });
})();
`;

const escapeScript = (code: string) => code.replace(/<\/script/gi, "<\\/script");

export interface StageCostume { id: string; name: string; src: string; /** the costume the sprite starts with */ current?: boolean }
export interface StageParts {
  /** The JavaScript generated from the blocks. */
  code: string;
  /** Random per run: the parent ignores messages that do not carry it. */
  token: string;
  /** The costumes of every sprite, in sprite order; each picture is already a data: address. */
  costumes?: StageCostume[][];
}

/** The complete document for the stage iframe's srcdoc. */
export const buildStageDoc = ({ code, token, costumes = [] }: StageParts): string =>
  '<!doctype html><html><head><meta charset="utf-8">' +
  `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">` +
  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
  "<style>html,body{margin:0;height:100%;overflow:hidden;background:#fff}canvas{display:block;width:100%;height:100%;outline:none}</style>" +
  '</head><body><canvas id="stage" width="480" height="360" tabindex="0" aria-label="Stage"></canvas>' +
  `<script>window.__COSTUMES__ = ${JSON.stringify(costumes).replace(/</g, "\\u003c")};</script>` +
  `<script>${RUNTIME_SOURCE.replace("__TOKEN__", () => JSON.stringify(token))}</script>` +
  `<script>${escapeScript(code)}</script>` +
  "<script>if (window.S) window.S.start();</script></body></html>";
