import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template fallback hierarchy
const TEMPLATE_FALLBACK_HIERARCHY = [
  'primary_template',
  'base_template', 
  'system_template'
];

// Enhanced template validation with rich HTML features
function validateRichHTMLTemplate(templateContent: string, templateName: string): { valid: boolean; errors: string[]; warnings: string[]; score: number } {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 0;

  if (!templateContent) {
    errors.push('Template content is empty');
    return { valid: false, errors, warnings, score: 0 };
  }

  // Basic HTML validation (required)
  if (!templateContent.includes('<') || !templateContent.includes('>')) {
    errors.push('Template must contain valid HTML tags');
  } else {
    score += 20;
  }

  // Check for proper HTML structure
  const structuralTags = ['<html', '<body', '<div', '<table', '<p>', '<span', '<h1', '<h2', '<h3'];
  const hasStructuralTags = structuralTags.some(tag => templateContent.includes(tag));
  
  if (!hasStructuralTags) {
    errors.push('Template must contain structural HTML tags (html, body, div, table, p, etc.)');
  } else {
    score += 25;
  }

  // Rich HTML features validation
  const richFeatures = {
    'CSS Styles': /<style[^>]*>|style\s*=/i,
    'Images': /<img[^>]+>/i,
    'Links': /<a[^>]+>/i,
    'Tables': /<table[^>]*>/i,
    'Lists': /<ul[^>]*>|<ol[^>]*>/i,
    'Headers': /<h[1-6][^>]*>/i,
    'Responsive Meta': /<meta[^>]*viewport[^>]*>/i,
    'CSS Classes': /class\s*=\s*["'][^"']+["']/i
  };

  let richFeatureCount = 0;
  for (const [feature, pattern] of Object.entries(richFeatures)) {
    if (pattern.test(templateContent)) {
      richFeatureCount++;
      score += 5;
    } else {
      warnings.push(`Missing ${feature} for richer email experience`);
    }
  }

  // Email best practices validation
  if (!templateContent.includes('DOCTYPE html')) {
    warnings.push('Missing DOCTYPE html declaration for better email client compatibility');
  } else {
    score += 5;
  }

  if (!templateContent.includes('table')) {
    warnings.push('Consider using table-based layout for better email client support');
  }

  if (!templateContent.includes('alt=')) {
    warnings.push('Add alt attributes to images for accessibility');
  }

  // Placeholder validation
  const placeholderPattern = /\{\{[^}]+\}\}/g;
  const placeholders = templateContent.match(placeholderPattern) || [];
  if (placeholders.length > 0) {
    score += 10;
    
    // Check for malformed placeholders
    const malformedPlaceholders = templateContent.match(/\{[^{]|[^}]\}/g);
    if (malformedPlaceholders) {
      errors.push('Template contains malformed placeholders. Use {{variable_name}} format.');
    }
  } else {
    warnings.push('No placeholders found - consider adding dynamic content');
  }

  // Security validation
  const securityPatterns = [
    { pattern: /<script[^>]*>/i, message: 'Script tags are not allowed in email templates' },
    { pattern: /javascript:/i, message: 'JavaScript URLs are not allowed' },
    { pattern: /vbscript:/i, message: 'VBScript is not allowed' },
    { pattern: /onload=|onerror=|onclick=/i, message: 'Event handlers are not allowed' }
  ];

  for (const { pattern, message } of securityPatterns) {
    if (pattern.test(templateContent)) {
      errors.push(message);
    }
  }

  // Calculate final score (0-100)
  score = Math.min(score, 100);
  
  return { 
    valid: errors.length === 0, 
    errors, 
    warnings, 
    score 
  };
}

// Template preview generator
function generateTemplatePreview(templateContent: string, sampleData: Record<string, any> = {}): string {
  const defaultSampleData = {
    candidate_name: 'John Doe',
    user_name: 'John Doe',
    job_title: 'Software Engineer',
    company_name: 'TechCorp Inc.',
    platform_name: 'TalentXcel',
    support_email: 'support@talentxcel.in',
    current_year: new Date().getFullYear().toString(),
    current_date: new Date().toLocaleDateString(),
    application_link: 'https://talentxcel.in/applications/123',
    ...sampleData
  };

  // Replace placeholders with sample data
  let preview = templateContent.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return defaultSampleData[key] !== undefined ? String(defaultSampleData[key]) : `[${key}]`;
  });

  // Handle conditional sections
  preview = preview.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, key, content) => {
    return defaultSampleData[key] ? content : '';
  });

  // Handle loops
  preview = preview.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, key, content) => {
    const arr = defaultSampleData[key];
    if (Array.isArray(arr)) {
      return arr.map(item => content.replace(/\{\{this\}\}/g, String(item))).join('');
    }
    return '';
  });

  return preview;
}

// Template fallback system
async function getTemplateWithFallback(supabase: any, eventName: string, templateType: string = 'primary') {
  const fallbackOrder = ['primary_template', 'base_template', 'system_template'];
  
  for (const fallbackType of fallbackOrder) {
    try {
      // Try event mapping first
      const { data: mapping } = await supabase
        .from('event_email_mapping')
        .select('template_name')
        .eq('event_name', eventName)
        .eq('is_active', true)
        .single();

      if (mapping) {
        const { data: template } = await supabase
          .from('email_templates')
          .select('*')
          .eq('name', mapping.template_name)
          .eq('is_active', true)
          .single();

        if (template) {
          return { template, fallbackUsed: fallbackType };
        }
      }

      // Fallback to direct template lookup
      const { data: fallbackTemplate } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_type', `${eventName}_${fallbackType}`)
        .eq('is_active', true)
        .single();

      if (fallbackTemplate) {
        return { template: fallbackTemplate, fallbackUsed: fallbackType };
      }

    } catch (error) {
      console.log(`Fallback ${fallbackType} failed for ${eventName}:`, error.message);
    }
  }

  // Final system fallback
  const { data: systemTemplate } = await supabase
    .from('email_templates')
    .select('*')
    .eq('name', 'System Default Template')
    .eq('is_active', true)
    .single();

  return { template: systemTemplate, fallbackUsed: 'system_default' };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, template_content, template_name, event_name, sample_data, template_id } = body;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (action) {
      case 'validate_rich': {
        if (!template_content || !template_name) {
          throw new Error('template_content and template_name are required');
        }

        const validation = validateRichHTMLTemplate(template_content, template_name);
        
        return new Response(JSON.stringify({
          success: validation.valid,
          template_name,
          validation_results: validation,
          quality_score: validation.score,
          message: validation.valid ? 
            `Template is valid HTML with quality score: ${validation.score}/100` : 
            'Template validation failed'
        }), {
          status: validation.valid ? 200 : 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'preview': {
        if (!template_content) {
          throw new Error('template_content is required for preview');
        }

        const preview = generateTemplatePreview(template_content, sample_data || {});
        const validation = validateRichHTMLTemplate(template_content, template_name || 'preview');
        
        return new Response(JSON.stringify({
          success: true,
          preview_html: preview,
          validation_results: validation,
          message: 'Template preview generated successfully'
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'create_version': {
        if (!template_id || !template_content) {
          throw new Error('template_id and template_content are required');
        }

        // Get current template
        const { data: currentTemplate } = await supabase
          .from('email_templates')
          .select('*')
          .eq('id', template_id)
          .single();

        if (!currentTemplate) {
          throw new Error('Template not found');
        }

        // Create version entry
        const { data: version, error: versionError } = await supabase
          .from('email_template_versions')
          .insert({
            template_id,
            version_number: (currentTemplate.current_version || 0) + 1,
            content: template_content,
            subject: body.subject || currentTemplate.subject,
            created_by: body.created_by,
            change_notes: body.change_notes || 'Template update'
          })
          .select()
          .single();

        if (versionError) throw versionError;

        // Update template with new version
        const { error: updateError } = await supabase
          .from('email_templates')
          .update({
            html_template: template_content,
            current_version: version.version_number,
            updated_at: new Date().toISOString()
          })
          .eq('id', template_id);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({
          success: true,
          version,
          message: `Template version ${version.version_number} created successfully`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'get_template_with_fallback': {
        if (!event_name) {
          throw new Error('event_name is required');
        }

        const result = await getTemplateWithFallback(supabase, event_name);
        
        return new Response(JSON.stringify({
          success: true,
          template: result.template,
          fallback_used: result.fallbackUsed,
          message: `Template retrieved using ${result.fallbackUsed} fallback`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'audit_template_system': {
        // Comprehensive audit of template system
        const { data: templates } = await supabase
          .from('email_templates')
          .select('*')
          .eq('is_active', true);

        const auditResults = templates?.map(template => {
          const content = template.html_template || template.content || '';
          const validation = validateRichHTMLTemplate(content, template.name);
          
          return {
            id: template.id,
            name: template.name,
            quality_score: validation.score,
            valid: validation.valid,
            errors: validation.errors,
            warnings: validation.warnings,
            has_versions: template.current_version > 1,
            created_at: template.created_at
          };
        }) || [];

        const summary = {
          total_templates: auditResults.length,
          valid_templates: auditResults.filter(t => t.valid).length,
          high_quality: auditResults.filter(t => t.quality_score >= 80).length,
          needs_improvement: auditResults.filter(t => t.quality_score < 60).length,
          average_quality: Math.round(auditResults.reduce((sum, t) => sum + t.quality_score, 0) / auditResults.length)
        };

        return new Response(JSON.stringify({
          success: true,
          audit_summary: summary,
          template_details: auditResults,
          message: `Audited ${auditResults.length} templates with average quality score of ${summary.average_quality}/100`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      default:
        throw new Error('Invalid action. Available: validate_rich, preview, create_version, get_template_with_fallback, audit_template_system');
    }

  } catch (error: any) {
    console.error("Error in enhanced-template-system function:", error);
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