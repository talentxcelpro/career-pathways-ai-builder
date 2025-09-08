import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

function generateHTML(resumeData: ResumeData, template: any, settings: any): string {
  const { colors = { primary: '#2563eb', text: '#374151' }, fonts = { header: 'Inter', body: 'Inter' } } = template.colorSchemes?.[0] || {};
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.personalInfo.fullName} - Resume</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=${fonts.header.replace(' ', '+')}:wght@400;600;700&family=${fonts.body.replace(' ', '+')}:wght@300;400;500&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: '${fonts.body}', sans-serif;
            color: ${colors.text};
            line-height: 1.6;
            background: white;
        }
        
        .resume-container {
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
            min-height: 11in;
            padding: 0.75in;
        }
        
        .header {
            text-align: center;
            margin-bottom: 2rem;
            border-bottom: 2px solid ${colors.primary};
            padding-bottom: 1rem;
        }
        
        .name {
            font-family: '${fonts.header}', sans-serif;
            font-size: 2.5rem;
            font-weight: 700;
            color: ${colors.primary};
            margin-bottom: 0.5rem;
        }
        
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
            font-size: 0.9rem;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.25rem;
        }
        
        .section {
            margin-bottom: 1.5rem;
        }
        
        .section-title {
            font-family: '${fonts.header}', sans-serif;
            font-size: 1.25rem;
            font-weight: 600;
            color: ${colors.primary};
            margin-bottom: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid ${colors.primary};
            padding-bottom: 0.25rem;
        }
        
        .summary {
            font-size: 0.95rem;
            line-height: 1.7;
            text-align: justify;
        }
        
        .experience-item, .education-item, .project-item {
            margin-bottom: 1rem;
            break-inside: avoid;
        }
        
        .job-header, .edu-header, .project-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.5rem;
        }
        
        .job-title, .degree, .project-name {
            font-weight: 600;
            color: ${colors.primary};
            font-size: 1rem;
        }
        
        .company, .institution {
            font-weight: 500;
            font-size: 0.9rem;
            margin-top: 0.1rem;
        }
        
        .date-location {
            text-align: right;
            font-size: 0.85rem;
            color: #6b7280;
            font-style: italic;
        }
        
        .description {
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
            line-height: 1.6;
        }
        
        .achievements {
            list-style: none;
        }
        
        .achievements li {
            position: relative;
            margin-bottom: 0.3rem;
            padding-left: 1rem;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        
        .achievements li:before {
            content: "▸";
            color: ${colors.primary};
            font-weight: bold;
            position: absolute;
            left: 0;
        }
        
        .skills-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 0.5rem;
        }
        
        .skill-item {
            background: #f8fafc;
            padding: 0.5rem;
            border-radius: 4px;
            border-left: 3px solid ${colors.primary};
            font-size: 0.9rem;
        }
        
        .technologies {
            font-size: 0.85rem;
            color: #6b7280;
            font-style: italic;
            margin-top: 0.25rem;
        }
        
        @media print {
            .resume-container {
                margin: 0;
                box-shadow: none;
                padding: 0.5in;
            }
            
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="resume-container">
        <div class="header">
            <h1 class="name">${resumeData.personalInfo.fullName}</h1>
            <div class="contact-info">
                <div class="contact-item">📧 ${resumeData.personalInfo.email}</div>
                <div class="contact-item">📱 ${resumeData.personalInfo.phone}</div>
                <div class="contact-item">📍 ${resumeData.personalInfo.location}</div>
            </div>
        </div>
        
        ${resumeData.personalInfo.summary ? `
        <div class="section">
            <h2 class="section-title">Professional Summary</h2>
            <p class="summary">${resumeData.personalInfo.summary}</p>
        </div>
        ` : ''}
        
        ${resumeData.experience?.length ? `
        <div class="section">
            <h2 class="section-title">Professional Experience</h2>
            ${resumeData.experience.map(exp => `
                <div class="experience-item">
                    <div class="job-header">
                        <div>
                            <div class="job-title">${exp.title}</div>
                            <div class="company">${exp.company}</div>
                        </div>
                        <div class="date-location">
                            <div>${exp.startDate} - ${exp.endDate || 'Present'}</div>
                            <div>${exp.location}</div>
                        </div>
                    </div>
                    ${exp.description ? `<p class="description">${exp.description}</p>` : ''}
                    ${exp.achievements?.length ? `
                    <ul class="achievements">
                        ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                    </ul>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${resumeData.education?.length ? `
        <div class="section">
            <h2 class="section-title">Education</h2>
            ${resumeData.education.map(edu => `
                <div class="education-item">
                    <div class="edu-header">
                        <div>
                            <div class="degree">${edu.degree}</div>
                            <div class="institution">${edu.institution}</div>
                        </div>
                        <div class="date-location">
                            <div>${edu.startDate} - ${edu.endDate}</div>
                            <div>${edu.location}</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        ${resumeData.skills?.length ? `
        <div class="section">
            <h2 class="section-title">Technical Skills</h2>
            <div class="skills-grid">
                ${resumeData.skills.map(skill => `<div class="skill-item">${skill}</div>`).join('')}
            </div>
        </div>
        ` : ''}
        
        ${resumeData.projects?.length ? `
        <div class="section">
            <h2 class="section-title">Projects</h2>
            ${resumeData.projects.map(project => `
                <div class="project-item">
                    <div class="project-header">
                        <div class="project-name">${project.name}</div>
                    </div>
                    <p class="description">${project.description}</p>
                    ${project.technologies?.length ? `
                    <div class="technologies">Technologies: ${project.technologies.join(', ')}</div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeData, template, format, settings } = await req.json();

    const html = generateHTML(resumeData, template, settings);

    let mimeType = 'text/html';
    let filename = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.html`;

    return new Response(JSON.stringify({
      success: true,
      content: html,
      mimeType,
      filename
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Resume export error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});