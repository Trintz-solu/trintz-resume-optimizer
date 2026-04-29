import { CloudUpload, ClipboardList, Sparkles, Download } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: CloudUpload,
    title: "Upload Your Resume",
    description: "Drag and drop your PDF or DOCX. We extract and clean the text instantly on the server.",
    color: "hsl(243 80% 68%)",
    bg: "hsl(243 80% 68% / 0.1)",
  },
  {
    number: "02",
    icon: ClipboardList,
    title: "Paste the Job Description",
    description: "Copy the JD you're targeting. Our TF-IDF engine extracts the 25 most critical keywords.",
    color: "hsl(270 85% 70%)",
    bg: "hsl(270 85% 70% / 0.1)",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Get Your ATS Score",
    description: "Receive a 5-category score in under 1 second. Keyword match, sections, contact, metrics, and length.",
    color: "hsl(196 100% 50%)",
    bg: "hsl(196 100% 50% / 0.1)",
  },
  {
    number: "04",
    icon: Download,
    title: "Download Optimized Resume",
    description: "AI rewrites your resume with action verbs and metrics, then exports it as a professional PDF.",
    color: "hsl(142 71% 45%)",
    bg: "hsl(142 71% 45% / 0.1)",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 md:py-32 relative overflow-hidden">
    <div className="pointer-events-none absolute inset-0"
      style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, hsl(var(--primary) / 0.04), transparent)" }} />
    <div className="mx-auto max-w-[1180px] px-6">
      <div className="text-center mb-16 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Simple Process</p>
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-[44px] leading-tight">
          From Upload to Offer-Ready in{" "}
          <span className="gradient-text">4 Steps</span>
        </h2>
        <p className="text-base text-muted-foreground max-w-md mx-auto">
          The fastest path from an average resume to one that beats ATS filters.
        </p>
      </div>

      <div className="relative grid gap-8 md:grid-cols-4">
        {/* Connector line */}
        <div className="absolute top-10 left-[calc(12.5%+32px)] right-[calc(12.5%+32px)] hidden h-px md:block"
          style={{ background: "linear-gradient(90deg, hsl(243 80% 68% / 0.3), hsl(142 71% 45% / 0.3))" }} />

        {steps.map((step, i) => (
          <div key={step.number} className="flex flex-col items-center text-center gap-5 animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms` }}>
            <div className="relative flex-shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card shadow-elevated transition-all hover:shadow-glow"
                style={{ background: step.bg }}>
                <step.icon className="h-8 w-8" style={{ color: step.color }} />
              </div>
              <div className="step-badge absolute -top-2 -right-2">{i + 1}</div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Step {step.number}</p>
              <h3 className="text-base font-bold text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px] mx-auto">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
