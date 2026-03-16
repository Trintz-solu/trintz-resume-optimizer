import { useState } from "react";
import { Zap, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const from = (location.state as any)?.from?.pathname || "/optimizer";

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success("Welcome back!");
            navigate(from, { replace: true });
        } catch (err: any) {
            toast.error(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navbar strip */}
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
                <div className="w-full max-w-[420px]">
                    {/* Card */}
                    <div className="card-premium-elevated p-8 md:p-10">
                        <div className="mb-7 text-center">
                            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Welcome back</h1>
                            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your account to continue</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="section-label">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="textarea-modern h-11 resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="section-label">Password</label>
                                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Your password"
                                        required
                                        autoComplete="current-password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="textarea-modern h-11 resize-none pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-gradient w-full h-11 rounded-xl text-sm font-semibold text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                            >
                                {loading ? (
                                    <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />Signing in...</>
                                ) : "Sign In"}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link to="/signup" className="font-semibold text-primary hover:underline">
                                Create one free →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
