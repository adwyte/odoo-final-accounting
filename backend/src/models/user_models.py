from sqlalchemy import Column, String, Text, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from backend.src.database.database import Base

class User(Base):
    __tablename__ = "users"

    user_id   = Column(UUID(as_uuid=True), primary_key=True)
    name      = Column(Text, nullable=False)
    login_id  = Column(Text, nullable=False, unique=True)
    email     = Column(Text, nullable=False, unique=True)
    password  = Column(Text, nullable=False)  # stores bcrypt hash
    role      = Column(Text, nullable=False)  # 'admin' or 'invoicing_user'
    created_at = Column(TIMESTAMP(timezone=False), server_default=func.now())
