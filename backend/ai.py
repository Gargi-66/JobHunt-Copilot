import os

from dotenv import load_dotenv

from openai import OpenAI


# =========================
# ENVIRONMENT VARIABLES
# =========================

load_dotenv()


# =========================
# GROQ CLIENT
# =========================

groq_client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

