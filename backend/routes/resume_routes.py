from fastapi import APIRouter, Depends, HTTPException

from sqlmodel import Session, select

from database import engine

from models import Resume

from schemas import ResumeRequest

from auth import get_current_user


router = APIRouter(
    tags=["Resume"]
)


# =========================================================
# DAY 14 — SAVE / UPDATE RESUME
# =========================================================

@router.post("/resume")
def save_resume(

    resume: ResumeRequest,

    user_id: str = Depends(get_current_user)

):

    clean_resume_text = resume.resume_text.strip()

    if not clean_resume_text:

        raise HTTPException(
            status_code=400,
            detail="Resume cannot be empty."
        )

    with Session(engine) as session:

        existing_resume = session.exec(

            select(Resume).where(
                Resume.user_id == int(user_id)
            )

        ).first()

        if existing_resume:

            existing_resume.resume_text = clean_resume_text

            session.add(existing_resume)

            session.commit()

            session.refresh(existing_resume)

            return {

                "message": "Resume updated successfully",

                "resume": existing_resume

            }

        new_resume = Resume(

            user_id=int(user_id),

            resume_text=clean_resume_text

        )

        session.add(new_resume)

        session.commit()

        session.refresh(new_resume)

        return {

            "message": "Resume saved successfully",

            "resume": new_resume

        }


# =========================================================
# DAY 14 — GET SAVED RESUME
# =========================================================

@router.get("/resume")
def get_resume(

    user_id: str = Depends(get_current_user)

):

    with Session(engine) as session:

        resume = session.exec(

            select(Resume).where(
                Resume.user_id == int(user_id)
            )

        ).first()

        if resume is None:

            return {

                "resume": None

            }

        return {

            "resume": resume

        }