import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Globe, Calendar } from 'lucide-react';

export interface ResumeData {
  profile: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
  };
  summary?: string;
  experience: Array<{
    title?: string;
    company?: string;
    startDate?: string;
    endDate?: string;
    bullets?: string[];
    current?: boolean;
  }>;
  education: Array<{
    school?: string;
    degree?: string;
    year?: string;
    gpa?: string;
  }>;
  skills?: string[];
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
    link?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
  }>;
  languages?: Array<{
    language?: string;
    proficiency?: string;
  }>;
  awards?: Array<{
    title?: string;
    organization?: string;
    date?: string;
  }>;
}

interface ResumePreviewProps {
  data: ResumeData;
  template?: string;
  className?: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({
  data,
  template = 'modern',
  className = ''
}) => {
  const formatDate = (date: string) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return date;
    }
  };

  return (
    <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${className}`}>
      <div className="p-8 space-y-6 max-h-[800px] overflow-y-auto">
        {/* Header */}
        <div className="text-center border-b pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {data.profile.name || 'Your Name'}
          </h1>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            {data.profile.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {data.profile.email}
              </div>
            )}
            {data.profile.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {data.profile.phone}
              </div>
            )}
            {data.profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {data.profile.location}
              </div>
            )}
            {data.profile.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {data.profile.website}
              </div>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        {data.summary && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
              Professional Experience
            </h2>
            <div className="space-y-4">
              {data.experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-blue-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {exp.title || 'Job Title'}
                      </h3>
                      <p className="text-blue-600 font-medium">
                        {exp.company || 'Company Name'}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(exp.startDate || '')} - {exp.current ? 'Present' : formatDate(exp.endDate || '')}
                    </div>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {exp.bullets.map((bullet, bulletIndex) => (
                        <li key={bulletIndex}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
              Education
            </h2>
            <div className="space-y-3">
              {data.education.map((edu, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {edu.degree || 'Degree'}
                    </h3>
                    <p className="text-blue-600">{edu.school || 'Institution'}</p>
                    {edu.gpa && (
                      <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {edu.year || 'Year'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
              Projects
            </h2>
            <div className="space-y-4">
              {data.projects.map((project, index) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {project.name || 'Project Name'}
                    </h3>
                    {project.link && (
                      <a href={project.link} className="text-blue-600 text-sm hover:underline">
                        View Project
                      </a>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-gray-700 mb-2">{project.description}</p>
                  )}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, techIndex) => (
                        <Badge key={techIndex} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
              Certifications
            </h2>
            <div className="space-y-2">
              {data.certifications.map((cert, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                    <p className="text-sm text-gray-600">{cert.issuer}</p>
                  </div>
                  <div className="text-sm text-gray-600">{cert.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
              Languages
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {data.languages.map((lang, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-gray-900">{lang.language}</span>
                  <span className="text-gray-600">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        {data.awards && data.awards.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-1">
              Awards & Achievements
            </h2>
            <div className="space-y-2">
              {data.awards.map((award, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{award.title}</h3>
                    <p className="text-sm text-gray-600">{award.organization}</p>
                  </div>
                  <div className="text-sm text-gray-600">{award.date}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};