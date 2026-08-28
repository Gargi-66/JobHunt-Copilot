from fastapi import APIRouter

import json

from schemas import JDRequest, InterviewPrepRequest

from ai import groq_client


router = APIRouter(
    tags=["AI"]
)


# =========================
# JD ANALYZER
# =========================

@router.post("/analyze-jd")
def analyze_jd(request: JDRequest):

    response = groq_client.chat.completions.create(

        model="openai/gpt-oss-20b",

        messages=[

            {
                "role": "system",

                "content": """
                Analyze the job description and identify:

                1. The company name
                2. The job role/title
                3. Required technical and professional skills
                4. Seniority level
                5. Any red flags

                Return the information in the exact JSON structure requested.

                If the company name cannot be found,
                return "Unknown".

                If the job role cannot be found,
                return "Unknown".
                """
            },

            {
                "role": "user",
                "content": request.job_description
            }

        ],

        response_format={

            "type": "json_schema",

            "json_schema": {

                "name": "job_description_analysis",

                "strict": True,

                "schema": {

                    "type": "object",

                    "properties": {

                        "company": {
                            "type": "string"
                        },

                        "role": {
                            "type": "string"
                        },

                        "required_skills": {

                            "type": "array",

                            "items": {
                                "type": "string"
                            }

                        },

                        "seniority": {
                            "type": "string"
                        },

                        "red_flags": {

                            "type": "array",

                            "items": {
                                "type": "string"
                            }

                        }

                    },

                    "required": [
                        "company",
                        "role",
                        "required_skills",
                        "seniority",
                        "red_flags"
                    ],

                    "additionalProperties": False

                }

            }

        }

    )

    return json.loads(
        response.choices[0].message.content
    )


# =========================================================
# DAY 15 — INTERVIEW PREP GENERATOR
# =========================================================

@router.post("/interview-prep")
def interview_prep(request: InterviewPrepRequest):

    response = groq_client.chat.completions.create(

        model="openai/gpt-oss-20b",

        messages=[

            {
                "role": "system",

                "content": """
                You are an expert technical interviewer.

                Analyze the provided job description and generate
                likely interview questions for the candidate.

                For each question, provide concise talking points
                that the candidate should cover in their answer.

                Generate a mixture of:

                1. Technical questions based on the required skills
                2. Role-specific questions
                3. Project or experience questions
                4. Behavioral questions relevant to the role

                Keep the questions realistic and useful for interview
                preparation.

                Talking points should be short bullet-style phrases,
                not complete answers.

                Return the information in the exact JSON structure requested.
                """
            },

            {
                "role": "user",

                "content": f"""
                Company: {request.company}

                Role: {request.role}

                Job Description:
                {request.job_description}
                """
            }

        ],

        response_format={

            "type": "json_schema",

            "json_schema": {

                "name": "interview_prep",

                "strict": True,

                "schema": {

                    "type": "object",

                    "properties": {

                        "questions": {

                            "type": "array",

                            "items": {

                                "type": "object",

                                "properties": {

                                    "question": {

                                        "type": "string"

                                    },

                                    "talking_points": {

                                        "type": "array",

                                        "items": {

                                            "type": "string"

                                        }

                                    }

                                },

                                "required": [
                                    "question",
                                    "talking_points"
                                ],

                                "additionalProperties": False

                            }

                        }

                    },

                    "required": [
                        "questions"
                    ],

                    "additionalProperties": False

                }

            }

        }

    )

    return json.loads(
        response.choices[0].message.content
    )