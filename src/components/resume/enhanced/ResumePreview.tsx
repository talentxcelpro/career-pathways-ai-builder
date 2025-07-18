
import React from 'react';
import { Card } from "@/components/ui/card";

interface ResumePreviewProps {
  data?: any;
  content?: any;
  template?: any;
  fullPage?: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ 
  data, 
  content, 
  template, 
  fullPage 
}) => {
  const resumeData = data || content;
  
  if (!resumeData) {
    return (
      <Card className="h-fit">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>
          <div className="border rounded-lg overflow-hidden">
            <div className="p-8 text-center text-muted-foreground bg-slate-50">
              No resume data available
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const renderPersonalInfo = () => {
    const { personalInfo } = resumeData;
    if (!personalInfo) return null;

    return (
      <div className="text-center pb-8 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-slate-600 mb-4">
          {personalInfo.email && (
            <div className="flex items-center gap-1">
              <span>✉</span>
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1">
              <span>📞</span>
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.location && (
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>{personalInfo.location}</span>
            </div>
          )}
        </div>
        {personalInfo.summary && (
          <div className="max-w-2xl mx-auto">
            <p className="text-slate-700 leading-relaxed">{personalInfo.summary}</p>
          </div>
        )}
      </div>
    );
  };

  const renderExperience = () => {
    const { experience } = resumeData;
    if (!experience || !Array.isArray(experience) || experience.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b-2 border-blue-500">
          Experience
        </h2>
        <div className="space-y-6">
          {experience.map((exp, index) => (
            <div key={index} className="relative pl-6">
              <div className="absolute left-0 top-2 w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="absolute left-1.5 top-5 w-0.5 h-full bg-slate-200"></div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{exp.title || 'Position'}</h3>
                  <p className="text-blue-600 font-medium">{exp.company}</p>
                </div>
                <div className="text-sm text-slate-500 sm:text-right">
                  <div>{exp.startDate} - {exp.endDate || 'Present'}</div>
                  {exp.location && <div>{exp.location}</div>}
                </div>
              </div>
              
              {exp.description && (
                <div className="text-slate-700 leading-relaxed mb-3">
                  {exp.description.split('\n').map((line: string, i: number) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
              )}
              
              {exp.achievements && exp.achievements.length > 0 && (
                <ul className="space-y-1">
                  {exp.achievements.map((achievement, achIndex) => (
                    <li key={achIndex} className="flex items-start text-slate-700">
                      <span className="text-blue-500 mr-2 mt-1">▸</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    const { education } = resumeData;
    if (!education || !Array.isArray(education) || education.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b-2 border-green-500">
          Education
        </h2>
        <div className="space-y-4">
          {education.map((edu, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{edu.degree || 'Degree'}</h3>
                <p className="text-green-600 font-medium">{edu.school || edu.institution}</p>
                {edu.honors && (
                  <p className="text-sm text-slate-600 italic">{edu.honors}</p>
                )}
              </div>
              <div className="text-sm text-slate-500 sm:text-right">
                <div>{edu.endDate || edu.graduationDate || 'Year'}</div>
                {edu.location && <div>{edu.location}</div>}
                {edu.gpa && <div>GPA: {edu.gpa}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    const { skills } = resumeData;
    if (!skills) return null;

    let skillsToRender: string[] = [];
    
    if (Array.isArray(skills)) {
      skillsToRender = skills.filter(skill => skill && skill.trim());
    }

    if (skillsToRender.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b-2 border-purple-500">
          Skills
        </h2>
        <div className="flex flex-wrap gap-2">
          {skillsToRender.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 
                       rounded-full text-sm font-medium border border-purple-200 
                       hover:from-purple-100 hover:to-purple-150 transition-colors"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    const { projects } = resumeData;
    if (!projects || !Array.isArray(projects) || projects.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b-2 border-orange-500">
          Projects
        </h2>
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div key={index}>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                <h3 className="text-lg font-semibold text-slate-900">
                  {project.url ? (
                    <a href={project.url} className="text-orange-600 hover:text-orange-700 hover:underline">
                      {project.title || 'Project'}
                    </a>
                  ) : (
                    project.title || 'Project'
                  )}
                </h3>
                {(project.startDate || project.endDate) && (
                  <div className="text-sm text-slate-500">
                    {project.startDate} {project.endDate && `- ${project.endDate}`}
                  </div>
                )}
              </div>
              {project.description && (
                <p className="text-slate-700 leading-relaxed mb-2">{project.description}</p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.technologies.map((tech: string, techIndex: number) => (
                    <span
                      key={techIndex}
                      className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-xs font-medium border border-orange-200"
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
    );
  };

  const renderCertifications = () => {
    const { certifications } = resumeData;
    if (!certifications || !Array.isArray(certifications) || certifications.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b-2 border-teal-500">
          Certifications
        </h2>
        <div className="space-y-3">
          {certifications.map((cert, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div>
                <h3 className="font-semibold text-slate-900">{cert.name || 'Certification'}</h3>
                {cert.issuer && (
                  <p className="text-teal-600 font-medium">{cert.issuer}</p>
                )}
              </div>
              {cert.date && (
                <div className="text-sm text-slate-500">{cert.date}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAwards = () => {
    const { awards } = resumeData;
    if (!awards || !Array.isArray(awards) || awards.length === 0) return null;

    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b-2 border-red-500">
          Awards & Recognition
        </h2>
        <div className="space-y-3">
          {awards.map((award, index) => (
            <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
              <div>
                <h3 className="font-semibold text-slate-900">{award.name || 'Award'}</h3>
                {award.issuer && (
                  <p className="text-red-600 font-medium">{award.issuer}</p>
                )}
                {award.description && (
                  <p className="text-slate-700 text-sm mt-1">{award.description}</p>
                )}
              </div>
              {award.date && (
                <div className="text-sm text-slate-500">{award.date}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-fit sticky top-4">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live Preview
        </h3>
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="p-8 space-y-8" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {renderPersonalInfo()}
            {renderExperience()}
            {renderEducation()}
            {renderSkills()}
            {renderProjects()}
            {renderCertifications()}
            {renderAwards()}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Export the props interface for other components to use
export type { ResumePreviewProps };
