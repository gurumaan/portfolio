<div align="center">

# 🍽️ DineFlow
### Real-Time QR Table Ordering, Kitchen Display System (KDS) & Hospitality OS

[![Live Demo](https://img.shields.io/badge/Live_Demo-Interactive_Lab-C85A32?style=for-the-badge&logo=safari&logoColor=white)](https://gurumaan.github.io/dineflow/)
[![Architecture](https://img.shields.io/badge/Architecture-Real--Time_Broadcast_Bus-16171A?style=for-the-badge&logo=fastapi&logoColor=white)](#-system-architecture)
[![Audio Synthesizer](https://img.shields.io/badge/Hardware_Audio-Web_Audio_API-2E7D32?style=for-the-badge&logo=webaudio&logoColor=white)](#-hardware-pos-sound-engine)
[![Author Portfolio](https://img.shields.io/badge/Author_Portfolio-Gursharan_Singh-b58334?style=for-the-badge&logo=safari&logoColor=white)](https://gurumaan.github.io/)

<br/>

> **An enterprise hospitality operating system combining guest mobile table ordering, live multi-station kitchen display routing, tactile acoustic hardware audio, and 80mm thermal receipt generation.**

</div>

---

## ⚡ Overview

**DineFlow** is an artisanal restaurant dining and kitchen automation platform engineered from first principles to replace legacy, clunky POS terminals. Designed specifically with human hospitality workflows in mind &mdash; free from generic AI templates &mdash; it provides a **unified dual-screen ecosystem**:

1. **Guest Mobile Dine-in App (`/dine`):** High-end artisanal bistro menu, dynamic table binding (`Table 04`), allergen modifiers, and real-time live order progress stepper.
2. **Kitchen Display System (`/kds`):** High-contrast dark terminal for hot kitchen environments with Kanban ticket routing (*Incoming*, *Cooking*, *Ready*, *Served*), urgency elapsed timers, and one-tap order bumping.
3. **Split-Screen Live Lab:** A synchronized simulator enabling clients and reviewers to place orders on the guest phone and observe tickets instantly ringing the kitchen bell in real-time.

---

## 🏛️ System Architecture

```text
┌───────────────────────────────────────┐                  ┌───────────────────────────────────────┐
│       Guest Mobile Table Order        │                  │      Kitchen Display System (KDS)     │
│  (Category Filters, Dish Modifiers)   │                  │  (Kanban Routing, Chef Bump Actions)  │
└──────────────────┬────────────────────┘                  └───────────────────▲───────────────────┘
                   │                                                           │
                   │ BroadcastChannel ('dineflow_bus') / LocalStorage Fallback  │
                   └───────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        Web Audio Hardware POS Synthesizer (Zero Audio Latency)                         │
│  1800Hz / 3600Hz Multi-Harmonic Brass Counter Bell ('Ding Ding!') + Tactile Chef Bump Oscillators      │
└──────────────────────────────────────────────────┬─────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                 80mm Thermal Receipt Generator & Real-Time POS Sales Analytics Engine                  │
│       Itemized Modifiers, 5% CGST/SGST, Service Charge, Monospace Dot-Matrix Formatting, Barcodes       │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌟 Key Engineering Highlights

### 1. 🔔 Hardware POS Sound Engine (Web Audio API)
- Eliminates external `.mp3` dependencies and network audio delays by synthesizing realistic acoustic frequencies directly in the browser.
- **Service Bell (`playServiceBell()`):** Dual-stage multi-harmonic ping (1760Hz, 3520Hz, 5280Hz) with exponential copper resonance decay simulating real brass restaurant bells.
- **Chef Bump Sound (`playBumpSound()`):** Low-frequency triangle wave thud for tactile order progression.

### 2. ⚡ Real-Time Cross-Window Synchronization
- Powered by modern W3C `BroadcastChannel` with automated `localStorage` event-bus fallback.
- Orders dispatched from any smartphone or browser tab instantly propagate to kitchen screens across devices without polling delays.

### 3. ⏱️ Kitchen Urgency Alerts & Elapsed Timers
- Every ticket tracks elapsed preparation seconds (`Date.now() - order.createdAt`).
- **Urgency Levels:**
  - `Normal (< 8 min)`: Emerald green border.
  - `Approaching SLA (8-12 min)`: Amber warning border.
  - `Delayed (> 12 min)`: Flashing terracotta red alert with high-visibility badge.

### 4. 🖨️ 80mm Dot-Matrix Thermal Receipt Generator
- Formats tickets into authentic restaurant tax invoices with restaurant GSTIN, FSSAI registration numbers, itemized modifiers, split taxes (CGST/SGST 2.5%), and barcode strips.
- Includes a dedicated `@media print` stylesheet for real thermal POS receipt printers.

---

## 📁 Repository Structure

```text
dineflow/
├── index.html       # Unified responsive SPA: Split Live Lab, Guest Mobile, & KDS
├── style.css        # Bespoke artisanal design system: warm cream, terracotta, and KDS dark mode
├── app.js           # State management, Web Audio synthesizer, BroadcastChannel bus, KDS logic
├── menu_data.js     # Curated master culinary catalog, modifier sets, and table definitions
└── README.md        # Technical architecture and documentation
```

---

## 🛠️ Local Development

Clone the repository and serve using any local HTTP static server:

```bash
# Clone
git clone https://github.com/gurumaan/dineflow.git
cd dineflow

# Run with Python 3
python -m http.server 3000

# Or run with Node.js
npx serve . -p 3000
```

Open `http://localhost:3000` to access the interactive Split-Screen Live Lab.

---

## 👨‍💻 Author & Engineering Profile

**Gursharan Singh**  
*Full-Stack Developer & Systems Builder (3+ Years Experience)*

- 🌐 **Live Portfolio:** [gurumaan.github.io](https://gurumaan.github.io/)
- 💻 **GitHub:** [@gurumaan](https://github.com/gurumaan)
- ✉️ **Contact:** [gurudeveloper05@gmail.com](mailto:gurudeveloper05@gmail.com)

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
