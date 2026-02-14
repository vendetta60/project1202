from app.repositories.report import ReportRepository
from app.schemas.report import ReportResponse, ReportItem, ReportParams

class ReportService:
    def __init__(self, reports: ReportRepository):
        self.reports = reports

    def get_appeal_report(self, params: ReportParams) -> ReportResponse:
        results = self.reports.get_appeal_stats(
            group_by=params.group_by,
            start_date=params.start_date,
            end_date=params.end_date
        )

        items = []
        total_count = 0
        for row in results:
            count = row.count
            total_count += count
            items.append(ReportItem(
                id=row.id,
                name=row.name or "Məlum deyil",
                count=count
            ))

        return ReportResponse(
            items=items,
            total=total_count,
            group_by=params.group_by,
            start_date=params.start_date,
            end_date=params.end_date
        )
