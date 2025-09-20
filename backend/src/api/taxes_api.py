

from fastapi import APIRouter, HTTPException
from uuid import uuid4, UUID
from typing import List

from backend.src.schemas.tax_schemas import TaxCreate, TaxUpdate, TaxOut

router = APIRouter()

# --- In-memory DB ---
taxes: List[dict] = []

# --- Seed Data ---
taxes.append({
    "id": uuid4(), "name": "GST 5%", "method": "Percentage", "appliesTo": "Sales", "value": 5, "archived": False
})
taxes.append({
    "id": uuid4(), "name": "GST 10%", "method": "Percentage", "appliesTo": "Purchase", "value": 10, "archived": False
})


@router.get("/taxes", response_model=List[TaxOut])
def list_taxes(include_archived: bool = False):
    if include_archived:
        return taxes
    return [t for t in taxes if not t["archived"]]


@router.post("/taxes", response_model=TaxOut)
def create_tax(tax: TaxCreate):
    new_tax = tax.dict()
    new_tax["id"] = uuid4()
    new_tax["archived"] = False
    taxes.append(new_tax)
    return new_tax


@router.put("/taxes/{tax_id}", response_model=TaxOut)
def update_tax(tax_id: UUID, tax_update: TaxUpdate):
    for i, existing in enumerate(taxes):
        if existing["id"] == tax_id:
            updated_data = tax_update.dict(exclude_unset=True)
            taxes[i] = {**existing, **updated_data}
            return taxes[i]
    raise HTTPException(status_code=404, detail="Tax not found")


@router.delete("/taxes/{tax_id}", response_model=TaxOut)
def archive_tax(tax_id: UUID):
    for tax in taxes:
        if tax["id"] == tax_id:
            tax["archived"] = not tax["archived"]
            return tax
    raise HTTPException(status_code=404, detail="Tax not found")
