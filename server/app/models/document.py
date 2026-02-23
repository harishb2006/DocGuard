from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DocumentInfo(BaseModel):
    filename: str
    size: int
    uploaded_at: datetime
    uploaded_by: str

class QuestionRequest(BaseModel):
    question: str
    document_filter: Optional[List[str]] = None

class SourceCitation(BaseModel):
    page: int
    content: str
    document_name: str

class AnswerResponse(BaseModel):
    answer: str
    sources: List[SourceCitation]
