import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface AIRequest {
  module: string;
  feature: string;
  input: Record<string, any>;
  userId?: string;
  sessionId?: string;
  customPrompt?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  usage?: {
    tokensUsed: number;
    responseTime: number;
    costEstimate: number;
  };
  featureStatus?: {
    enabled: boolean;
    lastSuccess: string | null;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody: AIRequest = await req.json();
    const { module, feature, input, userId, sessionId, customPrompt, options } = requestBody;
    
    console.log(`AI Gateway: Processing ${module}.${feature} request`);
    
    const startTime = Date.now();
    let featureKey = feature.toLowerCase().replace(/\s+/g, '_');
    
    // Check if feature is enabled and get status
    const { data: featureStatus, error: statusError } = await supabase
      .from('ai_features_status')
      .select('*')
      .eq('module_name', module)
      .eq('feature_key', featureKey)
      .single();

    if (statusError) {
      console.error('Feature status error:', statusError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Feature ${module}.${feature} not found in system` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    if (!featureStatus.enabled) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Feature ${module}.${feature} is currently disabled`,
          featureStatus: {
            enabled: false,
            lastSuccess: featureStatus.last_success
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    // Get prompt template for this feature
    let promptTemplate = customPrompt;
    let systemMessage = 'You are a helpful AI assistant for TalentXcel platform.';
    let temperature = options?.temperature ?? 0.7;
    let maxTokens = options?.maxTokens ?? 1000;
    let modelName = options?.model ?? 'gpt-4o-mini';

    if (!customPrompt) {
      const { data: templateData } = await supabase
        .from('ai_prompt_templates')
        .select('*')
        .eq('module_name', module)
        .eq('feature_key', featureKey)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (templateData) {
        promptTemplate = templateData.prompt_template;
        systemMessage = templateData.system_message || systemMessage;
        temperature = templateData.temperature || temperature;
        maxTokens = templateData.max_tokens || maxTokens;
        modelName = templateData.model_name || modelName;
      }
    }

    if (!promptTemplate) {
      throw new Error(`No prompt template found for ${module}.${feature}`);
    }

    // Replace placeholders in prompt with actual input data
    let finalPrompt = promptTemplate;
    for (const [key, value] of Object.entries(input)) {
      const placeholder = `{${key}}`;
      finalPrompt = finalPrompt.replace(new RegExp(placeholder, 'g'), String(value));
    }

    console.log('Sending request to OpenAI...');

    // Make OpenAI API call
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: finalPrompt }
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status} ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const responseTime = Date.now() - startTime;
    const tokensUsed = openAIData.usage?.total_tokens || 0;
    const costEstimate = (tokensUsed / 1000) * 0.002; // Rough estimate for gpt-4o-mini

    const aiResult = openAIData.choices[0].message.content;

    // Log the usage
    if (userId) {
      await supabase
        .from('ai_usage_logs')
        .insert({
          user_id: userId,
          module_name: module,
          feature_key: featureKey,
          input_data: input,
          output_data: { result: aiResult },
          response_time: responseTime,
          tokens_used: tokensUsed,
          cost_estimate: costEstimate,
          success: true,
          session_id: sessionId
        });
    }

    // Update feature status
    await supabase.rpc('update_ai_feature_status', {
      p_module_name: module,
      p_feature_key: featureKey,
      p_success: true,
      p_response_time: responseTime
    });

    const response: AIResponse = {
      success: true,
      data: {
        result: aiResult,
        module,
        feature,
        processedAt: new Date().toISOString()
      },
      usage: {
        tokensUsed,
        responseTime,
        costEstimate
      },
      featureStatus: {
        enabled: true,
        lastSuccess: new Date().toISOString()
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Gateway Error:', error);
    
    const errorMessage = error.message || 'Unknown error occurred';
    
    // Log the error if we have the request details
    try {
      const requestBody = await req.clone().json();
      const { module, feature, userId, sessionId } = requestBody;
      
      if (userId && module && feature) {
        const featureKey = feature.toLowerCase().replace(/\s+/g, '_');
        
        await supabase
          .from('ai_usage_logs')
          .insert({
            user_id: userId,
            module_name: module,
            feature_key: featureKey,
            success: false,
            error_message: errorMessage,
            session_id: sessionId
          });

        // Update feature status with error
        await supabase.rpc('update_ai_feature_status', {
          p_module_name: module,
          p_feature_key: featureKey,
          p_success: false,
          p_error_message: errorMessage
        });
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});