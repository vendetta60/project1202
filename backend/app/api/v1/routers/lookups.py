"""
Single router for ALL lookup/reference data tables.
Each endpoint returns the full list (active records only where applicable).
"""
from fastapi import APIRouter, Depends

from app.api.deps import get_lookup_repo
from app.repositories.lookup import LookupRepository
from app.models.lookup import (
    AccountIndex, ApIndex, ApStatus, ContentType,
    ChiefInstruction, InSection, Section, UserSection,
    WhoControl, Movzu,
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
)

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


@router.get("/executor-list", response_model=list[ExecutorListOut])
def get_executor_list(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(ExecutorList)


@router.get("/movzular", response_model=list[MovzuOut])
def get_movzular(repo: LookupRepository = Depends(get_lookup_repo)):
    return repo.list_all(Movzu, active_only=False)
