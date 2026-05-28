from openai import OpenAI

from app.core.config import settings


client = OpenAI(
    api_key=settings.OPENAI_API_KEY
)


class PlannerAgent:

    @staticmethod
    def plan(question: str):

        prompt = f"""
You are a planning agent.

Determine the best strategy for handling
this invoice-related task.

Question:
{question}

Return concise operational plan.
"""

        response = client.chat.completions.create(
            model="gpt-4.1-mini",

            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        return response.choices[0].message.content