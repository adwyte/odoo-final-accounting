from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:d4bfe67c@db.bsuclmignbojamotmtff.supabase.co:5432/postgres"

# Create engine
engine = create_engine(DATABASE_URL)

# Session local class for DB operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()
