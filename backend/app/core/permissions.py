from fastapi import Depends, HTTPException, status
from app.core.auth import get_current_user

async def require_owner(current_user = Depends(get_current_user)):
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted, requires owner role."
        )
    return current_user

async def require_finance_or_owner(current_user = Depends(get_current_user)):
    if current_user.role not in ["owner", "finance_manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted, requires finance or owner role."
        )
    return current_user

async def viewer_or_above(current_user = Depends(get_current_user)):
    # Any authenticated user
    return current_user
