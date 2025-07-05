import React from 'react';
import { Mail, Phone, MapPin, Star, Zap, Target } from 'lucide-react';

interface TemplateProps {
  data: any;
  className?: string;
}

export const CreativeTemplate: React.FC<TemplateProps> = ({ data, className = '' }) => {
  const personalInfo = data.personalInfo || {};
  const experience = data.experience || [];
  const education = data.education || [];
  const skills = data.skills || [];
  const projects = data.projects || [];
  const certifications = data.certifications || [];
  const awards = data.awards || [];

  return (
    <div className={`bg-gradient-to-br from-purple-50 to-pink-50 ${className}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white p-8 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {personalInfo.fullName || 'Your Name'}
            </h1>
            <div className="flex flex-wrap gap-4 text-purple-100">
              {personalInfo.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {personalInfo.email}
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {personalInfo.phone}
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {personalInfo.location}
                </div>
              )}
            </div>
          </div>
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
            <Zap className="h-12 w-12 text-white" />
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Professional Summary */}
        {personalInfo.summary && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">About Me</h2>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-purple-500">
              <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
            </div>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Experience</h2>
            </div>
            <div className="space-y-4">
              {experience.map((exp: any, index: number) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-pink-500">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {exp.title || exp.position || 'Job Title'}
                      </h3>
                      <p className="text-purple-600 font-semibold text-lg">{exp.company || 'Company Name'}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-full">
                      <span className="text-purple-700 text-sm font-medium">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </span>
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Skills & Expertise</h2>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex flex-wrap gap-3">
                {skills.map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-medium shadow-lg transform hover:scale-105 transition-transform"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Education & Projects Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Education</h2>
              <div className="space-y-3">
                {education.map((edu: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-400">
                    <h3 className="font-bold text-gray-900">{edu.degree || 'Degree'}</h3>
                    <p className="text-purple-600 font-medium">{edu.school || 'Institution'}</p>
                    {edu.endDate && (
                      <p className="text-gray-500 text-sm">{edu.endDate}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Featured Projects</h2>
              <div className="space-y-3">
                {projects.slice(0, 3).map((project: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-md border-l-4 border-pink-400">
                    <h3 className="font-bold text-gray-900">{project.title || 'Project Title'}</h3>
                    {project.description && (
                      <p className="text-gray-700 text-sm mt-1">{project.description}</p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.slice(0, 3).map((tech: string, techIndex: number) => (
                          <span
                            key={techIndex}
                            className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium"
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
        </div>

        {/* Certifications & Awards */}
        {(certifications.length > 0 || awards.length > 0) && (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Achievements</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {certifications.map((cert: any, index: number) => (
                <div key={`cert-${index}`} className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                  <Star className="h-4 w-4 text-purple-500" />
                  <div>
                    <span className="font-medium text-gray-900">{cert.name}</span>
                    {cert.issuer && <span className="text-gray-600 text-sm block">{cert.issuer}</span>}
                  </div>
                </div>
              ))}
              {awards.map((award: any, index: number) => (
                <div key={`award-${index}`} className="flex items-center gap-2 p-2 bg-pink-50 rounded">
                  <Star className="h-4 w-4 text-pink-500" />
                  <div>
                    <span className="font-medium text-gray-900">{award.name}</span>
                    {award.issuer && <span className="text-gray-600 text-sm block">{award.issuer}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};