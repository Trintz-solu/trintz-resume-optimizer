from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import resume_router

load_dotenv()

from sqlalchemy.orm import Session
import models
import auth as auth_utils
from database import engine, get_db
from routers import auth_router, usage_router, billing_router
import os


# Create all DB tables (new tables only)
models.Base.metadata.create_all(bind=engine)


def safe_migrate():
    """
    SQLite does not support ALTER TABLE ADD COLUMN IF NOT EXISTS.
    This helper adds any missing columns declared in models but absent in DB.
    Runs on every startup — safe to call repeatedly.
    """
    import sqlite3
    db_url = os.getenv("DATABASE_URL", "sqlite:///./resume_genius.db")
    if "sqlite" not in db_url:
        return  # Only needed for SQLite; Postgres handles migrations differently

    db_path = db_url.replace("sqlite:///", "").replace("./", "")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Map: table → [(column_name, column_def)]
    migrations = {
        "users": [
            ("razorpay_payment_id", "VARCHAR(255)"),
            ("razorpay_order_id",   "VARCHAR(255)"),
            ("email_verified",      "BOOLEAN DEFAULT 0"),
            ("verification_token",  "VARCHAR(255)"),
            ("verification_token_expires", "DATETIME"),
            ("reset_token",         "VARCHAR(255)"),
            ("reset_token_expires", "DATETIME"),
        ]
    }

    for table, columns in migrations.items():
        cur.execute(f"PRAGMA table_info({table})")
        existing = {row[1] for row in cur.fetchall()}
        for col_name, col_type in columns:
            if col_name not in existing:
                cur.execute(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}")
                print(f"[migrate] Added column: {table}.{col_name}")

    conn.commit()
    conn.close()


safe_migrate()

app = FastAPI(title="AI Resume Optimizer API", version="1.0.0")

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:5173",
        os.getenv("FRONTEND_URL", "http://localhost:8080"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth_router.router)
app.include_router(usage_router.router)
app.include_router(billing_router.router)
app.include_router(resume_router.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


# ─── Protected /optimize endpoint ────────────────────────────────────────────
# This proxies to your AI backend OR handles optimization logic directly.
# For now it calls the external optimizer, but first checks auth + usage gate.

import httpx

AI_BACKEND_URL = os.getenv("AI_BACKEND_URL", "http://localhost:8001")


@app.post("/api/optimize")
async def optimize_resume_protected(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    from routers.usage_router import get_total_usage, FREE_LIMIT, PRO_LIMIT

    usage_count = get_total_usage(current_user.id, db)

    # Enforce limit
    if current_user.plan == models.PlanType.free and usage_count >= FREE_LIMIT:
        raise HTTPException(
            status_code=403,
            detail="Free plan limit reached. Upgrade to Pro.",
        )
    elif current_user.plan == models.PlanType.pro and usage_count >= PRO_LIMIT:
        raise HTTPException(
            status_code=403,
            detail="Pro limit reached. Purchase again or upgrade.",
        )

    # Forward to AI processing logic
    from routers.resume_router import process_resume_optimization
    
    file_bytes = await resume.read()
    try:
        result = await process_resume_optimization(file_bytes, resume.filename, job_description)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # Log usage
    log = models.UsageLog(user_id=current_user.id, action="optimize")
    db.add(log)
    db.commit()

    from fastapi.responses import JSONResponse
    return JSONResponse(result)
