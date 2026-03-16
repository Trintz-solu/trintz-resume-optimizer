from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import os
import json
import io
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

try:
    import fitz  # PyMuPDF
except ImportError:
    fitz = None

try:
    import docx2txt
except ImportError:
    docx2txt = None

router = APIRouter(prefix="/api/resume", tags=["resume"])

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY", "")
client = AsyncOpenAI(api_key=api_key) if api_key else None

SYSTEM_PROMPT = """You are an expert ATS resume analyzer and top-tier career coach.

Your task is to analyze a resume against a given job description and provide structured feedback.
Focus on:
- Improving keywords to match the job description
- Enhancing bullet points by quantifying achievements (e.g., increased sales by 20%)
- Providing formatting suggestions for better ATS parsing
- Calculating an ATS compatibility score (0-100)
- Identifying missing skills or keywords

Return the result STRICTLY in JSON format with exactly the following structure:
{
  "ats_score": 85,
  "improved_summary": "Strong summary highlighting...",
  "improved_experience": "Optimized experience bullet points...",
  "missing_keywords": ["Python", "FastAPI", "React"],
  "full_optimized_resume": "The full rewritten text..."
}
"""

def extract_text_from_pdf(file_bytes: bytes) -> str:
    if not fitz:
        raise ValueError("PyMuPDF (fitz) is not installed.")
    text = ""
    try:
        pdf_document = fitz.open(stream=file_bytes, filetype="pdf")
        for page_num in range(pdf_document.page_count):
            page = pdf_document.load_page(page_num)
            text += page.get_text()
        pdf_document.close()
    except Exception as e:
        raise ValueError(f"Failed to read PDF: {str(e)}")
    return text

def extract_text_from_docx(file_bytes: bytes) -> str:
    if not docx2txt:
        raise ValueError("docx2txt is not installed.")
    try:
        text = docx2txt.process(io.BytesIO(file_bytes))
    except Exception as e:
        raise ValueError(f"Failed to read DOCX: {str(e)}")
    return text

def clean_text(text: str) -> str:
    # Basic cleaning to remove excessive whitespace and non-printable characters
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    cleaned = '\\n'.join(chunk for chunk in chunks if chunk)
    return cleaned

async def process_resume_optimization(file_bytes: bytes, filename: str, job_description: str) -> dict:
    if not client:
        raise Exception("OpenAI API key not configured")

    filename = filename.lower()
    
    # 1. Extract text properly
    raw_text = ""
    if filename.endswith(".pdf"):
        raw_text = extract_text_from_pdf(file_bytes)
    elif filename.endswith(".docx"):
        raw_text = extract_text_from_docx(file_bytes)
    elif filename.endswith(".txt"):
        try:
            raw_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            raise ValueError(f"Failed to read TXT: {str(e)}")
    else:
        raise ValueError("Unsupported file format. Please upload PDF, DOCX, or TXT.")

    if not raw_text.strip():
        raise ValueError("Could not extract text from the provided document.")

    # 2. Clean extracted text
    resume_text = clean_text(raw_text)

    # 3. Call OpenAI
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"JOB DESCRIPTION:\\n{job_description}\\n\\nRESUME TEXT:\\n{resume_text}"}
        ],
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    
    result_content = response.choices[0].message.content
    return json.loads(result_content)

@router.post("/optimize")
async def optimize_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    contents = await file.read()
    try:
        result = await process_resume_optimization(contents, file.filename, job_description)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))