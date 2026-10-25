/* ---------- particle network background (light, subtle) ---------- */
(() => {
  const c = document.getElementById('net'), ctx = c.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let w, h, pts = [], mouse = { x: -9999, y: -9999 };
  const N = () => Math.min(90, Math.floor((w * h) / (18000 * dpr * dpr)));
  function resize() {
    w = c.width = innerWidth * dpr; h = c.height = innerHeight * dpr;
    c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
    pts = Array.from({ length: N() }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .22 * dpr, vy: (Math.random() - .5) * .22 * dpr }));
  }
  function step() {
    ctx.clearRect(0, 0, w, h);
    const link = 130 * dpr, pull = 200 * dpr;
    for (const p of pts) {
      if (!reduce) {
        const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
        if (d < pull && d > 1) { p.vx += dx / d * .01 * dpr; p.vy += dy / d * .01 * dpr; }
        p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
      }
    }
    ctx.lineWidth = dpr * .8;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < link) { ctx.strokeStyle = `rgba(17,17,17,${(1 - d / link) * .14})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y), near = dm < pull;
      ctx.fillStyle = near ? 'rgba(181,50,26,.85)' : 'rgba(17,17,17,.35)';
      ctx.beginPath(); ctx.arc(a.x, a.y, (near ? 2.4 : 1.7) * dpr, 0, Math.PI * 2); ctx.fill();
      if (near && mouse.x > 0) { ctx.strokeStyle = `rgba(181,50,26,${(1 - dm / pull) * .45})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    }
    requestAnimationFrame(step);
  }
  addEventListener('resize', resize);
  addEventListener('pointermove', e => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
  document.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  resize(); step();
})();

/* ---------- hero highlight draws in after load ---------- */
setTimeout(() => document.querySelectorAll('[data-mark]').forEach((m, i) => setTimeout(() => m.classList.add('on'), i * 500)), 400);

/* ---------- scroll reveal, with fallback for elements already on screen ---------- */
const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: .25, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
requestAnimationFrame(() => document.querySelectorAll('.reveal').forEach(el => { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); }));

/* ---------- reading progress + active nav ---------- */
const bar = document.getElementById('progress'), navLinks = [...document.querySelectorAll('nav .sections a:not(.page)')];
const targets = navLinks.map(a => a.getAttribute('href').startsWith('#') ? document.querySelector(a.getAttribute('href')) : null).filter(Boolean);
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
  let cur = null; for (const t of targets) if (t.getBoundingClientRect().top <= innerHeight * .4) cur = t;
  if (targets.length) navLinks.forEach(a => a.classList.toggle('active', cur && a.getAttribute('href') === '#' + cur.id));
}
addEventListener('scroll', onScroll, { passive: true }); onScroll();

/* ---------- terminal ---------- */
(() => {
  const out = document.getElementById('term-out'), form = document.getElementById('term-form'), input = document.getElementById('term-input');
  if (!out) return;
  const history = []; let hi = 0;
  const L = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
  const cmds = {
    help: () => `available commands:
  <span class="cmd">whoami</span>      who is this
  <span class="cmd">work</span>        what I build
  <span class="cmd">stack</span>       languages and tools
  <span class="cmd">experience</span>  where I have worked
  <span class="cmd">patents</span>     filings and awards
  <span class="cmd">mentor</span>      help with your job search
  <span class="cmd">contact</span>     reach me
  <span class="cmd">clear</span>       clear the screen`,
    whoami: () => `Shreya Anand. Software engineer at Airbnb, Bengaluru.
Backend systems for payments. Previously Adobe (Illustrator on the Web) and LinkedIn (Productivity Engineering).
NIT Kurukshetra, Computer Science, 2022.`,
    work: () => `Backend-heavy full-stack work: service design, data pipelines, and the
unglamorous reliability work that keeps regulated systems honest.
Currently payments compliance infrastructure at Airbnb.
Case studies: ${L('work.html', 'work.html')}`,
    stack: () => `languages   Java, Kotlin, C++, Python, TypeScript
infra       Kafka, MySQL, REST, distributed systems, service design
other       vector graphics computation, generative models, Claude Code`,
    experience: () => `2025 to now   Airbnb        Software Engineer 2, payments compliance
2024 to 2025  LinkedIn      Software Engineer, Unified Content Lake (+65% positive responses)
2022 to 2024  Adobe         Software Engineer, Illustrator on the Web, Quick Pen Tool
2021          Google, SAP   Internships
2018 to 2022  NIT Kurukshetra, B.Tech CSE`,
    patents: () => `US 2026/0024212  ${L('https://patents.google.com/patent/US20260024212A1/en', 'Advanced Image Tracing for Vectorizing Raster Images')}  (Adobe, published Jan 2026)
US 2026/0057577  ${L('https://patents.google.com/patent/US20260057577A1/en', 'Aligning Traces to Geometric Shapes')}  (Adobe, published Feb 2026)
       both under Project Vectormitate: generative vector tracing of raster images
award  Spot award, Illustrator on the Web Public Beta
award  Spot award, GenAI model evaluation for text to vector`,
    mentor: () => `1:1 session     ${L('https://topmate.io/iamshreyaanand', 'book a slot')}
resume review   ${L('https://topmate.io/iamshreyaanand', 'book on Topmate')} with the role you are targeting
referrals       message me on ${L('https://www.linkedin.com/in/iamshreyaanand', 'LinkedIn')} with the posting`,
    contact: () => `email     ${L('mailto:shreyaanand2908@gmail.com', 'shreyaanand2908@gmail.com')}
linkedin  ${L('https://www.linkedin.com/in/iamshreyaanand', 'linkedin.com/in/iamshreyaanand')}
topmate   ${L('https://topmate.io/iamshreyaanand', 'book a session on Topmate')}`,
    clear: () => { out.innerHTML = ''; return null; },
    ls: () => `${L('index.html','index.html')}  ${L('work.html','work.html')}`,
    cd: () => `use <span class="cmd">ls</span> and click. this shell is read-only.`,
    pwd: () => `/home/shreya/portfolio`,
    sudo: () => `<span class="err">nice try.</span>`,
    hello: () => `hi. type <span class="cmd">help</span> to see what I can do.`,
    hi: () => cmds.hello(),
    exit: () => `there is no exit. only <span class="cmd">contact</span>.`
  };
  const esc = s => s.replace(/</g, '&lt;');
  function print(html, cls = '') { const d = document.createElement('div'); if (cls) d.className = cls; d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; }
  function run(raw) {
    const line = raw.trim(); if (!line) return;
    print(`<span class="dim">$</span> ${esc(line)}`);
    const [name] = line.toLowerCase().split(/\s+/);
    const fn = cmds[name];
    const res = fn ? fn() : `<span class="err">command not found: ${esc(name)}</span>. try <span class="cmd">help</span>.`;
    if (res !== null) print(res);
    history.push(line); hi = history.length;
  }
  form.addEventListener('submit', e => { e.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) input.value = history[--hi] || ''; }
    if (e.key === 'ArrowDown') { e.preventDefault(); if (hi < history.length) input.value = history[++hi] || ''; }
    if (e.key === 'Tab') { e.preventDefault(); const m = Object.keys(cmds).filter(k => k.startsWith(input.value.toLowerCase())); if (m.length === 1) input.value = m[0]; else if (m.length) print(m.join('  '), 'dim'); }
  });
  document.getElementById('term').addEventListener('click', () => input.focus());
  print(`<span class="dim">this is a real prompt. type <span class="cmd">help</span> or try <span class="cmd">whoami</span>.</span>`);
  addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k' && document.getElementById('terminal')) { e.preventDefault(); document.getElementById('terminal').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => input.focus(), 450); }
  });
})();

const yearEl = document.getElementById('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---------- inline line icons (stroke-based, draw in on reveal) ---------- */
(() => {
  const ICONS = {
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7"/><path d="M8 7v.01"/><path d="M12 17v-7"/><path d="M12 13a2.5 2.5 0 0 1 5 0v4"/>',
    github: '<path d="M9 19c-4.5 1.5-5-2-7-2"/><path d="M15 21v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.7 11.7 0 0 0-6.2 0C6.3 2.7 5.3 3 5.3 3a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.3c0 4.6 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3V21"/>',
    terminal: '<path d="M4 17l6-5-6-5"/><path d="M12 19h8"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M8.2 13.9L7 23l5-3 5 3-1.2-9.1"/>',
    'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v4"/><path d="M8 23h8"/>',
    graduation: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    layers: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
    code: '<path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4"/><path d="M15.4 6.5l-6.8 4"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.7-4 3-9 3s-9-1.3-9-3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/>',
    'pen-tool': '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.6 7.6"/><circle cx="11" cy="11" r="2"/>',
    sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
    zap: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
    hexagon: '<path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z"/><path d="M12 22V12"/><path d="M3.3 7l8.7 5 8.7-5"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3 6.3-2.1z"/>',
    list: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>',
    scale: '<path d="M12 3v18"/><path d="M3 7h18"/><path d="M6 7l-3 7a3 3 0 0 0 6 0L6 7z"/><path d="M18 7l-3 7a3 3 0 0 0 6 0l-3-7z"/>',
    trending: '<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
    shuffle: '<path d="M16 3h5v5"/><path d="M4 20L21 3"/><path d="M21 16v5h-5"/><path d="M15 15l6 6"/><path d="M4 4l5 5"/>',
    trophy: '<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M17 6h3v2a3 3 0 0 1-3 3"/><path d="M7 6H4v2a3 3 0 0 0 3 3"/>',
    cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/>',
    arrow: '<path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>'
  };
  const TONE = { home: 'red', mail: 'red', linkedin: 'blue', github: 'violet', terminal: 'green', briefcase: 'amber', award: 'amber', 'file-text': 'blue', mic: 'violet', graduation: 'teal', layers: 'violet', code: 'teal', users: 'red', share: 'blue', database: 'teal', 'pen-tool': 'red', sparkles: 'amber', shield: 'green', server: 'blue', zap: 'amber', hexagon: 'violet', activity: 'green', calendar: 'blue', edit: 'red', compass: 'teal', list: 'blue', scale: 'amber', trending: 'green', shuffle: 'violet', trophy: 'amber', cpu: 'teal', arrow: 'red' };
  document.querySelectorAll('i.ic[data-icon]').forEach(el => {
    const body = ICONS[el.dataset.icon]; if (!body) return;
    if (!el.closest('h2') && TONE[el.dataset.icon]) el.dataset.tone = TONE[el.dataset.icon];
    if (el.classList.contains('big') && !matchMedia('(prefers-reduced-motion: reduce)').matches) { el.addEventListener('animationend', () => { el.classList.add('float'); el.style.animationDelay = (Math.random() * 2) + 's'; }, { once: true }); }
    el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
    el.querySelectorAll('path, rect, circle, ellipse').forEach(s => s.setAttribute('pathLength', '1'));
  });
})();

/* ---------- headline words rise in one by one ---------- */
(() => {
  const h = document.querySelector('.hero h1, .page-head h1'); if (!h) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT), nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  let i = 0;
  nodes.forEach(n => {
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(part => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
      const w = document.createElement('span'); w.className = 'w'; w.textContent = part; w.style.animationDelay = (i++ * 60) + 'ms'; frag.appendChild(w);
    });
    n.parentNode.replaceChild(frag, n);
  });
  h.classList.add('words');
})();

/* ---------- count-up stats ---------- */
(() => {
  const els = document.querySelectorAll('[data-count]'); if (!els.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const run = el => {
    const end = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = pre + end + suf; return; }
    const t0 = performance.now(), dur = 1200;
    (function tick(t) {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + Math.round(end * e) + suf;
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  };
  const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); o.unobserve(e.target); } }), { threshold: .5 });
  els.forEach(el => o.observe(el));
})();

/* ---------- Bengaluru clock ---------- */
(() => {
  const el = document.getElementById('clock'); if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 1000);
})();

/* ---------- raster → vector tracing interactive ---------- */
(() => {
  const c = document.getElementById('trace'), tile = document.getElementById('trace-tile'); if (!c) return;
  const ctx = c.getContext('2d'), reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let W, H, cells = [], path, pts, mouse = null, sweep = 0, lastMove = 0;
  // a leaf-like closed shape, anchors with symmetric handles, in unit space
  // a tilted leaf: sharp tip and base (zero-length handles), full curves on the sides
  const A = [
    { p: [.56, .06], h: [0, 0] },
    { p: [.88, .40], h: [.01, .17] },
    { p: [.50, .94], h: [0, 0] },
    { p: [.14, .58], h: [-.01, -.18] },
  ];
  const map = ([x, y]) => [x * W, y * H];
  function build() {
    const r = tile.getBoundingClientRect();
    W = c.width = r.width * dpr; H = c.height = r.height * dpr;
    const sz = Math.min(W, H) * .86, ox = (W - sz) / 2, oy = (H - sz) / 2;
    pts = A.map(a => ({ p: [ox + a.p[0] * sz, oy + a.p[1] * sz], h: [a.h[0] * sz, a.h[1] * sz] }));
    path = new Path2D();
    path.moveTo(...pts[0].p);
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      path.bezierCurveTo(a.p[0] + a.h[0], a.p[1] + a.h[1], b.p[0] - b.h[0], b.p[1] - b.h[1], b.p[0], b.p[1]);
    }
    path.closePath();
    const n = 26, cw = sz / n; cells = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const x = ox + i * cw, y = oy + j * cw, cx = x + cw / 2, cy = y + cw / 2;
      // sample 4 sub-points for a soft edge
      let k = 0; for (const [dx, dy] of [[-.25, -.25], [.25, -.25], [-.25, .25], [.25, .25]]) if (ctx.isPointInPath(path, cx + dx * cw, cy + dy * cw)) k++;
      if (k) cells.push({ x, y, s: cw, a: k / 4 });
    }
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const R = Math.min(W, H) * .23;
    let fx, fy;
    if (mouse && t - lastMove < 2500) { fx = mouse.x; fy = mouse.y; }
    else { sweep += reduce ? 0 : .004; const u = (Math.sin(sweep) + 1) / 2; fx = W * (.15 + .7 * u); fy = H * (.5 + .25 * Math.sin(sweep * 1.7)); }
    // raster cells, hidden near the focus
    for (const cl of cells) {
      const d = Math.hypot(cl.x + cl.s / 2 - fx, cl.y + cl.s / 2 - fy), k = Math.min(1, Math.max(0, (d - R * .6) / (R * .5)));
      if (k <= 0) continue;
      ctx.fillStyle = `rgba(17,17,17,${.78 * cl.a * k})`;
      ctx.fillRect(cl.x + .5, cl.y + .5, cl.s - 1, cl.s - 1);
    }
    // vector outline, visible near the focus
    ctx.save(); ctx.beginPath(); ctx.arc(fx, fy, R, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = 'rgba(181,50,26,.08)'; ctx.fill(path);
    ctx.strokeStyle = 'rgba(181,50,26,.95)'; ctx.lineWidth = 2 * dpr; ctx.stroke(path);
    ctx.strokeStyle = 'rgba(181,50,26,.35)'; ctx.lineWidth = 1.2 * dpr; ctx.beginPath(); ctx.moveTo(...pts[0].p); ctx.quadraticCurveTo(pts[0].p[0] - (pts[0].p[0] - pts[2].p[0]) * .3, (pts[0].p[1] + pts[2].p[1]) / 2, ...pts[2].p); ctx.stroke();
    // anchors and handles
    for (const a of pts) {
      if (!a.h[0] && !a.h[1]) { ctx.fillStyle = '#fff'; ctx.strokeStyle = '#b5321a'; ctx.lineWidth = 1.5 * dpr; ctx.beginPath(); ctx.rect(a.p[0] - 3.5 * dpr, a.p[1] - 3.5 * dpr, 7 * dpr, 7 * dpr); ctx.fill(); ctx.stroke(); continue; }
      ctx.strokeStyle = 'rgba(181,50,26,.5)'; ctx.lineWidth = dpr;
      ctx.beginPath(); ctx.moveTo(a.p[0] - a.h[0], a.p[1] - a.h[1]); ctx.lineTo(a.p[0] + a.h[0], a.p[1] + a.h[1]); ctx.stroke();
      for (const [hx, hy] of [[a.p[0] - a.h[0], a.p[1] - a.h[1]], [a.p[0] + a.h[0], a.p[1] + a.h[1]]]) { ctx.fillStyle = '#b5321a'; ctx.beginPath(); ctx.arc(hx, hy, 2.4 * dpr, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#b5321a'; ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath(); ctx.rect(a.p[0] - 3.5 * dpr, a.p[1] - 3.5 * dpr, 7 * dpr, 7 * dpr); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
    // focus ring
    ctx.strokeStyle = 'rgba(181,50,26,.25)'; ctx.lineWidth = dpr; ctx.setLineDash([4 * dpr, 6 * dpr]);
    ctx.beginPath(); ctx.arc(fx, fy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    requestAnimationFrame(draw);
  }
  tile.addEventListener('pointermove', e => { const r = tile.getBoundingClientRect(); mouse = { x: (e.clientX - r.left) * dpr, y: (e.clientY - r.top) * dpr }; lastMove = performance.now(); });
  tile.addEventListener('pointerleave', () => { lastMove = 0; });
  new ResizeObserver(build).observe(tile);
  build(); requestAnimationFrame(draw);
})();

/* =================== v8: motion upgrade =================== */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; if (reduce) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- smooth <details> open/close ---- */
  document.querySelectorAll('.xp details').forEach(d => {
    const sum = d.querySelector('summary'), body = d.querySelector('.xp-body'); if (!sum || !body) return;
    sum.addEventListener('click', e => {
      e.preventDefault(); if (d.classList.contains('animating')) return;
      d.classList.add('animating');
      if (d.open) {
        const h = body.offsetHeight;
        body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = () => { d.open = false; d.classList.remove('animating'); };
      } else {
        d.open = true; const h = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.7,.2,1)' }).onfinish = () => d.classList.remove('animating');
      }
    });
  });

  if (!fine) return;

  /* ---- tilt + glare ---- */
  document.querySelectorAll('.pillar, .skill, .contact-card, .case a').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', (x * 100) + '%'); el.style.setProperty('--my', (y * 100) + '%');
      const lift = el.matches('.case a') ? 0 : -4;
      el.style.setProperty('--tilt', `perspective(900px) rotateX(${(.5 - y) * 6}deg) rotateY(${(x - .5) * 6}deg) translateY(${lift}px)`);
    });
    el.addEventListener('pointerleave', () => el.style.removeProperty('--tilt'));
  });

  /* ---- magnetic links ---- */
  document.querySelectorAll('.hero-links a, nav a, .more').forEach(a => {
    a.addEventListener('pointermove', e => { const r = a.getBoundingClientRect(); a.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`; });
    a.addEventListener('pointerleave', () => { a.style.transform = ''; });
  });


  /* ---- parallax on the network canvas ---- */
  const net = document.getElementById('net');
})();

/* ---- terminal: output lines type in one by one ---- */
(() => {
  const out = document.getElementById('term-out'); if (!out) return;
  const mo = new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
    if (n.nodeType !== 1 || n.classList.contains('cmd-line') || n.dataset.typed) return;
    n.dataset.typed = '1';
    const lines = n.innerHTML.split('\n'); if (lines.length < 2) { n.classList.add('line'); return; }
    n.innerHTML = lines.map((l, i) => `<div class="line" style="animation-delay:${i * 45}ms">${l || '&nbsp;'}</div>`).join('');
    n.style.whiteSpace = 'normal';
  })));
  mo.observe(out, { childList: true });
})();


/* ---- one section at a time: deck dots + keyboard stepping ---- */
(() => {
  if (!matchMedia('(min-width: 901px)').matches) return;
  const secs = [...document.querySelectorAll('main > .hero, main > .page-head, main > .section')]; if (secs.length < 2) return;
  secs.forEach((s, i) => { if (!s.id) s.id = 'sec-' + i; });
  const deck = document.createElement('nav'); deck.className = 'deck'; deck.setAttribute('aria-label', 'Sections');
  deck.innerHTML = secs.map(s => { const h = s.querySelector('h2'); const label = h ? h.textContent.replace(/^\d+\s*/, '').replace(/click a row.*|type help|all work →|how it works →/i, '').trim() : 'Top'; return `<a href="#${s.id}" aria-label="${label}"><span>${label}</span></a>`; }).join('');
  document.body.appendChild(deck);
  const dots = [...deck.children];
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) dots.forEach((d, i) => d.classList.toggle('on', secs[i] === e.target)); }), { rootMargin: '-45% 0px -45% 0px' });
  secs.forEach(s => io.observe(s));
  const HEAD = 80, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let busy = false, lastWheel = 0;
  const ease = t => 1 - Math.pow(1 - t, 4);
  function glideTo(y, dur = 480) {
    if (reduce) { scrollTo({ top: y, behavior: 'instant' }); return; }
    busy = true; const y0 = scrollY, t0 = performance.now(), dy = y - y0;
    (function step(t) {
      const k = Math.min(1, (t - t0) / dur); scrollTo({ top: Math.round(y0 + dy * ease(k)), behavior: 'instant' });
      if (k < 1) requestAnimationFrame(step);
      else (function release() { if (performance.now() - lastWheel < 160) return setTimeout(release, 60); busy = false; })();
    })(t0);
  }
  const topOf = s => s.getBoundingClientRect().top + scrollY - HEAD;
  const current = () => { let c = 0; secs.forEach((s, i) => { if (topOf(s) <= scrollY + 2) c = i; }); return c; };
  function go(i) { if (i < 0 || i >= secs.length) return; glideTo(Math.max(0, topOf(secs[i]))); }
  dots.forEach((d, i) => d.addEventListener('click', e => { e.preventDefault(); go(i); }));
  addEventListener('keydown', e => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    const cur = current();
    if (['ArrowDown', 'PageDown', 'j', ' '].includes(e.key) && !e.shiftKey) { e.preventDefault(); if (!busy) go(cur + 1); }
    if (['ArrowUp', 'PageUp', 'k'].includes(e.key) || (e.key === ' ' && e.shiftKey)) { e.preventDefault(); if (!busy) go(cur - 1); }
  });
  addEventListener('touchend', e => { if (ty0 === null || busy) return; const dy = ty0 - e.changedTouches[0].clientY; ty0 = null; if (Math.abs(dy) > 60) go(current() + (dy > 0 ? 1 : -1)); }, { passive: true });
})();


/* ---- nav bar: compact on scroll, gliding pill ---- */
(() => {
  const top = document.querySelector('.top'), secs = document.querySelector('.bar .sections'), glider = secs && secs.querySelector('.glider'); if (!top || !glider) return;
  const links = [...secs.querySelectorAll('a:not(.page)')];
  let hovering = null;
  const place = (el, hover) => {
    if (!el) { glider.classList.remove('on'); return; }
    const r = el.getBoundingClientRect(), b = secs.getBoundingClientRect();
    glider.style.left = (r.left - b.left) + 'px'; glider.style.width = r.width + 'px';
    glider.classList.add('on'); glider.classList.toggle('hover', !!hover);
    links.forEach(l => l.classList.toggle('peek', hover && l.classList.contains('active') && l !== el));
  };
  const active = () => links.find(l => l.classList.contains('active'));
  const sync = () => { top.classList.toggle('compact', scrollY > 60); if (!hovering) requestAnimationFrame(() => place(active(), false)); };
  links.forEach(l => {
    l.addEventListener('pointerenter', () => { hovering = l; place(l, !l.classList.contains('active')); });
    l.addEventListener('pointerleave', () => { hovering = null; place(active(), false); });
  });
  secs.addEventListener('transitionend', () => { if (!hovering) place(active(), false); });
  addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync); sync();
  setTimeout(sync, 500); setTimeout(sync, 1200);
})();
