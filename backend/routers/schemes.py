import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1/schemes", tags=["Schemes"])

SCHEMES_DIR = Path(__file__).parent.parent / "data" / "schemes"

@router.get("")
def list_schemes():
    """Lists available scheme summaries with verification metadata."""
    schemes = []
    if not SCHEMES_DIR.exists():
        return schemes
    
    for file_path in SCHEMES_DIR.glob("*.json"):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                schemes.append({
                    "id": data.get("id"),
                    "name": data.get("name"),
                    "type": data.get("type"),
                    "state": data.get("state"),
                    "department": data.get("department"),
                    "last_verified": data.get("last_verified"),
                    "source_url": data.get("source_url"),
                    "description": data.get("description"),
                    "status_note": data.get("status_note")
                })
        except Exception as e:
            print(f"Error reading scheme file {file_path}: {e}")
            
    return {"schemes": schemes}

@router.get("/{scheme_id}")
def get_scheme(scheme_id: str):
    """Returns full scheme JSON schema including rule trees and document specs."""
    file_path = SCHEMES_DIR / f"{scheme_id.replace('-', '_')}.json"
    if not file_path.exists():
        # Fallback search by id inside files
        found = False
        for fpath in SCHEMES_DIR.glob("*.json"):
            with open(fpath, "r", encoding="utf-8") as f:
                data = json.load(f)
                if data.get("id") == scheme_id:
                    return data
        raise HTTPException(status_code=404, detail=f"Scheme with ID '{scheme_id}' not found")
        
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)
