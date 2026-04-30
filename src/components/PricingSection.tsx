import { CheckCircle2, Sparkles, Loader2, Zap, Crown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";

declare global { interface Window { Razorpay: any; } }

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "",
    description: "Perfect for trying the tool before committing.",
    features: [
      "2 resume optimizations",
      "Full ATS keyword analysis",
      "5-category score breakdown",
      "PDF/DOCX support",
    ],
    cta: "Get Started Free",
    highlighted: false,
    icon: Zap,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹299",
    period: "",
    description: "For active job seekers who apply frequently.",
    features: [
      "10 optimized resumes",
      "Full ATS keyword analysis",
      "AI deep rewrite",
      "PDF download",
      "Priority AI processing",
    ],
    cta: "Start Pro",
    highlighted: true,
    badge: "Most Popular",
    icon: Sparkles,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "₹4,999",
    period: "/month",
    description: "For teams, recruiters, and career coaches.",
    features: [
      "Unlimited optimizations",
      "Bulk resume processing",
      "Team collaboration",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Start Enterprise",
    highlighted: false,
    icon: Crown,
  },
];

const PricingSection = () => {
  const navigate = useNavigate();
  const { user, token, refreshUser } = useAuth();
  const [proLoading, setProLoading] = useState(false);

  const handleUpgrade = async (planId: "pro" | "enterprise") => {
    if (!user) { navigate(`/signup?plan=${planId}`); return; }
    if (user.plan === planId) { toast.info(`You're already on the ${planId} plan!`); return; }
    setProLoading(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) { toast.error("Failed to load payment gateway."); setProLoading(false); return; }
    let orderData: { order_id: string; amount: number; currency: string; key_id: string };
    try {
      const res = await fetch(`${API_URL}/api/billing/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planId }),
      });
      if (!res.ok) { const err = await res.json(); toast.error(err.detail || "Could not create order."); setProLoading(false); return; }
      orderData = await res.json();
    } catch { toast.error("Network error."); setProLoading(false); return; }

    const isEnterprise = planId === "enterprise";
    const options = {
      key: orderData.key_id, amount: orderData.amount, currency: orderData.currency,
      name: "AI Resume Optimizer",
      description: isEnterprise ? "Enterprise Plan — ₹4,999/mo" : "Pro Plan — ₹299",
      order_id: orderData.order_id,
      prefill: { name: user.name, email: user.email },
      theme: { color: "#6366F1" },
      handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
        try {
          const verifyRes = await fetch(`${API_URL}/api/billing/verify-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...response, plan: planId }),
          });
          if (!verifyRes.ok) { const err = await verifyRes.json(); toast.error(err.detail || "Verification failed."); return; }
          await refreshUser();
          toast.success(`🎉 You're now on ${isEnterprise ? "Enterprise" : "Pro"}!`);
          navigate("/optimizer");
        } catch { toast.error("Verification failed. Contact support."); }
      },
      modal: { ondismiss: () => setProLoading(false) },
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (resp: any) => { toast.error(`Payment failed: ${resp.error.description}`); setProLoading(false); });
    rzp.open();
    setProLoading(false);
  };

  const handlePlanClick = (plan: typeof plans[0]) => {
    if (plan.id === "free") navigate(user ? "/optimizer" : "/login");
    else handleUpgrade(plan.id as "pro" | "enterprise");
  };

  const getCtaLabel = (plan: typeof plans[0]) => {
    if (plan.id === user?.plan) return "Current Plan ✓";
    return plan.cta;
  };

  return (
    <section id="pricing" className="py-24 md:py-32 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 mesh-bg" />
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="text-center mb-16 space-y-4">
          <div className="badge-primary mx-auto w-fit"><Sparkles className="h-3.5 w-3.5" /> Simple pricing</div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-[44px] leading-tight">
            Plans for Every <span className="gradient-text">Job Seeker</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            Start free and upgrade when you need more. No hidden fees, no subscriptions on Free.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => {
            const isCurrentPlan = plan.id === user?.plan;
            const isPlanLoading = plan.id !== "free" && proLoading;
            const PlanIcon = plan.icon;
            return (
              <div key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 animate-fade-in-up ${
                  plan.highlighted
                    ? "border-primary/40 shadow-elevated bg-card"
                    : "border-border bg-card shadow-card hover:-translate-y-1.5 hover:shadow-elevated hover:border-primary/20"
                }`}
                style={{ animationDelay: `${i * 100}ms` }}>
                {plan.highlighted && (
                  <>
                    <div className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ boxShadow: "var(--shadow-glow)", opacity: 0.5 }} />
                    {"badge" in plan && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold text-white"
                        style={{ background: "var(--gradient-primary)" }}>
                        {(plan as any).badge}
                      </div>
                    )}
                  </>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: "hsl(var(--primary) / 0.1)" }}>
                      <PlanIcon className="h-4.5 w-4.5" style={{ color: "hsl(var(--primary))" }} />
                    </div>
                    <p className="text-sm font-bold text-foreground">{plan.name}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-foreground">
                      <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />{feat}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanClick(plan)}
                  disabled={isCurrentPlan || isPlanLoading}
                  className={`w-full rounded-xl py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? "border border-border bg-secondary text-muted-foreground cursor-default"
                      : plan.highlighted
                        ? "btn-gradient text-white"
                        : "border border-border bg-background text-foreground hover:bg-accent hover:border-primary/30"
                  }`}>
                  {isPlanLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : getCtaLabel(plan)}
                </button>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Secured by <span className="font-semibold text-foreground">Razorpay</span>
          {" "}· UPI, Cards, Net Banking accepted · No hidden fees
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
