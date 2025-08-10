import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Mail, Phone, Globe, Linkedin, Github } from 'lucide-react';
import { createSafeHtml } from '@/utils/sanitize';

interface TemplateRendererProps {
  template: any;
  resumeData: any;
  customization: any;
  className?: string;
  sectionOrder?: string[];
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  template,
  resumeData,
  customization,
  className = '',
  sectionOrder,
}) => {
  const { colors = {}, typography = {}, layout = {}, sections = {} } = customization ?? {};
  
  const getStylesFromCustomization = () => {
    
    return {
      container: {
        backgroundColor: colors?.background || '#FFFFFF',
        color: colors?.text || '#2C3E50',
        fontFamily: `${typography?.bodyFont || 'inter'}, sans-serif`,
        fontSize: `${typography?.fontSize || 12}px`,
        lineHeight: typography?.lineHeight || 1.5,
        padding: layout?.margins === 'narrow' ? '0.5rem' : layout?.margins === 'wide' ? '2rem' : '1rem'
      },
      header: {
        borderBottom: `2px solid ${colors?.primary || '#3498DB'}`,
        paddingBottom: '1rem',
        marginBottom: layout?.spacing === 'compact' ? '0.5rem' : layout?.spacing === 'spacious' ? '2rem' : '1rem'
      },
      sectionTitle: {
        color: colors?.primary || '#3498DB',
        fontFamily: `${typography?.headingFont || 'inter'}, sans-serif`,
        fontSize: `${(typography?.fontSize || 12) + 2}px`,
        fontWeight: 'bold',
        marginBottom: '0.5rem',
        letterSpacing: '0.5px'
      },
      section: {
        marginBottom: layout?.spacing === 'compact' ? '1rem' : layout?.spacing === 'spacious' ? '2rem' : '1.5rem'
      },
      accent: {
        color: colors?.accent || '#E74C3C'
      },
      secondary: {
        color: colors?.secondary || '#2980B9'
      }
    };
  };

  const styles = getStylesFromCustomization();

  const renderPersonalInfo = () => {
    const { personalInfo } = resumeData;
    if (!personalInfo) return null;

    return (
      <div style={styles.header}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2" style={{ color: styles.container.color }}>
              {personalInfo.fullName}
            </h1>
            {(personalInfo.professionalTitle || personalInfo.title) && (
              <h2 className="text-lg mb-3 text-muted-foreground">
                {personalInfo.professionalTitle || personalInfo.title}
              </h2>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm">
              {personalInfo.email && (
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" style={styles.accent} />
                  <span>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" style={styles.accent} />
                  <span>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" style={styles.accent} />
                  <span>{personalInfo.location}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-center gap-1">
                  <Linkedin className="w-4 h-4" style={styles.accent} />
                  <span>{personalInfo.linkedin}</span>
                </div>
              )}
              {personalInfo.github && (
                <div className="flex items-center gap-1">
                  <Github className="w-4 h-4" style={styles.accent} />
                  <span>{personalInfo.github}</span>
                </div>
              )}
            </div>
          </div>
          
          {sections?.showPhoto && personalInfo.photo && (
            <div className="ml-4">
              <img
                src={personalInfo.photo}
                alt="Profile"
                className="w-24 h-24 rounded-full border-2 object-cover"
                style={{ borderColor: styles.sectionTitle.color }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const { personalInfo } = resumeData;
    if (!personalInfo?.summary || !sections?.showSummary) return null;

    return (
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Professional Summary</h3>
        <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={createSafeHtml(String(personalInfo.summary), { FORBID_ATTR: ['style'] })} />
      </div>
    );
  };

  const renderExperience = () => {
    const { experience } = resumeData;
    if (!experience || experience.length === 0) return null;

    return (
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Experience</h3>
        <div className="space-y-4">
          {experience.map((exp: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{exp.title}</h4>
                  <p className="text-sm font-medium text-muted-foreground">
                    {exp.company}
                  </p>
                  {exp.location && (
                    <p className="text-xs text-muted-foreground">{exp.location}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </p>
                </div>
              </div>
              
              {exp.description && (
                <div className="text-sm mb-2" dangerouslySetInnerHTML={createSafeHtml(String(exp.description), { FORBID_ATTR: ['style'] })} />
              )}
              
              {exp.achievements && exp.achievements.length > 0 && (
                <ul className="text-sm space-y-1">
                {exp.achievements.map((achievement: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span dangerouslySetInnerHTML={createSafeHtml(String(achievement), { FORBID_ATTR: ['style'] })} />
                  </li>
                ))}
                </ul>
              )}
              
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {exp.technologies.map((tech: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    const { education } = resumeData;
    if (!education || education.length === 0) return null;

    return (
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Education</h3>
        <div className="space-y-3">
          {education.map((edu: any, index: number) => (
            <div key={index}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{edu.degree}</h4>
                  <p className="text-sm text-muted-foreground">
                    {edu.school}
                  </p>
                  {edu.location && (
                    <p className="text-xs text-muted-foreground">{edu.location}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {edu.endDate}
                  </p>
                  {edu.gpa && (
                    <p className="text-xs text-muted-foreground">GPA: {edu.gpa}</p>
                  )}
                </div>
              </div>
              {edu.honors && (
                <p className="text-sm text-muted-foreground mt-1">{edu.honors}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    const rawSkills = (resumeData as any)?.skills;
    if (!rawSkills) return null;

    // Normalize skills to { technical: string[]; soft?: string[] }
    const normalized = Array.isArray(rawSkills)
      ? { technical: rawSkills }
      : rawSkills;

    const technical: any[] = normalized.technical || [];
    const soft: any[] = normalized.soft || [];
    if (technical.length === 0 && soft.length === 0) return null;

    return (
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Skills</h3>
        <div className="grid grid-cols-2 gap-4">
          {technical.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Technical Skills</h4>
              <div className="flex flex-wrap gap-1">
                {technical.map((skill: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {typeof skill === 'string' ? skill : skill?.name || skill?.skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {soft.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Soft Skills</h4>
              <div className="flex flex-wrap gap-1">
                {soft.map((skill: any, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {typeof skill === 'string' ? skill : skill?.name || skill?.skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    const { projects } = resumeData;
    if (!projects || projects.length === 0) return null;

    return (
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Projects</h3>
        <div className="space-y-3">
          {projects.map((project: any, index: number) => (
            <div key={index}>
              <h4 className="font-semibold">{project.title}</h4>
              <div className="text-sm mb-2" dangerouslySetInnerHTML={createSafeHtml(String(project.description), { FORBID_ATTR: ['style'] })} />
              
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {project.technologies.map((tech: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
              
              {project.achievements && project.achievements.length > 0 && (
                <ul className="text-sm space-y-1">
                  {project.achievements.map((achievement: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span dangerouslySetInnerHTML={createSafeHtml(String(achievement), { FORBID_ATTR: ['style'] })} />
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

  const renderCertifications = () => {
    const { certifications } = resumeData;
    if (!certifications || certifications.length === 0) return null;

    return (
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Certifications</h3>
        <div className="space-y-2">
          {certifications.map((cert: any, index: number) => (
            <div key={index} className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-sm">{cert.name}</h4>
                <p className="text-xs text-muted-foreground">{cert.issuer}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {cert.date}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const defaultOrder = ['header','summary','experience','education','skills','projects','certifications'];
  const mapRender: Record<string, JSX.Element | null> = {
    header: renderPersonalInfo(),
    summary: renderSummary(),
    experience: renderExperience(),
    education: renderEducation(),
    skills: renderSkills(),
    projects: renderProjects(),
    certifications: renderCertifications(),
  };

  const orderToUse = (sectionOrder && sectionOrder.length > 0) ? sectionOrder : defaultOrder;

  return (
    <div className={`bg-white shadow-lg ${className}`} style={styles.container}>
      <div className="max-w-4xl mx-auto">
        {orderToUse.map((key) => mapRender[key]).filter(Boolean)}
      </div>
    </div>
  );
};