# Kaggle Writeup: VibeManual - The Intelligent Interactive Manual & Product Concierge

*A submission for Kaggle’s 5-Day AI Agents: Intensive Vibe Coding Course Capstone Project.*

---

## 📌 Subtitle
Transforming static, text-heavy product manuals into interactive, Apple-inspired digital canvases using the Google Antigravity SDK and FastAPI.

## 🚀 Track Selection
- **Concierge Agents** (or Freestyle)

## 📖 1. Problem Statement
Every household is filled with hardware products, home appliances, and smart gadgets. Yet, physical manuals are often:
- **Unfriendly to read**: Users have to flip through hundreds of pages of tiny, multi-language text.
- **Difficult to navigate**: Finding a specific operation step or a caution label takes time.
- **Stressful in emergencies**: When a coffee maker or a vacuum cleaner blinks a warning red light, users struggle to diagnose the error code, often resorting to random online searches.

**VibeManual** solves this problem by converting dry, static instruction sheets (or just product names) into highly interactive, responsive, and beautiful digital canvases. It guides users through setup steps, highlights physical controls visually, resolves troubleshooting queries with a stateful chatbot, and outputs offline manual packages.

---

## 🎨 2. Solution Design & User Experience
The application is designed using a **Nordic Minimalist** theme, resembling premium websites from brands like Apple or Dyson. It is split into three main panels:

1. **Sidebar Navigation**:
   - **Metadata Card**: Displays the product name, model, and category icon.
   - **Quick Actions**: Access to the Setup steps, Chat Assistant, and Troubleshooting Accordion.
   - **Dynamic Feature Tabs**: Lists of core product features extracted by the AI Agent.
2. **Interactive Content Canvas (Left Main)**:
   - **Quick Start Timeline**: Vertical timeline steps with hover animations and visual progression. Clicking steps triggers highlights on the simulator.
   - **AI Assistant Chat**: A chatbot connected to the backend agent. It streams both the agent's **Reasoning Thoughts** (inside collapsible code blocks) and the final response.
   - **Troubleshooting diagnostic grid**: Accordion list categorized by warning levels (Info, Warning, Danger).
   - **Feature Operations**: Interactive checklists where users check off steps, accompanied by distinct alert callout cards.
3. **SVG Device Simulator (Right Main)**:
   - Renders a minimalist vector drawing (SVG wireframe) of the device type (e.g., vacuum cleaner, headphones, coffee maker).
   - Dynamically highlights specific components (buttons, battery packs, spouts, or wands) matching the current setup step or feature tab selected.
4. **Offline Manual Exporter**:
   - Generates a standalone, self-contained single `.html` file containing the manual data, CSS styles, and interactive SVG scripts for download, allowing users to view their product guides completely offline.

---

## 🛠️ 3. Technical Implementation
VibeManual is constructed with a modular, lightweight Python backend and a vanilla HTML/CSS/JS frontend:

### Backend Engine (`backend/`)
- **Google Antigravity SDK**: Spawns and configures the core agent pipelines. We implemented two distinct agents:
  1. **ManualAnalystAgent**: Parses raw manual documents (or retrieves details using simulated web search) and returns structured JSON conforming to a strict Pydantic model (`StructuredManual`).
  2. **ExpertChatAgent**: A stateful support agent injected with system instructions based on the manual context to answer user queries in real-time.
- **Structured Output parsing (`response_schema`)**: Applied to ensure the agent outputs clean, deterministic JSON matching our UI components (preventing formatting failures).
- **FastAPI & SSE (Server-Sent Events)**: Serves static files and streams tokens and thought-deltas concurrently via `sse-starlette` for low latency and transparency.
- **Smart Caching**: Saves parsed manuals locally in `data/cache/` to minimize API token usage and prevent rate limiting.

### Frontend Client (`frontend/`)
- **Vanilla CSS & JS**: Employs CSS custom variables, backdrop blur filters (glassmorphism), flexbox/grid alignments, and springy scale transitions.
- **Fetch ReadableStream Decoder**: Reads incoming POST stream chunks line-by-line, splitting and rendering thought events and content messages on the fly.
- **SVG DOM Manipulation**: Modifies class lists and inline styles of vector paths dynamically based on current UI events to simulate physical device interaction.

---

## 💡 4. Key Agent Concepts Applied

| Course Concept | Implementation in VibeManual |
| :--- | :--- |
| **Structured Output (Day 5)** | Handled by binding a strict Pydantic schema to `LocalAgentConfig(response_schema=StructuredManual)`, which forces Gemini to output clean list arrays for setup, feature grids, and warning lists. |
| **Agentic Logs & Streaming (Day 1)** | Streams the raw thought blocks (`response.thoughts`) ahead of the message stream. Displays the "behind-the-scenes" reasoning of the agent in a collapsible console panel. |
| **Stateful Dialogs (Day 2)** | Chat assistant manages conversational history context combined with the structured manual to handle device questions. |
| **Tool Calling & Caching** | The server checks presets and cache directories first, bypassing the LLM call entirely for identical requests to save cost. |

---

## 🌟 5. Reflection & Vibe Coding Experience
By pair-programming with the AI assistant, we went from an empty directory to a fully fledged, production-ready web application in a matter of hours. The combination of Python's simple API frameworks (FastAPI) and the robust agents of the **Google Antigravity SDK** allowed us to shift focus from writing boilerplate endpoint routing to designing rich, user-centric animations and high-fidelity simulator graphics. 

"Vibe Coding" proved that complex agentic flows—like streaming real-time LLM thoughts alongside UI state changes—can be realized swiftly when developer intention is augmented with instant code synthesis.
