"""
Seed script: 'delete_appeal' permissionunu Permissions cədvəlinə əlavə edir.
İstifadə: python seed_permissions.py (backend/ qovluğundan)
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine, text
from app.core.config import settings


DELETE_APPEAL_PERMISSION = {
    "code": "delete_appeal",
    "name": "Müraciəti sil",
    "description": "İstifadəçi müraciətlər siyahısında silmə əməliyyatı apara bilər (yalnız soft-delete)",
    "category": "appeals",
}


def seed():
    engine = create_engine(settings.database_url)
    with engine.connect() as conn:
        # Mövcud permission yoxla
        row = conn.execute(
            text("SELECT id FROM Permissions WHERE code = :code"),
            {"code": DELETE_APPEAL_PERMISSION["code"]},
        ).fetchone()

        if row:
            print(f"✅ '{DELETE_APPEAL_PERMISSION['code']}' permission artıq mövcuddur (id={row[0]}). Heç nə edilmədi.")
        else:
            conn.execute(
                text(
                    "INSERT INTO Permissions (code, name, description, category, is_active, created_at) "
                    "VALUES (:code, :name, :description, :category, 1, GETDATE())"
                ),
                DELETE_APPEAL_PERMISSION,
            )
            conn.commit()
            new_row = conn.execute(
                text("SELECT id FROM Permissions WHERE code = :code"),
                {"code": DELETE_APPEAL_PERMISSION["code"]},
            ).fetchone()
            print(f"✅ '{DELETE_APPEAL_PERMISSION['code']}' permission yaradıldı (id={new_row[0]}).")
            print("ℹ️  İndi admin paneldən istədiyin istifadəçiyə/rola bu permission-u əlavə edə bilərsən.")


if __name__ == "__main__":
    try:
        seed()
    except Exception as e:
        print(f"❌ Xəta: {e}")
        sys.exit(1)
