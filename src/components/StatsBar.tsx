import { FileText, Users, Zap } from "lucide-react";

const stats = [
  { icon: FileText, value: "63,940", label: "Resumes optimized today" },
  { icon: Users, value: "50,000+", label: "Active users" },
  { icon: Zap, value: "< 30s", label: "Average optimization time" },
];

const StatsBar = () => (
  <section className="border-y border-border bg-card/50">
    <div className="mx-auto max-w-[1120px] px-6 py-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent">
              <stat.icon className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xl font-extrabold tracking-tight text-foreground">{stat.value}</p>
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsBar;
