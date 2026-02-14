from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel

from app.api.deps import get_auth_service
from app.schemas.user import TokenOut
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login", response_model=TokenOut)
async def login(
    request: Request,
    auth_service: AuthService = Depends(get_auth_service),
):
    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        body = await request.json()
        username = body.get("username")
        password = body.get("password")
        if not username or not password:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="username and password required")
    else:
        form_data = await request.form()
        username = form_data.get("username")
        password = form_data.get("password")
        if not username or not password:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="username and password required")

    token = auth_service.login(username, password)
    return TokenOut(access_token=token)
