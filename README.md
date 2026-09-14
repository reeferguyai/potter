# PotGrowHub Ecosystem (`potgrowhub.store`)

> **The AI-Powered Botanical Intelligence, 3D/AR Visualization & Zero-Inventory PWA E-Commerce Suite**

---

## Executive Overview

**PotGrowHub** (`potgrowhub.store`) is an advanced, production-grade, decentralized botanical e-commerce and artificial intelligence ecosystem. Built specifically for modern cultivators, botanical researchers, and web-native retail operations, the platform fuses **Zero-Inventory Print-on-Demand (3DPoD)** capabilities with **WebXR/WebGL 3D product rendering**, real-time **AI cultivation advisory engines (GanjaGuru)**, and hyper-local spatial delivery routing.

Designed with a decoupled micro-frontend and modular backend architecture, `potgrowhub.store` operates seamlessly across high-performance web browsers, Progressive Web App (PWA) containers, and containerized cloud environments.

---

## Core System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     Client Tier (PWA)                       │
│  [Index.html] ── [Three.js/WebXR Viewport] ── [Service Worker] │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST / WebSockets
┌──────────────────────────────▼──────────────────────────────┐
│                    API Gateway / Express                    │
│      [Helmet Security] ── [Rate Limiting] ── [JWT Auth]     │
└──────┬───────────────────────┬──────────────────────┬───────┘
       │                       │                      │
┌──────▼──────────────┐ ┌──────▼──────────────┐ ┌─────▼───────┐
│ AI Advisory Engines │ │ 3D & Print-on-Demand│ │ Logistics & │
│ (Gemini/Ollama/LLMs)│ │ (Three.js/Printful) │ │ GIS / Turf  │
└─────────────────────┘ └─────────────────────┘ └─────────────┘

```

---

## Key Feature Matrix

* **Botanical Intelligence (GanjaGuru AI):** Integrated local and cloud LLM pipelines (powered by Ollama, Gemini, and LangChain) providing real-time strain discovery, diagnostic cultivation counseling, and automated environment tuning.
* **Immersive WebXR & 3D Visualization:** Real-time 3D model rendering, GLTF/STL loading, and augmented reality (AR) product previewing powered by Three.js and Babylon.js.
* **Zero-Inventory 3DPoD Suite:** Automated drop-shipping and print-on-demand fulfillment loops synchronized directly with Printful, Gelato, and custom localized fabrication nodes.
* **Hyper-Local Micro-Mobility Routing:** Last-500-feet spatial navigation engines utilizing Turf.js, Mapbox GL, and custom node geocoding for urban courier dispatching.
* **Robust Security & Compliance:** Enterprise-grade security headers via Helmet, JWT authentication, bcrypt encryption, rate limiting, and automated security scanning (`snyk`, `npm audit`).

---

## Technical Stack & Dependencies

The project relies on a carefully curated ecosystem of high-performance runtime packages:

```json
{
  "runtime": "Node.js >=18.0.0",
  "frameworks": ["Express 4.19.2", "Three.js 0.162.0", "A-Frame 1.5.0"],
  "ai_ml": ["@google/generative-ai", "openai", "langchain", "@tensorflow/tfjs-node"],
  "database_cache": ["pg (PostgreSQL)", "redis"],
  "security": ["helmet", "express-rate-limit", "jsonwebtoken", "bcryptjs", "validator"]
}

```

---

## Installation & Local Development

### Prerequisites

* **Node.js**: Version `18.0.0` or higher
* **npm**: Version `9.0.0` or higher
* **Docker**: Version `24.0.0+` (optional for containerized runs)

### Quick Start Setup

Clone the repository and install all dependencies:

```bash
git clone https://github.com/potgrowhub/potgrowhubstore.git
cd potgrowhubstore
npm install

```

### Environment Configuration

Create a `.env` configuration file in the root directory based on your deployment targets:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/potgrowhub
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secure_jwt_secret_key
AI_ENGINE=GanjaGuru-v1

```

### Running the Application

* **Development Mode (with auto-reload):**
```bash
npm run dev

```


* **Production Start:**
```bash
npm start

```


* **Docker Build & Run:**
```bash
npm run docker:build
npm run docker:run

```



---

## Build, Testing & Quality Assurance

Potgrowhubstore includes comprehensive build scripts, automated testing suites, and strict linting rules.

* **Build PWA Static Bundle:**
```bash
npm run build

```


* **Run Code Linter (ESLint):**
```bash
npm run lint

```


* **Execute Test Suite (Node.js test runner & Jest):**
```bash
npm test

```


* **Code Coverage Analysis:**
```bash
npm run coverage

```


* **Security Vulnerability Audit:**
```bash
npm run security:scan

```



---

## Repository File Structure

```text
potgrowhubstore/
├── index.html              # Core application entry point
├── style.css               # Modular design system and theme tokens
├── script.js               # Client-side controller and WebXR initialization
├── service-worker.js       # PWA offline caching handler
├── manifest.json           # Web app metadata manifest
├── server.js               # Express API and middleware server
├── robots.txt              # Search engine crawler configuration
├── sitemap.xml             # Dynamic multi-tier XML sitemap
├── ads.txt                 # Authorized Digital Sellers disclosure
├── seo.txt / aeo.txt       # Machine-readable SEO and Answer Engine context
├── security.txt            # Vulnerability disclosure contact policy
├── package.json            # Project manifest, scripts, and dependencies
└── requirements.txt        # Python backend support runtimes

```

---

## Contributing & Community

We welcome contributions from developers, botanical engineers, and open-source advocates. Please review our contribution guidelines before submitting pull requests.

1. Fork the Repository (`[https://github.com/potgrowhub/potgrowhubstore/fork](https://github.com/potgrowhub/potgrowhubstore/fork)`)
2. Create your Feature Branch (`git checkout -b feature/BotanicalModule`)
3. Commit your Changes (`git commit -m 'Add advanced strain filtering module'`)
4. Push to the Branch (`git push origin feature/BotanicalModule`)
5. Open a Pull Request

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

*Maintained by Ray & the PotGrowHub AI Engine (`ganjaguru@potgrowhub.local`).*