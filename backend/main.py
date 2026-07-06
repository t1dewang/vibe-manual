import os
import json
import hashlib
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request, Form, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from sse_starlette.sse import EventSourceResponse

# Load environment variables from .env file
load_dotenv()

from backend.agents import generate_structured_manual, StructuredManual
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig

app = FastAPI(title="VibeManual API", description="Interactive User Manual & Product Concierge Server")

# Allow CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request / Response Schemas
class GenerateRequest(BaseModel):
    product_name: str
    manual_text: Optional[str] = None

class SaveKeyRequest(BaseModel):
    api_key: str

class ChatRequest(BaseModel):
    product_name: str
    manual_context: dict
    message: str
    history: List[dict] = []  # List of past messages: [{"role": "user"/"model", "content": "..."}]


# Paths
PRESETS_DIR = "data/presets"
CACHE_DIR = "data/cache"

# Helper: Get cache key based on query
def get_cache_filename(query: str) -> str:
    hash_object = hashlib.md5(query.strip().lower().encode())
    return os.path.join(CACHE_DIR, f"{hash_object.hexdigest()}.json")


@app.get("/api/check-key")
async def check_key():
    """Checks if the GEMINI_API_KEY environment variable is configured."""
    has_key = bool(os.getenv("GEMINI_API_KEY"))
    return {"has_key": has_key}


@app.post("/api/save-key")
async def save_key(req: SaveKeyRequest):
    """Saves the user-supplied Gemini API key to the workspace .env file."""
    api_key = req.api_key.strip()
    if not api_key:
        raise HTTPException(status_code=400, detail="API key cannot be empty")
    
    # Save to .env file in workspace
    env_content = f"GEMINI_API_KEY={api_key}\n"
    with open(".env", "w") as f:
        f.write(env_content)
    
    # Set in current runtime environment immediately
    os.environ["GEMINI_API_KEY"] = api_key
    return {"status": "success", "message": "API key saved and activated successfully"}


@app.post("/api/generate")
async def generate_manual(
    product_name: Optional[str] = Form(None),
    manual_text: Optional[str] = Form(None),
    pdf_file: Optional[UploadFile] = File(None)
):
    """Generates a structured manual from a query, text, or PDF file."""
    p_name = product_name.strip() if product_name else ""
    
    # If a PDF file is uploaded, extract text and set it as manual_text
    if pdf_file:
        try:
            from pypdf import PdfReader
            import io
            pdf_bytes = await pdf_file.read()
            pdf_reader = PdfReader(io.BytesIO(pdf_bytes))
            extracted_text = []
            for page in pdf_reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text.append(text)
            pdf_text = "\n".join(extracted_text)
            if pdf_text and not manual_text:
                manual_text = pdf_text
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF file: {str(e)}")

    if not p_name and not manual_text:
        raise HTTPException(status_code=400, detail="Product name, manual text, or PDF file is required")

    # Fallback placeholder name for prompt generation (Gemini will overwrite this with the real name from contents)
    if not p_name:
        p_name = "Autodetected Product"

    # 1. Only check cache & presets if the user did NOT supply custom manual text or a PDF
    if not manual_text and not pdf_file:
        cache_file = get_cache_filename(p_name)
        if os.path.exists(cache_file):
            try:
                with open(cache_file, "r") as f:
                    data = json.load(f)
                    return JSONResponse(content={"source": "cache", "data": data})
            except Exception:
                pass # fallback to generating

        # Check presets
        preset_matched = None
        if os.path.exists(PRESETS_DIR):
            for filename in os.listdir(PRESETS_DIR):
                if filename.endswith(".json"):
                    preset_path = os.path.join(PRESETS_DIR, filename)
                    try:
                        with open(preset_path, "r") as f:
                            preset_data = json.load(f)
                            p_name_preset = preset_data.get("product_name", "").lower()
                            p_model_preset = preset_data.get("model", "").lower()
                            if p_name.lower() in p_name_preset or p_name.lower() in p_model_preset:
                                preset_matched = preset_data
                                break
                    except Exception:
                        continue

        if preset_matched:
            return JSONResponse(content={"source": "preset", "data": preset_matched})

    # 2. Check if API Key is configured. If not, return error and list presets
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        presets = []
        if os.path.exists(PRESETS_DIR):
            for filename in os.listdir(PRESETS_DIR):
                if filename.endswith(".json") and not filename.startswith("."):
                    preset_path = os.path.join(PRESETS_DIR, filename)
                    try:
                        with open(preset_path, "r") as f:
                            p_data = json.load(f)
                            presets.append({
                                "name": p_data.get("product_name"),
                                "model": p_data.get("model"),
                                "category": p_data.get("category")
                            })
                    except Exception:
                        continue
        return JSONResponse(
            status_code=400,
            content={
                "error": "api_key_required",
                "message": "GEMINI_API_KEY is not configured and no matching preset was found.",
                "presets": presets
            }
        )

    # 3. Generate using Antigravity Agent
    try:
        manual = await generate_structured_manual(p_name, manual_text, api_key=api_key)
        manual_dict = manual.model_dump()
        
        # Save to cache using the actual detected product name
        final_product_name = manual_dict.get("product_name", p_name)
        cache_file = get_cache_filename(final_product_name)
        
        os.makedirs(CACHE_DIR, exist_ok=True)
        with open(cache_file, "w") as f:
            json.dump(manual_dict, f, indent=2)
            
        return JSONResponse(content={"source": "agent", "data": manual_dict})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent generation failed: {str(e)}")


@app.post("/api/chat")
async def chat(req: ChatRequest):
    """Stateful chat endpoint. Streams responses and thoughts via SSE.
    
    If no API key is set, returns a simulated mock response stream.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    
    async def event_generator():
        # Demo mode: no key configured, return canned/mock response
        if not api_key:
            yield {
                "event": "thought",
                "data": "[Demo Mode System Thought] API key is missing. Serving simulated product expert response..."
            }
            yield {"event": "thought", "data": "\nSearching mock manual database..."}
            import asyncio
            await asyncio.sleep(0.8)
            
            # Simple canned response based on message keywords
            msg = req.message.lower()
            product = req.product_name
            response_text = ""
            if "red" in msg or "light" in msg:
                response_text = f"Regarding the red flashing light on your {product}, this typically indicates a critical alert (e.g., dust container is full, filter needs cleaning, or it needs charging/water). Please click the 'Diagnostics & Troubleshooting' tab on the left for details."
            elif "start" in msg or "quick" in msg:
                response_text = f"To get started quickly with your {product}, please follow the 'Quick Start Guide' steps on the left side of the canvas."
            else:
                response_text = f"Hello! I am the intelligent support concierge for the {product}. Currently, GEMINI_API_KEY is not configured. Once you configure it in the dashboard, I will be able to answer any custom questions in real-time. For now, please check the 'Quick Start', 'Core Features', or 'Diagnostics' tabs."
            
            for token in response_text:
                yield {"event": "message", "data": token}
                await asyncio.sleep(0.01)
            yield {"event": "done", "data": ""}
            return

        # Live Mode: Query Antigravity Agent
        try:
            # Build context from manual data
            manual_str = json.dumps(req.manual_context, indent=2, ensure_ascii=False)
            
            # Setup Antigravity config
            system_instructions = (
                f"You are the product support concierge for the product '{req.product_name}'. "
                f"You have read the following product manual:\n\n{manual_str}\n\n"
                f"Answer the user's questions clearly and helpfully, citing sections of the manual if appropriate. "
                f"Keep answers direct, matching the Nordic Minimalist style (clean, clear, professional). "
                f"Always answer in English."
            )
            
            config = LocalAgentConfig(
                api_key=api_key,
                system_instructions=system_instructions,
                capabilities=CapabilitiesConfig() # default read-only
            )
            
            async with Agent(config) as agent:
                # We can inject past history into agent context if needed, 
                # but for simplicity, we pass the current message.
                prompt = req.message
                if req.history:
                    # Construct a small history prompt for context
                    history_str = "\n".join([f"{h['role']}: {h['content']}" for h in req.history[-6:]])
                    prompt = f"Conversation History:\n{history_str}\n\nUser: {req.message}\nAgent:"

                response = await agent.chat(prompt)
                
                # 1. Stream thoughts first
                async for thought in response.thoughts:
                    yield {"event": "thought", "data": thought}
                
                # 2. Stream response content next
                async for token in response:
                    yield {"event": "message", "data": token}
                    
                yield {"event": "done", "data": ""}
        except Exception as e:
            yield {"event": "error", "data": str(e)}
            yield {"event": "done", "data": ""}

    return EventSourceResponse(event_generator())


# Serve main frontend assets
@app.get("/")
async def serve_index():
    return FileResponse("frontend/index.html")

# Serve all static files under /static
app.mount("/static", StaticFiles(directory="frontend"), name="static")
