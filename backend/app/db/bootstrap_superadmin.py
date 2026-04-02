"""
Startup: env-də verilmiş superadmin istifadəçisini hər dəfə sinxronlaşdırır (yaradır və ya yeniləyir).

DB-də başqa superadmin olsa belə, BOOTSTRAP_SUPERADMIN_USERNAME üçün şifrə və bayraqlar env-ə uyğun yenilənir.

Parol: BOOTSTRAP_SUPERADMIN_PASSWORD; boşdursa BOOTSTRAP_ADMIN_PASSWORD (fallback).

MSSQL-də şifrələr SHA-256 hex formatında saxlanır (AuthService ilə eyni).
"""
from __future__ import annotations

import hashlib
import logging

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.user import User

logger = logging.getLogger(__name__)


def run_bootstrap_superadmin() -> None:
    if not settings.bootstrap_superadmin_enabled:
        return

    username = (settings.bootstrap_superadmin_username or "superadmin").strip()
    if not username:
        return

    password_plain = settings.bootstrap_superadmin_password or settings.bootstrap_admin_password
    if not password_plain:
        logger.warning(
            "BOOTSTRAP_SUPERADMIN_PASSWORD / BOOTSTRAP_ADMIN_PASSWORD boşdur — env superadmin sinxronu atlanır."
        )
        return

    db = SessionLocal()
    try:
        hashed = hashlib.sha256(password_plain.encode("utf-8")).hexdigest()
        sn = settings.bootstrap_superadmin_surname or "Super"
        nm = settings.bootstrap_superadmin_name or "Admin"

        existing = db.query(User).filter(User.username == username).first()

        if existing:
            existing.is_super_admin = True
            existing.is_admin = True
            existing.is_deleted = False
            existing.password = hashed
            db.commit()
            logger.info("Env superadmin yeniləndi (şifrə + admin bayraqları): %s", username)
            return

        db.add(
            User(
                username=username,
                password=hashed,
                surname=sn,
                name=nm,
                is_admin=True,
                is_super_admin=True,
                is_deleted=False,
            )
        )
        db.commit()
        logger.info("Env superadmin yaradıldı: %s", username)
    except Exception as e:
        logger.warning("Bootstrap superadmin alınmadı (DB və ya sxema): %s", e)
        try:
            db.rollback()
        except Exception:
            pass
    finally:
        db.close()
