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

  // ---- the world ----
  var sprites = [];   // the sprites of the project, in the order of the sprite list (sprite 0 is the first)
  var clones = [];    // copies made while the program runs
  var zorder = [];    // drawing order, back to front (sprites and clones)
  var shared = { running: true, bg: '#ffffff', volume: 100, mouse: { x: 0, y: 0, down: false }, t0: Date.now(), answer: '' };
  var BACKDROPS = ['#ffffff', '#bfe3ff', '#c8f0b0', '#f5e3b3', '#1c2541', '#ffb38a', '#ffd1e8'];
  var START_X = [0, -140, 140, -70, 70, -190, 190];
  var MAX_CLONES = 100;
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
    return {
      x: START_X[i % START_X.length], y: 0, dir: 90, size: 100, visible: true, costumes: list, ci: first, imgs: loadImages(list),
      bubble: null, bubbleType: 'say', click: [], cloneStart: [], fx: { color: 0, brightness: 0, ghost: 0 }, rot: 'all',
      isClone: false, original: null, deleted: false, api: null
    };
  }
  function costumeName(sp) {
    var c = sp.costumes[sp.ci] || { name: '', src: '' };
    return String(c.src).indexOf('emoji:') === 0 ? String(c.src).slice(6) : c.name;
  }
  var HIDDEN = { click: 1, cloneStart: 1, imgs: 1, costumes: 1, original: 1, api: 1 };
  function publicState(sp) {
    var c = JSON.parse(JSON.stringify(sp, function (k, v) { return HIDDEN[k] ? undefined : v; }));
    c.costume = costumeName(sp);
    return c;
  }
  sprites.push(newSprite(0, '🐱'));
  zorder.push(sprites[0]);
  var handlers = { flag: [], keys: {}, msg: {}, backdrop: {} };
  var keys = {};
  var audio = null;
  var liveSounds = [];
  var started = false;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function num(v) { v = Number(v); return isFinite(v) ? v : 0; }
  function norm(d) { return ((d % 360) + 360) % 360; }
  var halfW = W / 2 - EDGE, halfH = H / 2 - EDGE;
  var NEVER = new Promise(function () {});

  // ---- sound (all made from tones and noise: there are no audio files) ----
  function ctxAudio() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audio = audio || new AC();
      if (audio.resume) audio.resume();
      return audio;
    } catch (e) { return null; }
  }
  function track(node, end) {
    liveSounds.push(node);
    setTimeout(function () { var k = liveSounds.indexOf(node); if (k >= 0) liveSounds.splice(k, 1); }, Math.ceil(end * 1000) + 200);
  }
  function tone(a, type, f0, f1, at, dur, vol) {
    var t = a.currentTime + at, osc = a.createOscillator(), g = a.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    if (f1) osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
    var v = Math.max(0.0001, vol * shared.volume / 100);
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(a.destination);
    osc.start(t); osc.stop(t + dur + 0.03);
    track(osc, at + dur + 0.03);
  }
  function noise(a, at, dur, vol, cutoff) {
    var t = a.currentTime + at, n = Math.max(1, Math.floor(a.sampleRate * dur)), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = a.createBufferSource(), g = a.createGain(), filt = a.createBiquadFilter();
    src.buffer = buf; filt.type = 'highpass'; filt.frequency.value = cutoff || 800;
    var v = Math.max(0.0001, vol * shared.volume / 100);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filt); filt.connect(g); g.connect(a.destination);
    src.start(t);
    track(src, at + dur);
  }
  // name -> [length in seconds, how to play it]
  var SOUNDS = {
    pop:   [0.15, function (a) { tone(a, 'sine', 700, 120, 0, 0.12, 0.35); }],
    boing: [0.45, function (a) { tone(a, 'sine', 180, 520, 0, 0.18, 0.3); tone(a, 'sine', 520, 160, 0.18, 0.25, 0.3); }],
    laser: [0.3,  function (a) { tone(a, 'sawtooth', 1400, 150, 0, 0.28, 0.12); }],
    coin:  [0.35, function (a) { tone(a, 'square', 988, 0, 0, 0.08, 0.12); tone(a, 'square', 1319, 0, 0.08, 0.25, 0.12); }],
    jump:  [0.25, function (a) { tone(a, 'square', 240, 720, 0, 0.2, 0.1); }],
    drum:  [0.3,  function (a) { tone(a, 'sine', 160, 45, 0, 0.25, 0.6); noise(a, 0, 0.06, 0.25, 1500); }],
    clap:  [0.35, function (a) { noise(a, 0, 0.05, 0.4, 1200); noise(a, 0.07, 0.05, 0.4, 1200); noise(a, 0.14, 0.15, 0.4, 1200); }],
    meow:  [0.6,  function (a) { tone(a, 'sawtooth', 520, 900, 0, 0.2, 0.09); tone(a, 'sawtooth', 900, 380, 0.2, 0.4, 0.09); }],
    woof:  [0.4,  function (a) { tone(a, 'sawtooth', 260, 110, 0, 0.14, 0.18); tone(a, 'sawtooth', 280, 100, 0.2, 0.16, 0.18); }],
    bell:  [0.9,  function (a) { tone(a, 'sine', 1320, 0, 0, 0.8, 0.25); tone(a, 'sine', 1980, 0, 0, 0.5, 0.1); }],
    win:   [0.8,  function (a) { [523, 659, 784, 1047].forEach(function (f, i) { tone(a, 'triangle', f, 0, i * 0.15, 0.3, 0.25); }); }],
    lose:  [0.8,  function (a) { [392, 330, 262, 196].forEach(function (f, i) { tone(a, 'triangle', f, 0, i * 0.18, 0.3, 0.25); }); }]
  };

  // ---- running scripts ----
  function run(fn, api) {
    return Promise.resolve().then(function () { return fn(api); }).catch(function (e) {
      send('error', 'Something went wrong in your blocks: ' + (e && e.message ? e.message : e));
    });
  }
  function apiFor(sp) { return sp.api || (sp.api = makeApi(sp)); }
  // a sprite and every clone made from it
  function instances(sp) {
    var list = [sp];
    clones.forEach(function (c) { if (c.original === sp) list.push(c); });
    return list;
  }
  function fire(list) {
    var jobs = [];
    list.forEach(function (h) { instances(h.sprite).forEach(function (inst) { jobs.push(run(h.fn, apiFor(inst))); }); });
    return jobs;
  }
  function removeAsk() { var old = document.getElementById('ask'); if (old && old.parentNode) old.parentNode.removeChild(old); }
  function targetSprite(sp, t) {
    if (t === '_myself_') return sp;
    return typeof t === 'number' ? sprites[t] : null;
  }

  // The commands one sprite (or clone) understands, tied to its own position, costume and so on.
  function makeApi(sprite) {
    function inside() { sprite.x = clamp(sprite.x, -W / 2, W / 2); sprite.y = clamp(sprite.y, -H / 2, H / 2); }
    // where a target is: 'the mouse', or a sprite number
    function where(t) {
      if (t === '_mouse_') return { x: shared.mouse.x, y: shared.mouse.y };
      var o = typeof t === 'number' ? sprites[t] : null;
      return o ? { x: o.x, y: o.y } : null;
    }
    var api = {
      // -- events
      on: function (ev, fn) {
        ev = String(ev);
        if (ev === 'flag') handlers.flag.push({ fn: fn, sprite: sprite });
        else if (ev === 'click') sprite.click.push(fn);
        else if (ev === 'clone') sprite.cloneStart.push(fn);
        else if (ev.indexOf('key:') === 0) { var k = ev.slice(4); (handlers.keys[k] = handlers.keys[k] || []).push({ fn: fn, sprite: sprite }); }
        else if (ev.indexOf('msg:') === 0) { var m = ev.slice(4); (handlers.msg[m] = handlers.msg[m] || []).push({ fn: fn, sprite: sprite }); }
        else if (ev.indexOf('backdrop:') === 0) { var b = ev.slice(9); (handlers.backdrop[b] = handlers.backdrop[b] || []).push({ fn: fn, sprite: sprite }); }
      },
      start: function () {
        if (started) return;
        started = true;
        clones.slice().forEach(function (c) { apiFor(c).deleteClone(); });
        handlers.flag.forEach(function (h) { run(h.fn, apiFor(h.sprite)); });
      },
      stop: function () { shared.running = false; },
      forSprite: function (i, emoji) {
        while (sprites.length <= i) { var made = newSprite(sprites.length); sprites.push(made); zorder.push(made); }
        if (emoji && !(defs[i] && defs[i].length)) {
          sprites[i].costumes = [{ id: 'c1', name: 'costume', src: 'emoji:' + String(emoji) }];
          sprites[i].imgs = [null];
          sprites[i].ci = 0;
        }
        return apiFor(sprites[i]);
      },
      broadcast: function (name) { fire(handlers.msg[String(name)] || []); },
      broadcastAndWait: function (name) { return Promise.all(fire(handlers.msg[String(name)] || [])).then(function () {}); },

      // -- motion
      move: function (n) {
        var rad = (90 - sprite.dir) * Math.PI / 180;
        sprite.x += num(n) * Math.cos(rad);
        sprite.y += num(n) * Math.sin(rad);
        inside();
      },
      turn: function (d) { sprite.dir = norm(sprite.dir + num(d)); },
      pointDir: function (d) { sprite.dir = norm(num(d)); },
      pointTowards: function (t) {
        var p = where(t);
        if (p) sprite.dir = norm(90 - Math.atan2(p.y - sprite.y, p.x - sprite.x) * 180 / Math.PI);
      },
      goTo: function (x, y) { sprite.x = num(x); sprite.y = num(y); inside(); },
      goToTarget: function (t) {
        if (t === '_random_') { sprite.x = (Math.random() * 2 - 1) * halfW; sprite.y = (Math.random() * 2 - 1) * halfH; return; }
        var p = where(t);
        if (p) { sprite.x = p.x; sprite.y = p.y; inside(); }
      },
      glide: function (secs, x, y) {
        var sx = sprite.x, sy = sprite.y, tx = num(x), ty = num(y), t0 = Date.now(), ms = Math.max(1, num(secs) * 1000);
        return new Promise(function (resolve) {
          function step() {
            if (!api.running) return; // stopped: never finishes, like every other wait
            var k = Math.min(1, (Date.now() - t0) / ms);
            sprite.x = sx + (tx - sx) * k; sprite.y = sy + (ty - sy) * k; inside();
            if (k < 1) requestAnimationFrame(step); else resolve();
          }
          step();
        });
      },
      glideToTarget: function (secs, t) {
        if (t === '_random_') return api.glide(secs, (Math.random() * 2 - 1) * halfW, (Math.random() * 2 - 1) * halfH);
        var p = where(t) || { x: sprite.x, y: sprite.y };
        return api.glide(secs, p.x, p.y);
      },
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
      setRotation: function (style) { sprite.rot = (style === 'lr' || style === 'none') ? style : 'all'; },

      // -- looks
      say: function (m) { sprite.bubbleType = 'say'; sprite.bubble = (m === undefined || m === null || m === '') ? null : String(m); },
      sayFor: function (m, secs) {
        var text = (m === undefined || m === null) ? '' : String(m);
        sprite.bubbleType = 'say';
        sprite.bubble = text || null;
        return api.wait(secs).then(function () { if (sprite.bubble === (text || null)) sprite.bubble = null; });
      },
      think: function (m) { sprite.bubbleType = 'think'; sprite.bubble = (m === undefined || m === null || m === '') ? null : String(m); },
      thinkFor: function (m, secs) {
        var text = (m === undefined || m === null) ? '' : String(m);
        sprite.bubbleType = 'think';
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
      costumeNumber: function () { return sprite.ci + 1; },
      costumeName: function () { return costumeName(sprite); },
      size: function () { return Math.round(sprite.size); },
      background: function (c) {
        c = String(c);
        var changed = shared.bg !== c;
        shared.bg = c;
        if (changed) fire(handlers.backdrop[c] || []);
      },
      nextBackdrop: function () {
        var i = BACKDROPS.indexOf(shared.bg);
        api.background(BACKDROPS[(i + 1) % BACKDROPS.length]);
      },
      backdropNumber: function () { var i = BACKDROPS.indexOf(shared.bg); return i < 0 ? 1 : i + 1; },
      setEffect: function (name, v) { if (sprite.fx[name] !== undefined) sprite.fx[name] = num(v); },
      changeEffect: function (name, d) { if (sprite.fx[name] !== undefined) sprite.fx[name] += num(d); },
      clearEffects: function () { sprite.fx = { color: 0, brightness: 0, ghost: 0 }; },
      toFront: function () { var i = zorder.indexOf(sprite); if (i >= 0) { zorder.splice(i, 1); zorder.push(sprite); } },
      back: function (n) { var i = zorder.indexOf(sprite); if (i >= 0) { zorder.splice(i, 1); zorder.splice(Math.max(0, i - Math.round(num(n))), 0, sprite); } },

      // -- sound
      note: function (freq, beats) {
        var a = ctxAudio();
        if (a) { try { tone(a, 'sine', num(freq) || 261.63, 0, 0, Math.max(0.05, num(beats) * 0.4), 0.15); } catch (e) {} }
        return api.wait(num(beats) * 0.4);
      },
      startSound: function (name) {
        var snd = SOUNDS[String(name)], a = ctxAudio();
        if (snd && a) { try { snd[1](a); } catch (e) {} }
        return snd ? snd[0] : 0;
      },
      playSound: function (name) { return api.wait(api.startSound(name)); },
      stopSounds: function () { liveSounds.splice(0).forEach(function (n) { try { n.stop(); } catch (e) {} }); },
      changeVolume: function (d) { shared.volume = clamp(shared.volume + num(d), 0, 100); },
      setVolume: function (v) { shared.volume = clamp(num(v), 0, 100); },
      volume: function () { return Math.round(shared.volume); },

      // -- control
      wait: function (secs) {
        return new Promise(function (resolve) {
          setTimeout(function () { if (api.running) resolve(); }, Math.max(0, num(secs)) * 1000);
        });
      },
      // One frame. A loop awaits this every time round, so loops animate and can never freeze the page.
      tick: function () {
        if (!api.running) return NEVER;
        return new Promise(function (resolve) {
          requestAnimationFrame(function () { if (api.running) resolve(); });
        });
      },
      createClone: function (t) {
        var src = targetSprite(sprite, t);
        if (!src || clones.length >= MAX_CLONES) return;
        var origin = src.original || src;
        var c = {};
        for (var key in src) c[key] = src[key];
        c.isClone = true; c.original = origin; c.deleted = false; c.api = null; c.bubble = null;
        c.fx = { color: src.fx.color, brightness: src.fx.brightness, ghost: src.fx.ghost };
        clones.push(c);
        zorder.push(c);
        origin.cloneStart.forEach(function (fn) { run(fn, apiFor(c)); });
      },
      deleteClone: function () {
        if (!sprite.isClone) return;
        sprite.deleted = true;
        var i = clones.indexOf(sprite); if (i >= 0) clones.splice(i, 1);
        var z = zorder.indexOf(sprite); if (z >= 0) zorder.splice(z, 1);
      },

      // -- sensing
      touchingEdge: function () { return Math.abs(sprite.x) >= halfW || Math.abs(sprite.y) >= halfH; },
      touching: function (t) {
        if (t === '_edge_') return api.touchingEdge();
        if (!sprite.visible) return false;
        if (t === '_mouse_') {
          var rm = 40 * sprite.size / 100;
          return Math.abs(sprite.x - shared.mouse.x) <= rm && Math.abs(sprite.y - shared.mouse.y) <= rm;
        }
        var other = sprites[t];
        if (!other) return false;
        return instances(other).some(function (o) {
          if (o === sprite || !o.visible) return false;
          var reach = 40 * (sprite.size + o.size) / 100;
          return Math.abs(sprite.x - o.x) <= reach && Math.abs(sprite.y - o.y) <= reach;
        });
      },
      distanceTo: function (t) {
        var p = where(t);
        return p ? Math.round(Math.sqrt((sprite.x - p.x) * (sprite.x - p.x) + (sprite.y - p.y) * (sprite.y - p.y))) : 0;
      },
      keyDown: function (k) { return k === 'any' ? Object.keys(keys).some(function (x) { return keys[x]; }) : !!keys[k]; },
      mouseX: function () { return Math.round(shared.mouse.x); },
      mouseY: function () { return Math.round(shared.mouse.y); },
      mouseDown: function () { return !!shared.mouse.down; },
      ask: function (q) {
        return new Promise(function (resolve) {
          removeAsk();
          var box = document.createElement('div');
          box.id = 'ask';
          box.setAttribute('style', 'position:absolute;left:8px;right:8px;bottom:8px;background:#fff;border:2px solid #4c97ff;border-radius:14px;padding:8px;font:bold 14px sans-serif;color:#333;display:flex;flex-direction:column;gap:6px;box-sizing:border-box');
          var label = document.createElement('div');
          label.textContent = String(q === undefined || q === null ? '' : q);
          var row = document.createElement('div');
          row.setAttribute('style', 'display:flex;gap:6px');
          var input = document.createElement('input');
          input.setAttribute('style', 'flex:1;min-width:0;font:16px sans-serif;padding:6px 10px;border:2px solid #c7d8ff;border-radius:10px');
          input.maxLength = 100;
          var ok = document.createElement('button');
          ok.textContent = 'OK';
          ok.setAttribute('style', 'font:bold 14px sans-serif;background:#4c97ff;color:#fff;border:0;border-radius:10px;padding:0 14px');
          function done() { shared.answer = input.value; removeAsk(); resolve(); }
          ok.addEventListener('click', done);
          input.addEventListener('keydown', function (e) { if (e.key === 'Enter') done(); });
          row.appendChild(input); row.appendChild(ok); box.appendChild(label); box.appendChild(row);
          document.body.appendChild(box);
          setTimeout(function () { input.focus(); }, 0);
        });
      },
      answer: function () { return shared.answer; },
      timer: function () { return Math.round((Date.now() - shared.t0) / 100) / 10; },
      resetTimer: function () { shared.t0 = Date.now(); },
      current: function (what) {
        var d = new Date();
        switch (String(what)) {
          case 'year': return d.getFullYear();
          case 'month': return d.getMonth() + 1;
          case 'date': return d.getDate();
          case 'dayofweek': return d.getDay() + 1;
          case 'hour': return d.getHours();
          case 'minute': return d.getMinutes();
          case 'second': return d.getSeconds();
        }
        return 0;
      },
      daysSince2000: function () { return (Date.now() - Date.UTC(2000, 0, 1)) / 86400000; },
      // "[property] of [sprite]"
      attrOf: function (t, what) {
        var o = typeof t === 'number' ? sprites[t] : null;
        if (!o) return 0;
        switch (String(what)) {
          case 'x': return Math.round(o.x);
          case 'y': return Math.round(o.y);
          case 'direction': return Math.round(o.dir);
          case 'costumenumber': return o.ci + 1;
          case 'costumename': return costumeName(o);
          case 'size': return Math.round(o.size);
        }
        return 0;
      },

      // -- where things are (also used by the tests)
      x: function () { return Math.round(sprite.x); },
      y: function () { return Math.round(sprite.y); },
      direction: function () { return Math.round(sprite.dir); },
      state: function () { var s = publicState(sprite); s.bg = shared.bg; return s; }
    };
    // false once Stop is pressed (or, for a clone, once it is deleted): loops and waits then end quietly
    Object.defineProperty(api, 'running', { get: function () { return shared.running && !sprite.deleted; } });
    return api;
  }

  var S = apiFor(sprites[0]);
  S.states = function () { return sprites.map(publicState); };
  S.cloneCount = function () { return clones.length; };
  S.audioState = function () { return audio ? audio.state : 'none'; };
  S.volumeLevel = function () { return shared.volume; };
  window.S = S;

  // The page can ask the stage to run one stack of blocks right now (a click on a block) or to stop.
  // Only our own page may ask, and only with this run's secret token.
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (e.source !== window.parent || !d || d.__akili !== TOKEN) return;
    if (d.type === 'stop') { shared.running = false; S.stopSounds(); removeAsk(); return; }
    if (d.type === 'run' && typeof d.code === 'string') {
      shared.running = true;
      var el = document.createElement('script');
      el.textContent = d.code;
      document.body.appendChild(el);
    }
  });

  // -- keyboard and mouse
  var KEYMAP = { ' ': 'space', ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'enter' };
  function keyName(e) { return KEYMAP[e.key] || String(e.key).toLowerCase(); }
  function typing(e) { return e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA'); }
  window.addEventListener('keydown', function (e) {
    if (typing(e)) return; // typing an answer is not playing the game
    var k = keyName(e);
    if (k === 'space' || k === 'up' || k === 'down' || k === 'left' || k === 'right') e.preventDefault();
    keys[k] = true;
    fire(handlers.keys[k] || []);
    if (handlers.keys.any) fire(handlers.keys.any);
  });
  window.addEventListener('keyup', function (e) { keys[keyName(e)] = false; });
  window.addEventListener('blur', function () { keys = {}; });
  function stagePoint(e) {
    var r = canvas.getBoundingClientRect();
    var scale = Math.min(r.width / W, r.height / H) || 1;
    var offX = (r.width - W * scale) / 2, offY = (r.height - H * scale) / 2;
    return { x: (e.clientX - r.left - offX) / scale - W / 2, y: H / 2 - (e.clientY - r.top - offY) / scale };
  }
  if (canvas) {
    canvas.addEventListener('mousemove', function (e) { var p = stagePoint(e); shared.mouse.x = clamp(p.x, -W / 2, W / 2); shared.mouse.y = clamp(p.y, -H / 2, H / 2); });
    window.addEventListener('mouseup', function () { shared.mouse.down = false; });
    canvas.addEventListener('mousedown', function (e) {
      canvas.focus();
      var p = stagePoint(e);
      shared.mouse.x = p.x; shared.mouse.y = p.y; shared.mouse.down = true;
      // the sprite in front (drawn last) that was hit gets the click
      for (var i = zorder.length - 1; i >= 0; i--) {
        var sp = zorder[i], reach = 40 * sp.size / 100;
        if (sp.visible && Math.abs(p.x - sp.x) <= reach && Math.abs(p.y - sp.y) <= reach) {
          var who = sp.original || sp;
          who.click.forEach(function (fn) { run(fn, apiFor(sp)); });
          break;
        }
      }
    });
  }

  // -- drawing
  function bubbleBox(text, cx, top, thought) {
    ctx.font = 'bold 16px sans-serif';
    var w = Math.min(300, ctx.measureText(text).width + 24), h = 34;
    var x = clamp(cx - w / 2, 4, W - w - 4), y = clamp(top - h - 8, 4, H - h - 4);
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#555555'; ctx.lineWidth = 2;
    if (thought && ctx.setLineDash) ctx.setLineDash([6, 4]);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, thought ? 17 : 14); else ctx.rect(x, y, w, h);
    ctx.fill(); ctx.stroke();
    if (ctx.setLineDash) ctx.setLineDash([]);
    ctx.fillStyle = '#222222'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2, w - 16);
  }
  function draw() {
    if (ctx) {
      ctx.fillStyle = shared.bg; ctx.fillRect(0, 0, W, H);
      zorder.forEach(function (sprite) {
        if (!sprite.visible) return;
        var px = W / 2 + sprite.x, py = H / 2 - sprite.y, px2 = 64 * sprite.size / 100;
        var cos = sprite.costumes[sprite.ci], img = sprite.imgs[sprite.ci];
        ctx.save();
        ctx.translate(px, py);
        if (sprite.rot === 'all') ctx.rotate((sprite.dir - 90) * Math.PI / 180);
        else if (sprite.rot === 'lr' && Math.sin(sprite.dir * Math.PI / 180) < 0) ctx.scale(-1, 1);
        ctx.globalAlpha = clamp(1 - sprite.fx.ghost / 100, 0, 1);
        if (ctx.filter !== undefined && (sprite.fx.color || sprite.fx.brightness)) {
          ctx.filter = 'hue-rotate(' + Math.round(sprite.fx.color * 3.6) + 'deg) brightness(' + Math.max(0, 100 + sprite.fx.brightness) + '%)';
        }
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
        if (ctx.filter !== undefined) ctx.filter = 'none';
        if (sprite.bubble) bubbleBox(sprite.bubble, px, py - px2 / 2, sprite.bubbleType === 'think');
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
  /** Start the flag programs when the page opens (default). False = show the sprites and wait. */
  autostart?: boolean;
  /** The JavaScript generated from the blocks. */
  code: string;
  /** Random per run: the parent ignores messages that do not carry it. */
  token: string;
  /** The costumes of every sprite, in sprite order; each picture is already a data: address. */
  costumes?: StageCostume[][];
}

/** The complete document for the stage iframe's srcdoc. */
export const buildStageDoc = ({ code, token, costumes = [], autostart = true }: StageParts): string =>
  '<!doctype html><html><head><meta charset="utf-8">' +
  `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">` +
  '<meta name="viewport" content="width=device-width, initial-scale=1">' +
  "<style>html,body{margin:0;height:100%;overflow:hidden;background:#fff}canvas{display:block;width:100%;height:100%;outline:none}</style>" +
  '</head><body><canvas id="stage" width="480" height="360" tabindex="0" aria-label="Stage"></canvas>' +
  `<script>window.__COSTUMES__ = ${JSON.stringify(costumes).replace(/</g, "\\u003c")};</script>` +
  `<script>${RUNTIME_SOURCE.replace("__TOKEN__", () => JSON.stringify(token))}</script>` +
  `<script>${escapeScript(code)}</script>` +
  (autostart ? "<script>if (window.S) window.S.start();</script>" : "") +
  "</body></html>";
