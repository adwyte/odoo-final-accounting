from pydantic import BaseModel, EmailStr
from uuid import UUID
from enum import Enum
from typing import Optional

class ContactType(str, Enum):
    customer = "customer"
    vendor = "vendor"

class ContactBase(BaseModel):
    name: str
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    type: ContactType

class ContactCreate(ContactBase):
    created_by: Optional[UUID] = None

class ContactOut(ContactBase):
    id: UUID
    created_by: UUID | None = None

    class Config:
        from_attributes = True
