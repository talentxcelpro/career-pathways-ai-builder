import React from 'react';

interface TemplateProps {
  data: any;
  className?: string;
}

export const MinimalistTemplate: React.FC<TemplateProps> = ({ data, className = '' }) => {
  const personalInfo = data.personalInfo || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];

  return (
    <div className={`max-w-4xl mx-auto p-12 bg-white text-gray-900 font-light leading-relaxed ${className}`}>
      {/* Header - Ultra Clean */}
      <header className="pb-8 mb-12 border-b border-gray-200">
        <h1 className="text-5xl font-thin text-gray-900 mb-6 tracking-wide">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="space-y-2 text-gray-600 text-sm tracking-wide">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
          {personalInfo.linkedin && <div>{personalInfo.linkedin}</div>}
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-16">
          <p className="text-gray-700 text-lg leading-loose max-w-3xl">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-thin text-gray-900 mb-8 tracking-wide uppercase">
            Experience
          </h2>
          <div className="space-y-12">
            {experience.map((exp, index) => (
              <div key={index} className="border-l border-gray-200 pl-8 ml-4">
                <div className="mb-3">
                  <h3 className="text-xl font-normal text-gray-900 mb-1">
                    {exp.position || exp.title}
                  </h3>
                  <div className="text-gray-600 mb-2">
                    {exp.company} • {exp.startDate} - {exp.endDate}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {exp.description}
                </p>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="space-y-2 text-gray-700">
                    {exp.achievements.map((achievement, i) => (
                      <li key={i} className="flex items-start">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-4 flex-shrink-0"></span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-thin text-gray-900 mb-8 tracking-wide uppercase">
            Skills
          </h2>
          <div className="text-gray-700 leading-loose">
            {skills.filter(skill => skill).join(' • ')}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-thin text-gray-900 mb-8 tracking-wide uppercase">
            Education
          </h2>
          <div className="space-y-6">
            {education.map((edu, index) => (
              <div key={index}>
                <h3 className="text-xl font-normal text-gray-900 mb-1">
                  {edu.degree}
                </h3>
                <div className="text-gray-600 mb-2">
                  {edu.school} • {edu.startDate} - {edu.endDate}
                </div>
                {edu.gpa && <div className="text-gray-600">GPA: {edu.gpa}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-thin text-gray-900 mb-8 tracking-wide uppercase">
            Projects
          </h2>
          <div className="space-y-8">
            {projects.map((project, index) => (
              <div key={index}>
                <h3 className="text-xl font-normal text-gray-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  {project.description}
                </p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="text-gray-600 text-sm">
                    {project.technologies.join(' • ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section>
          <h2 className="text-2xl font-thin text-gray-900 mb-8 tracking-wide uppercase">
            Certifications
          </h2>
          <div className="space-y-3">
            {certifications.map((cert, index) => (
              <div key={index} className="text-gray-700">
                <span className="font-normal">{cert.name}</span>
                <span className="text-gray-600"> • {cert.issuer} • {cert.date}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};