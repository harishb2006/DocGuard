from fastapi import FastAPI
from app.routes import admin, employee

app = FastAPI(
    title="RuleBook AI",
    description="Enterprise AI for corporate PDF policy Q&A",
    version="0.1.0"
)

# Include route files
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(employee.router, prefix="/employee", tags=["Employee"])

@app.get("/")
def root():
    return {"message": "RuleBook AI Backend is running!"}
