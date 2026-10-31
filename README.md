# autonopay — Autonomous Agent-to-Agent (A2A) Commerce Gateway

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![AG Grid](https://img.shields.io/badge/AG_Grid-000000?style=flat&logo=aggrid&logoColor=white)](https://www.ag-grid.com/)
[![PayPal REST API](https://img.shields.io/badge/PayPal-00457C?style=flat&logo=paypal&logoColor=white)](https://developer.paypal.com/)
[![Three.js](https://img.shields.io/badge/Three.js-black?style=flat&logo=three.js&logoColor=white)](https://threejs.org/)

**autonopay** is a financial command center designed for the autonomous AI economy. It solves the "trust gap" in B2B AI commerce by acting as an autonomous receiving merchant agent. When consumer AI agents (like Meta Muse or AutoGPT) negotiate for goods, compute, or tokens, autonopay validates business rules, packages the deal into an **AP2 Cart Mandate**, streams it in real-time to an AG Grid command terminal, and enables Human-in-the-Loop clearance via the **PayPal Orders REST API**.

---

## ⚡ Quick Start

### 1. Start Backend & WebSockets
```bash
cd backend
npm run dev
# Running on http://localhost:3001 and ws://localhost:3001
```

### 2. Start Frontend Command Center
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

---

## 📖 Complete Documentation

For the complete architectural breakdown, sequence diagrams, API reference, component hierarchy, and PayPal integration guide, see:

👉 **[PROJECT_DOCUMENTATION.md](file:///r:/AI-TOOLS/Autonopay/PROJECT_DOCUMENTATION.md)**

---

## 🏗️ System Overview

```mermaid
graph LR
    ConsumerAI[Consumer AI Agent] -->|1. Negotiation| Backend[autonopay Express API]
    Backend -->|2. AP2 Cart Mandate| WS[WebSocket Stream]
    WS -->|3. Real-Time Ingestion| UI[AG Grid React Command Center]
    UI -->|4. Human Clearance| PayPal[PayPal Orders API]
    PayPal -->|5. Settlement Link| UI
```
