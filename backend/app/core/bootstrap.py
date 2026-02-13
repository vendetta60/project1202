from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User


def bootstrap_admin(db: Session) -> None:
    """
    If there are no users, optionally create an initial admin from env settings.
    This is meant for first local run / dev. Disable by leaving vars unset.
    """
    any_user = db.query(User).first()
    if any_user:
        return

    if not settings.bootstrap_admin_username or not settings.bootstrap_admin_password:
        return

    admin = User(
        username=settings.bootstrap_admin_username,
        full_name=settings.bootstrap_admin_full_name,
        password_hash=hash_password(settings.bootstrap_admin_password),
        is_admin=True,
        is_active=True,
    )
    db.add(admin)
    db.commit()

