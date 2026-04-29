import { useState } from "react";
import { Sparkles, Loader2, ArrowLeft, BarChart2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ResumeUpload from "@/components/ResumeUpload";
import JobDescription from "@/components/JobDescription";
import OptimizedResult, { AnalysisResult, OptimizationResult } from "@/components/OptimizedResult";
import UsageBanner from "@/components/UsageBanner";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const FREE_LIMIT = 2;
const PRO_LIMIT = 10;

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

            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.detail || "Analysis failed. Please try again.");
            }

            const data = await response.json();
            setAnalysisResult(data);
            toast.success("Analysis complete!");
        } catch (err: any) {
            toast.error(err.message || "Something went wrong.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleOptimize = async () => {
        if (!analysisResult?.resume_text_extracted) { toast.error("Please analyze your resume first."); return; }
        if (isLimitReached) {
            toast.error("Free plan limit reached. Upgrade to Pro to continue.");
            setShowUpgradeModal(true);
            return;
        }

        setIsOptimizing(true);
        setOptimizationResult(null);

        try {
            const formData = new FormData();
            formData.append("resume_text", analysisResult.resume_text_extracted);
            formData.append("job_description", jobDescription);
            formData.append("mode", mode);

            const response = await fetch("/api/optimize", {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });

            if (response.status === 403) {
                setShowUpgradeModal(true);
                return;
            }
            if (!response.ok) throw new Error("Optimization failed. Please try again.");

            const data = await response.json();
            // Data returns both { ...analysis, ...optimization } but we only need optimization part
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

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            {/* Page header */}
            <div className="border-b border-border"
                style={{ background: "radial-gradient(ellipse 80% 60% at 50% -20%, hsl(221 83% 53% / 0.06), transparent)" }}>
                <div className="mx-auto max-w-[900px] px-6 py-10 md:py-14">
                    <button onClick={() => navigate("/")}
                        className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                        <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
                    </button>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                                Smart Resume Optimizer
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground max-w-md">
                                Analyze your ATS score instantly, then optionally let AI deeply rewrite your resume for the job description.
                            </p>
                        </div>
                        {user && (
                            <div className="hidden sm:block text-right shrink-0">
                                <p className="text-sm font-semibold text-foreground">Hello, {user.name.split(" ")[0]} 👋</p>
                                <p className="text-xs text-muted-foreground capitalize">{user.plan} plan</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tool section */}
            <section className="mx-auto max-w-[900px] px-6 py-12 md:py-16">
                <UsageBanner />

                <div className="space-y-8">
                    {/* Step 1 Input */}
                    <div className="card-premium-elevated p-6 sm:p-8 md:p-10 space-y-8">
                        <ResumeUpload file={file} onFileChange={(f) => {
                           setFile(f); setAnalysisResult(null); setOptimizationResult(null);
                        }} />
                        <div className="section-divider" />
                        <JobDescription value={jobDescription} onChange={(v) => {
                           setJobDescription(v); setAnalysisResult(null); setOptimizationResult(null);
                        }} />

                        {!analysisResult && (
                           <button
                               onClick={handleAnalyze}
                               disabled={isAnalyzing || !isReadyForAnalyze}
                               className={`w-full h-12 rounded-xl text-sm font-semibold border-2 border-primary/20 bg-primary/5 text-primary flex items-center justify-center gap-2.5 hover:bg-primary/10 transition-colors ${
                                   (!isReadyForAnalyze && !isAnalyzing) ? "opacity-50 cursor-not-allowed" : ""
                               }`}
                           >
                               {isAnalyzing ? (
                                   <><Loader2 className="h-[18px] w-[18px] animate-spin" /><span>Running ATS Evaluator...</span></>
                               ) : (
                                   <><BarChart2 className="h-[18px] w-[18px]" /><span>Step 1: Analyze Resume</span></>
                               )}
                           </button>
                        )}
                    </div>

                    {/* Step 2 AI Deep Rewrite */}
                    {analysisResult && (
                        <div className="animate-fade-in-up card-premium p-6 sm:p-8 space-y-6 border-l-4 border-l-primary">
                            <div>
                                <h3 className="font-bold text-foreground">Ready for Deep Rewrite</h3>
                                <p className="text-sm text-muted-foreground">Select an optimization mode and instantly upgrade your resume. This uses 1 credit.</p>
                            </div>
                            
                            <div className="flex bg-muted p-1 rounded-xl w-max">
                                <button
                                    onClick={() => setMode("basic")}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${mode === "basic" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    Basic (Fast Fixes)
                                </button>
                                <button
                                    onClick={() => setMode("advanced")}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${mode === "advanced" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    Advanced (Deep Rewrite)
                                </button>
                            </div>

                            <button
                                onClick={handleOptimize}
                                disabled={isOptimizing || isLimitReached}
                                className={`btn-gradient relative w-full h-12 rounded-xl text-sm font-semibold text-primary-foreground flex items-center justify-center gap-2.5 overflow-hidden ${
                                    isLimitReached ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {isOptimizing && <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>}
                                {isOptimizing ? (
                                    <><Loader2 className="h-[18px] w-[18px] animate-spin relative z-10" /><span className="relative z-10">AI is Writing...</span></>
                                ) : isLimitReached ? (
                                    <span>Upgrade to Pro to continue</span>
                                ) : (
                                    <><Sparkles className="h-[18px] w-[18px] relative z-10" /><span className="relative z-10">Step 2: Generate Rewrite (1 Credit)</span></>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Results Display */}
                    {(analysisResult || optimizationResult) && (
                        <div className="card-premium-elevated p-6 sm:p-8 md:p-10">
                            <OptimizedResult analysis={analysisResult} optimization={optimizationResult} />
                        </div>
                    )}
                </div>
            </section>

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-elevated animate-fade-in-up">
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                        <h3 className="mb-2 text-lg font-bold text-foreground">Usage limit reached</h3>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Upgrade to Pro to unlock Deep AI rewrites.
                        </p>
                        <button
                            onClick={() => {
                                setShowUpgradeModal(false);
                                navigate("/#pricing");
                            }}
                            className="btn-gradient w-full rounded-xl py-3 text-sm font-semibold text-primary-foreground"
                        >
                            Upgrade to Pro
                        </button>
                    </div>
                </div>
            )}

            <footer className="border-t border-border bg-card/50 py-8 mt-auto">
                <div className="mx-auto max-w-[1120px] px-6 text-center">
                    <p className="text-xs text-muted-foreground">© 2026 AI Resume Optimizer. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Optimizer;
