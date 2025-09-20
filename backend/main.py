from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from backend.src.database.database import engine, Base
from backend.src.models import product_models
from backend.src.api.product_apis import router as products
from backend.src.api.contacts_api import router as contacts
from backend.src.api.taxes_api import router as taxes
from .src.api.auth import router as auth_router
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Shiv Accounts Cloud - API",
    version="0.1.0",
    description="Beginner-friendly FastAPI backend (Supabase Postgres)."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Mount routes
app.include_router(auth_router)
app.include_router(products)
app.include_router(contacts)
app.include_router(taxes)

@app.get("/")
def health():
    return {"ok": True, "message": "API is running"}
