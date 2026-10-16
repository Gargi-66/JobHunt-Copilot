import os

from dotenv import load_dotenv

from sqlmodel import SQLModel, create_engine


# =========================
# LOAD ENVIRONMENT VARIABLES
# =========================

load_dotenv()


# =========================
# DATABASE CONFIGURATION
# =========================

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

if USER and PASSWORD and HOST and PORT and DBNAME:
    DATABASE_URL = (
        f"postgresql+psycopg2://"
        f"{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"
        f"?sslmode=require"
    )
    engine = create_engine(DATABASE_URL)
else:
    DATABASE_URL = "sqlite:///jobhunt.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


# =========================
# CREATE DATABASE TABLES
# =========================

def create_tables():

    SQLModel.metadata.create_all(engine)