import { CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ─── Razorpay type shim ───────────────────────────────────────────────────────
declare global {
    interface Window {
        Razorpay: any;
    }
}

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
        name: "Free",
        price: "₹0",
        period: "",
        description: "Get started with basic resume optimization.",
        features: [
            "2 resume optimizations",
            "ATS keyword analysis",
            "PDF/DOCX support",
        ],
        cta: "Get Started Free",
        highlighted: false,
    },
    {
        name: "Pro",
        price: "₹299",
        period: "",
        description: "For active job seekers who apply frequently.",
        features: [
            "10 optimized resumes",
            "ATS keyword analysis",
            "Resume download",
            "Priority AI processing",
        ],
        cta: "Start Pro",
        highlighted: true,
        badge: "Most Popular",
    },
    {
        name: "Enterprise",
        price: "₹4999",
        period: "/month",
        description: "For teams, recruiters, and career coaches.",
        features: [
            "Unlimited optimizations",
            "Bulk resume processing",
            "Team collaboration",
            "Priority support",
        ],
        cta: "Start Enterprise",
        highlighted: false,
    },
];

// ─── Component ────────────────────────────────────────────────────────────────
const PricingSection = () => {
    const navigate = useNavigate();
    const { user, token, refreshUser } = useAuth();
    const [proLoading, setProLoading] = useState(false);

    const handleUpgrade = async (planId: "pro" | "enterprise") => {
        if (!user) { navigate(`/signup?plan=${planId}`); return; }
        if (user.plan === planId) { toast.info(`You're already on the ${planId} plan!`); return; }

        setProLoading(true);

        // 1. Load Razorpay script
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            toast.error("Failed to load payment gateway. Please check your connection.");
            setProLoading(false);
            return;
        }

        // 2. Create order on backend
        let orderData: { order_id: string; amount: number; currency: string; key_id: string };
        try {
            const res = await fetch("/api/billing/create-order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ plan: planId }),
            });
            if (!res.ok) {
                const err = await res.json();
                toast.error(err.detail || "Could not create payment order.");
                setProLoading(false);
                return;
            }
            orderData = await res.json();
        } catch {
            toast.error("Network error. Please try again.");
            setProLoading(false);
            return;
        }

        const isEnterprise = planId === "enterprise";

        // 3. Open Razorpay Checkout modal
        const options = {
            key: orderData.key_id,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "AI Resume Optimizer",
            description: isEnterprise ? "Enterprise Plan — ₹4999" : "Pro Plan — ₹299",
            order_id: orderData.order_id,
            prefill: {
                name: user.name,
                email: user.email,
            },
            theme: { color: "#4361ee" },
            handler: async (response: {
                razorpay_payment_id: string;
                razorpay_order_id: string;
                razorpay_signature: string;
            }) => {
                // 4. Verify payment on backend
                try {
                    const verifyRes = await fetch("/api/billing/verify-payment", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            plan: planId,
                        }),
                    });
                    if (!verifyRes.ok) {
                        const err = await verifyRes.json();
                        toast.error(err.detail || "Payment verification failed.");
                        return;
                    }
                    // 5. Refresh user state to show new plan
                    await refreshUser();
                    toast.success(`🎉 You're now on the ${isEnterprise ? 'Enterprise' : 'Pro'} plan! Enjoy unlimited optimizations.`);
                    navigate("/optimizer");
                } catch {
                    toast.error("Verification failed. Contact support if payment was deducted.");
                }
            },
            modal: {
                ondismiss: () => setProLoading(false),
            },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (resp: any) => {
            toast.error(`Payment failed: ${resp.error.description}`);
            setProLoading(false);
        });
        rzp.open();
        setProLoading(false);
    };

    const handlePlanClick = (plan: typeof plans[0]) => {
        if (plan.name === "Free") {
            navigate(user ? "/optimizer" : "/login");
        } else {
            handleUpgrade(plan.name.toLowerCase() as "pro" | "enterprise");
        }
    };

    const getCtaLabel = (plan: typeof plans[0]) => {
        if (plan.name === "Pro" && user?.plan === "pro") return "Current Plan ✓";
        if (plan.name === "Free" && user?.plan === "free") return "Current Plan ✓";
        if (plan.name === "Enterprise" && user?.plan === "enterprise") return "Current Plan ✓";
        return plan.cta;
    };

    return (
        <section id="pricing" className="py-24 md:py-32">
            <div className="mx-auto max-w-[1120px] px-6">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-card">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Simple pricing
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground md:text-[44px] leading-tight">
                        Plans for Every Job Seeker
                    </h2>
                    <p className="text-base text-muted-foreground max-w-md mx-auto">
                        Start free and upgrade as your career grows. No hidden fees.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    {plans.map((plan) => {
                        const isCurrentPlan =
                            (plan.name === "Free" && user?.plan === "free") ||
                            (plan.name === "Pro" && user?.plan === "pro");
                        const isProLoading = plan.name === "Pro" && proLoading;

                        return (
                            <div
                                key={plan.name}
                                className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 ${plan.highlighted
                                    ? "border-primary shadow-elevated bg-card"
                                    : "border-border bg-card shadow-card hover:-translate-y-1 hover:shadow-elevated"
                                    }`}
                            >
                                {plan.highlighted && "badge" in plan && (
                                    <div
                                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold text-white"
                                        style={{ background: "var(--gradient-primary)" }}
                                    >
                                        {(plan as any).badge}
                                    </div>
                                )}

                                <div className="mb-6">
                                    <p className="text-sm font-semibold text-muted-foreground">{plan.name}</p>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                                        {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                                </div>

                                <ul className="mb-8 flex-1 space-y-3">
                                    {plan.features.map((feat) => (
                                        <li key={feat} className="flex items-start gap-2.5 text-sm text-foreground">
                                            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-success" />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handlePlanClick(plan)}
                                    disabled={isCurrentPlan || isProLoading}
                                    className={`w-full rounded-xl py-3 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${isCurrentPlan
                                        ? "border border-border bg-secondary text-muted-foreground cursor-default"
                                        : plan.highlighted
                                            ? "btn-gradient text-primary-foreground"
                                            : "border border-border bg-background text-foreground hover:bg-accent hover:border-primary/30"
                                        }`}
                                >
                                    {isProLoading ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                                    ) : (
                                        getCtaLabel(plan)
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Trust note */}
                <p className="mt-8 text-center text-xs text-muted-foreground">
                    Secured by{" "}
                    <span className="font-semibold text-foreground">Razorpay</span>
                    {" "}· UPI, Cards, Net Banking accepted · Cancel anytime
                </p>
            </div>
        </section>
    );
};

export default PricingSection;
