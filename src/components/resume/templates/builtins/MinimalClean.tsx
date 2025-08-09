import React from "react";

export function MinimalCleanTemplate({ data }: { data: any }) {
  const p = data?.personalInfo || data?.profile || {};
  const summary = data?.summary || data?.profileSummary || "";
  const experience = Array.isArray(data?.experience) ? data.experience : [];

  return (
    <div>
      <header className="mb-2">
        <h1 className="text-3xl font-semibold tracking-tight">{p.fullName || p.name || "Your Name"}</h1>
        <p className="text-sm opacity-70">
          {[p.title, p.email, p.location].filter(Boolean).join(" • ")}
        </p>
      </header>

      {summary && (
        <section className="mt-4">
          <h3 className="text-sm font-medium uppercase tracking-wider">Summary</h3>
          <p className="mt-2 text-sm leading-6 whitespace-pre-line">{summary}</p>
        </section>
      )}

      <section className="mt-4">
        <h3 className="text-sm font-medium uppercase tracking-wider">Experience</h3>
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
    </div>
  );
}
