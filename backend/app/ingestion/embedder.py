from langchain_openai import OpenAIEmbeddings

from app.core.config import settings


class EmbeddingService:
    embeddings = OpenAIEmbeddings(
        api_key=settings.OPENAI_API_KEY,
        model="text-embedding-3-small"
    )

    @classmethod
    def embed_text(cls, text: str):
        return cls.embeddings.embed_query(text)