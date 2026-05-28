from openai import OpenAI

from app.core.config import settings


client = OpenAI(
    api_key=settings.OPENAI_API_KEY
)


class RAGService:

    @staticmethod
    def build_context(chunks):

        context = "\n\n".join(
            [chunk.chunk_text for chunk in chunks]
        )

        return context

    @staticmethod
    def generate_answer(
        question: str,
        chunks
    ):

        context = RAGService.build_context(chunks)

        prompt = f"""
You are an AI Operations Copilot.

Answer the user's question using ONLY
the provided context.

If the answer is not found,
say you do not know.

Context:
{context}

Question:
{question}
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