import React from 'react';
import { cn } from '@/lib/utils';

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

interface Template {
  id: string;
  name: string;
  design_config?: {
    colors?: {
      primary: string;
      text: string;
    };
    fonts?: {
      header: string;
      body: string;
    };
  };
}

interface TemplateRendererProps {
  resumeData: any;
  templateId?: string;
  template?: Template | string;
  className?: string;
  customization?: any;
  sectionOrder?: string[];
}

const ModernTemplate: React.FC<{ resumeData: ResumeData; colors: any; fonts: any }> = ({
  resumeData,
  colors,
  fonts
}) => (
  <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg">
    {/* Header */}
    <div className="text-center mb-8 border-b-2 pb-6" style={{ borderColor: colors.primary }}>
      <h1 
        className="text-4xl font-bold mb-2" 
        style={{ color: colors.primary, fontFamily: fonts.header }}
      >
        {resumeData.personalInfo.fullName}
      </h1>
      <div className="flex justify-center gap-6 text-sm" style={{ color: colors.text }}>
        <span>📧 {resumeData.personalInfo.email}</span>
        <span>📱 {resumeData.personalInfo.phone}</span>
        <span>📍 {resumeData.personalInfo.location}</span>
      </div>
    </div>

    {/* Summary */}
    {resumeData.personalInfo.summary && (
      <div className="mb-6">
        <h2 
          className="text-xl font-semibold mb-3 uppercase tracking-wide border-b pb-1"
          style={{ color: colors.primary, fontFamily: fonts.header, borderColor: colors.primary }}
        >
          Professional Summary
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
          {resumeData.personalInfo.summary}
        </p>
      </div>
    )}

    {/* Experience */}
    {resumeData.experience?.length > 0 && (
      <div className="mb-6">
        <h2 
          className="text-xl font-semibold mb-3 uppercase tracking-wide border-b pb-1"
          style={{ color: colors.primary, fontFamily: fonts.header, borderColor: colors.primary }}
        >
          Professional Experience
        </h2>
        {resumeData.experience.map((exp, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold" style={{ color: colors.primary }}>
                  {exp.title}
                </h3>
                <p className="font-medium text-sm" style={{ color: colors.text }}>
                  {exp.company}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500 italic">
                <div>{exp.startDate} - {exp.endDate || 'Present'}</div>
                <div>{exp.location}</div>
              </div>
            </div>
            {exp.description && (
              <p className="text-sm mb-2" style={{ color: colors.text }}>
                {exp.description}
              </p>
            )}
            {exp.achievements?.length > 0 && (
              <ul className="list-none text-sm space-y-1">
                {exp.achievements.map((achievement, i) => (
                  <li key={i} className="relative pl-4" style={{ color: colors.text }}>
                    <span 
                      className="absolute left-0 font-bold"
                      style={{ color: colors.primary }}
                    >
                      ▸
                    </span>
                    {achievement}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    )}

    {/* Education */}
    {resumeData.education?.length > 0 && (
      <div className="mb-6">
        <h2 
          className="text-xl font-semibold mb-3 uppercase tracking-wide border-b pb-1"
          style={{ color: colors.primary, fontFamily: fonts.header, borderColor: colors.primary }}
        >
          Education
        </h2>
        {resumeData.education.map((edu, index) => (
          <div key={index} className="mb-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold" style={{ color: colors.primary }}>
                  {edu.degree}
                </h3>
                <p className="font-medium text-sm" style={{ color: colors.text }}>
                  {edu.institution}
                </p>
              </div>
              <div className="text-right text-sm text-gray-500 italic">
                <div>{edu.startDate} - {edu.endDate}</div>
                <div>{edu.location}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Skills */}
    {resumeData.skills?.length > 0 && (
      <div className="mb-6">
        <h2 
          className="text-xl font-semibold mb-3 uppercase tracking-wide border-b pb-1"
          style={{ color: colors.primary, fontFamily: fonts.header, borderColor: colors.primary }}
        >
          Technical Skills
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {resumeData.skills.map((skill, index) => (
            <div 
              key={index} 
              className="bg-gray-50 px-3 py-2 rounded border-l-2 text-sm"
              style={{ borderColor: colors.primary }}
            >
              {skill}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Projects */}
    {resumeData.projects?.length > 0 && (
      <div className="mb-6">
        <h2 
          className="text-xl font-semibold mb-3 uppercase tracking-wide border-b pb-1"
          style={{ color: colors.primary, fontFamily: fonts.header, borderColor: colors.primary }}
        >
          Projects
        </h2>
        {resumeData.projects.map((project, index) => (
          <div key={index} className="mb-3">
            <h3 className="font-semibold mb-1" style={{ color: colors.primary }}>
              {project.name}
            </h3>
            <p className="text-sm mb-1" style={{ color: colors.text }}>
              {project.description}
            </p>
            {project.technologies?.length > 0 && (
              <p className="text-xs text-gray-500 italic">
                Technologies: {project.technologies.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

const ClassicTemplate: React.FC<{ resumeData: ResumeData; colors: any; fonts: any }> = ({
  resumeData,
  colors,
  fonts
}) => (
  <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg" style={{ fontFamily: fonts.body }}>
    {/* Header - Centered */}
    <div className="text-center mb-8">
      <h1 
        className="text-3xl font-bold mb-2" 
        style={{ color: colors.text, fontFamily: fonts.header }}
      >
        {resumeData.personalInfo.fullName}
      </h1>
      <div className="text-sm" style={{ color: colors.text }}>
        {resumeData.personalInfo.email} • {resumeData.personalInfo.phone} • {resumeData.personalInfo.location}
      </div>
    </div>

    {/* Traditional sections with clear separation */}
    {resumeData.personalInfo.summary && (
      <div className="mb-6">
        <h2 
          className="text-lg font-bold mb-2 border-b"
          style={{ color: colors.primary, fontFamily: fonts.header }}
        >
          OBJECTIVE
        </h2>
        <p className="text-sm" style={{ color: colors.text }}>
          {resumeData.personalInfo.summary}
        </p>
      </div>
    )}

    {/* Experience with traditional layout */}
    {resumeData.experience?.length > 0 && (
      <div className="mb-6">
        <h2 
          className="text-lg font-bold mb-2 border-b"
          style={{ color: colors.primary, fontFamily: fonts.header }}
        >
          EXPERIENCE
        </h2>
        {resumeData.experience.map((exp, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-bold" style={{ color: colors.text }}>
                {exp.title}
              </h3>
              <span className="text-sm" style={{ color: colors.text }}>
                {exp.startDate} - {exp.endDate || 'Present'}
              </span>
            </div>
            <div className="flex justify-between items-start mb-2">
              <p className="italic" style={{ color: colors.text }}>
                {exp.company}
              </p>
              <span className="text-sm" style={{ color: colors.text }}>
                {exp.location}
              </span>
            </div>
            {exp.description && (
              <p className="text-sm mb-2" style={{ color: colors.text }}>
                {exp.description}
              </p>
            )}
            {exp.achievements?.length > 0 && (
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                {exp.achievements.map((achievement, i) => (
                  <li key={i} style={{ color: colors.text }}>
                    {achievement}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    )}

    {/* Education */}
    {resumeData.education?.length > 0 && (
      <div className="mb-6">
        <h2 
          className="text-lg font-bold mb-2 border-b"
          style={{ color: colors.primary, fontFamily: fonts.header }}
        >
          EDUCATION
        </h2>
        {resumeData.education.map((edu, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold" style={{ color: colors.text }}>
                  {edu.degree}
                </h3>
                <p className="italic" style={{ color: colors.text }}>
                  {edu.institution}, {edu.location}
                </p>
              </div>
              <span className="text-sm" style={{ color: colors.text }}>
                {edu.startDate} - {edu.endDate}
              </span>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Skills */}
    {resumeData.skills?.length > 0 && (
      <div className="mb-6">
        <h2 
          className="text-lg font-bold mb-2 border-b"
          style={{ color: colors.primary, fontFamily: fonts.header }}
        >
          SKILLS
        </h2>
        <p className="text-sm" style={{ color: colors.text }}>
          {resumeData.skills.join(' • ')}
        </p>
      </div>
    )}
  </div>
);

const CreativeTemplate: React.FC<{ resumeData: ResumeData; colors: any; fonts: any }> = ({
  resumeData,
  colors,
  fonts
}) => (
  <div className="bg-gradient-to-br from-white to-gray-50 p-8 max-w-4xl mx-auto shadow-xl rounded-lg">
    {/* Creative header with accent */}
    <div className="relative mb-8">
      <div 
        className="absolute -left-8 -top-8 w-32 h-32 rounded-full opacity-10"
        style={{ backgroundColor: colors.primary }}
      ></div>
      <div className="relative z-10">
        <h1 
          className="text-4xl font-bold mb-2" 
          style={{ color: colors.primary, fontFamily: fonts.header }}
        >
          {resumeData.personalInfo.fullName}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm" style={{ color: colors.text }}>
          <span className="bg-white px-3 py-1 rounded-full shadow">📧 {resumeData.personalInfo.email}</span>
          <span className="bg-white px-3 py-1 rounded-full shadow">📱 {resumeData.personalInfo.phone}</span>
          <span className="bg-white px-3 py-1 rounded-full shadow">📍 {resumeData.personalInfo.location}</span>
        </div>
      </div>
    </div>

    {/* Creative sections */}
    {resumeData.personalInfo.summary && (
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <div 
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: colors.primary }}
          ></div>
          <h2 
            className="text-xl font-bold"
            style={{ color: colors.primary, fontFamily: fonts.header }}
          >
            About Me
          </h2>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4" style={{ borderColor: colors.primary }}>
          <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
            {resumeData.personalInfo.summary}
          </p>
        </div>
      </div>
    )}

    {/* Experience with creative cards */}
    {resumeData.experience?.length > 0 && (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div 
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: colors.primary }}
          ></div>
          <h2 
            className="text-xl font-bold"
            style={{ color: colors.primary, fontFamily: fonts.header }}
          >
            Experience
          </h2>
        </div>
        <div className="space-y-4">
          {resumeData.experience.map((exp, index) => (
            <div key={index} className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg" style={{ color: colors.primary }}>
                    {exp.title}
                  </h3>
                  <p className="font-medium" style={{ color: colors.text }}>
                    {exp.company}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <div 
                    className="bg-gray-100 px-3 py-1 rounded-full"
                    style={{ color: colors.text }}
                  >
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </div>
                  <div className="mt-1 text-gray-500">{exp.location}</div>
                </div>
              </div>
              {exp.description && (
                <p className="text-sm mb-3" style={{ color: colors.text }}>
                  {exp.description}
                </p>
              )}
              {exp.achievements?.length > 0 && (
                <div className="space-y-2">
                  {exp.achievements.map((achievement, i) => (
                    <div key={i} className="flex items-start">
                      <div 
                        className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                        style={{ backgroundColor: colors.primary }}
                      ></div>
                      <p className="text-sm" style={{ color: colors.text }}>
                        {achievement}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Skills with creative layout */}
    {resumeData.skills?.length > 0 && (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div 
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: colors.primary }}
          ></div>
          <h2 
            className="text-xl font-bold"
            style={{ color: colors.primary, fontFamily: fonts.header }}
          >
            Skills
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {resumeData.skills.map((skill, index) => (
            <span 
              key={index} 
              className="px-4 py-2 rounded-full text-sm font-medium text-white shadow-sm"
              style={{ backgroundColor: colors.primary }}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Convert CoreResumeData skills to simple array
const convertSkills = (skills: any[]): string[] => {
  if (!skills || skills.length === 0) return [];
  if (typeof skills[0] === 'string') return skills;
  return skills.map((s: any) => s.name || s.skill || String(s));
};

const convertSkills = (skills: any): string[] => {
  if (!skills || skills.length === 0) return [];
  if (typeof skills[0] === 'string') return skills;
  return skills.map((s: any) => s.name || s.skill || String(s));
};

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  resumeData,
  template,
  templateId,
  className
}) => {
  // Handle both string and Template object types
  const templateObj = typeof template === 'string' 
    ? { id: template, name: template, design_config: undefined }
    : template;
    
  const colors = templateObj.design_config?.colors || { primary: '#2563eb', text: '#374151' };
  const fonts = templateObj.design_config?.fonts || { header: 'Inter', body: 'Inter' };

  const renderTemplate = () => {
    switch (templateObj.id) {
      case 'classic':
        return <ClassicTemplate resumeData={formattedData} colors={colors} fonts={fonts} />;
      case 'creative':
        return <CreativeTemplate resumeData={formattedData} colors={colors} fonts={fonts} />;
      case 'technical':
      case 'executive':
      case 'modern':
      default:
        return <ModernTemplate resumeData={formattedData} colors={colors} fonts={fonts} />;
    }
  };

  return (
    <div className={cn("w-full", className)} id="resume-preview">
      {renderTemplate()}
    </div>
  );
};