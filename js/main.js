(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Anno nel footer */
  $('#year').textContent = new Date().getFullYear();

  /* Header: bordo quando si scorre */
  var header = $('.site-header');
  var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Menu mobile */
  var toggle = $('.nav-toggle'), nav = $('.nav');
  var setMenu = function (open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  };
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* Voce di menu attiva in base alla sezione */
  if ('IntersectionObserver' in window) {
    var links = $$('.nav a');
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { secObs.observe(s); });

    /* Comparsa morbida degli elementi */
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    $$('.reveal').forEach(function (el) { revObs.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* Filtri dei lavori */
  var works = $$('.work');
  $$('.filters button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      $$('.filters button').forEach(function (b) { b.classList.toggle('active', b === btn); });
      var f = btn.dataset.filter;
      works.forEach(function (w) { w.classList.toggle('hidden', f !== 'all' && w.dataset.cat !== f); });
    });
  });

  /* Lightbox: frecce = foto dello stesso lavoro, link in basso = altro lavoro */
  var lb = $('#lightbox'), cw = 0, ci = 0, lastFocus = null;
  var visible = function () { return works.filter(function (w) { return !w.classList.contains('hidden'); }); };
  var imagesOf = function (w) { return $$('.work-images > *', w); };

  function showImage(i) {
    var imgs = imagesOf(visible()[cw]);
    ci = (i + imgs.length) % imgs.length;
    var el = imgs[ci].cloneNode(true);
    var box = $('.lb-media', lb);
    box.innerHTML = '';
    box.appendChild(el);
    $$('.lb-thumbs button', lb).forEach(function (b, k) { b.classList.toggle('active', k === ci); });
  }
  function showWork(i) {
    var list = visible();
    if (!list.length) return;
    cw = (i + list.length) % list.length;
    var w = list[cw], imgs = imagesOf(w);
    $('.lb-title', lb).textContent = w.dataset.title || '';
    $('.lb-meta', lb).textContent = w.dataset.meta || '';
    $('.lb-desc', lb).textContent = w.dataset.desc || '';
    var thumbs = $('.lb-thumbs', lb);
    thumbs.innerHTML = '';
    if (imgs.length > 1) {
      imgs.forEach(function (im, k) {
        var b = document.createElement('button');
        b.setAttribute('aria-label', 'Foto ' + (k + 1));
        b.appendChild(im.cloneNode(true));
        b.addEventListener('click', function () { showImage(k); });
        thumbs.appendChild(b);
      });
    }
    $$('.lb-prev, .lb-next', lb).forEach(function (b) { b.hidden = imgs.length < 2; });
    $('.lb-works', lb).hidden = list.length < 2;
    showImage(0);
  }
  function open(i) {
    lastFocus = document.activeElement;
    showWork(i);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('.lb-close', lb).focus();
  }
  function close() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  works.forEach(function (w) {
    $('.work-open', w).addEventListener('click', function () { open(visible().indexOf(w)); });
  });
  $('.lb-close', lb).addEventListener('click', close);
  $('.lb-prev', lb).addEventListener('click', function () { showImage(ci - 1); });
  $('.lb-next', lb).addEventListener('click', function () { showImage(ci + 1); });
  $('.lb-wprev', lb).addEventListener('click', function () { showWork(cw - 1); });
  $('.lb-wnext', lb).addEventListener('click', function () { showWork(cw + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') showImage(ci - 1);
    if (e.key === 'ArrowRight') showImage(ci + 1);
  });
})();
