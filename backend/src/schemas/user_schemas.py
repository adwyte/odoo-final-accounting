from pydantic import BaseModel, EmailStr, constr
from uuid import UUID

RoleStr = constr(pattern="^(admin|invoicing_user)$")

class UserCreate(BaseModel):
    name: str
    login_id: str
    email: EmailStr
    password: constr(min_length=8)
    role: RoleStr

class UserOut(BaseModel):
    user_id: UUID
    name: str
    login_id: str
    email: EmailStr
    role: RoleStr

    class Config:
        from_attributes = True  # allows SQLAlchemy -> Pydantic

class LoginIn(BaseModel):
    login_or_email: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class MeOut(BaseModel):
    user_id: UUID
    name: str
    login_id: str
    email: EmailStr
    role: RoleStr
