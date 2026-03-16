import { CloudUpload, ClipboardList, Download } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: CloudUpload,
        title: "Upload Your Resume",
        description: "Drag and drop your existing resume in PDF or DOCX format. We'll parse it instantly.",
    },
    {
        number: "02",
        icon: ClipboardList,
        title: "Paste the Job Description",
        description: "Copy and paste the job description you're applying for. Our AI will analyze every requirement.",
    },
    {
        number: "03",
        icon: Download,
        title: "Download Your Optimized Resume",
        description: "Get a fully tailored, ATS-optimized resume in seconds. Copy or download it instantly.",
    },
];

const HowItWorks = () => (
    <section
        id="how-it-works"
        className="py-24 md:py-32"
        style={{ background: "hsl(210 40% 98%)" }}
    >
        <div className="mx-auto max-w-[1120px] px-6">
            {/* Header */}
            <div className="text-center mb-16 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Simple Process</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-[44px] leading-tight">
                    How It Works
                </h2>
                <p className="text-base text-muted-foreground max-w-md mx-auto">
                    From upload to optimized resume in three simple steps.
                </p>
            </div>

            {/* Steps */}
            <div className="relative grid gap-8 md:grid-cols-3">
                {/* Connector line (desktop) */}
                <div
                    className="absolute top-10 left-[calc(16.66%+28px)] right-[calc(16.66%+28px)] hidden h-px md:block"
                    style={{ background: "linear-gradient(90deg, hsl(221 83% 53% / 0.3), hsl(239 84% 67% / 0.3))" }}
                />

                {steps.map((step, i) => (
                    <div key={step.number} className="flex flex-col items-center text-center gap-5">
                        {/* Circle with number */}
                        <div className="relative flex-shrink-0">
                            <div
                                className="flex h-20 w-20 items-center justify-center rounded-full border-2 bg-card shadow-elevated"
                                style={{ borderColor: "hsl(221 83% 53% / 0.3)" }}
                            >
                                <step.icon className="h-8 w-8" style={{ color: "hsl(221 83% 53%)" }} />
                            </div>
                            <div
                                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                style={{ background: "var(--gradient-primary)" }}
                            >
                                {i + 1}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Step {step.number}
                            </p>
                            <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px] mx-auto">
                                {step.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default HowItWorks;
