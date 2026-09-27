// Blabbit website motion. GSAP + ScrollTrigger are vendored in assets/vendor.
// No network requests, no storage, no third parties.
(() => {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined";
  const motion = hasGsap && !reduce;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  if (motion) {
    document.documentElement.classList.add("js-motion");
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: "expo.out", duration: 0.9 });
  }

  /* ---------- Orb: port of the app's Orb.swift (thinking-orbs "orbits" mode by Jakub Antalik, MIT) ---------- */

  let level = 0, levelTarget = 0, pillSpeed = 1;

  const hash = (a, b) => { const h = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return h - Math.floor(h); };

  function geometry(size, density) {
    const t = Math.min(Math.max((size - 32) / 32, 0), 1);
    const blend = (s, l) => s + (l - s) * t;
    const cs = blend(0.4251, 1), ss = blend(1.6849, 1);
    const orbitCount = Math.max(1, Math.round(12 * cs * density.orbits));
    const ghostCount = Math.max(1, Math.round(40 * cs * density.ghosts));
    const rs = Math.pow(size / 300, 0.6) * ss * density.dot;
    const shell = (size / 2) * 0.82;
    const orbits = [];
    for (let i = 0; i < orbitCount; i++) {
      const h1 = hash(i, 1.7), h2 = hash(i, 5.2), h3 = hash(i, 8.9);
      const th = h1 * 2 * Math.PI, ph = Math.acos(2 * h2 - 1);
      const n = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
      const len = Math.max(1e-6, Math.hypot(n[1], n[0]));
      const u = [-n[1] / len, n[0] / len, 0];
      const v = [n[2] * u[1] - n[1] * u[2], n[0] * u[2] - n[2] * u[0], n[1] * u[0] - n[0] * u[1]];
      orbits.push({ radius: shell * (0.45 + 0.52 * h1), u, v, speed: (0.25 + 0.55 * h3) * (h3 > 0.5 ? 1 : -1), phase: h2 * 6 });
    }
    return { size, orbits, ghostCount, speed: blend(2.9072, 1.885), particles: density.particles, gR: 0.9 * rs, pR: 1.2 * rs, pDR: 1.6 * rs };
  }

  function dots(g, time, swell) {
    const c = g.size / 2, yaw = time * 0.12, tilt = 0.3;
    const sy = Math.sin(yaw), cy = Math.cos(yaw), st = Math.sin(tilt), ct = Math.cos(tilt);
    const out = [];
    for (const o of g.orbits) {
      const r = o.radius * swell;
      const at = (a) => {
        const ca = Math.cos(a), sa = Math.sin(a);
        const px = (o.u[0] * ca + o.v[0] * sa) * r, py = (o.u[1] * ca + o.v[1] * sa) * r, pz = (o.u[2] * ca + o.v[2] * sa) * r;
        const x1 = px * cy + pz * sy, z1 = -px * sy + pz * cy;
        return [c + x1, c - (py * ct - z1 * st), py * st + z1 * ct];
      };
      for (let k = 0; k < g.ghostCount; k++) {
        const [x, y, z] = at((k / g.ghostCount) * 2 * Math.PI);
        const d = (z / r + 1) / 2;
        out.push({ x, y, z, r: g.gR, ghost: true, d, a: 0.6 * (0.4 + 0.6 * d) });
      }
      for (let m = 0; m < g.particles; m++) {
        const [x, y, z] = at(time * o.speed + (m / g.particles) * 2 * Math.PI + o.phase);
        const d = (z / r + 1) / 2;
        out.push({ x, y, z, r: g.pR + g.pDR * d, ghost: false, d, a: 1 });
      }
    }
    return out.sort((p, q) => p.z - q.z);
  }

  function makeOrb(canvas, o) {
    const ctx = canvas.getContext("2d");
    const s = { canvas, visible: true, g: null, css: 0 };
    s.resize = () => {
      const css = canvas.getBoundingClientRect().width || o.fallback;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(css * dpr); canvas.height = Math.round(css * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s.css = css; s.g = geometry(css, o.density);
    };
    s.draw = (now) => {
      const g = s.g; if (!g) return;
      const time = motion ? (now / 1000) * g.speed * o.speed() : 0.6;
      ctx.clearRect(0, 0, s.css, s.css);
      for (const p of dots(g, time, 1 + o.swell * o.level())) {
        if (p.a < 0.02) continue;
        let rgb;
        if (o.teal) {
          rgb = p.ghost ? [70, 150, 160] : [Math.round(150 + 105 * p.d), Math.round(225 + 30 * p.d), Math.round(228 + 27 * p.d)];
        } else {
          const v = Math.round((p.ghost ? 0.5 : 1 - (0.3 - 0.22 * p.d)) * 255);
          rgb = [v, v, v];
        }
        ctx.globalAlpha = p.ghost ? p.a * o.ghostAlpha : p.a;
        ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.3, p.r), 0, 6.2832); ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    s.resize();
    return s;
  }

  const pillCanvas = $('[data-orb="pill"]');
  const orb = pillCanvas ? makeOrb(pillCanvas, {
    fallback: 34, density: { orbits: 1, ghosts: 1, particles: 3, dot: 1 },
    speed: () => pillSpeed, level: () => level, swell: 0.24, ghostAlpha: 1,
  }) : null;
  let orbVisible = true;
  if (orb && "IntersectionObserver" in window) {
    new IntersectionObserver((es) => { orbVisible = es[0].isIntersecting; }).observe(pillCanvas);
  }
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (orb) { orb.resize(); orb.draw(performance.now()); } }, 150); });
  if (orb) {
    if (motion) {
      gsap.ticker.add(() => {
        level += (levelTarget - level) * 0.14;
        if (orbVisible) orb.draw(performance.now());
      });
    } else {
      orb.draw(0);
    }
  }

  /* ---------- Nav and copy button (always) ---------- */

  const nav = $("[data-nav]");
  let lastY = window.scrollY;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle("is-hidden", y > 200 && y > lastY + 4);
    if (Math.abs(y - lastY) > 4) lastY = y;
  }, { passive: true });

  $$("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const src = document.getElementById(btn.dataset.copy);
      try { await navigator.clipboard.writeText(src.textContent.trim()); btn.textContent = "Copied"; }
      catch {
        const range = document.createRange(); range.selectNodeContents(src);
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
        btn.textContent = "Press ⌘C";
      }
      setTimeout(() => { btn.textContent = "Copy"; }, 1800);
    });
  });

  /* ---------- Download: show next steps, or a heads-up for visitors not on a Mac (always) ----------
     Device check reads only the browser's own user agent; nothing is stored or sent. */

  const next = $("[data-next]");
  if (next && typeof next.showModal === "function") {
    const ua = navigator.userAgent;
    const touchMac = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1; // iPadOS reports itself as a Mac
    const onMac = /Macintosh|Mac OS X/.test(ua) && !/iPhone|iPad|iPod/.test(ua) && !touchMac;
    const mac = $("[data-next-mac]", next), other = $("[data-next-other]", next);
    const open = (isMac) => {
      mac.hidden = !isMac; other.hidden = isMac;
      next.showModal();
    };

    $$("[data-download]").forEach((a) => {
      a.addEventListener("click", (e) => {
        if (onMac) { setTimeout(() => open(true), 400); return; } // let the download begin first
        e.preventDefault();
        open(false);
      });
    });
    $("[data-next-anyway]", next).addEventListener("click", () => next.close());
    $("[data-next-close]", next).addEventListener("click", () => next.close());
    next.addEventListener("click", (e) => { // click on the backdrop
      if (e.target !== next) return;
      const r = next.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) next.close();
    });
  }

  if (!motion) return;

  /* ---------- Blab hero: the wordmark floats, spoken words fall into a pile you can pick up and throw ---------- */

  const pit = $("[data-pit]");
  if (pit && typeof Matter !== "undefined") wordPile(pit);

  function wordPile(pit) {
    const { Engine, Bodies, Body, Composite, Constraint, Sleeping } = Matter;
    const blab = pit.closest("[data-blab]");
    const copyEl = $("[data-blab-copy]", blab);
    const hint = $("[data-hint]", blab);
    const mark = $("[data-mark]", blab);
    const chips = $$(".blk", pit);
    const vocab = chips.map((c) => ({ text: c.textContent, cls: c.className }));
    const rand = gsap.utils.random;
    const STEP = 1000 / 60, MAX_SPEED = 36, MAX_EXTRA = 20;

    document.documentElement.classList.add("js-physics");
    const engine = Engine.create({ enableSleeping: true, gravity: { y: 1.15 } });
    const world = engine.world;
    let items = [], walls = [], timers = [], W = 0, H = 0, held = null, tap = null, visible = true, acc = 0;

    const add = (el, x, y) => {
      el.style.visibility = "visible";
      const w = el.offsetWidth, h = el.offsetHeight;
      const r = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, h / 2 - 0.5);
      const body = Bodies.rectangle(x, y, w, h, {
        chamfer: { radius: Math.max(0, r), qualityMax: 6 },
        restitution: 0.32, friction: 0.4, frictionStatic: 0.6, frictionAir: 0.012, density: 0.0016,
      });
      // Words resist spinning so most stay readable.
      Body.setInertia(body, body.inertia * 5);
      const it = { el, body, w, h, px: x, py: y, pa: 0 };
      items.push(it);
      Composite.add(world, body);
      return it;
    };

    const drop = (it) => {
      if (it.gone) return;
      it.gone = true;
      gsap.to(it.el, { opacity: 0, duration: 0.4, onComplete: () => {
        Composite.remove(world, it.body); it.el.remove(); items = items.filter((i) => i !== it);
      } });
    };

    const buildWalls = () => {
      Composite.remove(world, walls);
      const t = 400;
      walls = [
        Bodies.rectangle(W / 2, H + t / 2, W * 3, t, { isStatic: true, friction: 0.8 }),
        Bodies.rectangle(-t / 2, -H, t, H * 4, { isStatic: true }),
        Bodies.rectangle(W + t / 2, -H, t, H * 4, { isStatic: true }),
      ];
      Composite.add(world, walls);
    };

    const start = () => {
      timers.forEach(clearTimeout); timers = [];
      if (held) { Composite.remove(world, held.c); held = null; }
      items.forEach((it) => { Composite.remove(world, it.body); if (it.extra) it.el.remove(); else it.el.style.visibility = "hidden"; });
      items = [];
      W = pit.clientWidth; H = pit.clientHeight;
      buildWalls();
      hint && hint.classList.remove("is-on");

      // A handful of words, fewer on small screens. They fall behind the copy and settle under it.
      const count = W >= 1000 ? 30 : W >= 640 ? 20 : 13;
      const pick = chips.slice(0, count);
      // Spread the drops across the width (shuffled), nearly flat, so words land lying down.
      const lanes = gsap.utils.shuffle(pick.map((_, i) => (i + 0.5) / pick.length));
      pick.forEach((el, i) => timers.push(setTimeout(() => {
        const half = el.offsetWidth / 2 + 6;
        const x = Math.min(Math.max(lanes[i] * W + rand(-20, 20), half), Math.max(half, W - half));
        const it = add(el, x, -el.offsetHeight - rand(0, 80));
        Body.setAngle(it.body, rand(-0.15, 0.15));
      }, 500 + i * 110)));
      timers.push(setTimeout(() => hint && hint.classList.add("is-on"), 500 + count * 110 + 1200));
    };

    const at = (e) => { const r = pit.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

    // Blab more: a tap on empty space pops a new word out from under the pointer.
    const say = (p) => {
      const v = vocab[Math.floor(Math.random() * vocab.length)];
      const el = document.createElement("span");
      el.className = v.cls; el.textContent = v.text;
      pit.appendChild(el);
      const half = el.offsetWidth / 2 + 6;
      const it = add(el, Math.min(Math.max(p.x, half), W - half), p.y);
      it.extra = true;
      Body.setVelocity(it.body, { x: rand(-5, 5), y: rand(-15, -9) });
      Body.setAngularVelocity(it.body, rand(-0.18, 0.18));
      const extras = items.filter((i) => i.extra && !i.gone);
      if (extras.length > MAX_EXTRA) drop(extras[0]);
    };

    const release = () => {
      if (!held) return;
      Composite.remove(world, held.c);
      held.it.el.classList.remove("is-held");
      held = null;
    };

    pit.addEventListener("pointerdown", (e) => {
      if (e.button > 0) return;
      const p = at(e);
      const it = items.find((i) => i.el === e.target.closest(".blk"));
      if (!it) { tap = { x: p.x, y: p.y, t: performance.now(), id: e.pointerId }; return; }
      e.preventDefault();
      release();
      const b = it.body;
      Sleeping.set(b, false);
      held = { it, id: e.pointerId, c: Constraint.create({
        pointA: p, bodyB: b, pointB: { x: p.x - b.position.x, y: p.y - b.position.y }, stiffness: 0.7, damping: 0.08, length: 0,
      }) };
      Composite.add(world, held.c);
      it.el.classList.add("is-held");
      try { it.el.setPointerCapture(e.pointerId); } catch {}
    });
    window.addEventListener("pointermove", (e) => {
      if (!held || e.pointerId !== held.id) return;
      held.c.pointA = at(e);
      Sleeping.set(held.it.body, false);
    });
    const up = (e) => {
      if (held && e.pointerId === held.id) { release(); return; }
      if (tap && tap.id === e.pointerId) {
        const p = at(e);
        if (e.type === "pointerup" && Math.hypot(p.x - tap.x, p.y - tap.y) < 8 && performance.now() - tap.t < 450) say(p);
        tap = null;
      }
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);

    // Fixed 60 Hz physics, drawn at the display's rate: each frame blends the last two steps,
    // so words glide on 120 Hz screens instead of stepping every other frame.
    gsap.ticker.add((time, dt) => {
      if (!visible) return;
      acc = Math.min(acc + dt, STEP * 4);
      while (acc >= STEP) {
        for (const it of items) {
          const b = it.body;
          it.px = b.position.x; it.py = b.position.y; it.pa = b.angle;
          if (b.speed > MAX_SPEED) Body.setVelocity(b, { x: (b.velocity.x / b.speed) * MAX_SPEED, y: (b.velocity.y / b.speed) * MAX_SPEED });
        }
        Engine.update(engine, STEP);
        acc -= STEP;
      }
      const k = acc / STEP;
      for (const it of items) {
        const b = it.body;
        if (b.isSleeping && it.drawn) continue;
        it.drawn = true;
        const x = it.px + (b.position.x - it.px) * k, y = it.py + (b.position.y - it.py) * k, a = it.pa + (b.angle - it.pa) * k;
        it.el.style.transform = `translate3d(${(x - it.w / 2).toFixed(2)}px, ${(y - it.h / 2).toFixed(2)}px, 0) rotate(${a.toFixed(4)}rad)`;
      }
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => { visible = es[0].isIntersecting; acc = 0; }).observe(blab);
    }

    // A real width change restarts the pile; the mobile URL bar only moves the floor.
    let rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        const w = pit.clientWidth, h = pit.clientHeight;
        if (Math.abs(w - W) > 40 || Math.abs(h - H) > 180) start();
        else if (h !== H) { H = h; buildWalls(); items.forEach((i) => Sleeping.set(i.body, false)); }
      }, 200);
    });

    // The wordmark pops in, then hovers above the pile. Clicking it makes it blab a few words.
    gsap.from(mark, { scale: 0.6, opacity: 0, rotate: -10, duration: 1.1, ease: "elastic.out(1, 0.55)" });
    gsap.to(mark, { y: -12, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1 });
    gsap.fromTo(mark, { rotate: -2.5 }, { rotate: 1.5, duration: 3.1, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 1 });
    mark.addEventListener("click", () => {
      gsap.fromTo(mark, { scaleX: 1.08, scaleY: 0.9 }, { scaleX: 1, scaleY: 1, duration: 0.7, ease: "elastic.out(1, 0.4)" });
      const r = mark.getBoundingClientRect(), pr = pit.getBoundingClientRect();
      for (let i = 0; i < 3; i++) say({ x: r.left - pr.left + r.width * (0.25 + 0.25 * i), y: r.bottom - pr.top });
    });
    gsap.from([...copyEl.children].slice(1).filter((el) => el !== hint), { opacity: 0, y: 16, duration: 1, stagger: 0.08, delay: 0.25 });
    gsap.from($(".blab__tag", blab), { opacity: 0, y: 16, duration: 1, delay: 0.15 });
    start();
  }

  /* ---------- Demo: scroll is the shortcut. Hold, speak, let go. ---------- */

  const pin = $("[data-pin]");
  const stage = $("[data-stage]");
  const doc = $("[data-doc]");
  const ghosts = $("[data-ghosts]");
  const pill = $("[data-pill]");
  const keys = $("[data-keys]");
  const time = $("[data-time]");
  const caps = $$("[data-cap]");

  // Spoken words. "fix" is typed then taken back; "said" is heard but never typed; "new" is the correction.
  const script = [
    "Hey", "team,", "let’s", "move", "the", "launch", "review", "to", "Friday", "at",
    ["6,", "fix"], ["sorry,", "said"], ["5 p.m.", "new"],
    "I’ll", "bring", "the", "new", "designs.", "Can", "someone", "book", "the", "big", "room?", "Thanks!",
  ].map((t) => (Array.isArray(t) ? { text: t[0], kind: t[1] } : { text: t, kind: "word" }));

  doc.textContent = "";
  script.forEach((t, i) => {
    t.ghost = document.createElement("span");
    t.ghost.className = "ghost";
    t.ghost.textContent = t.text;
    ghosts.appendChild(t.ghost);
    if (t.kind === "said") return;
    t.el = document.createElement("span");
    t.el.className = "w" + (t.kind === "fix" ? " w--fix" : t.kind === "new" ? " w--new" : "");
    t.el.textContent = t.kind === "fix" ? t.text + " " : t.text;
    doc.appendChild(t.el);
    if (t.kind !== "fix" && i < script.length - 1) doc.appendChild(document.createTextNode(" "));
  });
  const caret = document.createElement("i");
  caret.className = "caret";
  doc.appendChild(caret);

  const words = script.filter((t) => t.el).map((t) => t.el);
  gsap.set(words, { opacity: 0, y: 6 });
  gsap.set(caps, { opacity: 0, y: 24 });
  gsap.set(caps[0], { opacity: 1, y: 0 });
  gsap.set(keys, { opacity: 0, y: 16 });
  gsap.set(stage, { yPercent: -38, transformPerspective: 1400 });

  const tl = gsap.timeline({ defaults: { ease: "none" } });

  // 0–2: the window waits below, tilted back, then rises flat as the scene pins.
  tl.fromTo(stage, { y: () => window.innerHeight * 0.22, rotateX: 24, scale: 0.9 }, { y: 0, rotateX: 0, scale: 1, duration: 1.7, ease: "power2.inOut" }, 0.1);

  // 2–3: hold the shortcut.
  tl.to(keys, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 2)
    .to(keys.children, { y: 3, duration: 0.15, stagger: 0.08 }, 2.6)
    .to(pill, { scale: 1.08, duration: 0.15, yoyo: true, repeat: 1 }, 2.75);

  // 3.2–8: speak. Each word leaves the pill as sound and lands in the email as text.
  const talkStart = 3.3, talkEnd = 7.9, step = (talkEnd - talkStart) / script.length;
  tl.to(caps[0], { opacity: 0, y: -24, duration: 0.3 }, 3.1)
    .to(caps[1], { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 3.3);
  script.forEach((t, i) => {
    const at = talkStart + i * step;
    const dx = gsap.utils.random(-150, 150);
    tl.fromTo(t.ghost, { x: dx * 0.2, xPercent: -50, y: 0, opacity: 0, scale: 0.9 },
      { x: dx, y: -70, opacity: 1, scale: 1, duration: step * 2.2, ease: "power2.out" }, at)
      .to(t.ghost, { y: -130, opacity: 0, duration: step * 2, ease: "power1.in" }, at + step * 2.2);
    const land = t.kind === "new" ? at + step * 2.6 : at + step * 1.2;
    if (t.el) tl.to(t.el, { opacity: 1, y: 0, duration: step * 1.4, ease: "power2.out" }, land);
  });
  const fix = script.find((t) => t.kind === "fix").el;
  const fixAt = talkStart + script.findIndex((t) => t.kind === "said") * step + step;
  tl.fromTo(fix, { "--strike": "0%" }, { "--strike": "100%", duration: step * 1.4 }, fixAt)
    .to(fix, { width: 0, opacity: 0, duration: step * 1.6, ease: "power2.inOut" }, fixAt + step * 1.6);

  // 8–10: let go.
  tl.to(caps[1], { opacity: 0, y: -24, duration: 0.3 }, 8)
    .to(keys.children, { y: 0, duration: 0.15, stagger: 0.06 }, 8.1)
    .to(caps[2], { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 8.3)
    .to(keys, { opacity: 0, y: 16, duration: 0.4 }, 8.8)
    .to({}, { duration: 0.8 }, 9.2);

  const heroST = ScrollTrigger.create({
    trigger: pin,
    start: "top top",
    end: () => "+=" + Math.round(window.innerHeight * 3.2),
    pin: true,
    scrub: 0.7,
    animation: tl,
    invalidateOnRefresh: true,
  });

  // Scrub eases toward the scroll position, so drive live state from the timeline itself.
  tl.eventCallback("onUpdate", () => {
    const t = tl.time();
    const live = t > 2.7 && t < 8.1;
    pill.classList.toggle("is-live", live);
    levelTarget = live ? 0.8 : 0;
    pillSpeed = live ? 1.6 : 1;
    const secs = Math.max(0, Math.min(9, ((t - 2.7) / (talkEnd - 2.7)) * 9));
    time.textContent = "0:0" + Math.floor(live ? secs : t >= 8.1 ? 9 : 0);
    // Keep the caret right after the last word that has landed.
    let last = null;
    for (const w of words) { if (gsap.getProperty(w, "opacity") > 0.4 && !(w === fix && t > fixAt + step)) last = w; }
    const want = last ? last.nextSibling : doc.firstChild;
    if (want !== caret && caret.previousSibling !== last) doc.insertBefore(caret, want);
  });

  // "How it works" jumps into the middle of the dictation.
  $$('a[href="#demo"]').forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: heroST.start + (heroST.end - heroST.start) * 0.42, behavior: "smooth" });
  }));

  /* ---------- Manifesto: words fill in with scroll ---------- */

  const reveal = $("[data-reveal]");
  if (reveal) {
    const split = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const s = document.createElement("span"); s.className = "rw"; s.textContent = part; frag.appendChild(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) split(n);
      });
    };
    split(reveal);
    gsap.fromTo($$(".rw", reveal), { opacity: 0.14 }, {
      opacity: 1, stagger: 0.1, ease: "none",
      scrollTrigger: { trigger: reveal, start: "top 78%", end: "bottom 42%", scrub: 0.4 },
    });
  }

  /* ---------- Speed: numbers count down to the real ones, bars race ---------- */

  const speedCard = $(".speed__card");
  if (speedCard) {
    const counts = $$("[data-count]", speedCard);
    const from = { 75: 5000, 0.3: 9.9, 0: 0 };
    counts.forEach((el) => {
      const to = parseFloat(el.dataset.count), d = parseInt(el.dataset.decimals || "0", 10);
      el.textContent = (from[to] ?? to).toFixed(d);
    });
    gsap.set("[data-race]", { scaleX: 0 });
    ScrollTrigger.create({
      trigger: speedCard, start: "top 65%", once: true,
      onEnter: () => {
        counts.forEach((el) => {
          const to = parseFloat(el.dataset.count), d = parseInt(el.dataset.decimals || "0", 10);
          const o = { v: from[to] ?? to };
          gsap.to(o, { v: to, duration: 1.8, ease: "expo.out", onUpdate: () => { el.textContent = o.v.toFixed(d); } });
        });
        gsap.to('[data-race="you"]', { scaleX: 1, duration: 2.4, ease: "none", delay: 0.3 });
        gsap.to('[data-race="utter"]', { scaleX: 1, duration: 0.12, ease: "none", delay: 0.3 });
      },
    });
    gsap.from(speedCard, { scale: 0.94, borderRadius: 60, ease: "none", scrollTrigger: { trigger: speedCard, start: "top bottom", end: "top 30%", scrub: true } });
  }

  /* ---------- Feature loops (play only while visible) ---------- */

  const loop = (el, build) => {
    if (!el) return;
    const t = gsap.timeline({ repeat: -1, paused: true });
    build(t);
    ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onToggle: (s) => (s.isActive ? t.play() : t.pause()) });
  };

  loop($("[data-fix-old]"), (t) => {
    const old = $("[data-fix-old]"), neu = $("[data-fix-new]");
    t.set(old, { "--s": 0, opacity: 1 }).set(neu, { opacity: 0, x: -6 })
      .to(old, { "--s": 1, duration: 0.45, ease: "power2.inOut" }, 0.9)
      .to(old, { opacity: 0.35, duration: 0.3 }, 1.35)
      .to(neu, { opacity: 1, x: 0, duration: 0.5, ease: "expo.out" }, 1.4)
      .to({}, { duration: 2.2 });
  });

  loop($("[data-vocab]"), (t) => {
    const rows = $$("[data-vocab] p");
    rows.forEach((r) => { t.set(r.querySelector("b"), { opacity: 0, x: 12 }, 0).set(r.querySelector("s"), { opacity: 1 }, 0); });
    rows.forEach((r, i) => {
      t.to(r.querySelector("s"), { opacity: 0.45, duration: 0.3 }, 0.6 + i * 0.45)
        .to(r.querySelector("b"), { opacity: 1, x: 0, duration: 0.5, ease: "expo.out" }, 0.7 + i * 0.45);
    });
    t.to({}, { duration: 2 });
  });

  loop($("[data-apps]"), (t) => {
    const items = $$("[data-apps] li");
    t.set(items, { opacity: 0.35, scale: 0.96 });
    items.forEach((li, i) => {
      const no = li.classList.contains("apps__no");
      t.to(li, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 0.3 + i * 0.28);
      if (no) t.to(li, { x: 5, duration: 0.06, yoyo: true, repeat: 5, ease: "none" }, 0.65 + i * 0.28).to(li, { opacity: 0.55, duration: 0.3 });
    });
    t.to({}, { duration: 1.8 });
  });

  /* ---------- Section entrances ---------- */

  $$(".features > .display, .install > .display, .faq > .display, .newbie__head, .use, .card, .step, .also, .terminal, .gate, .faq__list, .maker__card, .close__inner > *").forEach((el) => el.setAttribute("data-in", ""));
  ScrollTrigger.batch("[data-in]", {
    start: "top 88%",
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: "expo.out" }),
  });

  gsap.to(".aurora--close i", { xPercent: (i) => [18, -16, 10][i], yPercent: (i) => [-10, 8, -14][i], duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 });

  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
