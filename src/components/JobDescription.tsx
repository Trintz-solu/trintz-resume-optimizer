import { AlignLeft } from "lucide-react";

interface JobDescriptionProps {
  value: string;
  onChange: (value: string) => void;
}

const JobDescription = ({ value, onChange }: JobDescriptionProps) => {
  const charCount = value.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="section-label flex items-center gap-2">
          <AlignLeft className="h-4 w-4 text-muted-foreground" />
          Job Description
        </label>
        {charCount > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {charCount.toLocaleString()} characters
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the job description here..."
        rows={8}
        className="textarea-modern min-h-[180px]"
      />
    </div>
  );
};

export default JobDescription;
