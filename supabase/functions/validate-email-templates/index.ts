import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ValidationResult {
  template_id: string;
  template_name: string;
  is_valid: boolean;
  issues: string[];
  content_type: 'html' | 'plain_text' | 'missing';
}

function validateHTMLTemplate(content: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!content) {
    issues.push('Template content is empty');
    return { isValid: false, issues };
  }

  // Check if content contains HTML tags
  if (!content.includes('<') || !content.includes('>')) {
    issues.push('Template does not contain HTML tags - plain text templates are not allowed');
    return { isValid: false, issues };
  }

  // Check for basic HTML structure
  if (!content.includes('<html') && !content.includes('<body') && !content.includes('<div')) {
    issues.push('Template lacks proper HTML structure (should contain html, body, or div tags)');
  }

  // Check for common email compatibility issues
  if (content.includes('<style>') && !content.includes('style=')) {
    issues.push('Warning: Inline styles are recommended for better email client compatibility');
  }

  // Check for placeholder syntax
  const placeholderMatches = content.match(/\{\{[\w_]+\}\}/g);
  if (!placeholderMatches || placeholderMatches.length === 0) {
    issues.push('Warning: No placeholders found - template may not be personalized');
  }

  return { 
    isValid: issues.filter(issue => !issue.startsWith('Warning:')).length === 0, 
    issues 
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting email template validation...');

    // Get all email templates
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('id, name, template_type, subject, html_template, content, is_active');

    if (error) {
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }

    const results: ValidationResult[] = [];
    let validCount = 0;
    let invalidCount = 0;

    for (const template of templates || []) {
      const templateContent = template.html_template || template.content;
      const templateName = template.name || template.template_type || 'Unknown';
      
      let contentType: 'html' | 'plain_text' | 'missing' = 'missing';
      
      if (templateContent) {
        contentType = (templateContent.includes('<') && templateContent.includes('>')) ? 'html' : 'plain_text';
      }

      const validation = validateHTMLTemplate(templateContent);
      
      const result: ValidationResult = {
        template_id: template.id,
        template_name: templateName,
        is_valid: validation.isValid && contentType === 'html',
        issues: validation.issues,
        content_type: contentType
      };

      if (result.is_valid) {
        validCount++;
      } else {
        invalidCount++;
      }

      results.push(result);
    }

    // Mark invalid templates as inactive if requested
    const url = new URL(req.url);
    const disableInvalid = url.searchParams.get('disable_invalid') === 'true';
    
    if (disableInvalid) {
      const invalidTemplateIds = results
        .filter(r => !r.is_valid)
        .map(r => r.template_id);

      if (invalidTemplateIds.length > 0) {
        const { error: updateError } = await supabase
          .from('email_templates')
          .update({ is_active: false })
          .in('id', invalidTemplateIds);

        if (updateError) {
          console.error('Failed to disable invalid templates:', updateError);
        } else {
          console.log(`✅ Disabled ${invalidTemplateIds.length} invalid templates`);
        }
      }
    }

    console.log(`📊 Validation complete: ${validCount} valid, ${invalidCount} invalid templates`);

    return new Response(JSON.stringify({
      success: true,
      summary: {
        total_templates: results.length,
        valid_templates: validCount,
        invalid_templates: invalidCount,
        disabled_invalid: disableInvalid ? invalidCount : 0
      },
      results: results,
      message: `Template validation complete. ${validCount}/${results.length} templates are valid HTML.`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("❌ Template validation error:", error);
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