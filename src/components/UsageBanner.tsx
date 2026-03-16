import { Zap, TrendingUp, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const FREE_LIMIT = 2;
const PRO_LIMIT = 10;

const UsageBanner = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    // Enterprise users
    if (user.plan === "enterprise") {
        return (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 mb-6">
                <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg"
                    style={{ background: "hsl(221 83% 53% / 0.1)" }}
                >
                    <Zap className="h-3.5 w-3.5" style={{ color: "hsl(221 83% 53%)" }} />
                </div>
                <div className="flex-1">
                    <span className="text-sm font-semibold text-foreground">Enterprise Plan — </span>
                    <span className="text-sm text-muted-foreground">Unlimited optimizations</span>
                </div>
            </div>
        );
    }

    // Free & Pro user limit calculation
    const isPro = user.plan === "pro";
    const LIMIT = isPro ? PRO_LIMIT : FREE_LIMIT;
    const used = user.usage_count ?? 0;
    const remaining = Math.max(0, LIMIT - used);
    const pct = Math.min(100, (used / LIMIT) * 100);
    const isExhausted = remaining === 0;

    return (
        <div
            className={`rounded-xl border px-4 py-3 mb-6 ${isExhausted ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
                }`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {isExhausted ? (
                        <Lock className="h-4 w-4 text-destructive" />
                    ) : (
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-semibold text-foreground">
                        {isExhausted
                            ? `${isPro ? "Pro" : "Free"} limit reached`
                            : `${used} of ${LIMIT} resumes used`}
                    </span>
                </div>
                {(!isPro || isExhausted) && (
                    <button
                        onClick={() => navigate("/#pricing")}
                        className="text-xs font-semibold text-primary hover:underline"
                    >
                        Upgrade to Pro →
                    </button>
                )}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                        width: `${pct}%`,
                        background: isExhausted
                            ? "hsl(0 72% 51%)"
                            : "var(--gradient-primary)",
                    }}
                />
            </div>
        </div>
    );
};

export default UsageBanner;
