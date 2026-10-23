/* ============================================================
   ROSHAN SAHU — HERO 3D SCENE (Three.js r128)
   A draggable ring of "film frame" cards + drifting dust.
   Fails silently if WebGL / CDN is unavailable — page stays usable.
   ============================================================ */
(function () {
  'use strict';

  function boot() {
    if (typeof THREE === 'undefined') return;
    var canvas = document.getElementById('scene');
    if (!canvas) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isMobile = window.matchMedia('(max-width: 760px)').matches;

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    } catch (e) { return; }
    renderer.setClearColor(0x06070b, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x06070b, 7, 15.5);

    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.55, 10.6);

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    var key = new THREE.PointLight(0xff5c28, 1.35, 30);
    key.position.set(7, 4, 6);
    scene.add(key);
    var fill = new THREE.PointLight(0x22d3ee, 0.8, 30);
    fill.position.set(-8, -2, 5);
    scene.add(fill);

    /* ---------- film-frame ring ---------- */
    var ring = new THREE.Group();
    scene.add(ring);

    var titles = ['SHORT-FORM', 'REELS', 'AI AVATAR', 'SOCIAL MEDIA', 'ADVERTISING', 'EXPLAINERS',
                  'BRAND FILMS', 'MOTION GFX', 'SOUND DESIGN', 'COLOR GRADE', 'CAPTIONS', 'DELIVERY'];
    var palette = ['#ff5c28', '#8b5cf6', '#22d3ee', '#3b82f6', '#f59e0b', '#ec4899'];

    function makeTexture(title, i) {
      var c = document.createElement('canvas');
      c.width = 512; c.height = 320;
      var g = c.getContext('2d');
      var colA = palette[i % palette.length];
      var grd = g.createLinearGradient(0, 0, 512, 320);
      grd.addColorStop(0, colA);
      grd.addColorStop(0.55, '#141824');
      grd.addColorStop(1, '#0a0c13');
      g.fillStyle = grd;
      g.fillRect(0, 0, 512, 320);

      // scanlines
      g.fillStyle = 'rgba(255,255,255,0.05)';
      for (var y = 0; y < 320; y += 6) { g.fillRect(0, y, 512, 1); }

      // frame border
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = 4;
      g.strokeRect(10, 10, 492, 300);

      // film sprockets
      g.fillStyle = 'rgba(255,255,255,0.30)';
      for (var s = 22; s < 500; s += 34) {
        g.fillRect(s, 20, 16, 10);
        g.fillRect(s, 290, 16, 10);
      }

      // title
      g.fillStyle = '#ffffff';
      g.font = '700 46px "Space Grotesk", Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(title, 256, 150);

      // meta
      g.font = '500 18px "JetBrains Mono", monospace';
      g.fillStyle = 'rgba(255,255,255,0.72)';
      g.fillText('ROSHPROD · 24FPS', 256, 196);

      g.textAlign = 'left';
      g.fillStyle = 'rgba(255,255,255,0.5)';
      g.fillText('TC 00:00:' + pad(i), 26, 262);
      g.textAlign = 'right';
      g.fillText('HD', 486, 262);

      function pad(n) { return (n < 10 ? '0' : '') + n; }

      var tex = new THREE.CanvasTexture(c);
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;
      return tex;
    }

    var RADIUS = 5.1;
    var N = titles.length;
    var cards = [];
    for (var i = 0; i < N; i++) {
      var ang = (i / N) * Math.PI * 2;
      var tex = makeTexture(titles[i], i);
      var card = new THREE.Mesh(
        new THREE.PlaneGeometry(2.9, 1.81),
        new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true })
      );
      card.position.set(Math.sin(ang) * RADIUS, 0, Math.cos(ang) * RADIUS);
      card.rotation.y = ang;
      card.userData = { baseY: 0, phase: i * 0.62 };
      ring.add(card);
      cards.push(card);
    }
    ring.rotation.x = -0.14;

    /* ---------- floor rings ---------- */
    function floorRing(radius) {
      var pts = [];
      for (var a = 0; a <= 64; a++) {
        var th = (a / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.sin(th) * radius, -2.6, Math.cos(th) * radius));
      }
      var geo = new THREE.BufferGeometry().setFromPoints(pts);
      var mat = new THREE.LineBasicMaterial({ color: 0x303747, transparent: true, opacity: 0.55 });
      return new THREE.Line(geo, mat);
    }
    scene.add(floorRing(RADIUS));
    scene.add(floorRing(RADIUS + 1.4));

    /* ---------- dust particles ---------- */
    var COUNT = isMobile ? 260 : 620;
    var positions = new Float32Array(COUNT * 3);
    var speeds = new Float32Array(COUNT);
    for (var p = 0; p < COUNT; p++) {
      positions[p * 3] = (Math.random() - 0.5) * 22;
      positions[p * 3 + 1] = (Math.random() - 0.5) * 11;
      positions[p * 3 + 2] = (Math.random() - 0.5) * 14;
      speeds[p] = 0.06 + Math.random() * 0.16;
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var pMat = new THREE.PointsMaterial({
      color: 0xffbfa0, size: 0.035, transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    });
    var particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    /* ---------- interaction ---------- */
    var dragging = false, lastX = 0, dragVel = 0, autoSpeed = 0.0022;
    var mouseX = 0, mouseY = 0, tParX = 0, tParY = 0;

    var hero = document.querySelector('.hero');
    function onDown(e) { dragging = true; lastX = e.clientX; }
    function onMove(e) {
      if (dragging) {
        var dx = e.clientX - lastX;
        lastX = e.clientX;
        dragVel = dx * 0.0042;
        ring.rotation.y += dragVel;
      }
    }
    function onUp() { dragging = false; }
    function onMouse(e) {
      tParX = (e.clientX / window.innerWidth - 0.5);
      tParY = (e.clientY / window.innerHeight - 0.5);
    }
    if (hero) {
      hero.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMouse);
      window.addEventListener('pointerup', onUp);
    }

    /* ---------- resize ---------- */
    function resize() {
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    /* ---------- render only when visible ---------- */
    var visible = true;
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }, { threshold: 0 }).observe(hero || document.body);
    }
    document.addEventListener('visibilitychange', function () { visible = !document.hidden && visible; });

    var clock = new THREE.Clock();
    var t = 0;

    function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;

      var dt = Math.min(clock.getDelta(), 0.05);
      t += dt;

      if (!dragging) {
        dragVel *= 0.94;
        ring.rotation.y += autoSpeed + dragVel;
      }

      for (var i = 0; i < cards.length; i++) {
        var c = cards[i];
        c.position.y = c.userData.baseY + Math.sin(t * 0.8 + c.userData.phase) * 0.14;
        c.rotation.x = Math.sin(t * 0.7 + c.userData.phase) * 0.06;
      }

      // particles drift upward
      var pos = pGeo.attributes.position.array;
      for (var q = 0; q < COUNT; q++) {
        pos[q * 3 + 1] += speeds[q] * dt;
        if (pos[q * 3 + 1] > 5.5) pos[q * 3 + 1] = -5.5;
      }
      pGeo.attributes.position.needsUpdate = true;

      // parallax
      mouseX += (tParX - mouseX) * 0.045;
      mouseY += (tParY - mouseY) * 0.045;
      camera.position.x = mouseX * 1.15;
      camera.position.y = 0.55 - mouseY * 0.7;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    }

    if (reduced) {
      // one static, good-looking frame
      ring.rotation.y = 0.6;
      particles.visible = false;
      renderer.render(scene, camera);
    } else {
      frame();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
