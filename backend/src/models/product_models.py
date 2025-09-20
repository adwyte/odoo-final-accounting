from sqlalchemy import Column, Integer, String, Float
from backend.src.database.database import Base
from sqlalchemy import Column, String, Numeric, CheckConstraint, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    phone = Column(String)

class Product(Base):
    __tablename__ = "products"

    product_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Text, nullable=False)
    type = Column(Text, nullable=False)
    sales_price = Column(Numeric(12, 2), nullable=True)
    purchase_price = Column(Numeric(12, 2), nullable=True)
    sales_tax = Column(Numeric(5, 2), nullable=True)
    purchase_tax = Column(Numeric(5, 2), nullable=True)
    hsn_code = Column(Text, nullable=True)
    category = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("type IN ('goods', 'service')", name="products_type_check"),
    )

class Tax(Base):
    __tablename__ = "taxes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)       # e.g., GST, VAT
    rate = Column(Float, nullable=False)        # percentage
