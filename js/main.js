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

  /* Lightbox */
  var lb = $('#lightbox'), current = 0, lastFocus = null;
  var visible = function () { return works.filter(function (w) { return !w.classList.contains('hidden'); }); };

  function show(i) {
    var list = visible();
    if (!list.length) return;
    current = (i + list.length) % list.length;
    var w = list[current];
    var media = $('.work-open', w).firstElementChild.cloneNode(true);
    media.classList.remove('reveal');
    var box = $('.lb-media', lb);
    box.innerHTML = '';
    if (w.dataset.full && media.tagName === 'IMG') media.src = w.dataset.full;
    box.appendChild(media);
    $('.lb-title', lb).textContent = w.dataset.title || '';
    $('.lb-meta', lb).textContent = w.dataset.meta || '';
    $('.lb-desc', lb).textContent = w.dataset.desc || '';
  }
  function open(i) {
    lastFocus = document.activeElement;
    show(i);
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
  $('.lb-prev', lb).addEventListener('click', function () { show(current - 1); });
  $('.lb-next', lb).addEventListener('click', function () { show(current + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
})();
