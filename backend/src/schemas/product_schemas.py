from pydantic import BaseModel
from typing import Optional
from uuid import UUID


# Base schema used for shared fields
class ProductBase(BaseModel):
    name: str
    type: str
    sales_price: Optional[float] = None
    purchase_price: Optional[float] = None
    sales_tax: Optional[float] = None
    purchase_tax: Optional[float] = None
    hsn_code: Optional[str] = None
    category: Optional[str] = None


# For creating a new product (all required fields come from ProductBase)
class ProductCreate(ProductBase):
    pass


# For updating a product — all fields optional
class ProductUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    sales_price: Optional[float] = None
    purchase_price: Optional[float] = None
    sales_tax: Optional[float] = None
    purchase_tax: Optional[float] = None
    hsn_code: Optional[str] = None
    category: Optional[str] = None


# For outputting product with ID
class ProductOut(ProductBase):
    id: UUID

    class Config:
        from_attributes = True  # ✅ Pydantic v2 replacement for orm_mode
