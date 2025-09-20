from pydantic import BaseModel, Field
from enum import Enum

class TaxType(str, Enum):
    Sales = "Sales"
    Purchase = "Purchase"

class TaxBase(BaseModel):
    name: str = Field(..., max_length=100)
    rate: float = Field(..., ge=0, le=100)
    type: TaxType

class TaxCreate(TaxBase):
    pass

class TaxOut(TaxBase):
    id: int

    class Config:
        orm_mode = True
