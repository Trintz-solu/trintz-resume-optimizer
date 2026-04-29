import { useState } from "react";
import { Zap, Eye, EyeOff, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Signup = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const plan = searchParams.get("plan") === "enterprise" ? "enterprise" : "pro";
    const isEnterprise = plan === "enterprise";

    const { register } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        setLoading(true);
        try {
            const res = await register(form.name, form.email, form.password);
            
            if (res && res.message && res.message.includes("log in immediately")) {
                toast.success(res.message);
                navigate("/login");
            } else {
                toast.success("Account created successfully! Please check your email to verify your account before upgrading.");
                navigate("/verify-email");
            }

        } catch (err: any) {
            toast.error(err.message || "Registration failed");
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
                    <button onClick={() => navigate("/")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </button>
                </div>
            </nav>

            <div className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="w-full max-w-[440px]">
                    <div className="card-premium-elevated p-8 md:p-10">
                        {/* Header */}
                        <div className="mb-6 flex items-center gap-2.5">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "hsl(221 83% 53% / 0.1)" }}>
                                <Sparkles className="h-5 w-5" style={{ color: "hsl(221 83% 53%)" }} />
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold tracking-tight text-foreground">Create your account</h1>
                                <p className="text-xs font-semibold text-muted-foreground mt-1">Get started with AI Resume Optimizer</p>
                            </div>
                        </div>

                        {/* Perks */}
                        <div className="mb-7 rounded-xl p-4 space-y-2" style={{ background: "hsl(221 83% 53% / 0.05)", border: "1px solid hsl(221 83% 53% / 0.15)" }}>
                            {["AI-powered resume analysis", "Actionable improvement suggestions", "Career progress tracking"].map((perk) => (
                                <div key={perk} className="flex items-center gap-2 text-xs font-medium text-foreground">
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
                                    {perk}
                                </div>
                            ))}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="section-label">Full Name</label>
                                <input type="text" placeholder="John Doe" required autoComplete="name"
                                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="textarea-modern h-11 resize-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="section-label">Email Address</label>
                                <input type="email" placeholder="you@example.com" required autoComplete="email"
                                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="textarea-modern h-11 resize-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="section-label">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters"
                                        required minLength={8} autoComplete="new-password"
                                        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="textarea-modern h-11 resize-none pr-10" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="btn-gradient w-full h-11 rounded-xl text-sm font-semibold text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1">
                                {loading ? (
                                    <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Creating account...</>
                                ) : "Create Account"}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
                        </p>
                    </div>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        By creating an account, you agree to our{" "}
                        <span className="underline cursor-pointer hover:text-foreground">Terms</span> and{" "}
                        <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
