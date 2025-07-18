
import React from 'react';

interface SectionData {
  id: string;
  type: 'personal' | 'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'achievements' | 'languages';
  title: string;
  content: any;
  order: number;
  isVisible: boolean;
}

interface Customization {
  colorScheme: string;
  fontFamily: string;
  fontSize: string;
  spacing: string;
  layout: string;
}

interface VisualPreviewProps {
  sections: SectionData[];
  template: string;
  customization: Customization;
  isEditor?: boolean;
}

export const VisualPreview: React.FC<VisualPreviewProps> = ({
  sections,
  template,
  customization,
  isEditor = false
}) => {
  const visibleSections = sections.filter(section => section.isVisible).sort((a, b) => a.order - b.order);
  
  const getColorScheme = () => {
    const schemes = {
      blue: { primary: '#2563eb', secondary: '#64748b', background: '#f8fafc' },
      green: { primary: '#059669', secondary: '#64748b', background: '#f0fdf4' },
      purple: { primary: '#7c3aed', secondary: '#64748b', background: '#faf5ff' },
      orange: { primary: '#ea580c', secondary: '#64748b', background: '#fff7ed' },
      gray: { primary: '#374151', secondary: '#6b7280', background: '#f9fafb' },
      red: { primary: '#dc2626', secondary: '#64748b', background: '#fef2f2' }
    };
    return schemes[customization.colorScheme as keyof typeof schemes] || schemes.blue;
  };

  const colors = getColorScheme();
  
  const getFontSize = () => {
    const sizes = {
      small: { base: '11px', heading: '14px', title: '16px' },
      medium: { base: '12px', heading: '15px', title: '18px' },
      large: { base: '13px', heading: '16px', title: '20px' }
    };
    return sizes[customization.fontSize as keyof typeof sizes] || sizes.medium;
  };

  const fontSize = getFontSize();

  const getSpacing = () => {
    const spacing = {
      compact: { section: '12px', item: '8px' },
      normal: { section: '20px', item: '12px' },
      spacious: { section: '28px', item: '16px' }
    };
    return spacing[customization.spacing as keyof typeof spacing] || spacing.normal;
  };

  const spacing = getSpacing();

  const renderPersonalSection = (content: any) => (
    <div style={{ textAlign: 'center', marginBottom: spacing.section }}>
      <h1 style={{ 
        color: colors.primary, 
        fontSize: fontSize.title, 
        fontWeight: 'bold', 
        margin: '0 0 4px 0',
        fontFamily: customization.fontFamily
      }}>
        {content?.fullName || 'Your Name'}
      </h1>
      <p style={{ 
        color: colors.secondary, 
        fontSize: fontSize.heading, 
        margin: '0 0 8px 0',
        fontFamily: customization.fontFamily
      }}>
        {content?.title || 'Professional Title'}
      </p>
      <div style={{ 
        color: colors.secondary, 
        fontSize: fontSize.base, 
        lineHeight: '1.4',
        fontFamily: customization.fontFamily
      }}>
        {content?.email && <span>{content.email}</span>}
        {content?.phone && <span> • {content.phone}</span>}
        {content?.location && <span> • {content.location}</span>}
      </div>
    </div>
  );

  const renderSummarySection = (content: string) => (
    <div style={{ marginBottom: spacing.section }}>
      <h2 style={{ 
        color: colors.primary, 
        fontSize: fontSize.heading, 
        fontWeight: '600', 
        margin: `0 0 ${spacing.item} 0`,
        borderBottom: `2px solid ${colors.primary}`,
        paddingBottom: '4px',
        fontFamily: customization.fontFamily
      }}>
        Professional Summary
      </h2>
      <p style={{ 
        color: colors.secondary, 
        fontSize: fontSize.base, 
        lineHeight: '1.6', 
        margin: '0',
        fontFamily: customization.fontFamily
      }}>
        {content || 'Add your professional summary here...'}
      </p>
    </div>
  );

  const renderSkillsSection = (content: string[]) => (
    <div style={{ marginBottom: spacing.section }}>
      <h2 style={{ 
        color: colors.primary, 
        fontSize: fontSize.heading, 
        fontWeight: '600', 
        margin: `0 0 ${spacing.item} 0`,
        borderBottom: `2px solid ${colors.primary}`,
        paddingBottom: '4px',
        fontFamily: customization.fontFamily
      }}>
        Skills
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {(content || []).map((skill: string, index: number) => (
          <span
            key={index}
            style={{
              backgroundColor: `${colors.primary}15`,
              color: colors.primary,
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: fontSize.base,
              fontFamily: customization.fontFamily
            }}
          >
            {skill}
          </span>
        ))}
        {(!content || content.length === 0) && (
          <span style={{ 
            color: colors.secondary, 
            fontSize: fontSize.base, 
            fontStyle: 'italic',
            fontFamily: customization.fontFamily
          }}>
            Add your skills here...
          </span>
        )}
      </div>
    </div>
  );

  const renderExperienceSection = (content: any[]) => (
    <div style={{ marginBottom: spacing.section }}>
      <h2 style={{ 
        color: colors.primary, 
        fontSize: fontSize.heading, 
        fontWeight: '600', 
        margin: `0 0 ${spacing.item} 0`,
        borderBottom: `2px solid ${colors.primary}`,
        paddingBottom: '4px',
        fontFamily: customization.fontFamily
      }}>
        Work Experience
      </h2>
      {(!content || content.length === 0) && (
        <p style={{ 
          color: colors.secondary, 
          fontSize: fontSize.base, 
          fontStyle: 'italic', 
          margin: '0',
          fontFamily: customization.fontFamily
        }}>
          Add your work experience here...
        </p>
      )}
      {(content || []).map((exp: any, index: number) => (
        <div key={index} style={{ marginBottom: spacing.item }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ 
                color: colors.primary, 
                fontSize: fontSize.base, 
                fontWeight: '600', 
                margin: '0',
                fontFamily: customization.fontFamily
              }}>
                {exp.title || 'Job Title'}
              </h3>
              <p style={{ 
                color: colors.secondary, 
                fontSize: fontSize.base, 
                margin: '2px 0',
                fontFamily: customization.fontFamily
              }}>
                {exp.company || 'Company Name'}
              </p>
            </div>
            <span style={{ 
              color: colors.secondary, 
              fontSize: fontSize.base, 
              whiteSpace: 'nowrap',
              fontFamily: customization.fontFamily
            }}>
              {exp.startDate || 'Start'} - {exp.endDate || 'End'}
            </span>
          </div>
          {exp.description && (
            <p style={{ 
              color: colors.secondary, 
              fontSize: fontSize.base, 
              lineHeight: '1.5', 
              margin: '4px 0 0 0',
              fontFamily: customization.fontFamily
            }}>
              {exp.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );

  const renderGenericSection = (section: SectionData) => (
    <div key={section.id} style={{ marginBottom: spacing.section }}>
      <h2 style={{ 
        color: colors.primary, 
        fontSize: fontSize.heading, 
        fontWeight: '600', 
        margin: `0 0 ${spacing.item} 0`,
        borderBottom: `2px solid ${colors.primary}`,
        paddingBottom: '4px',
        fontFamily: customization.fontFamily
      }}>
        {section.title}
      </h2>
      <p style={{ 
        color: colors.secondary, 
        fontSize: fontSize.base, 
        lineHeight: '1.6', 
        margin: '0',
        fontFamily: customization.fontFamily
      }}>
        {typeof section.content === 'string' ? section.content : 'Content will appear here...'}
      </p>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: 'white',
      padding: isEditor ? '40px' : '60px',
      minHeight: '29.7cm',
      maxWidth: '21cm',
      margin: '0 auto',
      fontFamily: customization.fontFamily,
      color: colors.secondary,
      fontSize: fontSize.base,
      lineHeight: '1.5'
    }}>
      {visibleSections.map((section) => {
        switch (section.type) {
          case 'personal':
            return <div key={section.id}>{renderPersonalSection(section.content)}</div>;
          case 'summary':
            return <div key={section.id}>{renderSummarySection(section.content)}</div>;
          case 'skills':
            return <div key={section.id}>{renderSkillsSection(section.content)}</div>;
          case 'experience':
            return <div key={section.id}>{renderExperienceSection(section.content)}</div>;
          default:
            return renderGenericSection(section);
        }
      })}

      {/* TalentXcel Watermark */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '40px',
        color: colors.secondary,
        fontSize: '10px',
        opacity: 0.5,
        fontFamily: customization.fontFamily
      }}>
        Powered by TalentXcel
      </div>
    </div>
  );
};
