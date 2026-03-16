import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Zap, Loader2 } from "lucide-react";


const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const fetched = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            toast.error("Invalid verification link.");
            return;
        }

        if (fetched.current) return;
        fetched.current = true;

        const verify = async () => {
            try {
                const res = await fetch(`/api/auth/verify-email?token=${token}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                if (res.ok) {
                    setStatus("success");
                    toast.success("Email verified successfully! Redirecting to login...");
                    setTimeout(() => navigate("/login"), 3000);
                } else {
                    const data = await res.json();
                    setStatus("error");
                    toast.error(data.detail || "Verification failed.");
                }
            } catch (err) {
                setStatus("error");
                toast.error("Network error during verification.");
            }
        };

        verify();

    }, [token, navigate]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-[420px] card-premium-elevated p-10 text-center">

                <div className="flex justify-center mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Zap className="h-6 w-6 text-primary" />
                    </div>
                </div>

                <h1 className="text-2xl font-extrabold tracking-tight text-foreground mb-2">
                    Email Verification
                </h1>

                {status === "loading" && (
                    <div className="flex flex-col items-center space-y-4 mt-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Verifying your email address...
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="mt-6 space-y-6">
                        <p className="text-base text-green-600 font-medium">
                            Your email has been successfully verified!
                        </p>

                        <p className="text-sm text-muted-foreground">
                            Redirecting you to login...
                        </p>

                        <button
                            onClick={() => navigate("/login")}
                            className="btn-gradient w-full py-2.5 rounded-xl text-sm font-semibold"
                        >
                            Go to Login
                        </button>
                    </div>
                )}

                {status === "error" && (
                    <div className="mt-6 space-y-6">
                        <p className="text-base text-red-600 font-medium">
                            Verification failed.
                        </p>

                        <p className="text-sm text-muted-foreground">
                            The link may be invalid or expired. Please try signing up again.
                        </p>

                        <button
                            onClick={() => navigate("/signup")}
                            className="btn-gradient w-full py-2.5 rounded-xl text-sm font-semibold"
                        >
                            Back to Sign Up
                        </button>
                    </div>
                )}
            </div>
        </div>

    );
};

export default VerifyEmail;
