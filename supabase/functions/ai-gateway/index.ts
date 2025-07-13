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
  // New tool-based approach
  toolSlug?: string;
  operationType?: string;
  input: Record<string, any>;
  userId?: string;
  sessionId?: string;
  customPrompt?: string;
  background?: boolean; // For background processing
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
  
  // Legacy support for existing requests
  module?: string;
  feature?: string;
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
    const { 
      toolSlug, 
      operationType = 'process',
      module, 
      feature, 
      input, 
      userId, 
      sessionId, 
      customPrompt, 
      background = false,
      options 
    } = requestBody;
    
    const startTime = Date.now();
    let toolConfig: any = null;
    let isLegacyRequest = false;

    // Determine if this is a new tool-based request or legacy request
    if (toolSlug) {
      console.log(`AI Gateway: Processing tool-based request for ${toolSlug}`);
      
      // Get tool configuration
      const { data: toolData, error: toolError } = await supabase
        .from('ai_tools_config')
        .select('*')
        .eq('tool_slug', toolSlug)
        .eq('is_enabled', true)
        .single();

      if (toolError || !toolData) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Tool ${toolSlug} not found or disabled` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      toolConfig = toolData;
      
      // Check if this should be processed in background
      if (background && userId) {
        const operationId = crypto.randomUUID();
        
        // Queue the operation for background processing
        await supabase
          .from('ai_operation_queue')
          .insert({
            id: operationId,
            user_id: userId,
            tool_slug: toolSlug,
            operation_type: operationType,
            input_data: input,
            status: 'pending',
            priority: 0
          });

        return new Response(
          JSON.stringify({ 
            success: true,
            data: {
              operationId,
              status: 'queued',
              message: 'Operation queued for background processing'
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (module && feature) {
      // Legacy request handling
      isLegacyRequest = true;
      console.log(`AI Gateway: Processing legacy request ${module}.${feature}`);
      
      const featureKey = feature.toLowerCase().replace(/\s+/g, '_');
      
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
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Either toolSlug or module/feature must be provided' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Process the AI request
    const result = await processAIRequest({
      toolConfig,
      isLegacyRequest,
      module,
      feature,
      input,
      customPrompt,
      options,
    });

    const responseTime = Date.now() - startTime;
    const tokensUsed = result.usage?.tokensUsed || 0;
    const costEstimate = result.usage?.costEstimate || 0;

    // Log the usage
    if (userId) {
      const logData: any = {
        user_id: userId,
        request_type: operationType,
        feature_type: toolSlug ? 'tool' : 'legacy',
        input_data: input,
        output_data: { result: result.data },
        response_time: responseTime,
        tokens_used: tokensUsed,
        cost_estimate: costEstimate,
        success: true,
        session_id: sessionId
      };

      if (toolSlug) {
        logData.tool_slug = toolSlug;
        logData.feature_key = toolSlug;
        logData.module_name = toolConfig.category;
      } else {
        logData.module_name = module;
        logData.feature_key = feature?.toLowerCase().replace(/\s+/g, '_');
      }

      await supabase.from('ai_usage_logs').insert(logData);
    }

    // Update feature status for legacy requests
    if (isLegacyRequest && module && feature) {
      await supabase.rpc('update_ai_feature_status', {
        p_module_name: module,
        p_feature_key: feature.toLowerCase().replace(/\s+/g, '_'),
        p_success: true,
        p_response_time: responseTime
      });
    }

    const response: AIResponse = {
      success: true,
      data: {
        ...result.data,
        toolSlug: toolSlug || `${module}.${feature}`,
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
      const { toolSlug, module, feature, userId, sessionId } = requestBody;
      
      if (userId && (toolSlug || (module && feature))) {
        const logData: any = {
          user_id: userId,
          success: false,
          error_message: errorMessage,
          session_id: sessionId
        };

        if (toolSlug) {
          logData.tool_slug = toolSlug;
          logData.feature_key = toolSlug;
          logData.feature_type = 'tool';
        } else {
          logData.module_name = module;
          logData.feature_key = feature?.toLowerCase().replace(/\s+/g, '_');
          logData.feature_type = 'legacy';
        }

        await supabase.from('ai_usage_logs').insert(logData);

        // Update feature status with error for legacy requests
        if (module && feature) {
          await supabase.rpc('update_ai_feature_status', {
            p_module_name: module,
            p_feature_key: feature.toLowerCase().replace(/\s+/g, '_'),
            p_success: false,
            p_error_message: errorMessage
          });
        }
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

// AI Request Processing Function
async function processAIRequest(params: {
  toolConfig?: any;
  isLegacyRequest: boolean;
  module?: string;
  feature?: string;
  input: Record<string, any>;
  customPrompt?: string;
  options?: any;
}) {
  const { toolConfig, isLegacyRequest, module, feature, input, customPrompt, options } = params;
  
  // Get prompt configuration
  let promptTemplate = customPrompt;
  let systemMessage = 'You are a helpful AI assistant for TalentXcel platform.';
  let temperature = options?.temperature ?? 0.7;
  let maxTokens = options?.maxTokens ?? 1000;
  let modelName = options?.model ?? 'gpt-4.1-2025-04-14';

  if (!customPrompt) {
    if (toolConfig) {
      // Use tool configuration
      promptTemplate = toolConfig.prompt_template;
      systemMessage = toolConfig.system_message || systemMessage;
      temperature = toolConfig.temperature || temperature;
      maxTokens = toolConfig.max_tokens || maxTokens;
      modelName = toolConfig.model_name || modelName;
    } else if (isLegacyRequest) {
      // Use legacy prompt template lookup
      const featureKey = feature?.toLowerCase().replace(/\s+/g, '_');
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
  }

  if (!promptTemplate) {
    throw new Error(`No prompt template found for ${toolConfig?.tool_slug || `${module}.${feature}`}`);
  }

  // Enhanced prompt processing with better placeholder replacement
  let finalPrompt = promptTemplate;
  for (const [key, value] of Object.entries(input)) {
    const placeholder = `{${key}}`;
    const processedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    finalPrompt = finalPrompt.replace(new RegExp(placeholder, 'g'), processedValue);
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
  const tokensUsed = openAIData.usage?.total_tokens || 0;
  const costEstimate = calculateCost(modelName, tokensUsed);

  const aiResult = openAIData.choices[0].message.content;

  return {
    data: {
      result: aiResult,
      model: modelName,
      tokensUsed,
      timestamp: new Date().toISOString()
    },
    usage: {
      tokensUsed,
      costEstimate
    }
  };
}

// Cost calculation function
function calculateCost(model: string, tokens: number): number {
  const costPerThousandTokens: Record<string, number> = {
    'gpt-4.1-2025-04-14': 0.0025,
    'gpt-4o-mini': 0.00015,
    'gpt-4o': 0.0025,
  };
  
  const rate = costPerThousandTokens[model] || 0.002;
  return (tokens / 1000) * rate;
}