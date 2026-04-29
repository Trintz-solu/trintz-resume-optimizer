import { Users, Star, Award } from "lucide-react";

const stats = [
  { icon: Users, value: "50,000+", label: "Resumes Optimized" },
  { icon: Star, value: "4.9/5", label: "Average Rating" },
  { icon: Award, value: "39%", label: "Higher ATS Pass Rate" },
];

const StatsBar = () => (
  <div className="border-y border-border bg-card/50 py-8">
    <div className="mx-auto max-w-[1180px] px-6">
      <div className="grid grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center gap-1.5 text-center animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl mb-1"
              style={{ background: "hsl(var(--primary) / 0.1)" }}>
              <s.icon className="h-4 w-4" style={{ color: "hsl(var(--primary))" }} />
            </div>
            <p className="text-xl font-extrabold gradient-text">{s.value}</p>
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default StatsBar;
