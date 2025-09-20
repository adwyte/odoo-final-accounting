from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..models.contact_models import ContactCreate, ContactOut
from ..schemas.contact_schemas import Contact
from ..database.database import get_db

router = APIRouter(prefix="/contacts", tags=["contacts"])


@router.post("/", response_model=ContactOut, status_code=status.HTTP_201_CREATED)
def create_contact(payload: ContactCreate, db: Session = Depends(get_db)):
    new_contact = Contact(**payload.dict())
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact

# Get all contacts
@router.get("/", response_model=list[ContactOut])
def get_contacts(db: Session = Depends(get_db)):
    contacts = db.query(Contact).all()
    return contacts

