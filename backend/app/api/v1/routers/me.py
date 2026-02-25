import hashlib

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import UserOut
from pydantic import BaseModel

router = APIRouter(prefix="/me", tags=["me"])


class ChangePasswordBody(BaseModel):
    current_password: str
    new_password: str


@router.get("", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    # Build response manually so we can inject computed permissions
    data = UserOut.model_validate(current_user)
    data.permissions = current_user.permissions
    return data


@router.post("/change-password")
def change_password(
    body: ChangePasswordBody,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """İstifadəçi öz parolunu sıfırlaya bilər."""
    hashed_current = hashlib.sha256(body.current_password.encode("utf-8")).hexdigest()
    if current_user.password != hashed_current:
        raise HTTPException(status_code=400, detail="Cari şifrə düzgün deyil")
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="Yeni şifrə ən azı 6 simvol olmalıdır")
    new_hashed = hashlib.sha256(body.new_password.encode("utf-8")).hexdigest()
    repo = UserRepository(db)
    user = repo.get(current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="İstifadəçi tapılmadı")
    user.password = new_hashed
    repo.save(user)
    return {"message": "Şifrə uğurla dəyişdirildi"}
