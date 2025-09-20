from pydantic import BaseModel, Field
from typing import Literal, Optional
from uuid import UUID


class TaxBase(BaseModel):
    name: str = Field(..., min_length=1)
    method: Literal["Percentage", "Fixed"]
    appliesTo: Literal["Sales", "Purchase"]
    value: float = Field(..., ge=0)


class TaxCreate(TaxBase):
    pass


class TaxUpdate(BaseModel):
    name: Optional[str] = None
    method: Optional[Literal["Percentage", "Fixed"]] = None
    appliesTo: Optional[Literal["Sales", "Purchase"]] = None
    value: Optional[float] = Field(default=None, ge=0)


class TaxOut(TaxBase):
    id: UUID
    archived: bool = False

    class Config:
        from_attributes = True  # For Pydantic v2
