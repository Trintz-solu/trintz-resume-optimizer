import { ArrowRight, Shield, TrendingUp, Star, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden">
      {/* Subtle background gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% -10%, hsl(221 83% 53% / 0.06), transparent)",
        }}
      />

      <div className="mx-auto max-w-[1120px] px-6 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Left */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-card">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              #1 AI Resume Tool — Trusted by 50,000+ users
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground md:text-[52px]">
              Optimize Your Resume
              <span className="block" style={{ color: "hsl(221 83% 53%)" }}>
                for Every Job
              </span>
            </h1>

            <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Upload your resume and a job description. Our AI analyzes both and rewrites your resume to match the job and improve ATS score.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/optimizer")}
                className="btn-gradient inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 text-sm font-semibold text-primary-foreground"
              >
                Upload Resume
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={scrollToHowItWorks}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-card transition-all hover:bg-accent hover:border-primary/30"
              >
                See How It Works
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-success" />
                39% more likely to pass ATS
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                Trusted by thousands
              </div>
            </div>
          </div>

          {/* Right — Product Preview Card */}
          <div className="relative">
            {/* Main card */}
            <div className="card-premium-elevated relative overflow-hidden p-6 md:p-8">
              {/* Header */}
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Resume Analysis
                  </p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    John Doe — Software Engineer
                  </p>
                </div>
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: "hsl(221 83% 53% / 0.1)" }}
                >
                  <span
                    className="text-xl font-extrabold"
                    style={{ color: "hsl(221 83% 53%)" }}
                  >
                    85%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
                  <span>ATS Match Score</span>
                  <span className="text-foreground font-semibold">85%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-secondary">
                  <div
                    className="h-2.5 rounded-full"
                    style={{ width: "85%", background: "var(--gradient-primary)" }}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground mb-2.5">
                  Matched Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Python", "Machine Learning", "Data Analysis", "TensorFlow", "SQL"].map(
                    (skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
                      >
                        <CheckCircle2 className="h-3 w-3 text-success" />
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Resume lines mock */}
              <div className="space-y-2.5">
                <div className="h-2.5 w-full rounded bg-secondary" />
                <div className="h-2.5 w-4/5 rounded bg-secondary" />
                <div className="h-2.5 w-11/12 rounded bg-secondary" />
                <div className="h-2.5 w-3/5 rounded bg-secondary" />
              </div>
            </div>

            {/* Floating badge — ATS Optimized */}
            <div className="absolute -right-2 top-6 md:-right-4 animate-fade-in-up">
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground shadow-elevated">
                <Shield className="h-3.5 w-3.5 text-success" />
                ATS Optimized
              </div>
            </div>

            {/* Floating score */}
            <div
              className="absolute -left-2 bottom-8 md:-left-4 animate-fade-in-up"
              style={{ animationDelay: "0.15s" }}
            >
              <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 shadow-elevated">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: "hsl(142 71% 45% / 0.12)" }}
                >
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">+39%</p>
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
