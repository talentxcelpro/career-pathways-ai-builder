import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ContentRequest {
  target_id: string;
  content_type: 'guest_post' | 'press_release' | 'email_pitch' | 'resource_page' | 'directory_listing';
  variables?: Record<string, any>;
  template_id?: string;
}

const generateContent = async (template: any, variables: Record<string, any>, target: any) => {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Replace template variables
  let subject = template.subject_template || '';
  let body = template.body_template || '';

  // Merge target data with custom variables
  const allVariables = {
    contact_name: target.contact_name || 'Team',
    domain: target.domain,
    website_url: target.website_url,
    from_email: 'outreach@talentxcel.in',
    from_name: 'TalentXcel Partnerships',
    ...variables
  };

  // Replace variables in templates
  for (const [key, value] of Object.entries(allVariables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, String(value));
    body = body.replace(regex, String(value));
  }

  console.log('Generating personalized content for:', target.domain);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert at writing personalized outreach emails for backlink building. 
            Your task is to enhance and personalize the provided email template to make it more compelling and relevant to the target website.
            
            Guidelines:
            - Keep the core message and structure
            - Make it sound natural and personalized
            - Add specific value propositions
            - Ensure professional but friendly tone
            - Keep it concise and actionable
            - Focus on mutual benefits
            
            Return the response as JSON with "subject" and "body" fields.`
          },
          {
            role: 'user',
            content: `Please enhance this email for ${target.domain}:
            
            Subject: ${subject}
            
            Body: ${body}
            
            Target website: ${target.website_url}
            Website niche: ${target.niche?.join(', ') || 'general'}
            
            Make it more personalized and compelling while maintaining professionalism.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No content generated from OpenAI');
    }

    const content = data.choices[0].message.content;
    console.log('OpenAI Response:', content);

    try {
      const result = JSON.parse(content);
      return {
        subject: result.subject || subject,
        body: result.body || body
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response, using template content');
      return { subject, body };
    }
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    // Return template content as fallback
    return { subject, body };
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { target_id, content_type, variables = {}, template_id }: ContentRequest = await req.json();
    
    console.log('Generating content for target:', target_id, 'type:', content_type);

    // Get target information
    const { data: target, error: targetError } = await supabase
      .from('backlink_targets')
      .select('*')
      .eq('id', target_id)
      .single();

    if (targetError || !target) {
      throw new Error('Target not found');
    }

    // Get template
    let template;
    if (template_id) {
      const { data: customTemplate } = await supabase
        .from('backlink_content_templates')
        .select('*')
        .eq('id', template_id)
        .single();
      template = customTemplate;
    }

    if (!template) {
      // Get default template for content type
      const { data: defaultTemplate } = await supabase
        .from('backlink_content_templates')
        .select('*')
        .eq('content_type', content_type)
        .eq('is_active', true)
        .order('usage_count', { ascending: false })
        .limit(1)
        .single();
      
      template = defaultTemplate;
    }

    if (!template) {
      throw new Error(`No template found for content type: ${content_type}`);
    }

    // Check cache first
    const cacheKey = `${target_id}-${content_type}-${JSON.stringify(variables)}`;
    const contentHash = btoa(cacheKey).slice(0, 32);

    const { data: cachedContent } = await supabase
      .from('backlink_ai_content_cache')
      .select('*')
      .eq('content_hash', contentHash)
      .gt('expires_at', new Date().toISOString())
      .single();

    let generatedContent;
    let fromCache = false;

    if (cachedContent) {
      console.log('Using cached content');
      generatedContent = {
        subject: cachedContent.subject,
        body: cachedContent.content
      };
      fromCache = true;

      // Update usage count
      await supabase
        .from('backlink_ai_content_cache')
        .update({ usage_count: cachedContent.usage_count + 1 })
        .eq('id', cachedContent.id);
    } else {
      console.log('Generating new content');
      generatedContent = await generateContent(template, variables, target);

      // Cache the generated content
      await supabase
        .from('backlink_ai_content_cache')
        .insert({
          content_hash: contentHash,
          target_id: target_id,
          content_type: content_type,
          subject: generatedContent.subject,
          content: generatedContent.body,
          variables_used: variables,
          ai_model: 'gpt-4o-mini',
          generation_cost: 0.001, // Estimated cost
          usage_count: 1
        });
    }

    // Update template usage
    await supabase
      .from('backlink_content_templates')
      .update({ 
        usage_count: template.usage_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', template.id);

    console.log('Content generated successfully');

    return new Response(JSON.stringify({
      success: true,
      content: generatedContent,
      target: {
        id: target.id,
        domain: target.domain,
        website_url: target.website_url
      },
      template_used: template.template_name,
      from_cache: fromCache
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in content generation:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});