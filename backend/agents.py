import os
from typing import List, Optional
from pydantic import BaseModel, Field
from google.antigravity import Agent, LocalAgentConfig, CapabilitiesConfig

# Define schemas for structured JSON output from Gemini
class QuickStartStep(BaseModel):
    step_number: int = Field(..., description="Sequential number of the step (starting from 1).")
    title: str = Field(..., description="Short title of the step, e.g., 'Power On', 'Assemble Wand'.")
    description: str = Field(..., description="Concise instructions on how to perform this step.")
    icon: str = Field(..., description="Icon key for UI. Choose one: 'power', 'settings', 'battery', 'play', 'warning', 'connect', 'info', 'check'.")

class ProductFeature(BaseModel):
    title: str = Field(..., description="Name of the feature, e.g., 'Suction Control', 'Eco Mode', 'Bluetooth Pairing'.")
    description: str = Field(..., description="A short summary of what this feature does.")
    operation_steps: List[str] = Field(..., description="Step-by-step list of how to operate/use this feature.")
    precautions: List[str] = Field(..., description="Safety tips or usage warnings specific to this feature.")
    support_info: str = Field(..., description="What to do if this feature malfunctions or how to reset it.")

class CommonFault(BaseModel):
    symptom: str = Field(..., description="Visual or auditory symptom, e.g., 'Blinking red light', 'Loss of suction'.")
    cause: str = Field(..., description="Root cause of the symptom.")
    solution: str = Field(..., description="Step-by-step solution to fix it.")
    warning_level: str = Field(..., description="Warning severity: 'info' (informational), 'warning' (attention needed), 'danger' (stop using).")

class StructuredManual(BaseModel):
    product_name: str = Field(..., description="Official product name.")
    model: str = Field(..., description="Model number or variation.")
    category: str = Field(..., description="Product category, e.g., 'Vacuum Cleaner', 'Headphones', 'Coffee Maker'.")
    brief_description: str = Field(..., description="A 1-2 sentence description of the product.")
    quick_start: List[QuickStartStep] = Field(..., description="4-6 sequential steps to get started.")
    features: List[ProductFeature] = Field(..., description="3-5 core features.")
    faults: List[CommonFault] = Field(..., description="3-5 troubleshooting issues.")


async def generate_structured_manual(product_query: str, manual_text: Optional[str] = None, api_key: Optional[str] = None) -> StructuredManual:
    """Uses the Antigravity SDK and Gemini to generate a structured product manual JSON.
    
    If manual_text is provided, parses it.
    If manual_text is not provided, leverages the agent's pre-trained knowledge and simulated research
    to compile details of the product model.
    """
    system_instructions = (
        "You are an expert technical writer and UI architect for high-end consumer products (like Apple and Dyson). "
        "Your task is to analyze product details and structure them into a clean, actionable user manual JSON schema. "
        "Ensure steps are precise, warnings are clear, and troubleshooting details cover common user pain points. "
        "Do not include placeholders. Generate high-quality, product-specific information. "
        "All texts in the output JSON schema MUST be written in English."
    )
    
    config = LocalAgentConfig(
        api_key=api_key or os.getenv("GEMINI_API_KEY"),
        system_instructions=system_instructions,
        response_schema=StructuredManual,
        capabilities=CapabilitiesConfig(enable_subagents=True)
    )
    
    if manual_text and manual_text.strip():
        prompt = (
            f"Please parse the following raw manual text for the product '{product_query}' and structure it "
            f"according to the schema:\n\n{manual_text}"
        )
    else:
        prompt = (
            f"Generate a complete structured interactive manual for the product model '{product_query}'. "
            f"Include realistic quick start steps, core features, and troubleshooting items specific to this product."
        )
        
    async with Agent(config) as agent:
        response = await agent.chat(prompt)
        structured_data = await response.structured_output()
        
        # If response parsing failed, we fall back to manual pydantic parsing
        if isinstance(structured_data, dict):
            return StructuredManual(**structured_data)
        return structured_data
