from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from backend.src.database.database import engine, Base
from backend.src.models import product_models
from backend.src.api.product_apis import router as products
#Base.metadata.create_all(bind=engine)
from .src.api.auth import router as auth_router

app = FastAPI(
    title="Shiv Accounts Cloud - API",
    version="0.1.0",
    description="Beginner-friendly FastAPI backend (Supabase Postgres)."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # allow POST, GET, OPTIONS etc.
    allow_headers=["*"],
)
# Mount routes
app.include_router(auth_router)
app.include_router(products)

@app.get("/")
def health():
    return {"ok": True, "message": "API is running"}
