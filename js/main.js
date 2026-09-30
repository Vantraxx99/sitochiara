/* Sito di Chiara Tangari
   1. carica i contenuti da /content/*.json (modificabili dall'area admin)
   2. li inserisce nelle pagine
   3. attiva animazioni e interazioni */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const CT = (window.CT = window.CT || {});

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const src = (p) => String(p || '').replace(/^\/+/, '');
  const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const CATS = { grafica: 'Grafica', eventi: 'Eventi' };
  const PAGES = { 'index.html': 'home', 'chi-sono.html': 'chi-sono', 'lavori.html': 'lavori', 'contatti.html': 'contatti' };

  /* ---------------- CONTENUTI ---------------- */
  const FILES = ['generale', 'home', 'chi-sono', 'lavori', 'contatti'];
  const load = (name) =>
    window.__CONTENT && window.__CONTENT[name]
      ? Promise.resolve(window.__CONTENT[name])
      : fetch('content/' + name + '.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));

  const ph = (i, extra = '') => `<span class="placeholder ph-${(i % 6) + 1} ${extra}"></span>`;
  const media = (url, alt, i) => (url ? `<img src="${esc(src(url))}" alt="${esc(alt)}" loading="lazy">` : ph(i));
  const photos = (w) => (Array.isArray(w.foto) ? w.foto : w.foto ? [w.foto] : []).filter(Boolean);
  const fill = (name, html) => $$(`[data-list="${name}"]`).forEach((el) => (el.innerHTML = html));

  function bind(C) {
    $$('[data-c]').forEach((el) => {
      const v = get(C, el.dataset.c);
      if (v != null && v !== '') el.textContent = v;
    });
    $$('[data-c-href]').forEach((el) => {
      const [path, prefix = ''] = el.dataset.cHref.split('|');
      const v = get(C, path);
      if (v) el.setAttribute('href', prefix + (prefix ? v : src(v)));
      else if (el.hasAttribute('data-hide-empty')) (el.closest('li') || el).hidden = true;
    });
    $$('[data-copy]').forEach((el) => (el.dataset.copyText = get(C, el.dataset.copy) || ''));
  }

  function render(C) {
    const G = C.generale || {}, H = C.home || {}, A = C['chi-sono'] || {}, L = C.lavori || {}, K = C.contatti || {};
    const works = Array.isArray(L.lavori) ? L.lavori : [];
    CT.works = works;

    // Home
    const words = (H.nastro || []).map((w, i) => `<span${i % 2 ? ' class="outline"' : ''}>${esc(w)}</span><i>✦</i>`).join('');
    fill('nastro', words + words);
    let feat = works.filter((w) => w.in_evidenza);
    if (!feat.length) feat = works;
    fill('featured', feat.slice(0, 3).map((w) => {
      const i = works.indexOf(w);
      return `<a class="feat reveal" href="lavori.html#${esc(w.categoria)}">
        <span class="feat-media" data-tilt>${media(photos(w)[0], w.titolo, i)}</span>
        <span class="feat-cap"><strong>${esc(w.titolo)}</strong><span>${esc(CATS[w.categoria] || '')}${w.dettaglio ? ' · ' + esc(w.dettaglio) : ''}</span></span>
      </a>`;
    }).join(''));

    // Chi sono
    fill('ritratto', A.foto ? media(A.foto, `Ritratto di ${G.nome || ''} ${G.cognome || ''}`, 0) : '<span class="placeholder ph-portrait"></span>');
    fill('cosa_faccio', (A.cosa_faccio || []).map((s) => `<li class="reveal"><strong>${esc(s.titolo)}</strong><em>${esc(s.area)}</em></li>`).join(''));
    fill('clienti', (A.clienti || []).map((n) => `<li class="reveal">${esc(n)}</li>`).join(''));
    fill('strumenti', (A.strumenti || []).map((n) => `<li>${esc(n)}</li>`).join(''));

    // Lavori
    fill('lavori', works.length ? works.map((w, i) => {
      const ph_ = photos(w);
      const imgs = ph_.length ? ph_.map((p, k) => media(p, `${w.titolo} — foto ${k + 1}`, i)).join('') : ph(i);
      return `<figure class="work reveal" data-cat="${esc(w.categoria)}" data-index="${i}">
        <button class="work-open" type="button" data-tilt aria-label="Apri ${esc(w.titolo)}">
          <span class="work-images">${imgs}</span>
          ${ph_.length > 1 ? `<span class="badge">${ph_.length} foto</span>` : ''}
          <span class="work-hover"><span>Apri</span></span>
        </button>
        <figcaption>
          <span class="w-meta"><b>${esc(CATS[w.categoria] || w.categoria || '')}</b>${w.anno ? `<span>${esc(w.anno)}</span>` : ''}</span>
          <strong>${esc(w.titolo)}</strong>
          ${w.dettaglio ? `<span>${esc(w.dettaglio)}</span>` : ''}
        </figcaption>
      </figure>`;
    }).join('') : '<p class="empty">Nessun lavoro ancora. Aggiungili dall\'area admin.</p>');

    // Contatti
    fill('disponibile_per', (K.disponibile_per || []).map((d) => `<li>${esc(d)}</li>`).join(''));
  }

  /* ---------------- TESTO LETTERA PER LETTERA ---------------- */
  function split(el) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const word = document.createElement('span');
            word.className = 'word';
            [...part].forEach((ch) => {
              const c = document.createElement('span');
              c.className = 'char';
              c.style.setProperty('--i', i++);
              c.textContent = ch;
              word.appendChild(c);
            });
            frag.appendChild(word);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    el.setAttribute('aria-label', el.textContent.trim().replace(/\s+/g, ' '));
    walk(el);
  }
  CT.replaySplit = (root = document) => {
    if (reduce) return;
    $$('[data-split]', root).forEach((el) => { el.classList.remove('split-play'); void el.offsetWidth; el.classList.add('split-play'); });
  };

  /* ---------------- COMPARSA ALLO SCROLL ---------------- */
  let revObs = null;
  function observeReveals() {
    const items = $$('.reveal:not(.in)');
    if (!('IntersectionObserver' in window) || reduce) { items.forEach((el) => el.classList.add('in')); return; }
    revObs = revObs || new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    items.forEach((el) => revObs.observe(el));
  }

  /* ---------------- SCHEDE 3D CHE SEGUONO IL MOUSE ---------------- */
  function initTilt() {
    if (!fine || reduce) return;
    let cur = null;
    const reset = (el) => { el.classList.remove('tilting'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); };
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest ? e.target.closest('[data-tilt]') : null;
      if (cur && cur !== el) reset(cur);
      cur = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.classList.add('tilting');
      el.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
      el.style.setProperty('--ry', ((x - 0.5) * 12).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    }, { passive: true });
    document.addEventListener('pointerleave', () => cur && reset(cur));
  }

  /* ---------------- CURSORE ---------------- */
  function initCursor() {
    if (!fine || reduce) return;
    const dot = document.createElement('div'), ring = document.createElement('div');
    dot.className = 'cursor-dot'; ring.className = 'cursor-ring';
    document.body.append(dot, ring);
    let mx = -100, my = -100, rx = mx, ry = my;
    addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
    document.addEventListener('pointerover', (e) => ring.classList.toggle('hover', !!e.target.closest('a,button,[data-tilt]')));
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ---------------- HEADER, MENU, NAVIGAZIONE ---------------- */
  const header = $('.site-header'), toggle = $('.nav-toggle'), nav = $('.nav'), curtain = $('.curtain');
  const onScroll = () => header && header.classList.toggle('scrolled', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const setMenu = (open) => {
    if (!nav) return;
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  toggle && toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav && nav.classList.contains('open')) setMenu(false); });

  CT.setActiveNav = (page) => $$('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.nav === page));
  CT.setActiveNav(document.body.dataset.page);

  $$('.year').forEach((el) => (el.textContent = new Date().getFullYear()));
  $$('.to-top').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }));

  CT.curtainOut = () => {
    if (!curtain) return;
    curtain.classList.remove('enter');
    curtain.style.animation = 'none';
    void curtain.offsetWidth;
    curtain.style.animation = '';
  };
  addEventListener('pageshow', (e) => { if (e.persisted) CT.curtainOut(); });

  const go = (href) => (window.SPA ? window.SPA.go(href) : (location.href = href));
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    const m = href.match(/^([\w-]+\.html)(?:#([\w-]+))?$/);
    if (!m || !PAGES[m[1]]) return;
    e.preventDefault();
    setMenu(false);
    if (PAGES[m[1]] === document.body.dataset.page) { // stessa pagina: niente sipario
      if (m[2] && CT.setFilter) CT.setFilter(m[2]);
      scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      return;
    }
    if (reduce || !curtain) return go(href);
    curtain.classList.add('enter');
    setTimeout(() => go(href), 620);
  });

  /* ---------------- LAVORI: FILTRI ---------------- */
  function initWorks() {
    const grid = $('[data-list="lavori"]');
    if (!grid) return;
    const count = $('.works-count');
    const items = () => $$('.work', grid);
    CT.setFilter = (f) => {
      if (!$(`.filters [data-filter="${f}"]`)) f = 'all';
      $$('.filters button').forEach((b) => { const on = b.dataset.filter === f; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
      let n = 0;
      items().forEach((w) => {
        const show = f === 'all' || w.dataset.cat === f;
        w.hidden = !show;
        if (show) { n++; w.classList.add('in'); w.classList.remove('pop'); void w.offsetWidth; if (!reduce) w.classList.add('pop'); }
      });
      if (count) count.textContent = n === 1 ? '1 lavoro' : n + ' lavori';
    };
    $$('.filters button').forEach((b) => b.addEventListener('click', () => CT.setFilter(b.dataset.filter)));
    CT.setFilter(location.hash.slice(1) || 'all');
    addEventListener('hashchange', () => CT.setFilter(location.hash.slice(1) || 'all'));
    initLightbox(grid, items);
  }

  /* ---------------- LAVORI: GALLERIA A SCHERMO INTERO ---------------- */
  function initLightbox(grid, items) {
    const lb = $('#lightbox');
    if (!lb) return;
    let list = [], cw = 0, ci = 0, lastFocus = null;
    const imgsOf = (w) => $$('.work-images > *', w);

    const showImage = (i) => {
      const imgs = imgsOf(list[cw]);
      ci = (i + imgs.length) % imgs.length;
      const box = $('.lb-media', lb);
      box.innerHTML = '';
      box.appendChild(imgs[ci].cloneNode(true));
      $$('.lb-thumbs button', lb).forEach((b, k) => b.classList.toggle('active', k === ci));
    };
    const showWork = (i) => {
      cw = (i + list.length) % list.length;
      const el = list[cw], w = CT.works[+el.dataset.index] || {}, imgs = imgsOf(el);
      $('.lb-meta', lb).textContent = [CATS[w.categoria], w.anno, w.dettaglio].filter(Boolean).join(' · ');
      $('.lb-title', lb).textContent = w.titolo || '';
      $('.lb-desc', lb).textContent = w.descrizione || '';
      const thumbs = $('.lb-thumbs', lb);
      thumbs.innerHTML = '';
      if (imgs.length > 1) imgs.forEach((im, k) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', 'Foto ' + (k + 1));
        b.appendChild(im.cloneNode(true));
        b.addEventListener('click', () => showImage(k));
        thumbs.appendChild(b);
      });
      $$('.lb-nav', lb).forEach((b) => (b.hidden = imgs.length < 2));
      $('.lb-works', lb).hidden = list.length < 2;
      showImage(0);
    };
    const open = (el) => {
      list = items().filter((w) => !w.hidden);
      lastFocus = document.activeElement;
      showWork(list.indexOf(el));
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      $('.lb-close', lb).focus();
    };
    const close = () => {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lastFocus && lastFocus.focus();
    };
    grid.addEventListener('click', (e) => { const b = e.target.closest('.work-open'); if (b) open(b.closest('.work')); });
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', () => showImage(ci - 1));
    $('.lb-next', lb).addEventListener('click', () => showImage(ci + 1));
    $('.lb-wprev', lb).addEventListener('click', () => showWork(cw - 1));
    $('.lb-wnext', lb).addEventListener('click', () => showWork(cw + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showImage(ci - 1);
      if (e.key === 'ArrowRight') showImage(ci + 1);
    });
    // swipe su telefono
    let sx = null;
    $('.lb-media', lb).addEventListener('touchstart', (e) => (sx = e.touches[0].clientX), { passive: true });
    $('.lb-media', lb).addEventListener('touchend', (e) => {
      if (sx == null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) showImage(ci + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* ---------------- COPIA EMAIL ---------------- */
  function initCopy() {
    $$('[data-copy]').forEach((b) => b.addEventListener('click', () => {
      const text = b.dataset.copyText;
      const done = () => { b.textContent = 'Copiato ✓'; setTimeout(() => (b.textContent = 'Copia indirizzo'), 1800); };
      const fallback = () => {
        const target = $('.mail span');
        if (!target) return;
        const r = document.createRange();
        r.selectNodeContents(target);
        const s = getSelection();
        s.removeAllRanges();
        s.addRange(r);
        b.textContent = 'Premi Ctrl+C per copiare';
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
    }));
  }

  /* ---------------- AVVIO ---------------- */
  initTilt();
  initCursor();
  Promise.all(FILES.map(load)).then((vals) => {
    const C = {};
    FILES.forEach((f, i) => (C[f] = vals[i] || {}));
    CT.content = C;
    bind(C);
    render(C);
    $$('[data-split]').forEach(split);
    CT.replaySplit();
    initWorks();
    initCopy();
    observeReveals();
    document.dispatchEvent(new Event('ct:ready'));
  });
})();
