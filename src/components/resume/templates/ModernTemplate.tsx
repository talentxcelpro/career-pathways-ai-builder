import React from 'react';
import { Mail, Phone, MapPin, Calendar, Globe, Award, Briefcase } from 'lucide-react';

interface TemplateProps {
  data: any;
  className?: string;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data, className = '' }) => {
  const personalInfo = data.personalInfo || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];
  const awards = data.awards || [];

  return (
    <div className={`bg-white p-8 shadow-lg ${className}`} style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="border-b-4 border-blue-600 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4 text-blue-600" />
              {personalInfo.email}
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4 text-blue-600" />
              {personalInfo.phone}
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-blue-600" />
              {personalInfo.location}
            </div>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 border-l-4 border-blue-600 pl-3">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experience.map((exp: any, index: number) => (
              <div key={index} className="border-l-2 border-gray-200 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {exp.title || exp.position || 'Job Title'}
                    </h3>
                    <p className="text-blue-600 font-medium">{exp.company || 'Company Name'}</p>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </div>
                </div>
                {exp.description && (
                  <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3 border-l-4 border-blue-600 pl-3">
            Core Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: string, index: number) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
            Education
          </h2>
          <div className="space-y-3">
            {education.map((edu: any, index: number) => (
              <div key={index} className="border-l-2 border-gray-200 pl-4">
                <h3 className="font-semibold text-gray-900">{edu.degree || 'Degree'}</h3>
                <p className="text-blue-600">{edu.school || 'Institution'}</p>
                {edu.endDate && (
                  <p className="text-sm text-gray-500">{edu.endDate}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
            Projects
          </h2>
          <div className="space-y-3">
            {projects.map((project: any, index: number) => (
              <div key={index} className="border-l-2 border-gray-200 pl-4">
                <h3 className="font-semibold text-gray-900">{project.title || 'Project Title'}</h3>
                {project.description && (
                  <p className="text-gray-700 text-sm mt-1">{project.description}</p>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.map((tech: string, techIndex: number) => (
                      <span
                        key={techIndex}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
            Certifications
          </h2>
          <div className="space-y-2">
            {certifications.map((cert: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-900">{cert.name}</span>
                  {cert.issuer && <span className="text-gray-600"> - {cert.issuer}</span>}
                  {cert.date && <span className="text-gray-500 text-sm"> ({cert.date})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">
            Awards & Recognition
          </h2>
          <div className="space-y-2">
            {awards.map((award: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-900">{award.name}</span>
                  {award.issuer && <span className="text-gray-600"> - {award.issuer}</span>}
                  {award.date && <span className="text-gray-500 text-sm"> ({award.date})</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};