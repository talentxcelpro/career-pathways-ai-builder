import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template quality standards
const QUALITY_STANDARDS = {
  MINIMUM_SCORE: 60,
  HTML_REQUIRED_TAGS: ['<html', '<body', '<div', '<table', '<p>', '<span', '<h1', '<h2', '<h3'],
  EMAIL_BEST_PRACTICES: [
    'table-based layout',
    'inline styles',
    'alt attributes for images',
    'proper DOCTYPE',
    'responsive design',
    'accessibility features'
  ],
  SECURITY_PATTERNS: [
    /<script[^>]*>/i,
    /javascript:/i,
    /vbscript:/i,
    /onload=|onerror=|onclick=/i,
    /<iframe[^>]*>/i,
    /<object[^>]*>/i,
    /<embed[^>]*>/i
  ]
};

// Advanced template linting system
function lintTemplate(templateContent: string, templateName: string): {
  score: number;
  grade: string;
  issues: Array<{type: string; severity: string; message: string; line?: number}>;
  recommendations: string[];
} {
  const issues: Array<{type: string; severity: string; message: string; line?: number}> = [];
  const recommendations: string[] = [];
  let score = 100;

  if (!templateContent) {
    return {
      score: 0,
      grade: 'F',
      issues: [{ type: 'structure', severity: 'critical', message: 'Template is empty' }],
      recommendations: ['Add HTML content to the template']
    };
  }

  const lines = templateContent.split('\n');

  // Critical Issues (Major score deductions)
  
  // 1. HTML Structure Requirements
  if (!templateContent.includes('<') || !templateContent.includes('>')) {
    issues.push({
      type: 'structure',
      severity: 'critical',
      message: 'Template must contain HTML tags'
    });
    score -= 40;
  }

  const hasStructuralTags = QUALITY_STANDARDS.HTML_REQUIRED_TAGS.some(tag => 
    templateContent.includes(tag)
  );
  if (!hasStructuralTags) {
    issues.push({
      type: 'structure',
      severity: 'critical',
      message: 'Template lacks proper HTML structure (missing html, body, div, table, or paragraph tags)'
    });
    score -= 30;
  }

  // 2. Security Validation
  for (const pattern of QUALITY_STANDARDS.SECURITY_PATTERNS) {
    if (pattern.test(templateContent)) {
      issues.push({
        type: 'security',
        severity: 'critical',
        message: 'Template contains potentially dangerous content (scripts, iframes, objects)'
      });
      score -= 50;
      break;
    }
  }

  // 3. Email Client Compatibility
  if (!templateContent.includes('<table')) {
    issues.push({
      type: 'compatibility',
      severity: 'major',
      message: 'Missing table-based layout - may not render correctly in Outlook'
    });
    score -= 15;
    recommendations.push('Use table-based layout for better email client compatibility');
  }

  if (!templateContent.includes('style=')) {
    issues.push({
      type: 'compatibility',
      severity: 'major',
      message: 'Missing inline styles - external CSS may be stripped by email clients'
    });
    score -= 10;
    recommendations.push('Use inline styles instead of external CSS');
  }

  // 4. DOCTYPE and Meta Tags
  if (!templateContent.includes('<!DOCTYPE html>')) {
    issues.push({
      type: 'structure',
      severity: 'minor',
      message: 'Missing DOCTYPE declaration'
    });
    score -= 5;
    recommendations.push('Add DOCTYPE html declaration for better rendering');
  }

  if (!templateContent.includes('viewport')) {
    issues.push({
      type: 'mobile',
      severity: 'minor',
      message: 'Missing viewport meta tag for mobile compatibility'
    });
    score -= 5;
    recommendations.push('Add viewport meta tag for mobile responsiveness');
  }

  // 5. Accessibility
  if (templateContent.includes('<img') && !templateContent.includes('alt=')) {
    issues.push({
      type: 'accessibility',
      severity: 'major',
      message: 'Images missing alt attributes'
    });
    score -= 10;
    recommendations.push('Add alt attributes to all images for accessibility');
  }

  // 6. Placeholder Validation
  const placeholderPattern = /\{\{[^}]+\}\}/g;
  const placeholders = templateContent.match(placeholderPattern) || [];
  const malformedPlaceholders = templateContent.match(/\{[^{]|[^}]\}/g);
  
  if (malformedPlaceholders) {
    issues.push({
      type: 'templating',
      severity: 'major',
      message: 'Malformed placeholders detected'
    });
    score -= 15;
    recommendations.push('Fix placeholder syntax to use {{variable_name}} format');
  }

  if (placeholders.length === 0) {
    issues.push({
      type: 'templating',
      severity: 'minor',
      message: 'No dynamic placeholders found'
    });
    score -= 5;
    recommendations.push('Consider adding dynamic content placeholders');
  }

  // 7. Content Quality
  if (templateContent.length < 100) {
    issues.push({
      type: 'content',
      severity: 'minor',
      message: 'Template content is very short'
    });
    score -= 5;
  }

  const wordCount = templateContent.split(/\s+/).length;
  if (wordCount < 10) {
    issues.push({
      type: 'content',
      severity: 'minor',
      message: 'Template has very little text content'
    });
    score -= 5;
  }

  // 8. Performance Issues
  const templateSize = new Blob([templateContent]).size;
  if (templateSize > 100000) { // 100KB
    issues.push({
      type: 'performance',
      severity: 'minor',
      message: 'Template size is large (>100KB)'
    });
    score -= 5;
    recommendations.push('Optimize template size for faster loading');
  }

  const imageCount = (templateContent.match(/<img[^>]*>/gi) || []).length;
  if (imageCount > 10) {
    issues.push({
      type: 'performance',
      severity: 'minor',
      message: 'Too many images may slow loading'
    });
    score -= 5;
    recommendations.push('Reduce number of images or optimize file sizes');
  }

  // Line-specific issues
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    
    // Check for hardcoded colors without fallbacks
    if (line.includes('color:') && !line.includes('background-color:')) {
      if (line.includes('color:#ffffff') || line.includes('color:white')) {
        issues.push({
          type: 'accessibility',
          severity: 'minor',
          message: 'White text without background color specified',
          line: lineNumber
        });
      }
    }
    
    // Check for missing closing tags
    const openTags = line.match(/<(\w+)[^>]*>/g) || [];
    const closeTags = line.match(/<\/(\w+)>/g) || [];
    if (openTags.length > closeTags.length && !line.includes('/>')) {
      // This is a basic check - more sophisticated parsing would be needed for accuracy
      const suspiciousTags = ['div', 'span', 'p', 'td', 'tr', 'table'];
      for (const tag of suspiciousTags) {
        if (line.includes(`<${tag}`) && !line.includes(`</${tag}>`) && !line.includes('/>')) {
          issues.push({
            type: 'structure',
            severity: 'minor',
            message: `Potential unclosed ${tag} tag`,
            line: lineNumber
          });
        }
      }
    }
  });

  // Calculate grade
  score = Math.max(0, Math.min(100, score));
  let grade: string;
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  // Add general recommendations based on score
  if (score < 70) {
    recommendations.push('Template needs significant improvements to meet quality standards');
  }
  if (score < 50) {
    recommendations.push('Consider redesigning template from scratch using modern email best practices');
  }

  return { score, grade, issues, recommendations };
}

// Convert plain text to HTML template
function convertPlainTextToHTML(plainText: string, templateName: string): string {
  if (!plainText) return '';

  // Detect if it's already HTML
  if (plainText.includes('<html') || plainText.includes('<body') || plainText.includes('<div')) {
    return plainText;
  }

  // Convert plain text to rich HTML template
  const sanitizedText = plainText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Convert line breaks to HTML
  const htmlContent = sanitizedText
    .split('\n\n')
    .map(paragraph => `<p style="margin: 16px 0; line-height: 1.6;">${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${templateName}</title>
    <style>
        /* Email client resets */
        body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 30px;">
                            <!-- Header -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding-bottom: 30px; border-bottom: 2px solid #e5e7eb;">
                                        <h1 style="margin: 0; color: #1f2937; font-size: 28px; font-weight: bold;">{{platform_name}}</h1>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Content -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 30px 0;">
                                        <div style="color: #374151; font-size: 16px; line-height: 1.6;">
                                            ${htmlContent}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Footer -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="text-align: center; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                                        <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                            © {{current_year}} {{platform_name}}. All rights reserved.<br>
                                            <a href="mailto:{{support_email}}" style="color: #3b82f6; text-decoration: none;">{{support_email}}</a>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, template_id, template_content, template_name, batch_convert, quality_threshold } = body;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (action) {
      case 'audit_all_templates': {
        console.log('Starting comprehensive template audit...');
        
        const { data: templates, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;

        const auditResults = [];
        let totalTemplates = 0;
        let passedTemplates = 0;
        let failedTemplates = 0;
        let needsConversion = 0;

        for (const template of templates || []) {
          const content = template.html_template || template.content || '';
          const lintResult = lintTemplate(content, template.name);
          
          const isPlainText = !content.includes('<') || !content.includes('>');
          const meetsStandards = lintResult.score >= (quality_threshold || QUALITY_STANDARDS.MINIMUM_SCORE);
          
          const result = {
            id: template.id,
            name: template.name,
            template_type: template.template_type,
            is_plain_text: isPlainText,
            quality_score: lintResult.score,
            grade: lintResult.grade,
            meets_standards: meetsStandards,
            issues: lintResult.issues,
            recommendations: lintResult.recommendations,
            content_size: content.length,
            created_at: template.created_at,
            last_updated: template.updated_at,
            status: meetsStandards ? 'approved' : 'needs_review'
          };

          auditResults.push(result);
          totalTemplates++;

          if (meetsStandards) passedTemplates++;
          else failedTemplates++;

          if (isPlainText) needsConversion++;
        }

        const summary = {
          total_templates: totalTemplates,
          passed_quality_check: passedTemplates,
          failed_quality_check: failedTemplates,
          needs_conversion: needsConversion,
          pass_rate: Math.round((passedTemplates / totalTemplates) * 100),
          average_score: Math.round(auditResults.reduce((sum, r) => sum + r.quality_score, 0) / totalTemplates),
          critical_issues: auditResults.reduce((sum, r) => sum + r.issues.filter(i => i.severity === 'critical').length, 0),
          timestamp: new Date().toISOString()
        };

        return new Response(JSON.stringify({
          success: true,
          audit_summary: summary,
          template_results: auditResults,
          quality_threshold: quality_threshold || QUALITY_STANDARDS.MINIMUM_SCORE,
          message: `Audited ${totalTemplates} templates. ${passedTemplates} passed, ${failedTemplates} need improvement.`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'lint_template': {
        if (!template_content) {
          throw new Error('template_content is required for linting');
        }

        const lintResult = lintTemplate(template_content, template_name || 'untitled');
        const meetsStandards = lintResult.score >= (quality_threshold || QUALITY_STANDARDS.MINIMUM_SCORE);

        return new Response(JSON.stringify({
          success: true,
          lint_results: lintResult,
          meets_standards: meetsStandards,
          quality_threshold: quality_threshold || QUALITY_STANDARDS.MINIMUM_SCORE,
          message: `Template linting complete. Score: ${lintResult.score}/100 (${lintResult.grade})`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'convert_to_html': {
        if (!template_content) {
          throw new Error('template_content is required for conversion');
        }

        const convertedHTML = convertPlainTextToHTML(template_content, template_name || 'Converted Template');
        const lintResult = lintTemplate(convertedHTML, template_name || 'Converted Template');

        return new Response(JSON.stringify({
          success: true,
          original_content: template_content,
          converted_html: convertedHTML,
          lint_results: lintResult,
          improvement: {
            was_plain_text: !template_content.includes('<'),
            new_quality_score: lintResult.score,
            structure_added: true
          },
          message: 'Plain text successfully converted to rich HTML template'
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'batch_convert_templates': {
        console.log('Starting batch conversion of plain text templates...');
        
        const { data: templates, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;

        const conversionResults = [];
        let converted = 0;
        let skipped = 0;
        let errors = 0;

        for (const template of templates || []) {
          try {
            const content = template.html_template || template.content || '';
            const isPlainText = !content.includes('<') || !content.includes('>');

            if (!isPlainText) {
              conversionResults.push({
                id: template.id,
                name: template.name,
                status: 'skipped',
                reason: 'Already HTML format'
              });
              skipped++;
              continue;
            }

            const convertedHTML = convertPlainTextToHTML(content, template.name);
            
            // Update template with converted HTML
            const { error: updateError } = await supabase
              .from('email_templates')
              .update({
                html_template: convertedHTML,
                content: null, // Clear old content field
                updated_at: new Date().toISOString()
              })
              .eq('id', template.id);

            if (updateError) {
              throw updateError;
            }

            const lintResult = lintTemplate(convertedHTML, template.name);
            
            conversionResults.push({
              id: template.id,
              name: template.name,
              status: 'converted',
              quality_score: lintResult.score,
              grade: lintResult.grade
            });
            converted++;

          } catch (conversionError) {
            conversionResults.push({
              id: template.id,
              name: template.name,
              status: 'error',
              error: conversionError.message
            });
            errors++;
          }
        }

        return new Response(JSON.stringify({
          success: true,
          conversion_summary: {
            total_processed: templates?.length || 0,
            converted,
            skipped,
            errors,
            conversion_rate: Math.round((converted / (templates?.length || 1)) * 100)
          },
          conversion_results: conversionResults,
          message: `Batch conversion complete. ${converted} templates converted to HTML.`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      default:
        throw new Error('Invalid action. Available: audit_all_templates, lint_template, convert_to_html, batch_convert_templates');
    }

  } catch (error: any) {
    console.error("Error in template-quality-control function:", error);
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