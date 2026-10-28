/* christianmccarthy.com — no dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------ nav ---- */
  var nav = document.getElementById('nav');
  var navList = document.getElementById('navList');
  var navToggle = document.getElementById('navToggle');
  var hero = document.getElementById('home');

  function closeMenu() {
    navList.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  navToggle.addEventListener('click', function () {
    var open = navList.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  navList.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // Show the bar once the hero is mostly scrolled past.
  if ('IntersectionObserver' in window && hero) {
    new IntersectionObserver(function (entries) {
      var past = entries[0].intersectionRatio < 0.35;
      nav.classList.toggle('is-visible', past);
      nav.classList.toggle('is-solid', past);
      if (!past) closeMenu();
    }, { threshold: [0, 0.35, 1] }).observe(hero);
  } else {
    nav.classList.add('is-visible', 'is-solid');
  }

  /* ------------------------------------------------------ scrollspy ---- */
  var links = Array.prototype.slice.call(navList.querySelectorAll('a[href^="#"]'));
  var targets = links
    .map(function (a) {
      var el = document.querySelector(a.getAttribute('href'));
      return el ? { link: a, el: el } : null;
    })
    .filter(Boolean);

  function spy() {
    var line = window.scrollY + (window.innerHeight * 0.35);
    var current = null;
    targets.forEach(function (t) {
      if (t.el.offsetTop <= line) current = t;
    });
    targets.forEach(function (t) {
      t.link.classList.toggle('is-active', t === current);
    });
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      spy();
      parallax();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', spy);
  spy();

  /* -------------------------------------------------------- parallax --- */
  var heroBg = document.getElementById('heroBg');
  var canParallax = heroBg && !reduceMotion && window.matchMedia('(min-width: 760px)').matches;

  function parallax() {
    if (!canParallax) return;
    var y = window.scrollY;
    if (y > window.innerHeight) return;
    heroBg.style.transform = 'scale(1.06) translate3d(0,' + (y * 0.18) + 'px,0)';
  }
  parallax();

  /* ---------------------------------------------------------- reveal --- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-in'); });
  } else {
    var ro = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(revealables, function (el) { ro.observe(el); });
  }

  /* ----------------------------------------------------------- modal --- */
  var modal = document.getElementById('projectModal');
  var modalBody = document.getElementById('modalBody');
  var modalTitle = document.getElementById('modalTitle');
  var cache = {};
  var lastFocus = null;

  function openProject(url, title) {
    lastFocus = document.activeElement;
    modalTitle.textContent = title || 'Project';
    modalBody.innerHTML = '<p style="color:#74838f">Loading…</p>';

    if (typeof modal.showModal === 'function') {
      modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }

    var render = function (html) {
      modalBody.innerHTML = html;
      modalBody.scrollTop = 0;
    };

    if (cache[url]) { render(cache[url]); return; }

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then(function (html) {
        cache[url] = html;
        render(html);
      })
      .catch(function () {
        render('<p>Sorry — that panel could not be loaded. ' +
               '<a href="' + url + '">Open it directly</a>.</p>');
      });
  }

  function closeProject() {
    if (typeof modal.close === 'function') modal.close();
    else modal.removeAttribute('open');
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-project]');
    if (trigger) {
      e.preventDefault();
      openProject(trigger.getAttribute('data-project'), trigger.getAttribute('data-title'));
      return;
    }
    // click on the backdrop area of the dialog
    if (e.target === modal) closeProject();
  });

  document.getElementById('modalClose').addEventListener('click', closeProject);

  modal.addEventListener('close', function () {
    modalBody.innerHTML = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });

  /* ------------------------------------------------------- ranes demo --- */
  // If the demo video has been exported, swap it in for the still image.
  var demo = document.getElementById('ranesDemo');
  if (demo && demo.getAttribute('data-video') && window.fetch) {
    var videoUrl = demo.getAttribute('data-video');
    fetch(videoUrl, { method: 'HEAD' })
      .then(function (r) {
        if (!r.ok) return;
        var still = demo.querySelector('img');
        var caption = demo.querySelector('figcaption');
        var video = document.createElement('video');
        video.controls = true;
        video.preload = 'metadata';
        video.setAttribute('playsinline', '');
        video.poster = demo.getAttribute('data-poster') || '';
        video.src = videoUrl;
        video.setAttribute('aria-label', 'Ranes product demo');
        if (still) demo.replaceChild(video, still);
        if (caption && demo.getAttribute('data-caption')) caption.textContent = demo.getAttribute('data-caption');
      })
      .catch(function () { /* keep the still image */ });
  }

  /* ------------------------------------------------------------ misc --- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Deep-link support: #project=projects/foo.html opens that panel.
  if (window.location.hash.indexOf('#project=') === 0) {
    var url = decodeURIComponent(window.location.hash.slice('#project='.length));
    var btn = document.querySelector('[data-project="' + url + '"]');
    if (btn) openProject(url, btn.getAttribute('data-title'));
  }
})();
