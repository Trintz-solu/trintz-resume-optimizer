import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="py-24">
            <div className="mx-auto max-w-[1120px] px-6">
                <div
                    className="relative overflow-hidden rounded-3xl px-8 py-20 text-center"
                    style={{
                        background: "var(--gradient-primary)",
                        boxShadow: "var(--shadow-glow)",
                    }}
                >
                    {/* Background orbs */}
                    <div
                        className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full opacity-20"
                        style={{ background: "hsl(0 0% 100% / 0.3)", filter: "blur(60px)" }}
                    />
                    <div
                        className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full opacity-20"
                        style={{ background: "hsl(0 0% 100% / 0.3)", filter: "blur(60px)" }}
                    />

                    <div className="relative space-y-6 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-[44px] leading-tight">
                            Ready to optimize your resume?
                        </h2>
                        <p className="text-base text-white/80 leading-relaxed">
                            Join 50,000+ job seekers who've already improved their chances with AI-powered resume optimization.
                        </p>
                        <button
                            onClick={() => navigate("/optimizer")}
                            className="inline-flex items-center gap-2.5 rounded-xl bg-white px-8 py-4 text-sm font-bold shadow-elevated transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                            style={{ color: "hsl(221 83% 53%)" }}
                        >
                            Upload Resume
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
