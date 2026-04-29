import { Copy, Download, Check, Target, Lightbulb, Briefcase, FileText, AlertCircle, TrendingUp, HelpCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import ResumePrintTemplate from "./ResumePrintTemplate";

export interface AnalysisResult {
  ats_score: { total: number; keyword_match: number; section_completeness: number; content_strength: number; confidence: string };
  critical_keywords: string[];
  found_keywords: string[];
  missing_keywords: string[];
  resume_text_extracted?: string;
}

export interface OptimizationResult {
  personal_info?: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
  };
  summary: string;
  experience: {
    company: string;
    title: string;
    start_date: string;
    end_date: string;
    bullets: string[];
  }[];
  projects: { 
    name: string; 
    start_date: string;
    end_date: string;
    bullets: string[]; 
  }[];
  skills: string[];
  education: { degree: string; institution: string; graduation_year: string }[];
  auto_applied_keywords?: string[];
}

interface Props {
  analysis: AnalysisResult | null;
  optimization: OptimizationResult | null;
}

const ScoreRing = ({ score, size = 100, strokeWidth = 8 }: { score: number, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90 transform">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" className="text-muted" strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold text-foreground leading-none">{score}</span>
      </div>
    </div>
  );
};

const DiffCard = ({ before, after, explanation, title }: { before: string, after: string, explanation: string, title?: string }) => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    {title && <div className="bg-muted px-4 py-2 border-b border-border text-xs font-semibold">{title}</div>}
    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
      <div className="p-4 bg-destructive/5 space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-destructive/70">Original</span>
        <p className="text-sm text-foreground/80 leading-relaxed">{before}</p>
      </div>
      <div className="p-4 bg-success/5 space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-green-600">Optimized</span>
        <p className="text-sm text-foreground leading-relaxed font-medium">{after}</p>
      </div>
    </div>
    <div className="bg-accent/50 px-4 py-3 flex items-start gap-2 border-t border-border">
      <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
      <span className="text-xs text-muted-foreground leading-relaxed">{explanation}</span>
    </div>
  </div>
);

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-all">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};

const OptimizedResult = ({ analysis, optimization }: Props) => {
  if (!analysis) return null;

  const printRef = useRef<HTMLDivElement>(null);
  
  const handleDownload = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Optimized_Resume",
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* ATS Analysis Section (Step 1) */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">ATS Analysis</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 border border-border rounded-2xl p-6 bg-card flex flex-col items-center justify-center text-center gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase opacity-80 tracking-wider">Overall Score</h3>
            <ScoreRing score={analysis.ats_score.total} size={110} strokeWidth={10} />
            <span className={`text-sm font-bold ${analysis.ats_score.total >= 80 ? 'text-green-500' : analysis.ats_score.total >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
              {analysis.ats_score.confidence}
            </span>
          </div>
          <div className="col-span-1 md:col-span-2 border border-border rounded-2xl p-6 bg-card flex flex-col justify-center space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 mb-2">Score Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Keyword Match (50%)</span>
                <span className="font-bold">{analysis.ats_score.keyword_match}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{width: `${analysis.ats_score.keyword_match}%`}}></div></div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Section Completeness (20%)</span>
                <span className="font-bold">{analysis.ats_score.section_completeness}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{width: `${analysis.ats_score.section_completeness}%`}}></div></div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Content Strength (Metrics) (30%)</span>
                <span className="font-bold">{analysis.ats_score.content_strength}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{width: `${analysis.ats_score.content_strength}%`}}></div></div>
            </div>
          </div>
        </div>

        {/* Found vs Missing Keywords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {analysis.found_keywords.length > 0 && (
            <div className="border border-green-500/20 bg-green-500/5 rounded-2xl p-5 space-y-3">
              <span className="text-sm font-bold text-foreground flex items-center gap-2"><Check className="text-green-500 w-4 h-4"/> Found Keywords</span>
              <div className="flex flex-wrap gap-2">
                {analysis.found_keywords.map(kw => <span key={kw} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-green-500/10 text-green-600 border border-green-500/20">{kw}</span>)}
              </div>
            </div>
          )}
          {analysis.missing_keywords.length > 0 && (
            <div className="border border-amber-500/20 bg-amber-500/5 rounded-2xl p-5 space-y-3">
              <span className="text-sm font-bold text-foreground flex items-center gap-2"><AlertCircle className="text-amber-500 w-4 h-4"/> Missing Keywords</span>
              <div className="flex flex-wrap gap-2">
                {analysis.missing_keywords.map(kw => <span key={kw} className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">{kw}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Optimization Results (Step 2) */}
      {optimization && (
        <div className="space-y-6 pt-6 border-t border-border animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">AI Rewrite Results</h2>
          </div>

          {optimization.auto_applied_keywords?.length > 0 && (
            <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 flex gap-3 text-sm">
              <TrendingUp className="text-primary w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Keywords Successfully Injected: </span>
                <span className="text-muted-foreground">{optimization.auto_applied_keywords.join(", ")}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> New Finalized Resume Blueprint</h3>
                <div className="flex gap-2">
                   <button onClick={() => handleDownload()} className="btn-gradient inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm">
                      <Download className="h-4 w-4" /> Download PDF
                   </button>
                </div>
             </div>
             
             {/* Actual visual document rendering scaling hack for preview */}
             <div className="rounded-xl bg-gray-200/50 p-6 flex justify-center overflow-x-auto border border-border">
                 <div className="shadow-2xl ring-1 ring-black/5" style={{ transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-15%' }}>
                     <ResumePrintTemplate data={optimization} ref={printRef} />
                 </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SparklesIcon = (props: any) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>);

export default OptimizedResult;
