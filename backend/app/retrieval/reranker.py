class RerankerService:

    @staticmethod
    def rerank(
        query: str,
        chunks
    ):

        query_words = query.lower().split()

        scored = []

        for chunk in chunks:

            text = chunk.chunk_text.lower()

            score = sum(
                word in text
                for word in query_words
            )

            scored.append(
                (chunk, score)
            )

        reranked = sorted(
            scored,
            key=lambda x: x[1],
            reverse=True
        )

        return [
            item[0]
            for item in reranked
        ]