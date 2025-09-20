from fastapi import FastAPI
from .src.api.auth import router as auth_router   # note the leading dot: inside 'backend' package

app = FastAPI(
    title="Shiv Accounts Cloud - API",
    version="0.1.0",
    description="Beginner-friendly FastAPI backend (Supabase Postgres)."
)

# Mount routes
app.include_router(auth_router)

# Health check
@app.get("/")
def health():
    return {"ok": True, "message": "API is running"}
