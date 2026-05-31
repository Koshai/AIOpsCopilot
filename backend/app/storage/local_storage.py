from pathlib import Path
import shutil
from uuid import uuid4

from fastapi import UploadFile


UPLOAD_DIR = Path("uploads")

UPLOAD_DIR.mkdir(exist_ok=True)


class LocalStorage:
    @staticmethod
    async def save_file(file: UploadFile) -> str:
        file_extension = Path(file.filename).suffix

        unique_filename = f"{uuid4()}{file_extension}"

        file_path = UPLOAD_DIR / unique_filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return str(file_path.resolve())