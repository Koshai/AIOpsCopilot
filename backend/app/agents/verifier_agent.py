from openai import OpenAI

from app.core.config import settings


client = OpenAI(
    api_key=settings.OPENAI_API_KEY
)


class VerifierAgent:

    @staticmethod
    def verify(extraction):

        prompt = f"""
You are a verification agent.

Check if this invoice extraction appears valid.

Extraction:
{extraction}

Return only:
VALID
or
INVALID
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

        result = response.choices[0].message.content

        return "VALID" in result.upper()