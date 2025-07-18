import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase_url = Deno.env.get("SUPABASE_URL")
const supabase_key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const supabase = createClient(supabase_url!, supabase_key!)

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  try {
    const { resumeId, format, templateId, userId } = await req.json()

    if (!resumeId || !format || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get resume data
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single()

    if (resumeError || !resume) {
      return new Response(JSON.stringify({ error: 'Resume not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get resume sections
    const { data: sections, error: sectionsError } = await supabase
      .from('resume_sections')
      .select('*')
      .eq('resume_id', resumeId)
      .order('display_order')

    if (sectionsError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch resume sections' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get template if specified
    let template = null
    if (templateId) {
      const { data: templateData, error: templateError } = await supabase
        .from('resume_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (!templateError) {
        template = templateData
      }
    }

    // Build structured resume data
    const resumeData = {
      title: resume.title,
      sections: sections?.reduce((acc, section) => {
        acc[section.section] = section.data
        return acc
      }, {} as Record<string, any>) || {}
    }

    // Generate HTML content for the resume
    const htmlContent = generateResumeHTML(resumeData, template)

    if (format === 'html') {
      return new Response(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*',
        },
      })
    }

    // For PDF/DOCX, return the HTML that can be processed by the frontend
    return new Response(JSON.stringify({
      success: true,
      html: htmlContent,
      filename: `${resume.title.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`,
      format
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('Error in export-resume function:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  }
})

function generateResumeHTML(resumeData: any, template: any = null) {
  const sections = resumeData.sections || {}
  const personalInfo = sections.personal_info || {}
  const templateConfig = template?.template_config || {}
  
  const primaryColor = templateConfig.primaryColor || '#2563eb'
  const fontFamily = templateConfig.fontFamily || 'Arial, sans-serif'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.title}</title>
    <style>
        body {
            font-family: ${fontFamily};
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid ${primaryColor};
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .name {
            font-size: 2.5rem;
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: 10px;
        }
        .contact-info {
            font-size: 1rem;
            color: #666;
        }
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 1.4rem;
            font-weight: bold;
            color: ${primaryColor};
            border-bottom: 1px solid ${primaryColor};
            padding-bottom: 5px;
            margin-bottom: 15px;
        }
        .experience-item, .education-item {
            margin-bottom: 20px;
        }
        .item-header {
            font-weight: bold;
            color: #333;
        }
        .item-subheader {
            color: #666;
            font-style: italic;
        }
        .skills-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .skill-item {
            background: #f0f0f0;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.9rem;
        }
        ul {
            padding-left: 20px;
        }
        @media print {
            body { padding: 0; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="name">${personalInfo.name || 'Your Name'}</div>
        <div class="contact-info">
            ${personalInfo.email ? `${personalInfo.email}` : ''}
            ${personalInfo.phone ? ` • ${personalInfo.phone}` : ''}
            ${personalInfo.location ? ` • ${personalInfo.location}` : ''}
            ${personalInfo.linkedin ? ` • ${personalInfo.linkedin}` : ''}
        </div>
    </div>

    ${sections.summary ? `
    <div class="section">
        <div class="section-title">Professional Summary</div>
        <p>${sections.summary}</p>
    </div>
    ` : ''}

    ${sections.experience ? `
    <div class="section">
        <div class="section-title">Professional Experience</div>
        ${sections.experience.map((exp: any) => `
            <div class="experience-item">
                <div class="item-header">${exp.title} - ${exp.company}</div>
                <div class="item-subheader">${exp.startDate} - ${exp.endDate} ${exp.location ? `• ${exp.location}` : ''}</div>
                ${exp.achievements ? `
                    <ul>
                        ${exp.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${sections.education ? `
    <div class="section">
        <div class="section-title">Education</div>
        ${sections.education.map((edu: any) => `
            <div class="education-item">
                <div class="item-header">${edu.degree} - ${edu.institution}</div>
                <div class="item-subheader">${edu.startDate} - ${edu.endDate} ${edu.location ? `• ${edu.location}` : ''}</div>
                ${edu.grade ? `<div>Grade: ${edu.grade}</div>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${sections.skills ? `
    <div class="section">
        <div class="section-title">Skills</div>
        <div class="skills-grid">
            ${sections.skills.map((skill: string) => `<div class="skill-item">${skill}</div>`).join('')}
        </div>
    </div>
    ` : ''}

    ${sections.certifications ? `
    <div class="section">
        <div class="section-title">Certifications</div>
        ${sections.certifications.map((cert: any) => `
            <div class="education-item">
                <div class="item-header">${cert.name}</div>
                <div class="item-subheader">${cert.issuer} • ${cert.date}</div>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${sections.projects ? `
    <div class="section">
        <div class="section-title">Projects</div>
        ${sections.projects.map((project: any) => `
            <div class="experience-item">
                <div class="item-header">${project.name}</div>
                <div class="item-subheader">${project.technologies?.join(', ') || ''}</div>
                ${project.description ? `<p>${project.description}</p>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>
  `
}