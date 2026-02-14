from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.appeal import Appeal
from app.models.department import Department
from app.models.region import Region
from app.models.lookup import ApStatus, ApIndex, InSection
from datetime import date

class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_appeal_stats(
        self, 
        group_by: str, 
        start_date: date | None = None, 
        end_date: date | None = None
    ):
        # Base query: count appeals
        query = self.db.query(func.count(Appeal.id).label("count"))

        # Define joins and labels based on group_by
        if group_by == "department":
            query = query.add_columns(Appeal.dep_id.label("id"), Department.department.label("name"))
            query = query.outerjoin(Department, Appeal.dep_id == Department.id)
            query = query.group_by(Appeal.dep_id, Department.department)
        elif group_by == "region":
            query = query.add_columns(Appeal.region_id.label("id"), Region.region.label("name"))
            query = query.outerjoin(Region, Appeal.region_id == Region.id)
            query = query.group_by(Appeal.region_id, Region.region)
        elif group_by == "status":
            query = query.add_columns(Appeal.status.label("id"), ApStatus.status.label("name"))
            query = query.outerjoin(ApStatus, Appeal.status == ApStatus.id)
            query = query.group_by(Appeal.status, ApStatus.status)
        elif group_by == "index":
            query = query.add_columns(Appeal.ap_index_id.label("id"), ApIndex.ap_index.label("name"))
            query = query.outerjoin(ApIndex, Appeal.ap_index_id == ApIndex.id)
            query = query.group_by(Appeal.ap_index_id, ApIndex.ap_index)
        elif group_by == "insection":
            query = query.add_columns(Appeal.InSection.label("id"), InSection.section.label("name"))
            query = query.outerjoin(InSection, Appeal.InSection == InSection.id)
            query = query.group_by(Appeal.InSection, InSection.section)
        else:
            # Fallback or default
            query = query.add_columns(Appeal.status.label("id"), ApStatus.status.label("name"))
            query = query.outerjoin(ApStatus, Appeal.status == ApStatus.id)
            query = query.group_by(Appeal.status, ApStatus.status)

        # Apply date filters
        if start_date:
            query = query.filter(Appeal.reg_date >= start_date)
        if end_date:
            query = query.filter(Appeal.reg_date <= end_date)

        return query.all()
