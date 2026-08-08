import os
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1/explain-field", tags=["Explainer"])

class ScopedExplainerPayload(BaseModel):
    """
    STRICT DTO BOUNDARY (Non-Negotiable Constraint 3 & Fix 6)
    Structurally prohibits inclusion of citizen values, vault data, or document OCR text.
    """
    field_id: str = Field(..., description="DOM Element ID or Name identifier")
    label_text: str = Field(..., description="Visible label text attached to input element")
    aria_label: Optional[str] = Field(None, description="ARIA label or describedby text")
    input_type: Optional[str] = Field("text", description="HTML input type")
    placeholder: Optional[str] = Field(None, description="Input placeholder string")
    context_hint: Optional[str] = Field(None, description="Parent fieldset legend or section header text ONLY")

class ExplainerResponse(BaseModel):
    field_id: str
    plain_language_explanation: str
    example_input: str
    guidance_tips: list[str]

# Fallback explanations dictionary for ambiguous government portal terms
FIELD_EXPLANATION_MAPPING = {
    "nature_of_occupancy": {
        "explanation": "'Nature of Occupancy' refers to how you legally hold the agricultural land you farm.",
        "example": "Select 'Owner' if land is registered in your name, or 'Patta Holder' if given by Government.",
        "tips": [
            "Check your RoR (Khatiyan/Porcha) document for title classification.",
            "If farming inherited land before official title transfer, select 'Owner'.",
            "Recorded sharecroppers should select 'Recorded Bargadar'."
        ]
    },
    "land_holding_scale": {
        "explanation": "'Land Holding Scale' means total area of agricultural land owned or cultivated by your family.",
        "example": "e.g., 1.50 Acres or 0.60 Hectares",
        "tips": [
            "Enter total land area in Acres as printed on your Khatiyan.",
            "1 Acre = approx 0.404 Hectares.",
            "Include all plots owned within the state."
        ]
    },
    "khatiyan_number": {
        "explanation": "'Khatiyan Number' (Record of Rights / Porcha No.) is the official land registry serial number.",
        "example": "e.g., 402/1 or 1289",
        "tips": [
            "Found at the top-left or top-center of your West Bengal Land Revenue document (RoR).",
            "Ensure you enter the Khatiyan number, not the Plot (Dag) number."
        ]
    },
    "dag_number": {
        "explanation": "'Dag Number' is the specific plot/parcel number of your farmland within the Mouza.",
        "example": "e.g., 1542 or 890",
        "tips": [
            "Found in the plot details section of your Khatiyan document.",
            "Separate multiple plot numbers with commas if required."
        ]
    }
}

@router.post("", response_model=ExplainerResponse)
async def explain_field(payload: ScopedExplainerPayload):
    """
    Receives scoped field label + ARIA metadata DTO.
    Returns citizen-friendly guidance without exposing PII.
    """
    label_key = payload.label_text.lower().replace(" ", "_").strip()
    field_key = payload.field_id.lower().replace("-", "_").strip()

    # Check matching fallback guidance first
    for key, data in FIELD_EXPLANATION_MAPPING.items():
        if key in label_key or key in field_key:
            return ExplainerResponse(
                field_id=payload.field_id,
                plain_language_explanation=data["explanation"],
                example_input=data["example"],
                guidance_tips=data["tips"]
            )

    # Gemini API integration if key exists
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            import httpx
            prompt = (
                f"Explain this Indian government application form field in simple, plain terms:\n"
                f"Field Label: {payload.label_text}\n"
                f"Section Context: {payload.context_hint or 'N/A'}\n"
                f"Input Type: {payload.input_type or 'text'}\n"
                f"Provide a 2-sentence explanation and a simple example input. Do not mention system internals."
            )
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
                if res.status_code == 200:
                    text_resp = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                    return ExplainerResponse(
                        field_id=payload.field_id,
                        plain_language_explanation=text_resp,
                        example_input=f"Standard format for {payload.label_text}",
                        guidance_tips=["Verify accuracy against official document before proceeding."]
                    )
        except Exception as e:
            print(f"Gemini API call warning: {e}")

    # General fallback
    return ExplainerResponse(
        field_id=payload.field_id,
        plain_language_explanation=f"This field requests your official '{payload.label_text}'. Please refer to your supporting document for the exact value.",
        example_input=payload.placeholder or f"Enter your {payload.label_text}",
        guidance_tips=[
            "Ensure spelling matches your Aadhaar or Government Certificate exactly.",
            "Leave blank only if marked optional."
        ]
    )
