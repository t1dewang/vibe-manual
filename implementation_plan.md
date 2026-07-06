# Implementation Plan: VibeManual - The Intelligent Interactive Manual & Product Concierge

**VibeManual** is a premium, portfolio-ready web application built for the Kaggle AI Agents Capstone Project. It transforms static, text-heavy product manuals (or just product names) into highly interactive, beautiful, and easy-to-use digital canvases.

---

## Design System: Nordic Minimalist (极简现代原色风)
Inspired by Apple, Dyson, and Scandinavian design principles, the UI will feature:
- **Color Palette**: Clean off-white backgrounds (`#f5f5f7`, `#fafafa`), crisp white cards (`#ffffff`), soft dark text (`#1d1d1f`), and brand accent colors (e.g., Dyson orange `#ff5a00` or Apple blue `#0071e3` for highlights).
- **Typography**: Modern sans-serif fonts (e.g., Inter or System UI font) for clean readability, and JetBrains Mono for logs.
- **Visual Texture**: Large border radiuses (`16px`), micro-borders (`1px solid rgba(0,0,0,0.06)`), soft drop shadows (`0 8px 30px rgba(0,0,0,0.04)`), and fluid, springy CSS transitions.

---

## User Review Required

> [!IMPORTANT]
> **API Key Setup**: The Google Antigravity SDK relies on the `GEMINI_API_KEY` to query Gemini models. The application will check the environment variable and, if missing, show an elegant setup modal in the frontend allowing the user to input the key (which will be saved to a local `.env` file).

---

## Proposed Changes

### Component 1: Python Backend (`backend/`)

#### [NEW] [agents.py](file:///Users/taowang/Desktop/Workshop/IntensiveVibeCodingCapstoneProject/backend/agents.py)
Implements the multi-agent orchestration and schema validation.
- Defines Pydantic schemas for the structured manual output:
  - `QuickStartStep`: step index, title, description, icon.
  - `ProductFeature`: title, description, operation_steps, precautions, support_info.
  - `CommonFault`: symptom, cause, solution, warning_level (info/warning/danger).
  - `StructuredManual`: product_name, model, category, brief_description, quick_start, features, faults.
- Sets up the `ManualAnalystAgent` utilizing `response_schema=StructuredManual` to guarantee clean structured JSON outputs.
- Sets up the `ExpertChatAgent` configured with conversation persistence, acting as the product support assistant.

#### [NEW] [main.py](file:///Users/taowang/Desktop/Workshop/IntensiveVibeCodingCapstoneProject/backend/main.py)
The FastAPI server.
- Mounts the `frontend/` folder to serve static files.
- Endpoint `POST /api/generate`: Receives a product name/model or manual text, invokes the `ManualAnalystAgent`, and returns the structured JSON data. If no manual is provided, it simulates a web search retrieval agent to look up details.
- Endpoint `POST /api/chat`: Receives a message and manual context, routes it to the `ExpertChatAgent`, and streams the response including the agent's internal thoughts.
- Endpoint `POST /api/save-key`: Saves the user-supplied Gemini API key to the workspace `.env` file.

---

### Component 2: Frontend Canvas (`frontend/`)

#### [NEW] [index.html](file:///Users/taowang/Desktop/Workshop/IntensiveVibeCodingCapstoneProject/frontend/index.html)
The single-page web structure.
- **Welcome Panel**: Clean search box to input a product name (e.g. "Dyson V15", "Philips Coffee Machine HD7769", "Sony WH-1000XM4") or paste a manual.
- **Main App Canvas**: Split-panel grid visible after generation:
  - **Left Sidebar**: Minimalist navigation tree including "Quick Start", "AI Chat", "Troubleshooting", and dynamic tabs for each product feature.
  - **Right Main Content Area**: Renders views dynamically:
    - *Quick Start View*: Horizontal slide-based card view.
    - *AI Assistant Chat*: Conversational interface showing real-time agent thoughts.
    - *Troubleshooting View*: Interactive Accordion Grid.
    - *Feature Detail View*: 3-column clean grid (Checklist, Warning Card, Support Scheduler).
    - *Interactive Device Simulator*: Beautiful minimalist SVG graphic representing the product that lights up/interacts based on current steps.
  - **Status Monitor (Console)**: A collapsible drawer displaying the agent's real-time raw logs.

#### [NEW] [style.css](file:///Users/taowang/Desktop/Workshop/IntensiveVibeCodingCapstoneProject/frontend/style.css)
The style system for Nordic Minimalist design.
- Implements custom variables for light-mode gray palettes, typography, and card shadows.
- Defines state active styling for selected tabs, checkmarks, progress bars, and warning cards.
- Configures smooth layout shifts and hover states to feel responsive and alive.

#### [NEW] [app.js](file:///Users/taowang/Desktop/Workshop/IntensiveVibeCodingCapstoneProject/frontend/app.js)
Frontend interactions.
- Manages view routing between different tabs.
- Requests the `/api/generate` endpoint, handles loading transitions, and parses the returned JSON manual.
- Connects to the `/api/chat` streaming endpoint. Shows thoughts inside custom collapsed detail blocks.
- Manages the Interactive Device Simulator: renders custom SVG wireframes (e.g. smart vacuum, speaker, coffee maker) and highlights buttons/indicators.
- Exports a standalone single-file HTML version of the interactive manual.

---

### Component 3: Build & Config

#### [NEW] [requirements.txt](file:///Users/taowang/Desktop/Workshop/IntensiveVibeCodingCapstoneProject/requirements.txt)
Includes `google-antigravity`, `fastapi`, `uvicorn`, `pydantic`, `python-dotenv`, and `sse-starlette`.

#### [NEW] [run.sh](file:///Users/taowang/Desktop/Workshop/IntensiveVibeCodingCapstoneProject/run.sh)
Helper script to install dependencies and run the server on `http://localhost:8000`.

#### [NEW] [README.md](file:///Users/taowang/Desktop/Workshop/IntensiveVibeCodingCapstoneProject/README.md)
Setup instructions.

#### [NEW] [kaggle_writeup.md](file:///Users/taowang/Desktop/Workshop/IntensiveVibeCodingCapstoneProject/kaggle_writeup.md)
Pre-written writeup for the Kaggle Capstone Project submission.

---

## Verification Plan

### Automated Tests
- Test Python syntax and model imports using `.venv/bin/python3 -c "import google.antigravity"`.

### Manual Verification
1. Run the application via `./run.sh`.
2. Access `http://localhost:8000` and ensure the Nordic Minimalist portal displays.
3. Input a device (e.g. "Dyson V15 vacuum") and click Generate.
4. Verify:
   - The multi-agent search simulation runs and loads details.
   - The left sidebar correctly populates the quick actions and product features.
   - The interactive SVG device simulator responds when steps are clicked.
   - The Chat assistant responds with real-time agent thoughts.
   - Offline export generates a readable, self-contained HTML file.
