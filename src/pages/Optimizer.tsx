import { useState } from "react";
import { Sparkles, Loader2, ArrowLeft, BarChart2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ResumeUpload from "@/components/ResumeUpload";
import JobDescription from "@/components/JobDescription";
import OptimizedResult, { AnalysisResult, OptimizationResult } from "@/components/OptimizedResult";
import UsageBanner from "@/components/UsageBanner";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";

const FREE_LIMIT = 2;
const PRO_LIMIT = 10;

const Step = ({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) => (
  <div className={`flex items-center gap-2 text-xs font-semibold transition-all ${active ? "text-primary" : done ? "text-emerald-500" : "text-muted-foreground"}`}>
    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all ${active ? "text-white shadow-glow-sm" : done ? "bg-emerald-500 text-white" : "border border-border bg-card text-muted-foreground"}`}
      style={active ? { background: "var(--gradient-primary)" } : {}}>
      {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : n}
    </div>
    <span className="hidden sm:block">{label}</span>
  </div>
);

const Optimizer = () => {
  const navigate = useNavigate();
  const { user, token, refreshUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [mode, setMode] = useState<"basic" | "advanced">("advanced");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isLimitReached =
    (user?.plan === "free" && (user?.usage_count ?? 0) >= FREE_LIMIT) ||
    (user?.plan === "pro" && (user?.usage_count ?? 0) >= PRO_LIMIT);

  const handleAnalyze = async () => {
    if (!file) { toast.error("Please upload your resume first."); return; }
    if (!jobDescription.trim()) { toast.error("Please paste a job description."); return; }
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setOptimizationResult(null);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("job_description", jobDescription);
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.detail || "Analysis failed. Please try again.");
      }
      const data = await response.json();
      setAnalysisResult(data);
      toast.success("ATS analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimize = async () => {
    if (!analysisResult?.resume_text_extracted) { toast.error("Please analyze first."); return; }
    if (isLimitReached) { setShowUpgradeModal(true); return; }
    setIsOptimizing(true);
    setOptimizationResult(null);
    try {
      const formData = new FormData();
      formData.append("resume_text", analysisResult.resume_text_extracted);
      formData.append("job_description", jobDescription);
      formData.append("mode", mode);
      const response = await fetch(`${API_URL}/api/optimize`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (response.status === 403) { setShowUpgradeModal(true); return; }
      if (!response.ok) throw new Error("Optimization failed. Please try again.");
      const data = await response.json();
      setOptimizationResult(data);
      toast.success("Resume optimized successfully!");
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsOptimizing(false);
    }
  };

  const isReadyForAnalyze = file && jobDescription.trim().length > 0;
  const currentStep = optimizationResult ? 3 : analysisResult ? 2 : 1;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="border-b border-border hero-bg">
        <div className="mx-auto max-w-[960px] px-6 py-10 md:py-14">
          <button onClick={() => navigate("/")}
            className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                Smart <span className="gradient-text">Resume Optimizer</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                Deterministic ATS scoring + AI rewrite with action verbs and impact metrics.
              </p>
            </div>
            {user && (
              <div className="hidden sm:block text-right shrink-0">
                <p className="text-sm font-bold text-foreground">Hello, {user.name.split(" ")[0]} 👋</p>
                <p className="text-xs text-muted-foreground capitalize mt-0.5">{user.plan} plan</p>
              </div>
            )}
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
            <Step n={1} label="Upload & Analyze" active={currentStep === 1} done={currentStep > 1} />
            <div className="flex-1 h-px bg-border max-w-[40px]" />
            <Step n={2} label="Review Score" active={currentStep === 2} done={currentStep > 2} />
            <div className="flex-1 h-px bg-border max-w-[40px]" />
            <Step n={3} label="AI Rewrite" active={currentStep === 3} done={false} />
          </div>
        </div>
      </div>

      {/* Tool */}
      <section className="mx-auto max-w-[960px] px-6 py-10 md:py-14">
        <UsageBanner />
        <div className="space-y-6 mt-6">
          {/* Input card */}
          <div className="card-premium-elevated p-6 sm:p-8 space-y-7">
            <ResumeUpload file={file} onFileChange={(f) => { setFile(f); setAnalysisResult(null); setOptimizationResult(null); }} />
            <div className="section-divider" />
            <JobDescription value={jobDescription} onChange={(v) => { setJobDescription(v); setAnalysisResult(null); setOptimizationResult(null); }} />

            {!analysisResult && (
              <button onClick={handleAnalyze} disabled={isAnalyzing || !isReadyForAnalyze}
                className={`w-full h-12 rounded-xl text-sm font-bold border-2 border-primary/20 bg-primary/5 text-primary flex items-center justify-center gap-2.5 hover:bg-primary/10 transition-all ${(!isReadyForAnalyze && !isAnalyzing) ? "opacity-50 cursor-not-allowed" : "hover:border-primary/40 hover:shadow-glow-sm"}`}>
                {isAnalyzing
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Running ATS Analysis...</>
                  : <><BarChart2 className="h-4 w-4" /> Step 1: Analyze Resume</>}
              </button>
            )}
          </div>

          {/* Rewrite card */}
          {analysisResult && (
            <div className="card-premium p-6 sm:p-8 space-y-5 border-l-4 border-l-primary animate-fade-in-up">
              <div>
                <h3 className="font-bold text-foreground">Step 2: AI Deep Rewrite</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a mode and let AI rewrite your resume with action verbs + metrics. Uses 1 credit.
                </p>
              </div>

              <div className="flex bg-muted p-1 rounded-xl w-max gap-1">
                {(["basic", "advanced"] as const).map((m) => (
                  <button key={m} onClick={() => setMode(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${mode === m ? "bg-card shadow-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    {m === "basic" ? "Basic (Fast Fixes)" : "Advanced (Deep Rewrite)"}
                  </button>
                ))}
              </div>

              <button onClick={handleOptimize} disabled={isOptimizing || isLimitReached}
                className={`btn-gradient w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2.5 ${isLimitReached ? "opacity-50 cursor-not-allowed" : ""}`}>
                {isOptimizing
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> AI is Rewriting...</>
                  : isLimitReached
                    ? "Upgrade to Pro to Continue"
                    : <><Sparkles className="h-4 w-4" /> Generate Optimized Resume (1 Credit)</>}
              </button>
            </div>
          )}

          {/* Results */}
          {(analysisResult || optimizationResult) && (
            <div className="card-premium-elevated p-6 sm:p-8 animate-fade-in-up">
              <OptimizedResult analysis={analysisResult} optimization={optimizationResult} />
            </div>
          )}
        </div>
      </section>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm card-glass p-8 animate-scale-in">
            <button onClick={() => setShowUpgradeModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4"
              style={{ background: "hsl(var(--primary) / 0.1)" }}>
              <Sparkles className="h-6 w-6" style={{ color: "hsl(var(--primary))" }} />
            </div>
            <h3 className="text-lg font-extrabold text-foreground mb-2">Limit Reached</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Upgrade to Pro for 10 AI rewrites, or Enterprise for unlimited access.
            </p>
            <button onClick={() => { setShowUpgradeModal(false); navigate("/#pricing"); }}
              className="btn-gradient w-full rounded-xl py-3 text-sm font-bold text-white">
              View Plans →
            </button>
          </div>
        </div>
      )}

      <footer className="border-t border-border bg-card/50 py-8 mt-10">
        <div className="mx-auto max-w-[960px] px-6 text-center">
          <p className="text-xs text-muted-foreground">© 2026 AI Resume Optimizer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Optimizer;
