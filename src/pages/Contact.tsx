import { useState } from "react";
import { Zap, ArrowLeft, Building2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const teamSizes = ["1–10", "11–50", "51–200", "201–500", "500+"];

const Contact = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        company: "",
        teamSize: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Request received! Our team will reach out within 24 hours.");
        setForm({ name: "", email: "", company: "", teamSize: "", message: "" });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navbar strip */}
            <nav className="border-b border-border bg-card/80 backdrop-blur-xl px-6 py-3.5">
                <div className="mx-auto flex max-w-[1120px] items-center justify-between">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <Zap className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="text-[15px] font-bold tracking-tight text-foreground">
                            AI Resume Optimizer
                        </span>
                    </button>
                    <button
                        onClick={() => navigate("/")}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </button>
                </div>
            </nav>

            {/* Main */}
            <div className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="w-full max-w-[880px] grid gap-10 md:grid-cols-[1fr_1.4fr] items-start">

                    {/* Left — Enterprise info */}
                    <div className="space-y-8 pt-2">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">Enterprise</p>
                            <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                                Let's talk about your team
                            </h1>
                            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                                Get a custom plan tailored to your organization's hiring pipeline. Our team will help you get set up and running within 48 hours.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {[
                                {
                                    icon: Building2,
                                    title: "Custom Integrations",
                                    desc: "Connect with your ATS, HRIS, or internal tools.",
                                },
                                {
                                    icon: Users,
                                    title: "Team Collaboration",
                                    desc: "Shared workspace for recruiters and hiring managers.",
                                },
                                {
                                    icon: Zap,
                                    title: "Bulk Processing",
                                    desc: "Optimize hundreds of resumes simultaneously.",
                                },
                            ].map((item) => (
                                <div key={item.title} className="flex items-start gap-3.5">
                                    <div
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                                        style={{ background: "hsl(221 83% 53% / 0.08)" }}
                                    >
                                        <item.icon className="h-4.5 w-4.5" style={{ color: "hsl(221 83% 53%)", width: "18px", height: "18px" }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-xl border border-border bg-card p-4">
                            <p className="text-xs text-muted-foreground">
                                <span className="font-semibold text-foreground">Typical response time:</span>{" "}
                                Within 24 business hours.
                            </p>
                        </div>
                    </div>

                    {/* Right — Form */}
                    <div className="card-premium-elevated p-8">
                        <h2 className="text-lg font-bold text-foreground mb-6">Request a Demo</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="section-label">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Jane Smith"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="textarea-modern h-11 resize-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="section-label">Work Email</label>
                                    <input
                                        type="email"
                                        placeholder="jane@company.com"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="textarea-modern h-11 resize-none"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="section-label">Company</label>
                                    <input
                                        type="text"
                                        placeholder="Acme Corp"
                                        required
                                        value={form.company}
                                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                                        className="textarea-modern h-11 resize-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="section-label">Team Size</label>
                                    <select
                                        required
                                        value={form.teamSize}
                                        onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
                                        className="textarea-modern h-11 resize-none appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Select size</option>
                                        {teamSizes.map((s) => (
                                            <option key={s} value={s}>{s} employees</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="section-label">Message</label>
                                <textarea
                                    placeholder="Tell us about your use case, current tools, and what you're looking for..."
                                    required
                                    rows={4}
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="textarea-modern"
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-gradient w-full h-11 rounded-xl text-sm font-semibold text-primary-foreground"
                            >
                                Request Demo
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
