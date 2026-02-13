from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.role import Role


class RoleRepository:
    def __init__(self, db: Session):
        self.db = db

    def list(self) -> list[Role]:
        """Get all roles"""
        return self.db.query(Role).all()

    def get(self, role_id: int) -> Role | None:
        """Get role by ID"""
        return self.db.query(Role).filter(Role.id == role_id).first()

    def get_by_name(self, name: str) -> Role | None:
        """Get role by name"""
        return self.db.query(Role).filter(Role.name == name).first()

    def create(self, role: Role) -> Role:
        """Create new role"""
        self.db.add(role)
        self.db.commit()
        self.db.refresh(role)
        return role

    def save(self, role: Role) -> Role:
        """Save changes to existing role"""
        self.db.commit()
        self.db.refresh(role)
        return role

    def delete(self, role_id: int) -> bool:
        """Delete role by ID"""
        role = self.get(role_id)
        if not role:
            return False
        
        if role.is_system:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete system role"
            )
        
        self.db.delete(role)
        self.db.commit()
        return True
