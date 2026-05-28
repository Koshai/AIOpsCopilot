class MetadataFilterService:

    @staticmethod
    def filter_by_document(
        chunks,
        document_id: int
    ):

        return [
            chunk
            for chunk in chunks
            if chunk.document_id == document_id
        ]