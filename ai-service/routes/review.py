from fastapi import APIRouter, HTTPException, Depends
from typing import List
import psycopg2

from models.schemas import (
    ReviewRequest,
    ReviewResponse,
    IssueItem,
    AnnotationRequest,
    AnnotationMessageRequest,
    SuggestionRequest,
    ContactRequest,
    SessionCreate,
)
from services.gemini import (
    call_gemini,
    call_gemini_diff,
    call_gemini_annotation,
    update_skill_profile,
)
from core.database import get_connection

router = APIRouter()


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _get_conn():
    """Open a fresh connection for one request."""
    return get_connection()


# ---------------------------------------------------------------------------
# Reviews
# ---------------------------------------------------------------------------

@router.post("/review", response_model=ReviewResponse, status_code=201)
async def create_review(req: ReviewRequest):
    conn = _get_conn()
    try:
        cursor = conn.cursor()

        version = 1
        improvement_score = None

        if req.prev_review_id:
            # Fetch previous review
            cursor.execute(
                "SELECT code, language, version FROM reviews WHERE id = %s",
                (req.prev_review_id,),
            )
            prev_row = cursor.fetchone()
            if not prev_row:
                raise HTTPException(status_code=404, detail="Previous review not found")
            old_code, old_language, old_version = prev_row
            version = old_version + 1

            # Fetch previous issues
            cursor.execute(
                "SELECT type, description FROM review_issues WHERE review_id = %s",
                (req.prev_review_id,),
            )
            prev_issues = [{"type": r[0], "description": r[1]} for r in cursor.fetchall()]

            ai_result = await call_gemini_diff(
                old_code, req.code, req.language, prev_issues
            )
            improvement_score = ai_result.get("improvement_score")
        else:
            ai_result = await call_gemini(req.code, req.language)

        score = float(ai_result.get("score", 0))
        summary = ai_result.get("summary", "")
        raw_issues = ai_result.get("issues", [])
        improved_code = ai_result.get("improved_code")

        safe_session_id = req.session_id if req.session_id and req.session_id > 0 else None

        # Persist review
        cursor.execute(
            """
            INSERT INTO reviews
                (user_id, session_id, code, language, model_used, score,
                 improvement_score, summary, version, prev_review_id, improved_code)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                req.user_id,
                safe_session_id,
                req.code,
                req.language,
                req.model_used,
                score,
                improvement_score,
                summary,
                version,
                req.prev_review_id,
                improved_code,
            ),
        )
        review_id = cursor.fetchone()[0]

        # Persist issues
        issue_objects: List[IssueItem] = []
        for issue in raw_issues:
            is_fixed = issue.get("is_fixed", False)
            cursor.execute(
                """
                INSERT INTO review_issues (review_id, type, description, is_fixed)
                VALUES (%s, %s, %s, %s)
                """,
                (review_id, issue.get("type", ""), issue.get("description", ""), is_fixed),
            )
            issue_objects.append(
                IssueItem(
                    type=issue.get("type", ""),
                    description=issue.get("description", ""),
                    is_fixed=is_fixed,
                )
            )

        conn.commit()

        # Update skill profile (non-fatal if fails)
        await update_skill_profile(req.user_id, req.language, score, conn)

        return ReviewResponse(
            id=review_id,
            score=score,
            improvement_score=improvement_score,
            summary=summary,
            improved_code=improved_code,
            issues=issue_objects,
            language=req.language,
            code=req.code,
            model_used=req.model_used,
            version=version,
        )
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.get("/reviews/{user_id}")
async def get_reviews(user_id: int):
    conn = _get_conn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, score, improvement_score, summary, language,
                   model_used, version, created_at, improved_code, code
            FROM reviews
            WHERE user_id = %s
            ORDER BY created_at DESC
            """,
            (user_id,),
        )
        rows = cursor.fetchall()
        reviews = []
        for row in rows:
            reviews.append(
                {
                    "id": row[0],
                    "score": row[1],
                    "improvement_score": row[2],
                    "summary": row[3],
                    "language": row[4],
                    "model_used": row[5],
                    "version": row[6],
                    "created_at": str(row[7]),
                    "improved_code": row[8],
                    "code": row[9],
                }
            )
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.get("/reviews/session/{session_id}")
async def get_session_reviews(session_id: int):
    conn = _get_conn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, score, improvement_score, summary, language,
                   model_used, version, created_at, improved_code, code
            FROM reviews
            WHERE session_id = %s
            ORDER BY created_at ASC
            """,
            (session_id,),
        )
        rows = cursor.fetchall()
        reviews = []
        for row in rows:
            review_id = row[0]
            cursor.execute(
                "SELECT type, description, is_fixed FROM review_issues WHERE review_id = %s",
                (review_id,),
            )
            issue_rows = cursor.fetchall()
            issues = [
                {"type": ir[0], "description": ir[1], "is_fixed": ir[2]}
                for ir in issue_rows
            ]
            reviews.append(
                {
                    "id": review_id,
                    "score": row[1],
                    "improvement_score": row[2],
                    "summary": row[3],
                    "language": row[4],
                    "model_used": row[5],
                    "version": row[6],
                    "created_at": str(row[7]),
                    "improved_code": row[8],
                    "code": row[9],
                    "issues": issues,
                }
            )
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Sessions
# ---------------------------------------------------------------------------

@router.post("/sessions", status_code=201)
async def create_session(data: SessionCreate):
    conn = _get_conn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO review_sessions (user_id, session_name, language)
            VALUES (%s, %s, %s)
            RETURNING id, user_id, session_name, language, created_at
            """,
            (data.user_id, f"{data.language} Review", data.language),
        )
        row = cursor.fetchone()
        conn.commit()
        return {
            "id": row[0],
            "user_id": row[1],
            "session_name": row[2],
            "language": row[3],
            "created_at": str(row[4]),
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# ---------------------------------------------------------------------------
# Annotations
# ---------------------------------------------------------------------------

@router.post("/annotations", status_code=201)
async def create_annotation(req: AnnotationRequest):
    conn = _get_conn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO annotations
                (review_id, user_id, selected_text, position_start,
                 position_end, chat_type)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, review_id, user_id, selected_text,
                      position_start, position_end, chat_type, created_at
            """,
            (
                req.review_id,
                req.user_id,
                req.selected_text,
                req.position_start,
                req.position_end,
                req.chat_type,
            ),
        )
        row = cursor.fetchone()
        conn.commit()
        return {
            "id": row[0],
            "review_id": row[1],
            "user_id": row[2],
            "selected_text": row[3],
            "position_start": row[4],
            "position_end": row[5],
            "chat_type": row[6],
            "created_at": str(row[7]),
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.post("/annotations/{annotation_id}/messages", status_code=201)
async def add_annotation_message(annotation_id: int, req: AnnotationMessageRequest):
    conn = _get_conn()
    try:
        cursor = conn.cursor()

        # Fetch annotation context
        cursor.execute(
            "SELECT selected_text FROM annotations WHERE id = %s",
            (annotation_id,),
        )
        ann_row = cursor.fetchone()
        if not ann_row:
            raise HTTPException(status_code=404, detail="Annotation not found")
        selected_text = ann_row[0]

        # Save user message
        cursor.execute(
            """
            INSERT INTO annotation_messages (annotation_id, user_id, role, content)
            VALUES (%s, %s, 'user', %s)
            RETURNING id, role, content, created_at
            """,
            (annotation_id, req.user_id, req.message),
        )
        user_msg = cursor.fetchone()

        # Get AI reply
        ai_text = await call_gemini_annotation(selected_text, req.message)

        # Save AI message
        cursor.execute(
            """
            INSERT INTO annotation_messages (annotation_id, user_id, role, content)
            VALUES (%s, %s, 'assistant', %s)
            RETURNING id, role, content, created_at
            """,
            (annotation_id, req.user_id, ai_text),
        )
        ai_msg = cursor.fetchone()

        conn.commit()
        return {
            "user_message": {
                "id": user_msg[0],
                "role": user_msg[1],
                "content": user_msg[2],
                "created_at": str(user_msg[3]),
            },
            "ai_message": {
                "id": ai_msg[0],
                "role": ai_msg[1],
                "content": ai_msg[2],
                "created_at": str(ai_msg[3]),
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.get("/annotations/{review_id}")
async def get_annotations(review_id: int):
    conn = _get_conn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, user_id, selected_text, position_start,
                   position_end, chat_type, created_at
            FROM annotations
            WHERE review_id = %s
            ORDER BY created_at ASC
            """,
            (review_id,),
        )
        ann_rows = cursor.fetchall()
        annotations = []
        for ann in ann_rows:
            ann_id = ann[0]
            cursor.execute(
                """
                SELECT id, role, content, created_at
                FROM annotation_messages
                WHERE annotation_id = %s
                ORDER BY created_at ASC
                """,
                (ann_id,),
            )
            messages = [
                {
                    "id": m[0],
                    "role": m[1],
                    "content": m[2],
                    "created_at": str(m[3]),
                }
                for m in cursor.fetchall()
            ]
            annotations.append(
                {
                    "id": ann_id,
                    "user_id": ann[1],
                    "selected_text": ann[2],
                    "position_start": ann[3],
                    "position_end": ann[4],
                    "chat_type": ann[5],
                    "created_at": str(ann[6]),
                    "messages": messages,
                }
            )
        return annotations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Skill Profile
# ---------------------------------------------------------------------------

@router.get("/profile/{user_id}")
async def get_profile(user_id: int):
    conn = _get_conn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, language, avg_score, total_reviews,
                   xp_points, skill_level, updated_at
            FROM skill_profiles
            WHERE user_id = %s
            """,
            (user_id,),
        )
        rows = cursor.fetchall()

        skills = []
        total_xp = 0
        all_scores = []

        for row in rows:
            skills.append(
                {
                    "id": row[0],
                    "language": row[1],
                    "avg_score": row[2],
                    "total_reviews": row[3],
                    "xp_points": row[4],
                    "skill_level": row[5],
                    "updated_at": str(row[6]),
                }
            )
            total_xp += row[4] or 0
            if row[2] is not None:
                all_scores.append(row[2])

        overall_avg = sum(all_scores) / len(all_scores) if all_scores else 0
        if overall_avg < 4:
            overall_level = "beginner"
        elif overall_avg < 6:
            overall_level = "intermediate"
        elif overall_avg < 8:
            overall_level = "advanced"
        else:
            overall_level = "expert"

        return {
            "user_id": user_id,
            "skills": skills,
            "total_xp": total_xp,
            "overall_level": overall_level,
            "overall_avg_score": round(overall_avg, 2),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------

@router.get("/dashboard/{user_id}")
async def get_dashboard(user_id: int):
    conn = _get_conn()
    try:
        cursor = conn.cursor()

        # Total reviews
        cursor.execute(
            "SELECT COUNT(*) FROM reviews WHERE user_id = %s",
            (user_id,),
        )
        total_reviews = cursor.fetchone()[0]

        # Average score
        cursor.execute(
            "SELECT AVG(score) FROM reviews WHERE user_id = %s",
            (user_id,),
        )
        avg_score_raw = cursor.fetchone()[0]
        avg_score = round(float(avg_score_raw), 2) if avg_score_raw else 0.0

        # Reviews this week
        cursor.execute(
            """
            SELECT COUNT(*) FROM reviews
            WHERE user_id = %s
              AND created_at >= NOW() - INTERVAL '7 days'
            """,
            (user_id,),
        )
        reviews_this_week = cursor.fetchone()[0]

        # Most used language
        cursor.execute(
            """
            SELECT language, COUNT(*) AS cnt
            FROM reviews
            WHERE user_id = %s
            GROUP BY language
            ORDER BY cnt DESC
            LIMIT 1
            """,
            (user_id,),
        )
        lang_row = cursor.fetchone()
        most_used_language = lang_row[0] if lang_row else None

        # Recent 5 reviews
        cursor.execute(
            """
            SELECT id, score, summary, language, model_used, version, created_at
            FROM reviews
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT 5
            """,
            (user_id,),
        )
        recent_reviews = [
            {
                "id": r[0],
                "score": r[1],
                "summary": r[2],
                "language": r[3],
                "model_used": r[4],
                "version": r[5],
                "created_at": str(r[6]),
            }
            for r in cursor.fetchall()
        ]

        # Current streak (consecutive days with at least one review)
        cursor.execute(
            """
            SELECT DISTINCT DATE(created_at) AS review_date
            FROM reviews
            WHERE user_id = %s
            ORDER BY review_date DESC
            """,
            (user_id,),
        )
        dates = [row[0] for row in cursor.fetchall()]

        streak = 0
        if dates:
            from datetime import date, timedelta

            today = date.today()
            expected = today
            for d in dates:
                if d == expected:
                    streak += 1
                    expected -= timedelta(days=1)
                else:
                    break

        return {
            "total_reviews": total_reviews,
            "avg_score": avg_score,
            "reviews_this_week": reviews_this_week,
            "most_used_language": most_used_language,
            "recent_reviews": recent_reviews,
            "current_streak": streak,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Contact & Suggestions
# ---------------------------------------------------------------------------

@router.post("/contact", status_code=201)
async def submit_contact(req: ContactRequest):
    conn = _get_conn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO contact_messages
                (user_id, name, email, subject, message)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (req.user_id, req.name, req.email, req.subject, req.message),
        )
        conn.commit()
        return {"message": "Contact message submitted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.post("/suggestions", status_code=201)
async def create_suggestion(req: SuggestionRequest):
    conn = _get_conn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO suggestions (user_id, title, description)
            VALUES (%s, %s, %s)
            RETURNING id, user_id, title, description, upvotes, created_at
            """,
            (req.user_id, req.title, req.description),
        )
        row = cursor.fetchone()
        conn.commit()
        return {
            "id": row[0],
            "user_id": row[1],
            "title": row[2],
            "description": row[3],
            "upvotes": row[4],
            "created_at": str(row[5]),
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.post("/suggestions/{suggestion_id}/vote", status_code=200)
async def vote_suggestion(suggestion_id: int, user_id: int):
    conn = _get_conn()
    try:
        cursor = conn.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO suggestion_votes (suggestion_id, user_id)
                VALUES (%s, %s)
                """,
                (suggestion_id, user_id),
            )
            conn.commit()
        except psycopg2.errors.UniqueViolation:
            conn.rollback()
            return {"message": "already voted"}

        # Increment upvotes
        cursor.execute(
            """
            UPDATE suggestions
            SET upvotes = upvotes + 1
            WHERE id = %s
            RETURNING upvotes
            """,
            (suggestion_id,),
        )
        updated = cursor.fetchone()
        conn.commit()
        return {"upvotes": updated[0]}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


@router.get("/suggestions")
async def get_suggestions():
    conn = _get_conn()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, user_id, title, description, upvotes, created_at
            FROM suggestions
            ORDER BY upvotes DESC
            """
        )
        rows = cursor.fetchall()
        return [
            {
                "id": r[0],
                "user_id": r[1],
                "title": r[2],
                "description": r[3],
                "upvotes": r[4],
                "created_at": str(r[5]),
            }
            for r in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@router.get("/health")
async def health_check():
    try:
        conn = _get_conn()
        conn.close()
        db_status = "connected"
    except Exception:
        db_status = "unreachable"
    return {"status": "ok", "database": db_status}
