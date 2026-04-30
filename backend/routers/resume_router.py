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

# Import our deterministic ATS engine
from ats_engine import extract_keywords, calculate_ats_score

router = APIRouter(prefix="/api/resume", tags=["resume"])

# Initialize OpenAI client (only needed for resume generation, NOT for scoring)
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

# ── Production-grade resume generation prompt ─────────────────────────────────
OPTIMIZE_PROMPT = """You are a professional resume writer with 10+ years of experience writing
ATS-optimized resumes for FAANG and Fortune 500 companies.

STRICT RULES — every rule is mandatory. Violating any will cause rejection:
1. Every bullet MUST start with a strong past-tense action verb
   (Led, Built, Reduced, Increased, Designed, Deployed, Automated, Architected,
   Implemented, Streamlined, Launched, Optimized, Migrated, Scaled, Engineered...)
2. Every bullet MUST contain at least one quantified metric
   (%, $, users, ms, seconds, reduction, improvement, scale, revenue, count...)
3. Provide 3-5 comprehensive bullets per role. Each bullet should be 1-2 lines detailing technical implementation and business impact.
4. Summary: 3-4 impactful sentences emphasizing deep technical expertise and leadership.
5. Inject missing JD keywords naturally — do NOT force them awkwardly
6. NEVER invent data — only use facts present in the original resume
7. Preserve all dates exactly as provided in the original resume
8. Keep all personal contact information exactly as it appears
9. The total generated text MUST be perfectly sized to fit on exactly ONE standard A4 page. Provide enough detail so the page is full, but NEVER exceed the one-page limit.

Return ONLY valid JSON matching this exact structure. No markdown, no explanation:
{
  "personal_info": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "location": "...",
    "linkedin": "..."
  },
  "summary": "2-3 sentence professional summary with top 3 skills",
  "experience": [
    {
      "company": "...",
      "title": "...",
      "start_date": "...",
      "end_date": "... or Present",
      "bullets": ["Action verb + specific tech + quantified impact"]
    }
  ],
  "projects": [
    {
      "name": "...",
      "start_date": "...",
      "end_date": "...",
      "bullets": ["Action verb + specific tech + quantified impact"]
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
  "auto_applied_keywords": ["keyword1", "keyword2"]
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
    return '\n'.join(chunk for chunk in chunks if chunk)


async def analyze_resume(file_bytes: bytes, filename: str, job_description: str) -> dict:
    """
    Fully deterministic ATS analysis — no LLM involved.
    Uses pure Python TF-IDF keyword extractor + rule-based scorer.
    """
    filename = filename.lower()
    raw_text = ""

    if filename.endswith(".pdf"):
        raw_text = extract_text_from_pdf(file_bytes)
    elif filename.endswith(".docx"):
        raw_text = extract_text_from_docx(file_bytes)
    elif filename.endswith(".txt"):
        try:
            raw_text = file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            raise ValueError("Failed to read TXT file.")
    else:
        raise ValueError("Unsupported file format. Please upload PDF, DOCX, or TXT.")

    if not raw_text.strip():
        raise ValueError("Could not extract text from the document.")
    if not job_description.strip():
        raise ValueError("Job description cannot be empty.")

    resume_text = clean_text(raw_text)

    # Step 1: Extract keywords from JD (TF-IDF, pure Python)
    jd_keywords = extract_keywords(job_description, top_n=25)

    # Step 2: Score resume deterministically
    score_data = calculate_ats_score(resume_text, jd_keywords)

    return {
        "ats_score": {
            "total": score_data["total"],
            "keyword_match": score_data["keyword_match"],
            "section_completeness": score_data["section_completeness"],
            "contact_info": score_data["contact_info"],
            "quantification": score_data["quantification"],
            "length_score": score_data["length_score"],
            "confidence": score_data["confidence"],
            "word_count": score_data["word_count"],
        },
        "critical_keywords": jd_keywords,
        "found_keywords": score_data["matched_keywords"],
        "missing_keywords": score_data["missing_keywords"],
        "resume_text_extracted": resume_text,
    }


async def process_resume_optimization(
    resume_text: str,
    job_description: str,
    mode: str = "advanced",
    missing_keywords: list = None,
) -> dict:
    """
    AI-powered resume rewrite using a strict, structured prompt.
    temperature=0.2 for consistent, high-quality output.
    """
    if not client:
        raise Exception("OpenAI API key not configured.")
    if not resume_text.strip() or not job_description.strip():
        raise ValueError("Resume text and job description are required.")

    # Inject missing keywords into prompt context
    kw_hint = ""
    if missing_keywords:
        kw_hint = f"\n\nMISSING KEYWORDS TO INJECT (use naturally): {', '.join(missing_keywords[:15])}"

    for attempt in range(2):
        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": OPTIMIZE_PROMPT + kw_hint},
                    {
                        "role": "user",
                        "content": (
                            f"OPTIMIZATION MODE: {mode.upper()}\n\n"
                            f"JOB DESCRIPTION:\n{job_description}\n\n"
                            f"ORIGINAL RESUME:\n{resume_text}"
                        ),
                    },
                ],
                temperature=0.2,  # Low temperature for consistent output
                response_format={"type": "json_object"},
            )
            result_content = response.choices[0].message.content
            parsed = json.loads(result_content)

            # Strict Pydantic validation
            from schemas import StructuredResume
            from pydantic import ValidationError
            try:
                validated = StructuredResume(**parsed)
                return validated.dict()
            except ValidationError as ve:
                if attempt == 1:
                    raise ValueError("LLM returned invalid structure: " + str(ve))
                continue

        except (json.JSONDecodeError, ValueError) as e:
            if attempt == 1:
                raise Exception(
                    "Failed to generate valid resume after 2 attempts. Error: " + str(e)
                )
            continue

    return {}


@router.post("/optimize")
async def optimize_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
):
    contents = await file.read()
    try:
        analysis = await analyze_resume(contents, file.filename, job_description)
        result = await process_resume_optimization(
            analysis["resume_text_extracted"],
            job_description,
            missing_keywords=analysis.get("missing_keywords", []),
        )
        return {**analysis, **result}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))