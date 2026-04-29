import { Zap, TrendingUp, Lock, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const FREE_LIMIT = 2;
const PRO_LIMIT = 10;

const UsageBanner = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    if (!user) return null;

    if (user.plan === "enterprise") {
        return (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 mb-6 shadow-xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "hsl(var(--primary) / 0.1)" }}>
                    <Zap className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
                </div>
                <div className="flex-1">
                    <span className="text-sm font-bold text-foreground">Enterprise Plan — </span>
                    <span className="text-sm text-muted-foreground">Unlimited optimizations</span>
                </div>
                <Crown className="h-4 w-4" style={{ color: "hsl(38 92% 55%)" }} />
            </div>
        );
    }

    const isPro = user.plan === "pro";
    const LIMIT = isPro ? PRO_LIMIT : FREE_LIMIT;
    const used = user.usage_count ?? 0;
    const remaining = Math.max(0, LIMIT - used);
    const pct = Math.min(100, (used / LIMIT) * 100);
    const isExhausted = remaining === 0;

    return (
        <div className={`rounded-xl border px-4 py-3 mb-6 ${isExhausted ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}>
            <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                    {isExhausted
                        ? <Lock className="h-4 w-4 text-destructive" />
                        : <TrendingUp className="h-4 w-4 text-primary" />}
                    <span className="text-sm font-bold text-foreground">
                        {isExhausted
                            ? `${isPro ? "Pro" : "Free"} limit reached`
                            : `${used} of ${LIMIT} optimizations used`}
                    </span>
                </div>
                {(!isPro || isExhausted) && (
                    <button onClick={() => navigate("/#pricing")}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                        <Crown className="h-3 w-3" /> Upgrade →
                    </button>
                )}
            </div>
            <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{
                    width: `${pct}%`,
                    background: isExhausted ? "hsl(0 72% 55%)" : "var(--gradient-primary)"
                }} />
            </div>
        </div>
    );
};

export default UsageBanner;
