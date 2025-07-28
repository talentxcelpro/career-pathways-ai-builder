import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 Resume export function started')
    
    const { resumeData, template, format, settings } = await req.json()
    
    console.log('📋 Export request:', { format, templateId: template?.id })
    
    // Mock export for now - in production this would use a proper PDF/DOCX generator
    const mockExport = {
      success: true,
      content: generateMockContent(resumeData, format),
      filename: `resume_${Date.now()}.${format}`,
      mimeType: getMimeType(format)
    }
    
    console.log('✅ Export completed successfully')
    
    return new Response(JSON.stringify(mockExport), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
    
  } catch (error) {
    console.error('❌ Export error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function generateMockContent(resumeData: any, format: string): string {
  const sections = resumeData?.sections || []
  
  if (format === 'html' || format === 'pdf') {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resume</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .section { margin-bottom: 20px; }
        .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .contact-info { text-align: center; margin-bottom: 20px; }
        .experience-item, .education-item { margin-bottom: 15px; }
        .skills { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill { background: #f0f0f0; padding: 5px 10px; border-radius: 5px; }
    </style>
</head>
<body>
    ${generateHtmlContent(sections)}
</body>
</html>
    `
  }
  
  // For DOCX format, return HTML that can be converted
  return generateHtmlContent(sections)
}

function generateHtmlContent(sections: any[]): string {
  let html = ''
  
  const personalSection = sections.find(s => s.type === 'personal')
  if (personalSection?.content) {
    const { fullName, email, phone, location } = personalSection.content
    html += `
      <div class="header">
        <h1>${fullName || 'Your Name'}</h1>
        <div class="contact-info">
          ${email || ''} • ${phone || ''} • ${location || ''}
        </div>
      </div>
    `
  }
  
  sections
    .filter(s => s.type !== 'personal' && s.isVisible)
    .sort((a, b) => a.order - b.order)
    .forEach(section => {
      html += `<div class="section"><h2>${section.title}</h2>`
      
      if (section.type === 'summary' && section.content?.text) {
        html += `<p>${section.content.text}</p>`
      } else if (section.content?.items) {
        section.content.items.forEach((item: any) => {
          if (section.type === 'experience') {
            html += `
              <div class="experience-item">
                <h3>${item.title || 'Position'}</h3>
                <p><strong>${item.company || 'Company'}</strong> • ${item.startDate || 'Start'} - ${item.endDate || 'End'}</p>
                <p>${item.description || ''}</p>
              </div>
            `
          } else if (section.type === 'education') {
            html += `
              <div class="education-item">
                <h3>${item.degree || 'Degree'}</h3>
                <p><strong>${item.school || 'School'}</strong> • ${item.startDate || 'Start'} - ${item.endDate || 'End'}</p>
              </div>
            `
          } else if (section.type === 'skills') {
            html += `<span class="skill">${item.name || 'Skill'}</span>`
          } else {
            html += `<p>${item.name || item.title || 'Item'}</p>`
          }
        })
      }
      
      html += '</div>'
    })
  
  return html
}

function getMimeType(format: string): string {
  switch (format) {
    case 'pdf':
      return 'application/pdf'
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'html':
    default:
      return 'text/html'
  }
}