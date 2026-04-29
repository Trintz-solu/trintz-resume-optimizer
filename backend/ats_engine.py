"""
ats_engine.py — Deterministic, rule-based ATS Scoring Engine
=============================================================
Zero ML dependencies. Pure Python.
Scoring: 5 categories, 100 points total.
  1. Keyword Match          — 40 pts
  2. Section Presence       — 20 pts
  3. Contact Info           — 10 pts
  4. Quantified Achievements — 20 pts
  5. Resume Length          — 10 pts
"""

import re
import math
from collections import Counter
from typing import List, Dict

# ── Stopword list ─────────────────────────────────────────────────────────────
STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
    "be", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "need", "must",
    "our", "your", "their", "this", "that", "these", "those", "we", "you",
    "they", "it", "he", "she", "who", "which", "what", "how", "when",
    "where", "why", "all", "any", "both", "each", "few", "more", "most",
    "other", "some", "such", "no", "nor", "not", "only", "same", "so",
    "than", "too", "very", "just", "because", "if", "then", "else",
    "about", "above", "after", "before", "between", "during", "into",
    "through", "under", "up", "down", "out", "off", "over", "again",
    "also", "back", "etc", "per", "via", "us", "am", "i", "my", "me",
    "him", "her", "his", "its", "own", "while", "within", "without",
    "using", "used", "use", "based", "including", "include", "required",
    "requirements", "responsibilities", "role", "position", "candidate",
    "work", "working", "years", "year", "strong", "excellent", "good",
    "ability", "knowledge", "understanding", "plus", "preferred", "ideal",
    "looking", "seeking", "join", "help", "across", "multiple", "various",
    "new", "key", "related", "ensure", "support", "able", "well",
    "demonstrated", "proven", "highly", "applicable", "relevant",
    "minimum", "maximum", "responsible", "familiarity", "familiar",
    "time", "day", "days", "week", "month", "year", "team", "teams",
}

# Regex for tokenizing words (includes things like "C++", "Node.js", ".NET")
_TOKEN_RE = re.compile(r'\b[a-zA-Z][a-zA-Z0-9+#.\-]{1,30}\b')


def _tokenize(text: str) -> List[str]:
    """Lowercase word tokens from text."""
    return [t.lower() for t in _TOKEN_RE.findall(text) if len(t) > 2]


def extract_keywords(jd_text: str, top_n: int = 25) -> List[str]:
    """
    Extract the most important keywords from a job description.
    Uses TF-IDF-inspired scoring: tf * log(1 + tf).
    Also boosts relevant bigrams (e.g., "machine learning", "data pipelines").
    """
    tokens = _tokenize(jd_text)
    filtered = [t for t in tokens if t not in STOPWORDS]

    # Unigram TF score
    tf = Counter(filtered)
    scored: Dict[str, float] = {}
    for term, count in tf.items():
        if term not in STOPWORDS and len(term) > 2:
            scored[term] = count * math.log(1.0 + count)

    # Bigram extraction — boost technical bigrams
    words = jd_text.lower().split()
    for i in range(len(words) - 1):
        w1 = re.sub(r'[^a-z0-9+#.\-]', '', words[i])
        w2 = re.sub(r'[^a-z0-9+#.\-]', '', words[i + 1])
        if (w1 and w2 and w1 not in STOPWORDS and w2 not in STOPWORDS
                and len(w1) > 2 and len(w2) > 2):
            bigram = f"{w1} {w2}"
            scored[bigram] = scored.get(bigram, 0) + 1.5  # bigram boost

    sorted_terms = sorted(scored.items(), key=lambda x: x[1], reverse=True)
    return [term for term, _ in sorted_terms[:top_n]]


def calculate_ats_score(resume_text: str, jd_keywords: List[str]) -> Dict:
    """
    Deterministic 5-category ATS scorer.
    Returns a dict with total (0-100) and per-category scores.
    Identical inputs always produce identical outputs — no randomness.
    """
    lower = resume_text.lower()
    resume_tokens = set(_tokenize(resume_text))

    # ── 1. Keyword Match (40 pts) ──────────────────────────────────────────────
    matched, missing = [], []
    for kw in jd_keywords:
        kw_lower = kw.lower()
        if ' ' in kw_lower:
            # Bigram: check if phrase appears in text
            found = kw_lower in lower
        else:
            found = kw_lower in resume_tokens
        (matched if found else missing).append(kw)

    kw_ratio = len(matched) / max(len(jd_keywords), 1)
    keyword_score = round(kw_ratio * 40)

    # ── 2. Section Presence (20 pts — 5 each) ────────────────────────────────
    section_patterns = [
        r'\b(experience|work\s+history|employment|professional\s+background)\b',
        r'\b(education|academic|degree|university|college|bachelor|master)\b',
        r'\b(skills|technologies|tech\s+stack|competencies|expertise)\b',
        r'\b(projects?|portfolio|open.?source|github)\b',
    ]
    section_score = sum(5 for pat in section_patterns if re.search(pat, lower))

    # ── 3. Contact Info (10 pts) ──────────────────────────────────────────────
    has_email = bool(re.search(
        r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', resume_text))
    has_phone = bool(re.search(
        r'(\+?\d[\d\s\-().]{7,16}\d)', resume_text))
    contact_score = (5 if has_email else 0) + (5 if has_phone else 0)

    # ── 4. Quantified Achievements (20 pts) ───────────────────────────────────
    quant_patterns = [
        r'\d+\s*%',                                           # 40%, 25%
        r'\$\s*\d[\d,kKmMbB.]*',                             # $1.2M, $500K
        r'\d+\s*(users?|customers?|clients?|engineers?)',     # 50 users
        r'\d+\s*x\b',                                        # 3x improvement
        r'\b(increased?|reduced?|improved?|decreased?|grew|boosted?|cut|saved?)\b[^.]{0,60}\d+',
        r'\d+\s*(ms|milliseconds?|seconds?|minutes?|hours?)',  # 200ms latency
        r'\d[\d,]+\s*(million|billion|thousand)',             # 1.2 million
    ]
    quant_hits = sum(1 for pat in quant_patterns
                     if re.search(pat, lower, re.IGNORECASE))
    quant_score = min(20, quant_hits * 4)

    # ── 5. Resume Length (10 pts) ─────────────────────────────────────────────
    word_count = len(resume_text.split())
    if 400 <= word_count <= 800:
        length_score = 10
    elif (250 <= word_count < 400) or (800 < word_count <= 1200):
        length_score = 6
    else:
        length_score = 2

    # ── Total ─────────────────────────────────────────────────────────────────
    total = keyword_score + section_score + contact_score + quant_score + length_score

    if total >= 80:
        confidence = "Strong Alignment"
    elif total >= 60:
        confidence = "Moderate — Needs Improvement"
    else:
        confidence = "Requires Deep Rewrite"

    return {
        "total": min(total, 100),
        "keyword_match": keyword_score,
        "section_completeness": section_score,
        "contact_info": contact_score,
        "quantification": quant_score,
        "length_score": length_score,
        "confidence": confidence,
        "word_count": word_count,
        "matched_keywords": matched,
        "missing_keywords": missing,
    }
