/* ==========================================================================
   GURSHARAN SINGH MANN — PORTFOLIO RUNTIME SCRIPT
   Harmonic Pendulum Physics · 3D Perspective Tilt · Blueprint Modal · Filter
   ========================================================================== */

(function () {
  'use strict';

  // Respect user preference for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------------------
     1. 3D PERSPECTIVE TILT & CAST SHADOW ENGINE
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

    // Attach to wood plaque
    const woodPlaque = document.getElementById('woodPlaque');
    if (woodPlaque) attachTilt(woodPlaque, { shadowBase: 24, shadowSpread: 14 });

    // Attach to postcard
    const postcard = document.querySelector('.postcard');
    if (postcard) attachTilt(postcard, { shadowBase: 18, shadowSpread: 14 });
  }

  /* --------------------------------------------------------------------------
     2. DAMPED HARMONIC PENDULUM SIMULATION (Swinging Hanging Note)
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
      angularVelocity += (Math.random() > 0.5 ? 12 : -12);
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
     3. CORKBOARD PARALLAX SCROLL DEPTH
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
     4. PROJECT GALLERY FILTER TABS
     -------------------------------------------------------------------------- */
  function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        cards.forEach(function (card) {
          const category = card.getAttribute('data-category') || '';
          if (filter === 'all' || category.includes(filter)) {
            card.style.display = 'flex';
            card.style.animation = 'fadeInCard 0.3s ease-out forwards';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. ARCHITECTURAL BLUEPRINT MODAL DATA & CONTROLLER
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
      repo: null,
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
     6. 1-CLICK COPY & TORN-PAPER TOAST NOTIFICATION
     -------------------------------------------------------------------------- */
  function initToastAndClipboard() {
    const toast = document.getElementById('paperToast');
    const toastMsg = document.getElementById('toastMessage');

    function showToast(message) {
      if (!toast) return;
      if (toastMsg) toastMsg.textContent = message;
      toast.classList.add('show');
      setTimeout(function () {
        toast.classList.remove('show');
      }, 3200);
    }

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

    const copyTelegramBtn = document.getElementById('copyTelegramBtn');
    if (copyTelegramBtn) {
      copyTelegramBtn.addEventListener('click', function () {
        const handle = '@Guru4code';
        navigator.clipboard.writeText(handle).then(function () {
          showToast('📌 Copied Telegram: ' + handle);
        });
      });
    }
  }

  /* --------------------------------------------------------------------------
     7. MOBILE NAVIGATION DRAWER
     -------------------------------------------------------------------------- */
  function initMobileNav() {
    const navToggle = document.getElementById('navToggle');
    const mobilePanel = document.getElementById('mobileNavPanel');

    if (!navToggle || !mobilePanel) return;

    navToggle.addEventListener('click', function () {
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
     8. ACTIVE NAVIGATION HIGHLIGHTING ON SCROLL
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
    initTiltEngine();
    initPendulum();
    initCorkParallax();
    initProjectFilters();
    initModal();
    initToastAndClipboard();
    initMobileNav();
    initNavSpy();
  });

})();
