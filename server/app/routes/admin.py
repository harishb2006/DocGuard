from fastapi import APIRouter, HTTPException, Depends
from collections import Counter
import re

from ..auth.firebase_auth import verify_firebase_token
from ..db.mongodb import get_users_collection, get_queries_collection

router = APIRouter()

async def verify_admin_access(token_data: dict = Depends(verify_firebase_token)):
    """
    Dependency to verify admin access using Firebase custom claims.
    Single Responsibility: Only authentication/authorization logic.
    """
    # Check Firebase custom claims for admin status
    if not token_data.get("admin", False):
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    
    # Get user from MongoDB for additional info
    users_collection = await get_users_collection()
    user = await users_collection.find_one({"uid": token_data["uid"]})
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    return user



@router.get("/analytics/queries")
async def get_query_analytics(
    limit: int = 100,
    admin_user: dict = Depends(verify_admin_access)
):
    """
    Get analytics on employee queries - shows most common questions.
    Helps identify confusing policies that need clarification.
    
    Requires: Admin authentication
    """
    try:
        queries_collection = await get_queries_collection()
        
        # Get recent queries with proper sorting
        recent_queries = await queries_collection.find().sort(
            "timestamp", -1
        ).limit(limit).to_list(length=limit)
        
        # Aggregate common queries (deduplicated by question text)
        pipeline = [
            {"$group": {
                "_id": "$question",
                "count": {"$sum": 1},
                "last_asked": {"$max": "$timestamp"}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 20}
        ]
        
        common_queries = await queries_collection.aggregate(pipeline).to_list(length=20)
        
        return {
            "recent_queries": [
                {
                    "question": q.get("question", ""),
                    "user_email": q.get("user_email", "Unknown"),
                    "timestamp": q.get("timestamp"),
                    "has_answer": q.get("has_answer", True)
                }
                for q in recent_queries
            ],
            "common_queries": [
                {
                    "question": q["_id"],
                    "count": q["count"],
                    "last_asked": q["last_asked"]
                }
                for q in common_queries
            ]
        }
    
    except Exception as e:
        import traceback
        print(f"ERROR in get_query_analytics: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting query analytics: {str(e)}"
        )


@router.get("/analytics/word-cloud")
async def get_word_cloud_data(admin_user: dict = Depends(verify_admin_access)):
    """
    Generate word cloud data from employee queries.
    Returns word frequency for visualization of common topics/concerns.
    
    Requires: Admin authentication
    """
    try:
        queries_collection = await get_queries_collection()
        
        # Get all questions (limit to reasonable size for performance)
        all_queries = await queries_collection.find(
            {},
            {"question": 1}
        ).limit(1000).to_list(length=1000)
        
        if not all_queries:
            return {"words": [], "total_queries": 0}
        
        # Combine all questions
        all_text = " ".join([q.get("question", "") for q in all_queries])
        
        # Stop words - common words to exclude from analysis
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
            'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'should', 'could', 'may', 'might', 'must', 'can', 'i', 'you', 'we',
            'they', 'what', 'when', 'where', 'why', 'how', 'which', 'who', 'this',
            'that', 'these', 'those', 'it', 'its', 'my', 'your', 'our', 'their'
        }
        
        # Extract words (alphabetic only, lowercase, minimum length 4)
        words = re.findall(r'\b[a-z]+\b', all_text.lower())
        filtered_words = [w for w in words if w not in stop_words and len(w) > 3]
        
        # Count frequency
        word_freq = Counter(filtered_words)
        
        # Get top 50 words for visualization
        top_words = word_freq.most_common(50)
        
        return {
            "words": [
                {"text": word, "value": count}
                for word, count in top_words
            ],
            "total_queries": len(all_queries)
        }
    
    except Exception as e:
        import traceback
        print(f"ERROR in get_word_cloud_data: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating word cloud: {str(e)}"
        )
