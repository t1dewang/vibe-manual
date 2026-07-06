/**
 * VibeManual - Frontend Controller
 */

// Application State
let state = {
    currentManual: null,
    currentView: 'quickstart',
    activeStep: 1,
    hasApiKey: false,
    chatHistory: [] // [{"role": "user"/"model", "content": "..."}]
};

// SVG Templates dictionary based on product category
const simulatorSVG = {
    vacuum: `
        <svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
            <!-- Main Body -->
            <rect id="part-body" x="80" y="50" width="40" height="50" rx="10" fill="none" stroke="#1d1d1f" stroke-width="3" />
            <circle id="part-screen" cx="100" cy="65" r="10" fill="none" stroke="#1d1d1f" stroke-width="2" />
            <path id="part-trigger" d="M 75 75 L 80 78 L 80 82" stroke="#ff3b30" stroke-width="3" stroke-linecap="round" fill="none" />
            
            <!-- Battery Cylinder -->
            <rect id="part-battery" x="90" y="100" width="20" height="30" rx="3" fill="none" stroke="#1d1d1f" stroke-width="3" />
            <circle id="part-charge-port" cx="100" cy="120" r="2" fill="#86868b" />
            
            <!-- Wand -->
            <line id="part-wand" x1="100" y1="130" x2="100" y2="240" stroke="#86868b" stroke-width="6" stroke-linecap="round" />
            <rect id="part-connector" x="96" y="125" width="8" height="10" fill="#ff5a00" rx="1" />
            
            <!-- Cleaner Head -->
            <path id="part-head" d="M 70 240 L 130 240 L 135 260 L 65 260 Z" fill="none" stroke="#1d1d1f" stroke-width="3" stroke-linejoin="round" />
            <line id="part-laser" x1="72" y1="250" x2="60" y2="252" stroke="#34c759" stroke-width="2" stroke-linecap="round" class="hidden" />
            <line id="part-laser-2" x1="72" y1="250" x2="55" y2="258" stroke="#34c759" stroke-width="2" stroke-linecap="round" class="hidden" />
        </svg>
    `,
    headphones: `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <!-- Headband -->
            <path id="part-band" d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#1d1d1f" stroke-width="8" stroke-linecap="round" />
            
            <!-- Left Ear Cup -->
            <g id="part-cup-left">
                <rect x="25" y="80" width="20" height="50" rx="8" fill="none" stroke="#1d1d1f" stroke-width="3" />
                <rect id="part-btn-power" x="32" y="130" width="6" height="4" fill="#0071e3" rx="1" />
            </g>
            
            <!-- Right Ear Cup -->
            <g id="part-cup-right">
                <rect id="part-touchpad" x="155" y="80" width="20" height="50" rx="8" fill="none" stroke="#1d1d1f" stroke-width="3" />
                <path id="part-cover-right" d="M 152 75 L 178 75 L 178 135 L 152 135 Z" fill="none" stroke="none" opacity="0.1" />
            </g>
        </svg>
    `,
    coffee: `
        <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
            <!-- Machine Frame -->
            <rect id="part-frame" x="40" y="30" width="120" height="160" rx="12" fill="none" stroke="#1d1d1f" stroke-width="3" />
            
            <!-- Water Tank (Left) -->
            <rect id="part-tank" x="45" y="50" width="20" height="100" rx="4" fill="none" stroke="#86868b" stroke-width="2" />
            
            <!-- Control Panel -->
            <rect id="part-display" x="70" y="40" width="60" height="25" rx="4" fill="none" stroke="#1d1d1f" stroke-width="2" />
            
            <!-- Coffee Spout -->
            <path id="part-spout" d="M 90 100 L 110 100 L 105 120 L 95 120 Z" fill="none" stroke="#1d1d1f" stroke-width="2" />
            
            <!-- Milk Frother (Right) -->
            <g id="part-frother">
                <line x1="140" y1="90" x2="150" y2="130" stroke="#1d1d1f" stroke-width="4" stroke-linecap="round" />
                <circle cx="150" cy="130" r="5" fill="#86868b" />
            </g>
            
            <!-- Drip Tray / Waste Box -->
            <rect id="part-tray" x="50" y="170" width="100" height="15" rx="3" fill="none" stroke="#1d1d1f" stroke-width="3" />
        </svg>
    `,
    generic: `
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <!-- Smart Gadget Cube -->
            <rect id="part-cube" x="50" y="50" width="100" height="100" rx="16" fill="none" stroke="#1d1d1f" stroke-width="4" />
            <circle id="part-light" cx="100" cy="100" r="20" fill="none" stroke="#86868b" stroke-width="3" />
            <rect id="part-port" x="90" y="140" width="20" height="8" rx="2" fill="none" stroke="#1d1d1f" stroke-width="2" />
        </svg>
    `
};

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
    checkApiKeyStatus();
    setupEventListeners();
    log("VibeManual frontend controller ready.");
});

// Logs messages in the browser console
function log(text, type = "system") {
    console.log(`[${type.toUpperCase()}] ${text}`);
}

function openConsole() {
    // Console drawer removed from UI
}

// Check Backend API Key config
async function checkApiKeyStatus() {
    try {
        const res = await fetch("/api/check-key");
        const data = await res.json();
        updateApiKeyBadge(data.has_key);
    } catch (err) {
        log("Unable to connect to the backend server. Please run run.sh", "system");
        updateApiKeyBadge(false);
    }
}

function updateApiKeyBadge(hasKey) {
    state.hasApiKey = hasKey;
    const badge = document.getElementById("api-status-badge");
    const text = badge.querySelector(".status-text");
    
    badge.className = "status-badge " + (hasKey ? "has-key" : "no-key");
    text.innerText = hasKey ? "API Key Active" : "Demo Mode";
    log(`Environment Check: ${hasKey ? "GEMINI_API_KEY detected. Full functionality unlocked." : "No API key configured. Running in local Demo Mode."}`);
}

// Setup Event Listeners
function setupEventListeners() {
    // Paste Text Area Toggle
    const btnToggleManual = document.getElementById("btn-toggle-manual");
    const groupManualText = document.getElementById("group-manual-text");
    btnToggleManual.addEventListener("click", () => {
        groupManualText.classList.toggle("hidden");
        btnToggleManual.innerText = groupManualText.classList.contains("hidden") ? "Paste Raw Manual Text (Optional)" : "Hide Manual Text Box";
    });

    // PDF File Input change listener
    const pdfInput = document.getElementById("input-pdf");
    const pdfName = document.getElementById("pdf-file-name");
    if (pdfInput && pdfName) {
        pdfInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                pdfName.innerText = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                pdfName.style.color = "var(--accent-blue)";
                log(`Selected PDF manual: ${file.name}`);
            } else {
                pdfName.innerText = "Supports .pdf format";
                pdfName.style.color = "";
            }
        });
    }

    // PDF Drag and Drop Listeners
    const uploadLabel = document.querySelector(".file-upload-label");
    if (uploadLabel && pdfInput) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadLabel.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadLabel.addEventListener(eventName, () => {
                uploadLabel.classList.add('drag-over');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadLabel.addEventListener(eventName, () => {
                uploadLabel.classList.remove('drag-over');
            }, false);
        });

        // Handle dropped files
        uploadLabel.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            
            if (file && file.type === "application/pdf") {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                pdfInput.files = dataTransfer.files;
                // Dispatch event so change listener updates text
                pdfInput.dispatchEvent(new Event("change"));
            } else if (file) {
                alert("Only PDF format manuals are supported currently!");
                log("Unsupported drag-and-drop file format (PDF only).", "system");
            }
        }, false);
    }

    // Preset Clicks
    const presetTags = document.querySelectorAll(".preset-tag");
    presetTags.forEach(tag => {
        tag.addEventListener("click", () => {
            const query = tag.getAttribute("data-preset");
            document.getElementById("input-product").value = query;
            log(`Selected preset: ${query}`);
            // Submit form automatically
            document.getElementById("btn-submit-generate").click();
        });
    });

    // Generator Form Submission
    const formGen = document.getElementById("form-generator");
    formGen.addEventListener("submit", async (e) => {
        e.preventDefault();
        const productInput = document.getElementById("input-product").value.trim();
        const manualInput = document.getElementById("input-manual-text").value.trim();
        const pdfFile = document.getElementById("input-pdf").files[0];
        
        if (!productInput && !manualInput && !pdfFile) {
            alert("Please enter a product name, paste manual text, or import a PDF file!");
            return;
        }
        
        await handleManualGeneration(productInput, manualInput);
    });

    // Sidebar navigation clicks
    const navItems = document.querySelectorAll(".sidebar-nav");
    navItems.forEach(nav => {
        nav.addEventListener("click", (e) => {
            const item = e.target.closest(".nav-item");
            if (!item) return;

            // Deselect old
            document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
            item.classList.add("active");

            const view = item.getAttribute("data-view");
            const index = item.getAttribute("data-index");
            
            switchView(view, index);
        });
    });

    // Chat submit
    const formChat = document.getElementById("form-chat");
    formChat.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = document.getElementById("input-chat-message");
        const msg = input.value.trim();
        if (!msg) return;

        input.value = "";
        await handleChat(msg);
    });

    // Modal settings
    const btnConfigKey = document.getElementById("btn-config-key");
    const modalKey = document.getElementById("modal-key-config");
    const btnCloseModal = document.getElementById("btn-close-modal");
    const btnCancelModal = document.getElementById("btn-cancel-modal");
    const formSaveKey = document.getElementById("form-save-key");

    btnConfigKey.addEventListener("click", () => modalKey.classList.remove("hidden"));
    btnCloseModal.addEventListener("click", () => modalKey.classList.add("hidden"));
    btnCancelModal.addEventListener("click", () => modalKey.classList.add("hidden"));
    
    formSaveKey.addEventListener("submit", async (e) => {
        e.preventDefault();
        const key = document.getElementById("input-key").value.trim();
        
        try {
            const res = await fetch("/api/save-key", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ api_key: key })
            });
            const data = await res.json();
            if (res.ok) {
                log("API Key saved and configured successfully on the server.", "success");
                modalKey.classList.add("hidden");
                checkApiKeyStatus();
            } else {
                alert("Failed to save: " + data.detail);
            }
        } catch (err) {
            alert("Failed to save key. Please check backend server status.");
        }
    });

    // Exporter
    document.getElementById("btn-export-html").addEventListener("click", exportOfflineHTML);

    // Back to landing
    const goBack = () => {
        document.getElementById("view-workspace").classList.add("hidden");
        document.getElementById("view-landing").classList.remove("hidden");
        
        // Clear all input states
        document.getElementById("input-product").value = "";
        document.getElementById("input-manual-text").value = "";
        
        const pdfInput = document.getElementById("input-pdf");
        if (pdfInput) pdfInput.value = "";
        
        const pdfName = document.getElementById("pdf-file-name");
        if (pdfName) {
            pdfName.innerText = "Supports .pdf format";
            pdfName.style.color = "";
        }
        
        log("Returned to home screen and reset input states.");
    };

    document.getElementById("btn-back-landing").addEventListener("click", goBack);
    document.getElementById("header-logo-btn").addEventListener("click", goBack);
}

// View Routing in Canvas
function switchView(view, index = null) {
    state.currentView = view;
    
    // Hide all panels
    document.getElementById("panel-quickstart").classList.add("hidden");
    document.getElementById("panel-chat").classList.add("hidden");
    document.getElementById("panel-faults").classList.add("hidden");
    document.getElementById("panel-feature").classList.add("hidden");

    // Show target
    if (view === "quickstart") {
        document.getElementById("panel-quickstart").classList.remove("hidden");
        log("Viewing module: Quick Start Guide.");
        highlightQuickStartStep(state.activeStep);
    } else if (view === "chat") {
        document.getElementById("panel-chat").classList.remove("hidden");
        log("Viewing module: AI Assistant.");
        // Reset highlights
        clearHighlights();
    } else if (view === "faults") {
        document.getElementById("panel-faults").classList.remove("hidden");
        log("Viewing module: Diagnostics & Troubleshooting.");
        clearHighlights();
    } else if (view === "feature" && index !== null) {
        renderFeatureDetail(index);
        document.getElementById("panel-feature").classList.remove("hidden");
    }
}

// Invoke manual generation backend endpoint
async function handleManualGeneration(productName, manualText) {
    const loadingScreen = document.getElementById("loading-screen");
    const loadTitle = document.getElementById("loading-title");
    const loadStatus = document.getElementById("loading-status");
    
    loadingScreen.classList.remove("hidden");
    openConsole();
    
    // Check for PDF file upload
    const pdfInput = document.getElementById("input-pdf");
    const pdfFile = pdfInput ? pdfInput.files[0] : null;
    
    const displayTitle = productName || (pdfFile ? pdfFile.name : "Uploaded Document");
    log(`[Agent Action] Analyzing product: ${displayTitle}...`, "agent");
    
    loadTitle.innerText = `Analyzing ${displayTitle}`;
    loadStatus.innerText = "Invoking AI Agent team to detect brand and model from document...";
    
    const formData = new FormData();
    if (productName) {
        formData.append("product_name", productName);
    }
    if (manualText) {
        formData.append("manual_text", manualText);
    }
    
    if (pdfFile) {
        formData.append("pdf_file", pdfFile);
        log(`[Upload] PDF file detected: ${pdfFile.name}. Uploading and extracting...`, "system");
        loadStatus.innerText = `Uploading and parsing user manual PDF (${(pdfFile.size/1024/1024).toFixed(2)} MB)...`;
    }
    
    try {
        const res = await fetch("/api/generate", {
            method: "POST",
            body: formData
        });
        
        const data = await res.json();
        loadingScreen.classList.add("hidden");

        if (res.ok) {
            state.currentManual = data.data;
            log(`User manual generated successfully! [Source: ${data.source}]`, "success");
            renderWorkspace(data.data);
            
            // Switch view to landing and then active
            document.getElementById("view-landing").classList.add("hidden");
            document.getElementById("view-workspace").classList.remove("hidden");
            switchView("quickstart");
        } else {
            if (data.error === "api_key_required") {
                log("Generation failed: No API Key configured and no matching preset found.", "system");
                alert("No API Key detected, and this product model is not in presets.\nPlease configure your API Key and try again, or select one of our free presets!");
            } else {
                log(`Generation error: ${data.detail}`, "system");
                alert("Analysis failed: " + data.detail);
            }
        }
    } catch (err) {
        loadingScreen.classList.add("hidden");
        log(`Connection error: ${err.message}`, "system");
        alert("Connection failed. Please ensure the backend is running.");
    }
}

// Render dynamic workspace elements based on parsed JSON manual
function renderWorkspace(manual) {
    // 1. Meta Titles
    document.getElementById("meta-product-name").innerText = manual.product_name;
    document.getElementById("meta-product-model").innerText = manual.model;
    
    // Set Product Icon based on category
    const emojiMap = {
        "vacuum cleaner": "🧹",
        "headphones": "🎧",
        "coffee maker": "☕",
        "smart device": "📱"
    };
    const categoryLower = manual.category.toLowerCase();
    const emoji = emojiMap[categoryLower] || "🔌";
    document.getElementById("product-emoji").innerText = emoji;
    
    // 2. Render dynamic feature buttons on sidebar
    const list = document.getElementById("list-dynamic-features");
    list.innerHTML = "";
    manual.features.forEach((feature, idx) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <button class="nav-item" data-view="feature" data-index="${idx}">
                <span class="nav-icon">▪</span>
                <span>${feature.title}</span>
            </button>
        `;
        list.appendChild(li);
    });
    
    // Re-attach sidebar nav listeners since we updated DOM
    list.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
            item.classList.add("active");
            switchView("feature", item.getAttribute("data-index"));
        });
    });

    // 3. Render Quick Start steps
    const stepsContainer = document.getElementById("container-steps");
    stepsContainer.innerHTML = "";
    manual.quick_start.forEach((step) => {
        const card = document.createElement("div");
        card.className = "step-card" + (step.step_number === 1 ? " active" : "");
        card.setAttribute("data-step", step.step_number);
        
        card.innerHTML = `
            <div class="step-num">${step.step_number}</div>
            <div class="step-details">
                <h4>${step.title}</h4>
                <p>${step.description}</p>
            </div>
        `;
        
        card.addEventListener("click", () => {
            document.querySelectorAll(".step-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            state.activeStep = step.step_number;
            highlightQuickStartStep(step.step_number);
        });
        
        stepsContainer.appendChild(card);
    });
    state.activeStep = 1;

    // 4. Render Troubleshooting accordion items
    const faultsContainer = document.getElementById("container-faults");
    faultsContainer.innerHTML = "";
    manual.faults.forEach((fault, idx) => {
        const item = document.createElement("div");
        item.className = "accordion-item";
        
        item.innerHTML = `
            <button class="accordion-trigger">
                <span>${fault.symptom}</span>
                <span class="warning-badge ${fault.warning_level}">${fault.warning_level}</span>
            </button>
            <div class="accordion-content">
                <p style="margin-bottom: 8px;"><strong>Cause: </strong>${fault.cause}</p>
                <p><strong>Solution: </strong>${fault.solution.replace(/\n/g, '<br>')}</p>
            </div>
        `;
        
        const trigger = item.querySelector(".accordion-trigger");
        trigger.addEventListener("click", () => {
            item.classList.toggle("active");
        });
        
        faultsContainer.appendChild(item);
    });

    // Clear chat history
    state.chatHistory = [];
    const chatMsgBox = document.getElementById("chat-messages");
    chatMsgBox.innerHTML = `
        <div class="chat-bubble model-bubble">
            Hello! I am your <strong>${manual.product_name}</strong> support concierge. I have reviewed the manual for this product. How can I help you today?
        </div>
    `;

    log(`Interactive canvas for "${manual.product_name}" rendered successfully!`);
}

// Render dynamic feature detail view
function renderFeatureDetail(index) {
    const feature = state.currentManual.features[index];
    log(`Viewing feature module: ${feature.title}`);
    
    document.getElementById("feature-title").innerText = feature.title;
    document.getElementById("feature-description").innerText = feature.description;
    
    // Render operation checklist
    const stepsList = document.getElementById("feature-steps");
    stepsList.innerHTML = "";
    feature.operation_steps.forEach((step, idx) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" id="chk-feat-${idx}">
            <label for="chk-feat-${idx}"><span>${step}</span></label>
        `;
        stepsList.appendChild(li);
    });
    
    // Render precautions warnings
    const precList = document.getElementById("feature-precautions");
    precList.innerHTML = "";
    feature.precautions.forEach(prec => {
        const div = document.createElement("div");
        div.className = "precaution-item";
        div.innerText = prec;
        precList.appendChild(div);
    });

    // Technical Support text
    document.getElementById("feature-support-text").innerText = feature.support_info;

    // Highlight simulator parts for features
    highlightFeatureParts(feature.title.toLowerCase());
}

// Highlight Simulator elements based on quickstart step number
function highlightQuickStartStep(stepNum) {
    clearHighlights();
    const indicator = document.getElementById("simulator-state");
    if (indicator) {
        indicator.className = "state-indicator active";
        indicator.innerText = `Executing Step ${stepNum}...`;
    }
    
    const svg = document.querySelector("#device-svg-container svg");
    if (!svg) return;
    
    if (state.currentManual.category.toLowerCase().includes("vacuum")) {
        // Vacuum Highlights
        if (stepNum === 1) {
            highlightElement("part-wand", "#ff5a00");
            highlightElement("part-connector", "#ff5a00");
            highlightElement("part-head", "#ff5a00");
        } else if (stepNum === 2) {
            highlightElement("part-battery", "#0071e3");
            highlightElement("part-charge-port", "#0071e3");
        } else if (stepNum === 3) {
            highlightElement("part-body", "#34c759");
            highlightElement("part-screen", "#34c759");
            highlightElement("part-trigger", "#ff3b30");
        } else if (stepNum === 4) {
            highlightElement("part-body", "#ff3b30");
        }
    } else if (state.currentManual.category.toLowerCase().includes("headphone")) {
        // Headphone Highlights
        if (stepNum === 1) {
            highlightElement("part-cup-left", "#0071e3");
            highlightElement("part-btn-power", "#ff3b30");
        } else if (stepNum === 2) {
            highlightElement("part-touchpad", "#34c759");
        } else if (stepNum === 3) {
            highlightElement("part-cover-right", "#ff5a00", "fill");
        } else if (stepNum === 4) {
            highlightElement("part-band", "#0071e3");
        }
    } else if (state.currentManual.category.toLowerCase().includes("coffee")) {
        // Coffee Maker Highlights
        if (stepNum === 1) {
            highlightElement("part-tank", "#0071e3");
            highlightElement("part-frame", "#0071e3");
        } else if (stepNum === 2) {
            highlightElement("part-display", "#34c759");
        } else if (stepNum === 3) {
            highlightElement("part-spout", "#ff5a00");
        } else if (stepNum === 4) {
            highlightElement("part-tray", "#ff3b30");
        }
    }
}

// Highlight parts based on feature title keywords
function highlightFeatureParts(featureName) {
    clearHighlights();
    const indicator = document.getElementById("simulator-state");
    if (indicator) {
        indicator.className = "state-indicator online";
        indicator.innerText = "Feature Demo Active";
    }

    if (state.currentManual.category.toLowerCase().includes("vacuum")) {
        if (featureName.includes("laser")) {
            highlightElement("part-head", "#34c759");
            const laser1 = document.getElementById("part-laser");
            const laser2 = document.getElementById("part-laser-2");
            if (laser1) laser1.classList.remove("hidden");
            if (laser2) laser2.classList.remove("hidden");
        } else if (featureName.includes("lcd") || featureName.includes("screen") || featureName.includes("display")) {
            highlightElement("part-screen", "#0071e3");
        } else if (featureName.includes("motorbar") || featureName.includes("head") || featureName.includes("motor")) {
            highlightElement("part-head", "#ff5a00");
        }
    } else if (state.currentManual.category.toLowerCase().includes("headphone")) {
        if (featureName.includes("noise") || featureName.includes("canceling") || featureName.includes("anc")) {
            highlightElement("part-cup-left", "#34c759");
            highlightElement("part-touchpad", "#34c759");
        } else if (featureName.includes("chat") || featureName.includes("speak")) {
            highlightElement("part-touchpad", "#ff5a00");
        } else if (featureName.includes("multipoint") || featureName.includes("connection")) {
            highlightElement("part-band", "#0071e3");
        }
    } else if (state.currentManual.category.toLowerCase().includes("coffee")) {
        if (featureName.includes("frother") || featureName.includes("milk") || featureName.includes("steam")) {
            highlightElement("part-frother", "#ff5a00");
        } else if (featureName.includes("grinder") || featureName.includes("grind")) {
            highlightElement("part-frame", "#0071e3");
        } else if (featureName.includes("brew") || featureName.includes("coffee") || featureName.includes("espresso")) {
            highlightElement("part-spout", "#ff5a00");
        }
    }
}

// Reset highlights
function clearHighlights() {
    const indicator = document.getElementById("simulator-state");
    if (indicator) {
        indicator.className = "state-indicator online";
        indicator.innerText = "Ready";
    }

    // Reset laser lines
    const laser1 = document.getElementById("part-laser");
    const laser2 = document.getElementById("part-laser-2");
    if (laser1) laser1.classList.add("hidden");
    if (laser2) laser2.classList.add("hidden");

    const svg = document.querySelector("#device-svg-container svg");
    if (!svg) return;
    
    // Select all paths, lines, rects, circles, g and reset stroke/fill
    const elements = svg.querySelectorAll("path, line, rect, circle, g");
    elements.forEach(el => {
        if (el.id) {
            el.style.stroke = "";
            el.style.fill = "";
            el.style.opacity = "";
        }
    });
}

function highlightElement(id, color, type = "stroke") {
    const el = document.getElementById(id);
    if (!el) return;
    
    if (type === "stroke") {
        el.style.stroke = color;
    } else {
        el.style.fill = color;
        el.style.opacity = "0.3";
    }
}

// Chat stream SSE handler
async function handleChat(messageText) {
    const chatMsgBox = document.getElementById("chat-messages");
    
    // 1. Append User Bubble
    const userBubble = document.createElement("div");
    userBubble.className = "chat-bubble user-bubble";
    userBubble.innerText = messageText;
    chatMsgBox.appendChild(userBubble);
    chatMsgBox.scrollTop = chatMsgBox.scrollHeight;
    
    // 2. Append Empty Model Bubble with Thinking block inside
    const modelBubble = document.createElement("div");
    modelBubble.className = "chat-bubble model-bubble";
    chatMsgBox.appendChild(modelBubble);
    
    const thoughtDetails = document.createElement("details");
    thoughtDetails.className = "thought-block";
    thoughtDetails.open = true;
    thoughtDetails.innerHTML = `<summary>AI Agent thinking...</summary><div class="thought-content"></div>`;
    modelBubble.appendChild(thoughtDetails);
    
    const thoughtContent = thoughtDetails.querySelector(".thought-content");
    const textContent = document.createElement("div");
    textContent.className = "text-content";
    modelBubble.appendChild(textContent);
    
    chatMsgBox.scrollTop = chatMsgBox.scrollHeight;
    
    log(`[Chat Prompt] Sending query: "${messageText}"`, "system");
    openConsole();
    
    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                product_name: state.currentManual.product_name,
                manual_context: state.currentManual,
                message: messageText,
                history: state.chatHistory
            })
        });

        if (!res.ok) {
            throw new Error("Failed to connect to the chat endpoint.");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let fullThought = "";
        let fullMessage = "";

        let currentEvent = "";
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop();

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (!line.trim()) continue;
                
                if (line.startsWith("event: ")) {
                    currentEvent = line.replace("event: ", "").trim();
                } else if (line.startsWith("data: ")) {
                    const dataStr = line.slice(6);
                    
                    if (currentEvent === "thought") {
                        fullThought += dataStr;
                        thoughtContent.innerText = fullThought;
                        log(`[Thinking] ${dataStr}`, "thought");
                    } else if (currentEvent === "message") {
                        // Close thinking box once content starts streaming
                        if (thoughtDetails.open) {
                            thoughtDetails.open = false;
                            thoughtDetails.querySelector("summary").innerText = "View AI Agent Thinking Process";
                        }
                        fullMessage += dataStr;
                        textContent.innerHTML = fullMessage.replace(/\n/g, "<br>");
                    } else if (currentEvent === "done") {
                        log("Chat stream transmission complete.", "success");
                    } else if (currentEvent === "error") {
                        log(`Chat API error: ${dataStr}`, "system");
                        textContent.innerText = `Error: ${dataStr}`;
                    }
                }
            }
            chatMsgBox.scrollTop = chatMsgBox.scrollHeight;
        }

        // Add to history
        state.chatHistory.push({ role: "user", content: messageText });
        state.chatHistory.push({ role: "model", content: fullMessage });

    } catch (err) {
        log(`Chat failed: ${err.message}`, "system");
        thoughtDetails.classList.add("hidden");
        textContent.innerText = "AI assistant connection failed. Please check backend logs.";
    }
}

// Exports the current manual state as a completely self-contained offline HTML
function exportOfflineHTML() {
    if (!state.currentManual) {
        alert("No user manual loaded. Cannot export!");
        return;
    }
    
    log("Compiling standalone offline user manual...", "system");
    
    const manualJSON = JSON.stringify(state.currentManual, null, 2);
    const category = state.currentManual.category.toLowerCase();
    
    // Select correct SVG based on category
    let svgTemplate = simulatorSVG.generic;
    if (category.includes("vacuum")) {
        svgTemplate = simulatorSVG.vacuum;
    } else if (category.includes("headphone")) {
        svgTemplate = simulatorSVG.headphones;
    } else if (category.includes("coffee")) {
        svgTemplate = simulatorSVG.coffee;
    }

    // Get current style.css styles to inline
    fetch("/static/style.css")
        .then(res => res.text())
        .then(cssContent => {
            const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${state.currentManual.product_name} - Offline Interactive Manual</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        ${cssContent}
        /* Custom adjustment for offline mode */
        .main-header { position: static; }
        .workspace-sidebar { height: calc(100vh - 64px); }
        .process-console { display: none !important; }
        .header-actions { display: none !important; }
    </style>
</head>
<body>
    <header class="main-header">
        <div class="header-logo">
            <span class="logo-dot"></span>
            <h1>VibeManual</h1>
            <span class="badge">Offline Version</span>
        </div>
    </header>

    <main id="view-workspace" class="container-workspace">
        <aside class="workspace-sidebar">
            <div id="product-card" class="product-info-card">
                <div class="product-icon-wrapper">
                    <span id="product-emoji">🔌</span>
                </div>
                <div class="product-titles">
                    <h2>${state.currentManual.product_name}</h2>
                    <span>${state.currentManual.model}</span>
                </div>
            </div>

            <nav class="sidebar-nav">
                <div class="nav-section-title">Quick Actions</div>
                <ul>
                    <li>
                        <button class="nav-item active" data-view="quickstart">
                            <span class="nav-icon">⚡</span>
                            <span>Quick Start Guide</span>
                        </button>
                    </li>
                    <li>
                        <button class="nav-item" data-view="chat">
                            <span class="nav-icon">💬</span>
                            <span>AI Assistant Chat</span>
                        </button>
                    </li>
                    <li>
                        <button class="nav-item" data-view="faults">
                            <span class="nav-icon">⚠️</span>
                            <span>Troubleshooting</span>
                        </button>
                    </li>
                </ul>

                <div class="nav-section-title">Core Features</div>
                <ul id="list-dynamic-features"></ul>
            </nav>
        </aside>

        <section class="workspace-canvas">
            <div class="canvas-grid">
                <div class="canvas-card content-card">
                    <!-- Quick Start -->
                    <div id="panel-quickstart" class="workspace-panel">
                        <div class="panel-header">
                            <div class="panel-badge">Quick Start</div>
                            <h2>Quick Start Guide</h2>
                        </div>
                        <div class="steps-container" id="container-steps"></div>
                    </div>

                    <!-- AI Chat (Mock in Offline) -->
                    <div id="panel-chat" class="workspace-panel hidden">
                        <div class="panel-header">
                            <div class="panel-badge">AI Assistant</div>
                            <h2>Product Support Chatbot</h2>
                            <p>Offline mode uses local preset responses.</p>
                        </div>
                        <div class="chat-wrapper">
                            <div id="chat-messages" class="chat-messages">
                                <div class="chat-bubble model-bubble">Hello! The application is currently offline. How can I help you?</div>
                            </div>
                            <form id="form-chat" class="chat-input-area">
                                <input type="text" id="input-chat-message" placeholder="Type your question..." required>
                                <button type="submit" class="btn btn-primary">Send</button>
                            </form>
                        </div>
                    </div>

                    <!-- Troubleshooting -->
                    <div id="panel-faults" class="workspace-panel hidden">
                        <div class="panel-header">
                            <div class="panel-badge">Troubleshooting</div>
                            <h2>Diagnostics & Troubleshooting</h2>
                        </div>
                        <div class="accordion-container" id="container-faults"></div>
                    </div>

                    <!-- Feature -->
                    <div id="panel-feature" class="workspace-panel hidden">
                        <div class="panel-header">
                            <div class="panel-badge" id="feature-badge">Feature</div>
                            <h2 id="feature-title">Loading Feature...</h2>
                            <p id="feature-description"></p>
                        </div>
                        <div class="feature-detail-grid">
                            <div class="detail-card">
                                <h3>⚙️ Operating Steps</h3>
                                <ul id="feature-steps" class="interactive-checklist"></ul>
                            </div>
                            <div class="detail-card alert-card">
                                <h3>🔒 Precautions & Warnings</h3>
                                <div id="feature-precautions" class="precautions-list"></div>
                            </div>
                            <div class="detail-card support-card">
                                <h3>📞 Customer Support</h3>
                                <p id="feature-support-text"></p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    </main>

    <script>
        const manual = ${manualJSON};
        let currentView = 'quickstart';
        let activeStep = 1;

        // Render Page
        document.addEventListener("DOMContentLoaded", () => {
            renderPage();
            setupNav();
        });

        function renderPage() {
            // Emoji
            const emojiMap = {"vacuum cleaner":"🧹", "headphones":"🎧", "coffee maker":"☕"};
            document.getElementById("product-emoji").innerText = emojiMap[manual.category.toLowerCase()] || "🔌";
            
            // Features Nav
            const list = document.getElementById("list-dynamic-features");
            manual.features.forEach((f, idx) => {
                const li = document.createElement("li");
                li.innerHTML = '<button class="nav-item" data-view="feature" data-index="'+idx+'"><span class="nav-icon">▪</span><span>'+f.title+'</span></button>';
                list.appendChild(li);
            });

            // Steps
            const steps = document.getElementById("container-steps");
            manual.quick_start.forEach(step => {
                const card = document.createElement("div");
                card.className = "step-card" + (step.step_number === 1 ? " active" : "");
                card.innerHTML = '<div class="step-num">'+step.step_number+'</div><div class="step-details"><h4>'+step.title+'</h4><p>'+step.description+'</p></div>';
                card.addEventListener("click", () => {
                    document.querySelectorAll(".step-card").forEach(c => c.classList.remove("active"));
                    card.classList.add("active");
                    highlightStep(step.step_number);
                });
                steps.appendChild(card);
            });
            highlightStep(1);

            // Faults
            const faults = document.getElementById("container-faults");
            manual.faults.forEach(f => {
                const item = document.createElement("div");
                item.className = "accordion-item";
                item.innerHTML = '<button class="accordion-trigger"><span>'+f.symptom+'</span><span class="warning-badge '+f.warning_level+'">'+f.warning_level+'</span></button><div class="accordion-content"><p><strong>Cause: </strong>'+f.cause+'</p><p><strong>Solution: </strong>'+f.solution+'</p></div>';
                item.querySelector(".accordion-trigger").addEventListener("click", () => item.classList.toggle("active"));
                faults.appendChild(item);
            });
        }

        function setupNav() {
            document.querySelectorAll(".nav-item").forEach(item => {
                item.addEventListener("click", () => {
                    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
                    item.classList.add("active");
                    const view = item.getAttribute("data-view");
                    const index = item.getAttribute("data-index");
                    
                    document.getElementById("panel-quickstart").classList.add("hidden");
                    document.getElementById("panel-chat").classList.add("hidden");
                    document.getElementById("panel-faults").classList.add("hidden");
                    document.getElementById("panel-feature").classList.add("hidden");

                    if (view === 'quickstart') {
                        document.getElementById("panel-quickstart").classList.remove("hidden");
                        highlightStep(1);
                    } else if (view === 'chat') {
                        document.getElementById("panel-chat").classList.remove("hidden");
                        clearHighlights();
                    } else if (view === 'faults') {
                        document.getElementById("panel-faults").classList.remove("hidden");
                        clearHighlights();
                    } else if (view === 'feature') {
                        renderFeature(index);
                        document.getElementById("panel-feature").classList.remove("hidden");
                    }
                });
            });
            
            // Mock Chat
            document.getElementById("form-chat").addEventListener("submit", (e) => {
                e.preventDefault();
                const inp = document.getElementById("input-chat-message");
                const txt = inp.value;
                inp.value = "";
                
                const box = document.getElementById("chat-messages");
                const u = document.createElement("div");
                u.className = "chat-bubble user-bubble";
                u.innerText = txt;
                box.appendChild(u);
                
                const m = document.createElement("div");
                m.className = "chat-bubble model-bubble";
                m.innerText = "Hello! The offline version cannot connect to the live AI backend. For help operating this product, please explore the Quick Start or Core Features sections.";
                box.appendChild(m);
                box.scrollTop = box.scrollHeight;
            });
        }

        function renderFeature(idx) {
            const f = manual.features[idx];
            document.getElementById("feature-title").innerText = f.title;
            document.getElementById("feature-description").innerText = f.description;
            
            const steps = document.getElementById("feature-steps");
            steps.innerHTML = "";
            f.operation_steps.forEach((step, i) => {
                const li = document.createElement("li");
                li.innerHTML = '<input type="checkbox" id="chk-'+i+'"><label for="chk-'+i+'"><span>'+step+'</span></label>';
                steps.appendChild(li);
            });

            const precs = document.getElementById("feature-precautions");
            precs.innerHTML = "";
            f.precautions.forEach(p => {
                const div = document.createElement("div");
                div.className = "precaution-item";
                div.innerText = p;
                precs.appendChild(div);
            });

            document.getElementById("feature-support-text").innerText = f.support_info;
            highlightFeature(f.title.toLowerCase());
        }

        // SVG highlight functions matching app.js
        function highlightStep(num) {
            clearHighlights();
            const ind = document.getElementById("simulator-state");
            if (ind) {
                ind.innerText = "Executing Step " + num + "...";
                ind.className = "state-indicator active";
            }

            if (manual.category.toLowerCase().includes("vacuum")) {
                if (num === 1) { highlight("part-wand", "#ff5a00"); highlight("part-connector", "#ff5a00"); highlight("part-head", "#ff5a00"); }
                else if (num === 2) { highlight("part-battery", "#0071e3"); highlight("part-charge-port", "#0071e3"); }
                else if (num === 3) { highlight("part-body", "#34c759"); highlight("part-screen", "#34c759"); highlight("part-trigger", "#ff3b30"); }
                else if (num === 4) { highlight("part-body", "#ff3b30"); }
            } else if (manual.category.toLowerCase().includes("headphone")) {
                if (num === 1) { highlight("part-cup-left", "#0071e3"); highlight("part-btn-power", "#ff3b30"); }
                else if (num === 2) { highlight("part-touchpad", "#34c759"); }
                else if (num === 3) { highlight("part-cover-right", "#ff5a00", "fill"); }
                else if (num === 4) { highlight("part-band", "#0071e3"); }
            } else if (manual.category.toLowerCase().includes("coffee")) {
                if (num === 1) { highlight("part-tank", "#0071e3"); highlight("part-frame", "#0071e3"); }
                else if (num === 2) { highlight("part-display", "#34c759"); }
                else if (num === 3) { highlight("part-spout", "#ff5a00"); }
                else if (num === 4) { highlight("part-tray", "#ff3b30"); }
            }
        }

        function highlightFeature(name) {
            clearHighlights();
            if (manual.category.toLowerCase().includes("vacuum")) {
                if (name.includes("laser")) {
                    highlight("part-head", "#34c759");
                    if(document.getElementById("part-laser")) document.getElementById("part-laser").classList.remove("hidden");
                    if(document.getElementById("part-laser-2")) document.getElementById("part-laser-2").classList.remove("hidden");
                }
                else if (name.includes("lcd") || name.includes("screen") || name.includes("display")) highlight("part-screen", "#0071e3");
                else if (name.includes("motorbar") || name.includes("head") || name.includes("motor")) highlight("part-head", "#ff5a00");
            } else if (manual.category.toLowerCase().includes("headphone")) {
                if (name.includes("noise") || name.includes("canceling") || name.includes("anc")) { highlight("part-cup-left", "#34c759"); highlight("part-touchpad", "#34c759"); }
                else if (name.includes("chat") || name.includes("speak")) highlight("part-touchpad", "#ff5a00");
                else if (name.includes("multipoint") || name.includes("connection")) highlight("part-band", "#0071e3");
            } else if (manual.category.toLowerCase().includes("coffee")) {
                if (name.includes("frother") || name.includes("milk") || name.includes("steam")) highlight("part-frother", "#ff5a00");
                else if (name.includes("grinder") || name.includes("grind")) highlight("part-frame", "#0071e3");
                else if (name.includes("brew") || name.includes("coffee") || name.includes("espresso")) highlight("part-spout", "#ff5a00");
            }
        }

        function clearHighlights() {
            const ind = document.getElementById("simulator-state");
            if (ind) {
                ind.innerText = "Ready";
                ind.className = "state-indicator online";
            }
            
            if(document.getElementById("part-laser")) document.getElementById("part-laser").classList.add("hidden");
            if(document.getElementById("part-laser-2")) document.getElementById("part-laser-2").classList.add("hidden");

            const svg = document.querySelector("#device-svg-container svg");
            if (!svg) return;
            svg.querySelectorAll("path, line, rect, circle, g").forEach(el => {
                if (el.id) { el.style.stroke = ""; el.style.fill = ""; el.style.opacity = ""; }
            });
        }

        function highlight(id, color, type = "stroke") {
            const el = document.getElementById(id);
            if (!el) return;
            if (type === "stroke") el.style.stroke = color;
            else { el.style.fill = color; el.style.opacity = "0.3"; }
        }
    </script>
</body>
</html>`;

            // Download file trigger
            const blob = new Blob([htmlTemplate], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${state.currentManual.product_name.replace(/\s+/g, '_')}_Interactive_Manual.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            log("Offline interactive manual compiled successfully! File download started.", "success");
        })
        .catch(err => {
            log(`Failed to bundle CSS styles: ${err.message}`, "system");
            alert("Export failed. Unable to load CSS styles.");
        });
}
