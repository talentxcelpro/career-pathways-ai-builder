import { Card, CardContent } from "@/components/ui/card";

interface ResumePreviewProps {
  content: any;
  template?: any;
  fullPage?: boolean;
}

export const ResumePreview = ({ content, template, fullPage = false }: ResumePreviewProps) => {
  const containerClass = fullPage 
    ? "w-full max-w-4xl mx-auto bg-white text-black shadow-xl" 
    : "w-full bg-white text-black border rounded-lg overflow-hidden";

  const primaryColor = template?.css_config?.primaryColor || '#2563eb';
  const fontFamily = template?.css_config?.fontFamily || 'Inter, sans-serif';

  const renderPersonalInfo = () => {
    const info = content?.personalInfo || {};
    return (
      <div className="text-center border-b-4 pb-6 mb-6" style={{ borderColor: primaryColor }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor, fontFamily }}>
          {info.fullName || 'Your Name'}
        </h1>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          {info.email && <span>{info.email}</span>}
          {info.phone && <span>{info.phone}</span>}
          {info.location && <span>{info.location}</span>}
          {info.linkedin && <span>{info.linkedin}</span>}
          {info.website && <span>{info.website}</span>}
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const summary = content?.personalInfo?.summary;
    if (!summary) return null;

    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3 border-b-2 pb-1" style={{ color: primaryColor, borderColor: '#e5e7eb' }}>
          Professional Summary
        </h2>
        <p className="text-gray-700 leading-relaxed">{summary}</p>
      </div>
    );
  };

  const renderExperience = () => {
    const experience = content?.experience || [];
    if (!experience.length) return null;

    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 border-b-2 pb-1" style={{ color: primaryColor, borderColor: '#e5e7eb' }}>
          Professional Experience
        </h2>
        <div className="space-y-4">
          {experience.map((exp: any, index: number) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-lg font-medium" style={{ color: '#1f2937' }}>
                  {exp.title}
                </h3>
                <span className="text-sm text-gray-600">
                  {exp.startDate} - {exp.endDate}
                </span>
              </div>
              <div className="font-medium mb-2" style={{ color: primaryColor }}>
                {exp.company} • {exp.location}
              </div>
              {exp.description && (
                <p className="text-gray-700 leading-relaxed">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    const education = content?.education || [];
    if (!education.length) return null;

    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 border-b-2 pb-1" style={{ color: primaryColor, borderColor: '#e5e7eb' }}>
          Education
        </h2>
        <div className="space-y-3">
          {education.map((edu: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-lg font-medium" style={{ color: '#1f2937' }}>
                  {edu.degree}
                </h3>
                <span className="text-sm text-gray-600">
                  {edu.startDate} - {edu.endDate}
                </span>
              </div>
              <div className="font-medium" style={{ color: primaryColor }}>
                {edu.school} • {edu.location}
              </div>
              {edu.gpa && (
                <div className="text-sm text-gray-600">GPA: {edu.gpa}</div>
              )}
              {edu.honors && (
                <div className="text-sm text-gray-600">{edu.honors}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    const skills = content?.skills || {};
    
    // Handle skills as array (new format) or object (legacy format)
    let technicalSkills = [];
    let softSkills = [];
    
    if (Array.isArray(skills)) {
      // Skills is an array - extract skill names properly
      technicalSkills = skills.map(skill => {
        if (typeof skill === 'string') {
          return skill;
        } else if (skill && typeof skill === 'object') {
          // Handle objects with skill, name, or other property structures
          return skill.skill || skill.name || skill.title || String(skill);
        }
        return String(skill);
      }).filter(Boolean);
    } else if (skills.technical) {
      // Legacy object format
      technicalSkills = Array.isArray(skills.technical) 
        ? skills.technical.map(skill => {
            if (typeof skill === 'string') {
              return skill;
            } else if (skill && typeof skill === 'object') {
              return skill.skill || skill.name || skill.title || String(skill);
            }
            return String(skill);
          }).filter(Boolean)
        : [];
      
      softSkills = Array.isArray(skills.soft) 
        ? skills.soft.map(skill => {
            if (typeof skill === 'string') {
              return skill;
            } else if (skill && typeof skill === 'object') {
              return skill.skill || skill.name || skill.title || String(skill);
            }
            return String(skill);
          }).filter(Boolean)
        : [];
    }
    
    if (!technicalSkills.length && !softSkills.length) return null;

    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 border-b-2 pb-1" style={{ color: primaryColor, borderColor: '#e5e7eb' }}>
          Core Skills
        </h2>
        {technicalSkills.length > 0 && (
          <div className="mb-3">
            <h3 className="font-medium mb-2">{softSkills.length > 0 ? 'Technical Skills' : 'Skills'}</h3>
            <div className="flex flex-wrap gap-2">
              {technicalSkills.map((skillName: string, index: number) => (
                <span 
                  key={index}
                  className="px-3 py-1 text-sm rounded-full"
                  style={{ 
                    backgroundColor: `${primaryColor}15`, 
                    color: primaryColor,
                    border: `1px solid ${primaryColor}30`
                  }}
                >
                  {skillName}
                </span>
              ))}
            </div>
          </div>
        )}
        {softSkills.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Soft Skills</h3>
            <div className="flex flex-wrap gap-2">
              {softSkills.map((skillName: string, index: number) => (
                <span 
                  key={index}
                  className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700"
                >
                  {skillName}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProjects = () => {
    const projects = content?.projects || [];
    if (!projects.length) return null;

    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 border-b-2 pb-1" style={{ color: primaryColor, borderColor: '#e5e7eb' }}>
          Projects
        </h2>
        <div className="space-y-3">
          {projects.map((project: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-lg font-medium" style={{ color: '#1f2937' }}>
                  {project.title}
                </h3>
                <span className="text-sm text-gray-600">
                  {project.startDate} - {project.endDate}
                </span>
              </div>
              {project.description && (
                <p className="text-gray-700 mb-2">{project.description}</p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.technologies.map((tech: string, techIndex: number) => (
                    <span 
                      key={techIndex}
                      className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600"
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

  return (
    <div className={containerClass} style={{ fontFamily }}>
      <div className={fullPage ? "p-12" : "p-6"}>
        {renderPersonalInfo()}
        {renderSummary()}
        {renderExperience()}
        {renderEducation()}
        {renderSkills()}
        {renderProjects()}
        
        {/* Empty state */}
        {!content?.personalInfo?.fullName && (
          <div className="text-center py-12 text-gray-500">
            <p>Start editing your resume to see the preview</p>
          </div>
        )}
      </div>
    </div>
  );
};
