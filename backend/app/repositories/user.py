from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.user import User


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self, q: str | None = None, limit: int = 50, offset: int = 0) -> list[User]:
        """
        List users with optional simple search and pagination.
        Search is performed over username and full_name.
        """
        query = self.db.query(User)

        if q:
            pattern = f"%{q}%"
            query = query.filter(
                or_(
                    User.username.ilike(pattern),
                    User.full_name.ilike(pattern),
                )
            )

        return (
            query.order_by(User.id.asc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def get_by_username(self, username: str) -> User | None:
        return self.db.query(User).filter(User.username == username).first()

    def any_user_exists(self) -> bool:
        return self.db.query(User).first() is not None

    def get(self, user_id: int) -> User | None:
        return self.db.get(User, user_id)

    def create(self, obj: User) -> User:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def save(self, obj: User) -> User:
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj


