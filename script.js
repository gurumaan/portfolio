/* ==========================================================================
   GURSHARAN SINGH — PORTFOLIO RUNTIME ENGINE (DELUXE WORKSHOP EDITION)
   Harmonic Pendulum Physics · 3D Tilt · Synthesized Audio · Verlet Chain · Desk Lamp
   ========================================================================== */

(function () {
  'use strict';

  // Respect user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------------
     1. NATIVE SYNTHESIZED WEB AUDIO ENGINE (Zero external sound files!)
     -------------------------------------------------------------------------- */
  let audioCtx = null;
  let isSoundEnabled = localStorage.getItem('guru_sound_enabled') !== 'false';

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Wooden tock click (pins, buttons, tabs)
  function playTock() {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  }

  // Soft paper rustle (card tilt, sheet hover)
  function playRustle() {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const bufferSize = ctx.sampleRate * 0.035;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 1.2;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  }

  // Deep rubber stamp thud (copy to clipboard, send email)
  function playStamp() {
    if (!isSoundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }

  /* --------------------------------------------------------------------------
     TORN-PAPER TOAST NOTIFICATION HELPER
     -------------------------------------------------------------------------- */
  function showToast(message) {
    const toast = document.getElementById('paperToast');
    const toastMsg = document.getElementById('toastMessage');
    if (!toast) return;
    playStamp();
    if (toastMsg) toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function () {
      toast.classList.remove('show');
    }, 3400);
  }

  /* --------------------------------------------------------------------------
     2. HANGING DESK LAMP PULL CHAIN (VERLET PHYSICS ENGINE)
     Handcrafted brass ball chain with multi-node harmonic pendulum physics,
     ambient room air currents, touch/hover impulse ("chune pe jhule"),
     drag-and-release spring recoil ("chodne pe jhule"), wide-canvas zero-clipping,
     turned walnut & solid brass acorn handle, hanging manila tag, and dual-stage audio.
     -------------------------------------------------------------------------- */
  function initLampPhysicsCord() {
    const wrap = document.getElementById('lampPhysicsWrap');
    const canvas = document.getElementById('lampPhysicsCanvas');
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMidnight = localStorage.getItem('guru_lamp_mode') === 'midnight' ||
                     localStorage.getItem('guru_lamp_mode') === 'true';
    if (isMidnight) {
      document.body.classList.add('midnight-mode');
    } else {
      document.body.classList.remove('midnight-mode');
    }

    // Canvas roundRect compatibility polyfill
    if (!ctx.roundRect) {
      ctx.roundRect = function (x, y, w, h, radii) {
        const r = Array.isArray(radii) ? radii[0] : (radii || 0);
        this.beginPath();
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        this.closePath();
        return this;
      };
    }

    // Canvas dimensions & High DPI handling
    // Generous canvas width (520px) guarantees the chain can swing wide to the left without clipping
    let width = 520;
    let height = 720;
    let dpr = window.devicePixelRatio || 1;
    let mountX = width - 85;
    const mountY = 12;

    function resizeCanvas() {
      const isMobile = window.innerWidth <= 820;
      width = isMobile ? 350 : 520;
      height = isMobile ? 560 : 720;
      wrap.style.width = width + 'px';
      wrap.style.height = height + 'px';
      wrap.style.right = '0px';
      wrap.style.top = '0px';

      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      mountX = isMobile ? width - 55 : width - 85;
      if (typeof points !== 'undefined' && points.length > 0) {
        points[0].x = mountX;
        points[0].y = mountY;
      }
    }

    // Physics Chain Configuration
    const isMobile = window.innerWidth <= 820;
    const NUM_POINTS = isMobile ? 22 : 30;
    const totalLength = isMobile ? 300 : 450;
    const segLen = totalLength / (NUM_POINTS - 1);
    const GRAVITY = 0.44;
    const DAMPING = 0.985;
    const CONSTRAINT_ITERS = 16;

    const points = [];
    for (let i = 0; i < NUM_POINTS; i++) {
      points.push({
        x: mountX,
        y: mountY + i * segLen,
        oldX: mountX,
        oldY: mountY + i * segLen,
        pinned: i === 0
      });
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Pointer Interaction State
    let isDragging = false;
    let dragStartTime = 0;
    let lastPointerX = mountX;
    let lastPointerY = mountY;
    let pointerVx = 0;
    let pointerVy = 0;
    let hasTriggeredInDrag = false;
    let isNearInteractive = false;

    // Dual-stage mechanical tungsten lamp switch sound
    function playSwitchSnap() {
      if (!isSoundEnabled) return;
      try {
        const actx = getAudioContext();
        if (!actx) return;
        const t = actx.currentTime;

        // Stage 1: Sharp metallic toggle snap (1900Hz -> 320Hz)
        const osc1 = actx.createOscillator();
        const gain1 = actx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(1900, t);
        osc1.frequency.exponentialRampToValueAtTime(320, t + 0.022);
        gain1.gain.setValueAtTime(0.26, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
        osc1.connect(gain1);
        gain1.connect(actx.destination);
        osc1.start(t);
        osc1.stop(t + 0.025);

        // Stage 2: Heavy copper / brass contact thud (260Hz -> 65Hz)
        const osc2 = actx.createOscillator();
        const gain2 = actx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(260, t + 0.012);
        osc2.frequency.exponentialRampToValueAtTime(65, t + 0.065);
        gain2.gain.setValueAtTime(0.28, t + 0.012);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
        osc2.connect(gain2);
        gain2.connect(actx.destination);
        osc2.start(t + 0.012);
        osc2.stop(t + 0.07);
      } catch (e) {}
    }

    // Toggle lighting mode
    function toggleDeskLamp() {
      playSwitchSnap();
      isMidnight = !document.body.classList.contains('midnight-mode');
      if (isMidnight) {
        document.body.classList.add('midnight-mode');
        localStorage.setItem('guru_lamp_mode', 'midnight');
        showToast('💡 Desk Lamp ON · Midnight Coding Session');
      } else {
        document.body.classList.remove('midnight-mode');
        localStorage.setItem('guru_lamp_mode', 'daylight');
        showToast('☀️ Desk Lamp OFF · Natural Daylight Studio');
      }
    }

    // Screen to canvas coordinate conversion
    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }

    // Hit-testing handle, tag, and chain
    function testHit(cx, cy) {
      const last = points[points.length - 1];
      // Check acorn handle at bottom (including 44px body height)
      const distToHandle = Math.hypot(cx - last.x, cy - (last.y + 22));
      if (distToHandle < 38) return { type: 'handle', index: points.length - 1 };

      // Check tag near handle
      const distToTag = Math.hypot(cx - (last.x + 42), cy - (last.y + 20));
      if (distToTag < 36) return { type: 'handle', index: points.length - 1 };

      // Check along chain nodes
      for (let i = 1; i < points.length; i++) {
        const p = points[i];
        const dist = Math.hypot(cx - p.x, cy - p.y);
        if (dist < 28) return { type: 'chain', index: i };
      }
      return null;
    }

    // Pointer move listener
    window.addEventListener('pointermove', function (e) {
      const coords = getCanvasCoords(e);
      pointerVx = coords.x - lastPointerX;
      pointerVy = coords.y - lastPointerY;
      lastPointerX = coords.x;
      lastPointerY = coords.y;

      if (isDragging) {
        const last = points[points.length - 1];
        const naturalRestY = mountY + totalLength;
        const maxY = height - 48;
        // Strict safe boundary clamping - ZERO CLIPPING GUARANTEE!
        const targetX = Math.min(Math.max(coords.x, 20), width - 20);
        const targetY = Math.min(Math.max(coords.y - 18, mountY + 60), maxY);

        last.x = targetX;
        last.y = targetY;

        const pullDelta = last.y - naturalRestY;
        if (pullDelta > 38 && !hasTriggeredInDrag) {
          hasTriggeredInDrag = true;
          playTock(); // click resistance feedback
        }
        return;
      }

      // Touch / Hover interaction ("chune pe eder uder jhule")
      const hit = testHit(coords.x, coords.y);
      if (hit) {
        isNearInteractive = true;
        document.body.style.cursor = hit.type === 'handle' ? 'grab' : 'pointer';

        // Impart natural kinetic impulse to nearby nodes
        for (let i = 1; i < points.length; i++) {
          const p = points[i];
          const dist = Math.hypot(coords.x - p.x, coords.y - p.y);
          if (dist < 38) {
            const force = (1 - dist / 38);
            const pushX = (pointerVx * 0.45 + (p.x >= coords.x ? 2.8 : -2.8)) * force;
            const pushY = (pointerVy * 0.22) * force;
            p.x += pushX;
            p.y += pushY;
          }
        }
      } else {
        if (isNearInteractive) {
          isNearInteractive = false;
          document.body.style.cursor = '';
        }
      }
    });

    // Pointer down listener
    window.addEventListener('pointerdown', function (e) {
      const coords = getCanvasCoords(e);
      const hit = testHit(coords.x, coords.y);
      if (hit) {
        e.preventDefault();
        isDragging = true;
        hasTriggeredInDrag = false;
        dragStartTime = Date.now();
        document.body.style.cursor = 'grabbing';
        playTock();
      }
    });

    // Pointer up listener ("chodne pe eder uder jhule")
    window.addEventListener('pointerup', function () {
      if (!isDragging) return;
      isDragging = false;
      document.body.style.cursor = '';

      const last = points[points.length - 1];
      const naturalRestY = mountY + totalLength;
      const pullDelta = last.y - naturalRestY;
      const elapsed = Date.now() - dragStartTime;

      // Pulled past threshold or quick-clicked on handle
      if (pullDelta > 28 || (elapsed < 300 && Math.abs(pullDelta) < 26)) {
        toggleDeskLamp();

        // Recoil upward snap
        const recoilForce = Math.max(pullDelta * 0.9, 46);
        last.oldY = last.y + recoilForce;

        // Dynamic lateral kick so it swings left and right with high energy ("eder uder jhule")
        const lateralKick = (last.x - mountX) * 0.85 + (Math.random() > 0.5 ? 20 : -20);
        last.oldX = last.x - lateralKick;

        // Ripple impulse through chain segments
        for (let i = points.length - 2; i > points.length - 12 && i > 0; i--) {
          points[i].oldY = points[i].y + recoilForce * 0.5;
          points[i].oldX = points[i].x - lateralKick * 0.45;
        }
      } else {
        // Natural release with momentum
        last.oldX = last.x - pointerVx * 0.7;
        last.oldY = last.y - pointerVy * 0.7;
      }
    });

    // Main Physics & Render Loop
    let animTime = 0;

    function updatePhysics() {
      animTime += 16;

      // 1. Verlet Integration
      for (let i = 1; i < points.length; i++) {
        const p = points[i];
        if (isDragging && i === points.length - 1) continue;

        // Gentle ambient room air currents
        const breeze = Math.sin(animTime * 0.0014 + i * 0.22) * 0.048;

        const vx = (p.x - p.oldX) * DAMPING + breeze;
        const vy = (p.y - p.oldY) * DAMPING;

        p.oldX = p.x;
        p.oldY = p.y;

        p.x += vx;
        p.y += vy + GRAVITY;

        // ABSOLUTE CANVAS SAFE BOUNDARY — ZERO CLIPPING GUARANTEED!
        p.x = Math.max(16, Math.min(width - 16, p.x));
        p.y = Math.max(mountY, Math.min(height - 24, p.y));
      }

      // 2. Distance Constraints (Relaxation)
      for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);
          if (dist === 0) continue;

          const diff = (dist - segLen) / dist;

          if (p1.pinned) {
            p2.x -= dx * diff;
            p2.y -= dy * diff;
          } else if (isDragging && i + 1 === points.length - 1) {
            p1.x += dx * diff;
            p1.y += dy * diff;
          } else {
            p1.x += dx * diff * 0.5;
            p1.y += dy * diff * 0.5;
            p2.x -= dx * diff * 0.5;
            p2.y -= dy * diff * 0.5;
          }
        }
      }
    }

    // Draw Routine
    function draw() {
      ctx.clearRect(0, 0, width, height);

      // 1. Ceiling Brass Mount / Escutcheon
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 9;
      ctx.shadowOffsetY = 3;

      const flangeGrad = ctx.createLinearGradient(mountX - 18, 0, mountX + 18, 0);
      flangeGrad.addColorStop(0, '#593b12');
      flangeGrad.addColorStop(0.2, '#c99a41');
      flangeGrad.addColorStop(0.5, '#fae08f');
      flangeGrad.addColorStop(0.8, '#c99a41');
      flangeGrad.addColorStop(1, '#442b0c');

      ctx.fillStyle = flangeGrad;
      ctx.beginPath();
      ctx.roundRect(mountX - 18, 0, 36, 11, [0, 0, 7, 7]);
      ctx.fill();

      // Central eyelet bushing bell
      const eyeletGrad = ctx.createLinearGradient(mountX - 6, 11, mountX + 6, 18);
      eyeletGrad.addColorStop(0, '#ffd875');
      eyeletGrad.addColorStop(0.6, '#94661c');
      eyeletGrad.addColorStop(1, '#3b2508');
      ctx.fillStyle = eyeletGrad;
      ctx.beginPath();
      ctx.roundRect(mountX - 6, 11, 12, 7, [0, 0, 4, 4]);
      ctx.fill();

      // Screws
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#3a250b';
      ctx.beginPath();
      ctx.arc(mountX - 11, 5.5, 1.4, 0, Math.PI * 2);
      ctx.arc(mountX + 11, 5.5, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Brass Ball Chain Connecting Wire Core
      ctx.save();
      ctx.strokeStyle = '#3d2507';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.restore();

      // 3. 3D Spherical Brass Beads along chain
      const beadRadius = 3.6;
      const beadSpacing = 7.5;
      let remainingDist = 0;
      const beadPositions = [];

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const segD = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        if (segD === 0) continue;

        let d = remainingDist;
        while (d < segD) {
          const t = d / segD;
          beadPositions.push({
            x: p1.x + (p2.x - p1.x) * t,
            y: p1.y + (p2.y - p1.y) * t
          });
          d += beadSpacing;
        }
        remainingDist = d - segD;
      }

      ctx.save();
      for (let i = 0; i < beadPositions.length; i++) {
        const bp = beadPositions[i];
        if (bp.y < 14) continue;

        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
        ctx.shadowBlur = 3.5;
        ctx.shadowOffsetX = 1.2;
        ctx.shadowOffsetY = 2;

        const beadGrad = ctx.createRadialGradient(
          bp.x - 1.2, bp.y - 1.2, 0.4,
          bp.x, bp.y, beadRadius
        );
        beadGrad.addColorStop(0, '#ffffff'); // bright specular pinpoint
        beadGrad.addColorStop(0.25, '#fae69e'); // golden gleam
        beadGrad.addColorStop(0.65, '#d49b2f'); // warm brass body
        beadGrad.addColorStop(0.9, '#8c5916'); // shadow rim
        beadGrad.addColorStop(1, '#4a2d0a'); // deep crease

        ctx.fillStyle = beadGrad;
        ctx.beginPath();
        ctx.arc(bp.x, bp.y, beadRadius, 0, Math.PI * 2);
        ctx.fill();

        // Subtle dark hole where wire enters/exits
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = 'rgba(40, 22, 5, 0.4)';
        ctx.beginPath();
        ctx.arc(bp.x, bp.y - beadRadius * 0.7, 0.7, 0, Math.PI * 2);
        ctx.arc(bp.x, bp.y + beadRadius * 0.7, 0.7, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
      ctx.restore();

      // 4. Turned Hardwood Walnut & Solid Brass Acorn Handle
      const last = points[points.length - 1];
      const prev = points[points.length - 2];
      const angle = Math.atan2(last.y - prev.y, last.x - prev.x) - Math.PI / 2;

      ctx.save();
      ctx.translate(last.x, last.y);
      ctx.rotate(angle);

      // Handle Drop Shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 7;

      // Top Brass Collar / Ferrule
      const collarGrad = ctx.createLinearGradient(-7, 0, 7, 0);
      collarGrad.addColorStop(0, '#664212');
      collarGrad.addColorStop(0.25, '#dca946');
      collarGrad.addColorStop(0.5, '#fff0a6');
      collarGrad.addColorStop(0.75, '#dca946');
      collarGrad.addColorStop(1, '#482c09');

      ctx.fillStyle = collarGrad;
      ctx.beginPath();
      ctx.roundRect(-7, 0, 14, 6, [2, 2, 1, 1]);
      ctx.fill();

      // Turned Acorn Main Body (American Walnut Wood)
      const bodyGrad = ctx.createLinearGradient(-11, 6, 11, 42);
      bodyGrad.addColorStop(0, '#3c2009');
      bodyGrad.addColorStop(0.2, '#7e4a1f');
      bodyGrad.addColorStop(0.45, '#bc7d3b');
      bodyGrad.addColorStop(0.7, '#6d3b14');
      bodyGrad.addColorStop(0.9, '#3c1d06');
      bodyGrad.addColorStop(1, '#231103');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(-7, 6);
      ctx.bezierCurveTo(-11.5, 14, -11.5, 29, -6, 37);
      ctx.bezierCurveTo(-3, 41, 3, 41, 6, 37);
      ctx.bezierCurveTo(11.5, 29, 11.5, 14, 7, 6);
      ctx.closePath();
      ctx.fill();

      // Lathe-cut Brass Inlay Center Ring
      ctx.strokeStyle = '#ffd875';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-10, 19);
      ctx.quadraticCurveTo(0, 21.5, 10, 19);
      ctx.stroke();

      // Specular Wood Curvature Glint
      const glintGrad = ctx.createLinearGradient(-7, 10, -2, 30);
      glintGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      glintGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = glintGrad;
      ctx.beginPath();
      ctx.ellipse(-5, 23, 2.6, 9.5, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Bottom Weighted Brass Finial Ball
      const finialGrad = ctx.createRadialGradient(-1.2, 42, 0.5, 0, 43, 4.5);
      finialGrad.addColorStop(0, '#ffffff');
      finialGrad.addColorStop(0.3, '#fce18b');
      finialGrad.addColorStop(0.7, '#b88127');
      finialGrad.addColorStop(1, '#4c2f08');

      ctx.fillStyle = finialGrad;
      ctx.beginPath();
      ctx.arc(0, 43, 4.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore(); // restore handle shadow

      // 5. Hanging Rustic Manila Tag tied with Twine
      ctx.save();

      // Twisted Hemp / Twine String Loop
      ctx.strokeStyle = '#7c5828';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(6, 4);
      ctx.quadraticCurveTo(12, 10, 15, 20);
      ctx.stroke();

      ctx.translate(15, 20);
      ctx.rotate(0.09 + Math.sin(animTime * 0.0022) * 0.05);

      ctx.shadowColor = 'rgba(0, 0, 0, 0.36)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2.5;
      ctx.shadowOffsetY = 3.5;

      const tagW = 76;
      const tagH = 23;
      ctx.fillStyle = isMidnight ? '#f5e4b6' : '#fcf5e5';
      ctx.strokeStyle = '#8f6820';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(0, -tagH / 2, tagW, tagH, 3.5);
      ctx.fill();
      ctx.stroke();

      // Brass Eyelet / Grommet
      ctx.fillStyle = '#65420d';
      ctx.beginPath();
      ctx.arc(6, 0, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fcf5e5';
      ctx.beginPath();
      ctx.arc(6, 0, 1.1, 0, Math.PI * 2);
      ctx.fill();

      // Tag Label (Accurate to current state)
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#322105';
      ctx.font = 'bold 9.5px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const tagLabel = isMidnight ? 'PULL ☀️ DAY' : 'PULL 💡 NIGHT';
      ctx.fillText(tagLabel, 11, 0.5);

      ctx.restore(); // restore tag
      ctx.restore(); // restore acorn transform
    }

    function loop() {
      updatePhysics();
      draw();
      requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
  }

  /* --------------------------------------------------------------------------
     4. LIVE DESK CLOCK WIDGET (IST / UTC+5:30)
     -------------------------------------------------------------------------- */
  function initDeskClock() {
    const clockEl = document.getElementById('deskClockText');
    if (!clockEl) return;

    function updateTime() {
      const now = new Date();
      // Format time in Indian Standard Time (IST)
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      try {
        const timeStr = new Intl.DateTimeFormat('en-US', options).format(now);
        clockEl.textContent = timeStr + ' IST';
      } catch (e) {
        clockEl.textContent = now.toLocaleTimeString();
      }
    }

    updateTime();
    setInterval(updateTime, 1000);
  }

  /* --------------------------------------------------------------------------
     5. 3D PERSPECTIVE TILT & CAST SHADOW ENGINE
     -------------------------------------------------------------------------- */
  function initTiltEngine() {
    if (prefersReducedMotion) return;

    const maxTilt = 8.5; // degrees of tilt

    function attachTilt(element, config) {
      const shadowBase = config.shadowBase || 16;
      const shadowSpread = config.shadowSpread || 12;

      element.addEventListener('mousemove', function (e) {
        const rect = element.getBoundingClientRect();
        const normX = (e.clientX - rect.left) / rect.width - 0.5;
        const normY = (e.clientY - rect.top) / rect.height - 0.5;

        const rotX = (normX * maxTilt).toFixed(2);
        const rotY = (-normY * maxTilt).toFixed(2);

        element.style.setProperty('--rx', rotX + 'deg');
        element.style.setProperty('--ry', rotY + 'deg');

        // Dynamic shadow moves opposite to tilt as if lit from overhead desk lamp
        const shadowX = (-normX * shadowSpread).toFixed(1) + 'px';
        const shadowY = (shadowBase - normY * shadowSpread).toFixed(1) + 'px';
        element.style.setProperty('--sx', shadowX);
        element.style.setProperty('--sy', shadowY);

        // Sheen hotspot directly tracks cursor position
        const sheenX = ((normX + 0.5) * 100).toFixed(1) + '%';
        const sheenY = ((normY + 0.5) * 100).toFixed(1) + '%';
        element.style.setProperty('--mx', sheenX);
        element.style.setProperty('--my', sheenY);
      });

      element.addEventListener('mouseenter', function () {
        playRustle();
      });

      element.addEventListener('mouseleave', function () {
        element.style.setProperty('--rx', '0deg');
        element.style.setProperty('--ry', '0deg');
        element.style.setProperty('--sx', '0px');
        element.style.setProperty('--sy', shadowBase + 'px');
      });
    }

    // Attach to hero card
    const heroCard = document.querySelector('.hero-card');
    if (heroCard) attachTilt(heroCard, { shadowBase: 20, shadowSpread: 16 });

    // Attach to all project cards
    document.querySelectorAll('.card').forEach(function (card) {
      attachTilt(card, { shadowBase: 16, shadowSpread: 12 });
    });

    // Attach to timeline cards
    document.querySelectorAll('.timeline-card').forEach(function (tCard) {
      attachTilt(tCard, { shadowBase: 16, shadowSpread: 10 });
    });

    // Attach to about dossier
    const aboutDossier = document.getElementById('aboutDossier');
    if (aboutDossier) attachTilt(aboutDossier, { shadowBase: 24, shadowSpread: 14 });

    // Attach to postcard
    const postcard = document.querySelector('.postcard');
    if (postcard) attachTilt(postcard, { shadowBase: 18, shadowSpread: 14 });
  }

  /* --------------------------------------------------------------------------
     6. DAMPED HARMONIC PENDULUM SIMULATION (Swinging Hanging Note)
     -------------------------------------------------------------------------- */
  function initPendulum() {
    if (prefersReducedMotion) return;

    const note = document.getElementById('hangingNote');
    if (!note) return;

    const restAngle = -4; // resting angle in degrees
    let angle = restAngle;
    let angularVelocity = 0;
    let lastClientX = null;

    // React dynamically when the cursor approaches or brushes past the pin
    document.addEventListener('mousemove', function (e) {
      const rect = note.getBoundingClientRect();
      const pinX = rect.left + rect.width / 2;
      const pinY = rect.top;
      const dist = Math.hypot(e.clientX - pinX, e.clientY - pinY);
      const influenceRadius = 240;

      if (dist < influenceRadius) {
        const proximityFactor = 1 - dist / influenceRadius;
        const deltaX = lastClientX === null ? 0 : (e.clientX - lastClientX);
        angularVelocity += deltaX * 0.045 * proximityFactor;
      }
      lastClientX = e.clientX;
    }, { passive: true });

    // Allow user to flick/click the note directly
    note.addEventListener('click', function () {
      playTock();
      angularVelocity += (Math.random() > 0.5 ? 14 : -14);
    });

    // Physics step loop
    (function physicsLoop() {
      const springStiffness = 0.048;
      const airDamping = 0.915;

      const restoringForce = -(angle - restAngle) * springStiffness;
      angularVelocity += restoringForce;
      angularVelocity *= airDamping;
      angle += angularVelocity;

      // Soft clamp to prevent erratic spinning
      if (angle > 50) angle = 50;
      if (angle < -50) angle = -50;

      note.style.setProperty('--noteAngle', angle.toFixed(2) + 'deg');
      requestAnimationFrame(physicsLoop);
    })();
  }

  /* --------------------------------------------------------------------------
     7. PUSH PIN WOBBLE ON CLICK
     -------------------------------------------------------------------------- */
  function initPinWobble() {
    document.querySelectorAll('.pin, .pin-corner, .note-pin').forEach(function (pin) {
      pin.addEventListener('click', function () {
        playTock();
        pin.classList.remove('wobble');
        void pin.offsetWidth; // trigger reflow
        pin.classList.add('wobble');
      });
    });
  }

  /* --------------------------------------------------------------------------
     8. CORKBOARD PARALLAX SCROLL DEPTH
     -------------------------------------------------------------------------- */
  function initCorkParallax() {
    if (prefersReducedMotion) return;

    window.addEventListener('scroll', function () {
      const scrollY = window.scrollY;
      const shift = (scrollY * 0.035).toFixed(1);

      document.body.style.backgroundPosition =
        shift + 'px ' + (shift * 0.6) + 'px, ' +
        (-shift) + 'px ' + shift + 'px, ' +
        shift + 'px ' + (-shift) + 'px, ' +
        (-shift) + 'px ' + (-shift) + 'px, ' +
        shift + 'px ' + shift + 'px, ' +
        (-shift) + 'px ' + (shift * 0.6) + 'px, ' +
        '0 0';
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     9. PROJECT GALLERY FILTER TABS
     -------------------------------------------------------------------------- */
  function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        playTock();
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        cards.forEach(function (card) {
          const category = card.getAttribute('data-category') || '';
          if (filter === 'all' || category.includes(filter)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }



  /* --------------------------------------------------------------------------
     11. ARCHITECTURAL BLUEPRINT MODAL
     -------------------------------------------------------------------------- */
  const ARCHITECTURE_DATA = {
    inspectflow: {
      title: 'InspectFlow — Architecture & OWASP Security Auditor',
      badge: 'Flagship Tool · React 19 + TypeScript',
      problem: 'Recruiters and CTOs frequently encounter toy projects with mock data that fail to demonstrate actual web security or infrastructure awareness. InspectFlow provides instant, deep compliance auditing against live production domains.',
      topology: 'Client Browser (React 19 / Vite) ──> CORS Proxy / Direct Fetch ──> HTTP Header Inspection Engine ──> OWASP Heuristic Evaluator ──> Framework Remediation Generator (Next.js / Express / Nginx) ──> Responsive Device Sandboxing (iPhone / iPad / Desktop)',
      tradeoffs: 'Chose a client-side architecture with fallback proxies over a heavy containerized backend to guarantee sub-200ms instantaneous evaluation with zero server cold starts.',
      snippet: `// OWASP Header Inspection Rule Matrix\nexport const evaluateSecurityHeaders = (headers: Headers): SecurityScore => {\n  const rules = [\n    { key: 'content-security-policy', weight: 25, failDesc: 'No CSP defined; high XSS risk' },\n    { key: 'strict-transport-security', weight: 20, failDesc: 'HSTS absent; vulnerable to SSL stripping' },\n    { key: 'x-frame-options', weight: 15, failDesc: 'Clickjacking possible via unauthorized iframe embed' },\n    { key: 'x-content-type-options', weight: 15, failDesc: 'MIME-sniffing protection disabled' },\n    { key: 'referrer-policy', weight: 15, failDesc: 'Full URL referrer leakage across domains' },\n    { key: 'permissions-policy', weight: 10, failDesc: 'Hardware APIs (camera/mic) not explicitly restricted' }\n  ];\n  return calculateScore(rules, headers);\n};`,
      repo: 'https://github.com/gurumaan/inspectflow',
      live: 'http://localhost:3002'
    },
    playify: {
      title: 'Playify — Music Streaming PWA & Standalone Android App',
      badge: 'Flagship Media · Real-Time Spotify Jam & Edge Cryptography',
      problem: 'Streaming audio platforms often suffer from high latency, require heavyweight runtimes, and lack low-latency collaborative playback. Playify provides instant streaming, offline PWA caching, an Android standalone APK, and zero-delay Spotify Jam synchronized multi-device listening (<10ms clock phase-lock via WebRTC PeerJS & MQTT).',
      topology: 'Client A (Host) <──[WebRTC PeerJS & MQTT Broker]──> Client B/C (Guests) | Edge: Cloudflare Worker (_worker.js) ──> Pure DES Stream Decryption Engine ──> Decrypted Audio Stream Buffer',
      tradeoffs: 'Implemented clock offset calibration with WebRTC data channels and MQTT fallback to achieve synchronized real-time multi-speaker playback across phones and laptops with sub-10ms drift.',
      snippet: `// Real-Time Spotify Jam Clock Calibration & Multi-Device Sync\nsyncWithHost(hostTimestamp, currentTrackPos) {\n  const now = performance.now();\n  const roundTripTime = (now - this.lastPingTime) / 2;\n  const estimatedHostTime = hostTimestamp + roundTripTime;\n  const drift = Math.abs(this.audio.currentTime - (currentTrackPos + roundTripTime / 1000));\n  \n  // Micro-rate adjustment or hard jump depending on drift threshold\n  if (drift > 0.05) {\n    this.audio.currentTime = currentTrackPos + (roundTripTime / 1000);\n  } else if (drift > 0.01) {\n    this.audio.playbackRate = this.audio.currentTime < currentTrackPos ? 1.03 : 0.97;\n  }\n}`,
      repo: 'https://github.com/gurumaan/playify',
      live: 'https://peaceful-davinci.cotton-vole.workers.dev'
    },
    apipulse: {
      title: 'APIPulse — Real-Time API Profiler & Network Waterfall Studio',
      badge: 'Flagship DevTool · Performance Telemetry & Security Audit',
      problem: 'Debugging API performance bottlenecks, diagnosing unexpected edge latency, and verifying OWASP security compliance often requires heavyweight, proprietary desktop tools. APIPulse provides a zero-install, browser-native studio delivering sub-millisecond timing waterfalls, live WebSocket stream inspection, and automated security grading.',
      topology: 'Request Bar ──► W3C Fetch & Performance API ──► Timing Waterfall Gantt (DNS ➔ TCP ➔ TLS ➔ TTFB ➔ Transfer) ──► OWASP Security Compliance Matrix ──► Collapsible JSON Tree & cURL Generator',
      tradeoffs: 'Implemented direct W3C PerformanceResourceTiming telemetry with graceful fallback benchmarks for CORS-restricted public endpoints to guarantee 100% interactive fidelity without requiring a costly backend proxy.',
      snippet: `// Sub-Millisecond W3C ResourceTiming Extraction Engine\nextractResourceTiming(url, totalElapsed) {\n  const entries = performance.getEntriesByName(url);\n  const entry = entries.length > 0 ? entries[entries.length - 1] : null;\n  if (entry && entry.responseStart > 0) {\n    return {\n      dns: Math.max(2, entry.domainLookupEnd - entry.domainLookupStart),\n      tcp: Math.max(5, entry.connectEnd - entry.connectStart),\n      tls: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 15,\n      ttfb: Math.max(10, entry.responseStart - entry.requestStart),\n      download: Math.max(2, entry.responseEnd - entry.responseStart),\n      total: entry.duration || totalElapsed\n    };\n  }\n  return this.computeProportionalWaterfall(totalElapsed);\n}`,
      repo: 'https://github.com/gurumaan/apipulse',
      live: 'https://gurumaan.github.io/apipulse/'
    },
    powersync: {
      title: 'PowerSync Offline-First Sync Backend',
      badge: 'Open Source · Node.js & PostgreSQL',
      problem: 'Building reliable offline-first mobile and web applications requires deterministic data replication between edge SQLite engines and centralized cloud relational databases.',
      topology: 'Client App (Client-side SQLite) ──[PowerSync Replication Stream]──> Node.js Auth/JWKS Service ──> PostgreSQL Master (Logical Replication Slots) ──> JWT Authentication Validator',
      tradeoffs: 'Implemented asymmetric cryptographic key rotation (RS256) with a standardized JWKS endpoint so client sessions never hold raw database connection credentials.',
      snippet: `// PowerSync JWKS & JWT Signing Endpoint\nrouter.get('/keys', async (req, res) => {\n  const jwks = await keyStore.getPublicJWKS();\n  res.setHeader('Cache-Control', 'public, max-age=3600');\n  return res.json(jwks);\n});\n\nrouter.post('/token', authMiddleware, async (req, res) => {\n  const token = jwt.sign({\n    sub: req.user.id,\n    aud: 'powersync',\n    parameters: { user_id: req.user.id }\n  }, privateKey, { algorithm: 'RS256', expiresIn: '15m' });\n  return res.json({ token });\n});`,
      repo: 'https://github.com/gurumaan/powersync-nodejs-backend',
      live: null
    },
    scoutflow: {
      title: 'ScoutFlow — Autonomous Market Intelligence Daemon',
      badge: '24/7 Automation Daemon · Python 3',
      problem: 'Manually monitoring dozens of remote job boards and technical forums is inefficient. ScoutFlow automates extraction, filters noise, deduplicates entries, and dispatches verified founder contacts directly to Telegram.',
      topology: 'Scheduled Runners (GitHub Actions / Linux VPS) ──> Multi-Source Scraper (8+ Sites) ──> BeautifulSoup / Regex Extractor ──> SHA-256 Deduplication Hash Store ──> 2-Way Telegram Bot Interface',
      tradeoffs: 'Used persistent SHA-256 state hashing rather than a heavy remote database to keep runtime state atomic, zero-cost, and portable across cloud runners.',
      snippet: `# Resilient Extraction & State Hashing\ndef process_listing(raw_html, source_name):\n    soup = BeautifulSoup(raw_html, 'html.parser')\n    text_block = soup.get_text(separator=' ')\n    emails = re.findall(EMAIL_PATTERN, text_block)\n    \n    entry_hash = hashlib.sha256(text_block.encode('utf-8')).hexdigest()\n    if is_already_seen(entry_hash):\n        return None\n        \n    record_entry(entry_hash, source_name)\n    dispatch_telegram_alert(source_name, emails, text_block[:300])`,
      repo: 'https://github.com/gurumaan/scoutflow',
      live: null
    },
    involvo: {
      title: 'Involvo — WhatsApp Booking & Local Business CRM',
      badge: 'Client Platform · Node.js & WhatsApp API',
      problem: 'Local service businesses (salons, clinics) lose up to 30% of booking inquiries due to friction in phone calls and complex mobile apps.',
      topology: 'Customer WhatsApp Chat ──[WhatsApp Web/Cloud API]──> Natural Language Parser ──> Slot Allocation Engine ──> SQLite Booking DB ──> Business Owner Live Dashboard',
      tradeoffs: 'Designed zero-app booking: clients book purely over text within their existing WhatsApp chat while business owners get a clean desktop calendar dashboard.',
      snippet: `// Booking Slot State Machine\nasync function handleCustomerMessage(phone, messageText) {\n  const session = await getOrCreateSession(phone);\n  switch (session.step) {\n    case 'SELECT_SERVICE':\n      return await presentServiceOptions(phone);\n    case 'SELECT_SLOT':\n      return await confirmSlotReservation(phone, messageText);\n    case 'CONFIRMED':\n      await scheduleReminderBroadcast(session.bookingId, -120); // 2 hrs before\n      return await sendConfirmationTicket(phone, session);\n  }\n}`,
      repo: null,
      live: null
    },
    apexstore: {
      title: 'ApexStore & Independent Apparel Platform',
      badge: 'Production E-Commerce · Next.js & Stripe',
      problem: 'E-commerce storefronts frequently suffer from layout shifts, slow mobile checkout, and manual fulfillment bottlenecks.',
      topology: 'Buyer Browser ──> Next.js Server Components ──> Stripe Hosted Checkout ──> Signed Webhook Handler ──> Print-on-Demand Automation Pipeline ──> Order Fulfillment Dispatch',
      tradeoffs: 'Offloaded critical transaction state to Stripe Checkout sessions with strict HMAC webhook verification to ensure zero financial data touched our application database.',
      snippet: `// Stripe Webhook Signature Verification\nexport async function POST(req: Request) {\n  const payload = await req.text();\n  const sig = req.headers.get('stripe-signature')!;\n  const event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);\n  \n  if (event.type === 'checkout.session.completed') {\n    const session = event.data.object;\n    await triggerPrintFulfillment(session.client_reference_id, session.customer_details);\n  }\n  return NextResponse.json({ received: true });\n}`,
      repo: null,
      live: null
    },
    clientvps: {
      title: 'Custom Client Websites & Managed VPS Infrastructure',
      badge: 'Infrastructure & Web · Linux / Nginx / Hetzner',
      problem: 'Small and medium business websites hosted on shared hosting suffer from slow speeds, lack of automated SSL maintenance, and insecure defaults.',
      topology: 'Client Domain (Cloudflare DNS & WAF) ──> Ubuntu Linux VPS (Hetzner) ──> Nginx Reverse Proxy (HTTP/2, Brotli, SSL Certbot) ──> Production Static / Node Deployments ──> Daily Backup Daemon',
      tradeoffs: 'Provisioned lightweight self-managed Ubuntu VPS nodes over costly serverless tiers to deliver sub-50ms TTFB and complete operational control for business clients.',
      snippet: `# Optimized Nginx Server Block with Security Headers\nserver {\n    listen 443 ssl http2;\n    server_name clientdomain.com;\n    \n    ssl_certificate /etc/letsencrypt/live/clientdomain.com/fullchain.pem;\n    ssl_certificate_key /etc/letsencrypt/live/clientdomain.com/privkey.pem;\n    \n    add_header X-Frame-Options "SAMEORIGIN" always;\n    add_header X-Content-Type-Options "nosniff" always;\n    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;\n    \n    location / {\n        root /var/www/clientdomain;\n        try_files $uri $uri/ /index.html;\n    }\n}`,
      repo: null,
      live: null
    }
  };

  function initModal() {
    const overlay = document.getElementById('architectureModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    const modalContent = document.getElementById('modalContent');

    if (!overlay || !closeBtn || !modalContent) return;

    function openModal(projectId) {
      playTock();
      const data = ARCHITECTURE_DATA[projectId];
      if (!data) return;

      modalContent.innerHTML = `
        <span class="modal-badge">${data.badge}</span>
        <h3 class="modal-title">${data.title}</h3>
        
        <h4 class="modal-section-title">// Problem Statement</h4>
        <p style="font-size:0.95rem; color:var(--ink-soft); line-height:1.6;">${data.problem}</p>

        <h4 class="modal-section-title">// System Topology & Data Flow</h4>
        <div class="modal-code-box" style="white-space:pre-wrap;">${data.topology}</div>

        <h4 class="modal-section-title">// Key Engineering Trade-Offs</h4>
        <p style="font-size:0.95rem; color:var(--ink-soft); line-height:1.6;">${data.tradeoffs}</p>

        <h4 class="modal-section-title">// Core Implementation Logic</h4>
        <pre class="modal-code-box"><code>${data.snippet}</code></pre>

        <div style="margin-top:24px; display:flex; gap:14px; flex-wrap:wrap;">
          ${data.live ? `<a href="${data.live}" target="_blank" rel="noreferrer noopener" class="btn btn-primary" style="font-size:0.85rem; padding:8px 18px;">Open Live Tool ↗</a>` : ''}
          ${data.repo ? `<a href="${data.repo}" target="_blank" rel="noreferrer noopener" class="btn btn-ghost" style="font-size:0.85rem; padding:8px 18px;">GitHub Repository ↗</a>` : ''}
        </div>
      `;

      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      playTock();
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.card-btn-inspect').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const projectId = btn.getAttribute('data-project');
        openModal(projectId);
      });
    });

    closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        closeModal();
      }
    });
  }

  /* --------------------------------------------------------------------------
     12. 1-CLICK COPY & TORN-PAPER TOAST NOTIFICATION
     -------------------------------------------------------------------------- */
  function initToastAndClipboard() {
    const toast = document.getElementById('paperToast');
    const toastMsg = document.getElementById('toastMessage');


    const copyEmailBtn = document.getElementById('copyEmailBtn');
    if (copyEmailBtn) {
      copyEmailBtn.addEventListener('click', function () {
        const email = 'gurudeveloper05@gmail.com';
        navigator.clipboard.writeText(email).then(function () {
          showToast('📌 Copied to clipboard: ' + email);
        }).catch(function () {
          showToast('📌 Email: ' + email);
        });
      });
    }

    // Postal Desk Airmail Form Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('contactName')?.value || 'Friend';
        const email = document.getElementById('contactEmail')?.value || 'Not provided';
        const type = document.getElementById('projectType')?.value || 'General Inquiry';
        const msg = document.getElementById('contactMessage')?.value || '';

        const subject = encodeURIComponent(`[${type}] Project Inquiry from ${name}`);
        const body = encodeURIComponent(`Hi Gursharan,\n\nName: ${name}\nEmail: ${email}\nInquiry Type: ${type}\n\nProject Scope / Message:\n${msg}\n\nSent via guru4code.online`);

        window.location.href = `mailto:gurudeveloper05@gmail.com?subject=${subject}&body=${body}`;
        showToast('📮 Airmail drafted! Opening email client...');
      });
    }

    // Interactive Postcard Form Handling
    const postForm = document.getElementById('postcardForm');
    const copyDraftBtn = document.getElementById('copyDraftBtn');

    if (postForm) {
      postForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('senderName')?.value || 'Friend';
        const email = document.getElementById('senderEmail')?.value || 'Not provided';
        const type = document.getElementById('projectType')?.value || 'General Inquiry';
        const msg = document.getElementById('projectMessage')?.value || '';

        const subject = encodeURIComponent(`[${type}] Project Inquiry from ${name}`);
        const body = encodeURIComponent(`Hi Gursharan,\n\nName: ${name}\nEmail: ${email}\nProject Type: ${type}\n\nMessage:\n${msg}\n\nSent via guru4code.online`);

        window.location.href = `mailto:gurudeveloper05@gmail.com?subject=${subject}&body=${body}`;
        showToast('✉ Opening email composer with draft...');
      });
    }

    if (copyDraftBtn) {
      copyDraftBtn.addEventListener('click', function () {
        const name = document.getElementById('senderName')?.value || 'Inquirer';
        const email = document.getElementById('senderEmail')?.value || '';
        const type = document.getElementById('projectType')?.value || 'General Inquiry';
        const msg = document.getElementById('projectMessage')?.value || '';

        const draft = `Inquiry for Gursharan Singh:\nName: ${name}\nEmail: ${email}\nType: ${type}\nMessage: ${msg}`;
        navigator.clipboard.writeText(draft).then(function () {
          showToast('📋 Copied formatted draft to clipboard!');
        });
      });
    }
  }

  /* --------------------------------------------------------------------------
     13. MOBILE NAVIGATION DRAWER
     -------------------------------------------------------------------------- */
  function initMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const mobilePanel = document.getElementById('mobileNavPanel');

    if (!navToggle || !mobilePanel) return;

    navToggle.addEventListener('click', function () {
      playTock();
      mobilePanel.classList.toggle('open');
      const isOpen = mobilePanel.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    mobilePanel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobilePanel.classList.remove('open');
      });
    });
  }

  /* --------------------------------------------------------------------------
     14. ACTIVE NAVIGATION HIGHLIGHTING ON SCROLL
     -------------------------------------------------------------------------- */
  function initNavSpy() {
    const sections = document.querySelectorAll('section[id], header[id], footer[id]');
    const navLinks = document.querySelectorAll('.navlinks a[href^="#"]');

    window.addEventListener('scroll', function () {
      let currentSection = '';
      const scrollPos = window.scrollY + 140;

      sections.forEach(function (section) {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSection = '#' + section.getAttribute('id');
        }
      });

      navLinks.forEach(function (link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentSection) {
          link.classList.add('active');
        }
      });
    }, { passive: true });
  }

  /* --------------------------------------------------------------------------
     BOOTSTRAP EVERYTHING
     -------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initLampPhysicsCord();
    initDeskClock();
    initTiltEngine();
    initPendulum();
    initPinWobble();
    initCorkParallax();
    initProjectFilters();
    initModal();
    initToastAndClipboard();
    initMobileNav();
    initNavSpy();
  });

})();
