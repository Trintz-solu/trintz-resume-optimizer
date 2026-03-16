import { useState, useEffect } from "react";
import { Zap, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid or missing password reset token.");
            navigate("/forgot-password");
        }
    }, [token, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, new_password: newPassword })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Password verified and reset successfully! You can now log in.");
                navigate("/login");
            } else {
                toast.error(data.detail || "Failed to reset password.");
            }
        } catch (err) {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <nav className="border-b border-border bg-card/80 backdrop-blur-xl px-6 py-3.5 flex justify-center">
                <button onClick={() => navigate("/")} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                        <Zap className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="text-[15px] font-bold tracking-tight text-foreground">AI Resume Optimizer</span>
                </button>
            </nav>

            <div className="flex flex-1 items-center justify-center px-6 py-16">
                <div className="w-full max-w-[400px]">
                    <div className="card-premium-elevated p-8 md:p-10">
                        <div className="mb-6 flex items-center justify-center gap-2.5">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-2">Create New Password</h1>
                            <p className="text-sm text-muted-foreground">
                                Your new password must be at least 8 characters long.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="section-label">New Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters"
                                        required minLength={8} autoComplete="new-password"
                                        value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                        className="textarea-modern h-11 resize-none w-full pr-10" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="btn-gradient w-full h-11 rounded-xl text-sm font-semibold text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4">
                                {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Reset Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
