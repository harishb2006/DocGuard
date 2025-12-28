from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from cerebras.cloud.sdk import Cerebras
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import CEREBRAS_API_KEY

from ..ingest.vectorstore import get_vectorstore

router = APIRouter()

class QuestionRequest(BaseModel):
    question: str

class SourceCitation(BaseModel):
    page: int
    content: str
    document_name: str

class AnswerResponse(BaseModel):
    answer: str
    sources: list[SourceCitation]

@router.post("/ask", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    """
    RAG-based Q&A endpoint
    1. Retrieves relevant chunks from Pinecone
    2. Sends to LLM with grounding prompt
    3. Returns answer with source citations
    """
    try:
        # Step 1: Retrieve relevant chunks
        vectorstore = get_vectorstore()
        results = vectorstore.similarity_search_with_score(
            request.question,
            k=3  # Top 3 most relevant chunks
        )
        
        if not results:
            return AnswerResponse(
                answer="I don't have any information to answer that question. Please ensure relevant documents have been uploaded.",
                sources=[]
            )
        
        # Step 2: Prepare context from retrieved chunks
        context_parts = []
        sources = []
        
        for idx, (doc, score) in enumerate(results, 1):
            context_parts.append(f"[Source {idx}]\n{doc.page_content}\n")
            
            sources.append(SourceCitation(
                page=doc.metadata.get("page", 0),
                content=doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                document_name=doc.metadata.get("document_name", "Unknown")
            ))
        
        context = "\n".join(context_parts)
        
        # Step 3: Create grounded prompt
        prompt = f"""You are a corporate policy assistant. Answer the question ONLY using the provided context below.

CRITICAL RULES:
- If the answer is not in the context, say "I don't have information about that in the uploaded documents."
- Always cite which source ([Source 1], [Source 2], etc.) you used
- Be concise and professional
- Never make up information

CONTEXT:
{context}

QUESTION: {request.question}

ANSWER:"""
        
        # Step 4: Call Cerebras LLM
        client = Cerebras(
            api_key=CEREBRAS_API_KEY
        )
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b",
            temperature=0.0  # No creativity - stick to facts
        )
        
        answer = chat_completion.choices[0].message.content
        
        return AnswerResponse(
            answer=answer,
            sources=sources
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@router.get("/ping")
def ping():
    return {"message": "Employee API is alive!"}
