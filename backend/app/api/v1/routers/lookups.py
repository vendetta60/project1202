"""
Single router for ALL lookup/reference data tables.
Each endpoint returns the full list (active records only where applicable).
"""
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_lookup_repo
from app.repositories.lookup import LookupRepository
from app.models.lookup import (
    AccountIndex, ApIndex, ApStatus, ContentType,
    ChiefInstruction, InSection, Section, UserSection,
    WhoControl, Movzu, Holiday
)
from app.models.department import Department, DepOfficial
from app.models.region import Region
from app.models.organ import Organ
from app.models.executor import Direction, ExecutorList
from app.schemas.lookup import (
    AccountIndexOut, ApIndexOut, ApStatusOut, ContentTypeOut,
    ChiefInstructionOut, InSectionOut, SectionOut, UserSectionOut,
    WhoControlOut, DepartmentOut, DepOfficialOut, RegionOut,
    OrganOut, DirectionOut, ExecutorListOut, MovzuOut,
    DepartmentCreate, DepartmentUpdate, RegionCreate, RegionUpdate,
    DepOfficialCreate, DepOfficialUpdate, ChiefInstructionCreate, ChiefInstructionUpdate,
    InSectionCreate, InSectionUpdate, WhoControlCreate, WhoControlUpdate,
    ApStatusCreate, ApStatusUpdate, ApIndexCreate, ApIndexUpdate,
    ContentTypeCreate, ContentTypeUpdate, AccountIndexCreate, AccountIndexUpdate,
    ExecutorListCreate, ExecutorListUpdate, UserSectionCreate, UserSectionUpdate,
    HolidayOut, HolidayCreate, HolidayUpdate,
)
from app.models.user import User
from app.models.appeal import Appeal

router = APIRouter(prefix="/lookups", tags=["lookups"])


@router.get("/account-indexes", response_model=list[AccountIndexOut])
def get_account_indexes(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(AccountIndex)


@router.get("/ap-indexes", response_model=list[ApIndexOut])
def get_ap_indexes(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(ApIndex)


@router.get("/ap-statuses", response_model=list[ApStatusOut])
def get_ap_statuses(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(ApStatus)


@router.get("/content-types", response_model=list[ContentTypeOut])
def get_content_types(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(ContentType)


@router.get("/chief-instructions", response_model=list[ChiefInstructionOut])
def get_chief_instructions(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(ChiefInstruction)


@router.get("/chief-instructions/by-section/{section_id}", response_model=list[ChiefInstructionOut])
def get_chief_instructions_by_section(section_id: int, repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.get_by_field(ChiefInstruction, "section_id", section_id)


@router.get("/in-sections", response_model=list[InSectionOut])
def get_in_sections(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(InSection)


@router.get("/sections", response_model=list[SectionOut])
def get_sections(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(Section)


@router.get("/user-sections", response_model=list[UserSectionOut])
def get_user_sections(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(UserSection, active_only=False)


@router.get("/who-controls", response_model=list[WhoControlOut])
def get_who_controls(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(WhoControl)


@router.get("/departments", response_model=list[DepartmentOut])
def get_departments(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(Department)


@router.get("/dep-officials", response_model=list[DepOfficialOut])
def get_dep_officials(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(DepOfficial)


@router.get("/dep-officials/by-dep/{dep_id}", response_model=list[DepOfficialOut])
def get_dep_officials_by_dep(dep_id: int, repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.get_by_field(DepOfficial, "dep_id", dep_id)


@router.get("/regions", response_model=list[RegionOut])
def get_regions(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(Region)


@router.get("/organs", response_model=list[OrganOut])
def get_organs(repo: LookupRepository = Depends(get_lookup_repo)):
    items = repo.list_all(Organ, active_only=False)
    return [i for i in items if not i.isDeleted]


@router.get("/directions", response_model=list[DirectionOut])
def get_directions(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(Direction)


@router.get("/directions/by-section/{section_id}", response_model=list[DirectionOut])
def get_directions_by_section(section_id: int, repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.get_by_field(Direction, "section_id", section_id)


@router.get("/executor-list", response_model=list[ExecutorListOut])
def get_executor_list(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(ExecutorList)


@router.get("/executor-list/by-direction/{direction_id}", response_model=list[ExecutorListOut])
def get_executor_list_by_direction(direction_id: int, repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.get_by_field(ExecutorList, "direction_id", direction_id)


@router.get("/movzular", response_model=list[MovzuOut])
def get_movzular(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(Movzu, active_only=False)


# ============ CREATE/UPDATE/DELETE ENDPOINTS ============

# ===== Departments =====
@router.post("/departments", response_model=DepartmentOut)
def create_department(data: DepartmentCreate, repo: LookupRepository = Depends(get_lookup_repo)):
    dept = Department(department=data.department, sign=data.sign)
    return repo.create(dept)


@router.put("/departments/{dept_id}", response_model=DepartmentOut)
def update_department(dept_id: int, data: DepartmentUpdate, repo: LookupRepository = Depends(get_lookup_repo)):
    dept = repo.get(Department, dept_id)
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    if data.department:
        dept.department = data.department
    if data.sign is not None:
        dept.sign = data.sign
    return repo.update(dept)


@router.delete("/departments/{dept_id}")
def delete_department(dept_id: int, repo: LookupRepository = Depends(get_lookup_repo)):
    raise HTTPException(
        status_code=403,
        detail="İdarələr silinə bilməz. Bu məlumatlar sistem tərəfindən qorunur."
    )


# ===== Regions =====
@router.post("/regions", response_model=RegionOut)
def create_region(data: RegionCreate, repo: LookupRepository = Depends(get_lookup_repo)):
    region = Region(region=data.region)
    return repo.create(region)


@router.put("/regions/{region_id}", response_model=RegionOut)
def update_region(region_id: int, data: RegionUpdate, repo: LookupRepository = Depends(get_lookup_repo)):
    region = repo.get(Region, region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    if data.region:
        region.region = data.region
    return repo.update(region)


@router.delete("/regions/{region_id}")
def delete_region(region_id: int, repo: LookupRepository = Depends(get_lookup_repo)):
    raise HTTPException(
        status_code=403,
        detail="Regionlar silinə bilməz. Bu məlumatlar sistem tərəfindən qorunur."
    )


# ===== DepOfficials =====
@router.post("/dep-officials", response_model=DepOfficialOut)
def create_dep_official(data: DepOfficialCreate, repo: LookupRepository = Depends(get_lookup_repo)):
    official = DepOfficial(dep_id=data.dep_id, official=data.official)
    return repo.create(official)


@router.put("/dep-officials/{official_id}", response_model=DepOfficialOut)
def update_dep_official(official_id: int, data: DepOfficialUpdate, repo: LookupRepository = Depends(get_lookup_repo)):
    official = repo.get(DepOfficial, official_id)
    if not official:
        raise HTTPException(status_code=404, detail="Official not found")
    if data.official:
        official.official = data.official
    if data.dep_id is not None:
        official.dep_id = data.dep_id
    return repo.update(official)


@router.delete("/dep-officials/{official_id}")
def delete_dep_official(official_id: int, repo: LookupRepository = Depends(get_lookup_repo)):
    success = repo.delete(DepOfficial, official_id)
    if not success:
        raise HTTPException(status_code=404, detail="Official not found")
    return {"success": True}


# ===== ChiefInstructions =====
@router.post("/chief-instructions", response_model=ChiefInstructionOut)
def create_chief_instruction(data: ChiefInstructionCreate, repo: LookupRepository = Depends(get_lookup_repo)):
    instruction = ChiefInstruction(instructions=data.instructions, section_id=data.section_id)
    return repo.create(instruction)


@router.put("/chief-instructions/{instruction_id}", response_model=ChiefInstructionOut)
def update_chief_instruction(instruction_id: int, data: ChiefInstructionUpdate, repo: LookupRepository = Depends(get_lookup_repo)):
    instruction = repo.get(ChiefInstruction, instruction_id)
    if not instruction:
        raise HTTPException(status_code=404, detail="Instruction not found")
    if data.instructions:
        instruction.instructions = data.instructions
    if data.section_id is not None:
        instruction.section_id = data.section_id
    return repo.update(instruction)


@router.delete("/chief-instructions/{instruction_id}")
def delete_chief_instruction(instruction_id: int, repo: LookupRepository = Depends(get_lookup_repo)):
    raise HTTPException(
        status_code=403,
        detail="Rəhbər göstərişləri silinə bilməz. Bu məlumatlar sistem tərəfindən qorunur."
    )


# ===== InSections =====
@router.post("/in-sections", response_model=InSectionOut)
def create_in_section(data: InSectionCreate, repo: LookupRepository = Depends(get_lookup_repo)):
    section = InSection(section=data.section)
    return repo.create(section)


@router.put("/in-sections/{section_id}", response_model=InSectionOut)
def update_in_section(section_id: int, data: InSectionUpdate, repo: LookupRepository = Depends(get_lookup_repo)):
    section = repo.get(InSection, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    if data.section:
        section.section = data.section
    return repo.update(section)


@router.delete("/in-sections/{section_id}")
def delete_in_section(section_id: int, repo: LookupRepository = Depends(get_lookup_repo)):
    raise HTTPException(
        status_code=403,
        detail="Daxili şöbələr silinə bilməz. Bu məlumatlar sistem tərəfindən qorunur."
    )


# ===== WhoControls =====
@router.post("/who-controls", response_model=WhoControlOut)
def create_who_control(data: WhoControlCreate, repo: LookupRepository = Depends(get_lookup_repo)):
    who_control = WhoControl(chief=data.chief, section_id=data.section_id)
    return repo.create(who_control)


@router.put("/who-controls/{who_control_id}", response_model=WhoControlOut)
def update_who_control(who_control_id: int, data: WhoControlUpdate, repo: LookupRepository = Depends(get_lookup_repo)):
    who_control = repo.get(WhoControl, who_control_id)
    if not who_control:
        raise HTTPException(status_code=404, detail="Who control not found")
    if data.chief:
        who_control.chief = data.chief
    if data.section_id is not None:
        who_control.section_id = data.section_id
    return repo.update(who_control)


@router.delete("/who-controls/{who_control_id}")
def delete_who_control(who_control_id: int, repo: LookupRepository = Depends(get_lookup_repo)):
    raise HTTPException(
        status_code=403,
        detail="Nəzarətçilər silinə bilməz. Bu məlumatlar sistem tərəfindən qorunur."
    )


# ===== ApStatuses =====
@router.post("/ap-statuses", response_model=ApStatusOut)
def create_ap_status(data: ApStatusCreate, repo: LookupRepository = Depends(get_lookup_repo)):
    status = ApStatus(status=data.status)
    return repo.create(status)


@router.put("/ap-statuses/{status_id}", response_model=ApStatusOut)
def update_ap_status(status_id: int, data: ApStatusUpdate, repo: LookupRepository = Depends(get_lookup_repo)):
    status = repo.get(ApStatus, status_id)
    if not status:
        raise HTTPException(status_code=404, detail="Status not found")
    if data.status:
        status.status = data.status
    return repo.update(status)


@router.delete("/ap-statuses/{status_id}")
def delete_ap_status(status_id: int, repo: LookupRepository = Depends(get_lookup_repo)):
    raise HTTPException(
        status_code=403,
        detail="Statuslar silinə bilməz. Bu məlumatlar sistem tərəfindən qorunur."
    )


# ===== ExecutorList =====
@router.post("/executor-list", response_model=ExecutorListOut)
def create_executor(data: ExecutorListCreate, repo: LookupRepository = Depends(get_lookup_repo)):
    executor = ExecutorList(direction_id=data.direction_id, executor=data.executor)
    return repo.create(executor)


@router.put("/executor-list/{executor_id}", response_model=ExecutorListOut)
def update_executor(executor_id: int, data: ExecutorListUpdate, repo: LookupRepository = Depends(get_lookup_repo)):
    executor = repo.get(ExecutorList, executor_id)
    if not executor:
        raise HTTPException(status_code=404, detail="Executor not found")
    if data.executor:
        executor.executor = data.executor
    if data.direction_id is not None:
        executor.direction_id = data.direction_id
    return repo.update(executor)


@router.delete("/executor-list/{executor_id}")
def delete_executor(executor_id: int, repo: LookupRepository = Depends(get_lookup_repo)):
    success = repo.delete(ExecutorList, executor_id)
    if not success:
        raise HTTPException(status_code=404, detail="Executor not found")
    return {"success": True}


# ===== UserSections =====
@router.post("/user-sections", response_model=UserSectionOut)
def create_user_section(data: UserSectionCreate, repo: LookupRepository = Depends(get_lookup_repo)):
    section = UserSection(user_section=data.user_section, section_index=data.section_index)
    return repo.create(section)


@router.put("/user-sections/{section_id}", response_model=UserSectionOut)
def update_user_section(section_id: int, data: UserSectionUpdate, repo: LookupRepository = Depends(get_lookup_repo)):
    section = repo.get(UserSection, section_id)
    if not section:
        raise HTTPException(status_code=404, detail="User section not found")
    
    if data.section_index is not None and data.section_index != section.section_index:
        # Check if any appeals are in this section
        appeal_count = repo.db.query(Appeal).filter(Appeal.user_section_id == section_id, Appeal.is_deleted == False).count()
        if appeal_count > 0:
            raise HTTPException(
                status_code=400, 
                detail="Bu bölməyə aid müraciətlər var. İndeksi (Sıra) dəyişmək mümkün deyil."
            )

    if data.user_section is not None:
        section.user_section = data.user_section
    if data.section_index is not None:
        section.section_index = data.section_index
    return repo.update(section)


@router.delete("/user-sections/{section_id}")
def delete_user_section(section_id: int, repo: LookupRepository = Depends(get_lookup_repo)):
    # Check if any users are in this section
    user_count = repo.db.query(User).filter(User.section_id == section_id, User.is_deleted == False).count()
    if user_count > 0:
        raise HTTPException(
            status_code=400, 
            detail="Bu bölmədə aktiv istifadəçilər var. Silmək mümkün deyil."
        )
    
    # Check if any appeals are in this section
    appeal_count = repo.db.query(Appeal).filter(Appeal.user_section_id == section_id, Appeal.is_deleted == False).count()
    if appeal_count > 0:
        raise HTTPException(
            status_code=400, 
            detail="Bu bölməyə aid müraciətlər var. Silmək mümkün deyil."
        )

    success = repo.delete(UserSection, section_id)
    if not success:
        raise HTTPException(status_code=404, detail="User section not found")
    return {"success": True}


# ===== Holidays =====
@router.get("/holidays", response_model=list[HolidayOut])
def list_holidays(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(Holiday)


@router.post("/holidays", response_model=HolidayOut)
def create_holiday(data: HolidayCreate, repo: LookupRepository = Depends(get_lookup_repo)):
    holiday = Holiday(name=data.name, start_date=data.start_date, end_date=data.end_date)
    return repo.create(holiday)


@router.put("/holidays/{holiday_id}", response_model=HolidayOut)
def update_holiday(holiday_id: int, data: HolidayUpdate, repo: LookupRepository = Depends(get_lookup_repo)):
    holiday = repo.get(Holiday, holiday_id)
    if not holiday:
        raise HTTPException(status_code=404, detail="Holiday not found")
    if data.name is not None:
        holiday.name = data.name
    if data.start_date is not None:
        holiday.start_date = data.start_date
    if data.end_date is not None:
        holiday.end_date = data.end_date
    return repo.update(holiday)


@router.delete("/holidays/{holiday_id}")
def delete_holiday(holiday_id: int, repo: LookupRepository = Depends(get_lookup_repo)):
    success = repo.delete(Holiday, holiday_id)
    if not success:
        raise HTTPException(status_code=404, detail="Holiday not found")
    return {"success": True}
