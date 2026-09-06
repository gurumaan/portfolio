/**
 * =========================================================================
 * DINEFLOW 2.0 — HOSPITALITY OPERATING SYSTEM & REAL-TIME KDS ENGINE
 * Clean, modular Vanilla ES6+. Zero third-party runtime dependencies.
 * =========================================================================
 */

(() => {
  'use strict';

  // --- STATE ---
  const state = {
    view: 'guest', // 'guest' | 'kds' | 'floor'
    currentTable: 'T04',
    selectedFloorTable: 'T04',
    selectedStation: 'all',
    activeCategory: 'all',
    dietaryFilter: 'all',
    searchQuery: '',
    audioMuted: false,
    outOfStock: new Set(),
    cart: [],
    tickets: [],
    modalDish: null,
    modalQty: 1,
    modalModifiers: {},
    audioCtx: null,
    broadcast: null
  };

  // --- DOM REFERENCES ---
  const el = {
    // Nav
    btnViewGuest: document.getElementById('btnViewGuest'),
    btnViewKds: document.getElementById('btnViewKds'),
    btnViewFloor: document.getElementById('btnViewFloor'),
    workspaceGuest: document.getElementById('workspaceGuest'),
    workspaceKds: document.getElementById('workspaceKds'),
    workspaceFloor: document.getElementById('workspaceFloor'),
    navKdsBadge: document.getElementById('navKdsBadge'),
    activeTableLabel: document.getElementById('activeTableLabel'),
    tableSelectorDropdown: document.getElementById('tableSelectorDropdown'),
    audioToggleBtn: document.getElementById('audioToggleBtn'),
    audioIcon: document.getElementById('audioIcon'),
    cartOpenBtn: document.getElementById('cartOpenBtn'),
    cartCountBadge: document.getElementById('cartCountBadge'),

    // Guest View
    categoriesList: document.getElementById('categoriesList'),
    dishSearchInput: document.getElementById('dishSearchInput'),
    dietaryPills: document.getElementById('dietaryPills'),
    menuGrid: document.getElementById('menuGrid'),
    btnCallServer: document.getElementById('btnCallServer'),

    // Modal Customizer
    dishModalBackdrop: document.getElementById('dishModalBackdrop'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalDishImg: document.getElementById('modalDishImg'),
    modalDishTitle: document.getElementById('modalDishTitle'),
    modalDishPrice: document.getElementById('modalDishPrice'),
    modalDishDesc: document.getElementById('modalDishDesc'),
    modalDietTag: document.getElementById('modalDietTag'),
    modalPrepTag: document.getElementById('modalPrepTag'),
    modifierGroupsContainer: document.getElementById('modifierGroupsContainer'),
    chefNotesInput: document.getElementById('chefNotesInput'),
    modalQtyMinus: document.getElementById('modalQtyMinus'),
    modalQtyPlus: document.getElementById('modalQtyPlus'),
    modalQtyVal: document.getElementById('modalQtyVal'),
    modalTotalCalc: document.getElementById('modalTotalCalc'),
    modalAddBtn: document.getElementById('modalAddBtn'),

    // Cart Drawer
    cartDrawer: document.getElementById('cartDrawer'),
    cartCloseBtn: document.getElementById('cartCloseBtn'),
    cartItemsList: document.getElementById('cartItemsList'),
    cartEmptyState: document.getElementById('cartEmptyState'),
    cartItemsSummary: document.getElementById('cartItemsSummary'),
    traySubtotal: document.getElementById('traySubtotal'),
    trayTax: document.getElementById('trayTax'),
    trayService: document.getElementById('trayService'),
    trayGrandTotal: document.getElementById('trayGrandTotal'),
    btnDispatchOrder: document.getElementById('btnDispatchOrder'),

    // KDS View
    kdsStationsTabs: document.getElementById('kdsStationsTabs'),
    kdsActiveCount: document.getElementById('kdsActiveCount'),
    kdsAvgTime: document.getElementById('kdsAvgTime'),
    count86Items: document.getElementById('count86Items'),
    btnToggle86Drawer: document.getElementById('btnToggle86Drawer'),
    btnSimulateRush: document.getElementById('btnSimulateRush'),
    listIncoming: document.getElementById('listIncoming'),
    listPrep: document.getElementById('listPrep'),
    listReady: document.getElementById('listReady'),
    listCompleted: document.getElementById('listCompleted'),
    badgeIncoming: document.getElementById('badgeIncoming'),
    badgePrep: document.getElementById('badgePrep'),
    badgeReady: document.getElementById('badgeReady'),
    badgeCompleted: document.getElementById('badgeCompleted'),

    // Floor & POS
    floorTablesGrid: document.getElementById('floorTablesGrid'),
    posTableHeading: document.getElementById('posTableHeading'),
    btnPrintReceipt: document.getElementById('btnPrintReceipt'),
    btnSettleTable: document.getElementById('btnSettleTable'),
    rcptTableId: document.getElementById('rcptTableId'),
    rcptTime: document.getElementById('rcptTime'),
    rcptItemsList: document.getElementById('rcptItemsList'),
    rcptSubtotal: document.getElementById('rcptSubtotal'),
    rcptCgst: document.getElementById('rcptCgst'),
    rcptSgst: document.getElementById('rcptSgst'),
    rcptService: document.getElementById('rcptService'),
    rcptGrandTotal: document.getElementById('rcptGrandTotal'),

    // 86 Drawer
    drawer86Backdrop: document.getElementById('drawer86Backdrop'),
    close86Btn: document.getElementById('close86Btn'),
    list86Container: document.getElementById('list86Container'),

    // Toast
    dfToast: document.getElementById('dfToast')
  };

  /* =========================================================================
     1. INITIALIZATION
     ========================================================================= */
  function init() {
    initBroadcast();
    initStorage();
    renderTableSelector();
    renderCategories();
    renderDietaryPills();
    renderMenu();
    renderKdsStations();
    renderKdsBoard();
    renderFloorplan();
    renderPosReceipt();
    bindEvents();

    // Start SLA countdown clock ticker
    setInterval(updateTicketTimers, 1000);

    // URL parameter view check (e.g. ?view=kds)
    const urlParams = new URLSearchParams(window.location.search);
    const reqView = urlParams.get('view');
    if (reqView && ['guest', 'kds', 'floor'].includes(reqView)) {
      switchView(reqView);
    }
  }

  function initStorage() {
    try {
      const savedTickets = localStorage.getItem('dineflow_v2_tickets');
      if (savedTickets) {
        state.tickets = JSON.parse(savedTickets);
      } else {
        state.tickets = JSON.parse(JSON.stringify(window.DINEFLOW_SAMPLE_TICKETS || []));
      }
    } catch (_) {
      state.tickets = JSON.parse(JSON.stringify(window.DINEFLOW_SAMPLE_TICKETS || []));
    }
  }

  function saveTickets() {
    try {
      localStorage.setItem('dineflow_v2_tickets', JSON.stringify(state.tickets));
    } catch (_) {}
  }

  /* =========================================================================
     2. AUDIO SYNTHESIZER (WEB AUDIO API)
     ========================================================================= */
  function getAudioContext() {
    if (!state.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) state.audioCtx = new AudioCtx();
    }
    if (state.audioCtx && state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
    return state.audioCtx;
  }

  function playBrassBell() {
    if (state.audioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // Synthesize 1760Hz, 3520Hz, 5280Hz Multi-Harmonic Brass Counter Bell
      const harmonics = [
        { f: 1760, gain: 0.35, type: 'sine' },
        { f: 3520, gain: 0.18, type: 'triangle' },
        { f: 5280, gain: 0.08, type: 'sine' }
      ];

      harmonics.forEach(h => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = h.type;
        osc.frequency.setValueAtTime(h.f, t);

        g.gain.setValueAtTime(h.gain, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.25);
      });
    } catch (e) {
      console.warn('[DineFlow Audio]', e);
    }
  }

  function playChefBump() {
    if (state.audioMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);

      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch (_) {}
  }

  /* =========================================================================
     3. REAL-TIME BROADCASTCHANNEL BUS
     ========================================================================= */
  function initBroadcast() {
    if ('BroadcastChannel' in window) {
      try {
        state.broadcast = new BroadcastChannel('dineflow_v2_bus');
        state.broadcast.onmessage = (event) => {
          const { type, payload } = event.data || {};
          if (type === 'NEW_ORDER') {
            state.tickets.unshift(payload);
            playBrassBell();
            renderKdsBoard();
            renderFloorplan();
            showToast(`🛎️ New Order from ${payload.tableName}`);
          } else if (type === 'BUMP_TICKET') {
            const tkt = state.tickets.find(t => t.id === payload.id);
            if (tkt) {
              tkt.status = payload.status;
              renderKdsBoard();
              renderFloorplan();
            }
          } else if (type === 'TOGGLE_86') {
            if (payload.outOfStock) {
              state.outOfStock.add(payload.id);
            } else {
              state.outOfStock.delete(payload.id);
            }
            renderMenu();
            render86Drawer();
          } else if (type === 'CALL_WAITER') {
            playBrassBell();
            showToast(`🔔 Waiter Assistance Called for ${payload.tableName}`);
          }
        };
      } catch (err) {
        console.warn('[DineFlow Broadcast]', err);
      }
    }
  }

  function broadcastEvent(type, payload) {
    if (state.broadcast) {
      try {
        state.broadcast.postMessage({ type, payload });
      } catch (_) {}
    }
  }

  /* =========================================================================
     4. VIEW SWITCHER
     ========================================================================= */
  function switchView(viewName) {
    state.view = viewName;
    el.btnViewGuest.classList.toggle('active', viewName === 'guest');
    el.btnViewKds.classList.toggle('active', viewName === 'kds');
    el.btnViewFloor.classList.toggle('active', viewName === 'floor');

    el.workspaceGuest.style.display = viewName === 'guest' ? 'flex' : 'none';
    el.workspaceKds.style.display = viewName === 'kds' ? 'flex' : 'none';
    el.workspaceFloor.style.display = viewName === 'floor' ? 'flex' : 'none';

    if (viewName === 'kds') {
      renderKdsBoard();
    } else if (viewName === 'floor') {
      renderFloorplan();
      renderPosReceipt();
    }
  }

  /* =========================================================================
     5. TABLE SELECTOR
     ========================================================================= */
  function renderTableSelector() {
    const tables = window.DINEFLOW_TABLES || [];
    el.tableSelectorDropdown.innerHTML = tables.map(t => `
      <option value="${t.id}" ${t.id === state.currentTable ? 'selected' : ''}>
        ${escapeHtml(t.name)} (${t.capacity} Seats)
      </option>
    `).join('');

    const activeObj = tables.find(t => t.id === state.currentTable);
    if (activeObj) el.activeTableLabel.textContent = activeObj.name;
  }

  /* =========================================================================
     6. GUEST MENU RENDERING
     ========================================================================= */
  function renderCategories() {
    const cats = window.DINEFLOW_CATEGORIES || [];
    el.categoriesList.innerHTML = cats.map(c => `
      <button type="button" class="category-tab-btn ${c.id === state.activeCategory ? 'active' : ''}" data-cat="${c.id}">
        <span>${c.icon}</span>
        <span>${escapeHtml(c.name)}</span>
      </button>
    `).join('');
  }

  function renderDietaryPills() {
    // Handled in HTML
  }

  function renderMenu() {
    let items = window.DINEFLOW_MENU || [];

    // Category Filter
    if (state.activeCategory !== 'all') {
      items = items.filter(m => m.category === state.activeCategory);
    }

    // Dietary Filter
    if (state.dietaryFilter !== 'all') {
      items = items.filter(m => (m.dietary || []).includes(state.dietaryFilter));
    }

    // Search Query
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      items = items.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.desc.toLowerCase().includes(q)
      );
    }

    if (items.length === 0) {
      el.menuGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: var(--text-muted);">
          <h3>No culinary selections found</h3>
          <p>Try clearing filters or search terms.</p>
        </div>
      `;
      return;
    }

    el.menuGrid.innerHTML = items.map(dish => {
      const is86 = state.outOfStock.has(dish.id);
      const dietBadges = (dish.dietary || []).map(d => {
        if (d === 'veg') return '<span class="dish-badge-pill">🌱 Veg</span>';
        if (d === 'vegan') return '<span class="dish-badge-pill">🌿 Vegan</span>';
        if (d === 'gluten-free') return '<span class="dish-badge-pill">🌾 GF</span>';
        if (d === 'spicy') return '<span class="dish-badge-pill">🌶️ Spicy</span>';
        return '';
      }).join('');

      return `
        <article class="dish-card ${is86 ? 'out-of-stock' : ''}" data-id="${dish.id}">
          <div class="dish-img-wrap">
            <img src="${dish.image}" alt="${escapeHtml(dish.name)}" class="dish-img" loading="lazy">
            <div class="dish-img-overlay"></div>
            <div class="dish-badges-float">${dietBadges}</div>
            <span class="dish-prep-float">⏱️ ${dish.prepTime}</span>
          </div>
          <div class="dish-body">
            <h3 class="dish-title">${escapeHtml(dish.name)}</h3>
            <p class="dish-desc">${escapeHtml(dish.desc)}</p>
            <div class="dish-footer">
              <span class="dish-price">₹${dish.price.toLocaleString('en-IN')}</span>
              <button type="button" class="btn-dish-add" data-dishid="${dish.id}" ${is86 ? 'disabled' : ''}>
                <span>${is86 ? '86\'d Out of Stock' : 'Customize &amp; Add +'}</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  /* =========================================================================
     7. DISH CUSTOMIZER MODAL
     ========================================================================= */
  function openDishModal(dishId) {
    const dish = (window.DINEFLOW_MENU || []).find(d => d.id === dishId);
    if (!dish) return;

    state.modalDish = dish;
    state.modalQty = 1;
    state.modalModifiers = {};

    el.modalDishImg.src = dish.image;
    el.modalDishTitle.textContent = dish.name;
    el.modalDishPrice.textContent = `₹${dish.price.toLocaleString('en-IN')}`;
    el.modalDishDesc.textContent = dish.desc;
    el.modalPrepTag.textContent = dish.prepTime;
    el.modalQtyVal.textContent = '1';
    el.chefNotesInput.value = '';

    // Render Modifiers
    const groups = dish.modifierGroups || [];
    el.modifierGroupsContainer.innerHTML = groups.map((g, gIdx) => {
      const isMulti = Boolean(g.multi);
      return `
        <div class="modifier-group">
          <span class="mod-group-title">${escapeHtml(g.name).toUpperCase()} ${g.required ? '(REQUIRED)' : '(OPTIONAL)'}</span>
          <div class="mod-options-list">
            ${g.options.map((opt, oIdx) => {
              const inputType = isMulti ? 'checkbox' : 'radio';
              const inputName = `mod_group_${gIdx}`;
              const isChecked = !isMulti && oIdx === 0;
              if (isChecked) {
                state.modalModifiers[g.name] = [opt];
              }
              return `
                <label class="mod-option-label">
                  <div>
                    <input type="${inputType}" name="${inputName}" class="mod-opt-input" data-group="${escapeHtml(g.name)}" data-opt="${escapeHtml(opt.name)}" data-price="${opt.price}" ${isChecked ? 'checked' : ''}>
                    <span>${escapeHtml(opt.name)}</span>
                  </div>
                  <span class="mod-opt-price">${opt.price > 0 ? '+₹' + opt.price : 'Included'}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    calculateModalTotal();
    el.dishModalBackdrop.classList.add('show');
  }

  function calculateModalTotal() {
    if (!state.modalDish) return;
    let base = state.modalDish.price;

    // Sum checked modifiers
    const checkedInputs = el.modifierGroupsContainer.querySelectorAll('.mod-opt-input:checked');
    checkedInputs.forEach(inp => {
      base += Number(inp.dataset.price || 0);
    });

    const grand = base * state.modalQty;
    el.modalTotalCalc.textContent = `₹${grand.toLocaleString('en-IN')}`;
    return grand;
  }

  function addItemToCart() {
    if (!state.modalDish) return;

    const selectedMods = [];
    const checkedInputs = el.modifierGroupsContainer.querySelectorAll('.mod-opt-input:checked');
    checkedInputs.forEach(inp => {
      selectedMods.push(inp.dataset.opt);
    });

    const chefNotes = el.chefNotesInput.value.trim();
    if (chefNotes) selectedMods.push(`Chef Note: "${chefNotes}"`);

    const unitPrice = calculateModalTotal() / state.modalQty;

    state.cart.push({
      dishId: state.modalDish.id,
      name: state.modalDish.name,
      station: state.modalDish.station,
      qty: state.modalQty,
      unitPrice: unitPrice,
      totalPrice: unitPrice * state.modalQty,
      modifiers: selectedMods
    });

    el.dishModalBackdrop.classList.remove('show');
    renderCart();
    playChefBump();
    showToast(`Added ${state.modalDish.name} to order tray`);
  }

  /* =========================================================================
     8. CART & DISPATCH ORDER
     ========================================================================= */
  function renderCart() {
    const count = state.cart.reduce((sum, it) => sum + it.qty, 0);
    el.cartCountBadge.textContent = count;
    el.cartItemsSummary.textContent = `${count} items queued`;

    if (state.cart.length === 0) {
      el.cartEmptyState.style.display = 'flex';
      el.cartItemsList.innerHTML = '';
      el.cartItemsList.appendChild(el.cartEmptyState);
      el.traySubtotal.textContent = '₹0.00';
      el.trayTax.textContent = '₹0.00';
      el.trayService.textContent = '₹0.00';
      el.trayGrandTotal.textContent = '₹0.00';
      el.btnDispatchOrder.disabled = true;
      return;
    }

    el.cartEmptyState.style.display = 'none';
    let subtotal = 0;

    el.cartItemsList.innerHTML = state.cart.map((item, idx) => {
      subtotal += item.totalPrice;
      return `
        <div class="cart-item-card">
          <div class="ci-header">
            <span>${item.qty}x ${escapeHtml(item.name)}</span>
            <span class="ci-price">₹${item.totalPrice.toLocaleString('en-IN')}</span>
          </div>
          ${item.modifiers.length > 0 ? `<div class="ci-modifiers">${item.modifiers.map(m => escapeHtml(m)).join(' • ')}</div>` : ''}
          <div class="ci-footer">
            <button type="button" class="ap-link-action btn-del-cart" data-cartidx="${idx}" style="color: var(--accent-rose); font-size: 11px;">Remove</button>
          </div>
        </div>
      `;
    }).join('');

    const tax = Math.round(subtotal * 0.05); // 5% GST
    const service = Math.round(subtotal * 0.05); // 5% Service
    const grand = subtotal + tax + service;

    el.traySubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}.00`;
    el.trayTax.textContent = `₹${tax.toLocaleString('en-IN')}.00`;
    el.trayService.textContent = `₹${service.toLocaleString('en-IN')}.00`;
    el.trayGrandTotal.textContent = `₹${grand.toLocaleString('en-IN')}.00`;
    el.btnDispatchOrder.disabled = false;
  }

  function dispatchCartOrder() {
    if (state.cart.length === 0) return;

    const activeTableObj = (window.DINEFLOW_TABLES || []).find(t => t.id === state.currentTable) || { name: 'Table 04 — Terrace' };
    const ticketId = `TKT-${Math.floor(100 + Math.random() * 900)}`;
    const nowTime = new Date().toTimeString().split(' ')[0].slice(0, 5);

    const newTicket = {
      id: ticketId,
      table: state.currentTable,
      tableName: activeTableObj.name,
      time: nowTime,
      elapsedSeconds: 0,
      status: 'incoming',
      station: state.cart[0].station || 'grill',
      items: state.cart.map(it => ({
        name: it.name,
        qty: it.qty,
        price: it.unitPrice,
        station: it.station,
        modifiers: it.modifiers
      }))
    };

    state.tickets.unshift(newTicket);
    saveTickets();

    // Broadcast across windows
    broadcastEvent('NEW_ORDER', newTicket);

    // Audio chime
    playBrassBell();

    // Reset cart & close
    state.cart = [];
    renderCart();
    el.cartDrawer.classList.remove('open');

    // Update table status in floorplan
    if (activeTableObj) {
      activeTableObj.status = 'active';
      activeTableObj.orderCount = (activeTableObj.orderCount || 0) + 1;
    }

    renderKdsBoard();
    renderFloorplan();
    showToast(`Order dispatched to kitchen! (Ticket #${ticketId})`);
  }

  /* =========================================================================
     9. KITCHEN DISPLAY SYSTEM (KDS) LOGIC
     ========================================================================= */
  function renderKdsStations() {
    const stations = window.DINEFLOW_STATIONS || [];
    el.kdsStationsTabs.innerHTML = stations.map(s => `
      <button type="button" class="kds-station-btn ${s.id === state.selectedStation ? 'active' : ''}" data-station="${s.id}">
        <span>${s.icon}</span>
        <span>${escapeHtml(s.name)}</span>
      </button>
    `).join('');
  }

  function renderKdsBoard() {
    let filtered = state.tickets;
    if (state.selectedStation !== 'all') {
      filtered = filtered.filter(t => t.station === state.selectedStation);
    }

    const incoming = filtered.filter(t => t.status === 'incoming');
    const prep = filtered.filter(t => t.status === 'in_prep');
    const ready = filtered.filter(t => t.status === 'ready');
    const completed = filtered.filter(t => t.status === 'completed');

    el.badgeIncoming.textContent = incoming.length;
    el.badgePrep.textContent = prep.length;
    el.badgeReady.textContent = ready.length;
    el.badgeCompleted.textContent = completed.length;

    const activeTotal = incoming.length + prep.length + ready.length;
    el.kdsActiveCount.textContent = activeTotal;
    el.navKdsBadge.textContent = activeTotal;

    el.listIncoming.innerHTML = incoming.map(t => renderKdsTicketHtml(t, 'Accept ➔', 'in_prep')).join('');
    el.listPrep.innerHTML = prep.map(t => renderKdsTicketHtml(t, 'Bump to Pass ✓', 'ready')).join('');
    el.listReady.innerHTML = ready.map(t => renderKdsTicketHtml(t, 'Mark Served 🍽️', 'completed')).join('');
    el.listCompleted.innerHTML = completed.map(t => renderKdsTicketHtml(t, 'Archived', null)).join('');
  }

  function renderKdsTicketHtml(tkt, actionText, nextStatus) {
    const minutes = Math.floor(tkt.elapsedSeconds / 60);
    const seconds = tkt.elapsedSeconds % 60;
    const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    let timerClass = 'timer-normal';
    if (minutes >= 12) timerClass = 'timer-urgent';
    else if (minutes >= 6) timerClass = 'timer-warn';

    return `
      <div class="kds-ticket" data-tktid="${tkt.id}">
        <div class="tkt-top">
          <span class="tkt-table">${escapeHtml(tkt.tableName)}</span>
          <span class="tkt-timer ${timerClass}">${timeFormatted}</span>
        </div>
        <div class="tkt-items-list">
          ${tkt.items.map(item => `
            <div class="tkt-item-row">
              <div class="tkt-item-head">
                <span><strong class="tkt-qty">${item.qty}x</strong> ${escapeHtml(item.name)}</span>
              </div>
              ${(item.modifiers || []).length > 0 ? `<span class="tkt-modifiers">${item.modifiers.map(m => escapeHtml(m)).join(' • ')}</span>` : ''}
            </div>
          `).join('')}
        </div>
        ${nextStatus ? `
          <div class="tkt-actions">
            <button type="button" class="btn-bump" data-tktid="${tkt.id}" data-nextstatus="${nextStatus}">
              <span>${actionText}</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }

  function bumpTicket(tktId, nextStatus) {
    const tkt = state.tickets.find(t => t.id === tktId);
    if (!tkt) return;

    tkt.status = nextStatus;
    saveTickets();
    playChefBump();
    broadcastEvent('BUMP_TICKET', { id: tktId, status: nextStatus });
    renderKdsBoard();
    renderFloorplan();
  }

  function updateTicketTimers() {
    state.tickets.forEach(t => {
      if (t.status !== 'completed') {
        t.elapsedSeconds = (t.elapsedSeconds || 0) + 1;
      }
    });

    // Re-render timer badges only if in KDS mode
    if (state.view === 'kds') {
      const ticketsEls = document.querySelectorAll('.kds-ticket');
      ticketsEls.forEach(card => {
        const id = card.dataset.tktid;
        const tkt = state.tickets.find(t => t.id === id);
        if (tkt) {
          const timerSpan = card.querySelector('.tkt-timer');
          if (timerSpan) {
            const minutes = Math.floor(tkt.elapsedSeconds / 60);
            const seconds = tkt.elapsedSeconds % 60;
            timerSpan.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            timerSpan.className = 'tkt-timer';
            if (minutes >= 12) timerSpan.classList.add('timer-urgent');
            else if (minutes >= 6) timerSpan.classList.add('timer-warn');
            else timerSpan.classList.add('timer-normal');
          }
        }
      });
    }
  }

  /* =========================================================================
     10. FLOORPLAN & THERMAL POS RECEIPT
     ========================================================================= */
  function renderFloorplan() {
    const tables = window.DINEFLOW_TABLES || [];
    el.floorTablesGrid.innerHTML = tables.map(t => {
      const isSelected = t.id === state.selectedFloorTable;
      const tktCount = state.tickets.filter(tk => tk.table === t.id && tk.status !== 'completed').length;
      let statusClass = 'status-vacant';
      let statusLabel = 'Vacant';

      if (tktCount > 0 || t.status === 'active' || t.status === 'occupied') {
        statusClass = 'status-occupied';
        statusLabel = `${tktCount} Active Orders`;
      } else if (t.status === 'billed') {
        statusClass = 'status-billed';
        statusLabel = 'Billed';
      }

      return `
        <div class="floor-table-card ${isSelected ? 'selected' : ''}" data-tableid="${t.id}">
          <div class="ft-top">
            <span class="ft-id">${t.id}</span>
            <span class="ft-status-dot ${statusClass}"></span>
          </div>
          <span class="ft-zone">${escapeHtml(t.name)}</span>
          <span class="ft-orders">${statusLabel}</span>
        </div>
      `;
    }).join('');
  }

  function renderPosReceipt() {
    const tableObj = (window.DINEFLOW_TABLES || []).find(t => t.id === state.selectedFloorTable) || { id: 'T04', name: 'Table 04' };
    el.posTableHeading.textContent = `${tableObj.name} &bull; ${tableObj.zone || 'Dining'}`;
    el.rcptTableId.textContent = `TABLE: ${tableObj.id}`;
    el.rcptTime.textContent = `TIME: ${new Date().toTimeString().split(' ')[0].slice(0, 5)}`;

    // Collect all items from tickets for this table
    const tableTickets = state.tickets.filter(tk => tk.table === tableObj.id);
    let items = [];
    tableTickets.forEach(tk => {
      items = items.concat(tk.items || []);
    });

    if (items.length === 0) {
      el.rcptItemsList.innerHTML = `
        <div style="padding: 12px 0; text-align: center; color: #666;">
          (No active orders for this table)
        </div>
      `;
      el.rcptSubtotal.textContent = '₹0.00';
      el.rcptCgst.textContent = '₹0.00';
      el.rcptSgst.textContent = '₹0.00';
      el.rcptService.textContent = '₹0.00';
      el.rcptGrandTotal.textContent = '₹0.00';
      return;
    }

    let subtotal = 0;
    el.rcptItemsList.innerHTML = items.map(it => {
      const lineTotal = it.price * it.qty;
      subtotal += lineTotal;
      return `
        <div class="rcpt-item-row">
          <span>${it.qty}x ${escapeHtml(it.name)}</span>
          <span>₹${lineTotal.toFixed(2)}</span>
        </div>
      `;
    }).join('');

    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const service = subtotal * 0.05;
    const grand = subtotal + cgst + sgst + service;

    el.rcptSubtotal.textContent = `₹${subtotal.toFixed(2)}`;
    el.rcptCgst.textContent = `₹${cgst.toFixed(2)}`;
    el.rcptSgst.textContent = `₹${sgst.toFixed(2)}`;
    el.rcptService.textContent = `₹${service.toFixed(2)}`;
    el.rcptGrandTotal.textContent = `₹${grand.toFixed(2)}`;
  }

  function printThermalReceipt() {
    window.print();
  }

  function settleTableBill() {
    const tableObj = (window.DINEFLOW_TABLES || []).find(t => t.id === state.selectedFloorTable);
    if (!tableObj) return;

    // Archive all tickets for this table
    state.tickets.forEach(tk => {
      if (tk.table === tableObj.id) tk.status = 'completed';
    });
    tableObj.status = 'vacant';
    tableObj.orderCount = 0;
    saveTickets();

    renderKdsBoard();
    renderFloorplan();
    renderPosReceipt();
    showToast(`Bill settled for ${tableObj.name}. Table reset to Vacant.`);
  }

  /* =========================================================================
     11. 86'D INVENTORY DRAWER
     ========================================================================= */
  function render86Drawer() {
    const menu = window.DINEFLOW_MENU || [];
    el.count86Items.textContent = state.outOfStock.size;
    el.list86Container.innerHTML = menu.map(item => {
      const is86 = state.outOfStock.has(item.id);
      return `
        <div class="item-86-row">
          <span>${escapeHtml(item.name)}</span>
          <button type="button" class="kds-action-btn toggle-86-btn ${is86 ? 'btn-simulate-rush' : ''}" data-itemid="${item.id}">
            <span>${is86 ? '✓ Restore to Menu' : '🚫 Mark 86\'d'}</span>
          </button>
        </div>
      `;
    }).join('');
  }

  function toggle86Item(itemId) {
    const is86 = state.outOfStock.has(itemId);
    if (is86) {
      state.outOfStock.delete(itemId);
    } else {
      state.outOfStock.add(itemId);
    }
    broadcastEvent('TOGGLE_86', { id: itemId, outOfStock: !is86 });
    renderMenu();
    render86Drawer();
  }

  /* =========================================================================
     12. UTILITIES (TOAST, ESCAPE)
     ========================================================================= */
  function showToast(msg) {
    el.dfToast.textContent = msg;
    el.dfToast.classList.add('show');
    clearTimeout(el.toastTimer);
    el.toastTimer = setTimeout(() => {
      el.dfToast.classList.remove('show');
    }, 3000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* =========================================================================
     13. EVENT BINDINGS
     ========================================================================= */
  function bindEvents() {
    // Navigation Views
    el.btnViewGuest.addEventListener('click', () => switchView('guest'));
    el.btnViewKds.addEventListener('click', () => switchView('kds'));
    el.btnViewFloor.addEventListener('click', () => switchView('floor'));

    // Audio Toggle
    el.audioToggleBtn.addEventListener('click', () => {
      state.audioMuted = !state.audioMuted;
      el.audioIcon.textContent = state.audioMuted ? '🔇' : '🔔';
      showToast(state.audioMuted ? 'Audio chime muted' : 'Audio chime enabled');
    });

    // Table Selector
    el.tableSelectorDropdown.addEventListener('change', (e) => {
      state.currentTable = e.target.value;
      const tables = window.DINEFLOW_TABLES || [];
      const tObj = tables.find(t => t.id === state.currentTable);
      if (tObj) el.activeTableLabel.textContent = tObj.name;
    });

    // Categories
    el.categoriesList.addEventListener('click', (e) => {
      const btn = e.target.closest('.category-tab-btn');
      if (btn && btn.dataset.cat) {
        state.activeCategory = btn.dataset.cat;
        document.querySelectorAll('.category-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMenu();
      }
    });

    // Dietary Pills
    el.dietaryPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.diet-pill');
      if (btn && btn.dataset.diet) {
        state.dietaryFilter = btn.dataset.diet;
        document.querySelectorAll('.diet-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMenu();
      }
    });

    // Search Input
    el.dishSearchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim();
      renderMenu();
    });

    // Dish Add / Open Modal
    el.menuGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-dish-add');
      if (btn && btn.dataset.dishid) {
        openDishModal(btn.dataset.dishid);
      }
    });

    // Modal Events
    el.modalCloseBtn.addEventListener('click', () => el.dishModalBackdrop.classList.remove('show'));
    el.dishModalBackdrop.addEventListener('click', (e) => {
      if (e.target === el.dishModalBackdrop) el.dishModalBackdrop.classList.remove('show');
    });

    el.modalQtyMinus.addEventListener('click', () => {
      if (state.modalQty > 1) {
        state.modalQty--;
        el.modalQtyVal.textContent = state.modalQty;
        calculateModalTotal();
      }
    });
    el.modalQtyPlus.addEventListener('click', () => {
      state.modalQty++;
      el.modalQtyVal.textContent = state.modalQty;
      calculateModalTotal();
    });

    el.modifierGroupsContainer.addEventListener('change', calculateModalTotal);
    el.modalAddBtn.addEventListener('click', addItemToCart);

    // Cart Drawer Toggle
    el.cartOpenBtn.addEventListener('click', () => el.cartDrawer.classList.add('open'));
    el.cartCloseBtn.addEventListener('click', () => el.cartDrawer.classList.remove('open'));

    // Cart Remove item
    el.cartItemsList.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-del-cart');
      if (btn && btn.dataset.cartidx !== undefined) {
        const idx = parseInt(btn.dataset.cartidx, 10);
        state.cart.splice(idx, 1);
        renderCart();
      }
    });

    // Dispatch Order
    el.btnDispatchOrder.addEventListener('click', dispatchCartOrder);

    // Call Waiter
    el.btnCallServer.addEventListener('click', () => {
      playBrassBell();
      broadcastEvent('CALL_WAITER', { tableName: el.activeTableLabel.textContent });
      showToast('🔔 Service bell dispatched — a waiter is arriving at Table 04');
    });

    // KDS Station Filter
    el.kdsStationsTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.kds-station-btn');
      if (btn && btn.dataset.station) {
        state.selectedStation = btn.dataset.station;
        document.querySelectorAll('.kds-station-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderKdsBoard();
      }
    });

    // KDS Ticket Bump Delegate
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-bump');
      if (btn && btn.dataset.tktid && btn.dataset.nextstatus) {
        bumpTicket(btn.dataset.tktid, btn.dataset.nextstatus);
      }
    });

    // KDS 86 Drawer
    el.btnToggle86Drawer.addEventListener('click', () => {
      render86Drawer();
      el.drawer86Backdrop.classList.add('show');
    });
    el.close86Btn.addEventListener('click', () => el.drawer86Backdrop.classList.remove('show'));
    el.drawer86Backdrop.addEventListener('click', (e) => {
      if (e.target === el.drawer86Backdrop) el.drawer86Backdrop.classList.remove('show');
    });

    el.list86Container.addEventListener('click', (e) => {
      const btn = e.target.closest('.toggle-86-btn');
      if (btn && btn.dataset.itemid) {
        toggle86Item(btn.dataset.itemid);
      }
    });

    // Simulate Dinner Rush
    el.btnSimulateRush.addEventListener('click', () => {
      const rushTicket = {
        id: `TKT-${Math.floor(200 + Math.random() * 800)}`,
        table: 'T02',
        tableName: 'Table 02 — Window Bay',
        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
        elapsedSeconds: 0,
        status: 'incoming',
        station: 'woodfire',
        items: [
          { name: 'Diavola & Nduja Calabrese Pizza', qty: 1, price: 860, station: 'woodfire', modifiers: ['Extra Fiery'] },
          { name: 'Burrata di Puglia & Heirloom Carpaccio', qty: 1, price: 680, station: 'larder', modifiers: ['Calabrian Chili Oil'] }
        ]
      };
      state.tickets.unshift(rushTicket);
      saveTickets();
      playBrassBell();
      broadcastEvent('NEW_ORDER', rushTicket);
      renderKdsBoard();
      renderFloorplan();
      showToast('⚡ Simulated live dinner order injected to KDS!');
    });

    // Floorplan selection
    el.floorTablesGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.floor-table-card');
      if (card && card.dataset.tableid) {
        state.selectedFloorTable = card.dataset.tableid;
        document.querySelectorAll('.floor-table-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        renderPosReceipt();
      }
    });

    // Thermal Print
    el.btnPrintReceipt.addEventListener('click', printThermalReceipt);

    // Settle Table
    el.btnSettleTable.addEventListener('click', settleTableBill);
  }

  // DOM Loaded
  window.addEventListener('DOMContentLoaded', init);
})();