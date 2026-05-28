from langchain.text_splitter import RecursiveCharacterTextSplitter


class ChunkingService:
    @staticmethod
    def chunk_documents(documents):

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )

        chunks = splitter.split_documents(documents)

        return chunks