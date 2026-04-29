import { useState } from "react";
import { Zap, Eye, EyeOff, ArrowRight, CheckCircle2, Target, Sparkles } from "lucide-react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const perks = [
  { icon: Sparkles, text: "AI rewrites with action verbs + metrics" },
  { icon: Target, text: "5-category deterministic ATS scoring" },
  { icon: CheckCircle2, text: "Download ATS-optimized PDF instantly" },
];

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") === "enterprise" ? "enterprise" : "pro";
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      const res = await register(form.name, form.email, form.password);
      if (res?.message?.includes("log in immediately")) {
        toast.success(res.message);
        navigate("/login");
      } else {
        toast.success("Account created! Check your email to verify.");
        navigate("/verify-email");
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left gradient panel */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "var(--gradient-primary)" }}>
        <div className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 60%)" }} />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full opacity-20 animate-float"
          style={{ background: "radial-gradient(circle, white, transparent)", filter: "blur(40px)" }} />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-extrabold text-white tracking-tight">AI Resume Optimizer</span>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-3xl font-extrabold text-white leading-tight">
            Your Career.<br />Optimized by AI.
          </h2>
          <p className="text-white/75 text-sm leading-relaxed max-w-xs">
            Join 50,000+ job seekers who've improved their ATS scores and landed more interviews.
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
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm px-3.5 py-1.5 border border-white/20">
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-semibold text-white">Free to start — no credit card required</span>
          </div>
        </div>

        <p className="relative text-xs text-white/50">© 2026 AI Resume Optimizer</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col">
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
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Create your account</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">Start optimizing resumes in under a minute.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="section-label">Full Name</label>
                <input type="text" placeholder="John Doe" required autoComplete="name"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="section-label">Email Address</label>
                <input type="email" placeholder="you@example.com" required autoComplete="email"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="section-label">Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" required minLength={8} autoComplete="new-password"
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
                  ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Creating account...</>
                  : <>Create Free Account <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-primary hover:underline">Sign in →</Link>
            </p>
            <p className="text-center text-[11px] text-muted-foreground">
              By creating an account, you agree to our{" "}
              <span className="underline cursor-pointer hover:text-foreground">Terms</span> and{" "}
              <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
