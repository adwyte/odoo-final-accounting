from fastapi import APIRouter
from typing import List

router = APIRouter(prefix="/coa", tags=["Chart of Accounts"])

# Mock data for Chart of Accounts
mock_coa = [
    {"id": "c1", "name": "Cash A/c", "type": "Asset"},
    {"id": "c2", "name": "Bank A/c", "type": "Asset"},
    {"id": "c3", "name": "Sales Income A/c", "type": "Income"},
    {"id": "c4", "name": "Purchases Expense A/c", "type": "Expense"},
    {"id": "c5", "name": "Creditors A/c", "type": "Liability"},
    {"id": "c6", "name": "Debtors A/c", "type": "Asset"},
    {"id": "c7", "name": "Office Rent A/c", "type": "Expense"},
    {"id": "c8", "name": "Capital A/c", "type": "Equity"},
]

@router.get("/", response_model=List[dict])
def get_accounts():
    """Get all chart of accounts"""
    return mock_coa

@router.post("/", response_model=dict)
def create_account(account: dict):
    """Create a new account"""
    new_account = {**account, "id": f"c{len(mock_coa) + 1}"}
    mock_coa.append(new_account)
    return new_account

@router.put("/{account_id}", response_model=dict)
def update_account(account_id: str, account: dict):
    """Update an existing account"""
    for i, acc in enumerate(mock_coa):
        if acc["id"] == account_id:
            mock_coa[i] = {**acc, **account}
            return mock_coa[i]
    return {"error": "Account not found"}

@router.delete("/{account_id}")
def delete_account(account_id: str):
    """Delete an account"""
    global mock_coa
    mock_coa = [acc for acc in mock_coa if acc["id"] != account_id]
    return {"message": "Account deleted successfully"}

@router.get("/by-type/{account_type}")
def get_accounts_by_type(account_type: str):
    """Get accounts by type (Asset, Liability, Income, Expense, Equity)"""
    return [acc for acc in mock_coa if acc["type"].lower() == account_type.lower()]