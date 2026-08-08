import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import schemes, explainer

app = FastAPI(
    title="LokSetu Backend API",
    description="Sovereign Form Intelligence & Guided Application Copilot Backend",
    version="1.0.0"
)

# Fix #1: CORS Middleware allowlisting Extension sidepanel & localhost origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_origin_regex=r"chrome-extension://.*|http://(localhost|127\.0\.0\.1):.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(schemes.router)
app.include_router(explainer.router)

@app.get("/")
def read_root():
    return {
        "service": "LokSetu Sovereign Form Intelligence API",
        "status": "online",
        "docs": "/docs",
        "schemes_endpoint": "/api/v1/schemes",
        "explainer_endpoint": "/api/v1/explain-field"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
