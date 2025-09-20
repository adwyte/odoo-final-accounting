from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from jose import JWTError
from backend.src.database.database import get_db
from ..models.user_models import User
from ..schemas.user_schemas import (
    UserCreate, UserOut, LoginIn, TokenOut, MeOut
)
from ..utils.security import (
    hash_password, verify_password, create_access_token, decode_token
)

router = APIRouter(prefix="", tags=["auth"])

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
        sub=str(user.id),
        extra_claims={"email": user.email, "role": user.role, "name": user.name}
    )
    return {"access_token": token, "token_type": "bearer"}
