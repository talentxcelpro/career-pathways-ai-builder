import React from 'react';

interface TemplateProps {
  data: any;
  className?: string;
}

export const ClassicTemplate: React.FC<TemplateProps> = ({ data, className = '' }) => {
  const personalInfo = data.personalInfo || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];
  const awards = data.awards || [];

  return (
    <div className={`bg-white p-8 shadow-lg ${className}`} style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-900 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-wide uppercase">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="text-gray-700 space-y-1">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
        </div>
      </div>

      {/* Professional Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-400 pb-1">
            Professional Summary
          </h2>
          <p className="text-gray-800 leading-relaxed text-justify">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-400 pb-1">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {exp.title || exp.position || 'Job Title'}
                    </h3>
                    <p className="italic text-gray-700">{exp.company || 'Company Name'}</p>
                  </div>
                  <div className="text-gray-600 text-right">
                    <div>{exp.startDate} - {exp.endDate || 'Present'}</div>
                  </div>
                </div>
                {exp.description && (
                  <p className="text-gray-800 leading-relaxed ml-4">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-400 pb-1">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{edu.degree || 'Degree'}</h3>
                    <p className="italic text-gray-700">{edu.school || 'Institution'}</p>
                  </div>
                  {edu.endDate && (
                    <div className="text-gray-600">{edu.endDate}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-400 pb-1">
            Core Competencies
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {skills.map((skill: string, index: number) => (
              <div key={index} className="text-gray-800">
                • {skill}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-400 pb-1">
            Notable Projects
          </h2>
          <div className="space-y-3">
            {projects.map((project: any, index: number) => (
              <div key={index}>
                <h3 className="font-bold text-gray-900">{project.title || 'Project Title'}</h3>
                {project.description && (
                  <p className="text-gray-800 ml-4">{project.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications & Awards */}
      {(certifications.length > 0 || awards.length > 0) && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-400 pb-1">
            Certifications & Awards
          </h2>
          <div className="space-y-2">
            {certifications.map((cert: any, index: number) => (
              <div key={`cert-${index}`} className="text-gray-800">
                • <span className="font-semibold">{cert.name}</span>
                {cert.issuer && <span> - {cert.issuer}</span>}
                {cert.date && <span> ({cert.date})</span>}
              </div>
            ))}
            {awards.map((award: any, index: number) => (
              <div key={`award-${index}`} className="text-gray-800">
                • <span className="font-semibold">{award.name}</span>
                {award.issuer && <span> - {award.issuer}</span>}
                {award.date && <span> ({award.date})</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};