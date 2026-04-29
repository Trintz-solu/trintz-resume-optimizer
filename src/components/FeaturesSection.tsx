import { Sparkles, Target, Zap, BarChart2, FileText, Download } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Rule-Based ATS Scoring",
    description: "Deterministic 5-category scoring engine — identical inputs always produce identical scores. No LLM randomness. Matches how Workday, Greenhouse & Lever actually work.",
    color: "hsl(243 80% 68%)",
    bg: "hsl(243 80% 68% / 0.1)",
  },
  {
    icon: Sparkles,
    title: "AI Resume Rewrite",
    description: "Action-verb + metric-enforced rewrites powered by GPT-4o. Every bullet starts with impact and ends with a number. Zero fluff, maximum signal.",
    color: "hsl(270 85% 70%)",
    bg: "hsl(270 85% 70% / 0.1)",
  },
  {
    icon: BarChart2,
    title: "Keyword Gap Analysis",
    description: "TF-IDF keyword extraction identifies exactly which JD terms are missing from your resume and injects them naturally in the rewrite.",
    color: "hsl(196 100% 50%)",
    bg: "hsl(196 100% 50% / 0.1)",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "ATS scoring takes under 1 second — pure Python, no API calls. The AI rewrite completes in under 30 seconds. From upload to optimized resume in one click.",
    color: "hsl(38 92% 55%)",
    bg: "hsl(38 92% 55% / 0.1)",
  },
  {
    icon: FileText,
    title: "Structured JSON Resume",
    description: "Every rewrite is validated against a strict Pydantic schema. You get clean structured data: personal info, experience, projects, skills, and education.",
    color: "hsl(142 71% 45%)",
    bg: "hsl(142 71% 45% / 0.1)",
  },
  {
    icon: Download,
    title: "PDF Download",
    description: "Export your fully optimized, ATS-ready resume as a professionally formatted PDF in one click — ready to send to recruiters.",
    color: "hsl(0 72% 60%)",
    bg: "hsl(0 72% 60% / 0.1)",
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-24 md:py-32">
    <div className="mx-auto max-w-[1180px] px-6">
      <div className="text-center mb-16 space-y-4">
        <div className="badge-primary mx-auto w-fit">
          <Sparkles className="h-3.5 w-3.5" /> Built for serious job seekers
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-[44px] leading-tight">
          Why Use <span className="gradient-text">AI Resume Optimizer?</span>
        </h2>
        <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Stop sending generic resumes. Our stack combines deterministic scoring with AI rewrites
          to give you a measurable competitive edge.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <div key={f.title} className="feature-card animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
              style={{ background: f.bg }}>
              <f.icon className="h-5 w-5" style={{ color: f.color }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-[16px] font-bold text-foreground">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
