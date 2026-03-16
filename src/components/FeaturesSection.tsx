import { Sparkles, Target, Zap } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Resume Optimization",
    description:
      "Automatically tailors your resume for each job description using advanced AI, highlighting the most relevant experience and skills.",
    color: "hsl(221 83% 53%)",
    bg: "hsl(221 83% 53% / 0.08)",
  },
  {
    icon: Target,
    title: "ATS Keyword Matching",
    description:
      "Ensures your resume includes the right keywords to pass Applicant Tracking Systems and reach human recruiters.",
    color: "hsl(142 71% 45%)",
    bg: "hsl(142 71% 45% / 0.08)",
  },
  {
    icon: Zap,
    title: "Instant Resume Rewrite",
    description:
      "Generate a fully rewritten, job-specific resume in under 30 seconds — no manual editing required.",
    color: "hsl(38 92% 50%)",
    bg: "hsl(38 92% 50% / 0.08)",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 md:py-32">
    <div className="mx-auto max-w-[1120px] px-6">
      {/* Header */}
      <div className="text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-card">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Built for job seekers
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-[44px] leading-tight">
          Why Use <span style={{ color: "hsl(221 83% 53%)" }}>AI Resume Optimizer?</span>
        </h2>
        <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Stop sending generic resumes. Our AI personalizes every application to give you the best shot at landing interviews.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="group card-premium p-8 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
          >
            <div
              className="flex h-13 w-13 items-center justify-center rounded-2xl"
              style={{ background: f.bg, width: "52px", height: "52px" }}
            >
              <f.icon className="h-6 w-6" style={{ color: f.color }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-[17px] font-bold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
