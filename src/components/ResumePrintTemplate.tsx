import React, { forwardRef } from 'react';

export interface StructuredResume {
    personal_info?: {
        name: string;
        email?: string;
        phone?: string;
        location?: string;
        linkedin?: string;
    };
    summary: string;
    experience: {
        company: string;
        title: string;
        start_date: string;
        end_date: string;
        bullets: string[];
    }[];
    projects: { 
        name: string; 
        start_date: string;
        end_date: string;
        bullets: string[]; 
    }[];
    skills: string[];
    education: { degree: string; institution: string; graduation_year: string }[];
    auto_applied_keywords?: string[];
}

interface ResumePrintTemplateProps {
    data?: StructuredResume;
    text?: string;
}

const ResumePrintTemplate = forwardRef<HTMLDivElement, ResumePrintTemplateProps>(({ data, text }, ref) => {
    // Fallback if data is passed as simple text (like older resumes in db)
    let parsedData: StructuredResume | null = data || null;
    
    if (!parsedData && text) {
        try {
            parsedData = JSON.parse(text);
        } catch (e) {
            // It might be the old format simple text string
        }
    }

    if (!parsedData || typeof parsedData !== 'object') {
        // Render fallback plain text for older unsupported resumes
        const lines = (text || "").split('\n');
        return (
            <div ref={ref} className="bg-white text-black p-10 w-[210mm] min-h-[297mm] mx-auto box-border font-sans">
                <style type="text/css" media="print">
                    {`
                      @page { size: A4; margin: 0; }
                      @media print { body { -webkit-print-color-adjust: exact; } }
                    `}
                </style>
                <div className="max-w-3xl mx-auto opacity-50">
                    <p className="text-xs text-red-500 mb-4">Old Unstructured Format - Recommend Re-optimizing</p>
                    {lines.map((l, i) => <p key={i} className="text-xs mb-1">{l}</p>)}
                </div>
            </div>
        );
    }

    const info = parsedData?.personal_info;

    return (
        <div ref={ref} className="bg-white text-black p-10 w-[210mm] min-h-[297mm] mx-auto box-border font-sans">
            <style type="text/css" media="print">
                {`
                  @page { size: A4; margin: 0; }
                  @media print {
                    body { -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
                  }
                `}
            </style>
            
            <div className="max-w-4xl mx-auto space-y-4">
                {/* Dynamic header — no more John Doe */}
                <div className="text-center border-b-[1.5px] border-gray-800 pb-3 mb-4">
                    <h1 className="text-2xl font-black uppercase tracking-widest text-gray-900">{info?.name || "Name not found"}</h1>
                    <p className="text-[11px] text-gray-600 mt-1 uppercase tracking-wider font-semibold">
                        {[info?.email, info?.phone, info?.location].filter(Boolean).join(" • ")}
                    </p>
                    {info?.linkedin && <p className="text-[11px] text-gray-600 mt-0.5 uppercase tracking-wider font-semibold">{info.linkedin}</p>}
                </div>

                {/* Summary */}
                {parsedData.summary && (
                    <section className="mb-4">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-300 pb-1 mb-2 text-gray-900">Professional Summary</h2>
                        <p className="text-[11px] text-gray-800 leading-relaxed text-justify">{parsedData.summary}</p>
                    </section>
                )}

                {/* Skills */}
                {parsedData.skills && parsedData.skills.length > 0 && (
                    <section className="mb-4">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-300 pb-1 mb-2 text-gray-900">Technical Skills</h2>
                        <p className="text-[11px] text-gray-800 leading-relaxed text-justify">
                            {parsedData.skills.join(" • ")}
                        </p>
                    </section>
                )}

                {/* Work Experience */}
                {parsedData.experience && parsedData.experience.length > 0 && (
                    <section className="mb-4">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-300 pb-1 mb-3 text-gray-900">Work Experience</h2>
                        <div className="space-y-4">
                            {parsedData.experience.map((job, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="text-[12px] font-bold text-gray-900">
                                            {job.title} <span className="font-normal text-gray-700">— {job.company}</span>
                                        </h3>
                                        {job.start_date && (
                                            <span className="text-[10px] text-gray-600 font-medium whitespace-nowrap">
                                                {job.start_date} – {job.end_date || "Present"}
                                            </span>
                                        )}
                                    </div>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {job.bullets?.map((bullet, i) => (
                                            <li key={i} className="text-[11px] text-gray-800 leading-relaxed pl-1">{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {parsedData.projects && parsedData.projects.length > 0 && (
                    <section className="mb-4">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-300 pb-1 mb-3 text-gray-900">Projects</h2>
                        <div className="space-y-4">
                            {parsedData.projects.map((proj, idx) => (
                                <div key={idx}>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="text-[12px] font-bold text-gray-900">{proj.name}</h3>
                                        {proj.start_date && (
                                            <span className="text-[10px] text-gray-600 font-medium whitespace-nowrap">
                                                {proj.start_date} – {proj.end_date || "Present"}
                                            </span>
                                        )}
                                    </div>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {proj.bullets?.map((bullet, i) => (
                                            <li key={i} className="text-[11px] text-gray-800 leading-relaxed pl-1">{bullet}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {parsedData.education && parsedData.education.length > 0 && (
                    <section className="col-span-2">
                        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] border-b border-gray-300 pb-1 mb-3 text-gray-900">Education</h2>
                        <div className="space-y-2">
                            {parsedData.education.map((edu, idx) => (
                                <div key={idx} className="flex justify-between items-start text-[11px]">
                                    <div>
                                        <p className="font-bold text-gray-900">{edu.institution}</p>
                                        <p className="text-gray-800 italic">{edu.degree}</p>
                                    </div>
                                    {edu.graduation_year && <p className="text-gray-600 font-medium">{edu.graduation_year}</p>}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
});

ResumePrintTemplate.displayName = 'ResumePrintTemplate';
export default ResumePrintTemplate;
