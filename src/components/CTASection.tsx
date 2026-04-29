import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
          {/* Subtle shimmer overlay */}
          <div className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(255,255,255,0.06) 100%)" }} />
          <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-20 animate-spin-slow"
            style={{ background: "radial-gradient(circle, white, transparent)", filter: "blur(40px)" }} />

          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm border border-white/20">
              <Sparkles className="h-3.5 w-3.5" /> Get started in 30 seconds
            </div>
            <h2 className="text-3xl font-extrabold text-white md:text-[44px] leading-tight">
              Ready to Beat the ATS?
            </h2>
            <p className="text-base text-white/80 max-w-md mx-auto leading-relaxed">
              Join 50,000+ job seekers who've improved their resume score and landed more interviews.
              Free to start — no credit card required.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button onClick={() => navigate("/optimizer")}
                className="inline-flex items-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
                Optimize My Resume <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/20">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
