from fastapi import APIRouter, HTTPException, Depends

from fastapi.security import OAuth2PasswordRequestForm

from sqlmodel import Session, select

from database import engine

from models import User

from schemas import UserSignup

from auth import pwd_context, SECRET_KEY

from jose import jwt


router = APIRouter(
    tags=["Authentication"]
)


# ========================
# SIGNUP
# =========================

@router.post("/signup")
def signup(user: UserSignup):

    clean_email = user.email.strip().lower()
    clean_password = user.password.strip()

    if not clean_email:

        raise HTTPException(
            status_code=400,
            detail="Email is required."
        )

    if not clean_password:

        raise HTTPException(
            status_code=400,
            detail="Password is required."
        )

    with Session(engine) as session:

        existing_user = session.exec(

            select(User).where(
                User.email == clean_email
            )

        ).first()

        if existing_user:

            raise HTTPException(
                status_code=400,
                detail="An account with this email already exists."
            )

        hashed_password = pwd_context.hash(
            clean_password
        )

        new_user = User(
            email=clean_email,
            password_hash=hashed_password
        )

        session.add(new_user)

        session.commit()

        session.refresh(new_user)

    return {

        "message": "User created successfully",

        "id": new_user.id,

        "email": new_user.email

    }


# =========================
# LOGIN
# =========================

@router.post("/login")
def login(
    user: OAuth2PasswordRequestForm = Depends()
):

    clean_email = user.username.strip().lower()
    clean_password = user.password

    if not clean_email or not clean_password:

        raise HTTPException(
            status_code=400,
            detail="Email and password are required."
        )

    with Session(engine) as session:

        db_user = session.exec(

            select(User).where(
                User.email == clean_email
            )

        ).first()

        if not db_user:

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
            )

        if not pwd_context.verify(
            clean_password,
            db_user.password_hash
        ):

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
            )

        token = jwt.encode(

            {
                "sub": str(db_user.id)
            },

            SECRET_KEY,

            algorithm="HS256"
        )

    return {

        "access_token": token,

        "token_type": "bearer"

    }