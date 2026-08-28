from fastapi import APIRouter, Depends, HTTPException

from sqlmodel import Session, select

from database import engine

from models import Application

from schemas import ApplicationCreate, ApplicationUpdate

from auth import get_current_user


router = APIRouter(
    tags=["Applications"]
)


# =========================
# CREATE APPLICATION
# =========================

@router.post("/applications")
def create_application(

    application: ApplicationCreate,

    user_id: str = Depends(get_current_user)

):

    new_application = Application(

        user_id=int(user_id),

        company=application.company,

        role=application.role,

        link=application.link,

        status=application.status

    )

    with Session(engine) as session:

        session.add(new_application)

        session.commit()

        session.refresh(new_application)

    return new_application


# =========================
# GET APPLICATIONS
# =========================

@router.get("/applications")
def get_applications(

    user_id: str = Depends(get_current_user)

):

    with Session(engine) as session:

        applications = session.exec(

            select(Application).where(

                Application.user_id == int(user_id)

            )

        ).all()

    return applications


# =========================
# UPDATE APPLICATION
# =========================

@router.put("/applications/{application_id}")
def update_application(

    application_id: int,

    application: ApplicationUpdate,

    user_id: str = Depends(get_current_user)

):

    with Session(engine) as session:

        existing_application = session.get(

            Application,

            application_id

        )

        if existing_application is None:

            raise HTTPException(

                status_code=404,

                detail="Application not found"

            )

        if existing_application.user_id != int(user_id):

            raise HTTPException(

                status_code=403,

                detail="Not authorized"

            )

        existing_application.status = application.status

        session.add(existing_application)

        session.commit()

        session.refresh(existing_application)

        return existing_application


# =========================
# DELETE APPLICATION
# =========================

@router.delete("/applications/{application_id}")
def delete_application(

    application_id: int,

    user_id: str = Depends(get_current_user)

):

    with Session(engine) as session:

        existing_application = session.get(

            Application,

            application_id

        )

        if existing_application is None:

            raise HTTPException(

                status_code=404,

                detail="Application not found"

            )

        if existing_application.user_id != int(user_id):

            raise HTTPException(

                status_code=403,

                detail="Not authorized"

            )

        session.delete(existing_application)

        session.commit()

        return {
            "message": "Application deleted successfully"
        }
    