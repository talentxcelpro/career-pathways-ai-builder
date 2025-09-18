import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template validation middleware
function validateHTMLTemplate(templateContent: string, templateName: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!templateContent) {
    errors.push('Template content is empty');
    return { valid: false, errors };
  }

  // Check for basic HTML structure
  if (!templateContent.includes('<') || !templateContent.includes('>')) {
    errors.push('Template must contain valid HTML tags');
  }

  // Ensure it's not plain text
  const htmlTagPattern = /<[^>]+>/;
  if (!htmlTagPattern.test(templateContent)) {
    errors.push('Template appears to be plain text. HTML templates are required.');
  }

  // Check for proper HTML structure
  const hasStructuralTags = templateContent.includes('<html') || 
                           templateContent.includes('<body') || 
                           templateContent.includes('<div') ||
                           templateContent.includes('<table') ||
                           templateContent.includes('<p>');
  
  if (!hasStructuralTags) {
    errors.push('Template must contain structural HTML tags (html, body, div, table, p, etc.)');
  }

  // Check for dangerous content
  const dangerousPatterns = [
    /<script[^>]*>/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=/i,
    /onerror=/i
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(templateContent)) {
      errors.push('Template contains potentially dangerous content (scripts, javascript, etc.)');
      break;
    }
  }

  // Check for placeholder format
  const placeholderPattern = /\{\{[^}]+\}\}/;
  if (templateContent.includes('{{') && !placeholderPattern.test(templateContent)) {
    errors.push('Template contains malformed placeholders. Use {{variable_name}} format.');
  }

  return { valid: errors.length === 0, errors };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { template_content, template_name, action = "validate" } = await req.json();

    if (action === "validate") {
      // Single template validation
      if (!template_content || !template_name) {
        throw new Error('template_content and template_name are required for validation');
      }

      const validation = validateHTMLTemplate(template_content, template_name);
      
      return new Response(JSON.stringify({
        success: validation.valid,
        template_name,
        validation_results: validation,
        message: validation.valid ? 'Template is valid HTML' : 'Template validation failed'
      }), {
        status: validation.valid ? 200 : 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (action === "audit_all") {
      // Audit all templates in the database
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: templates, error } = await supabase
        .from('email_templates')
        .select('id, name, subject, html_template, content, is_active')
        .eq('is_active', true);

      if (error) {
        throw new Error(`Failed to fetch templates: ${error.message}`);
      }

      const auditResults = templates?.map(template => {
        const content = template.html_template || template.content;
        const validation = validateHTMLTemplate(content, template.name);
        
        return {
          id: template.id,
          name: template.name,
          subject: template.subject,
          valid: validation.valid,
          errors: validation.errors,
          content_preview: content ? content.substring(0, 100) + '...' : 'No content'
        };
      }) || [];

      const invalidTemplates = auditResults.filter(result => !result.valid);
      const validTemplates = auditResults.filter(result => result.valid);

      return new Response(JSON.stringify({
        success: true,
        audit_summary: {
          total_templates: auditResults.length,
          valid_templates: validTemplates.length,
          invalid_templates: invalidTemplates.length,
          validation_rate: Math.round((validTemplates.length / auditResults.length) * 100)
        },
        detailed_results: auditResults,
        invalid_templates: invalidTemplates,
        message: `Audited ${auditResults.length} templates. ${invalidTemplates.length} require attention.`
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    throw new Error('Invalid action. Use "validate" or "audit_all"');

  } catch (error: any) {
    console.error("Error in email-template-validator function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);