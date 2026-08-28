from fastapi import Depends, HTTPException

from fastapi.security import OAuth2PasswordBearer

from jose import jwt, JWTError

import bcrypt

import os

from dotenv import load_dotenv

load_dotenv()
# =========================
# JWT AUTHENTICATION
# =========================

OAuth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/login"
)

SECRET_KEY = os.getenv("SECRET_KEY")

# =========================
# PASSWORD HASHING
# =========================

# =========================================================
# PASSWORD HASHING
# =========================================================

def hash_password(password: str) -> str:
    """
    Converts a plain-text password into a secure bcrypt hash.
    """

    password_bytes = password.encode("utf-8")

    # bcrypt only supports passwords up to 72 bytes.
    if len(password_bytes) > 72:
        raise ValueError(
            "Password cannot be longer than 72 bytes."
        )

    hashed_password = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    )

    return hashed_password.decode("utf-8")


def verify_password(
    password: str,
    hashed_password: str
) -> bool:
    """
    Checks whether a plain-text password
    matches the stored bcrypt hash.
    """

    password_bytes = password.encode("utf-8")
    hashed_password_bytes = hashed_password.encode("utf-8")

    if len(password_bytes) > 72:
        return False

    return bcrypt.checkpw(
        password_bytes,
        hashed_password_bytes
    )



# =========================
# TOKEN HELPER
# =========================

def get_token(
    token: str = Depends(OAuth2_scheme)
):

    return token


# =========================
# VERIFY TOKEN
# =========================

def verify_token(
    token: str = Depends(OAuth2_scheme)
):

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=["HS256"]
    )

    return payload


# =========================
# GET CURRENT USER
# =========================

def get_current_user(
    token: str = Depends(OAuth2_scheme)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = payload.get("sub")

        if user_id is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return user_id

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )