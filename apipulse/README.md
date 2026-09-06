# ⚡ APIPulse — High-Precision API Profiler & Latency Waterfall Studio

[![Live Studio](https://img.shields.io/badge/Live_Studio-Interactive_Demo-f59e0b?style=for-the-badge&logo=googlechrome&logoColor=black)](https://gurumaan.github.io/apipulse/)
[![License: MIT](https://img.shields.io/badge/License-MIT-06b6d4?style=for-the-badge)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero_Vanilla_ES6+-10b981?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![OWASP Security](https://img.shields.io/badge/OWASP-Compliance_Audit_Engine-a855f7?style=for-the-badge)](https://owasp.org/)

**APIPulse** is a high-precision, web-native API latency profiler, network timing waterfall visualizer, live WebSocket stream inspector, and OWASP security header compliance auditor.

Engineered from first principles with zero external UI frameworks or bloated runtimes, it models the clean, information-dense aesthetic of modern developer tools (such as **Linear, Raycast, and Datadog**) to provide instantaneous sub-millisecond visibility into HTTP/REST and WebSocket protocols.

---

## 🏛️ System Architecture Topology

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               APIPULSE RUNTIME ENGINE                                  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               ▼                                                         ▼
┌───────────────────────────────┐                         ┌───────────────────────────────┐
│     HTTP / REST Profiler      │                         │   WebSocket Stream Studio     │
│  (Fetch + W3C ResourceTiming) │                         │ (Duplex WebSocket Connection) │
└──────────────┬────────────────┘                         └──────────────┬────────────────┘
               │                                                         │
               ├───────────────────┐                                     ├───────────────────┐
               ▼                   ▼                                     ▼                   ▼
┌─────────────────────────┐ ┌─────────────────────────┐   ┌─────────────────────────┐ ┌─────────────────────────┐
│ Timing Waterfall Engine │ │  OWASP Security Auditor │   │ Live Frame Stream       │ │ Frame Dispatcher        │
│ DNS ➔ TCP ➔ TLS ➔ TTFB  │ │ HSTS, CSP, X-Frame, MIME│   │ IN/OUT Opcode Telemetry │ │ Microsecond Ping Metric │
└─────────────────────────┘ └─────────────────────────┘   └─────────────────────────┘ └─────────────────────────┘
```

---

## ⚡ Key Engineering Capabilities

### 1. Sub-Millisecond W3C Resource Timing Waterfall
Directly taps into the browser's `PerformanceResourceTiming` API to deconstruct network round-trips into precise protocol milestones:
* **DNS Resolution:** `domainLookupEnd - domainLookupStart`
* **TCP Handshake:** `connectEnd - connectStart`
* **TLS / SSL Negotiation:** `connectEnd - secureConnectionStart`
* **Time To First Byte (TTFB):** `responseStart - requestStart`
* **Content Transfer / Ingestion:** `responseEnd - responseStart`

### 2. Dual-Protocol Engine (REST + WebSocket)
* **REST / HTTP Workspace:** Inspects `GET`, `POST`, `PUT`, `DELETE`, and `HEAD` requests with custom header injectors, query parameter sync, and formatted JSON payload editors.
* **WebSocket Stream Studio:** Establishes live bidirectional socket sessions (`wss://`), streams raw incoming and outgoing message frames with microsecond timestamps, and measures live roundtrip ping latencies.

### 3. Automated OWASP Security Compliance Matrix
Audits response headers against enterprise security baselines:
* `Strict-Transport-Security` (HSTS Preload & Max-Age compliance)
* `Content-Security-Policy` (CSP Script & Style restriction validation)
* `X-Content-Type-Options` (`nosniff` MIME-sniffing protection)
* `X-Frame-Options` (Clickjacking defense via `DENY` or `SAMEORIGIN`)
* `Permissions-Policy` (Hardware sensor and geolocation fencing)
* Computes an instantaneous **Security Compliance Grade (A+ to F)**.

### 4. Interactive JSON Tree Inspector & cURL Compiler
* Collapsible JSON tree renderer with syntax highlighting (keys, strings, numbers, booleans, nulls).
* Real-time key filtering and live search.
* 1-Click **cURL Generator** producing production-ready terminal commands with escape-sanitized headers and payloads.
* **HAR (HTTP Archive) Exporter** compatible with Chrome DevTools, Datadog, and Postman.

---

## 🛠️ Tech Stack & Zero-Dependency Philosophy

| Layer | Implementation | Design Decision |
| :--- | :--- | :--- |
| **Core Runtime** | Vanilla ECMAScript (ES6+) | 0kB bundle overhead; 100% browser-native performance. |
| **Styling & UI** | CSS Custom Properties (`var(--...)`) | Obsidian dark studio design system with hardware-accelerated animations. |
| **Typography** | `Inter` + `JetBrains Mono` | Crisp readability for high-density tabular and code data. |
| **Diagnostics** | W3C Performance Timing API | Hardware timestamp precision down to microsecond increments. |

---

## 🚀 Quickstart & Local Execution

Clone the repository and serve with any static web server:

```bash
# Clone the repository
git clone https://github.com/gurumaan/apipulse.git
cd apipulse

# Run locally with Python 3
python -m http.server 3005

# Or with Node.js
npx serve .
```

Open `http://localhost:3005` in your browser.

---

## 📄 License
MIT License. Free for open-source development and commercial evaluation.