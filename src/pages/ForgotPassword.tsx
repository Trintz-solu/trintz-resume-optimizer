import { useState } from "react";
import { Zap, ArrowLeft, Mail } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/request-password-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                setSubmitted(true);
            } else {
                toast.error(data.detail || "Failed to request password reset.");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <nav className="border-b border-border bg-card/80 backdrop-blur-xl px-6 py-3.5">
                <div className="mx-auto flex max-w-[1120px] items-center justify-between">
                    <button onClick={() => navigate("/")} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Zap className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="text-[15px] font-bold tracking-tight text-foreground">AI Resume Optimizer</span>
                    </button>
                    <button onClick={() => navigate("/login")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Login
                    </button>
                </div>
            </nav>

            <div className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="w-full max-w-[400px]">
                    <div className="card-premium-elevated p-8 md:p-10">
                        <div className="mb-6 flex items-center justify-center gap-2.5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-2">Reset Password</h1>
                            <p className="text-sm text-muted-foreground">
                                Enter your email and we'll send you a link to reset your password.
                            </p>
                        </div>

                        {submitted ? (
                            <div className="text-center space-y-6">
                                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                                    <p className="text-sm font-medium text-success">
                                        If an account exists, a password reset link has been sent to your email.
                                    </p>
                                </div>
                                <button onClick={() => navigate("/login")} className="btn-gradient w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center">
                                    Return to Login
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="section-label">Email Address</label>
                                    <input type="email" placeholder="you@example.com" required autoComplete="email"
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="textarea-modern h-11 resize-none w-full" />
                                </div>
                                <button type="submit" disabled={loading}
                                    className="btn-gradient w-full h-11 rounded-xl text-sm font-semibold text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4">
                                    {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Send Reset Link"}
                                </button>
                            </form>
                        )}

                        {!submitted && (
                            <p className="mt-6 text-center text-sm text-muted-foreground">
                                Remember your password?{" "}
                                <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
