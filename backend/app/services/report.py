from app.repositories.report import ReportRepository
from app.schemas.report import ReportResponse, ReportItem, ReportParams
from app.models.user import User
import pandas as pd
import io
from datetime import date, datetime
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Try to register a font that supports Azerbaijani characters
try:
    font_path = "C:\\Windows\\Fonts\\arial.ttf"
    if os.path.exists(font_path):
        pdfmetrics.registerFont(TTFont('Arial', font_path))
        DEFAULT_FONT = 'Arial'
    else:
        DEFAULT_FONT = 'Helvetica'
except Exception:
    DEFAULT_FONT = 'Helvetica'

class ReportService:
    def __init__(self, reports: ReportRepository):
        self.reports = reports

    def get_appeal_report(self, params: ReportParams, user: User) -> ReportResponse:
        user_section_id = None
        if not user.is_admin:
            user_section_id = user.section_id

        results = self.reports.get_appeal_stats(
            group_by=params.group_by,
            start_date=params.start_date,
            end_date=params.end_date,
            user_section_id=user_section_id
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

    def _prepare_forma_4_rows(self, results):
        rows = []
        for ap in results:
            # Column 5: haradan gəlib
            haradan_parts = []
            if ap.region_rel:
                haradan_parts.append(ap.region_rel.region)
            if ap.person:
                haradan_parts.append(ap.person)
            if ap.phone:
                haradan_parts.append(ap.phone)
            haradan = "\n".join(haradan_parts)
            
            # Column 11: Kim baxmışdır və dərkənar
            derkenar_parts = []
            if ap.control_rel:
                derkenar_parts.append(ap.control_rel.chief or "")
            if ap.instruction_rel:
                derkenar_parts.append(ap.instruction_rel.instructions or "")
            derkenar = "\n".join(derkenar_parts)
            
            # Executors data
            execs = ap.executors or []
            directions = "\n".join(set(e.direction_name for e in execs if e.direction_name))
            executor_names = "\n".join(set(e.executor_name for e in execs if e.executor_name))
            
            # Col 14: out_num and out_date
            icra_senedi_parts = []
            for e in execs:
                if e.out_num:
                    s = str(e.out_num)
                    if e.out_date:
                        s += f" {e.out_date.strftime('%d.%m.%Y')}"
                    icra_senedi_parts.append(s)
            icra_senedi = "\n".join(icra_senedi_parts)

            # Col 18: r_num and r_date
            gonderilme_parts = []
            for e in execs:
                if e.r_num:
                    s = str(e.r_num)
                    if e.r_date:
                        s += f" {e.r_date.strftime('%d.%m.%Y')}"
                    gonderilme_parts.append(s)
            gonderilme = "\n".join(gonderilme_parts)

            # Column 17: PC_Tarixi - handle as string just in case it's not a real datetime in DB
            pc_tarixi_str = ""
            if ap.PC_Tarixi:
                if isinstance(ap.PC_Tarixi, (datetime, date)):
                    pc_tarixi_str = ap.PC_Tarixi.strftime("%d.%m.%Y")
                else:
                    pc_tarixi_str = str(ap.PC_Tarixi)

            row = {
                "1": ap.reg_num or "",
                "2": ap.reg_date.strftime("%d.%m.%Y") if ap.reg_date else "",
                "3": ap.sec_in_ap_num or "",
                "4": ap.sec_in_ap_date.strftime("%d.%m.%Y") if ap.sec_in_ap_date else "",
                "5": haradan,
                "6": ap.content or "",
                "7": ap.ap_index_rel.ap_index if ap.ap_index_rel else "",
                "8": ap.paper_count or "",
                "9": ap.account_index_rel.account_index if ap.account_index_rel else "",
                "10": ap.content_type_rel.content_type if ap.content_type_rel else "",
                "11": derkenar,
                "12": directions,
                "13": executor_names,
                "14": icra_senedi,
                "15": ap.status_rel.status if ap.status_rel else "",
                "16": ap.PC or "",
                "17": pc_tarixi_str,
                "18": gonderilme
            }
            rows.append(row)
        return rows

    def generate_forma_4_excel(self, start_date: date | None, end_date: date | None, user: User) -> io.BytesIO:
        user_section_id = None if user.is_admin else user.section_id
        results = self.reports.get_forma_4_data(start_date, end_date, user_section_id)
        
        headers = [
            "Qeydəalınma №-si", "Qeydəalınma tarixi", "Daxil olan müraciətin №-si", "Daxil olan müraciətin tarixi",
            "Müraciət haradan (kimdən) gəlib", "Müraciətin qısa məzmunu", "Müraciətin indeksi", "Vərəq sayı",
            "Hesabat indeksi", "Müraciətin növü", "Kim baxmışdır və dərkənar", 
            "Müraciət hansı struktur bölməyə icraya verilib", "İcraçının adı və soyadı", 
            "Müraciət hansı sənədlə icra edilib", "Müraciətin baxılması vəziyyəti", 
            "Tikildiyi iş №-si", "İşdəki vərəq №-si", "Sənədin göndərilməsi barədə qeyd"
        ]

        if not results:
            df = pd.DataFrame(columns=headers)
        else:
            rows = self._prepare_forma_4_rows(results)
            df = pd.DataFrame(rows)
            df.columns = headers
        
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Forma 4')
            workbook = writer.book
            worksheet = writer.sheets['Forma 4']
            
            # Styling
            from openpyxl.styles import Alignment, Border, Side, Font
            
            thin_border = Border(
                left=Side(style='thin'), 
                right=Side(style='thin'), 
                top=Side(style='thin'), 
                bottom=Side(style='thin')
            )
            
            # Column widths
            col_widths = [15, 12, 15, 12, 25, 30, 10, 8, 10, 15, 25, 20, 20, 20, 15, 8, 8, 15]
            for i, width in enumerate(col_widths):
                worksheet.column_dimensions[chr(65 + i)].width = width
            
            # Apply styling to all data cells
            for row in worksheet.iter_rows(min_row=2):
                for cell in row:
                    cell.alignment = Alignment(wrap_text=True, vertical='top', horizontal='center')
                    cell.border = thin_border
                    cell.font = Font(size=10)
            
            # Header styling and rotation
            worksheet.row_dimensions[1].height = 120 # Height for vertical text
            for cell in worksheet[1]:
                cell.font = Font(bold=True, size=10)
                # textRotation=90 makes the text vertical
                cell.alignment = Alignment(textRotation=90, wrap_text=True, vertical='center', horizontal='center')
                cell.border = thin_border
            
        output.seek(0)
        return output

    def generate_forma_4_word(self, start_date: date | None, end_date: date | None, user: User) -> io.BytesIO:
        user_section_id = None if user.is_admin else user.section_id
        results = self.reports.get_forma_4_data(start_date, end_date, user_section_id)
        rows = self._prepare_forma_4_rows(results)
        
        doc = Document()
        doc.add_heading('Daxil olan vətəndaş müraciətlərinin qeydiyyatı JURNALI', 0)
        
        table = doc.add_table(rows=1, cols=18)
        table.style = 'Table Grid'
        hdr_cells = table.rows[0].cells
        headers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"]
        for i, h in enumerate(headers):
            hdr_cells[i].text = h
            
        if not results:
            table.add_row().cells[0].text = "Məlumat tapılmadı"
        else:
            for r in rows:
                row_cells = table.add_row().cells
                for i in range(18):
                    row_cells[i].text = str(r[str(i+1)])
        
        output = io.BytesIO()
        doc.save(output)
        output.seek(0)
        return output

    def generate_forma_4_pdf(self, start_date: date | None, end_date: date | None, user: User) -> io.BytesIO:
        user_section_id = None if user.is_admin else user.section_id
        results = self.reports.get_forma_4_data(start_date, end_date, user_section_id)
        rows = self._prepare_forma_4_rows(results)
        
        output = io.BytesIO()
        doc = SimpleDocTemplate(output, pagesize=landscape(A4))
        elements = []
        
        styles = getSampleStyleSheet()
        elements.append(Paragraph("Daxil olan vətəndaş müraciətlərinin qeydiyyatı JURNALI", styles['Title']))
        elements.append(Spacer(1, 12))
        
        data = [["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18"]]
        if not results:
            data.append(["Məlumat tapılmadı"] + [""] * 17)
        else:
            for r in rows:
                data.append([str(r[str(i+1)]) for i in range(1, 19)])
            
        t = Table(data, repeatRows=1)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (-1, 0), f'{DEFAULT_FONT}-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), DEFAULT_FONT),
            ('FONTSIZE', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black)
        ]))
        
        elements.append(t)
        doc.build(elements)
        output.seek(0)
        return output
