from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.src.database.database import get_db
import backend.src.models.taxes_models as models
import backend.src.schemas.taxes_schemas as schemas

router = APIRouter(prefix="/taxes", tags=["Taxes"])

@router.post("/", response_model=schemas.TaxOut)
def create_tax(tax: schemas.TaxCreate, db: Session = Depends(get_db)):
    db_tax = models.Tax(**tax.dict())
    db.add(db_tax)
    db.commit()
    db.refresh(db_tax)
    return db_tax

@router.get("/", response_model=list[schemas.TaxOut])
def get_taxes(db: Session = Depends(get_db)):
    return db.query(models.Tax).all()
