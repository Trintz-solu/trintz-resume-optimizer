import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Zap, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { API_URL } from "@/lib/config";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"waiting" | "loading" | "success" | "error">(
        token ? "loading" : "waiting"
    );
    const fetched = useRef(false);

    useEffect(() => {
        if (!token) return; // No token = user just signed up, waiting for email click

        if (fetched.current) return;
        fetched.current = true;

        const verify = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/verify-email?token=${token}`);
                if (res.ok) {
                    setStatus("success");
                    toast.success("Email verified! Redirecting to login...");
                    setTimeout(() => navigate("/login"), 3000);
                } else {
                    const data = await res.json();
                    setStatus("error");
                    toast.error(data.detail || "Verification failed.");
                }
            } catch {
                setStatus("error");
                toast.error("Network error during verification.");
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Subtle background gradient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] pointer-events-none opacity-50" />

            <div className="relative z-10 w-full max-w-[420px] rounded-2xl border border-border bg-card p-10 text-center shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] transition-all duration-500 animate-fade-in-up">
                
                {status === "waiting" && (
                    <div className="animate-fade-in-up">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6 shadow-inner">
                            <Zap className="h-8 w-8 text-primary" />
                        </div>
                        <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-3">
                            Check Your Inbox
                        </h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            We've sent a verification link to your email address. Please click it to verify your account.
                        </p>
                    </div>
                )}

                {status === "loading" && (
                    <div className="flex flex-col items-center space-y-6 animate-pulse-subtle">
                        <div className="relative flex h-16 w-16 items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Verifying your email</h2>
                            <p className="text-sm text-muted-foreground mt-1">Please wait a moment...</p>
                        </div>
                    </div>
                )}

                {status === "success" && (
                    <div className="animate-fade-in-up">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-6 transform scale-100 transition-transform duration-500">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-foreground mb-3">
                            Email Verified!
                        </h1>
                        <p className="text-sm text-muted-foreground mb-8">
                            Your account is ready. Redirecting you to login...
                        </p>
                        <button
                            onClick={() => navigate("/login")}
                            className="w-full rounded-xl bg-foreground text-background py-3 text-sm font-semibold hover:bg-foreground/90 transition-colors shadow-md"
                        >
                            Go to Login
                        </button>
                    </div>
                )}

                {status === "error" && (
                    <div className="animate-fade-in-up">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-6">
                            <XCircle className="h-8 w-8 text-destructive" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-foreground mb-3">
                            Verification Failed
                        </h1>
                        <p className="text-sm text-muted-foreground mb-8">
                            The link may be invalid or expired. Please try signing up again or request a new link.
                        </p>
                        <button
                            onClick={() => navigate("/signup")}
                            className="w-full rounded-xl border border-border bg-card py-3 text-sm font-semibold hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                            Back to Sign Up
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
