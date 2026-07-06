# VibeManual - Interactive User Manuals & Product Support Concierge

**VibeManual** is a modern, interactive web application designed to replace boring, text-heavy hardware manuals with a single-page canvas workspace. Users can search for a product model, paste text, or drag-and-drop a product manual PDF. The backend AI agent automatically structures the manual and spins up a beautiful, interactive guide.

This project was built for the **Kaggle AI Agents: Intensive Vibe Coding Capstone Project**  for programmatic agent leasing, multi-agent orchestration, and structured manual generation.

---

## ⚡ Core Features
1. **Zero-Input PDF Upload**: Drag and drop your product manual PDF directly onto the landing page. The AI agent automatically extracts the text, identifies the brand and model, parses the features, and builds the canvas workspace.
2. **Text Manual Fallback**: Paste raw paragraphs from manual files to instantly generate a custom guide.
3. **Interactive Step Checklist**: Follow a step-by-step guide with progress trackers.
4. **Stateful AI Product Concierge**: Ask questions about operating, cleaning, or maintaining the device. The streaming chatbot displays the agent's real-time thinking process.
5. **One-Click Offline Export**: Click **"Export Offline Manual"** in the sidebar. This compiles the manual content, CSS variables, and layout styles into a single standalone `.html` file that operates 100% offline.

---

## 🌐 Cloud Deployment & Live Demo

VibeManual is **already deployed to the cloud** via GitHub integration and is running live. 

To provide a frictionless evaluation experience for Kaggle judges and public visitors:
1. **Pre-configured Free Google Gemini API Key**: The backend service has been pre-configured with a free Google Gemini API key. You do not need to enter or obtain your own API key to test the app.
2. **Instant Live Testing**: You can immediately type custom product names, paste manual text, or drop in any product manual PDF. The AI agents will perform real-time extraction and structured compilation immediately.
3. **CI/CD Sync Workflow**: The application's live deployment is linked directly to our GitHub repository. Any pushes to the repository trigger automated builds and rolling updates on the cloud platform.

### Live Demo Links
- **GitHub Repository**: `https://github.com/t1dewang/vibe-manual`
- **Live Application URL**: `https://vibe-manual.onrender.com`

---

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.10+ (macOS, Windows, or Linux)
- A modern web browser

### Easy Launch (macOS/Linux)

1. Clone or download this project folder.

2. Run the quick start shell script in your terminal:

   ```bash
   ./run.sh
   ```

   *This script automatically configures the Python virtual environment (`.venv`), upgrades pip, installs required packages, and launches the server.*

3. Open your browser and navigate to:

   ```text
   http://localhost:8000
   ```

### Manual Launch (Windows)

1. Open PowerShell or Command Prompt in the project folder.

2. Set up and activate a Python virtual environment:

   ```powershell
   python -m venv .venv
   .venv\Scripts\activate
   ```

3. Install dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

4. Launch the FastAPI server:

   ```powershell
   uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
   ```

5. Open your browser and go to `http://localhost:8000`.

---

## 📂 Project Structure
```
├── backend/
│   ├── __init__.py
│   ├── agents.py        # Antigravity SDK Agents, Pydantic response schemas
│   └── main.py          # FastAPI server routes, caching, and stream generators
├── frontend/
│   ├── index.html       # Single-page web app template
│   ├── style.css        # Nordic Minimalist design variables & layouts
│   └── app.js           # SSE receiver, page renderer, offline exporter
├── data/
│   ├── presets/         # Pre-baked manuals for Demo Mode
│   └── cache/           # Automated cache directory for generated manuals
├── requirements.txt     # Python package requirements
├── run.sh               # Quick-launch bash script
└── README.md            # Documentation
```
