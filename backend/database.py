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

engine = None

if USER and PASSWORD and HOST and PORT and DBNAME:
    try:
        DATABASE_URL = (
            f"postgresql+psycopg2://"
            f"{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}"
            f"?sslmode=require"
        )
        test_engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        # Verify connection works before committing to it
        with test_engine.connect() as conn:
            pass
        engine = test_engine
        print("Connected to remote PostgreSQL database successfully.")
    except Exception as err:
        print(f"PostgreSQL connection failed ({err}). Falling back to local SQLite database.")
        engine = None

if engine is None:
    DATABASE_URL = "sqlite:///jobhunt.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    print("Using SQLite database (jobhunt.db).")


# =========================
# CREATE DATABASE TABLES
# =========================

def create_tables():
    try:
        SQLModel.metadata.create_all(engine)
    except Exception as err:
        print(f"Error creating tables: {err}")