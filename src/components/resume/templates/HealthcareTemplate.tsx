import React from 'react';

interface TemplateProps {
  data: any;
  className?: string;
}

export const HealthcareTemplate: React.FC<TemplateProps> = ({ data, className = '' }) => {
  const personalInfo = data.personalInfo || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = Array.isArray(data.skills) ? data.skills : [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];

  return (
    <div className={`max-w-4xl mx-auto p-8 bg-white text-gray-900 font-serif ${className}`}>
      {/* Header - Professional & Conservative */}
      <header className="text-center border-b-2 border-blue-800 pb-6 mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-3">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="text-gray-700 space-y-1">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
          {personalInfo.linkedin && <div>{personalInfo.linkedin}</div>}
        </div>
      </header>

      {/* Professional Summary */}
      {personalInfo.summary && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 uppercase tracking-wide border-b border-blue-200 pb-2">
            Professional Summary
          </h2>
          <p className="text-gray-800 leading-relaxed text-justify">
            {personalInfo.summary}
          </p>
        </section>
      )}

      {/* Education - Prominent in Healthcare */}
      {education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 uppercase tracking-wide border-b border-blue-200 pb-2">
            Education & Degrees
          </h2>
          <div className="space-y-4">
            {education.map((edu, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded border border-blue-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-blue-900">{edu.degree}</h3>
                  <span className="text-blue-700 font-semibold">{edu.startDate} - {edu.endDate}</span>
                </div>
                <div className="text-blue-800 font-semibold mb-1">
                  {edu.school} • {edu.location}
                </div>
                {edu.gpa && (
                  <div className="text-gray-700">
                    <strong>GPA:</strong> {edu.gpa}
                  </div>
                )}
                {edu.honors && (
                  <div className="text-blue-700 font-medium">
                    <strong>Honors:</strong> {edu.honors}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Licenses - Critical in Healthcare */}
      {certifications.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 uppercase tracking-wide border-b border-blue-200 pb-2">
            Certifications & Licenses
          </h2>
          <div className="grid gap-3">
            {certifications.map((cert, index) => (
              <div key={index} className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{cert.name}</h3>
                    <div className="text-green-700 font-semibold">{cert.issuer}</div>
                    {cert.credentialId && (
                      <div className="text-gray-600 text-sm mt-1">
                        <strong>Credential ID:</strong> {cert.credentialId}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="bg-green-600 text-white px-3 py-1 rounded text-sm font-bold">
                      {cert.date}
                    </div>
                    {cert.expiryDate && (
                      <div className="text-gray-600 text-xs mt-1">
                        Expires: {cert.expiryDate}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Clinical Experience */}
      {experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 uppercase tracking-wide border-b border-blue-200 pb-2">
            Professional Experience
          </h2>
          <div className="space-y-6">
            {experience.map((exp, index) => (
              <div key={index} className="border-l-4 border-blue-300 pl-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {exp.position || exp.title}
                    </h3>
                    <div className="text-blue-800 font-semibold">
                      {exp.company} • {exp.location}
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-semibold">
                    {exp.startDate} - {exp.endDate}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3 leading-relaxed">
                  {exp.description}
                </p>
                
                {exp.achievements && exp.achievements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Key Responsibilities & Achievements:</h4>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Clinical Skills */}
      {skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 uppercase tracking-wide border-b border-blue-200 pb-2">
            Clinical Skills & Competencies
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {skills.filter(skill => skill).map((skill, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded text-sm font-medium text-center">
                {skill}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Research & Projects */}
      {projects.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-blue-900 mb-4 uppercase tracking-wide border-b border-blue-200 pb-2">
            Research & Special Projects
          </h2>
          <div className="space-y-4">
            {projects.map((project, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-700 mb-2">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <strong>Methods/Technologies:</strong> {project.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};