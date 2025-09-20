from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.src.database.database import get_db
import backend.src.models.product_models as models, backend.src.schemas.product_schemas as schemas

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("/", response_model=schemas.ProductOut)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/", response_model=list[schemas.ProductOut])
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).all()
