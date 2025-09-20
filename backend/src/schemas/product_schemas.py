from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class ProductBase(BaseModel):
    name: str
    type: str
    sales_price: Optional[float] = None
    purchase_price: Optional[float] = None
    sales_tax: Optional[float] = None
    purchase_tax: Optional[float] = None
    hsn_code: Optional[str] = None
    category: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: UUID

    class Config:
        orm_mode = True
