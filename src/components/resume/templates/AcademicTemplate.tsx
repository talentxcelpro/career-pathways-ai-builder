import React from 'react';
import { BookOpen, GraduationCap, FileText, Users, Globe } from 'lucide-react';

interface TemplateProps {
  data: any;
  className?: string;
}

export const AcademicTemplate: React.FC<TemplateProps> = ({ data, className = '' }) => {
  const personalInfo = data.personalInfo || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];
  const awards = data.awards || [];

  return (
    <div className={`bg-white ${className}`} style={{ fontFamily: 'Crimson Text, Georgia, serif' }}>
      {/* Academic Header */}
      <div className="text-center border-b-2 border-blue-900 pb-6 mb-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-3">
          {personalInfo.fullName || 'Dr. Academic Name'}
        </h1>
        <div className="text-lg text-gray-700 mb-4">
          Researcher & Academic Professional
        </div>
        <div className="flex justify-center flex-wrap gap-4 text-gray-600">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        {/* Research Interests / Summary */}
        {personalInfo.summary && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Research Interests
            </h2>
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-600">
              <p className="text-gray-800 leading-relaxed text-justify">{personalInfo.summary}</p>
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              Education
            </h2>
            <div className="space-y-4">
              {education.map((edu: any, index: number) => (
                <div key={index} className="bg-gray-50 p-5 rounded-lg border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{edu.degree || 'Degree'}</h3>
                      <p className="text-lg text-blue-700 font-medium">{edu.school || 'Institution'}</p>
                      {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                      {edu.honors && <p className="text-gray-600 italic">{edu.honors}</p>}
                    </div>
                    {edu.endDate && (
                      <div className="text-gray-600 font-medium">{edu.endDate}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Academic Experience */}
        {experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Academic & Professional Experience</h2>
            <div className="space-y-6">
              {experience.map((exp: any, index: number) => (
                <div key={index} className="border-b border-gray-200 pb-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {exp.title || exp.position || 'Academic Position'}
                      </h3>
                      <p className="text-lg text-blue-700 font-medium">{exp.company || 'Institution'}</p>
                    </div>
                    <div className="text-gray-600">
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </div>
                  </div>
                  {exp.description && (
                    <div className="mt-3">
                      <p className="text-gray-800 leading-relaxed">{exp.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Research Projects / Publications */}
        {projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Research Projects & Publications
            </h2>
            <div className="space-y-4">
              {projects.map((project: any, index: number) => (
                <div key={index} className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">
                    {project.title || 'Research Project'}
                  </h3>
                  {project.description && (
                    <p className="text-gray-800 leading-relaxed mb-3 text-justify">
                      {project.description}
                    </p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div>
                      <strong className="text-gray-700">Keywords:</strong>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {project.technologies.map((keyword: string, keyIndex: number) => (
                          <span
                            key={keyIndex}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills & Methodologies */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Research Skills & Methodologies</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-4">
                {skills.map((skill: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-gray-800">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Honors, Awards & Certifications */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Awards */}
          {awards.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-4">Honors & Awards</h2>
              <div className="space-y-3">
                {awards.map((award: any, index: number) => (
                  <div key={index} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <h4 className="font-bold text-gray-900">{award.name}</h4>
                    {award.issuer && <p className="text-gray-700">{award.issuer}</p>}
                    {award.date && <p className="text-gray-600 text-sm">{award.date}</p>}
                    {award.description && (
                      <p className="text-gray-700 text-sm mt-2">{award.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Memberships */}
          {certifications.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Professional Memberships
              </h2>
              <div className="space-y-3">
                {certifications.map((cert: any, index: number) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <h4 className="font-bold text-gray-900">{cert.name}</h4>
                    {cert.issuer && <p className="text-gray-700">{cert.issuer}</p>}
                    {cert.date && <p className="text-gray-600 text-sm">{cert.date}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Academic References */}
        <div className="bg-gray-100 p-6 rounded-lg border border-gray-300">
          <h2 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            References
          </h2>
          <p className="text-gray-700 italic">
            Academic and professional references available upon request.
          </p>
        </div>
      </div>
    </div>
  );
};