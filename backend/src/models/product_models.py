from sqlalchemy import Column, Integer, String, Float
from backend.src.database.database import Base
from sqlalchemy import Column, String, Numeric, CheckConstraint, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
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
