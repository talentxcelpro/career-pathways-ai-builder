import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user } } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { resumeData, template, format, settings } = await req.json();

    console.log('Export request:', { format, template: template?.id });

    // Create export record
    const { data: exportRecord, error: exportError } = await supabaseClient
      .from('resume_exports')
      .insert({
        user_id: user.id,
        resume_id: resumeData.metadata?.id,
        export_format: format,
        template_id: template?.id || 'modern',
        color_scheme: template?.colorSchemes?.[0]?.id || 'blue',
        customization: settings || {},
        status: 'processing'
      })
      .select()
      .single();

    if (exportError) {
      console.error('Export record creation error:', exportError);
      throw exportError;
    }

    console.log('Created export record:', exportRecord.id);

    // Generate content based on format
    let generatedContent = '';
    let mimeType = 'text/html';
    let filename = `resume-${Date.now()}.${format}`;

    if (format === 'html') {
      generatedContent = await generateHTMLResume(resumeData, template, settings);
      mimeType = 'text/html';
      filename = `resume-${Date.now()}.html`;
    } else if (format === 'pdf') {
      generatedContent = await generatePDFResume(resumeData, template, settings);
      mimeType = 'application/pdf';
      filename = `resume-${Date.now()}.pdf`;
    } else if (format === 'docx') {
      generatedContent = await generateDOCXResume(resumeData, template, settings);
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      filename = `resume-${Date.now()}.docx`;
    }

    // Update export record with success
    await supabaseClient
      .from('resume_exports')
      .update({
        status: 'completed',
        file_size: generatedContent.length
      })
      .eq('id', exportRecord.id);

    console.log('Export completed successfully');

    return new Response(JSON.stringify({
      success: true,
      content: generatedContent,
      mimeType,
      filename,
      exportId: exportRecord.id
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

async function generateHTMLResume(resumeData: any, template: any, settings: any): Promise<string> {
  const colorScheme = template?.colorSchemes?.[0] || { primary: '#3B82F6', secondary: '#1E40AF' };
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resumeData.personalInfo?.fullName || 'Resume'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: ${settings?.fontFamily || 'Inter, sans-serif'}; 
      line-height: 1.6; 
      color: #333;
      font-size: ${settings?.fontSize === 'small' ? '14px' : settings?.fontSize === 'large' ? '18px' : '16px'};
    }
    .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .name { font-size: 2.5em; font-weight: bold; color: ${colorScheme.primary}; margin-bottom: 10px; }
    .contact { font-size: 1.1em; color: #666; }
    .section { margin-bottom: 30px; }
    .section-title { 
      font-size: 1.4em; 
      font-weight: bold; 
      color: ${colorScheme.primary}; 
      border-bottom: 2px solid ${colorScheme.primary}; 
      padding-bottom: 5px; 
      margin-bottom: 15px; 
    }
    .experience-item, .education-item, .project-item { margin-bottom: 20px; }
    .item-title { font-weight: bold; font-size: 1.1em; }
    .item-company { color: ${colorScheme.secondary}; font-weight: 500; }
    .item-date { color: #666; font-size: 0.9em; }
    .item-description { margin-top: 8px; }
    .skills { display: flex; flex-wrap: wrap; gap: 10px; }
    .skill { 
      background: ${colorScheme.primary}20; 
      color: ${colorScheme.primary}; 
      padding: 5px 12px; 
      border-radius: 20px; 
      font-size: 0.9em; 
    }
    ul { margin-left: 20px; }
    li { margin-bottom: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1 class="name">${resumeData.personalInfo?.fullName || 'Your Name'}</h1>
      <div class="contact">
        ${resumeData.personalInfo?.email || ''} | 
        ${resumeData.personalInfo?.phone || ''} | 
        ${resumeData.personalInfo?.location || ''}
      </div>
    </header>

    ${resumeData.personalInfo?.summary ? `
    <section class="section">
      <h2 class="section-title">Professional Summary</h2>
      <p>${resumeData.personalInfo.summary}</p>
    </section>
    ` : ''}

    ${resumeData.experience?.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Experience</h2>
      ${resumeData.experience.map((exp: any) => `
        <div class="experience-item">
          <div class="item-title">${exp.position || ''}</div>
          <div class="item-company">${exp.company || ''}</div>
          <div class="item-date">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
          <div class="item-description">${exp.description || ''}</div>
        </div>
      `).join('')}
    </section>
    ` : ''}

    ${resumeData.education?.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Education</h2>
      ${resumeData.education.map((edu: any) => `
        <div class="education-item">
          <div class="item-title">${edu.degree || ''}</div>
          <div class="item-company">${edu.school || ''}</div>
          <div class="item-date">${edu.startDate || ''} - ${edu.endDate || ''}</div>
        </div>
      `).join('')}
    </section>
    ` : ''}

    ${resumeData.skills?.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Skills</h2>
      <div class="skills">
        ${resumeData.skills.map((skill: string) => `<span class="skill">${skill}</span>`).join('')}
      </div>
    </section>
    ` : ''}

    ${resumeData.projects?.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Projects</h2>
      ${resumeData.projects.map((project: any) => `
        <div class="project-item">
          <div class="item-title">${project.title || ''}</div>
          <div class="item-description">${project.description || ''}</div>
        </div>
      `).join('')}
    </section>
    ` : ''}

    ${resumeData.certifications?.length > 0 ? `
    <section class="section">
      <h2 class="section-title">Certifications</h2>
      ${resumeData.certifications.map((cert: any) => `
        <div class="project-item">
          <div class="item-title">${cert.name || ''}</div>
          <div class="item-company">${cert.issuer || ''} - ${cert.date || ''}</div>
        </div>
      `).join('')}
    </section>
    ` : ''}
  </div>
</body>
</html>`;
}

async function generatePDFResume(resumeData: any, template: any, settings: any): Promise<string> {
  // For now, return HTML that can be converted to PDF on frontend
  return await generateHTMLResume(resumeData, template, settings);
}

async function generateDOCXResume(resumeData: any, template: any, settings: any): Promise<string> {
  // For now, return HTML that can be converted to DOCX on frontend
  return await generateHTMLResume(resumeData, template, settings);
}