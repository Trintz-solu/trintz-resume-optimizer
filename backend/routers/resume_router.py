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
api_base_url = os.getenv("OPENAI_API_BASE_URL", "").strip()

if api_key:
    if api_base_url:
        client = AsyncOpenAI(api_key=api_key, base_url=api_base_url)
    else:
        client = AsyncOpenAI(api_key=api_key)
else:
    client = None

import re

ANALYZE_PROMPT = """You are an expert ATS (Applicant Tracking System).
Given a job description, extract a list of 5-10 critical keywords/skills.
Then, check if these exact or highly similar keywords exist in the given resume text.
Format response strictly as JSON:
{
  "critical_keywords": ["python", "fastapi", "react"],
  "found_keywords": ["python"],
  "missing_keywords": ["fastapi", "react"]
}"""

OPTIMIZE_PROMPT = """You are an expert resume optimizer. Extract and restructure
the resume below into this EXACT JSON format. Never invent
or substitute data — use only what is present in the resume.
Ensure all missing keywords are injected naturally where appropriate.
If the mode is 'advanced', do a deeper rewrite to improve the content strength.

Return ONLY valid JSON with this structure:
{
  "personal_info": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "location": "...",
    "linkedin": "..."
  },
  "summary": "max 3 lines",
  "experience": [
    {
      "company": "...",
      "title": "...",
      "start_date": "...",
      "end_date": "... or Present",
      "bullets": ["Action + Tech + Impact"]
    }
  ],
  "projects": [
    {
      "name": "...",
      "start_date": "...",
      "end_date": "...",
      "bullets": ["Action + Tech + Impact"]
    }
  ],
  "skills": ["Python", "React", "FastAPI"],
  "education": [
    {
      "institution": "...",
      "degree": "...",
      "graduation_year": "..."
    }
  ],
  "auto_applied_keywords": ["fastapi"]
}"""

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
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    cleaned = '\n'.join(chunk for chunk in chunks if chunk)
    return cleaned

def compute_ats_score(resume_text: str, critical_kw: list, found_kw: list):
    kw_score = (len(found_kw) / max(len(critical_kw), 1)) * 100
    
    sections = 0
    lower_text = resume_text.lower()
    if re.search(r'\b(experience|work history|employment)\b', lower_text): sections += 1
    if re.search(r'\b(education|academic)\b', lower_text): sections += 1
    if re.search(r'\b(skills|technologies)\b', lower_text): sections += 1
    section_score = (sections / 3.0) * 100

    metrics_count = len(re.findall(r'\d+%?|\$|increase|decrease|improve|achieve', lower_text))
    content_score = min(100.0, float(metrics_count * 10))

    total = int(kw_score * 0.5 + section_score * 0.2 + content_score * 0.3)
    
    if total >= 80: confidence = "Strong Alignment"
    elif total >= 60: confidence = "Moderate Improvement Needed"
    else: confidence = "Requires Deep Rewrite"

    return {
        "total": total,
        "keyword_match": int(kw_score),
        "section_completeness": int(section_score),
        "content_strength": int(content_score),
        "confidence": confidence
    }

async def analyze_resume(file_bytes: bytes, filename: str, job_description: str) -> dict:
    if not client: raise Exception("OpenAI API key not configured")

    filename = filename.lower()
    raw_text = ""
    if filename.endswith(".pdf"): raw_text = extract_text_from_pdf(file_bytes)
    elif filename.endswith(".docx"): raw_text = extract_text_from_docx(file_bytes)
    elif filename.endswith(".txt"): 
        try: raw_text = file_bytes.decode("utf-8", errors="ignore")
        except: raise ValueError("Failed to read TXT")
    else: raise ValueError("Unsupported file format.")
    
    if not raw_text.strip(): raise ValueError("Could not extract text from document.")
    if not job_description.strip(): raise ValueError("Job description cannot be empty.")

    resume_text = clean_text(raw_text)

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": ANALYZE_PROMPT},
            {"role": "user", "content": f"JOB DESCRIPTION:\n{job_description}\n\nRESUME TEXT:\n{resume_text}"}
        ],
        temperature=0.1,
        response_format={"type": "json_object"}
    )
    
    try:
        result = json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        raise ValueError("Failed to parse ATS analysis response.")

    ats_data = compute_ats_score(raw_text, result.get("critical_keywords", []), result.get("found_keywords", []))
    
    return {
        "ats_score": ats_data,
        "critical_keywords": result.get("critical_keywords", []),
        "found_keywords": result.get("found_keywords", []),
        "missing_keywords": result.get("missing_keywords", []),
        "resume_text_extracted": resume_text
    }

async def process_resume_optimization(resume_text: str, job_description: str, mode: str = "advanced") -> dict:
    if not client: raise Exception("OpenAI API key not configured")
    if not resume_text.strip() or not job_description.strip(): raise ValueError("Missing content.")

    prompt_with_mode = OPTIMIZE_PROMPT.replace("{mode}", str(mode))
    
    for attempt in range(2):
        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": prompt_with_mode},
                    {"role": "user", "content": f"JOB DESCRIPTION:\n{job_description}\n\nRESUME TEXT:\n{resume_text}"}
                ],
                temperature=0.4,
                response_format={"type": "json_object"}
            )
            result_content = response.choices[0].message.content
            parsed = json.loads(result_content)
            
            # Strict validation using Pydantic
            from schemas import StructuredResume
            from pydantic import ValidationError
            try:
                validated_resume = StructuredResume(**parsed)
                return validated_resume.dict()
            except ValidationError as ve:
                raise ValueError("LLM returned malformed structure: " + str(ve))
            
        except (json.JSONDecodeError, ValueError) as e:
            if attempt == 1:
                raise Exception("Failed to generate optimized resume matching the valid structure after retries. Error: " + str(e))
            continue
    
    return {}

@router.post("/optimize")
async def optimize_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    contents = await file.read()
    try:
        # 1. Analyze
        analysis = await analyze_resume(contents, file.filename, job_description)
        # 2. Optimize
        result = await process_resume_optimization(analysis["resume_text_extracted"], job_description)
        return {**analysis, **result}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))