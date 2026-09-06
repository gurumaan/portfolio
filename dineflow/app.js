// ============================================================================
// DINEFLOW — HOSPITALITY OPERATING SYSTEM & KDS
// Real-Time Table Ordering, Kitchen Display Engine & Hardware POS Audio
// ============================================================================

(function() {
  'use strict';

  // --- 1. AUDIO SYNTHESIZER ENGINE (Web Audio API) ---
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  // Realistic Acoustic Restaurant Counter Bell ('Ding Ding!')
  function playServiceBell() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // 1st Harmonic Ping
      [1760, 3520, 5280].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25 / (idx + 1), t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.25);
      });

      // 2nd Echo Ping (Delayed 120ms)
      const t2 = t + 0.12;
      [1840, 3680].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t2);
        gain.gain.setValueAtTime(0.28 / (idx + 1), t2);
        gain.gain.exponentialRampToValueAtTime(0.0001, t2 + 1.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t2);
        osc.stop(t2 + 1.45);
      });
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Tactile Chef Bump Sound
  function playBumpSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.08);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {}
  }

  // Cart Add Tick
  function playTapSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(440, t + 0.04);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {}
  }

  // POS Payment Settlement Cash Register Chime ('Ka-Ching!')
  function playPaymentSuccessChime() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;

      // Register Bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(2093, t); // C7
      osc.frequency.setValueAtTime(2637, t + 0.08); // E7
      osc.frequency.setValueAtTime(3136, t + 0.16); // G7
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 1.25);
    } catch (e) {}
  }

  // --- 2. CROSS-TAB & MULTI-VIEW BROADCAST BUS ---
  const SYNC_KEY = 'dineflow_channel_events_v2';
  let broadcastChannel = null;
  try {
    if ('BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('dineflow_bus');
      broadcastChannel.onmessage = (event) => handleIncomingSyncEvent(event.data);
    }
  } catch (e) {}

  window.addEventListener('storage', (event) => {
    if (event.key === SYNC_KEY && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        handleIncomingSyncEvent(data);
      } catch (e) {}
    }
  });

  function broadcastEvent(action, payload) {
    const event = { action, payload, timestamp: Date.now() };
    if (broadcastChannel) {
      try { broadcastChannel.postMessage(event); } catch (e) {}
    }
    try {
      localStorage.setItem(SYNC_KEY, JSON.stringify(event));
    } catch (e) {}
  }

  function handleIncomingSyncEvent(evt) {
    if (!evt || !evt.action) return;
    if (evt.action === 'NEW_ORDER') {
      playServiceBell();
      loadOrders();
      renderKDS();
      renderStats();
      showToast('New ticket incoming from ' + evt.payload.tableName);
    } else if (evt.action === 'STATUS_UPDATE') {
      loadOrders();
      renderKDS();
      renderCustomerOrderStatus();
      renderStats();
    } else if (evt.action === 'WAITER_CALL') {
      playServiceBell();
      displayKdsServiceAlert(evt.payload);
    } else if (evt.action === 'STOCK_TOGGLE') {
      loadOutOfStock();
      renderCustomerMenu();
      renderStockToggles();
    } else if (evt.action === 'PAYMENT_SETTLED') {
      playPaymentSuccessChime();
      loadOrders();
      renderKDS();
      renderCustomerOrderStatus();
      renderStats();
    }
  }

  // --- 3. APPLICATION STATE ---
  const state = {
    viewMode: 'split',
    currentTable: 'T-04',
    activeCategory: 'all',
    activeStation: 'all',
    cart: [],
    modalItem: null,
    orders: [],
    outOfStock: [],
    customerActiveOrder: null,
    activeWaiterAlert: null
  };

  // Seed sample realistic tickets if storage is fresh
  function initializeDefaultOrders() {
    const existing = localStorage.getItem('dineflow_orders_v2');
    if (existing) {
      try {
        state.orders = JSON.parse(existing);
        return;
      } catch (e) {}
    }

    const now = Date.now();
    state.orders = [
      {
        id: 'DF-8842',
        tableId: 'T-04',
        tableName: 'Table 04',
        status: 'cooking',
        createdAt: now - (6 * 60 * 1000 + 40 * 1000), // 6m 40s ago
        items: [
          { name: 'Slow-Braised Short Rib Tagliatelle', qty: 1, price: 680, modifiers: ['Calabrian Chili Kick', 'Fresh Shaved 24-mo Pecorino'], notes: 'Extra hot garnish' },
          { name: 'Burrata & Charred Peach Salad', qty: 1, price: 490, modifiers: ['Hot Chili Wildflower Honey'], notes: '' },
          { name: 'Nitro Cold Brew Float', qty: 2, price: 580, modifiers: ['Ethiopia Yirgacheffe'], notes: '' }
        ],
        notes: 'Guest celebrating anniversary',
        subtotal: 1750,
        tax: 87.5,
        serviceCharge: 87.5,
        total: 1925
      },
      {
        id: 'DF-8840',
        tableId: 'T-02',
        tableName: 'Table 02',
        status: 'ready',
        createdAt: now - (11 * 60 * 1000 + 10 * 1000), // 11m 10s ago
        items: [
          { name: 'Truffle Mushroom Sourdough Toast', qty: 1, price: 380, modifiers: ['36h Country Sourdough', 'Poached Free-Range Egg'], notes: '' },
          { name: 'Artisan Oat Flat White', qty: 1, price: 240, modifiers: ['Oatly Barista', 'Double Ristretto'], notes: '' }
        ],
        notes: '',
        subtotal: 620,
        tax: 31,
        serviceCharge: 31,
        total: 682
      },
      {
        id: 'DF-8837',
        tableId: 'T-07',
        tableName: 'Table 07',
        status: 'served',
        createdAt: now - (28 * 60 * 1000),
        items: [
          { name: 'Wood-Fired Neapolitan Burrata Pizza', qty: 1, price: 640, modifiers: ['Leopard Char Crust'], notes: '' },
          { name: 'Cascara & Grapefruit Botanicals', qty: 1, price: 260, modifiers: ['Clear Ice Block'], notes: '' }
        ],
        notes: '',
        subtotal: 900,
        tax: 45,
        serviceCharge: 45,
        total: 990
      }
    ];
    saveOrders();
  }

  function saveOrders() {
    try {
      localStorage.setItem('dineflow_orders_v2', JSON.stringify(state.orders));
    } catch (e) {}
  }

  function loadOrders() {
    try {
      const data = localStorage.getItem('dineflow_orders_v2');
      if (data) state.orders = JSON.parse(data);
    } catch (e) {}
  }

  function loadOutOfStock() {
    try {
      const data = localStorage.getItem('dineflow_out_of_stock');
      if (data) state.outOfStock = JSON.parse(data);
    } catch (e) {}
  }

  function saveOutOfStock() {
    try {
      localStorage.setItem('dineflow_out_of_stock', JSON.stringify(state.outOfStock));
    } catch (e) {}
  }

  // --- 4. TOAST NOTIFICATION UTILITY ---
  function showToast(msg) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'df-toast';
    toast.innerHTML = `<span>⚡</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- 5. RENDER CUSTOMER MENU ---
  function renderCustomerMenu() {
    const container = document.getElementById('menuGrid');
    if (!container || !window.DINEFLOW_MENU) return;

    const filtered = window.DINEFLOW_MENU.filter(item => {
      if (state.activeCategory === 'all') return true;
      return item.category === state.activeCategory;
    });

    container.innerHTML = filtered.map(item => {
      const is86 = state.outOfStock.includes(item.id);
      const dietClass = item.diet === 'veg' ? 'diet-veg' : 'diet-nonveg';
      const dietTitle = item.diet === 'veg' ? 'Vegetarian' : 'Non-Vegetarian';
      const specialTag = item.tags.find(t => t.includes('Signature') || t.includes('Special'));

      return `
        <article class="menu-card ${is86 ? 'is-soldout' : ''}" data-id="${item.id}">
          <div class="menu-content">
            <div class="menu-header-row">
              <span class="diet-indicator ${dietClass}" title="${dietTitle}"></span>
              <h4 class="dish-title">${item.name}</h4>
            </div>
            <p class="dish-desc">${item.description}</p>
            <div class="menu-footer-row">
              <div>
                <span class="dish-price">₹${item.price}</span>
                <span class="dish-cal">&bull; ${item.calories}</span>
              </div>
              <button class="btn-customize-add" data-id="${item.id}" ${is86 ? 'disabled' : ''}>
                ${is86 ? 'Sold Out' : '+ Add'}
              </button>
            </div>
          </div>

          <div class="menu-img-wrap">
            <img 
              src="${item.image}" 
              alt="${item.name}" 
              loading="lazy" 
              class="menu-img"
              onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';" 
            />
            ${specialTag ? `<span class="badge-tag-special">${specialTag}</span>` : ''}
            <span class="dish-time-badge">⏱ ${item.prepTime}</span>
          </div>
        </article>
      `;
    }).join('');

    // Attach click listeners to open modifier modal
    container.querySelectorAll('.btn-customize-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openModifierModal(btn.dataset.id);
      });
    });
  }

  // --- 6. MODIFIERS & CUSTOMIZATION MODAL ---
  function openModifierModal(itemId) {
    const item = window.DINEFLOW_MENU.find(m => m.id === itemId);
    if (!item) return;
    state.modalItem = item;
    playTapSound();

    const modal = document.getElementById('modifierModal');
    const title = document.getElementById('modalItemTitle');
    const price = document.getElementById('modalBasePrice');
    const desc = document.getElementById('modalItemDesc');
    const body = document.getElementById('modalModifiersBody');
    const notesInput = document.getElementById('modalChefNotes');
    if (!modal) return;

    title.textContent = item.name;
    price.textContent = '₹' + item.price;
    desc.textContent = item.description;
    if (notesInput) notesInput.value = '';

    body.innerHTML = (item.modifiers || []).map((grp) => {
      return `
        <div class="mod-group" data-group-id="${grp.id}">
          <div class="mod-group-head">
            <span class="mod-group-title">${grp.name}</span>
            <span class="mod-group-req">${grp.required ? 'Required (Choose 1)' : 'Optional'}</span>
          </div>
          <div class="mod-options-list">
            ${grp.options.map((opt, oIdx) => {
              const inputType = grp.multiple ? 'checkbox' : 'radio';
              const inputName = 'mod_' + grp.id;
              const inputId = `opt_${grp.id}_${oIdx}`;
              const isDefault = opt.default ? 'checked' : '';
              return `
                <label class="mod-option-row" for="${inputId}">
                  <input type="${inputType}" id="${inputId}" name="${inputName}" 
                         value="${opt.name}" data-price="${opt.price}" ${isDefault} class="mod-input" />
                  <span class="mod-opt-name">${opt.name}</span>
                  <span class="mod-opt-price">${opt.price > 0 ? '+₹' + opt.price : 'Free'}</span>
                </label>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    updateModalCalculatedPrice();

    body.querySelectorAll('.mod-input').forEach(input => {
      input.addEventListener('change', updateModalCalculatedPrice);
    });

    modal.classList.add('active');
  }

  function updateModalCalculatedPrice() {
    if (!state.modalItem) return;
    let total = state.modalItem.price;

    document.querySelectorAll('#modalModifiersBody .mod-input:checked').forEach(inp => {
      total += parseFloat(inp.dataset.price || 0);
    });

    const addBtn = document.getElementById('btnConfirmAddToCart');
    if (addBtn) {
      addBtn.textContent = `Add to Tray • ₹${total}`;
    }
  }

  // Dismiss modifier modal
  const dismissModBtn = document.getElementById('btnDismissModal');
  const closeModBtn = document.getElementById('btnCloseModModal');
  [dismissModBtn, closeModBtn].forEach(b => {
    if (b) {
      b.addEventListener('click', () => {
        document.getElementById('modifierModal')?.classList.remove('active');
        state.modalItem = null;
      });
    }
  });

  // Confirm Add to Tray
  const confirmAddBtn = document.getElementById('btnConfirmAddToCart');
  if (confirmAddBtn) {
    confirmAddBtn.addEventListener('click', () => {
      if (!state.modalItem) return;
      playTapSound();

      const selectedMods = [];
      let calculatedPrice = state.modalItem.price;

      document.querySelectorAll('#modalModifiersBody .mod-input:checked').forEach(inp => {
        selectedMods.push(inp.value);
        calculatedPrice += parseFloat(inp.dataset.price || 0);
      });

      const notes = document.getElementById('modalChefNotes')?.value.trim() || '';

      const cartEntry = {
        cartItemId: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        id: state.modalItem.id,
        name: state.modalItem.name,
        station: state.modalItem.station || 'grill',
        basePrice: state.modalItem.price,
        totalPrice: calculatedPrice,
        modifiers: selectedMods,
        notes: notes,
        qty: 1
      };

      state.cart.push(cartEntry);
      document.getElementById('modifierModal')?.classList.remove('active');
      state.modalItem = null;

      renderCart();
      showToast(`${cartEntry.name} added to tray`);
    });
  }

  // --- 7. CART & ORDER TRAY MANAGEMENT ---
  function renderCart() {
    const trayCount = document.getElementById('trayItemCount');
    const trayTotal = document.getElementById('trayTotalAmount');
    const cartList = document.getElementById('cartItemsList');
    const subtotalEl = document.getElementById('cartSubtotal');
    const taxEl = document.getElementById('cartTax');
    const serviceEl = document.getElementById('cartServiceCharge');
    const grandEl = document.getElementById('cartGrandTotal');

    const totalQty = state.cart.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = state.cart.reduce((sum, i) => sum + (i.totalPrice * i.qty), 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const service = Math.round(subtotal * 0.05 * 100) / 100;
    const grandTotal = subtotal + tax + service;

    if (trayCount) trayCount.textContent = `${totalQty} item${totalQty !== 1 ? 's' : ''}`;
    if (trayTotal) trayTotal.textContent = `₹${grandTotal.toFixed(2)}`;

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `₹${tax.toFixed(2)}`;
    if (serviceEl) serviceEl.textContent = `₹${service.toFixed(2)}`;
    if (grandEl) grandEl.textContent = `₹${grandTotal.toFixed(2)}`;

    // Update payment modal amount if open
    const pmAmt = document.getElementById('pmAmountValue');
    if (pmAmt) pmAmt.textContent = `₹${grandTotal.toFixed(2)}`;

    if (!cartList) return;

    if (state.cart.length === 0) {
      cartList.innerHTML = `<div class="kds-empty-col">Your order tray is empty.<br/>Browse the menu to add dishes.</div>`;
      return;
    }

    cartList.innerHTML = state.cart.map(item => `
      <div class="cart-item-card" data-cid="${item.cartItemId}">
        <div class="ci-info">
          <div class="ci-name">${item.name}</div>
          ${item.modifiers.length > 0 ? `<div class="ci-mods">${item.modifiers.join(', ')}</div>` : ''}
          ${item.notes ? `<div class="ci-notes">"${item.notes}"</div>` : ''}
        </div>
        <div class="ci-right">
          <div class="ci-price">₹${(item.totalPrice * item.qty).toFixed(2)}</div>
          <div class="ci-qty-stepper">
            <button class="ci-btn-step btn-minus" data-cid="${item.cartItemId}">-</button>
            <span class="ci-qty-val">${item.qty}</span>
            <button class="ci-btn-step btn-plus" data-cid="${item.cartItemId}">+</button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach step listeners
    cartList.querySelectorAll('.btn-minus').forEach(btn => {
      btn.addEventListener('click', () => {
        const cid = btn.dataset.cid;
        const entry = state.cart.find(i => i.cartItemId === cid);
        if (!entry) return;
        if (entry.qty > 1) {
          entry.qty -= 1;
        } else {
          state.cart = state.cart.filter(i => i.cartItemId !== cid);
        }
        renderCart();
      });
    });

    cartList.querySelectorAll('.btn-plus').forEach(btn => {
      btn.addEventListener('click', () => {
        const cid = btn.dataset.cid;
        const entry = state.cart.find(i => i.cartItemId === cid);
        if (entry) {
          entry.qty += 1;
          renderCart();
        }
      });
    });
  }

  // Open/Close Cart Drawer
  const trayBar = document.getElementById('customerTrayBar');
  const cartDrawer = document.getElementById('cartDrawer');
  const closeCartBtn = document.getElementById('btnCloseCartDrawer');

  if (trayBar) {
    trayBar.addEventListener('click', () => {
      cartDrawer?.classList.add('active');
    });
  }
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
      cartDrawer?.classList.remove('active');
    });
  }

  // --- 8. SUBMIT ORDER TO KITCHEN ---
  const submitOrderBtn = document.getElementById('btnSubmitOrder');
  if (submitOrderBtn) {
    submitOrderBtn.addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('Your tray is empty! Add items first.');
        return;
      }

      playServiceBell();

      const tableObj = (window.DINEFLOW_TABLES || []).find(t => t.id === state.currentTable) || { name: 'Table 04' };
      const orderNum = 'DF-' + Math.floor(1000 + Math.random() * 9000);
      const subtotal = state.cart.reduce((sum, item) => sum + (item.totalPrice * item.qty), 0);
      const tax = Math.round(subtotal * 0.05 * 100) / 100;
      const service = Math.round(subtotal * 0.05 * 100) / 100;

      const newOrder = {
        id: orderNum,
        tableId: state.currentTable,
        tableName: tableObj.name,
        status: 'incoming',
        createdAt: Date.now(),
        items: state.cart.map(i => ({
          name: i.name,
          station: i.station || 'grill',
          qty: i.qty,
          price: i.totalPrice,
          modifiers: i.modifiers,
          notes: i.notes
        })),
        notes: state.cart.map(i => i.notes).filter(Boolean).join(' | '),
        subtotal: subtotal,
        tax: tax,
        serviceCharge: service,
        total: subtotal + tax + service
      };

      state.orders.unshift(newOrder);
      saveOrders();

      broadcastEvent('NEW_ORDER', newOrder);

      state.customerActiveOrder = newOrder;
      state.cart = [];
      renderCart();

      cartDrawer?.classList.remove('active');

      renderCustomerOrderStatus();
      renderKDS();
      renderStats();
      showToast(`Ticket #${newOrder.id} dispatched to kitchen!`);
    });
  }

  // --- 9. CUSTOMER LIVE ORDER TRACKER & DYNAMIC ISLAND ---
  function renderCustomerOrderStatus() {
    const banner = document.getElementById('activeOrderPillBanner');
    const islandPill = document.getElementById('islandPill');
    const aopTitle = document.getElementById('aopTitle');
    const aopSub = document.getElementById('aopSubtitle');

    if (!state.customerActiveOrder) {
      if (banner) banner.style.display = 'none';
      if (islandPill) islandPill.style.display = 'none';
      return;
    }

    const current = state.orders.find(o => o.id === state.customerActiveOrder.id) || state.customerActiveOrder;

    if (banner) banner.style.display = 'flex';
    if (islandPill) islandPill.style.display = 'flex';

    let statusText = 'Received';
    let subText = 'Sent to kitchen display';

    if (current.status === 'incoming') {
      statusText = 'Received';
      subText = 'Order ticket queued at chef station';
    } else if (current.status === 'cooking') {
      statusText = 'Cooking';
      subText = 'Chef is preparing your meal 🔥';
    } else if (current.status === 'ready') {
      statusText = 'Plated & Ready';
      subText = 'Dishes ready at service window 🛎️';
    } else if (current.status === 'served') {
      statusText = 'Served & Settled';
      subText = 'Hope you enjoyed your meal! ✨';
    }

    if (aopTitle) aopTitle.textContent = `#${current.id} — ${statusText}`;
    if (aopSub) aopSub.textContent = subText;
    const islandText = islandPill?.querySelector('.island-text');
    if (islandText) islandText.textContent = statusText;
  }

  // Track Live Modal open
  const trackBtn = document.getElementById('btnTrackActiveOrder');
  const trackerModal = document.getElementById('customerOrderTrackerModal');
  const dismissTrackerBtn = document.getElementById('btnDismissTracker');

  if (trackBtn) {
    trackBtn.addEventListener('click', () => {
      openTrackerModal();
    });
  }

  function openTrackerModal() {
    if (!state.customerActiveOrder) return;
    const current = state.orders.find(o => o.id === state.customerActiveOrder.id) || state.customerActiveOrder;

    const modal = document.getElementById('customerOrderTrackerModal');
    const orderIdEl = document.getElementById('trackerOrderId');
    const tableEl = document.getElementById('trackerTableName');
    const titleEl = document.getElementById('trackerStatusTitle');
    const descEl = document.getElementById('trackerStatusDesc');

    const stepReceived = document.getElementById('stepReceived');
    const stepCooking = document.getElementById('stepCooking');
    const stepReady = document.getElementById('stepReady');
    const stepServed = document.getElementById('stepServed');

    if (orderIdEl) orderIdEl.textContent = '#' + current.id;
    if (tableEl) tableEl.textContent = current.tableName;

    [stepReceived, stepCooking, stepReady, stepServed].forEach(s => s && s.classList.remove('active', 'completed'));

    if (current.status === 'incoming') {
      if (titleEl) titleEl.textContent = 'Order Queued in Kitchen';
      if (descEl) descEl.textContent = 'Ticket sent to Chef Terminal. Waiting for prep confirmation.';
      if (stepReceived) stepReceived.classList.add('active');
    } else if (current.status === 'cooking') {
      if (titleEl) titleEl.textContent = 'Chef is Preparing Your Meal 🔥';
      if (descEl) descEl.textContent = 'Dishes are currently sizzling on the wood-fired grill line.';
      if (stepReceived) stepReceived.classList.add('completed');
      if (stepCooking) stepCooking.classList.add('active');
    } else if (current.status === 'ready') {
      if (titleEl) titleEl.textContent = 'Dishes Ready for Pickup 🛎️';
      if (descEl) descEl.textContent = 'Plated and ready at the service expediting pass.';
      if (stepReceived) stepReceived.classList.add('completed');
      if (stepCooking) stepCooking.classList.add('completed');
      if (stepReady) stepReady.classList.add('active');
    } else if (current.status === 'served') {
      if (titleEl) titleEl.textContent = 'Served & Settled ✨';
      if (descEl) descEl.textContent = 'Thank you for dining with us! View your thermal tax invoice below.';
      if (stepReceived) stepReceived.classList.add('completed');
      if (stepCooking) stepCooking.classList.add('completed');
      if (stepReady) stepReady.classList.add('completed');
      if (stepServed) stepServed.classList.add('active');
    }

    modal?.classList.add('active');
  }

  if (dismissTrackerBtn) {
    dismissTrackerBtn.addEventListener('click', () => {
      trackerModal?.classList.remove('active');
    });
  }

  // View receipt from tracker
  const trackerReceiptBtn = document.getElementById('btnViewReceiptFromTracker');
  if (trackerReceiptBtn) {
    trackerReceiptBtn.addEventListener('click', () => {
      trackerModal?.classList.remove('active');
      if (state.customerActiveOrder) {
        openThermalReceipt(state.customerActiveOrder.id);
      }
    });
  }

  // --- 10. WAITER SERVICE REQUEST CALL ---
  const openWaiterCallBtn = document.getElementById('btnOpenWaiterCall');
  const waiterCallModal = document.getElementById('waiterCallModal');
  const closeWaiterBtn = document.getElementById('btnCloseWaiterModal');
  const cancelWaiterBtn = document.getElementById('btnCancelWaiterCall');

  if (openWaiterCallBtn) {
    openWaiterCallBtn.addEventListener('click', () => {
      waiterCallModal?.classList.add('active');
    });
  }

  [closeWaiterBtn, cancelWaiterBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        waiterCallModal?.classList.remove('active');
      });
    }
  });

  document.querySelectorAll('.wc-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const reason = btn.dataset.reason;
      waiterCallModal?.classList.remove('active');
      playTapSound();

      const payload = {
        tableId: state.currentTable,
        tableName: 'Table 04',
        reason: reason,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      broadcastEvent('WAITER_CALL', payload);
      displayKdsServiceAlert(payload);
      showToast(`Server notified for "${reason}" at Table 04`);
    });
  });

  function displayKdsServiceAlert(payload) {
    const banner = document.getElementById('kdsServiceAlertBanner');
    const textEl = document.getElementById('alertTableText');
    const timeEl = document.getElementById('alertTimestamp');
    if (!banner || !textEl) return;

    textEl.textContent = `${payload.tableName} requested: ${payload.reason}`;
    if (timeEl) timeEl.textContent = `At ${payload.time}`;
    banner.style.display = 'flex';
  }

  const ackServiceBtn = document.getElementById('btnAckService');
  if (ackServiceBtn) {
    ackServiceBtn.addEventListener('click', () => {
      const banner = document.getElementById('kdsServiceAlertBanner');
      if (banner) banner.style.display = 'none';
      playBumpSound();
      showToast('Service call acknowledged');
    });
  }

  // --- 11. INTERACTIVE PAYMENT SIMULATION (UPI QR & CARD) ---
  const openPaymentBtn = document.getElementById('btnOpenPaymentModal');
  const paymentModal = document.getElementById('paymentModal');
  const closePaymentBtn = document.getElementById('btnClosePaymentModal');

  if (openPaymentBtn) {
    openPaymentBtn.addEventListener('click', () => {
      cartDrawer?.classList.remove('active');
      openPaymentGateway();
    });
  }

  if (closePaymentBtn) {
    closePaymentBtn.addEventListener('click', () => {
      paymentModal?.classList.remove('active');
    });
  }

  function openPaymentGateway() {
    const modal = document.getElementById('paymentModal');
    const contentStep = document.getElementById('paymentContentStep');
    const procStep = document.getElementById('paymentProcessingStep');
    const succStep = document.getElementById('paymentSuccessStep');
    const pmAmt = document.getElementById('pmAmountValue');

    if (!modal) return;

    // Reset steps
    if (contentStep) contentStep.style.display = 'block';
    if (procStep) procStep.style.display = 'none';
    if (succStep) succStep.style.display = 'none';

    // Calculate due amount
    let totalDue = 0;
    if (state.cart.length > 0) {
      const subtotal = state.cart.reduce((sum, i) => sum + (i.totalPrice * i.qty), 0);
      totalDue = subtotal + (subtotal * 0.1); // +10% taxes/charges
    } else if (state.customerActiveOrder) {
      totalDue = state.customerActiveOrder.total;
    } else {
      totalDue = 1925; // fallback demo check for Table 04
    }

    if (pmAmt) pmAmt.textContent = `₹${totalDue.toFixed(2)}`;

    modal.classList.add('active');
  }

  // Switch tabs in payment modal
  const tabUpi = document.getElementById('tabUpi');
  const tabCard = document.getElementById('tabCard');
  const paneUpi = document.getElementById('paneUpi');
  const paneCard = document.getElementById('paneCard');

  if (tabUpi && tabCard) {
    tabUpi.addEventListener('click', () => {
      tabUpi.classList.add('active');
      tabCard.classList.remove('active');
      paneUpi?.classList.add('active');
      paneCard?.classList.remove('active');
    });

    tabCard.addEventListener('click', () => {
      tabCard.classList.add('active');
      tabUpi.classList.remove('active');
      paneCard?.classList.add('active');
      paneUpi?.classList.remove('active');
    });
  }

  // Simulate Payments
  const simulateUpiBtn = document.getElementById('btnSimulateUpiPay');
  const simulateCardBtn = document.getElementById('btnSimulateCardPay');

  [simulateUpiBtn, simulateCardBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        executePaymentSimulation(btn.id === 'btnSimulateUpiPay' ? 'UPI' : 'Card');
      });
    }
  });

  function executePaymentSimulation(method) {
    const contentStep = document.getElementById('paymentContentStep');
    const procStep = document.getElementById('paymentProcessingStep');
    const succStep = document.getElementById('paymentSuccessStep');
    const successText = document.getElementById('pmSuccessText');
    const refBadge = document.getElementById('pmRefBadge');

    if (contentStep) contentStep.style.display = 'none';
    if (procStep) procStep.style.display = 'flex';

    // Simulate 1.2s bank network latency
    setTimeout(() => {
      playPaymentSuccessChime();

      if (procStep) procStep.style.display = 'none';
      if (succStep) succStep.style.display = 'flex';

      const txnRef = `TXN-${method.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`;
      if (refBadge) refBadge.textContent = txnRef;

      // Settle active order or cart
      let settledOrder = state.customerActiveOrder;
      if (!settledOrder && state.cart.length > 0) {
        // Automatically create and settle
        const subtotal = state.cart.reduce((sum, item) => sum + (item.totalPrice * item.qty), 0);
        const tax = Math.round(subtotal * 0.05 * 100) / 100;
        const service = Math.round(subtotal * 0.05 * 100) / 100;
        settledOrder = {
          id: 'DF-' + Math.floor(1000 + Math.random() * 9000),
          tableId: state.currentTable,
          tableName: 'Table 04',
          status: 'served',
          createdAt: Date.now(),
          settledAt: Date.now(),
          paymentMethod: method,
          txnRef: txnRef,
          items: [...state.cart],
          subtotal: subtotal,
          tax: tax,
          serviceCharge: service,
          total: subtotal + tax + service
        };
        state.orders.unshift(settledOrder);
        state.cart = [];
        renderCart();
      } else if (settledOrder) {
        settledOrder.status = 'served';
        settledOrder.paymentMethod = method;
        settledOrder.txnRef = txnRef;
        settledOrder.settledAt = Date.now();
      } else if (state.orders.length > 0) {
        settledOrder = state.orders[0];
        settledOrder.status = 'served';
        settledOrder.paymentMethod = method;
        settledOrder.txnRef = txnRef;
      }

      saveOrders();
      broadcastEvent('PAYMENT_SETTLED', { orderId: settledOrder?.id, txnRef });

      if (successText && settledOrder) {
        successText.textContent = `₹${settledOrder.total.toFixed(2)} successfully settled via ${method}`;
      }

      state.customerActiveOrder = settledOrder;
      renderKDS();
      renderCustomerOrderStatus();
      renderStats();
    }, 1200);
  }

  // View Receipt After Pay
  const viewReceiptAfterPayBtn = document.getElementById('btnViewReceiptAfterPay');
  if (viewReceiptAfterPayBtn) {
    viewReceiptAfterPayBtn.addEventListener('click', () => {
      document.getElementById('paymentModal')?.classList.remove('active');
      if (state.customerActiveOrder) {
        openThermalReceipt(state.customerActiveOrder.id);
      }
    });
  }

  // --- 12. KITCHEN DISPLAY SYSTEM (KDS) RENDERING & MULTI-STATION ROUTING ---
  function renderKDS() {
    const colIncoming = document.getElementById('kdsColIncoming');
    const colCooking = document.getElementById('kdsColCooking');
    const colReady = document.getElementById('kdsColReady');
    const colServed = document.getElementById('kdsColServed');

    if (!colIncoming || !colCooking || !colReady || !colServed) return;

    // Filter by Active Station
    const filteredOrders = state.orders.filter(order => {
      if (state.activeStation === 'all') return true;
      // Match if any item in order belongs to this station
      return order.items.some(it => {
        const menuItem = (window.DINEFLOW_MENU || []).find(m => m.name === it.name);
        const itemStation = it.station || menuItem?.station || 'grill';
        return itemStation === state.activeStation;
      });
    });

    const ordersByStatus = {
      incoming: filteredOrders.filter(o => o.status === 'incoming'),
      cooking: filteredOrders.filter(o => o.status === 'cooking'),
      ready: filteredOrders.filter(o => o.status === 'ready'),
      served: filteredOrders.filter(o => o.status === 'served')
    };

    // Update column badge counters
    document.getElementById('countIncoming')?.replaceChildren(document.createTextNode(ordersByStatus.incoming.length));
    document.getElementById('countCooking')?.replaceChildren(document.createTextNode(ordersByStatus.cooking.length));
    document.getElementById('countReady')?.replaceChildren(document.createTextNode(ordersByStatus.ready.length));
    document.getElementById('countServed')?.replaceChildren(document.createTextNode(ordersByStatus.served.length));

    // Update active tickets in top tools
    const totalActive = ordersByStatus.incoming.length + ordersByStatus.cooking.length + ordersByStatus.ready.length;
    const activeCountEl = document.getElementById('kdsActiveCount');
    if (activeCountEl) activeCountEl.textContent = totalActive;

    // Update Station Badge Counts
    updateStationBadges();

    // Render Cards
    renderKDSColumn(colIncoming, ordersByStatus.incoming, 'incoming');
    renderKDSColumn(colCooking, ordersByStatus.cooking, 'cooking');
    renderKDSColumn(colReady, ordersByStatus.ready, 'ready');
    renderKDSColumn(colServed, ordersByStatus.served.slice(0, 5), 'served');
  }

  function updateStationBadges() {
    const stations = ['all', 'grill', 'larder', 'barista', 'pastry'];
    stations.forEach(stn => {
      const badge = document.getElementById(`badgeStn${stn.charAt(0).toUpperCase() + stn.slice(1)}`);
      if (!badge) return;
      if (stn === 'all') {
        const count = state.orders.filter(o => o.status !== 'served').length;
        badge.textContent = count;
      } else {
        const count = state.orders.filter(o => {
          if (o.status === 'served') return false;
          return o.items.some(it => {
            const menuItem = (window.DINEFLOW_MENU || []).find(m => m.name === it.name);
            return (it.station || menuItem?.station) === stn;
          });
        }).length;
        badge.textContent = count;
      }
    });
  }

  function renderKDSColumn(container, orders, columnStatus) {
    if (orders.length === 0) {
      container.innerHTML = `<div class="kds-empty-col">No tickets currently</div>`;
      return;
    }

    container.innerHTML = orders.map(order => {
      const elapsedSec = Math.floor((Date.now() - order.createdAt) / 1000);
      const elapsedMin = Math.floor(elapsedSec / 60);
      const elapsedRemSec = elapsedSec % 60;
      const formattedTime = `${String(elapsedMin).padStart(2, '0')}:${String(elapsedRemSec).padStart(2, '0')}`;

      let alertClass = 'urgency-normal';
      if (order.status !== 'served') {
        if (elapsedMin >= 12) alertClass = 'urgency-delayed';
        else if (elapsedMin >= 8) alertClass = 'urgency-warning';
      }

      let actionBtnHtml = '';
      if (columnStatus === 'incoming') {
        actionBtnHtml = `<button class="kds-bump-btn btn-fire" data-action="cooking" data-id="${order.id}">🔥 Start Cooking</button>`;
      } else if (columnStatus === 'cooking') {
        actionBtnHtml = `<button class="kds-bump-btn btn-ready" data-action="ready" data-id="${order.id}">🛎️ Mark Ready</button>`;
      } else if (columnStatus === 'ready') {
        actionBtnHtml = `<button class="kds-bump-btn btn-complete" data-action="served" data-id="${order.id}">✓ Mark Served</button>`;
      } else {
        actionBtnHtml = `<button class="kds-bump-btn btn-receipt" data-action="receipt" data-id="${order.id}">🖨️ View Receipt</button>`;
      }

      return `
        <div class="kds-ticket ${alertClass}" data-id="${order.id}" data-created="${order.createdAt}">
          <div class="ticket-head">
            <div class="ticket-left">
              <span class="ticket-table">${order.tableName}</span>
              <span class="ticket-id">#${order.id}</span>
            </div>
            <div class="ticket-right">
              <span class="ticket-timer" id="timer_${order.id}">⏱ ${formattedTime}</span>
            </div>
          </div>

          <div class="ticket-items-list">
            ${order.items.map(item => {
              return `
                <div class="t-item">
                  <div class="t-item-line">
                    <span class="t-qty">${item.qty}×</span>
                    <span class="t-name">${item.name}</span>
                  </div>
                  ${item.modifiers && item.modifiers.length > 0 ? `
                    <div class="t-mods">${item.modifiers.join(', ')}</div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>

          ${order.notes ? `
            <div class="ticket-chef-notes">
              <strong>Special Note:</strong> ${order.notes}
            </div>
          ` : ''}

          <div class="ticket-actions">
            ${actionBtnHtml}
            <button class="btn-quick-receipt" data-id="${order.id}" title="Print Thermal Tax Invoice">🖨️</button>
          </div>
        </div>
      `;
    }).join('');

    // Attach bump listeners
    container.querySelectorAll('.kds-bump-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const nextAction = btn.dataset.action;
        if (nextAction === 'receipt') {
          openThermalReceipt(id);
        } else {
          bumpOrderStatus(id, nextAction);
        }
      });
    });

    container.querySelectorAll('.btn-quick-receipt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openThermalReceipt(btn.dataset.id);
      });
    });
  }

  // Bump Order Status
  function bumpOrderStatus(orderId, newStatus) {
    playBumpSound();
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = newStatus;
    order.updatedAt = Date.now();
    saveOrders();

    broadcastEvent('STATUS_UPDATE', { id: order.id, status: newStatus });

    renderKDS();
    renderCustomerOrderStatus();
    renderStats();
    showToast(`Order #${order.id} moved to "${newStatus}"`);
  }

  // Interval for KDS active seconds
  function startKDSTimerInterval() {
    setInterval(() => {
      const now = Date.now();
      document.querySelectorAll('.kds-ticket').forEach(ticket => {
        const created = parseInt(ticket.dataset.created || '0', 10);
        if (!created) return;
        const elapsedSec = Math.floor((now - created) / 1000);
        const elapsedMin = Math.floor(elapsedSec / 60);
        const elapsedRemSec = elapsedSec % 60;
        const timerEl = ticket.querySelector('.ticket-timer');
        if (timerEl) {
          timerEl.textContent = `⏱ ${String(elapsedMin).padStart(2, '0')}:${String(elapsedRemSec).padStart(2, '0')}`;
        }

        if (elapsedMin >= 12) {
          ticket.classList.remove('urgency-normal', 'urgency-warning');
          ticket.classList.add('urgency-delayed');
        } else if (elapsedMin >= 8) {
          ticket.classList.remove('urgency-normal', 'urgency-delayed');
          ticket.classList.add('urgency-warning');
        }
      });
    }, 1000);
  }

  // Station Filter Buttons Click
  document.querySelectorAll('.station-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.station-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeStation = btn.dataset.station;
      playTapSound();
      renderKDS();
    });
  });

  // Test Bell Chime Button
  const testBellBtn = document.getElementById('btnTestBell');
  if (testBellBtn) {
    testBellBtn.addEventListener('click', () => {
      playServiceBell();
      showToast('Synthesized 1.8kHz brass service bell triggered');
    });
  }

  // --- 13. STATS, TELEMETRY & FLOOR MANAGEMENT ---
  function renderStats() {
    const totalRevenue = state.orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const completedOrders = state.orders.filter(o => o.status === 'served');
    const activeOrders = state.orders.filter(o => o.status !== 'served');

    const revEl = document.getElementById('statTotalRevenue');
    const activeEl = document.getElementById('statActiveTickets');
    const avgPrepEl = document.getElementById('statAvgPrepTime');
    const completedEl = document.getElementById('statCompletedOrders');

    if (revEl) revEl.textContent = '₹' + totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    if (activeEl) activeEl.textContent = activeOrders.length;
    if (completedEl) completedEl.textContent = completedOrders.length;

    renderFloorPlan();
    renderStockToggles();
  }

  function renderFloorPlan() {
    const grid = document.getElementById('floorPlanGrid');
    if (!grid || !window.DINEFLOW_TABLES) return;

    grid.innerHTML = window.DINEFLOW_TABLES.map(table => {
      const activeOrderForTable = state.orders.find(o => o.tableId === table.id && o.status !== 'served');
      const hasActive = !!activeOrderForTable;
      const statusClass = hasActive ? 'status-active-session' : (table.status === 'Occupied' ? 'status-occupied' : 'status-available');
      const statusLabel = hasActive ? 'Active Order' : table.status;
      const runningBill = activeOrderForTable ? `₹${activeOrderForTable.total.toFixed(0)}` : '₹0';

      return `
        <div class="table-floor-card ${hasActive ? 'is-active' : ''}">
          <div class="tfc-head">
            <span class="tfc-name">${table.name}</span>
            <span class="tfc-status-pill ${statusClass}">${statusLabel}</span>
          </div>
          <div class="tfc-meta">${table.type} &bull; ${table.capacity} seats</div>
          <div class="tfc-bill">Check: ${runningBill}</div>
        </div>
      `;
    }).join('');
  }

  function renderStockToggles() {
    const list = document.getElementById('stockTogglesList');
    const countBadge = document.getElementById('stockSoldOutBadge');
    if (!list || !window.DINEFLOW_MENU) return;

    if (countBadge) {
      countBadge.textContent = `${state.outOfStock.length} Item${state.outOfStock.length !== 1 ? 's' : ''} Sold Out`;
    }

    list.innerHTML = window.DINEFLOW_MENU.map(item => {
      const isOut = state.outOfStock.includes(item.id);
      return `
        <div class="stock-toggle-item">
          <div class="stock-item-info">
            <span class="stock-item-name">${item.name}</span>
            <span class="stock-item-cat">${item.category} &bull; ₹${item.price}</span>
          </div>
          <label class="switch">
            <input type="checkbox" class="stock-chk" data-id="${item.id}" ${!isOut ? 'checked' : ''} />
            <span class="slider"></span>
          </label>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.stock-chk').forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.dataset.id;
        if (!chk.checked) {
          if (!state.outOfStock.includes(id)) state.outOfStock.push(id);
        } else {
          state.outOfStock = state.outOfStock.filter(x => x !== id);
        }
        saveOutOfStock();
        broadcastEvent('STOCK_TOGGLE', { id, available: chk.checked });
        renderCustomerMenu();
        if (countBadge) {
          countBadge.textContent = `${state.outOfStock.length} Item${state.outOfStock.length !== 1 ? 's' : ''} Sold Out`;
        }
        playTapSound();
        showToast(`Stock updated: ${chk.checked ? 'Available' : "86'd (Sold Out)"}`);
      });
    });
  }

  // --- 14. THERMAL DOT-MATRIX TAX INVOICE GENERATOR (80mm) ---
  function openThermalReceipt(orderId) {
    const order = state.orders.find(o => o.id === orderId) || state.orders[0];
    if (!order) return;

    const modal = document.getElementById('thermalReceiptModal');
    const paper = document.getElementById('receiptPaperContent');
    if (!modal || !paper) return;

    const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
    const timeStr = new Date(order.createdAt).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit'
    });

    paper.innerHTML = `
      <div class="receipt-header">
        <div class="receipt-brand">THE RUSTY COPPER</div>
        <div>Artisanal Bistro &amp; Specialty Roastery</div>
        <div>Connaught Place, New Delhi &bull; 110001</div>
        <div>GSTIN: 07AAACT2849P1Z8 &bull; FSSAI: 13321008000492</div>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-table-meta">
        <span>TABLE: ${order.tableName}</span>
        <span>ORDER: #${order.id}</span>
      </div>
      <div class="receipt-table-meta">
        <span>DATE: ${dateStr}</span>
        <span>TIME: ${timeStr}</span>
      </div>
      <div class="receipt-table-meta">
        <span>SERVER: Rajesh (Station #01)</span>
        <span>STATUS: PAID</span>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-items-list">
        ${order.items.map(it => `
          <div class="r-item-row">
            <span>${it.qty}x ${it.name}</span>
            <span>₹${(it.price * it.qty).toFixed(2)}</span>
          </div>
          ${it.modifiers && it.modifiers.length > 0 ? `
            <div class="r-item-mod">+ ${it.modifiers.join(', ')}</div>
          ` : ''}
        `).join('')}
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-totals-wrap">
        <div class="r-total-row">
          <span>Items Subtotal:</span>
          <span>₹${order.subtotal.toFixed(2)}</span>
        </div>
        <div class="r-total-row">
          <span>CGST (2.5%):</span>
          <span>₹${(order.tax / 2).toFixed(2)}</span>
        </div>
        <div class="r-total-row">
          <span>SGST (2.5%):</span>
          <span>₹${(order.tax / 2).toFixed(2)}</span>
        </div>
        <div class="r-total-row">
          <span>Hospitality Service (5%):</span>
          <span>₹${order.serviceCharge.toFixed(2)}</span>
        </div>
        <div class="r-total-row grand">
          <span>TOTAL PAYABLE:</span>
          <span>₹${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-tax-footer">
        <div>SETTLEMENT: UPI / Contactless Gateway</div>
        <div>REF: ${order.txnRef || 'TXN-UPI-88429184'}</div>
        <div style="margin-top: 8px;">THANK YOU FOR DINING WITH US!</div>
        <div style="font-size: 0.58rem; margin-top: 4px;">*** TAX INVOICE CUM CASH MEMO ***</div>
      </div>
    `;

    modal.classList.add('active');
  }

  const dismissReceiptBtn = document.getElementById('btnDismissReceipt');
  if (dismissReceiptBtn) {
    dismissReceiptBtn.addEventListener('click', () => {
      document.getElementById('thermalReceiptModal')?.classList.remove('active');
    });
  }

  const printReceiptBtn = document.getElementById('btnPrintReceipt');
  if (printReceiptBtn) {
    printReceiptBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // --- 15. TOP NAVIGATION & VIEW SWITCHER ---
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.view;
      state.viewMode = mode;

      const appEl = document.getElementById('dineflowApp');
      if (appEl) {
        appEl.className = 'dineflow-app mode-' + mode;
      }
      playTapSound();
    });
  });

  // Category Filter Pills
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.dataset.category;
      playTapSound();
      renderCustomerMenu();
    });
  });

  // Table Selector in Nav
  const tableSelect = document.getElementById('tableSelect');
  if (tableSelect && window.DINEFLOW_TABLES) {
    tableSelect.innerHTML = window.DINEFLOW_TABLES.map(t => {
      return `<option value="${t.id}" ${t.id === state.currentTable ? 'selected' : ''}>${t.name} (${t.type})</option>`;
    }).join('');

    tableSelect.addEventListener('change', () => {
      state.currentTable = tableSelect.value;
      const tObj = window.DINEFLOW_TABLES.find(t => t.id === state.currentTable);
      const badge = document.getElementById('currentTableBadge');
      if (badge && tObj) badge.textContent = tObj.name;
      const drawerTag = document.getElementById('drawerTableTag');
      if (drawerTag && tObj) drawerTag.textContent = tObj.name;
      playTapSound();
      showToast(`Switched active terminal to ${tObj?.name}`);
    });
  }

  // Device Clock updater
  function updateDeviceClock() {
    const clockEl = document.getElementById('deviceClock');
    if (!clockEl) return;
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  // --- 16. INITIAL BOOTSTRAP ---
  function init() {
    initializeDefaultOrders();
    loadOutOfStock();
    updateDeviceClock();
    setInterval(updateDeviceClock, 10000);

    // Check URL parameters for direct view activation
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const requestedView = urlParams.get('view');
      if (requestedView && ['split', 'customer', 'kds', 'stats'].includes(requestedView)) {
        state.viewMode = requestedView;
        document.querySelectorAll('.view-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.view === requestedView);
        });
        const appEl = document.getElementById('dineflowApp');
        if (appEl) {
          appEl.className = 'dineflow-app mode-' + requestedView;
        }
      }
    } catch (e) {}

    renderCustomerMenu();
    renderCart();
    renderKDS();
    renderStats();
    startKDSTimerInterval();

    // Default active order tracker check
    if (state.orders.length > 0) {
      state.customerActiveOrder = state.orders[0];
      renderCustomerOrderStatus();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
