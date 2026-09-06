<div align="center">

# 🍽️ DineFlow
### Real-Time QR Table Ordering, Kitchen Display System (KDS) & Hospitality OS

[![Live Demo](https://img.shields.io/badge/Live_Demo-Interactive_Lab-C85A32?style=for-the-badge&logo=safari&logoColor=white)](https://gurumaan.github.io/dineflow/)
[![Architecture](https://img.shields.io/badge/Architecture-Real--Time_Broadcast_Bus-16171A?style=for-the-badge&logo=fastapi&logoColor=white)](#-system-architecture)
[![Audio Synthesizer](https://img.shields.io/badge/Hardware_Audio-Web_Audio_API-2E7D32?style=for-the-badge&logo=webaudio&logoColor=white)](#-hardware-pos-sound-engine)
[![Author Portfolio](https://img.shields.io/badge/Author_Portfolio-Gursharan_Singh-b58334?style=for-the-badge&logo=safari&logoColor=white)](https://gurumaan.github.io/)

<br/>

> **An enterprise hospitality operating system combining guest mobile table ordering, live multi-station kitchen display routing, tactile acoustic hardware audio, interactive UPI payment simulation, and 80mm thermal receipt generation.**

</div>

---

## ⚡ Overview

**DineFlow** is an artisanal restaurant dining and kitchen automation platform engineered from first principles to replace legacy, clunky POS terminals. Designed specifically with human hospitality workflows in mind &mdash; free from generic AI templates &mdash; it provides a **unified dual-screen ecosystem**:

1. **Guest Mobile Dine-in App (`Guest Mobile`):** Realistic smartphone hardware frame with Dynamic Island status indicator, artisanal bistro menu, standardized dietary indicators (`🌱 Veg` / `🔺 Non-Veg`), table waiter call button, and interactive UPI QR / Card checkout.
2. **Kitchen Display System (`Kitchen KDS`):** High-contrast dark terminal for hot kitchen lines with multi-station routing (*Grill & Sauté*, *Larder & Cold*, *Barista & Bar*, *Pastry Counter*), Kanban ticket bumping (*Incoming*, *Cooking*, *Ready*, *Served*), urgency elapsed timers, and waiter service request alerts.
3. **Split-Screen Live Lab:** A synchronized side-by-side simulator enabling clients and reviewers to place orders on the guest phone, ring the kitchen bell, call the waiter, and settle payments in real-time.
4. **POS Telemetry & 86'd Stock:** Real-time revenue tracking, average preparation SLA metrics, dining room floor table status, and instant out-of-stock toggles.

---

## 🏛️ System Architecture

```text
┌───────────────────────────────────────┐                  ┌──────────────────────────────────────────────┐
│       Guest Mobile Table Order        │                  │         Kitchen Display System (KDS)         │
│  (iPhone Chassis, Dynamic Island,     │                  │   (Multi-Station Routing, Chef Bump Actions, │
│   Dietary Badges, Call Waiter, UPI)   │                  │    Urgency SLA Timers, Waiter Alert Toast)   │
└──────────────────┬────────────────────┘                  └──────────────────────▲───────────────────────┘
                   │                                                              │
                   │ BroadcastChannel ('dineflow_bus') / LocalStorage Sync Bus    │
                   └──────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        Web Audio Hardware POS Synthesizer (Zero Audio Latency)                          │
│   1760Hz / 3520Hz Multi-Harmonic Brass Counter Bell ('Ding Ding!') + POS Register Chime + Bump Thud     │
└──────────────────────────────────────────────────┬──────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│             Interactive POS Settlement Engine & 80mm Thermal Receipt Generator                          │
│     UPI QR Code Scanner Simulation, Card Tap, Animated Checkmark, GSTIN/FSSAI Tax Invoice Print         │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Engineering Highlights

### 1. 🔔 Hardware POS Sound Engine (Web Audio API)
- Eliminates external audio dependencies by synthesizing realistic acoustic frequencies directly in the browser.
- **Service Bell (`playServiceBell()`):** Dual-stage harmonic resonance (1760Hz, 3520Hz, 5280Hz) simulating a real brass restaurant service bell.
- **Cash Register Chime (`playPaymentSuccessChime()`):** Multi-chord settlement feedback (C7, E7, G7) upon successful checkout.
- **Dedicated Sound Test Trigger:** A one-click "Test Bell Chime" button directly in the KDS header for instant audio evaluation.

### 2. 👨‍🍳 Multi-Station Kitchen Routing
- Real hospitality kitchens divide production lines. DineFlow routes tickets dynamically:
  - `All Stations (Combined)`: Global expeditor pass.
  - `Grill & Sauté Line`: Steaks, wood-fired pastas, and pizzas.
  - `Larder & Cold Plates`: Sourdough toasts, burrata salads, and small plates.
  - `Barista & Craft Bar`: Cold brew nitro floats, cascara ferments, and flat whites.
  - `Pastry Counter`: Basque burnt cheesecakes and Valrhona lava cakes.

### 3. 💳 Interactive UPI & Card Checkout Gateway
- Guests can settle their bill directly from their phone.
- **UPI QR Code Mode:** Generates a clean SVG QR code compatible with GPay, PhonePe, and Paytm, with a one-click simulation trigger.
- **Contactless Card Mode:** Simulates EMV chip and NFC tap-to-pay.
- **Settlement Lifecycle:** Realistic 1.2s bank authorization spinner &rarr; animated green success checkmark &rarr; instant order transition to "Served & Settled" &rarr; opens printable 80mm thermal tax invoice.

### 4. 🛎️ Table Waiter Service Dispatcher
- Guests can tap "Call Waiter" from the mobile header to request *Water Refills*, *Extra Cutlery & Napkins*, *Table Clearing*, or *Server Assistance*.
- Dispatches an instant acoustic chime and an alert banner directly onto the chef KDS terminal with an "Acknowledge" button.

### 5. ⏱️ Kitchen SLA Urgency Timers
- Every ticket tracks elapsed preparation seconds (`Date.now() - order.createdAt`).
- **Urgency Visuals:**
  - `Normal (< 8 min)`: Emerald green border.
  - `Warning (8-12 min)`: Amber caution border.
  - `Delayed (> 12 min)`: Pulsing red urgent alert.

### 6. 🖨️ 80mm Dot-Matrix Thermal Tax Invoice
- Authentic monospace thermal paper formatting with GSTIN, FSSAI registration numbers, itemized modifiers, split taxes (CGST/SGST 2.5%), and barcode strips.
- Includes a dedicated `@media print` stylesheet for real POS thermal receipt printers.

---

## 📁 Repository Structure

```text
dineflow/
├── index.html       # Unified responsive SPA: Split Live Lab, Guest Mobile, & KDS
├── style.css        # Bespoke design system: iPhone frame, KDS dark mode, typography
├── app.js           # State management, Web Audio synthesizer, BroadcastChannel bus, KDS routing
├── menu_data.js     # Curated culinary catalog, station routing, and table definitions
└── README.md        # Technical architecture and documentation
```

---

## 🛠️ Local Development

Clone the repository and serve using any local HTTP static server:

```bash
# Clone
git clone https://github.com/gurumaan/dineflow.git
cd dineflow

# Serve locally
python -m http.server 3000
# or
npx serve .
```

Open `http://localhost:3000` in your browser.

---

## 👨‍💻 Author

**Gursharan Singh**
- Portfolio: [gurumaan.github.io](https://gurumaan.github.io/)
- GitHub: [@gurumaan](https://github.com/gurumaan)
