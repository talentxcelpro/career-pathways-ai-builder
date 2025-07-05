import React from 'react';
import { Building, Users, TrendingUp, Award } from 'lucide-react';

interface TemplateProps {
  data: any;
  className?: string;
}

export const ExecutiveTemplate: React.FC<TemplateProps> = ({ data, className = '' }) => {
  const personalInfo = data.personalInfo || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];
  const awards = data.awards || [];

  return (
    <div className={`bg-white ${className}`} style={{ fontFamily: 'Merriweather, serif' }}>
      {/* Executive Header */}
      <div className="bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-3 tracking-wide">
            {personalInfo.fullName || 'Executive Name'}
          </h1>
          <div className="text-xl text-gray-300 mb-4">Senior Executive Leader</div>
          <div className="flex flex-wrap gap-6 text-gray-300">
            {personalInfo.email && <div>{personalInfo.email}</div>}
            {personalInfo.phone && <div>{personalInfo.phone}</div>}
            {personalInfo.location && <div>{personalInfo.location}</div>}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* Executive Summary */}
        {personalInfo.summary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-gray-700" />
              Executive Summary
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-gray-700">
              <p className="text-gray-800 leading-relaxed text-lg">{personalInfo.summary}</p>
            </div>
          </div>
        )}

        {/* Leadership Experience */}
        {experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Building className="h-6 w-6 text-gray-700" />
              Executive Leadership Experience
            </h2>
            <div className="space-y-6">
              {experience.map((exp: any, index: number) => (
                <div key={index} className="border-l-4 border-gray-700 pl-6 pb-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {exp.title || exp.position || 'Executive Position'}
                      </h3>
                      <p className="text-lg text-gray-700 font-medium">{exp.company || 'Organization'}</p>
                    </div>
                    <div className="text-right text-gray-600">
                      <div className="font-medium">{exp.startDate} - {exp.endDate || 'Present'}</div>
                    </div>
                  </div>
                  {exp.description && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed">{exp.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Competencies */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="h-6 w-6 text-gray-700" />
              Core Leadership Competencies
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid md:grid-cols-3 gap-4">
                {skills.map((skill: string, index: number) => (
                  <div
                    key={index}
                    className="bg-white p-3 rounded border-l-4 border-gray-600 font-medium text-gray-800"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Education & Executive Development */}
        {education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Education & Executive Development</h2>
            <div className="space-y-4">
              {education.map((edu: any, index: number) => (
                <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{edu.degree || 'Degree'}</h3>
                    <p className="text-gray-700 font-medium">{edu.school || 'Institution'}</p>
                    {edu.honors && <p className="text-gray-600 italic">{edu.honors}</p>}
                  </div>
                  {edu.endDate && (
                    <div className="text-gray-600 font-medium">{edu.endDate}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strategic Initiatives */}
        {projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Strategic Initiatives</h2>
            <div className="space-y-4">
              {projects.map((project: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {project.title || 'Strategic Initiative'}
                  </h3>
                  {project.description && (
                    <p className="text-gray-800 leading-relaxed mb-3">{project.description}</p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech: string, techIndex: number) => (
                        <span
                          key={techIndex}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-medium text-sm"
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

        {/* Professional Recognition */}
        {(certifications.length > 0 || awards.length > 0) && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="h-6 w-6 text-gray-700" />
              Professional Recognition & Certifications
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-3">
                {awards.map((award: any, index: number) => (
                  <div key={`award-${index}`} className="flex items-start gap-3 p-3 bg-white rounded border-l-4 border-gray-600">
                    <Award className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900">{award.name}</h4>
                      {award.issuer && <p className="text-gray-600">{award.issuer}</p>}
                      {award.date && <p className="text-gray-500 text-sm">{award.date}</p>}
                    </div>
                  </div>
                ))}
                {certifications.map((cert: any, index: number) => (
                  <div key={`cert-${index}`} className="flex items-start gap-3 p-3 bg-white rounded border-l-4 border-gray-600">
                    <Award className="h-5 w-5 text-gray-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-gray-900">{cert.name}</h4>
                      {cert.issuer && <p className="text-gray-600">{cert.issuer}</p>}
                      {cert.date && <p className="text-gray-500 text-sm">{cert.date}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};