from sqlalchemy import Column, Text, TIMESTAMP, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.sql import func
from ..database.database import Base

contact_type_enum = ENUM("customer", "vendor", name="contact_type", create_type=True)

class Contact(Base):
    __tablename__ = "contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    name = Column(Text, nullable=False)
    email = Column(Text)
    phone = Column(Text)
    address = Column(Text)
    type = Column(contact_type_enum, nullable=False)  # ENUM: 'customer' | 'vendor'
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
