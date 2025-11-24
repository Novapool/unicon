"""
Document conversion functions for PDF, Word, Excel, PowerPoint
"""

import os
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


def get_document_type(file_path: str) -> str:
    """
    Determine document type based on file extension
    Returns: 'pdf', 'docx', 'xlsx', 'pptx', or 'unknown'
    """
    ext = Path(file_path).suffix.lower()

    type_mapping = {
        '.pdf': 'pdf',
        '.doc': 'doc',
        '.docx': 'docx',
        '.xls': 'xlsx',
        '.xlsx': 'xlsx',
        '.ppt': 'pptx',
        '.pptx': 'pptx',
        '.txt': 'txt',
        '.rtf': 'rtf'
    }

    return type_mapping.get(ext, 'unknown')


def get_document_formats() -> dict:
    """
    Get supported document conversion formats
    Returns dict mapping source types to target formats
    """
    return {
        'pdf': ['docx', 'txt'],
        'docx': ['pdf', 'txt'],
        'xlsx': ['pdf', 'csv'],
        'pptx': ['pdf'],
        'txt': ['pdf', 'docx']
    }


def pdf_to_docx(input_path: str, output_path: str) -> bool:
    """Convert PDF to DOCX"""
    try:
        from pdf2docx import Converter

        cv = Converter(input_path)
        cv.convert(output_path, start=0, end=None)
        cv.close()

        logger.info(f"Converted PDF to DOCX: {input_path} -> {output_path}")
        return True
    except ImportError:
        logger.error("pdf2docx not installed. Install with: pip install pdf2docx")
        return False
    except Exception as e:
        logger.exception(f"Error converting PDF to DOCX: {str(e)}")
        return False


def pdf_to_text(input_path: str, output_path: str) -> bool:
    """Extract text from PDF"""
    try:
        import PyPDF2

        with open(input_path, 'rb') as pdf_file:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""

            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"

        with open(output_path, 'w', encoding='utf-8') as text_file:
            text_file.write(text)

        logger.info(f"Extracted text from PDF: {input_path} -> {output_path}")
        return True
    except Exception as e:
        logger.exception(f"Error extracting text from PDF: {str(e)}")
        return False


def docx_to_pdf(input_path: str, output_path: str) -> bool:
    """Convert DOCX to PDF"""
    try:
        from docx2pdf import convert

        convert(input_path, output_path)

        logger.info(f"Converted DOCX to PDF: {input_path} -> {output_path}")
        return True
    except ImportError:
        logger.error("docx2pdf not installed. Install with: pip install docx2pdf")
        logger.info("Note: docx2pdf requires Microsoft Word on Windows or LibreOffice on Linux/Mac")
        return False
    except Exception as e:
        logger.exception(f"Error converting DOCX to PDF: {str(e)}")
        return False


def docx_to_text(input_path: str, output_path: str) -> bool:
    """Extract text from DOCX"""
    try:
        from docx import Document

        doc = Document(input_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])

        with open(output_path, 'w', encoding='utf-8') as text_file:
            text_file.write(text)

        logger.info(f"Extracted text from DOCX: {input_path} -> {output_path}")
        return True
    except Exception as e:
        logger.exception(f"Error extracting text from DOCX: {str(e)}")
        return False


def xlsx_to_csv(input_path: str, output_path: str) -> bool:
    """Convert XLSX to CSV (first sheet)"""
    try:
        import openpyxl
        import csv

        workbook = openpyxl.load_workbook(input_path)
        sheet = workbook.active

        with open(output_path, 'w', newline='', encoding='utf-8') as csv_file:
            csv_writer = csv.writer(csv_file)
            for row in sheet.iter_rows(values_only=True):
                csv_writer.writerow(row)

        logger.info(f"Converted XLSX to CSV: {input_path} -> {output_path}")
        return True
    except Exception as e:
        logger.exception(f"Error converting XLSX to CSV: {str(e)}")
        return False


def xlsx_to_pdf(input_path: str, output_path: str) -> bool:
    """Convert XLSX to PDF"""
    try:
        # This typically requires Excel or LibreOffice
        logger.error("XLSX to PDF conversion requires Excel or LibreOffice")
        logger.info("Consider using a cloud service or external tool for this conversion")
        return False
    except Exception as e:
        logger.exception(f"Error converting XLSX to PDF: {str(e)}")
        return False


def pptx_to_pdf(input_path: str, output_path: str) -> bool:
    """Convert PPTX to PDF"""
    try:
        # This typically requires PowerPoint or LibreOffice
        logger.error("PPTX to PDF conversion requires PowerPoint or LibreOffice")
        logger.info("Consider using a cloud service or external tool for this conversion")
        return False
    except Exception as e:
        logger.exception(f"Error converting PPTX to PDF: {str(e)}")
        return False


def text_to_pdf(input_path: str, output_path: str) -> bool:
    """Convert text file to PDF"""
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet

        with open(input_path, 'r', encoding='utf-8') as text_file:
            text = text_file.read()

        doc = SimpleDocTemplate(output_path, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Split text into paragraphs
        for paragraph in text.split('\n'):
            if paragraph.strip():
                story.append(Paragraph(paragraph, styles['Normal']))
                story.append(Spacer(1, 12))

        doc.build(story)

        logger.info(f"Converted text to PDF: {input_path} -> {output_path}")
        return True
    except ImportError:
        logger.error("reportlab not installed. Install with: pip install reportlab")
        return False
    except Exception as e:
        logger.exception(f"Error converting text to PDF: {str(e)}")
        return False


def text_to_docx(input_path: str, output_path: str) -> bool:
    """Convert text file to DOCX"""
    try:
        from docx import Document

        with open(input_path, 'r', encoding='utf-8') as text_file:
            text = text_file.read()

        doc = Document()

        # Add paragraphs
        for paragraph in text.split('\n'):
            doc.add_paragraph(paragraph)

        doc.save(output_path)

        logger.info(f"Converted text to DOCX: {input_path} -> {output_path}")
        return True
    except Exception as e:
        logger.exception(f"Error converting text to DOCX: {str(e)}")
        return False


def convert_document(input_path: str, output_path: str, output_format: str) -> bool:
    """
    Main document conversion function
    Routes to appropriate converter based on input and output types
    """
    if not os.path.exists(input_path):
        logger.error(f"Input file not found: {input_path}")
        return False

    input_type = get_document_type(input_path)

    if input_type == 'unknown':
        logger.error(f"Unsupported document type: {input_path}")
        return False

    # Route to appropriate converter
    conversion_map = {
        ('pdf', 'docx'): pdf_to_docx,
        ('pdf', 'txt'): pdf_to_text,
        ('docx', 'pdf'): docx_to_pdf,
        ('docx', 'txt'): docx_to_text,
        ('xlsx', 'csv'): xlsx_to_csv,
        ('xlsx', 'pdf'): xlsx_to_pdf,
        ('pptx', 'pdf'): pptx_to_pdf,
        ('txt', 'pdf'): text_to_pdf,
        ('txt', 'docx'): text_to_docx,
    }

    converter = conversion_map.get((input_type, output_format.lower()))

    if not converter:
        logger.error(f"Unsupported conversion: {input_type} -> {output_format}")
        return False

    try:
        return converter(input_path, output_path)
    except Exception as e:
        logger.exception(f"Error during document conversion: {str(e)}")
        return False


if __name__ == "__main__":
    # Test document conversion
    import sys

    if len(sys.argv) != 4:
        print("Usage: python document_conversion.py <input_file> <output_file> <output_format>")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]
    output_format = sys.argv[3]

    success = convert_document(input_file, output_file, output_format)
    sys.exit(0 if success else 1)
