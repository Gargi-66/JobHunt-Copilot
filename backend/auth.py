from fastapi import Depends, HTTPException

from fastapi.security import OAuth2PasswordBearer

from jose import jwt, JWTError

from passlib.context import CryptContext


# =========================
# JWT AUTHENTICATION
# =========================

OAuth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/login"
)

SECRET_KEY = "your-secret-key"


# =========================
# PASSWORD HASHING
# =========================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
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