import React from "react";

interface SourceFidelityRendererProps {
  resumeData: any;
}

export const SourceFidelityRenderer: React.FC<SourceFidelityRendererProps> = ({ resumeData }) => {
  if (!resumeData) return null;

  const personal = resumeData.personalInfo || {};
  const summary = resumeData.summary || personal.summary || '';
  const experience = Array.isArray(resumeData.experience) ? resumeData.experience : [];
  const education = Array.isArray(resumeData.education) ? resumeData.education : [];
  const certifications = Array.isArray(resumeData.certifications) ? resumeData.certifications : [];
  const projects = Array.isArray(resumeData.projects) ? resumeData.projects : [];
  
  // Skills extraction
  const rawSkills = resumeData.skills || {};
  const techSkills = Array.isArray(rawSkills.technical) ? rawSkills.technical : 
    Array.isArray(rawSkills) ? rawSkills.map((s: any) => typeof s === 'string' ? s : s.name) : [];
  const softSkills = Array.isArray(rawSkills.soft) ? rawSkills.soft : [];

  // Helper for dual-field fallback (originalText vs string value)
  const getOriginalOrVal = (val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val.originalText) return val.originalText;
    if (typeof val === 'object' && val.normalizedValue) return val.normalizedValue;
    return String(val);
  };

  return (
    <div className="w-full bg-white text-zinc-900 font-sans p-8 md:p-12 shadow-md border border-zinc-200 leading-relaxed text-sm select-text">
      {/* 1. VERBATIM CANDIDATE HEADER */}
      <header className="border-b border-zinc-900 pb-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide uppercase text-zinc-900">
          {getOriginalOrVal(personal.fullName) || "CANDIDATE NAME"}
        </h1>
        {personal.headline && (
          <h2 className="text-sm md:text-base font-bold text-zinc-700 tracking-wide uppercase mt-1">
            {getOriginalOrVal(personal.headline)}
          </h2>
        )}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600 font-medium mt-2">
          {personal.location && <span>📍 {getOriginalOrVal(personal.location)}</span>}
          {personal.phone && <span>📞 {getOriginalOrVal(personal.phone)}</span>}
          {personal.email && <span>📩 {getOriginalOrVal(personal.email)}</span>}
          {personal.linkedin && <span>💼 {getOriginalOrVal(personal.linkedin)}</span>}
        </div>
      </header>

      {/* 2. VERBATIM PROFESSIONAL SUMMARY */}
      {summary && (
        <section className="mb-6">
          <h3 
            className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-2 [break-after:avoid]"
            style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}
          >
            PROFESSIONAL SUMMARY
          </h3>
          <p className="text-zinc-800 leading-relaxed whitespace-pre-line">
            {getOriginalOrVal(summary)}
          </p>
        </section>
      )}

      {/* 3. VERBATIM CORE SKILLS & COMPETENCIES */}
      {(techSkills.length > 0 || softSkills.length > 0) && (
        <section className="mb-6">
          <h3 
            className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-2 [break-after:avoid]"
            style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}
          >
            CORE SKILLS &amp; COMPETENCIES
          </h3>
          <p className="text-zinc-800 leading-relaxed">
            {[...techSkills, ...softSkills].map((s: any) => getOriginalOrVal(s)).join(' | ')}
          </p>
        </section>
      )}

      {/* 4. VERBATIM WORK EXPERIENCE (ATOMIC ROLE BLOCK PAGINATION - UNLIMITED HISTORICAL ROLES) */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h3 
            className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-3 [break-after:avoid]"
            style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}
          >
            PROFESSIONAL EXPERIENCE
          </h3>
          <div className="space-y-5">
            {experience.map((exp: any, idx: number) => {
              const title = getOriginalOrVal(exp.title);
              const company = getOriginalOrVal(exp.company);
              const location = getOriginalOrVal(exp.location);
              const dateText = exp.originalDateText || 
                `${getOriginalOrVal(exp.startDate)} ${exp.startDate || exp.endDate ? '-' : ''} ${exp.current ? 'Present' : getOriginalOrVal(exp.endDate)}`.trim();
              const achievements = Array.isArray(exp.achievements) ? exp.achievements : [];
              const description = getOriginalOrVal(exp.description);

              return (
                <div 
                  key={exp.id || idx} 
                  className="space-y-1 [break-inside:avoid]"
                  style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-bold text-zinc-900 text-sm">{title || company || ""}</span>
                    {dateText && <span className="text-xs font-semibold text-zinc-600">{dateText}</span>}
                  </div>
                  {title && company && (
                    <div className="flex flex-wrap items-center justify-between text-xs text-zinc-700 font-medium">
                      <span>{company}</span>
                      {location && <span className="italic">{location}</span>}
                    </div>
                  )}
                  {(!title && location) && (
                    <div className="text-xs text-zinc-700 italic font-medium">
                      {location}
                    </div>
                  )}

                  {description && (
                    <p className="text-xs text-zinc-800 mt-1 leading-relaxed">{description}</p>
                  )}

                  {achievements.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-zinc-800 space-y-1 mt-1 pl-1">
                      {achievements.map((ach: any, aIdx: number) => (
                        <li key={aIdx} className="leading-relaxed">
                          {getOriginalOrVal(ach)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. VERBATIM PROJECTS */}
      {projects.length > 0 && (
        <section className="mb-6">
          <h3 
            className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-2 [break-after:avoid]"
            style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}
          >
            PROJECT EXPERIENCE
          </h3>
          <div className="space-y-3">
            {projects.map((proj: any, pIdx: number) => (
              <div 
                key={pIdx} 
                className="[break-inside:avoid]"
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
              >
                <div className="font-bold text-zinc-900 text-xs">{getOriginalOrVal(proj.name)}</div>
                <p className="text-xs text-zinc-800">{getOriginalOrVal(proj.description)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. VERBATIM EDUCATION */}
      {education.length > 0 && (
        <section className="mb-6">
          <h3 
            className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-2 [break-after:avoid]"
            style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}
          >
            EDUCATION &amp; QUALIFICATIONS
          </h3>
          <div className="space-y-2">
            {education.map((edu: any, eIdx: number) => (
              <div 
                key={eIdx} 
                className="flex flex-wrap justify-between text-xs [break-inside:avoid]"
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
              >
                <div>
                  <span className="font-bold text-zinc-900">{getOriginalOrVal(edu.degree)}</span>
                  <span className="text-zinc-700"> — {getOriginalOrVal(edu.school)}</span>
                </div>
                <span className="text-zinc-600 font-medium">{getOriginalOrVal(edu.endDate || edu.startDate)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. VERBATIM CERTIFICATIONS */}
      {certifications.length > 0 && (
        <section className="mb-6">
          <h3 
            className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-2 [break-after:avoid]"
            style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}
          >
            CERTIFICATIONS &amp; CREDENTIALS
          </h3>
          <ul className="list-disc list-inside text-xs text-zinc-800 space-y-1">
            {certifications.map((cert: any, cIdx: number) => (
              <li 
                key={cIdx}
                className="[break-inside:avoid]"
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
              >
                <span className="font-semibold text-zinc-900">{getOriginalOrVal(cert.name)}</span>
                {cert.issuer && <span className="text-zinc-600"> — {getOriginalOrVal(cert.issuer)}</span>}
                {cert.date && <span className="text-zinc-500"> ({getOriginalOrVal(cert.date)})</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 8. VERBATIM CUSTOM & UNKNOWN SECTIONS (e.g. LEADERSHIP PHILOSOPHY, TECHNICAL PROFICIENCIES) */}
      {Array.isArray(resumeData.additionalSections) && resumeData.additionalSections.length > 0 && (
        <div className="space-y-6">
          {resumeData.additionalSections.map((sec: any, sIdx: number) => (
            <section key={sIdx} className="mb-6">
              <h3 
                className="text-xs font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-1 mb-2 [break-after:avoid]"
                style={{ breakAfter: 'avoid', pageBreakAfter: 'avoid' }}
              >
                {sec.originalHeading}
              </h3>
              <p 
                className="text-zinc-800 leading-relaxed whitespace-pre-line text-xs [break-inside:avoid]"
                style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
              >
                {sec.originalText}
              </p>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};
