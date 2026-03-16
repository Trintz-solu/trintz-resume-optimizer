import { useState } from "react";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ResumeUpload from "@/components/ResumeUpload";
import JobDescription from "@/components/JobDescription";
import OptimizedResult from "@/components/OptimizedResult";
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
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const isLimitReached =
        (user?.plan === "free" && (user?.usage_count ?? 0) >= FREE_LIMIT) ||
        (user?.plan === "pro" && (user?.usage_count ?? 0) >= PRO_LIMIT);

    const handleOptimize = async () => {
        if (!file) { toast.error("Please upload your resume first."); return; }
        if (!jobDescription.trim()) { toast.error("Please paste a job description."); return; }
        if (isLimitReached) {
            toast.error("Free plan limit reached. Upgrade to Pro to continue.");
            return;
        }

        setLoading(true);
        setResult("");

        try {
            const formData = new FormData();
            formData.append("resume", file);
            formData.append("job_description", jobDescription);

            const response = await fetch("/api/optimize", {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });

            if (response.status === 403) {
                setShowUpgradeModal(true);
                return;
            }
            if (!response.ok) {
                throw new Error("Optimization failed. Please try again.");
            }

            const data = await response.text();
            setResult(data);
            toast.success("Resume optimized successfully!");
            // Refresh user to get updated usage count
            await refreshUser();
        } catch (err: any) {
            toast.error(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const isReady = file && jobDescription.trim().length > 0 && !isLimitReached;

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
                                Optimize Your Resume
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground max-w-md">
                                Upload your resume and paste the job description to get an AI-optimized version.
                            </p>
                        </div>
                        {/* Greeting */}
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
                {/* Usage banner */}
                <UsageBanner />

                <div className="space-y-8">
                    <div className="card-premium-elevated p-6 sm:p-8 md:p-10 space-y-8">
                        <ResumeUpload file={file} onFileChange={setFile} />
                        <div className="section-divider" />
                        <JobDescription value={jobDescription} onChange={setJobDescription} />

                        <button
                            onClick={handleOptimize}
                            disabled={loading || isLimitReached}
                            className={`btn-gradient w-full h-12 rounded-xl text-sm font-semibold text-primary-foreground flex items-center justify-center gap-2.5 ${(!isReady && !loading) || isLimitReached ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {loading ? (
                                <><Loader2 className="h-[18px] w-[18px] animate-spin" /><span>Analyzing...</span></>
                            ) : isLimitReached ? (
                                <span>Upgrade to Pro to continue</span>
                            ) : (
                                <><Sparkles className="h-[18px] w-[18px]" /><span>Optimize Resume</span></>
                            )}
                        </button>
                    </div>

                    {result && (
                        <div className="card-premium-elevated p-6 sm:p-8 md:p-10">
                            <OptimizedResult result={result} />
                        </div>
                    )}
                </div>
            </section>

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-elevated">
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                        <h3 className="mb-2 text-lg font-bold text-foreground">Usage limit reached</h3>
                        <p className="mb-6 text-sm text-muted-foreground">
                            Upgrade to Pro to continue optimizing resumes.
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

            <footer className="border-t border-border bg-card/50 py-8">
                <div className="mx-auto max-w-[1120px] px-6 text-center">
                    <p className="text-xs text-muted-foreground">© 2026 AI Resume Optimizer. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Optimizer;
