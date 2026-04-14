from pydantic import BaseModel
from typing import List, Optional


class ReviewRequest(BaseModel):
    code: str
    language: str
    model_used: str = "gemini"
    user_id: int
    session_id: Optional[int] = None
    prev_review_id: Optional[int] = None


class IssueItem(BaseModel):
    type: str
    description: str
    is_fixed: bool = False


class ReviewResponse(BaseModel):
    id: int
    score: float
    improvement_score: Optional[float] = None
    summary: str
    improved_code: Optional[str] = None
    issues: List[IssueItem]
    language: str
    code: str
    model_used: str
    version: int


class AnnotationRequest(BaseModel):
    review_id: int
    user_id: int
    selected_text: str
    position_start: int
    position_end: int
    chat_type: str = "side"


class AnnotationMessageRequest(BaseModel):
    annotation_id: int
    user_id: Optional[int] = None
    message: str    

class SuggestionRequest(BaseModel):
    user_id: int
    title: str
    description: str


class ContactRequest(BaseModel):
    user_id: Optional[int] = None
    name: str
    email: str
    subject: str
    message: str

class SessionCreate(BaseModel):
    user_id: int
    language: str
    session_name: Optional[str] = None  # auto-generated if not sent


class ChatRequest(BaseModel):
    message: str
    user_id: Optional[int] = None