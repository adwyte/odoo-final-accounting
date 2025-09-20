from fastapi import APIRouter
from typing import List
import backend.src.schemas.product_schemas as schemas

router = APIRouter(prefix="/products", tags=["Products"])

# Mock data for testing
mock_products = [
    {
        "id": "1",
        "name": "Office Chair", 
        "type": "Goods", 
        "salesPrice": 2200, 
        "purchasePrice": 1500, 
        "salesTax": 5, 
        "purchaseTax": 5, 
        "hsn": "9401"
    },
    {
        "id": "2", 
        "name": "Assembly Service", 
        "type": "Service", 
        "salesPrice": 500, 
        "salesTax": 18
    }
]

@router.get("/", response_model=List[dict])
def get_products():
    return mock_products

@router.post("/", response_model=dict)
def create_product(product: dict):
    new_product = {**product, "id": str(len(mock_products) + 1)}
    mock_products.append(new_product)
    return new_product

@router.put("/{product_id}", response_model=dict)
def update_product(product_id: str, product: dict):
    for i, p in enumerate(mock_products):
        if p["id"] == product_id:
            mock_products[i] = {**p, **product}
            return mock_products[i]
    return {"error": "Product not found"}