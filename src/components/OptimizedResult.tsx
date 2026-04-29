import { Copy, Download, Check, Target, Lightbulb, FileText, AlertCircle, TrendingUp } from "lucide-react";
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import ResumePrintTemplate from "./ResumePrintTemplate";

export interface AnalysisResult {
  ats_score: {
    total: number;
    keyword_match: number;
    section_completeness: number;
    contact_info: number;
    quantification: number;
    length_score: number;
    confidence: string;
    word_count?: number;
  };
  critical_keywords: string[];
  found_keywords: string[];
  missing_keywords: string[];
  resume_text_extracted?: string;
}

export interface OptimizationResult {
  personal_info?: { name: string; email?: string; phone?: string; location?: string; linkedin?: string };
  summary: string;
  experience: { company: string; title: string; start_date: string; end_date: string; bullets: string[] }[];
  projects: { name: string; start_date: string; end_date: string; bullets: string[] }[];
  skills: string[];
  education: { degree: string; institution: string; graduation_year: string }[];
  auto_applied_keywords?: string[];
}

interface Props { analysis: AnalysisResult | null; optimization: OptimizationResult | null; }

const ScoreRing = ({ score, size = 110, stroke = 10 }: { score: number; size?: number; stroke?: number }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" className="text-muted" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 8px ${color}60)` }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black text-foreground leading-none">{score}</span>
        <span className="text-[10px] text-muted-foreground font-medium">/100</span>
      </div>
    </div>
  );
};

const ScoreBar = ({ label, score, max, color }: { label: string; score: number; max: number; color: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs font-semibold">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{score}<span className="text-muted-foreground font-normal">/{max}</span></span>
    </div>
    <div className="progress-bar-track">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(score / max) * 100}%`, background: color }} />
    </div>
  </div>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-all shadow-xs">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};

const SparklesIcon = (p: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const OptimizedResult = ({ analysis, optimization }: Props) => {
  if (!analysis) return null;
  const printRef = useRef<HTMLDivElement>(null);
  const handleDownload = useReactToPrint({ contentRef: printRef, documentTitle: "Optimized_Resume" });
  const { ats_score, found_keywords, missing_keywords } = analysis;

  const scoreCategories = [
    { label: "Keyword Match", score: ats_score.keyword_match, max: 40, color: "hsl(243 80% 68%)" },
    { label: "Section Presence", score: ats_score.section_completeness, max: 20, color: "hsl(270 85% 70%)" },
    { label: "Contact Info", score: ats_score.contact_info, max: 10, color: "hsl(196 100% 50%)" },
    { label: "Quantified Impact", score: ats_score.quantification, max: 20, color: "hsl(38 92% 55%)" },
    { label: "Resume Length", score: ats_score.length_score, max: 10, color: "hsl(142 71% 45%)" },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* ATS Score Section */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-extrabold text-foreground">ATS Analysis</h2>
          {ats_score.word_count && (
            <span className="ml-auto text-xs text-muted-foreground font-medium">
              {ats_score.word_count} words detected
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Score Ring */}
          <div className="card-premium p-6 flex flex-col items-center justify-center text-center gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Overall Score</p>
            <ScoreRing score={ats_score.total} />
            <span className={`text-sm font-bold ${ats_score.total >= 80 ? "text-emerald-500" : ats_score.total >= 60 ? "text-amber-500" : "text-red-500"}`}>
              {ats_score.confidence}
            </span>
          </div>

          {/* 5-category bars */}
          <div className="md:col-span-2 card-premium p-6 flex flex-col justify-center space-y-3.5">
            <p className="text-sm font-bold text-foreground pb-2 border-b border-border">Score Breakdown (100 pts total)</p>
            {scoreCategories.map((cat) => (
              <ScoreBar key={cat.label} label={cat.label} score={cat.score} max={cat.max} color={cat.color} />
            ))}
          </div>
        </div>

        {/* Keywords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {found_keywords.length > 0 && (
            <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: "hsl(142 71% 45% / 0.25)", background: "hsl(142 71% 45% / 0.05)" }}>
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                <Check className="text-emerald-500 w-4 h-4" /> Found Keywords ({found_keywords.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {found_keywords.map((kw) => (
                  <span key={kw} className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: "hsl(142 71% 45% / 0.12)", color: "hsl(142 71% 40%)", border: "1px solid hsl(142 71% 45% / 0.2)" }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
          {missing_keywords.length > 0 && (
            <div className="rounded-2xl border p-5 space-y-3" style={{ borderColor: "hsl(38 92% 55% / 0.25)", background: "hsl(38 92% 55% / 0.05)" }}>
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="text-amber-500 w-4 h-4" /> Missing Keywords ({missing_keywords.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {missing_keywords.map((kw) => (
                  <span key={kw} className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: "hsl(38 92% 55% / 0.12)", color: "hsl(38 70% 40%)", border: "1px solid hsl(38 92% 55% / 0.2)" }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optimization Results */}
      {optimization && (
        <div className="space-y-6 pt-6 border-t border-border animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="text-primary" />
            <h2 className="text-xl font-extrabold text-foreground">AI Rewrite Results</h2>
          </div>

          {(optimization.auto_applied_keywords?.length ?? 0) > 0 && (
            <div className="rounded-xl border p-4 flex gap-3 text-sm"
              style={{ borderColor: "hsl(var(--primary) / 0.2)", background: "hsl(var(--primary) / 0.05)" }}>
              <TrendingUp className="text-primary w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Keywords injected: </span>
                <span className="text-muted-foreground">{optimization.auto_applied_keywords!.join(", ")}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Optimized Resume Preview
              </h3>
              <div className="flex gap-2">
                <CopyButton text={optimization.summary || ""} />
                <button onClick={() => handleDownload()}
                  className="btn-gradient inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm">
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-muted/30 p-6 flex justify-center overflow-x-auto border border-border">
              <div className="shadow-2xl ring-1 ring-black/5" style={{ transform: "scale(0.85)", transformOrigin: "top center", marginBottom: "-15%" }}>
                <ResumePrintTemplate data={optimization} ref={printRef} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedResult;
