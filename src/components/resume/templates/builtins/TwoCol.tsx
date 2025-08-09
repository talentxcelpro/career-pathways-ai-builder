import React from "react";

export function TwoColTemplate({ data }: { data: any }) {
  const p = data?.personalInfo || data?.profile || {};
  const summary = data?.summary || data?.profileSummary || "";
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const skills = Array.isArray(data?.skills) ? data.skills : [];

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <h1 className="text-2xl font-bold">{p.fullName || p.name || "Your Name"}</h1>
        <div className="text-sm opacity-70">{p.title || "Your Title"}</div>

        <section className="mt-4">
          <h3 className="font-semibold">Experience</h3>
          <div className="mt-2 space-y-3">
            {experience.map((exp: any, i: number) => (
              <article key={i}>
                <div className="font-medium">
                  {exp.role || exp.title} <span className="opacity-70">— {exp.company}</span>
                </div>
                {Array.isArray(exp.bullets) && (
                  <ul className="list-disc ml-5 text-sm mt-1">
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

      <div className="col-span-1">
        <section>
          <h3 className="font-semibold">Summary</h3>
          <p className="text-sm mt-2 whitespace-pre-line">{summary}</p>
        </section>

        <section className="mt-4">
          <h3 className="font-semibold">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-1">
            {skills.map((s: any, i: number) => (
              <span key={i} className="text-xs border rounded px-2 py-1">
                {typeof s === "string" ? s : s?.name || ""}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
