from pydantic import BaseModel, EmailStr
from uuid import UUID
from enum import Enum

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
    created_by: UUID

class ContactOut(ContactBase):
    id: UUID
    created_by: UUID

    class Config:
        from_attributes = True
