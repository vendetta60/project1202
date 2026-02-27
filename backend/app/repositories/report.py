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
        end_date: date | None = None,
        user_section_id: int | None = None
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

        # Apply filters
        # In some legacy DBs, is_deleted might be NULL instead of False. Handle both.
        query = query.filter(or_(Appeal.is_deleted == False, Appeal.is_deleted == None))
        
        if user_section_id is not None:
            query = query.filter(Appeal.user_section_id == user_section_id)
        if start_date:
            query = query.filter(Appeal.reg_date >= start_date)
        if end_date:
            query = query.filter(Appeal.reg_date <= end_date)

        return query.all()

    def get_forma_4_data(self, start_date: date | None = None, end_date: date | None = None, user_section_id: int | None = None):
        from sqlalchemy.orm import joinedload
        from sqlalchemy import cast, Date, or_
        from app.models.executor import Executor
        
        # In some legacy DBs, is_deleted might be NULL instead of False. Handle both.
        from datetime import datetime, time
        
        # In some legacy DBs, is_deleted might be NULL instead of False. Handle both.
        query = self.db.query(Appeal).filter(or_(Appeal.is_deleted == False, Appeal.is_deleted == None))
        
        # Apply filters
        if user_section_id is not None:
            query = query.filter(Appeal.user_section_id == user_section_id)
        if start_date:
            start_dt = datetime.combine(start_date, datetime.min.time())
            query = query.filter(Appeal.reg_date >= start_dt)
        if end_date:
            end_dt = datetime.combine(end_date, time.max)
            query = query.filter(Appeal.reg_date <= end_dt)
            
        # Eager load everything needed for the 18 columns
        query = query.options(
            joinedload(Appeal.executors).joinedload(Executor.executor_list),
            joinedload(Appeal.executors).joinedload(Executor.direction),
            joinedload(Appeal.contacts),
            joinedload(Appeal.department),
            joinedload(Appeal.ap_index_rel),
            joinedload(Appeal.account_index_rel),
            joinedload(Appeal.content_type_rel),
            joinedload(Appeal.status_rel),
            joinedload(Appeal.instruction_rel),
            joinedload(Appeal.control_rel),
            joinedload(Appeal.region_rel)
        )
        
        # When using joinedload with collections, deduplication is handled by Query.all() 
        # for standard relationships. For older SQLAlchemy versions or specific join patterns,
        # we return the list. unique() is the 2.0 style for Result objects, not Query.
        return query.all()
