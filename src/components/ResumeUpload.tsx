import { useCallback, useState } from "react";
import { CloudUpload, FileText, X, CheckCircle2 } from "lucide-react";

interface ResumeUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const ResumeUpload = ({ file, onFileChange }: ResumeUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped && isValidFile(dropped)) onFileChange(dropped);
    },
    [onFileChange]
  );

  const isValidFile = (f: File) =>
    f.type === "application/pdf" ||
    f.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && isValidFile(selected)) onFileChange(selected);
  };

  return (
    <div className="space-y-3">
      <label className="section-label">Resume</label>

      {file ? (
        <div className="file-preview animate-fade-in-up">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent">
            <FileText className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground truncate">
                {file.name}
              </p>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {(file.size / 1024).toFixed(1)} KB •{" "}
              {file.name.endsWith(".pdf") ? "PDF" : "DOCX"}
            </p>
          </div>
          <button
            onClick={() => onFileChange(null)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("resume-input")?.click()}
          className={`dropzone ${isDragging ? "dropzone-active" : ""}`}
        >
          <input
            id="resume-input"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent mb-4">
            <CloudUpload className="h-7 w-7 text-accent-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">
            Drag & drop your resume
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            PDF or DOCX • Max 20MB
          </p>
          <button className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-xs transition-all hover:bg-accent hover:border-primary/30">
            Choose File
          </button>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
