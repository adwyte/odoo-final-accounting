from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from jose import JWTError
from backend.src.database.database import get_db  # same package (api)
from ..models.user_models import User  # up to src, then models
from ..schemas.user_schemas import (  # up to src, then schemas
    UserCreate, UserOut, LoginIn, TokenOut, MeOut
)
from ..utils.security import (  # up to src, then core
    hash_password, verify_password, create_access_token, decode_token
)

router = APIRouter(prefix="", tags=["auth"])

# Swagger UI shows a "lock" and lets us extract Bearer tokens easily
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


@router.post("/CreateUser", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    hashed = hash_password(payload.password)

    new_user = User(
        name=payload.name.strip(),
        login_id=payload.login_id.strip().lower(),
        email=payload.email.strip().lower(),
        password=hashed,
        role=payload.role
    )
    db.add(new_user)
    try:
        db.commit()  # try writing to DB
    except IntegrityError:
        db.rollback()
        # Most likely the email or login_id is already taken due to UNIQUE constraints
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or login_id already exists."
        )
    db.refresh(new_user)  # pull back generated user_id, created_at, etc.
    return new_user


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    key = payload.login_or_email.strip().lower()

    user = db.query(User).filter(
        or_(User.login_id == key, User.email == key)
    ).first()

    if not user:
        # don't reveal whether email or login_id exists
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not verify_password(payload.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(
        sub=str(user.user_id),
        extra_claims={"email": user.email, "role": user.role, "name": user.name}
    )
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=MeOut)
def me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        claims = decode_token(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return MeOut(
        user_id=user.user_id,
        name=user.name,
        login_id=user.login_id,
        email=user.email,
        role=user.role
    )
