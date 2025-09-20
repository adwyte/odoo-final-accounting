import datetime as dt
from jose import jwt
from passlib.context import CryptContext

JWT_SECRET = "Odoo_final_shiv_furniture_accounting"
JWT_ALG = "HS256"
JWT_EXPIRE_MIN = 60

# bcrypt hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(raw_password: str) -> str:
    return pwd_context.hash(raw_password)

def verify_password(raw_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(raw_password, hashed_password)

def create_access_token(sub: str, extra_claims: dict | None = None) -> str:
    payload = {
        "sub": sub,
        "iat": dt.datetime.utcnow(),
        "exp": dt.datetime.utcnow() + dt.timedelta(minutes=JWT_EXPIRE_MIN),
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
