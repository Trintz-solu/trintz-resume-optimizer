import { useState } from "react";
import { Zap, Eye, EyeOff, ArrowRight, CheckCircle2, TrendingUp, Shield } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const perks = [
  { icon: TrendingUp, text: "39% higher ATS pass rate" },
  { icon: Shield, text: "Deterministic, consistent scoring" },
  { icon: CheckCircle2, text: "AI rewrites with action verbs + metrics" },
];

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
    <div className="min-h-screen bg-background flex">
      {/* Left panel — gradient */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "var(--gradient-primary)" }}>
        <div className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full opacity-20 animate-spin-slow"
          style={{ background: "radial-gradient(circle, white, transparent)", filter: "blur(40px)" }} />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">AI Resume Optimizer</span>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Beat the ATS.<br />Land the Interview.
          </h2>
          <p className="text-white/75 text-sm leading-relaxed max-w-xs">
            Our deterministic scoring engine and AI rewriter give you a measurable edge in every application.
          </p>
          <div className="space-y-3">
            {perks.map((p) => (
              <div key={p.text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 shrink-0">
                  <p.icon className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm text-white/85 font-medium">{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative text-xs text-white/50">© 2026 AI Resume Optimizer</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col">
        {/* Mobile top bar */}
        <nav className="border-b border-border bg-card/80 backdrop-blur-xl px-6 py-3.5 lg:hidden">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "var(--gradient-primary)" }}>
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-foreground">AI Resume Optimizer</span>
          </button>
        </nav>

        <div className="flex flex-1 items-center justify-center px-6 py-14">
          <div className="w-full max-w-[400px] space-y-8">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Welcome back</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Sign in to continue optimizing your resume.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="section-label">Email Address</label>
                <input type="email" placeholder="you@example.com" required autoComplete="email"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field h-11" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="section-label">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Your password" required autoComplete="current-password"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field h-11 pr-11" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="btn-gradient w-full h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
                {loading
                  ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Signing in...</>
                  : <>Sign In <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="font-bold text-primary hover:underline">Create one free →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
