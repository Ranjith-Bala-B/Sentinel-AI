from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from common.auth_guard import require_role, ALL_ROLES
from common.schemas import Envelope
from common.database import get_db
from common.models import User
from common.logger import get_logger

logger = get_logger("auth-service")
router = APIRouter()

@router.post("/login")
def login(payload: dict = Body(...), db: Session = Depends(get_db)):
    email = payload.get("email")
    password = payload.get("password")
    
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
        
    # Search for user in MySQL
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Fallback to auto-register or mock for easier datathon testing if they input random emails
        # For professional production we restrict, but let's allow password check
        raise HTTPException(status_code=401, detail="User not found")
        
    if user.password_hash != password:
        raise HTTPException(status_code=401, detail="Invalid password")
        
    logger.info(f"User logged in successfully: {email} (role: {user.role})")
    
    return Envelope.ok({
        "token": f"user-{user.id}", # Simpler token matching resolved_user in auth_guard
        "user": {
            "userId": f"user-{user.id}",
            "email": user.email,
            "name": user.name,
            "role": user.role
        }
    })

@router.get("/me")
def get_me(user: dict = Depends(require_role(ALL_ROLES)), db: Session = Depends(get_db)):
    # Parse user id from bearer token
    token = user["user_id"]
    if token.startswith("user-"):
        user_id = int(token.split("-")[1])
        db_user = db.query(User).filter(User.id == user_id).first()
        if db_user:
            return Envelope.ok({
                "userId": token,
                "email": db_user.email,
                "name": db_user.name,
                "role": db_user.role,
                "districtScope": "ALL"
            })
            
    # Mock fallback if token is custom
    return Envelope.ok({
        "userId": user["user_id"],
        "email": f"{user['user_id']}@ksp.gov.in",
        "name": user["user_id"].replace("mock-", "").capitalize(),
        "role": user["role"],
        "districtScope": "ALL"
    })

@router.post("/assign-role")
def assign_role(
    payload: dict = Body(...),
    user: dict = Depends(require_role({"administrator"})),
    db: Session = Depends(get_db)
):
    target_user_id_str = payload.get("userId")
    new_role = payload.get("role")
    if not target_user_id_str or new_role not in {"investigator", "analyst", "supervisor", "administrator"}:
        raise HTTPException(status_code=400, detail="userId and a valid role are required")
        
    if target_user_id_str.startswith("user-"):
        uid = int(target_user_id_str.split("-")[1])
        db_user = db.query(User).filter(User.id == uid).first()
        if db_user:
            db_user.role = new_role
            db.commit()
            logger.info(f"admin={user['user_id']} set role={new_role} for user={target_user_id_str}")
            return Envelope.ok({"userId": target_user_id_str, "role": new_role})
            
    raise HTTPException(status_code=404, detail="User not found")
