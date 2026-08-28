from pydantic import BaseModel


# =========================
# APPLICATION
# =========================

class ApplicationCreate(BaseModel):

    company: str
    role: str
    link: str
    status: str


class ApplicationUpdate(BaseModel):

    status: str


# =========================
# JOB DESCRIPTION ANALYZER
# =========================

class JDRequest(BaseModel):

    job_description: str


# =========================
# USER AUTHENTICATION
# =========================

class UserSignup(BaseModel):

    email: str
    password: str


class UserLogin(BaseModel):

    email: str
    password: str


# =========================
# RESUME
# =========================

class ResumeRequest(BaseModel):

    resume_text: str


# =========================
# INTERVIEW PREP
# =========================

class InterviewPrepRequest(BaseModel):

    job_description: str
    company: str
    role: str
    