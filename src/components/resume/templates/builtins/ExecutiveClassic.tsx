import React from "react";

export function ExecutiveClassicTemplate({ data }: { data: any }) {
  const p = data?.personalInfo || data?.profile || {};
  const summary = data?.summary || data?.profileSummary || "";
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const education = Array.isArray(data?.education) ? data.education : [];

  return (
    <div>
      <header className="pb-4 border-b">
        <h1 className="text-3xl font-bold">{p.fullName || p.name || "Your Name"}</h1>
        <p className="text-sm opacity-70 mt-1">{p.title || "Executive Title"}</p>
        <p className="text-xs opacity-70 mt-1">{[p.email, p.phone, p.location].filter(Boolean).join(" • ")}</p>
      </header>

      {summary && (
        <section className="mt-4">
          <h3 className="font-semibold">Executive Summary</h3>
          <p className="mt-2 text-sm leading-6 whitespace-pre-line">{summary}</p>
        </section>
      )}

      <section className="mt-6">
        <h3 className="font-semibold">Professional Experience</h3>
        <div className="mt-2 space-y-4">
          {experience.map((exp: any, i: number) => (
            <article key={i}>
              <div className="flex items-baseline justify-between">
                <div className="font-medium">
                  {exp.role || exp.title}
                  {exp.company && <span className="opacity-70"> — {exp.company}</span>}
                </div>
                {(exp.start || exp.end) && (
                  <div className="text-xs opacity-70">{[exp.start, exp.end].filter(Boolean).join(" – ")}</div>
                )}
              </div>
              {Array.isArray(exp.bullets) && exp.bullets.length > 0 && (
                <ul className="list-disc ml-5 text-sm mt-1 space-y-1">
                  {exp.bullets.map((b: string, idx: number) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>

      {education.length > 0 && (
        <section className="mt-6">
          <h3 className="font-semibold">Education</h3>
          <div className="mt-2 space-y-2">
            {education.map((ed: any, i: number) => (
              <div key={i} className="text-sm">
                <div className="font-medium">{ed.degree}</div>
                <div className="opacity-70">{[ed.school, ed.location].filter(Boolean).join(" — ")}</div>
                <div className="opacity-70 text-xs">{[ed.startDate, ed.endDate].filter(Boolean).join(" – ")}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
