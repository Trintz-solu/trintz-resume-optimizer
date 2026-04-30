# 🚀 Trintz AI Resume Optimizer

An AI-powered resume optimization platform that analyzes, rewrites, and generates ATS-friendly resumes tailored to job descriptions.

---

## ✨ Features

* 🎯 **ATS Score Analysis**

  * Keyword match
  * Section completeness
  * Content strength

* 🤖 **AI Resume Optimization**

  * Rewrites summary and experience
  * Injects missing keywords automatically
  * Follows Action + Tech + Impact format

* 📄 **Structured Resume Generation**

  * Strict JSON-based architecture
  * Clean, professional 1-page layout
  * ATS-compliant formatting

* 📊 **Before vs After Comparison**

  * Shows improvements clearly
  * Explains optimization changes

* 📥 **PDF Export (WIP)**

  * Download ready-to-use resumes

---

## 🧠 Tech Stack

### Frontend

* React + TypeScript + Vite
* TailwindCSS
* Component-based architecture

### Backend

* FastAPI (Python)
* LLM Integration (OpenAI-compatible API)
* Resume parsing (PDF/DOCX/TXT)

### Database

* SQLite (Currently)
* PostgreSQL (Planned)

---

## ⚙️ How It Works

1. Upload your resume
2. Paste job description
3. AI analyzes & scores resume
4. Generates optimized content (structured JSON)
5. Renders clean resume template
6. Export as PDF

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Trintz-solu/trintz-resume-optimizer.git
cd trintz-resume-optimizer
```

---

### 2. Setup Frontend

```bash
npm install
npm run dev
```

---

### 3. Setup Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## 🔐 Environment Variables

Create a `.env` file:

```
RESEND_API_KEY=your_key
EMAIL_FROM=noreply@trintz.in
AI_API_KEY=your_ai_key
```

---

## 🎯 Vision

To build a full-scale AI-powered resume builder that:

* Eliminates manual resume editing
* Improves hiring success rates
* Bridges the gap between students and job requirements

---

## 👥 Team Trintz

* Gangeswara
* Monish Narain

---

## 📌 Status

🚧 Actively under development
🔥 Core optimization engine completed
🎯 Moving towards full SaaS product

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
