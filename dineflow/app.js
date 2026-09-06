// ============================================================================
// DINEFLOW — HOSPITALITY OPERATING SYSTEM & REAL-TIME KDS (v2.4)
// Commercial Kitchen Expediter Engine & Acoustic Web Audio Synthesizer
// ============================================================================

(function() {
  'use strict';

  // --- 1. WEB AUDIO POS HARDWARE SYNTHESIZER ENGINE ---
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

      // 1st Harmonic Strike
      [1760, 3520, 5280].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.28 / (idx + 1), t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 1.3);
      });

      // 2nd Secondary Echo Strike (Delayed 115ms)
      const t2 = t + 0.115;
      [1840, 3680].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t2);
        gain.gain.setValueAtTime(0.3 / (idx + 1), t2);
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
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.08);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch (e) {}
  }

  // Cart Add Tap
  function playTapSound() {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, t);
      osc.frequency.exponentialRampToValueAtTime(460, t + 0.04);
      gain.gain.setValueAtTime(0.14, t);
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

      [2093, 2637, 3136].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + i * 0.08);
        gain.gain.setValueAtTime(0.3, t + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.08 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 1.25);
      });
    } catch (e) {}
  }

  // --- 2. CROSS-WINDOW BROADCAST CHANNEL & STORAGE BUS ---
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
      showToast('New ticket arrived from ' + evt.payload.tableName);
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
    customerActiveOrder: null
  };

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
        covers: 3,
        status: 'cooking',
        createdAt: now - (6 * 60 * 1000 + 40 * 1000), // 6m 40s ago
        items: [
          { name: 'Slow-Braised Short Rib Tagliatelle', station: 'grill', qty: 1, price: 680, modifiers: ['Calabrian Chili Kick', 'Fresh Shaved 24-mo Pecorino'], notes: 'Extra hot garnish' },
          { name: 'Burrata & Charred Peach Salad', station: 'larder', qty: 1, price: 490, modifiers: ['Hot Chili Wildflower Honey'], notes: '' },
          { name: 'Nitro Cold Brew Float', station: 'barista', qty: 2, price: 580, modifiers: ['Ethiopia Yirgacheffe'], notes: '' }
        ],
        notes: 'Guest celebrating anniversary',
        subtotal: 1750,
        cgst: 43.75,
        sgst: 43.75,
        serviceCharge: 87.5,
        total: 1925
      },
      {
        id: 'DF-8840',
        tableId: 'T-02',
        tableName: 'Table 02',
        covers: 2,
        status: 'ready',
        createdAt: now - (11 * 60 * 1000 + 20 * 1000), // 11m 20s ago (Warning)
        items: [
          { name: 'Truffle Mushroom Sourdough Toast', station: 'larder', qty: 1, price: 380, modifiers: ['36h Country Sourdough', 'Poached Free-Range Egg'], notes: '' },
          { name: 'Artisan Oat Flat White', station: 'barista', qty: 1, price: 240, modifiers: ['Oatly Barista', 'Double Ristretto'], notes: '' }
        ],
        notes: '',
        subtotal: 620,
        cgst: 15.5,
        sgst: 15.5,
        serviceCharge: 31,
        total: 682
      },
      {
        id: 'DF-8835',
        tableId: 'T-01',
        tableName: 'Table 01',
        covers: 4,
        status: 'incoming',
        createdAt: now - (14 * 60 * 1000 + 10 * 1000), // 14m ago (RUSH)
        items: [
          { name: 'Prime Black Angus Ribeye Steak (300g)', station: 'grill', qty: 2, price: 1960, modifiers: ['Medium Rare', 'Bone Marrow Jus'], notes: 'Gluten allergy on steak' },
          { name: 'Valrhona 70% Dark Chocolate Lava', station: 'pastry', qty: 1, price: 420, modifiers: ['Clotted Cream'], notes: '' }
        ],
        notes: 'VIP Guest - Rush table',
        subtotal: 2380,
        cgst: 59.5,
        sgst: 59.5,
        serviceCharge: 119,
        total: 2618
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
    toast.innerHTML = `<span>✦</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      toast.style.transition = 'all 0.25s ease';
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
      const isVeg = item.diet === 'veg';
      const dietBadge = isVeg 
        ? '<span class="diet-badge diet-veg">[V]</span>' 
        : '<span class="diet-badge diet-nonveg">[NV]</span>';
      
      const specialTag = item.tags.find(t => t.includes('Signature') || t.includes('Special'));

      return `
        <article class="menu-card ${is86 ? 'is-soldout' : ''}" data-id="${item.id}">
          <div class="menu-content">
            <div>
              <div class="dish-header-strip">
                ${dietBadge}
                <h4 class="dish-title">${item.name}</h4>
              </div>
              <p class="dish-desc">${item.description}</p>
            </div>
            
            <div class="menu-footer-row">
              <div class="dish-price-wrap">
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
            <span class="mod-group-req">${grp.required ? 'Required (Pick 1)' : 'Optional Addition'}</span>
          </div>
          <div class="mod-options-list">
            ${grp.options.map((opt, oIdx) => {
              const inputType = grp.multiple ? 'checkbox' : 'radio';
              const inputName = 'mod_' + grp.id;
              const inputId = `opt_${grp.id}_${oIdx}`;
              const isDefault = opt.default ? 'checked' : '';
              return `
                <label class="mod-option-row" for="${inputId}">
                  <div>
                    <input type="${inputType}" id="${inputId}" name="${inputName}" 
                           value="${opt.name}" data-price="${opt.price}" ${isDefault} class="mod-input" />
                    <span class="mod-opt-name">${opt.name}</span>
                  </div>
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
    const cgstEl = document.getElementById('cartCgst');
    const sgstEl = document.getElementById('cartSgst');
    const serviceEl = document.getElementById('cartServiceCharge');
    const grandEl = document.getElementById('cartGrandTotal');

    const totalQty = state.cart.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = state.cart.reduce((sum, i) => sum + (i.totalPrice * i.qty), 0);
    const taxEach = Math.round(subtotal * 0.025 * 100) / 100; // 2.5% CGST / SGST
    const service = Math.round(subtotal * 0.05 * 100) / 100;
    const grandTotal = subtotal + (taxEach * 2) + service;

    if (trayCount) trayCount.textContent = `${totalQty} item${totalQty !== 1 ? 's' : ''}`;
    if (trayTotal) trayTotal.textContent = `₹${grandTotal.toFixed(2)}`;

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (cgstEl) cgstEl.textContent = `₹${taxEach.toFixed(2)}`;
    if (sgstEl) sgstEl.textContent = `₹${taxEach.toFixed(2)}`;
    if (serviceEl) serviceEl.textContent = `₹${service.toFixed(2)}`;
    if (grandEl) grandEl.textContent = `₹${grandTotal.toFixed(2)}`;

    const pmAmt = document.getElementById('pmAmountValue');
    if (pmAmt) pmAmt.textContent = `₹${grandTotal.toFixed(2)}`;

    if (!cartList) return;

    if (state.cart.length === 0) {
      cartList.innerHTML = `<div class="kds-empty-col">Your order tray is currently empty.<br/>Browse curations to begin.</div>`;
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

  // Open/Close Tray Drawer
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
        showToast('Tray is empty. Add dishes first!');
        return;
      }

      playServiceBell();

      const tableObj = (window.DINEFLOW_TABLES || []).find(t => t.id === state.currentTable) || { name: 'Table 04', capacity: 4 };
      const orderNum = 'DF-' + Math.floor(1000 + Math.random() * 9000);
      const subtotal = state.cart.reduce((sum, item) => sum + (item.totalPrice * item.qty), 0);
      const taxEach = Math.round(subtotal * 0.025 * 100) / 100;
      const service = Math.round(subtotal * 0.05 * 100) / 100;

      const newOrder = {
        id: orderNum,
        tableId: state.currentTable,
        tableName: tableObj.name,
        covers: tableObj.capacity || 2,
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
        cgst: taxEach,
        sgst: taxEach,
        serviceCharge: service,
        total: subtotal + (taxEach * 2) + service
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
      showToast(`Ticket #${newOrder.id} sent to kitchen rail!`);
    });
  }

  // --- 9. CUSTOMER LIVE TRACKER & ACTIVE DYNAMIC ISLAND ---
  function renderCustomerOrderStatus() {
    const banner = document.getElementById('activeOrderPillBanner');
    const dynamicIsland = document.getElementById('dynamicIsland');
    const islandExpanded = document.getElementById('islandExpanded');
    const islandTitle = document.getElementById('islandStatusText');
    const islandTimer = document.getElementById('islandTimer');
    const aopTitle = document.getElementById('aopTitle');
    const aopSub = document.getElementById('aopSubtitle');

    if (!state.customerActiveOrder) {
      if (banner) banner.style.display = 'none';
      if (dynamicIsland) dynamicIsland.classList.remove('is-active');
      if (islandExpanded) islandExpanded.style.display = 'none';
      return;
    }

    const current = state.orders.find(o => o.id === state.customerActiveOrder.id) || state.customerActiveOrder;

    if (banner) banner.style.display = 'flex';
    if (dynamicIsland) dynamicIsland.classList.add('is-active');
    if (islandExpanded) islandExpanded.style.display = 'flex';

    let statusText = 'Queued';
    let subText = 'Order received at kitchen pass';

    if (current.status === 'incoming') {
      statusText = 'Queued';
      subText = 'Ticket landed on chef rail';
    } else if (current.status === 'cooking') {
      statusText = 'Firing 🔥';
      subText = 'Chef is preparing wood-fired mains';
    } else if (current.status === 'ready') {
      statusText = 'Plated 🛎️';
      subText = 'Dishes ready at expediter window';
    } else if (current.status === 'served') {
      statusText = 'Settled ✨';
      subText = 'Dining session complete. Receipt ready.';
    }

    if (aopTitle) aopTitle.textContent = `#${current.id} &bull; ${statusText}`;
    if (aopSub) aopSub.textContent = subText;
    if (islandTitle) islandTitle.textContent = statusText;

    const elapsedMin = Math.floor((Date.now() - current.createdAt) / 60000);
    const elapsedSec = Math.floor(((Date.now() - current.createdAt) % 60000) / 1000);
    if (islandTimer) {
      islandTimer.textContent = `${String(elapsedMin).padStart(2, '0')}:${String(elapsedSec).padStart(2, '0')}`;
    }
  }

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
      if (titleEl) titleEl.textContent = 'Chef Firing Dishes 🔥';
      if (descEl) descEl.textContent = 'Your dishes are sizzling on the wood-fired grill and sauté line.';
      if (stepReceived) stepReceived.classList.add('completed');
      if (stepCooking) stepCooking.classList.add('active');
    } else if (current.status === 'ready') {
      if (titleEl) titleEl.textContent = 'Dishes Ready at Pass 🛎️';
      if (descEl) descEl.textContent = 'Plated and ready at the service window for serving!';
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

  const trackerReceiptBtn = document.getElementById('btnViewReceiptFromTracker');
  if (trackerReceiptBtn) {
    trackerReceiptBtn.addEventListener('click', () => {
      trackerModal?.classList.remove('active');
      if (state.customerActiveOrder) {
        openThermalReceipt(state.customerActiveOrder.id);
      }
    });
  }

  // --- 10. WAITER SERVICE REQUEST DISPATCHER ---
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
      showToast(`Server notified for "${reason}"`);
    });
  });

  function displayKdsServiceAlert(payload) {
    const banner = document.getElementById('kdsServiceAlertBanner');
    const textEl = document.getElementById('alertTableText');
    const timeEl = document.getElementById('alertTimestamp');
    if (!banner || !textEl) return;

    textEl.textContent = `${payload.tableName.toUpperCase()} REQUESTED: ${payload.reason}`;
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

  // --- 11. INTERACTIVE PAYMENT GATEWAY (UPI & CARD) ---
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

    if (contentStep) contentStep.style.display = 'block';
    if (procStep) procStep.style.display = 'none';
    if (succStep) succStep.style.display = 'none';

    let totalDue = 0;
    if (state.cart.length > 0) {
      const subtotal = state.cart.reduce((sum, i) => sum + (i.totalPrice * i.qty), 0);
      totalDue = subtotal + (subtotal * 0.1);
    } else if (state.customerActiveOrder) {
      totalDue = state.customerActiveOrder.total;
    } else {
      totalDue = 1925;
    }

    if (pmAmt) pmAmt.textContent = `₹${totalDue.toFixed(2)}`;

    modal.classList.add('active');
  }

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

    setTimeout(() => {
      playPaymentSuccessChime();

      if (procStep) procStep.style.display = 'none';
      if (succStep) succStep.style.display = 'flex';

      const txnRef = `TXN-${method.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`;
      if (refBadge) refBadge.textContent = txnRef;

      let settledOrder = state.customerActiveOrder;
      if (!settledOrder && state.cart.length > 0) {
        const subtotal = state.cart.reduce((sum, item) => sum + (item.totalPrice * item.qty), 0);
        const taxEach = Math.round(subtotal * 0.025 * 100) / 100;
        const service = Math.round(subtotal * 0.05 * 100) / 100;
        settledOrder = {
          id: 'DF-' + Math.floor(1000 + Math.random() * 9000),
          tableId: state.currentTable,
          tableName: 'Table 04',
          covers: 3,
          status: 'served',
          createdAt: Date.now(),
          settledAt: Date.now(),
          paymentMethod: method,
          txnRef: txnRef,
          items: [...state.cart],
          subtotal: subtotal,
          cgst: taxEach,
          sgst: taxEach,
          serviceCharge: service,
          total: subtotal + (taxEach * 2) + service
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

  const viewReceiptAfterPayBtn = document.getElementById('btnViewReceiptAfterPay');
  if (viewReceiptAfterPayBtn) {
    viewReceiptAfterPayBtn.addEventListener('click', () => {
      document.getElementById('paymentModal')?.classList.remove('active');
      if (state.customerActiveOrder) {
        openThermalReceipt(state.customerActiveOrder.id);
      }
    });
  }

  // --- 12. KDS KANBAN EXPEDITER RENDERING & MULTI-STATION ROUTING ---
  function renderKDS() {
    const colIncoming = document.getElementById('kdsColIncoming');
    const colCooking = document.getElementById('kdsColCooking');
    const colReady = document.getElementById('kdsColReady');
    const colServed = document.getElementById('kdsColServed');

    if (!colIncoming || !colCooking || !colReady || !colServed) return;

    const filteredOrders = state.orders.filter(order => {
      if (state.activeStation === 'all') return true;
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

    document.getElementById('countIncoming')?.replaceChildren(document.createTextNode(ordersByStatus.incoming.length));
    document.getElementById('countCooking')?.replaceChildren(document.createTextNode(ordersByStatus.cooking.length));
    document.getElementById('countReady')?.replaceChildren(document.createTextNode(ordersByStatus.ready.length));
    document.getElementById('countServed')?.replaceChildren(document.createTextNode(ordersByStatus.served.length));

    const totalActive = ordersByStatus.incoming.length + ordersByStatus.cooking.length + ordersByStatus.ready.length;
    const activeCountEl = document.getElementById('kdsActiveCount');
    if (activeCountEl) activeCountEl.textContent = totalActive;

    updateStationBadges();

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
      container.innerHTML = `<div class="kds-empty-col">No tickets in this column</div>`;
      return;
    }

    container.innerHTML = orders.map(order => {
      const elapsedSec = Math.floor((Date.now() - order.createdAt) / 1000);
      const elapsedMin = Math.floor(elapsedSec / 60);
      const elapsedRemSec = elapsedSec % 60;
      const formattedTime = `${String(elapsedMin).padStart(2, '0')}:${String(elapsedRemSec).padStart(2, '0')}`;

      let alertClass = 'urgency-normal';
      let isRush = false;
      if (order.status !== 'served') {
        if (elapsedMin >= 12) {
          alertClass = 'urgency-delayed';
          isRush = true;
        } else if (elapsedMin >= 8) {
          alertClass = 'urgency-warning';
        }
      }

      let actionBtnHtml = '';
      if (columnStatus === 'incoming') {
        actionBtnHtml = `<button class="kds-bump-btn btn-fire" data-action="cooking" data-id="${order.id}">🔥 Start Cooking</button>`;
      } else if (columnStatus === 'cooking') {
        actionBtnHtml = `<button class="kds-bump-btn btn-ready" data-action="ready" data-id="${order.id}">🛎️ Mark Ready</button>`;
      } else if (columnStatus === 'ready') {
        actionBtnHtml = `<button class="kds-bump-btn btn-complete" data-action="served" data-id="${order.id}">✓ Mark Served</button>`;
      } else {
        actionBtnHtml = `<button class="kds-bump-btn btn-receipt" data-action="receipt" data-id="${order.id}">🖨️ Thermal Receipt</button>`;
      }

      return `
        <div class="kds-ticket ${alertClass}" data-id="${order.id}" data-created="${order.createdAt}">
          ${isRush ? '<div class="rush-stamp">RUSH TICKET</div>' : ''}
          
          <div class="ticket-head">
            <div class="ticket-left">
              <span class="ticket-table">${order.tableName}</span>
              <span class="ticket-id">#${order.id} &bull; ${order.covers || 2} COVERS</span>
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
                    <div class="t-mods">
                      ${item.modifiers.map(m => `<span class="t-mod-pill">${m}</span>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>

          ${order.notes ? `
            <div class="ticket-chef-notes">
              <strong>Chef Note:</strong> ${order.notes}
            </div>
          ` : ''}

          <div class="ticket-actions">
            ${actionBtnHtml}
            <button class="btn-quick-receipt" data-id="${order.id}" title="Inspect Thermal Tax Invoice">🖨️</button>
          </div>
        </div>
      `;
    }).join('');

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
    showToast(`Order #${order.id} transitioned to "${newStatus}"`);
  }

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
          if (!ticket.querySelector('.rush-stamp')) {
            const stamp = document.createElement('div');
            stamp.className = 'rush-stamp';
            stamp.textContent = 'RUSH TICKET';
            ticket.appendChild(stamp);
          }
        } else if (elapsedMin >= 8) {
          ticket.classList.remove('urgency-normal', 'urgency-delayed');
          ticket.classList.add('urgency-warning');
        }
      });

      // Update Dynamic Island timer
      if (state.customerActiveOrder) {
        const current = state.orders.find(o => o.id === state.customerActiveOrder.id) || state.customerActiveOrder;
        const elapsedMin = Math.floor((now - current.createdAt) / 60000);
        const elapsedSec = Math.floor(((now - current.createdAt) % 60000) / 1000);
        const islandTimer = document.getElementById('islandTimer');
        if (islandTimer) {
          islandTimer.textContent = `${String(elapsedMin).padStart(2, '0')}:${String(elapsedSec).padStart(2, '0')}`;
        }
      }
    }, 1000);
  }

  // Station Filter Buttons
  document.querySelectorAll('.station-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.station-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeStation = btn.dataset.station;
      playTapSound();
      renderKDS();
    });
  });

  // Brass Bell Trigger
  const testBellBtn = document.getElementById('btnTestBell');
  if (testBellBtn) {
    testBellBtn.addEventListener('click', () => {
      playServiceBell();
      showToast('1.8kHz brass restaurant service bell rung');
    });
  }

  // "Rush Demo" Trigger: Generates 2 active tickets for immediate evaluation
  const rushBtn = document.getElementById('btnSimulateRush');
  if (rushBtn) {
    rushBtn.addEventListener('click', () => {
      playServiceBell();
      const now = Date.now();
      const demoOrder1 = {
        id: 'DF-' + Math.floor(1000 + Math.random() * 9000),
        tableId: 'T-07',
        tableName: 'Table 07',
        covers: 2,
        status: 'incoming',
        createdAt: now,
        items: [
          { name: 'Crispy Polenta Bites & Smoked Aioli', station: 'larder', qty: 1, price: 320, modifiers: ['Truffle Mayo Dip'] },
          { name: 'Cascara & Grapefruit Botanicals', station: 'barista', qty: 2, price: 520, modifiers: ['Clear Ice Block'] }
        ],
        notes: 'Cocktail rush order',
        subtotal: 840,
        cgst: 21,
        sgst: 21,
        serviceCharge: 42,
        total: 924
      };
      const demoOrder2 = {
        id: 'DF-' + Math.floor(1000 + Math.random() * 9000),
        tableId: 'T-12',
        tableName: 'Table 12',
        covers: 6,
        status: 'cooking',
        createdAt: now - (9 * 60 * 1000), // 9 mins ago (warning state)
        items: [
          { name: 'Wood-Fired Neapolitan Burrata Pizza', station: 'grill', qty: 2, price: 1280, modifiers: ['Leopard Char Crust', 'Spicy Hot Honey'] },
          { name: 'Basque Burnt Cheesecake & Sea Salt', station: 'pastry', qty: 2, price: 720, modifiers: ['Blackberry Compote'] }
        ],
        notes: 'PDR VIP Table',
        subtotal: 2000,
        cgst: 50,
        sgst: 50,
        serviceCharge: 100,
        total: 2200
      };

      state.orders.unshift(demoOrder1, demoOrder2);
      saveOrders();
      broadcastEvent('NEW_ORDER', demoOrder1);
      renderKDS();
      renderStats();
      showToast('⚡ Rush hour simulated: 2 live tickets fired to KDS!');
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
          <div class="tfc-meta">${table.type} &bull; ${table.capacity} covers</div>
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

  // --- 14. THERMAL TAX INVOICE GENERATOR WITH POS FEED ANIMATION ---
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
        <div>Artisanal Wood-Fired Kitchen &amp; Roastery</div>
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
        <span>COVERS: ${order.covers || 2} GUESTS</span>
        <span>STATUS: PAID &bull; SETTLED</span>
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
          <span>₹${(order.cgst || order.tax / 2 || 0).toFixed(2)}</span>
        </div>
        <div class="r-total-row">
          <span>SGST (2.5%):</span>
          <span>₹${(order.sgst || order.tax / 2 || 0).toFixed(2)}</span>
        </div>
        <div class="r-total-row">
          <span>Hospitality Service (5%):</span>
          <span>₹${(order.serviceCharge || 0).toFixed(2)}</span>
        </div>
        <div class="r-total-row grand">
          <span>TOTAL PAID:</span>
          <span>₹${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div class="receipt-divider"></div>

      <div class="receipt-tax-footer">
        <div>SETTLEMENT: UPI / Contactless Gateway</div>
        <div>REF: ${order.txnRef || 'TXN-UPI-88429184'}</div>
        <div style="margin-top: 8px; font-weight: 700;">THANK YOU FOR DINING WITH US!</div>
        <div style="font-size: 0.6rem; margin-top: 4px;">*** FISCAL TAX INVOICE CUM CASH MEMO ***</div>
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

  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.dataset.category;
      playTapSound();
      renderCustomerMenu();
    });
  });

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
      showToast(`Switched terminal context to ${tObj?.name}`);
    });
  }

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

    // Direct URL parameter activation (?view=customer | ?view=kds)
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
