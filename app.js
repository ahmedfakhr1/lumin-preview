(function () {
  'use strict';
  var d = document.documentElement, body = document.body;
  var both = function (ar, en) { return '<span data-l="ar" lang="ar">' + ar + '</span><span data-l="en" lang="en">' + en + '</span>'; };

  /* language */
  function applyLang(l) {
    d.lang = l; d.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-alt-ar]').forEach(function (im) { im.alt = im.getAttribute('data-alt-' + l); });
    document.querySelectorAll('[data-aria-ar]').forEach(function (el) { el.setAttribute('aria-label', el.getAttribute('data-aria-' + l)); });
    var t = body.getAttribute('data-title-' + l); if (t) document.title = t;
    var m = document.querySelector('meta[name=description]'), ds = body.getAttribute('data-desc-' + l);
    if (m && ds) m.setAttribute('content', ds);
  }
  applyLang(d.lang === 'en' ? 'en' : 'ar');
  var lb = document.getElementById('lang');
  if (lb) lb.addEventListener('click', function () {
    var l = d.lang === 'ar' ? 'en' : 'ar';
    try { localStorage.setItem('lumin-lang', l); } catch (e) {}
    applyLang(l);
  });

  /* open now: Riyadh time (UTC+3). Sat to Thu 6 am to 2 am, Friday 1 pm to 2 am */
  function riyadh() {
    var r = new Date(Date.now() + 3 * 3600e3);
    return { day: r.getUTCDay(), min: r.getUTCHours() * 60 + r.getUTCMinutes() };
  }
  function status() {
    var n = riyadh(), start = n.day === 5 ? 780 : 360;
    var open = n.min < 120 || n.min >= start;
    var html = open ? both('*مفتوح الآن حتى 2 فجراً', '*open now, until 2 am')
      : (start === 780 ? both('*مغلق الآن، نفتح 1 ظهراً', '*closed now, opens 1 pm') : both('*مغلق الآن، نفتح 6 صباحاً', '*closed now, opens 6 am'));
    d.classList.toggle('is-open', open); d.classList.toggle('is-closed', !open);
    document.querySelectorAll('[data-status]').forEach(function (el) { el.innerHTML = html; });
    var sess = n.min < 120 ? (n.day + 6) % 7 : n.day;
    document.querySelectorAll('[data-days]').forEach(function (li) {
      if (li.getAttribute('data-days').split(',').indexOf(String(sess)) > -1) li.setAttribute('data-today', ''); else li.removeAttribute('data-today');
    });
    var h = document.getElementById('hello');
    if (h) {
      var hr = Math.floor(n.min / 60);
      h.innerHTML = hr >= 4 && hr < 12 ? both('صباحك يبدأ بنكهة تستاهلها… وجهتك الأولى Lumin', 'Your morning starts with a flavour you deserve. First stop: Lumin.')
        : both('مساء الخير، لومن ومضتك اليومية', (hr >= 12 && hr < 17 ? 'Good afternoon.' : 'Good evening.') + ' Lumin, your daily spark.');
    }
  }
  status(); setInterval(status, 60000);

  /* home: the header mark waits until the big mark has scrolled away */
  var hm = document.querySelector('.hero-mark');
  if (hm && 'IntersectionObserver' in window) {
    body.classList.add('hm');
    new IntersectionObserver(function (es) { body.classList.toggle('past', !es[0].isIntersecting); }, { rootMargin: '-60px 0px 0px 0px' }).observe(hm);
  }

  /* drawer */
  var dlg = document.getElementById('drawer'), burger = document.getElementById('burger');
  if (dlg && burger && dlg.showModal) {
    burger.addEventListener('click', function () { dlg.showModal(); burger.setAttribute('aria-expanded', 'true'); });
    dlg.addEventListener('close', function () { burger.setAttribute('aria-expanded', 'false'); });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg || e.target.closest('[data-close]') || e.target.closest('a')) dlg.close();
    });
  }

  /* menu chips: active section */
  var chips = document.querySelectorAll('.chips a');
  if (chips.length) {
    var bar = document.querySelector('.chips ul');
    var setActive = function (id) {
      chips.forEach(function (a) {
        var on = a.getAttribute('href') === '#' + id;
        if (on) {
          a.setAttribute('aria-current', 'true');
          if (bar) {
            var br = bar.getBoundingClientRect(), ar = a.getBoundingClientRect();
            if (ar.left < br.left + 8 || ar.right > br.right - 8) bar.scrollLeft += d.dir === 'rtl' ? ar.right - br.right + 16 : ar.left - br.left - 16;
          }
        }
        else a.removeAttribute('aria-current');
      });
    };
    chips.forEach(function (a) { a.addEventListener('click', function () { setActive(a.getAttribute('href').slice(1)); }); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
      }, { rootMargin: '-40% 0px -55% 0px' });
      document.querySelectorAll('.msec').forEach(function (s) { io.observe(s); });
    }
    setActive('hot');
  }

  /* reveal on scroll */
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!calm && 'IntersectionObserver' in window) {
    var els = document.querySelectorAll('.roast figure, .sw-ph, .sw-tx, .room-say, .room figure, .visit figure, .or-list li, .or-ph, .cotd figure, .card, .lead');
    if (els.length) {
      d.classList.add('rv');
      var ro = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px' });
      els.forEach(function (el, i) { el.setAttribute('data-rv', ''); el.style.transitionDelay = (i % 3) * 60 + 'ms'; ro.observe(el); });
    }
  }

  /* taps to count: nothing is sent until a counter is switched on at launch (window.LUMIN_COUNT) */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-event]');
    if (!t || typeof window.LUMIN_COUNT !== 'function') return;
    try { window.LUMIN_COUNT(t.getAttribute('data-event'), t.getAttribute('data-event-label') || '', location.pathname); } catch (err) {}
  }, true);
}());
