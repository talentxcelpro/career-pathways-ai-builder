import { Card, CardContent } from "@/components/ui/card";

interface ResumePreviewProps {
  data?: any;
  content?: any;
  template?: any;
  fullPage?: boolean;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data, content, template, fullPage }) => {
  // Use content if provided, otherwise use data
  const resumeData = content || data;
  
  // Create mock data if none provided (temporary fix)
  const mockResumeData = {
    personalInfo: {
      fullName: "Sample User",
      email: "sample@example.com",
      phone: "+1 (555) 123-4567",
      location: "New York, NY",
      summary: "Experienced professional with 5+ years in technology and leadership roles."
    },
    experience: [
      {
        title: "Software Engineer",
        company: "Tech Corp",
        startDate: "2022",
        endDate: "Present",
        achievements: ["Led development team", "Improved system performance by 30%"]
      }
    ],
    skills: ["JavaScript", "React", "Node.js", "Python", "Project Management"],
    education: [
      {
        institution: "University of Technology",
        degree: "Bachelor of Computer Science",
        year: "2021"
      }
    ]
  };
  
  console.log('ResumePreview - resumeData:', resumeData);
  
  // Use mock data if no real data provided (fallback)
  const displayData = resumeData && (
    resumeData?.personalInfo?.fullName || 
    resumeData?.experience?.length > 0 || 
    resumeData?.skills?.length > 0
  ) ? resumeData : mockResumeData;
  
  if (!displayData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            No resume data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderPersonalInfo = () => {
    const { personalInfo } = displayData;
    if (!personalInfo) return null;

    return (
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {personalInfo.fullName || 'Your Name'}
        </h1>
        <div className="text-sm text-muted-foreground space-y-1">
          {personalInfo.email && <div>{personalInfo.email}</div>}
          {personalInfo.phone && <div>{personalInfo.phone}</div>}
          {personalInfo.location && <div>{personalInfo.location}</div>}
        </div>
        {personalInfo.summary && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Professional Summary</h2>
            <p className="text-sm">{personalInfo.summary}</p>
          </div>
        )}
      </div>
    );
  };

  const renderExperience = () => {
    const { experience } = displayData;
    if (!experience || !Array.isArray(experience) || experience.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Experience</h2>
        <div className="space-y-4">
          {experience.map((exp, index) => (
            <div key={index} className="border-l-2 border-gray-200 pl-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium">{exp.title || 'Position'}</h3>
                <span className="text-sm text-muted-foreground">
                  {exp.startDate} - {exp.endDate || 'Present'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                {exp.company} {exp.location && `• ${exp.location}`}
              </div>
              {exp.description && (
                <p className="text-sm mb-2">{exp.description}</p>
              )}
              {exp.achievements && exp.achievements.length > 0 && (
                <ul className="text-sm space-y-1">
                  {exp.achievements.map((achievement, achIndex) => (
                    <li key={achIndex} className="flex items-start">
                      <span className="mr-2">•</span>
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
    const { education } = displayData;
    if (!education || !Array.isArray(education) || education.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Education</h2>
        <div className="space-y-3">
          {education.map((edu, index) => (
            <div key={index}>
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-medium">{edu.degree || 'Degree'}</h3>
                <span className="text-sm text-muted-foreground">
                  {edu.endDate || edu.graduationDate || 'Year'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {edu.school || edu.institution} {edu.location && `• ${edu.location}`}
              </div>
              {edu.gpa && (
                <div className="text-sm text-muted-foreground">GPA: {edu.gpa}</div>
              )}
              {edu.honors && (
                <div className="text-sm text-muted-foreground">{edu.honors}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    const { projects } = resumeData;
    if (!projects || !Array.isArray(projects) || projects.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Projects</h2>
        <div className="space-y-3">
          {projects.map((project, index) => (
            <div key={index}>
              <h3 className="font-medium mb-1">{project.title || 'Project'}</h3>
              {project.description && (
                <p className="text-sm mb-2">{project.description}</p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Technologies: {project.technologies.join(', ')}
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
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Certifications</h2>
        <div className="space-y-2">
          {certifications.map((cert, index) => (
            <div key={index}>
              <div className="flex justify-between items-start">
                <span className="font-medium">{cert.name || 'Certification'}</span>
                <span className="text-sm text-muted-foreground">{cert.date}</span>
              </div>
              {cert.issuer && (
                <div className="text-sm text-muted-foreground">{cert.issuer}</div>
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
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Awards</h2>
        <div className="space-y-2">
          {awards.map((award, index) => (
            <div key={index}>
              <div className="flex justify-between items-start">
                <span className="font-medium">{award.name || 'Award'}</span>
                <span className="text-sm text-muted-foreground">{award.date}</span>
              </div>
              {award.issuer && (
                <div className="text-sm text-muted-foreground">{award.issuer}</div>
              )}
              {award.description && (
                <div className="text-sm">{award.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    const { skills } = displayData;
    if (!skills) return null;

    // Enhanced skill extraction function that handles all possible formats
    const extractSkillName = (skill: any): string => {
      if (!skill) return '';
      
      if (typeof skill === 'string') {
        return skill.trim();
      } else if (skill && typeof skill === 'object') {
        // Handle different object structures - check for all possible property names
        const skillName = skill.skill || skill.name || skill.title || skill.skillName || skill.text || skill.value;
        if (skillName && typeof skillName === 'string') {
          return skillName.trim();
        }
        
        // If object has a toString method or can be converted to string meaningfully
        if (skill.toString && typeof skill.toString === 'function') {
          const stringified = skill.toString();
          if (stringified !== '[object Object]') {
            return stringified.trim();
          }
        }
        
        // Last resort: log warning and return empty string
        console.warn('Invalid skill object structure, cannot extract string:', skill);
        return '';
      }
      
      // Convert other types to string safely
      return String(skill).trim();
    };

    // Process skills into proper string arrays
    let technicalSkills: string[] = [];
    let softSkills: string[] = [];
    let allSkills: string[] = [];
    
    if (Array.isArray(skills)) {
      // Skills is a direct array - extract skill names properly
      allSkills = skills
        .map(extractSkillName)
        .filter(skillName => skillName && skillName.length > 0);
    } else if (skills && typeof skills === 'object') {
      // Handle object-based skills structure
      if (skills.technical && Array.isArray(skills.technical)) {
        technicalSkills = skills.technical
          .map(extractSkillName)
          .filter(skillName => skillName && skillName.length > 0);
      }
      
      if (skills.soft && Array.isArray(skills.soft)) {
        softSkills = skills.soft
          .map(extractSkillName)
          .filter(skillName => skillName && skillName.length > 0);
      }
      
      // Handle nested technical skills object
      if (skills.technical && typeof skills.technical === 'object' && !Array.isArray(skills.technical)) {
        const nestedTechnical = Object.values(skills.technical)
          .flat()
          .map(extractSkillName)
          .filter(skillName => skillName && skillName.length > 0);
        technicalSkills = [...technicalSkills, ...nestedTechnical];
      }
      
      // Handle case where skills object contains direct skill arrays or values
      if (!skills.technical && !skills.soft && Object.keys(skills).length > 0) {
        // Treat all values as general skills
        allSkills = Object.values(skills)
          .flat()
          .map(extractSkillName)
          .filter(skillName => skillName && skillName.length > 0);
      }
    }
    
    // Remove duplicates and ensure we have valid skills to display
    technicalSkills = [...new Set(technicalSkills)];
    softSkills = [...new Set(softSkills)];
    allSkills = [...new Set(allSkills)];
    
    // Don't render if no valid skills found
    if (!technicalSkills.length && !softSkills.length && !allSkills.length) {
      return null;
    }
    
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Skills</h2>
        <div className="space-y-3">
          {allSkills.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {technicalSkills.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {technicalSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {softSkills.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Soft Skills</h3>
              <div className="flex flex-wrap gap-2">
                {softSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-secondary/10 text-secondary-foreground rounded-md text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={fullPage ? "w-full" : "w-full max-w-2xl mx-auto"}>
      <CardContent className={fullPage ? "p-12" : "p-8"}>
        <div className="space-y-6">
          {renderPersonalInfo()}
          {renderExperience()}
          {renderEducation()}
          {renderSkills()}
          {renderProjects()}
          {renderCertifications()}
          {renderAwards()}
        </div>
      </CardContent>
    </Card>
  );
};
