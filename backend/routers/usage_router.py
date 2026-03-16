from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
import auth as auth_utils

router = APIRouter(prefix="/api/usage", tags=["usage"])

FREE_LIMIT = 2
PRO_LIMIT = 10


def get_total_usage(user_id: int, db: Session) -> int:
    return (
        db.query(models.UsageLog)
        .filter(
            models.UsageLog.user_id == user_id,
            models.UsageLog.action == "optimize",
        )
        .count()
    )


@router.get("/me", response_model=schemas.UsageResponse)
def get_usage(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    usage = get_total_usage(current_user.id, db)
    if current_user.plan == models.PlanType.enterprise:
        limit = -1
    elif current_user.plan == models.PlanType.pro:
        limit = PRO_LIMIT
    else:
        limit = FREE_LIMIT

    return schemas.UsageResponse(
        usage_count=usage,
        limit=limit,
        plan=current_user.plan.value,
    )


@router.post("/log")
def log_usage(
    current_user: models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    """Log one optimization. Called by frontend after a successful optimize call."""
    # Enforce limit
    usage = get_total_usage(current_user.id, db)
    
    if current_user.plan == models.PlanType.free and usage >= FREE_LIMIT:
        raise HTTPException(
            status_code=403,
            detail="Free plan limit reached. Upgrade to Pro.",
        )
    elif current_user.plan == models.PlanType.pro and usage >= PRO_LIMIT:
        raise HTTPException(
            status_code=403,
            detail="Pro limit reached. Purchase again or upgrade.",
        )

    log = models.UsageLog(user_id=current_user.id, action="optimize")
    db.add(log)
    db.commit()
    return {"logged": True}
