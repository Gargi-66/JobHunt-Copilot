from sqlmodel import SQLModel, Field


# =========================
# JOB TABLE
# =========================

class Job(SQLModel, table=True):

    id: int | None = Field(
        default=None,
        primary_key=True
    )

    company: str
    role: str
    status: str


# =========================
# USER TABLE
# =========================

class User(SQLModel, table=True):

    id: int | None = Field(
        default=None,
        primary_key=True
    )

    email: str
    password_hash: str


# =========================
# APPLICATION TABLE
# =========================

class Application(SQLModel, table=True):

    id: int | None = Field(
        default=None,
        primary_key=True
    )

    user_id: int
    company: str
    role: str
    link: str
    status: str


# =========================
# RESUME TABLE
# =========================

class Resume(SQLModel, table=True):

    id: int | None = Field(
        default=None,
        primary_key=True
    )

    user_id: int = Field(
        unique=True
    )

    resume_text: str