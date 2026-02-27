from fastapi import APIRouter, Depends, Query
from datetime import date, datetime
from app.api.deps import get_report_service, get_current_user
from app.models.user import User
from app.schemas.report import ReportResponse, ReportParams
from app.services.report import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/appeals", response_model=ReportResponse)
def get_appeal_report(
    group_by: str = Query("department", description="Group by: department, region, status, index, insection"),
    start_date: date | None = None,
    end_date: date | None = None,
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(get_report_service)
):
    params = ReportParams(
        group_by=group_by,
        start_date=start_date,
        end_date=end_date
    )
    return service.get_appeal_report(params, current_user)

@router.get("/forma-4/excel")
def export_forma_4_excel(
    start_date: date | None = None,
    end_date: date | None = None,
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(get_report_service)
):
    from fastapi.responses import StreamingResponse
    output = service.generate_forma_4_excel(start_date, end_date, current_user)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=forma_4_{datetime.now().strftime('%Y%m%d')}.xlsx"}
    )

@router.get("/forma-4/word")
def export_forma_4_word(
    start_date: date | None = None,
    end_date: date | None = None,
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(get_report_service)
):
    from fastapi.responses import StreamingResponse
    output = service.generate_forma_4_word(start_date, end_date, current_user)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename=forma_4_{datetime.now().strftime('%Y%m%d')}.docx"}
    )

@router.get("/forma-4/pdf")
def export_forma_4_pdf(
    start_date: date | None = None,
    end_date: date | None = None,
    current_user: User = Depends(get_current_user),
    service: ReportService = Depends(get_report_service)
):
    from fastapi.responses import StreamingResponse
    output = service.generate_forma_4_pdf(start_date, end_date, current_user)
    return StreamingResponse(
        output,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=forma_4_{datetime.now().strftime('%Y%m%d')}.pdf"}
    )
