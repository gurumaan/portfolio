# 🍽️ DineFlow 2.0 — Enterprise Hospitality Operating System & Real-Time KDS

[![Live Demo](https://img.shields.io/badge/Live_Studio-Interactive_Hospitality_OS-d4af37?style=for-the-badge&logo=googlechrome&logoColor=black)](https://gurumaan.github.io/dineflow/)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero_Vanilla_ES6+-06b6d4?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Web Audio Bell](https://img.shields.io/badge/Audio-Acoustic_Brass_Synthesizer-f59e0b?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

**DineFlow 2.0** is an enterprise hospitality operating system and commercial real-time Kitchen Display System (KDS) engineered from first principles to eliminate fragile tablet POS setups, expensive proprietary hardware lock-ins, and kitchen order transmission latency.

Designed to reflect the craft of senior product and design teams (inspired by **Toast POS**, **Square for Restaurants**, and **Sunday App**), DineFlow provides dedicated full-viewport workspaces for guests, line chefs, and floor managers with zero split-screen clutter.

---

## 🏛️ System Architecture Topology

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               DINEFLOW 2.0 RUNTIME BUS                                 │
│                     W3C BroadcastChannel ('dineflow_v2_bus')                           │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
       ┌────────────────────────────────────┼────────────────────────────────────┐
       ▼                                    ▼                                    ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐ ┌───────────────────────────────┐
│     Guest Digital Dining      │ │ Commercial Kitchen KDS (Line) │ │    Floor & Thermal POS Engine   │
│  (Customizer, Tray, Checkout) │ │ (Kanban Routing, SLA Timers)  │ │ (Table Map, 80mm Invoicing)   │
└──────────────┬────────────────┘ └──────────────┬────────────────┘ └──────────────┬────────────────┘
               │                                 │                                 │
               └─────────────────┐               │               ┌─────────────────┘
                                 ▼               ▼               ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│               Web Audio Acoustic POS Synthesizer (Zero Latency Brass Counter Bell)             │
│               1760Hz / 3520Hz Dual-Harmonic Ping Engine + Haptic Chef Bump Feedback            │
└────────────────────────────────────────────────┬───────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│               80mm Dot-Matrix Thermal Tax Receipt Generator (Standardized GST & FSSAI)         │
│               Itemized Modifiers, 2.5% CGST/SGST, 5% Service Charge, Barcodes, @media print    │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Core Engineering Highlights

### 1. Dedicated Full-Viewport Workspaces (Zero Clutter)
* **Guest Digital Dining Experience (`?view=guest`):** Clean, luxury Mediterranean bistro menu with live dietary filtering (Vegetarian, Vegan, Gluten-Free, Spicy), interactive dish modifier customizer (crust, cooking doneness, chef notes), and a slide-out order tray drawer.
* **Commercial Kitchen Display System (`?view=kds`):** High-contrast industrial terminal with dynamic station routing (Grill & Sauté, Woodfired Oven, Cold Larder, Cocktail Bar), second-by-second SLA timers (`<6m` Normal, `6-12m` Warning, `>12m` Urgent Pulse), and tactile bump actions.
* **Floor Plan & 80mm Thermal POS (`?view=floor`):** Live table occupancy visualization (Tables 01-10) with order aggregation and authentic dot-matrix 80mm thermal receipt generator formatted for receipt roll printers via `@media print`.

### 2. Microsecond Cross-Window Protocol Synchronization
* Built with the native browser **W3C `BroadcastChannel`** API (`dineflow_v2_bus`).
* Multiple browser tabs (e.g., Guest tablet ordering on iPad while kitchen chefs monitor KDS on a desktop monitor) synchronize orders, bump states, table billing, and out-of-stock items in **< 5ms**.

### 3. Hardware-Accurate Web Audio Acoustic Sound Engine
* Generates an authentic physical brass service counter bell directly via browser oscillators without bloated MP3 assets:
  - Frequencies: `1760Hz`, `3520Hz`, and `5280Hz` multi-harmonic waves.
  - Exponential volume decay curve mimicking a physical copper counter bell.
* Low-frequency tactile chef bump confirmation audio (`140Hz` to `45Hz`).

### 4. Zero-Dependency Vanilla Architecture
* 100% pure vanilla JavaScript (ES6+), semantic HTML5, and CSS custom properties.
* 0kB external bundle overhead, instant cold start, and full offline caching support.

---

## 🚀 Quickstart & Local Execution

```bash
# Clone repository
git clone https://github.com/gurumaan/dineflow.git
cd dineflow

# Serve locally
python -m http.server 3000
```

Open `http://localhost:3000/dineflow/` in your browser.