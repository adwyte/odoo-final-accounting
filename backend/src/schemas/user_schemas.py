from pydantic import BaseModel, EmailStr, constr
from uuid import UUID
from enum import Enum


class RoleEnum(str, Enum):
    admin = "admin"
    invoicing_user = "invoicing_user"

class UserCreate(BaseModel):
    name: str
    login_id: str
    email: str
    password: constr(min_length=8)
    role: RoleEnum

class LoginIn(BaseModel):
    login_or_email: str
    password: str


class UserOut(BaseModel):
    id: UUID
    name: str
    login_id: str
    email: EmailStr
    role: RoleEnum

    class Config:
        from_attributes = True  # SQLAlchemy -> Pydantic

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class MeOut(BaseModel):
    id: UUID
    name: str
    login_id: str
    email: EmailStr
    role: RoleEnum
