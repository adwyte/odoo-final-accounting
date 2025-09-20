from sqlalchemy import Column, Text, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.sql import func
from ..database.database import Base

roles_enum = ENUM('admin', 'invoicing_user', name='user_roles', create_type=True)

class User(Base):
    __tablename__ = "users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )
    name = Column(Text, nullable=False)
    login_id = Column(Text, nullable=False, unique=True)
    email = Column(Text, nullable=False, unique=True)
    password = Column(Text, nullable=False)

    role = Column(roles_enum, nullable=False)
