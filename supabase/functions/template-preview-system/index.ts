import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template preview with responsive design testing
function generateResponsivePreview(templateContent: string, deviceType: string = 'desktop'): string {
  const deviceConfigs = {
    desktop: { width: '800px', containerClass: 'desktop-preview' },
    tablet: { width: '600px', containerClass: 'tablet-preview' },
    mobile: { width: '320px', containerClass: 'mobile-preview' }
  };

  const config = deviceConfigs[deviceType as keyof typeof deviceConfigs] || deviceConfigs.desktop;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Template Preview - ${deviceType}</title>
      <style>
        body { 
          margin: 0; 
          padding: 20px; 
          font-family: Arial, sans-serif; 
          background-color: #f5f5f5; 
        }
        .preview-container {
          max-width: ${config.width};
          margin: 0 auto;
          background: white;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        .preview-header {
          background: #2563eb;
          color: white;
          padding: 10px 15px;
          font-size: 14px;
          font-weight: bold;
        }
        .preview-content {
          padding: 0;
        }
        .${config.containerClass} {
          width: 100%;
          max-width: ${config.width};
        }
        /* Override any template styles that might break preview */
        .preview-content table {
          max-width: 100% !important;
        }
        .preview-content img {
          max-width: 100% !important;
          height: auto !important;
        }
      </style>
    </head>
    <body>
      <div class="preview-container">
        <div class="preview-header">
          📧 Email Template Preview (${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)})
        </div>
        <div class="preview-content ${config.containerClass}">
          ${templateContent}
        </div>
      </div>
    </body>
    </html>
  `;
}

// Advanced template analytics
function analyzeTemplatePerformance(templateContent: string): Record<string, any> {
  const analysis = {
    email_client_compatibility: {
      outlook: 0,
      gmail: 0,
      apple_mail: 0,
      mobile_clients: 0
    },
    accessibility_score: 0,
    loading_performance: {
      estimated_size: new Blob([templateContent]).size,
      image_count: (templateContent.match(/<img[^>]*>/gi) || []).length,
      external_resources: (templateContent.match(/src\s*=\s*["']https?:\/\/[^"']+["']/gi) || []).length
    },
    seo_elements: {
      has_title: /<title[^>]*>/i.test(templateContent),
      has_meta_description: /<meta[^>]*name\s*=\s*["']description["'][^>]*>/i.test(templateContent),
      heading_structure: {
        h1: (templateContent.match(/<h1[^>]*>/gi) || []).length,
        h2: (templateContent.match(/<h2[^>]*>/gi) || []).length,
        h3: (templateContent.match(/<h3[^>]*>/gi) || []).length
      }
    }
  };

  // Outlook compatibility checks
  if (templateContent.includes('<table')) analysis.email_client_compatibility.outlook += 30;
  if (!templateContent.includes('float:')) analysis.email_client_compatibility.outlook += 20;
  if (!templateContent.includes('position:')) analysis.email_client_compatibility.outlook += 20;
  if (templateContent.includes('mso-')) analysis.email_client_compatibility.outlook += 30;

  // Gmail compatibility 
  if (templateContent.includes('class=')) analysis.email_client_compatibility.gmail += 25;
  if (!templateContent.includes('<style')) analysis.email_client_compatibility.gmail += 25;
  if (templateContent.includes('table')) analysis.email_client_compatibility.gmail += 25;
  if (templateContent.includes('td')) analysis.email_client_compatibility.gmail += 25;

  // Apple Mail compatibility
  if (templateContent.includes('webkit')) analysis.email_client_compatibility.apple_mail += 30;
  if (templateContent.includes('media query')) analysis.email_client_compatibility.apple_mail += 40;
  if (templateContent.includes('responsive')) analysis.email_client_compatibility.apple_mail += 30;

  // Mobile compatibility
  if (templateContent.includes('viewport')) analysis.email_client_compatibility.mobile_clients += 30;
  if (templateContent.includes('@media')) analysis.email_client_compatibility.mobile_clients += 40;
  if (templateContent.includes('max-width')) analysis.email_client_compatibility.mobile_clients += 30;

  // Accessibility scoring
  let accessibilityScore = 0;
  if (templateContent.includes('alt=')) accessibilityScore += 25;
  if (templateContent.includes('role=')) accessibilityScore += 15;
  if (templateContent.includes('aria-')) accessibilityScore += 20;
  if (!templateContent.includes('color:red') && !templateContent.includes('color:#ff0000')) accessibilityScore += 15;
  if (templateContent.includes('font-size')) accessibilityScore += 25;
  
  analysis.accessibility_score = accessibilityScore;

  return analysis;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, template_content, device_type, template_id, sample_data } = body;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (action) {
      case 'responsive_preview': {
        if (!template_content) {
          throw new Error('template_content is required');
        }

        // Generate sample data if not provided
        const defaultSampleData = {
          candidate_name: 'Alex Johnson',
          user_name: 'Alex Johnson',
          job_title: 'Senior Developer',
          company_name: 'Innovation Labs',
          platform_name: 'TalentXcel',
          support_email: 'support@talentxcel.in',
          current_year: new Date().getFullYear().toString(),
          current_date: new Date().toLocaleDateString(),
          ...sample_data
        };

        // Replace placeholders
        let processedContent = template_content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          return defaultSampleData[key] !== undefined ? String(defaultSampleData[key]) : `[${key}]`;
        });

        const previewHtml = generateResponsivePreview(processedContent, device_type);
        const analysis = analyzeTemplatePerformance(processedContent);

        return new Response(JSON.stringify({
          success: true,
          preview_html: previewHtml,
          device_type: device_type || 'desktop',
          performance_analysis: analysis,
          message: `Responsive preview generated for ${device_type || 'desktop'}`
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'multi_device_preview': {
        if (!template_content) {
          throw new Error('template_content is required');
        }

        const devices = ['desktop', 'tablet', 'mobile'];
        const previews: Record<string, string> = {};

        // Generate sample data
        const defaultSampleData = {
          candidate_name: 'Alex Johnson',
          user_name: 'Alex Johnson',
          job_title: 'Senior Developer',
          company_name: 'Innovation Labs',
          platform_name: 'TalentXcel',
          support_email: 'support@talentxcel.in',
          current_year: new Date().getFullYear().toString(),
          current_date: new Date().toLocaleDateString(),
          ...sample_data
        };

        // Replace placeholders
        let processedContent = template_content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          return defaultSampleData[key] !== undefined ? String(defaultSampleData[key]) : `[${key}]`;
        });

        // Generate previews for all devices
        for (const device of devices) {
          previews[device] = generateResponsivePreview(processedContent, device);
        }

        const analysis = analyzeTemplatePerformance(processedContent);

        return new Response(JSON.stringify({
          success: true,
          multi_device_previews: previews,
          performance_analysis: analysis,
          compatibility_scores: analysis.email_client_compatibility,
          message: 'Multi-device previews generated successfully'
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'template_analytics': {
        if (!template_id && !template_content) {
          throw new Error('Either template_id or template_content is required');
        }

        let content = template_content;
        
        if (template_id && !content) {
          const { data: template } = await supabase
            .from('email_templates')
            .select('html_template, content')
            .eq('id', template_id)
            .single();
          
          content = template?.html_template || template?.content;
        }

        if (!content) {
          throw new Error('No template content found');
        }

        const analysis = analyzeTemplatePerformance(content);

        return new Response(JSON.stringify({
          success: true,
          template_analytics: analysis,
          recommendations: [
            analysis.email_client_compatibility.outlook < 50 ? 'Consider using table-based layout for better Outlook support' : null,
            analysis.accessibility_score < 60 ? 'Add more accessibility features (alt text, ARIA labels, proper contrast)' : null,
            analysis.loading_performance.image_count > 10 ? 'Consider reducing the number of images for faster loading' : null,
            analysis.loading_performance.estimated_size > 100000 ? 'Template size is large, consider optimization' : null
          ].filter(Boolean),
          message: 'Template analytics completed'
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      case 'template_comparison': {
        const { template_a, template_b } = body;
        
        if (!template_a || !template_b) {
          throw new Error('Both template_a and template_b content are required');
        }

        const analysisA = analyzeTemplatePerformance(template_a);
        const analysisB = analyzeTemplatePerformance(template_b);

        const comparison = {
          outlook_compatibility: {
            template_a: analysisA.email_client_compatibility.outlook,
            template_b: analysisB.email_client_compatibility.outlook,
            winner: analysisA.email_client_compatibility.outlook > analysisB.email_client_compatibility.outlook ? 'A' : 'B'
          },
          accessibility: {
            template_a: analysisA.accessibility_score,
            template_b: analysisB.accessibility_score,
            winner: analysisA.accessibility_score > analysisB.accessibility_score ? 'A' : 'B'
          },
          performance: {
            template_a: analysisA.loading_performance.estimated_size,
            template_b: analysisB.loading_performance.estimated_size,
            winner: analysisA.loading_performance.estimated_size < analysisB.loading_performance.estimated_size ? 'A' : 'B'
          }
        };

        return new Response(JSON.stringify({
          success: true,
          comparison,
          detailed_analysis: { template_a: analysisA, template_b: analysisB },
          message: 'Template comparison completed'
        }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      default:
        throw new Error('Invalid action. Available: responsive_preview, multi_device_preview, template_analytics, template_comparison');
    }

  } catch (error: any) {
    console.error("Error in template-preview-system function:", error);
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