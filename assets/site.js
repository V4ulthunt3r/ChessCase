/* Page chrome (theme, nav edge, reveal), the finish switcher on the Duo,
   and the iPhone case demo: lift the clasp and the lid swings open around its hinge. */
(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');

  function paintIcon() {
    if (!icon) return;
    const dark = root.classList.contains('dark');
    icon.firstElementChild.setAttribute('href', 'assets/icons.svg' + (dark ? '#i-sun' : '#i-moon'));
    if (toggle) toggle.setAttribute('aria-pressed', String(dark));
  }
  paintIcon();
  if (toggle) {
    toggle.addEventListener('click', () => {
      root.classList.toggle('dark');
      try { localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light'); } catch (e) {}
      paintIcon();
    });
  }

  const nav = document.querySelector('.nav');
  const sentinel = document.getElementById('nav-top');
  if (nav && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => nav.classList.toggle('scrolled', !e.isIntersecting)).observe(sentinel);
  }

  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---- Finishes: each button swaps the board on the Duo. Images load on first use. ---- */
  document.querySelectorAll('[data-finishes]').forEach((stage) => {
    const screen = stage.querySelector('.screen');
    const name = stage.querySelector('[data-finish-name]');
    const sub = stage.querySelector('[data-finish-sub]');
    const metal = stage.querySelector('[data-finish-metal]');
    const proTag = stage.querySelector('[data-finish-pro]');
    const buttons = stage.querySelectorAll('[data-finish]');
    const shown = new Map();
    screen.querySelectorAll('img[data-key]').forEach((img) => shown.set(img.dataset.key, img));

    function show(btn) {
      const key = btn.dataset.finish;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      let img = shown.get(key);
      if (!img) {
        img = new Image();
        img.dataset.key = key;
        img.width = 1800; img.height = 1266;
        img.alt = btn.dataset.alt || '';
        img.src = btn.dataset.src;
        screen.appendChild(img);
        shown.set(key, img);
      }
      const reveal = () => shown.forEach((el, k) => el.classList.toggle('on', k === key));
      if (img.complete) reveal(); else img.addEventListener('load', reveal, { once: true });
      name.textContent = btn.dataset.name;
      sub.textContent = btn.dataset.sub;
      metal.textContent = btn.dataset.metal;
      if (proTag) proTag.hidden = !btn.dataset.pro;
    }
    buttons.forEach((btn) => btn.addEventListener('click', () => show(btn)));
  });

  /* ---- Case demo: the clasp opens the lid; the button closes it again. ---- */
  document.querySelectorAll('[data-case]').forEach((demo) => {
    const clasp = demo.querySelector('.clasp-hit');
    const btn = demo.querySelector('[data-case-toggle]');
    const hint = demo.querySelector('[data-hint]');
    const lid = demo.querySelector('.lid');
    function setOpen(open) {
      demo.classList.toggle('open', open);
      lid.setAttribute('aria-hidden', String(open));
      btn.setAttribute('aria-pressed', String(open));
      btn.textContent = open ? btn.dataset.close : btn.dataset.open;
      if (hint) hint.textContent = open ? hint.dataset.close : hint.dataset.open;
    }
    clasp.addEventListener('click', () => setOpen(true));
    btn.addEventListener('click', () => setOpen(!demo.classList.contains('open')));
  });

  /* ---- Platforms: iOS / Android. Config and the initial choice come from platforms.js. ---- */
  const cc = window.ChessCase;
  if (!cc) return;
  const lang = (root.lang || 'en').slice(0, 2) === 'de' ? 'de' : 'en';
  const t = cc.text[lang];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const svgIcon = (id) => `<svg class="ico" aria-hidden="true"><use href="assets/icons.svg#${id}"/></svg>`;

  /* Store badges: a link once the status allows it, a quiet "coming soon" plate before. */
  document.querySelectorAll('[data-store]').forEach((slot) => {
    const key = slot.dataset.store;
    const p = cc.platforms[key];
    if (!p) return;
    const { status, url } = cc.effectiveStatus(key);
    const lead = (p.lead && p.lead[lang] && p.lead[lang][status]) || t[status];
    const el = document.createElement(url ? 'a' : 'span');
    el.className = 'store-badge';
    if (slot.dataset.variant) el.dataset.variant = slot.dataset.variant;
    if (url) { el.href = url; el.rel = 'noopener'; }
    el.setAttribute('aria-label', `${lead} ${p.store}`);
    el.innerHTML = `${svgIcon(p.icon)}<span><small>${esc(lead)}</small><b>${esc(p.store)}</b></span>`;
    slot.replaceWith(el);
  });

  /* Facts under the call to action: devices, requirements, languages, status, version. */
  document.querySelectorAll('[data-facts]').forEach((list) => {
    const key = list.dataset.facts;
    const p = cc.platforms[key];
    if (!p) return;
    const { status } = cc.effectiveStatus(key);
    const rows = p.facts[lang].map(([ico, text]) => `<li class="pill">${svgIcon(ico)} ${esc(text)}</li>`);
    rows.push(`<li class="pill">${svgIcon('i-info')} ${esc(t.status[status])}${p.version ? ` · ${esc(t.version)} ${esc(p.version)}` : ''}</li>`);
    list.innerHTML = rows.join('');
  });

  /* Screenshot galleries, localised per page language. */
  document.querySelectorAll('[data-gallery]').forEach((list) => {
    const p = cc.platforms[list.dataset.gallery];
    if (!p || !p.gallery.length) return;
    const frame = list.dataset.frame || 'phone android';
    list.innerHTML = p.gallery.map((s) => `<li><figure>
      <div class="${esc(frame)}"><div class="screen"><img src="assets/img/${esc(list.dataset.gallery)}/${lang}/${esc(s.file)}" alt="${esc(s.alt[lang])}" width="${s.w}" height="${s.h}" loading="lazy" decoding="async"></div><span class="punch" aria-hidden="true"></span></div>
      <figcaption>${esc(s.caption[lang])}</figcaption></figure></li>`).join('');
  });

  /* Privacy links: the URL and the label ("pre-release" until the policy is final) come from the config. */
  document.querySelectorAll('[data-privacy]').forEach((a) => {
    const p = cc.platforms[a.dataset.privacy];
    if (!p) return;
    a.href = p.privacy[lang];
    if (a.hasAttribute('data-privacy-label')) a.textContent = (p.privacy.final ? t.privacyFinal : t.privacyDraft).replace('{name}', p.name);
  });

  const switches = document.querySelectorAll('[data-set-platform]');
  const live = document.getElementById('platform-live');
  const langLinks = document.querySelectorAll('a[data-keep-platform]');

  function paint(key) {
    switches.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setPlatform === key)));
    /* Language links carry the platform, so EN ↔ DE never loses the choice. */
    langLinks.forEach((a) => {
      const u = new URL(a.getAttribute('href'), location.href);
      u.searchParams.set('platform', key);
      a.setAttribute('href', u.pathname.split('/').pop() + u.search + u.hash);
    });
    /* Only the visible recording plays. */
    document.querySelectorAll('video[autoplay]').forEach((v) => {
      if (v.offsetParent === null) v.pause();
      else if (!matchMedia('(prefers-reduced-motion: reduce)').matches) v.play().catch(() => {});
    });
  }

  function choose(key, button) {
    if (!cc.platforms[key] || key === root.getAttribute('data-platform')) return;
    /* Keep the pressed switch where it is on screen, even if content above it changes height. */
    const before = button ? button.getBoundingClientRect().top : 0;
    root.setAttribute('data-platform', key);
    cc.current = key;
    try { localStorage.setItem('platform', key); } catch (e) {}
    try {
      const u = new URL(location.href);
      u.searchParams.set('platform', key);
      history.replaceState(history.state, '', u);
    } catch (e) {}
    paint(key);
    if (button) {
      const delta = button.getBoundingClientRect().top - before;
      if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'instant' });
    }
    if (live) live.textContent = t.announce.replace('{name}', cc.platforms[key].name);
  }

  switches.forEach((b) => b.addEventListener('click', () => choose(b.dataset.setPlatform, b)));
  paint(cc.current);
})();
