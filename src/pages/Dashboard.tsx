import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Clock, FileText, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";
import ResumePrintTemplate from "@/components/ResumePrintTemplate";

export interface HistoryEntry {
    id: number;
    job_description: string;
    original_text_snippet: string;
    optimized_text: string;
    created_at: string;
}

const Dashboard = () => {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/resume/history", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!res.ok) throw new Error("Failed to fetch history");
                const data = await res.json();
                setHistory(data);
            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchHistory();
        }
    }, [token]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            
            <main className="flex-1 max-w-[1120px] mx-auto w-full px-6 py-10 md:py-14">
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                            Your Resumes
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Manage and export your previously optimized resumes
                        </p>
                    </div>
                    <button onClick={() => navigate("/optimizer")} className="btn-gradient px-5 py-2.5 rounded-xl text-sm font-semibold text-primary-foreground shadow-sm">
                        + New Resume
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center p-16 rounded-2xl border border-dashed border-border bg-card/40">
                        <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground">No Resumes Yet</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-6">You haven't optimized any resumes yet.</p>
                        <button onClick={() => navigate("/optimizer")} className="btn-gradient px-4 py-2 rounded-lg text-sm text-white font-medium">Get Started</button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {history.map((item) => (
                            <ResumeCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

const ResumeCard = ({ item }: { item: HistoryEntry }) => {
    const printRef = React.useRef<HTMLDivElement>(null);
    const handleDownload = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Resume_${new Date(item.created_at).toLocaleDateString()}`,
    });

    return (
        <div className="card-premium p-6 flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(item.created_at).toLocaleDateString()}
                </div>
                <div className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    Optimized
                </div>
            </div>
            
            <h3 className="font-semibold text-foreground mb-2 line-clamp-2" title={item.job_description}>
                {item.job_description}
            </h3>
            
            <p className="text-xs text-muted-foreground line-clamp-3 mb-6 flex-1">
                {item.original_text_snippet}
            </p>
            
            <div className="pt-4 border-t border-border flex gap-3">
                <button 
                    onClick={() => handleDownload()}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 py-2 rounded-lg transition-colors border border-primary/20"
                >
                    <Download className="w-4 h-4" /> Download PDF
                </button>
            </div>
            <div className="hidden">
                 <ResumePrintTemplate ref={printRef} text={item.optimized_text} />
            </div>
        </div>
    );
};

export default Dashboard;
