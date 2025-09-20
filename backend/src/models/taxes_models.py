from sqlalchemy import Column, Integer, String, Numeric, Enum
from backend.src.database.database import Base
import enum

class TaxType(enum.Enum):
    Sales = "Sales"
    Purchase = "Purchase"

class Tax(Base):
    __tablename__ = "taxes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    rate = Column(Numeric(5, 2), nullable=False)
    type = Column(Enum(TaxType, name="tax_type"), nullable=False)
