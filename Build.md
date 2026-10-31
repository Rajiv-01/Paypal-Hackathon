# Project Specifications: autonopay (A2A Commerce Gateway)

## 1. Project Overview
autonopay is an Agent-to-Agent (A2A) financial command center built for a hackathon. It solves the "trust gap" in AI commerce by acting as a secure B2B receiving agent. When a consumer AI (like Meta Muse) attempts to purchase goods, the autonopay backend negotiates the deal, formats it into an "AP2 Cart Mandate," and streams it via WebSockets to a React frontend. The human merchant reviews the transaction in an AG Grid dashboard and clicks "Approve," which triggers the PayPal Orders API for secure settlement.

## 2. Tech Stack & Environment
*   **Backend:** Node.js, Express, TypeScript, `ws` (WebSockets), `@paypal/mcp` (PayPal Model Context Protocol), OpenAI SDK (for the merchant agent logic).
*   **Frontend:** React (Vite), TypeScript, Tailwind CSS, `ag-grid-react` (AG Grid Enterprise features simulated/implemented), `react-use-websocket`.
*   **APIs:** PayPal REST API (`/v2/checkout/orders`), PayPal Webhooks.

## 3. Architecture & Data Flow
1.  **Simulation Endpoint:** A simple POST endpoint `/api/simulate-agent` that accepts a payload from a mock consumer agent (e.g., `{ "item": "Widget", "requested_price": 45, "quantity": 100 }`).
2.  **The Merchant Agent:** The backend processes this request using an LLM. It applies a system prompt with hardcoded business rules (e.g., "Minimum price for Widget is $50").
3.  **The Cart Mandate:** Once the LLM finishes negotiating, it outputs a strict JSON object:
    ```json
    {
      "mandate_id": "req_123",
      "consumer_agent": "Meta Muse",
      "agreed_price": 50,
      "quantity": 100,
      "total_value": 5000,
      "risk_score": 12,
      "transcript": "[Full chat text]",
      "status": "PENDING_APPROVAL"
    }
    ```
4.  **WebSocket Telemetry:** The backend broadcasts this JSON mandate over a WebSocket to the React frontend.
5.  **AG Grid UI:** The React frontend listens to the WebSocket. When a new mandate arrives, it uses `api.applyTransactionAsync()` to prepend the row to the grid. 
6.  **Human-in-the-Loop:** The grid has a custom cell renderer for the "Actions" column containing an `[Approve]` button. Clicking it sends a POST to `/api/execute-order`.
7.  **Financial Execution:** The backend receives the approval, initializes the PayPal Orders API, creates the checkout URL, and returns it.

---

## 4. Antigravity Agent Execution Plan

### Phase 1: Workspace Scaffolding & Setup
*Agent Instructions:*
1. Initialize a monorepo structure with two folders: `/backend` and `/frontend`.
2. In `/backend`, initialize a Node.js TypeScript project. Install `express`, `cors`, `dotenv`, `ws`, `openai`, and `@paypal/mcp`. Set up a basic Express server on port 3001.
3. In `/frontend`, use Vite to scaffold a React + TS project. Install `tailwindcss`, `ag-grid-react`, `ag-grid-community`, and `react-use-websocket`. Configure Tailwind.
4. Create a `.env.example` file in the root demonstrating the required PayPal and OpenAI keys.

### Phase 2: The Agentic Backend & WebSockets
*Agent Instructions:*
1. Create a WebSocket server attached to the Express app.
2. Build the `/api/simulate-agent` route. This route should mock an LLM negotiation delay (using `setTimeout` or a mock OpenAI call) and construct the JSON `Cart Mandate` described in Section 3.
3. Broadcast the generated `Cart Mandate` via the WebSocket to any connected clients.
4. Build the `/api/execute-order` route. For now, mock the PayPal Orders API integration by returning `{ "status": "COMPLETED", "checkout_url": "https://sandbox.paypal.com/checkout/mock" }` after a 1-second delay.

### Phase 3: The Command Center (AG Grid)
*Agent Instructions:*
1. In the React frontend, build a dark-mode, high-tech dashboard layout using Tailwind.
2. Instantiate `AgGridReact`. Define the following columns: `Mandate ID`, `Consumer Agent`, `Agreed Price`, `Quantity`, `Total Value`, `Risk Score` (color code red if > 50%), `Status`, and `Actions`.
3. Implement `react-use-websocket` to listen to the backend (ws://localhost:3001).
4. When a message is received, parse the JSON and use AG Grid's `applyTransaction` to dynamically insert the new row without refreshing the page.
5. **Master-Detail (Crucial):** Configure AG Grid to allow row expansion. When expanded, display the `transcript` field in a formatted, scrollable text block mimicking a chat UI.
6. **Custom Cell Renderer:** Build a React component for the `Actions` column containing an "Approve" button. When clicked, it should call the backend `/api/execute-order` endpoint, await the response, and then update the row's status to "SETTLED".

### Phase 4: PayPal Real-World Integration
*Agent Instructions:*
1. Update `/api/execute-order` to use real PayPal API credentials. Use the standard PayPal REST API to create an order (`POST /v2/checkout/orders`).
2. The order payload must map the `agreed_price` and `quantity` from the Cart Mandate into the `purchase_units` array.
3. Handle the response and pass the `approve` link back to the frontend.

## 5. Agent Verification & Artifacts
*Antigravity, before completing this task, please autonomously verify:*
1. Use your terminal to launch both the backend (`npm run dev`) and frontend (`npm run dev`).
2. Actuate the browser to open `localhost:5173`.
3. Use your terminal to send a mock cURL POST request to `/api/simulate-agent`.
4. Verify visually (take a screenshot Artifact) that the AG Grid UI updates in real-time with the new transaction.
5. Click the "Approve" button in the browser and verify the row status changes to SETTLED.