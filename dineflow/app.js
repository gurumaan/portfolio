// ============================================================================
// DINEFLOW — HOSPITALITY OPERATING SYSTEM & KDS
// Real-Time Table Ordering, Kitchen Display Engine & Hardware POS Audio
// ============================================================================

(function() {
  'use strict';

  // --- AUDIO SYNTHESIZER ENGINE (Web Audio API) ---
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

      // 1st Ping (Higher Harmonic)
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

  // --- CROSS-TAB SYNC BUS (BroadcastChannel + LocalStorage) ---
  const SYNC_KEY = 'dineflow_channel_events';
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

  function broadcastEvent(type, payload) {
    const packet = { type, payload, timestamp: Date.now() };
    if (broadcastChannel) {
      try { broadcastChannel.postMessage(packet); } catch (e) {}
    }
    try {
      localStorage.setItem(SYNC_KEY, JSON.stringify(packet));
    } catch (e) {}
  }

  function handleIncomingSyncEvent(packet) {
    if (!packet || !packet.type) return;
    if (packet.type === 'NEW_ORDER') {
      const exists = state.orders.some(o => o.id === packet.payload.id);
      if (!exists) {
        state.orders.unshift(packet.payload);
        saveOrders();
        playServiceBell();
        renderKDS();
        renderStats();
      }
    } else if (packet.type === 'STATUS_UPDATE') {
      const target = state.orders.find(o => o.id === packet.payload.id);
      if (target) {
        target.status = packet.payload.status;
        target.updatedAt = packet.payload.updatedAt;
        saveOrders();
        renderKDS();
        renderCustomerOrderStatus();
      }
    } else if (packet.type === 'STOCK_TOGGLE') {
      state.outOfStock = packet.payload;
      saveStock();
      renderCustomerMenu();
      renderKDS();
    }
  }

  // --- APPLICATION STATE ---
  const DEFAULT_INITIAL_ORDERS = [
    {
      id: 'DF-8841',
      tableId: 'T-02',
      tableName: 'Table 02',
      status: 'cooking',
      createdAt: Date.now() - 340000, // ~5.5 mins ago
      items: [
        {
          name: 'Hand-Cut Tagliatelle Ragu',
          qty: 1,
          price: 680,
          modifiers: ['Chili Heat: Calabrian Kick', 'Extra 24-mo Pecorino (+₹50)']
        },
        {
          name: 'Artisan Oat Flat White',
          qty: 2,
          price: 240,
          modifiers: ['Oatly Barista Edition', 'Standard Double Ristretto']
        }
      ],
      notes: 'Customer allergic to shellfish; please keep kitchen station wiped.',
      subtotal: 1210,
      tax: 60.5,
      serviceCharge: 60.5,
      total: 1331
    },
    {
      id: 'DF-8839',
      tableId: 'T-07',
      tableName: 'Table 07',
      status: 'ready',
      createdAt: Date.now() - 720000, // ~12 mins ago
      items: [
        {
          name: 'Wood-Fired Burrata Pizza',
          qty: 1,
          price: 640,
          modifiers: ['Garlic Herb Infused Brush (+₹30)', 'Spicy Hot Honey Cup (+₹40)']
        },
        {
          name: 'Cascara & Grapefruit Spritz',
          qty: 1,
          price: 260,
          modifiers: ['Hand-Cut Clear Ice Block']
        }
      ],
      notes: '',
      subtotal: 970,
      tax: 48.5,
      serviceCharge: 48.5,
      total: 1067
    }
  ];

  const state = {
    viewMode: 'split', // 'split' | 'customer' | 'kds' | 'stats'
    activeCategory: 'all',
    currentTable: 'T-04',
    cart: [],
    orders: loadOrders(),
    outOfStock: loadStock(),
    modalItem: null,
    customerActiveOrder: null,
    selectedReceiptOrder: null
  };

  function loadOrders() {
    try {
      const saved = localStorage.getItem('dineflow_orders_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_INITIAL_ORDERS;
  }

  function saveOrders() {
    try {
      localStorage.setItem('dineflow_orders_v1', JSON.stringify(state.orders));
    } catch (e) {}
  }

  function loadStock() {
    try {
      const saved = localStorage.getItem('dineflow_stock_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  }

  function saveStock() {
    try {
      localStorage.setItem('dineflow_stock_v1', JSON.stringify(state.outOfStock));
    } catch (e) {}
  }

  // --- INITIALIZATION ---
  window.addEventListener('DOMContentLoaded', () => {
    initViewControls();
    initTableSelector();
    initCategoryTabs();
    renderCustomerMenu();
    renderKDS();
    renderStats();
    startKDSTimerInterval();

    // Check URL parameters for direct view routing
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'kds') {
      setViewMode('kds');
    } else if (params.get('view') === 'customer') {
      setViewMode('customer');
    } else {
      setViewMode('split');
    }
  });

  // --- VIEW MODE SWITCHER ---
  function initViewControls() {
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        playTapSound();
        const mode = btn.dataset.view;
        setViewMode(mode);
      });
    });
  }

  function setViewMode(mode) {
    state.viewMode = mode;
    document.querySelectorAll('.view-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.view === mode);
    });

    const rootApp = document.getElementById('dineflowApp');
    if (rootApp) {
      rootApp.className = 'dineflow-app mode-' + mode;
    }
  }

  // --- TABLE SELECTION ---
  function initTableSelector() {
    const selector = document.getElementById('tableSelect');
    if (!selector || !window.DINEFLOW_TABLES) return;

    selector.innerHTML = window.DINEFLOW_TABLES.map(t => 
      `<option value="${t.id}" ${t.id === state.currentTable ? 'selected' : ''}>${t.name} (${t.type})</option>`
    ).join('');

    selector.addEventListener('change', (e) => {
      state.currentTable = e.target.value;
      const tInfo = window.DINEFLOW_TABLES.find(t => t.id === state.currentTable);
      const label = document.getElementById('currentTableBadge');
      if (label && tInfo) label.textContent = tInfo.name;
    });
  }

  // --- CATEGORY TABS ---
  function initCategoryTabs() {
    const tabs = document.querySelectorAll('.cat-pill');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        playTapSound();
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.activeCategory = tab.dataset.category;
        renderCustomerMenu();
      });
    });
  }

  // --- RENDER CUSTOMER MENU ---
  function renderCustomerMenu() {
    const container = document.getElementById('menuGrid');
    if (!container || !window.DINEFLOW_MENU) return;

    const filtered = window.DINEFLOW_MENU.filter(item => {
      if (state.activeCategory === 'all') return true;
      return item.category === state.activeCategory;
    });

    container.innerHTML = filtered.map(item => {
      const is86 = state.outOfStock.includes(item.id);
      return `
        <article class="menu-card ${is86 ? 'is-soldout' : ''}" data-id="${item.id}">
          <div class="menu-img-wrap">
            <img src="${item.image}" alt="${item.name}" loading="lazy" class="menu-img" />
            <div class="badge-cluster">
              ${item.tags.map(tag => `<span class="dish-badge">${tag}</span>`).join('')}
              ${is86 ? '<span class="dish-badge badge-soldout">86\'d / Sold Out</span>' : ''}
            </div>
            <span class="dish-time">⏱ ${item.prepTime}</span>
          </div>
          <div class="menu-content">
            <div class="menu-header-row">
              <h4 class="dish-title">${item.name}</h4>
              <span class="dish-price">₹${item.price}</span>
            </div>
            <p class="dish-desc">${item.description}</p>
            <div class="menu-footer-row">
              <span class="dish-cal">${item.calories}</span>
              <button class="btn-customize-add" data-id="${item.id}" ${is86 ? 'disabled' : ''}>
                ${is86 ? 'Sold Out' : '+ Customize & Add'}
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach click listeners to open modifier modal
    container.querySelectorAll('.btn-customize-add').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openModifierModal(id);
      });
    });
  }

  // --- MODIFIER MODAL ---
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

    // Render Modifiers Groups
    body.innerHTML = (item.modifiers || []).map((grp, gIdx) => {
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

    // Listen to changes in options to update price
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

  // Close modal button
  const closeModalBtn = document.getElementById('btnDismissModal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      document.getElementById('modifierModal').classList.remove('active');
      state.modalItem = null;
    });
  }

  // Confirm Add to Tray
  const confirmAddBtn = document.getElementById('btnConfirmAddToCart');
  if (confirmAddBtn) {
    confirmAddBtn.addEventListener('click', () => {
      if (!state.modalItem) return;
      playTapSound();

      const selectedModifiers = [];
      let totalItemPrice = state.modalItem.price;

      document.querySelectorAll('#modalModifiersBody .mod-input:checked').forEach(inp => {
        const extra = parseFloat(inp.dataset.price || 0);
        totalItemPrice += extra;
        selectedModifiers.push(inp.value + (extra > 0 ? ` (+₹${extra})` : ''));
      });

      const notes = (document.getElementById('modalChefNotes')?.value || '').trim();

      state.cart.push({
        cartItemId: 'c_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        id: state.modalItem.id,
        name: state.modalItem.name,
        basePrice: state.modalItem.price,
        totalPrice: totalItemPrice,
        modifiers: selectedModifiers,
        notes: notes,
        qty: 1
      });

      document.getElementById('modifierModal').classList.remove('active');
      state.modalItem = null;
      renderCart();
    });
  }

  // --- CART / TRAY RENDERING ---
  function renderCart() {
    const trayBar = document.getElementById('customerTrayBar');
    const trayCount = document.getElementById('trayItemCount');
    const trayTotal = document.getElementById('trayTotalAmount');
    const drawerList = document.getElementById('cartItemsList');
    const subtotalEl = document.getElementById('cartSubtotal');
    const taxEl = document.getElementById('cartTax');
    const grandTotalEl = document.getElementById('cartGrandTotal');

    const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = state.cart.reduce((sum, item) => sum + (item.totalPrice * item.qty), 0);
    const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
    const service = Math.round(subtotal * 0.05 * 100) / 100; // 5% Service charge
    const grandTotal = subtotal + tax + service;

    if (trayBar) {
      if (totalQty > 0) {
        trayBar.classList.add('visible');
        if (trayCount) trayCount.textContent = `${totalQty} item${totalQty > 1 ? 's' : ''}`;
        if (trayTotal) trayTotal.textContent = `₹${grandTotal.toFixed(2)}`;
      } else {
        trayBar.classList.remove('visible');
      }
    }

    if (drawerList) {
      if (state.cart.length === 0) {
        drawerList.innerHTML = `<div class="empty-cart-msg">Your order tray is currently empty. Tap any dish above to customize and add!</div>`;
      } else {
        drawerList.innerHTML = state.cart.map(item => `
          <div class="cart-item-row" data-cart-id="${item.cartItemId}">
            <div class="cart-item-main">
              <div class="cart-item-name">${item.name}</div>
              ${item.modifiers.length > 0 ? `<div class="cart-item-mods">${item.modifiers.join(', ')}</div>` : ''}
              ${item.notes ? `<div class="cart-item-notes">Note: "${item.notes}"</div>` : ''}
              <div class="cart-item-price">₹${(item.totalPrice * item.qty).toFixed(2)}</div>
            </div>
            <div class="cart-qty-ctrl">
              <button class="btn-qty-minus" data-cart-id="${item.cartItemId}">-</button>
              <span class="cart-qty-num">${item.qty}</span>
              <button class="btn-qty-plus" data-cart-id="${item.cartItemId}">+</button>
            </div>
          </div>
        `).join('');

        // Attach quantity buttons
        drawerList.querySelectorAll('.btn-qty-minus').forEach(btn => {
          btn.addEventListener('click', () => {
            const cId = btn.dataset.cartId;
            const target = state.cart.find(i => i.cartItemId === cId);
            if (target) {
              target.qty--;
              if (target.qty <= 0) {
                state.cart = state.cart.filter(i => i.cartItemId !== cId);
              }
              renderCart();
            }
          });
        });

        drawerList.querySelectorAll('.btn-qty-plus').forEach(btn => {
          btn.addEventListener('click', () => {
            const cId = btn.dataset.cartId;
            const target = state.cart.find(i => i.cartItemId === cId);
            if (target) {
              target.qty++;
              renderCart();
            }
          });
        });
      }
    }

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `₹${(tax + service).toFixed(2)} (5% GST + 5% Svc)`;
    if (grandTotalEl) grandTotalEl.textContent = `₹${grandTotal.toFixed(2)}`;
  }

  // Tray Bar Click -> Open Tray Drawer
  const trayBar = document.getElementById('customerTrayBar');
  const trayDrawer = document.getElementById('cartDrawer');
  const closeDrawerBtn = document.getElementById('btnCloseCartDrawer');

  if (trayBar && trayDrawer) {
    trayBar.addEventListener('click', () => {
      playTapSound();
      trayDrawer.classList.add('active');
    });
  }

  if (closeDrawerBtn && trayDrawer) {
    closeDrawerBtn.addEventListener('click', () => {
      trayDrawer.classList.remove('active');
    });
  }

  // Confirm Order Action
  const btnFireOrder = document.getElementById('btnSubmitOrder');
  if (btnFireOrder) {
    btnFireOrder.addEventListener('click', () => {
      if (state.cart.length === 0) return;
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

      // Add to State
      state.orders.unshift(newOrder);
      saveOrders();

      // Broadcast to other tabs & KDS
      broadcastEvent('NEW_ORDER', newOrder);

      // Customer view tracks this new order
      state.customerActiveOrder = newOrder;
      state.cart = [];
      renderCart();

      if (trayDrawer) trayDrawer.classList.remove('active');

      renderCustomerOrderStatus();
      renderKDS();
      renderStats();
    });
  }

  // --- CUSTOMER LIVE ORDER STATUS MODAL ---
  function renderCustomerOrderStatus() {
    const modal = document.getElementById('customerOrderTrackerModal');
    if (!modal) return;

    if (!state.customerActiveOrder) {
      modal.classList.remove('active');
      return;
    }

    // Refresh order from state
    const current = state.orders.find(o => o.id === state.customerActiveOrder.id) || state.customerActiveOrder;

    const orderIdEl = document.getElementById('trackerOrderId');
    const tableEl = document.getElementById('trackerTableName');
    const statusTextEl = document.getElementById('trackerStatusTitle');
    const statusDescEl = document.getElementById('trackerStatusDesc');
    const stepReceived = document.getElementById('stepReceived');
    const stepCooking = document.getElementById('stepCooking');
    const stepReady = document.getElementById('stepReady');
    const stepServed = document.getElementById('stepServed');

    if (orderIdEl) orderIdEl.textContent = '#' + current.id;
    if (tableEl) tableEl.textContent = current.tableName;

    // Reset steps
    [stepReceived, stepCooking, stepReady, stepServed].forEach(s => s && s.classList.remove('active', 'completed'));

    if (current.status === 'incoming') {
      if (statusTextEl) statusTextEl.textContent = 'Order Placed at Kitchen Counter';
      if (statusDescEl) statusDescEl.textContent = 'Ticket sent to Chef Station. Standby for preparation confirmation.';
      if (stepReceived) stepReceived.classList.add('active');
    } else if (current.status === 'cooking') {
      if (statusTextEl) statusTextEl.textContent = 'Chef is Preparing Your Meal 🔥';
      if (statusDescEl) statusDescEl.textContent = 'Your dishes are currently in preparation on the wood-fired grill and sauté line.';
      if (stepReceived) stepReceived.classList.add('completed');
      if (stepCooking) stepCooking.classList.add('active');
    } else if (current.status === 'ready') {
      if (statusTextEl) statusTextEl.textContent = 'Ready for Pickup / Serving 🛎️';
      if (statusDescEl) statusDescEl.textContent = 'Your dishes are plated and ready at the service window!';
      if (stepReceived) stepReceived.classList.add('completed');
      if (stepCooking) stepCooking.classList.add('completed');
      if (stepReady) stepReady.classList.add('active');
    } else if (current.status === 'served') {
      if (statusTextEl) statusTextEl.textContent = 'Served & Settled ✨';
      if (statusDescEl) statusDescEl.textContent = 'Hope you had a remarkable meal! Tap below to view your thermal receipt.';
      if (stepReceived) stepReceived.classList.add('completed');
      if (stepCooking) stepCooking.classList.add('completed');
      if (stepReady) stepReady.classList.add('completed');
      if (stepServed) stepServed.classList.add('active');
    }

    modal.classList.add('active');
  }

  // Dismiss status modal
  const dismissTrackerBtn = document.getElementById('btnDismissTracker');
  if (dismissTrackerBtn) {
    dismissTrackerBtn.addEventListener('click', () => {
      document.getElementById('customerOrderTrackerModal')?.classList.remove('active');
    });
  }

  // View receipt from tracker
  const viewReceiptFromTrackerBtn = document.getElementById('btnViewReceiptFromTracker');
  if (viewReceiptFromTrackerBtn) {
    viewReceiptFromTrackerBtn.addEventListener('click', () => {
      if (state.customerActiveOrder) {
        openThermalReceipt(state.customerActiveOrder.id);
      }
    });
  }

  // --- KITCHEN DISPLAY SYSTEM (KDS) RENDERING ---
  function renderKDS() {
    const colIncoming = document.getElementById('kdsColIncoming');
    const colCooking = document.getElementById('kdsColCooking');
    const colReady = document.getElementById('kdsColReady');
    const colServed = document.getElementById('kdsColServed');

    if (!colIncoming || !colCooking || !colReady || !colServed) return;

    const ordersByStatus = {
      incoming: state.orders.filter(o => o.status === 'incoming'),
      cooking: state.orders.filter(o => o.status === 'cooking'),
      ready: state.orders.filter(o => o.status === 'ready'),
      served: state.orders.filter(o => o.status === 'served')
    };

    // Update column badge counters
    document.getElementById('countIncoming')?.replaceChildren(document.createTextNode(ordersByStatus.incoming.length));
    document.getElementById('countCooking')?.replaceChildren(document.createTextNode(ordersByStatus.cooking.length));
    document.getElementById('countReady')?.replaceChildren(document.createTextNode(ordersByStatus.ready.length));
    document.getElementById('countServed')?.replaceChildren(document.createTextNode(ordersByStatus.served.length));

    // Render cards in each column
    renderKDSColumn(colIncoming, ordersByStatus.incoming, 'incoming');
    renderKDSColumn(colCooking, ordersByStatus.cooking, 'cooking');
    renderKDSColumn(colReady, ordersByStatus.ready, 'ready');
    renderKDSColumn(colServed, ordersByStatus.served.slice(0, 5), 'served'); // keep last 5 completed
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

      // Urgency Alert Styling
      let alertClass = 'urgency-normal';
      if (order.status !== 'served') {
        if (elapsedMin >= 12) alertClass = 'urgency-delayed';
        else if (elapsedMin >= 8) alertClass = 'urgency-warning';
      }

      // Action Button Configuration
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
            ${order.items.map(item => `
              <div class="t-item">
                <div class="t-item-line">
                  <span class="t-qty">${item.qty}×</span>
                  <span class="t-name">${item.name}</span>
                </div>
                ${item.modifiers && item.modifiers.length > 0 ? `
                  <div class="t-mods">${item.modifiers.join(', ')}</div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          ${order.notes ? `
            <div class="ticket-chef-notes">
              <strong>Special Note:</strong> ${order.notes}
            </div>
          ` : ''}

          <div class="ticket-actions">
            ${actionBtnHtml}
            <button class="btn-quick-receipt" data-id="${order.id}" title="Print Thermal Receipt">🖨️</button>
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

  // Bump Order to Next Stage
  function bumpOrderStatus(orderId, newStatus) {
    playBumpSound();
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = newStatus;
    order.updatedAt = Date.now();
    saveOrders();

    broadcastEvent('STATUS_UPDATE', {
      id: order.id,
      status: newStatus,
      updatedAt: order.updatedAt
    });

    renderKDS();
    renderCustomerOrderStatus();
    renderStats();
  }

  // KDS Active Elapsed Seconds Interval
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

        // Live urgency warning shifts
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

  // --- STATS & METRICS DASHBOARD ---
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
    if (avgPrepEl) avgPrepEl.textContent = '8.4 min';
    if (completedEl) completedEl.textContent = completedOrders.length;

    // Render 86'd / Out of stock management grid
    renderStockManager();
  }

  function renderStockManager() {
    const listEl = document.getElementById('stockTogglesList');
    if (!listEl || !window.DINEFLOW_MENU) return;

    listEl.innerHTML = window.DINEFLOW_MENU.map(item => {
      const isOut = state.outOfStock.includes(item.id);
      return `
        <div class="stock-item-pill ${isOut ? 'is-out' : 'is-in'}">
          <span class="stock-dish-name">${item.name}</span>
          <button class="btn-toggle-86" data-id="${item.id}">
            ${isOut ? 'Restock (In Stock)' : '86\'d (Out of Stock)'}
          </button>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.btn-toggle-86').forEach(btn => {
      btn.addEventListener('click', () => {
        playTapSound();
        const id = btn.dataset.id;
        if (state.outOfStock.includes(id)) {
          state.outOfStock = state.outOfStock.filter(x => x !== id);
        } else {
          state.outOfStock.push(id);
        }
        saveStock();
        broadcastEvent('STOCK_TOGGLE', state.outOfStock);
        renderStockManager();
        renderCustomerMenu();
      });
    });
  }

  // --- THERMAL RECEIPT MODAL & PRINTING ---
  function openThermalReceipt(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;
    playTapSound();

    const modal = document.getElementById('thermalReceiptModal');
    const receiptPaper = document.getElementById('receiptPaperContent');
    if (!modal || !receiptPaper) return;

    const dateStr = new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    receiptPaper.innerHTML = `
      <div class="thermal-header">
        <div class="thermal-logo">THE RUSTY COPPER</div>
        <div class="thermal-sub">ARTISANAL BISTRO &amp; ROASTERY</div>
        <div class="thermal-address">Plot 42, Sector 8, Inner Ring • Connaught Place</div>
        <div class="thermal-gst">GSTIN: 07AAECR9812K1ZT • FSSAI: 10021011000452</div>
      </div>
      <div class="thermal-dashed"></div>
      <div class="thermal-meta-grid">
        <div><strong>Date:</strong> ${dateStr}</div>
        <div><strong>Time:</strong> ${timeStr}</div>
        <div><strong>Table:</strong> ${order.tableName}</div>
        <div><strong>Order:</strong> #${order.id}</div>
        <div><strong>Channel:</strong> Self-QR Guest</div>
        <div><strong>Server:</strong> KDS Terminal #1</div>
      </div>
      <div class="thermal-dashed"></div>
      <div class="thermal-items-table">
        <div class="thermal-item-header">
          <span>ITEM / MODS</span>
          <span>QTY</span>
          <span>AMT (₹)</span>
        </div>
        ${order.items.map(i => `
          <div class="thermal-item-entry">
            <div class="thermal-item-desc">
              <strong>${i.name}</strong>
              ${i.modifiers && i.modifiers.length > 0 ? `
                <div class="thermal-submods">${i.modifiers.join(', ')}</div>
              ` : ''}
            </div>
            <div class="thermal-item-qty">${i.qty}</div>
            <div class="thermal-item-amt">₹${(i.price * i.qty).toFixed(2)}</div>
          </div>
        `).join('')}
      </div>
      <div class="thermal-dashed"></div>
      <div class="thermal-totals-grid">
        <div><span>Subtotal:</span> <span>₹${order.subtotal.toFixed(2)}</span></div>
        <div><span>CGST (2.5%):</span> <span>₹${(order.tax / 2).toFixed(2)}</span></div>
        <div><span>SGST (2.5%):</span> <span>₹${(order.tax / 2).toFixed(2)}</span></div>
        <div><span>Service Charge (5%):</span> <span>₹${order.serviceCharge.toFixed(2)}</span></div>
        <div class="thermal-grand-total">
          <span>TOTAL PAYABLE:</span>
          <span>₹${order.total.toFixed(2)}</span>
        </div>
      </div>
      <div class="thermal-dashed"></div>
      <div class="thermal-footer">
        <div class="barcode-strip">||| | |||| ||| || ||||| || |||| ||| |||| |</div>
        <div class="thermal-status-paid">✓ PAID VIA UPI / DIGITAL POS</div>
        <div class="thermal-gratitude">Thank you for dining with us!</div>
        <div class="thermal-powered">Powered by DineFlow OS • Built by Gursharan Singh</div>
      </div>
    `;

    modal.classList.add('active');
  }

  // Dismiss Receipt Modal
  const dismissReceiptBtn = document.getElementById('btnDismissReceipt');
  if (dismissReceiptBtn) {
    dismissReceiptBtn.addEventListener('click', () => {
      document.getElementById('thermalReceiptModal')?.classList.remove('active');
    });
  }

  // Print Receipt Button (triggers standard window print with thermal media stylesheet)
  const printReceiptBtn = document.getElementById('btnPrintReceipt');
  if (printReceiptBtn) {
    printReceiptBtn.addEventListener('click', () => {
      window.print();
    });
  }

})();
