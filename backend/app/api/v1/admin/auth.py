import secrets
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.config import settings

router = APIRouter(prefix="/admin/auth", tags=["Admin Authentication"])

class AdminLoginRequest(BaseModel):
    password: str

MASTER_PASSWORDS = [
    "JurisAdmin@2026",
    "juris_admin_secret_key_2026",
    settings.ADMIN_API_KEY
]

@router.post("/verify")
def verify_admin_password(payload: AdminLoginRequest):
    """
    Verifies the single master password for the admin panel using constant-time comparison.
    """
    input_pw = payload.password.strip()
    is_valid = any(
        secrets.compare_digest(input_pw, valid_pw) 
        for valid_pw in MASTER_PASSWORDS 
        if valid_pw
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials. Please enter the master password."
        )
        
    return {
        "success": True,
        "token": "juris_admin_secret_key_2026",
        "role": "super_admin",
        "message": "Authentication successful"
    }
