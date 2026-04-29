import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, FileText, Clock, BarChart2, TrendingUp, Crown, ArrowRight, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

interface HistoryItem {
  id: number;
  job_description: string;
  original_text_snippet: string;
  optimized_text: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/resume/history", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [token]);

  const FREE_LIMIT = 2;
  const PRO_LIMIT = 10;
  const usageCount = user?.usage_count ?? 0;
  const limit = user?.plan === "free" ? FREE_LIMIT : user?.plan === "pro" ? PRO_LIMIT : -1;
  const usagePct = limit === -1 ? 100 : Math.min((usageCount / limit) * 100, 100);

  const stats = [
    { label: "Resumes Optimized", value: usageCount, icon: Sparkles, color: "hsl(243 80% 68%)" },
    { label: "Credits Remaining", value: limit === -1 ? "∞" : Math.max(limit - usageCount, 0), icon: Zap, color: "hsl(142 71% 45%)" },
    { label: "History Entries", value: history.length, icon: FileText, color: "hsl(196 100% 50%)" },
    { label: "Plan", value: user?.plan?.toUpperCase() ?? "FREE", icon: Crown, color: "hsl(38 92% 55%)" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-[1180px] px-6 py-10 md:py-14 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
              Welcome back, <span className="gradient-text">{user?.name?.split(" ")[0]} 👋</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Track your usage and resume history below.</p>
          </div>
          <button onClick={() => navigate("/optimizer")}
            className="btn-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white">
            <Sparkles className="h-4 w-4" /> New Optimization
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className="card-premium p-5 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: `${s.color}18` }}>
                  <s.icon className="h-4 w-4" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Usage progress */}
        {limit !== -1 && (
          <div className="card-premium p-6 animate-fade-in-up delay-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Usage This Period</span>
              </div>
              <span className="text-sm font-bold text-foreground">{usageCount} / {limit}</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${usagePct}%` }} />
            </div>
            {usagePct >= 80 && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border p-3.5"
                style={{ borderColor: "hsl(38 92% 55% / 0.25)", background: "hsl(38 92% 55% / 0.06)" }}>
                <p className="text-sm text-foreground font-medium">
                  {usagePct >= 100 ? "You've reached your limit." : "Almost at your limit."}
                  {" "}Upgrade for more optimizations.
                </p>
                <button onClick={() => navigate("/#pricing")}
                  className="btn-gradient shrink-0 rounded-lg px-4 py-2 text-xs font-bold text-white flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5" /> Upgrade
                </button>
              </div>
            )}
          </div>
        )}

        {/* History */}
        <div className="space-y-4 animate-fade-in-up delay-300">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold text-foreground">Optimization History</h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-premium p-5 space-y-2">
                  <div className="animate-shimmer h-4 w-48 rounded-lg" />
                  <div className="animate-shimmer h-3 w-full rounded-lg" />
                  <div className="animate-shimmer h-3 w-3/4 rounded-lg" />
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="card-premium p-12 text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ background: "hsl(var(--primary) / 0.1)" }}>
                <FileText className="h-7 w-7" style={{ color: "hsl(var(--primary))" }} />
              </div>
              <div>
                <p className="font-bold text-foreground">No optimizations yet</p>
                <p className="text-sm text-muted-foreground mt-1">Upload your first resume to get started.</p>
              </div>
              <button onClick={() => navigate("/optimizer")}
                className="btn-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white">
                Start Optimizing <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((h, i) => {
                let parsed: any = null;
                try { parsed = JSON.parse(h.optimized_text); } catch {}
                return (
                  <div key={h.id} className="card-premium p-5 flex items-start justify-between gap-4 hover:border-primary/20 hover:shadow-elevated transition-all animate-fade-in-up"
                    style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                        style={{ background: "hsl(var(--primary) / 0.1)" }}>
                        <TrendingUp className="h-5 w-5" style={{ color: "hsl(var(--primary))" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">
                          {parsed?.personal_info?.name || "Resume"} — {h.job_description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{h.original_text_snippet}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {new Date(h.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => navigate("/optimizer")}
                      className="shrink-0 text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                      Re-optimize <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
