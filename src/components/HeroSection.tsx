import { ArrowRight, Shield, TrendingUp, Star, CheckCircle2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = target / 55;
      const tick = () => {
        start = Math.min(start + step, target);
        setCount(Math.floor(start));
        if (start < target) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const HeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hero-bg mesh-bg" />
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-[0.07] animate-spin-slow"
        style={{ background: "var(--gradient-primary)", filter: "blur(80px)" }} />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full opacity-[0.06] animate-float"
        style={{ background: "hsl(270 85% 70%)", filter: "blur(60px)" }} />

      <div className="mx-auto max-w-[1180px] px-6 py-16 md:py-24 lg:py-28">
        <div className="grid items-center gap-14 md:grid-cols-2 md:gap-16">
          {/* Left */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-sm px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-card">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              #1 AI Resume Tool — Trusted by 50,000+ job seekers
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-foreground md:text-[52px]">
              Land More Interviews{" "}
              <span className="gradient-text">with AI-Optimized</span>{" "}
              Resumes
            </h1>

            <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Upload your resume and job description. Our deterministic ATS engine scores
              your match, then AI rewrites your resume with impact metrics — in 30 seconds.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => navigate("/optimizer")}
                className="btn-gradient inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4" /> Optimize My Resume <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 backdrop-blur-sm px-6 py-3.5 text-sm font-semibold text-foreground shadow-card transition-all hover:bg-accent hover:border-primary/30">
                See How It Works
              </button>
            </div>

            <div className="flex flex-wrap gap-5 pt-1">
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-emerald-500" /> 39% higher ATS pass rate
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" /> 100% deterministic scoring
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> No credit card required
              </span>
            </div>
          </div>

          {/* Right — preview card */}
          <div className="relative animate-fade-in-up delay-150">
            <div className="card-glass p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Live ATS Analysis</p>
                  <p className="mt-1 text-base font-bold text-foreground">Software Engineer · Google</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl animate-glow-pulse"
                  style={{ background: "hsl(var(--primary) / 0.12)" }}>
                  <span className="text-xl font-black gradient-text"><AnimatedCounter target={87} suffix="%" /></span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-2">
                  <span className="text-muted-foreground">ATS Match Score</span>
                  <span className="gradient-text">87 / 100</span>
                </div>
                <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: "87%" }} /></div>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Keyword Match", w: "85%" },
                  { label: "Sections", w: "100%" },
                  { label: "Contact Info", w: "100%" },
                  { label: "Quantified Impact", w: "80%" },
                  { label: "Length", w: "70%" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="w-32 text-[11px] font-medium text-muted-foreground shrink-0">{item.label}</span>
                    <div className="flex-1 progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: item.w }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {["React", "TypeScript", "Node.js", "System Design"].map((kw) => (
                  <span key={kw} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))", border: "1px solid hsl(var(--primary) / 0.2)" }}>
                    <CheckCircle2 className="h-3 w-3" />{kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="absolute -right-3 top-8 md:-right-6 animate-float" style={{ animationDelay: "0.2s" }}>
              <div className="card-glass flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-foreground shadow-elevated">
                <Shield className="h-3.5 w-3.5 text-emerald-500" /> ATS Optimized
              </div>
            </div>
            <div className="absolute -left-3 bottom-10 md:-left-6 animate-float" style={{ animationDelay: "0.5s" }}>
              <div className="card-glass flex items-center gap-2 rounded-xl px-4 py-2.5 shadow-elevated">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "hsl(142 71% 45% / 0.12)" }}>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-foreground">+39%</p>
                  <p className="text-[10px] text-muted-foreground">ATS Pass Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
