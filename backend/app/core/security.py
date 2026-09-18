import secrets
from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader, HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

api_key_header = APIKeyHeader(name="X-Admin-Key", auto_error=False)
bearer_scheme = HTTPBearer(auto_error=False)

def verify_admin_auth(
    api_key: str = Security(api_key_header),
    bearer: HTTPAuthorizationCredentials = Security(bearer_scheme)
) -> bool:
    """
    Constant-time authentication for Decoupled Admin endpoints.
    Accepts either X-Admin-Key header or Bearer token matching ADMIN_API_KEY.
    """
    token_to_verify = None
    if api_key:
        token_to_verify = api_key
    elif bearer and bearer.credentials:
        token_to_verify = bearer.credentials
        
    if not token_to_verify or not secrets.compare_digest(token_to_verify, settings.ADMIN_API_KEY):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized admin access: Invalid or missing administrator credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return True
