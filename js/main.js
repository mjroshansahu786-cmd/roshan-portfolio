/* ============================================================
   ROSHAN SAHU — PORTFOLIO INTERACTIONS
   Preloader · smooth scroll · reveals · tilt · cursor ·
   timecode HUD · lightbox · copy · form · counters · spy
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, ctx) { return (ctx || document).querySelector(s); };
  var $$ = function (s, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(s)); };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';

  if (hasST) {
    gsap.registerPlugin(ScrollTrigger);
  } else if (hasGsap) {
    // animated reveals disabled, rest still works
  }

  /* ---------------- YEAR ---------------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- GRAIN ---------------- */
  (function grain() {
    var g = $('#grain');
    if (!g) return;
    var c = document.createElement('canvas');
    c.width = 160; c.height = 160;
    var x = c.getContext('2d');
    var d = x.createImageData(160, 160);
    for (var i = 0; i < d.data.length; i += 4) {
      var v = Math.random() * 255;
      d.data[i] = v; d.data[i + 1] = v; d.data[i + 2] = v;
      d.data[i + 3] = Math.random() * 255;
    }
    x.putImageData(d, 0, 0);
    g.style.backgroundImage = 'url(' + c.toDataURL() + ')';
    g.style.backgroundSize = '160px 160px';
  })();

  /* ---------------- CURSOR ---------------- */
  (function cursor() {
    var el = $('#cursor');
    var label = $('#cursorLabel');
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    var x = -100, y = -100, tx = x, ty = y;
    window.addEventListener('pointermove', function (e) {
      tx = e.clientX; ty = e.clientY;
    }, { passive: true });
    (function loop() {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      requestAnimationFrame(loop);
    })();
    $$('[data-cursor]').forEach(function (n) {
      n.addEventListener('pointerenter', function () {
        if (label) label.textContent = n.getAttribute('data-cursor');
        el.classList.add('is-label');
      });
      n.addEventListener('pointerleave', function () {
        el.classList.remove('is-label');
      });
    });
  })();

  /* ---------------- TIMECODE HUD ---------------- */
  (function timecode() {
    var out = $('#timecode');
    if (!out) return;
    var start = performance.now();
    function fmt(n) { return (n < 10 ? '0' : '') + n; }
    function loop() {
      var ms = performance.now() - start;
      var f = Math.floor((ms / 1000) * 24) % 24;
      var s = Math.floor(ms / 1000) % 60;
      var m = Math.floor(ms / 60000) % 60;
      var h = Math.floor(ms / 3600000);
      var str = fmt(h) + ':' + fmt(m) + ':' + fmt(s) + ':' + fmt(f);
      if (out.textContent !== str) out.textContent = str;
      requestAnimationFrame(loop);
    }
    if (!reduced) requestAnimationFrame(loop);
  })();

  /* ---------------- PLAYHEAD PROGRESS ---------------- */
  (function playhead() {
    var bar = $('#playhead');
    if (!bar) return;
    function upd() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = p + '%';
    }
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  })();

  /* ---------------- NAV ---------------- */
  (function nav() {
    var navEl = $('#nav');
    var burger = $('#burger');
    var menu = $('#mobileMenu');

    function onScroll() {
      if (navEl) navEl.classList.toggle('scrolled', window.scrollY > 34);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = document.body.classList.toggle('menu-open');
        burger.setAttribute('aria-expanded', String(open));
        menu.setAttribute('aria-hidden', String(!open));
      });
      $$('#mobileMenu a').forEach(function (a) {
        a.addEventListener('click', function () {
          document.body.classList.remove('menu-open');
          burger.setAttribute('aria-expanded', 'false');
          menu.setAttribute('aria-hidden', 'true');
        });
      });
    }

    /* scroll spy */
    var links = $$('[data-spy]');
    if (links.length && 'IntersectionObserver' in window) {
      var map = {};
      links.forEach(function (l) { map[l.getAttribute('data-spy')] = l; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            links.forEach(function (l) { l.classList.remove('active'); });
            var l = map[en.target.id];
            if (l) l.classList.add('active');
          }
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      ['work', 'reel', 'services', 'clients', 'contact'].forEach(function (id) {
        var s = document.getElementById(id);
        if (s) io.observe(s);
      });
    }
  })();

  /* ---------------- SMOOTH SCROLL (Lenis) ---------------- */
  var lenis = null;
  (function smooth() {
    if (reduced || typeof window.Lenis === 'undefined') return;
    try {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      window.__lenis = lenis;
      if (hasST) lenis.on('scroll', ScrollTrigger.update);
      function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      /* if the tab was frozen for a while, resync Lenis to the true scroll position */
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden) {
          try { lenis.scrollTo(window.scrollY, { immediate: true, force: true }); } catch (e) {}
        }
      });
    } catch (e) { lenis = null; }
  })();

  /* anchor links */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -64, duration: 1.15 });
      } else {
        target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  /* ---------------- SPLIT TITLES ---------------- */
  $$('[data-split]').forEach(function (el) {
    if (el.classList.contains('split')) return;
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w) {
      var outer = document.createElement('span');
      outer.className = 'w';
      var inner = document.createElement('span');
      inner.className = 'wi';
      inner.textContent = w;
      outer.appendChild(inner);
      el.appendChild(outer);
      el.appendChild(document.createTextNode(' '));
    });
    el.classList.add('split');
  });

  /* ---------------- ANIMATED REVEALS ---------------- */
  if (hasST && !reduced) {
    $$('[data-reveal]').forEach(function (el) {
      gsap.from(el, {
        y: 38, opacity: 0, duration: 0.95, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
      });
    });
    $$('[data-split].split').forEach(function (el) {
      gsap.from(el.querySelectorAll('.wi'), {
        yPercent: 120, duration: 0.85, stagger: 0.035, ease: 'power4.out',
        scrollTrigger: { trigger: el, start: 'top 87%', toggleActions: 'play none none none' }
      });
    });
  } else {
    /* static fallback for counters**see below, reveals just show */
  }

  /* ---------------- COUNTERS ---------------- */
  (function counters() {
    var nums = $$('.stat-num');
    if (!nums.length) return;
    function finalText(el) {
      var v = el.getAttribute('data-count');
      var dec = v.indexOf('.') > -1 ? v.split('.')[1].length : 0;
      var n = parseFloat(v) || 0;
      return (dec ? n.toFixed(dec) : String(Math.round(n))) + (el.getAttribute('data-suffix') || '');
    }
    if (!hasGsap || reduced) {
      nums.forEach(function (el) { el.textContent = finalText(el); });
      return;
    }
    nums.forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count') || '0');
      var dec = (el.getAttribute('data-count').indexOf('.') > -1)
        ? el.getAttribute('data-count').split('.')[1].length : 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: function () {
          el.textContent = (dec ? obj.v.toFixed(dec) : String(Math.round(obj.v))) + suffix;
        }
      });
    });
  })();

  /* ---------------- 3D TILT (+ service glow) ---------------- */
  (function tilt() {
    if (window.matchMedia('(pointer: coarse)').matches || reduced) return;
    $$('[data-tilt]').forEach(function (card) {
      var raf = null;
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          card.style.transform =
            'perspective(900px) rotateX(' + ((0.5 - py) * 7).toFixed(2) + 'deg) rotateY(' +
            ((px - 0.5) * 9).toFixed(2) + 'deg) translateZ(4px)';
          card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        });
      });
      card.addEventListener('pointerleave', function () {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = '';
      });
    });
  })();

  /* ---------------- MAGNETIC BUTTONS ---------------- */
  (function magnet() {
    if (window.matchMedia('(pointer: coarse)').matches || reduced) return;
    $$('[data-magnet]').forEach(function (btn) {
      var span = btn.querySelector('span');
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        if (span) span.style.transform = 'translate(' + (dx * 0.22).toFixed(1) + 'px,' + (dy * 0.3).toFixed(1) + 'px)';
        if (hasGsap) gsap.to(btn, { x: dx * 0.18, y: dy * 0.18, duration: 0.4, ease: 'power3.out' });
      });
      btn.addEventListener('pointerleave', function () {
        if (span) span.style.transform = '';
        if (hasGsap) gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      });
    });
  })();

  /* ---------------- TOAST ---------------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2000);
  }

  /* ---------------- COPY TO CLIPBOARD ---------------- */
  $$('.copyable').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var val = btn.getAttribute('data-copy') || btn.textContent;
      function done() { toast('COPIED ✓'); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(done).catch(function () { legacy(); });
      } else { legacy(); }
      function legacy() {
        var ta = document.createElement('textarea');
        ta.value = val; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { toast('PRESS ⌘C'); }
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------------- WORK / REEL LIGHTBOX ---------------- */
  (function lightbox() {
    var lb = $('#lightbox');
    if (!lb) return;
    var lbPanel = $('.lb-panel', lb);
    var lbTitle = $('#lbTitle'), lbDesc = $('#lbDesc'), lbChips = $('#lbChips'),
        lbCat = $('#lbCat'), lbGhost = $('#lbGhost'), lbClose = $('#lbClose'),
        lbFrame = $('#lbFrame'), lbWatch = $('#lbWatch'), lbNote = $('#lbNote');
    var lastFocus = null;
    var CHANNEL_URL = 'https://www.youtube.com/@techielashorts/shorts';
    var IG_URL = 'https://www.instagram.com/roshan_sahu_official/';
    var NOTE_CHANNEL = 'FULL REEL & TRACK-RECORD PDF AVAILABLE ON REQUEST';
    var NOTE_VIDEO = 'REPRESENTATIVE EDIT FROM @TECHIELASHORTS — THE FULL FEED LIVES IN “REELS” ABOVE';
    var NOTE_IG = 'REEL CUT BY ROSHAN ON INSTAGRAM — SEE MORE VIA @ROSHAN_SAHU_OFFICIAL';
    var WATCH_YT = '▶ \u00A0WATCH ON YOUTUBE';
    var WATCH_IG = '▶ \u00A0WATCH ON INSTAGRAM';
    var watchSpan = lbWatch ? lbWatch.querySelector('span') : null;

    function open(card) {
      lastFocus = card;
      var ghost = card.querySelector('.ghost');
      var embed = card.getAttribute('data-embed');
      var vid = card.getAttribute('data-video');
      var fmt = card.getAttribute('data-fmt') || '';
      var views = card.getAttribute('data-views') || '';
      var cat = card.getAttribute('data-cat') || '';
      if (!card.getAttribute('data-desc') && views) {
        card.setAttribute('data-desc',
          'Real short cut for the @techielashorts feed — ' + views.toLowerCase() +
          (cat ? ' · ' + cat.toLowerCase() : '') + '. Hit watch for the actual upload.');
      }
      if (!card.getAttribute('data-chips') && views) {
        card.setAttribute('data-chips', [views, cat, '@TECHIELASHORTS'].filter(Boolean).join(','));
      }
      lbTitle.textContent = card.getAttribute('data-title') || '';
      lbDesc.textContent = card.getAttribute('data-desc') || '';
      lbCat.textContent = (card.getAttribute('data-cat') || '') + (card.getAttribute('data-fmt') ? ' · ' + card.getAttribute('data-fmt') : '');
      if (ghost && lbGhost) lbGhost.textContent = ghost.textContent;
      else if (lbGhost && (vid || embed)) lbGhost.textContent = 'PLAY';
      if (lbChips) {
        lbChips.innerHTML = '';
        (card.getAttribute('data-chips') || '').split(',').forEach(function (chip) {
          if (!chip) return;
          var s = document.createElement('span');
          s.textContent = chip.trim();
          lbChips.appendChild(s);
        });
      }
      if (embed && lbFrame) {
        /* Instagram reel embed (service cards) */
        lbFrame.src = embed;
        lb.classList.add('playing', 'frame-ig');
        if (lbNote) lbNote.textContent = card.getAttribute('data-note') || NOTE_IG;
        if (lbWatch) {
          lbWatch.href = card.getAttribute('data-link') || IG_URL;
          if (watchSpan) watchSpan.textContent = WATCH_IG;
        }
      } else if (vid && lbFrame) {
        lbFrame.src = 'https://www.youtube-nocookie.com/embed/' + vid +
          '?autoplay=1&rel=0&playsinline=1&modestbranding=1&iv_load_policy=3';
        lb.classList.add('playing');
        lb.classList.toggle('wide', fmt.indexOf('16:9') > -1);
        if (lbNote) lbNote.textContent = card.getAttribute('data-note') || NOTE_VIDEO;
        if (lbWatch) {
          lbWatch.href = card.getAttribute('data-watch') || ('https://www.youtube.com/shorts/' + vid);
          if (watchSpan) watchSpan.textContent = WATCH_YT;
        }
      } else {
        stopFrame();
        lb.classList.remove('playing', 'wide', 'frame-ig');
        if (lbNote) lbNote.textContent = card.getAttribute('data-note') || NOTE_CHANNEL;
        if (lbWatch) {
          lbWatch.href = CHANNEL_URL;
          if (watchSpan) watchSpan.textContent = WATCH_YT;
        }
      }
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
      if (lbClose) lbClose.focus();
    }
    function stopFrame() {
      /* about:blank actually navigates the iframe away and stops audio/video playback */
      if (lbFrame) lbFrame.src = 'about:blank';
    }
    function close() {
      stopFrame();
      lb.classList.remove('playing', 'wide', 'frame-ig');
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lenis) lenis.start();
      if (lastFocus) lastFocus.focus();
    }
    $$('button.work-card, button.reel-card, button.svc-card, button.best-card').forEach(function (card) {
      card.addEventListener('click', function () { open(card); });
    });
    lb.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-close')) { close(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('open')) close();
    });
    if (lbClose) {
      lbClose.addEventListener('click', close);
    }
    /* "HIRE ME" inside lightbox should also close it */
    $$('#lightbox a[data-close]').forEach(function (a) {
      a.addEventListener('click', function () { close(); });
    });
  })();

  /* ---------------- REEL STRIP DRAG SCROLL ---------------- */
  (function reelDrag() {
    var strip = $('#reelStrip');
    if (!strip || window.matchMedia('(pointer: coarse)').matches) return;
    var down = false, startX = 0, startLeft = 0, moved = 0;

    strip.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      down = true; startX = e.clientX; startLeft = strip.scrollLeft; moved = 0;
      strip.classList.add('dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > moved) moved = Math.abs(dx);
      strip.scrollLeft = startLeft - dx;
    });
    function up() {
      if (!down) return;
      down = false;
      setTimeout(function () { strip.classList.remove('dragging'); }, 80);
    }
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    /* if the pointer actually dragged, swallow the click so no lightbox opens.
       detail > 0 = real mouse click; keyboard/synthetic clicks (detail 0) pass. */
    strip.addEventListener('click', function (e) {
      if (moved > 6 && e.detail > 0) { e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);
  })();

  /* ---------------- CONTACT FORM (mailto) ---------------- */
  (function form() {
    var f = $('#contactForm');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = (f.elements.name.value || '').trim();
      var email = (f.elements.email.value || '').trim();
      var msg = (f.elements.message.value || '').trim();
      var subject = 'New project brief from ' + (name || 'a visitor');
      var body = 'Hi Roshan,\n\nName: ' + name + '\nEmail: ' + email + '\n\n' + msg + '\n';
      toast('OPENING YOUR MAIL APP…');
      window.location.href = 'mailto:mjroshansahu786@gmail.com?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  })();

  /* ---------------- PORTRAIT AUTO-DETECT ---------------- */
  (function portrait() {
    var slots = $$('[data-portrait]');
    if (!slots.length) return;
    var tries = ['assets/img/roshan.jpg', 'assets/img/roshan.png', 'assets/img/portrait.jpg', 'assets/img/me.jpg'];
    var i = 0;
    (function tryNext() {
      if (i >= tries.length) return;
      var probe = new Image();
      probe.onload = function () {
        slots.forEach(function (box) {
          if (box.querySelector('img')) return;
          var img = document.createElement('img');
          img.src = tries[i];
          img.alt = 'Roshan Sahu portrait';
          img.className = 'portrait-img';
          box.insertBefore(img, box.firstChild);
          box.classList.add('has-photo');
        });
      };
      probe.onerror = function () { i++; tryNext(); };
      probe.src = tries[i];
    })();
  })();

  /* ---------------- PRELOADER + HERO INTRO ---------------- */
  (function preloader() {
    var pre = $('#preloader');
    var count = $('#preCount');
    var bar = $('#preBar');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();

    function releaseLock() {
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }

    function runIntro() {
      if (!hasGsap || reduced) { runIntro = null; return; }
      var tl = gsap.timeline();
      tl.from('.ht-line', { yPercent: 118, duration: 1.05, stagger: 0.13, ease: 'power4.out' })
        .from('.hero-photo-wrap', { opacity: 0, scale: 0.92, duration: 0.8, ease: 'power3.out' }, '-=0.9')
        .from('.hero-kicker', { y: 20, opacity: 0, duration: 0.6 }, '-=0.65')
        .from('.hero-bio p', { y: 16, opacity: 0, duration: 0.55, stagger: 0.12 }, '-=0.5')
        .from('.hero-stat', { y: 14, opacity: 0, duration: 0.5, stagger: 0.09 }, '-=0.35')
        .from('.hero-chips .chip', { y: 12, opacity: 0, duration: 0.4, stagger: 0.05 }, '-=0.3')
        .from('.hero-cta .btn', { y: 16, opacity: 0, duration: 0.55, stagger: 0.08 }, '-=0.45')
        .from('.hud span', { opacity: 0, duration: 0.8, stagger: 0.05 }, '-=0.4')
        .from('.hero-foot', { opacity: 0, duration: 0.6 }, '-=0.5');
    }

    if (!pre || reduced) {
      if (pre) pre.classList.add('done');
      releaseLock();
      runIntro();
      return;
    }

    var seq = ['3', '2', '1'];
    var step = 0;
    if (bar) bar.style.width = '14%';
    var iv = setInterval(function () {
      step++;
      if (step < seq.length) {
        if (count) { count.textContent = seq[step]; }
        if (bar) bar.style.width = (14 + step * 33) + '%';
      } else {
        clearInterval(iv);
        if (bar) bar.style.width = '100%';
        setTimeout(function () {
          pre.classList.add('done');
          releaseLock();          /* unlock scroll even if the intro anim stalls */
          runIntro();
        }, 260);
      }
    }, 430);
    /* hard safety: never leave the page scroll-locked, whatever happens */
    setTimeout(releaseLock, 3800);
  })();
})();
