"""Role-based access dependencies for FastAPI."""
from fastapi import Request, HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from common.logger import get_logger
from common.database import SessionLocal
from common.models import User

logger = get_logger("auth_guard")
security = HTTPBearer(auto_error=False)

ALL_ROLES = {"investigator", "analyst", "supervisor", "administrator"}

def resolve_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    if not credentials:
        logger.info("Rejected unauthenticated request")
        raise HTTPException(status_code=401, detail="Authentication required")
        
    token = credentials.credentials
    
    # Real database lookup if the token starts with 'user-'
    if token.startswith("user-"):
        try:
            user_id = int(token.split("-")[1])
            db = SessionLocal()
            db_user = db.query(User).filter(User.id == user_id).first()
            if db_user:
                user_info = {"user_id": token, "role": db_user.role, "email": db_user.email}
                db.close()
                return user_info
            db.close()
        except Exception as e:
            logger.error(f"Error in database user lookup: {e}")
            
    # Mock fallback for standalone frontend development
    role = "investigator"
    if "admin" in token:
        role = "administrator"
    elif "supervisor" in token:
        role = "supervisor"
    elif "analyst" in token:
        role = "analyst"
        
    return {"user_id": token, "role": role}

def require_role(allowed_roles: set[str] = ALL_ROLES):
    def role_checker(user: dict = Depends(resolve_user)):
        if user["role"] not in allowed_roles:
            logger.info(f"Rejected role={user['role']} - requires one of {allowed_roles}")
            raise HTTPException(status_code=403, detail="Insufficient role for this resource")
        return user
    return role_checker
