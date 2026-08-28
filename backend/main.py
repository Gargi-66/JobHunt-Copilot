from fastapi import FastAPI, Depends

from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles

from fastapi.responses import FileResponse

from sqlmodel import SQLModel

from database import engine

from auth import get_current_user

from routes.auth_routes import router as auth_router

from routes.application_routes import router as application_router

from routes.resume_routes import router as resume_router

from routes.ai_routes import router as ai_router


# =========================
# FASTAPI APP
# =========================

app = FastAPI()


# =========================
# CREATE DATABASE TABLES
# =========================

def create_tables():

    SQLModel.metadata.create_all(engine)


@app.on_event("startup")
def on_startup():

    create_tables()


# =========================
# ROUTERS
# =========================

app.include_router(auth_router)

app.include_router(application_router)

app.include_router(resume_router)

app.include_router(ai_router)


# =========================
# CORS
# =========================

app.add_middleware(

    CORSMiddleware,

    allow_origins=[

        "http://localhost:5500",

        "http://localhost:5173",

        "http://127.0.0.1:5173"

    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)


# =========================
# STATIC FILES
# =========================

app.mount(

    "/static",

    StaticFiles(directory="static"),

    name="static"

)


# =========================
# HOME
# =========================

@app.get("/")
def home():

    return FileResponse(
        "static/index.html"
    )


# =========================
# JOBS
# =========================

@app.get("/jobs")
def get_jobs():

    return [

        {
            "id": 1,
            "company": "Google",
            "role": "Frontend Developer"
        },

        {
            "id": 2,
            "company": "Microsoft",
            "role": "Backend Developer"
        }

    ]


@app.get("/jobs/{job_id}")
def get_job(job_id: int):

    for job in get_jobs():

        if job["id"] == job_id:

            return job

    return {
        "message": "Job not found"
    }


# =========================
# SEARCH
# =========================

@app.get("/search")
def search_jobs(status: str):

    return {
        "status": status
    }


# =========================
# CREATE JOB
# =========================

@app.post("/job")
def create_job(job):

    return job


# =========================
# PROTECTED ROUTE
# =========================

@app.get("/protected")
def protected(

    user_id: str = Depends(get_current_user)

):

    return {

        "message": "You are logged in",

        "user_id": user_id

    }