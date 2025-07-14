import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeData, template, format, settings } = await req.json();

    console.log('Generating resume export:', { format, template: template?.id, settings });

    // For DOCX generation, we'll create a structured document
    if (format === 'docx') {
      const docxContent = generateDOCXContent(resumeData, template, settings);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          content: docxContent,
          filename: `${resumeData.personalInfo?.fullName || 'Resume'}-${template?.id || 'default'}.docx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For PDF generation
    if (format === 'pdf') {
      const htmlContent = generateHTMLContent(resumeData, template, settings);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          content: htmlContent,
          filename: `${resumeData.personalInfo?.fullName || 'Resume'}-${template?.id || 'default'}.pdf`,
          mimeType: 'application/pdf'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For HTML preview
    const htmlContent = generateHTMLContent(resumeData, template, settings);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        content: htmlContent,
        filename: `${resumeData.personalInfo?.fullName || 'Resume'}-${template?.id || 'default'}.html`,
        mimeType: 'text/html'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in resume export:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateDOCXContent(resumeData: any, template: any, settings: any) {
  // DOCX structure for Microsoft Word compatibility
  const docxStructure = {
    document: {
      body: {
        sections: [
          {
            properties: {
              page: {
                size: { width: 12240, height: 15840 }, // Letter size in twips
                margin: { top: 720, right: 720, bottom: 720, left: 720 }
              }
            },
            headers: generateDocxHeader(resumeData, template, settings),
            content: [
              ...generateDocxPersonalInfo(resumeData.personalInfo),
              ...generateDocxSummary(resumeData.personalInfo?.summary),
              ...generateDocxExperience(resumeData.experience || []),
              ...generateDocxEducation(resumeData.education || []),
              ...generateDocxSkills(resumeData.skills),
              ...generateDocxProjects(resumeData.projects || []),
              ...generateDocxCertifications(resumeData.certifications || []),
              ...generateDocxAwards(resumeData.awards || [])
            ]
          }
        ]
      }
    },
    styles: generateDocxStyles(template, settings),
    numbering: {},
    media: {}
  };

  return JSON.stringify(docxStructure);
}

function generateHTMLContent(resumeData: any, template: any, settings: any) {
  const styles = generateCSSStyles(template, settings);
  const branding = settings?.showBranding !== false ? generateBrandingFooter() : '';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.personalInfo?.fullName || 'Resume'}</title>
    <style>${styles}</style>
</head>
<body>
    <div class="resume-container">
        ${generateHTMLHeader(resumeData.personalInfo, template)}
        ${generateHTMLSummary(resumeData.personalInfo?.summary)}
        ${generateHTMLExperience(resumeData.experience || [])}
        ${generateHTMLEducation(resumeData.education || [])}
        ${generateHTMLSkills(resumeData.skills)}
        ${generateHTMLProjects(resumeData.projects || [])}
        ${generateHTMLCertifications(resumeData.certifications || [])}
        ${generateHTMLAwards(resumeData.awards || [])}
        ${branding}
    </div>
</body>
</html>`;
}

function generateCSSStyles(template: any, settings: any) {
  const colorScheme = template?.colorSchemes?.[0] || {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#3b82f6'
  };

  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: ${settings?.fontFamily || "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"};
      font-size: ${settings?.fontSize || '14px'};
      line-height: 1.6;
      color: #374151;
      background: white;
    }
    
    .resume-container {
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.75in;
      background: white;
      min-height: 11in;
    }
    
    .header {
      margin-bottom: 2rem;
      ${template?.layout?.headerStyle === 'centered' ? 'text-align: center;' : ''}
    }
    
    .name {
      font-size: 2.5rem;
      font-weight: 700;
      color: ${colorScheme.primary};
      margin-bottom: 0.5rem;
    }
    
    .contact-info {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      ${template?.layout?.headerStyle === 'centered' ? 'justify-content: center;' : ''}
      margin-bottom: 1rem;
    }
    
    .contact-item {
      color: ${colorScheme.secondary};
      font-size: 0.9rem;
    }
    
    .section {
      margin-bottom: 2rem;
    }
    
    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: ${colorScheme.primary};
      margin-bottom: 1rem;
      padding-bottom: 0.25rem;
      border-bottom: 2px solid ${colorScheme.accent};
    }
    
    .experience-item, .education-item, .project-item {
      margin-bottom: 1.5rem;
    }
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.5rem;
    }
    
    .item-title {
      font-weight: 600;
      color: #1f2937;
    }
    
    .item-subtitle {
      color: ${colorScheme.secondary};
      font-weight: 500;
    }
    
    .item-date {
      color: ${colorScheme.secondary};
      font-size: 0.9rem;
      white-space: nowrap;
    }
    
    .item-description {
      color: #4b5563;
      margin-top: 0.5rem;
    }
    
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    
    .skill-category {
      margin-bottom: 1rem;
    }
    
    .skill-category-title {
      font-weight: 600;
      color: ${colorScheme.primary};
      margin-bottom: 0.5rem;
    }
    
    .skill-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .skill-item {
      background: ${colorScheme.accent}20;
      color: ${colorScheme.primary};
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.85rem;
    }
    
    .branding {
      margin-top: 3rem;
      text-align: center;
      font-size: 0.75rem;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
      padding-top: 1rem;
    }
    
    ul {
      list-style-type: disc;
      padding-left: 1.25rem;
    }
    
    li {
      margin-bottom: 0.25rem;
    }
    
    @media print {
      .resume-container {
        margin: 0;
        padding: 0.5in;
        box-shadow: none;
      }
      
      .branding {
        display: ${settings?.showBranding === false ? 'none' : 'block'};
      }
    }
  `;
}

function generateHTMLHeader(personalInfo: any, template: any) {
  if (!personalInfo) return '';
  
  return `
    <header class="header">
      <h1 class="name">${personalInfo.fullName || ''}</h1>
      <div class="contact-info">
        ${personalInfo.email ? `<span class="contact-item">${personalInfo.email}</span>` : ''}
        ${personalInfo.phone ? `<span class="contact-item">${personalInfo.phone}</span>` : ''}
        ${personalInfo.location ? `<span class="contact-item">${personalInfo.location}</span>` : ''}
        ${personalInfo.linkedin ? `<span class="contact-item">${personalInfo.linkedin}</span>` : ''}
        ${personalInfo.website ? `<span class="contact-item">${personalInfo.website}</span>` : ''}
      </div>
    </header>
  `;
}

function generateHTMLSummary(summary: string) {
  if (!summary) return '';
  
  return `
    <section class="section">
      <h2 class="section-title">Professional Summary</h2>
      <p class="item-description">${summary}</p>
    </section>
  `;
}

function generateHTMLExperience(experience: any[]) {
  if (!experience.length) return '';
  
  const experienceItems = experience.map(exp => `
    <div class="experience-item">
      <div class="item-header">
        <div>
          <div class="item-title">${exp.title || ''}</div>
          <div class="item-subtitle">${exp.company || ''} ${exp.location ? `• ${exp.location}` : ''}</div>
        </div>
        <div class="item-date">${exp.startDate || ''} - ${exp.endDate || ''}</div>
      </div>
      ${exp.description ? `<div class="item-description">${exp.description}</div>` : ''}
      ${exp.achievements && exp.achievements.length > 0 ? `
        <ul>
          ${exp.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `).join('');
  
  return `
    <section class="section">
      <h2 class="section-title">Professional Experience</h2>
      ${experienceItems}
    </section>
  `;
}

function generateHTMLEducation(education: any[]) {
  if (!education.length) return '';
  
  const educationItems = education.map(edu => `
    <div class="education-item">
      <div class="item-header">
        <div>
          <div class="item-title">${edu.degree || ''}</div>
          <div class="item-subtitle">${edu.school || ''} ${edu.location ? `• ${edu.location}` : ''}</div>
        </div>
        <div class="item-date">${edu.startDate || ''} - ${edu.endDate || ''}</div>
      </div>
      ${edu.gpa ? `<div class="item-description">GPA: ${edu.gpa}</div>` : ''}
      ${edu.honors ? `<div class="item-description">${edu.honors}</div>` : ''}
    </div>
  `).join('');
  
  return `
    <section class="section">
      <h2 class="section-title">Education</h2>
      ${educationItems}
    </section>
  `;
}

function generateHTMLSkills(skills: any) {
  if (!skills) return '';
  
  const skillCategories = [];
  
  if (skills.technical) {
    const techSkills = [
      { title: 'Programming', items: skills.technical.programming || [] },
      { title: 'Frameworks', items: skills.technical.frameworks || [] },
      { title: 'Databases', items: skills.technical.databases || [] },
      { title: 'Tools', items: skills.technical.tools || [] },
      { title: 'Cloud', items: skills.technical.cloud || [] }
    ].filter(category => category.items.length > 0);
    
    skillCategories.push(...techSkills);
  }
  
  if (skills.soft && skills.soft.length > 0) {
    skillCategories.push({ title: 'Soft Skills', items: skills.soft });
  }
  
  if (skills.languages && skills.languages.length > 0) {
    skillCategories.push({ 
      title: 'Languages', 
      items: skills.languages.map((lang: any) => `${lang.language} (${lang.proficiency})`) 
    });
  }
  
  if (skillCategories.length === 0) return '';
  
  const skillsHTML = skillCategories.map(category => `
    <div class="skill-category">
      <div class="skill-category-title">${category.title}</div>
      <div class="skill-list">
        ${category.items.map((skill: any) => {
          const skillName = typeof skill === 'string' ? skill : skill.skill || skill;
          return `<span class="skill-item">${skillName}</span>`;
        }).join('')}
      </div>
    </div>
  `).join('');
  
  return `
    <section class="section">
      <h2 class="section-title">Skills</h2>
      <div class="skills-grid">
        ${skillsHTML}
      </div>
    </section>
  `;
}

function generateHTMLProjects(projects: any[]) {
  if (!projects.length) return '';
  
  const projectItems = projects.map(project => `
    <div class="project-item">
      <div class="item-header">
        <div>
          <div class="item-title">${project.title || ''}</div>
          ${project.url ? `<div class="item-subtitle">${project.url}</div>` : ''}
        </div>
        ${project.startDate || project.endDate ? `
          <div class="item-date">${project.startDate || ''} - ${project.endDate || ''}</div>
        ` : ''}
      </div>
      ${project.description ? `<div class="item-description">${project.description}</div>` : ''}
      ${project.technologies && project.technologies.length > 0 ? `
        <div class="skill-list" style="margin-top: 0.5rem;">
          ${project.technologies.map((tech: string) => `<span class="skill-item">${tech}</span>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
  
  return `
    <section class="section">
      <h2 class="section-title">Projects</h2>
      ${projectItems}
    </section>
  `;
}

function generateHTMLCertifications(certifications: any[]) {
  if (!certifications.length) return '';
  
  const certItems = certifications.map(cert => `
    <div class="education-item">
      <div class="item-header">
        <div>
          <div class="item-title">${cert.name || ''}</div>
          <div class="item-subtitle">${cert.issuer || ''}</div>
        </div>
        <div class="item-date">${cert.date || ''}</div>
      </div>
      ${cert.credentialId ? `<div class="item-description">Credential ID: ${cert.credentialId}</div>` : ''}
    </div>
  `).join('');
  
  return `
    <section class="section">
      <h2 class="section-title">Certifications</h2>
      ${certItems}
    </section>
  `;
}

function generateHTMLAwards(awards: any[]) {
  if (!awards.length) return '';
  
  const awardItems = awards.map(award => `
    <div class="education-item">
      <div class="item-header">
        <div>
          <div class="item-title">${award.name || ''}</div>
          <div class="item-subtitle">${award.issuer || ''}</div>
        </div>
        <div class="item-date">${award.date || ''}</div>
      </div>
      ${award.description ? `<div class="item-description">${award.description}</div>` : ''}
    </div>
  `).join('');
  
  return `
    <section class="section">
      <h2 class="section-title">Awards & Achievements</h2>
      ${awardItems}
    </section>
  `;
}

function generateBrandingFooter() {
  return `
    <div class="branding">
      <p>Resume created with ResumeBuilder Pro - Professional Resume Builder</p>
    </div>
  `;
}

// DOCX generation helpers
function generateDocxHeader(resumeData: any, template: any, settings: any) {
  return {};
}

function generateDocxPersonalInfo(personalInfo: any) {
  return [];
}

function generateDocxSummary(summary: string) {
  return [];
}

function generateDocxExperience(experience: any[]) {
  return [];
}

function generateDocxEducation(education: any[]) {
  return [];
}

function generateDocxSkills(skills: any) {
  return [];
}

function generateDocxProjects(projects: any[]) {
  return [];
}

function generateDocxCertifications(certifications: any[]) {
  return [];
}

function generateDocxAwards(awards: any[]) {
  return [];
}

function generateDocxStyles(template: any, settings: any) {
  return {};
}