/**
 * AI Fallback Utility for Supabase Edge Functions
 * Provides OpenAI to DeepSeek fallback functionality
 */

interface AIRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: { type: 'json_object' | 'text' };
}

interface AIResponse {
  success: boolean;
  data?: any;
  provider: 'OpenAI' | 'DeepSeek';
  tokensUsed?: number;
  error?: string;
}

export async function callAIWithFallback(request: AIRequest): Promise<AIResponse> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  const deepSeekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  
  if (!openAIApiKey && !deepSeekApiKey) {
    throw new Error('Neither OpenAI nor DeepSeek API keys are configured');
  }

  const {
    messages,
    model = 'gpt-5-2025-08-07',
    maxTokens = 2000,
    temperature = 0.7,
    responseFormat = { type: 'json_object' }
  } = request;

  // Try OpenAI first
  if (openAIApiKey) {
    try {
      console.log(`🔄 Attempting with OpenAI (${model})...`);
      
      const openAIPayload: any = {
        model,
        messages,
        response_format: responseFormat
      };

      // Handle different parameter names for different model types
      if (model.includes('gpt-5') || model.includes('gpt-4.1') || model.includes('o3') || model.includes('o4')) {
        openAIPayload.max_completion_tokens = maxTokens;
        // Don't include temperature for newer models (GPT-5, O3, O4) that don't support it
        if (!model.includes('gpt-5') && !model.includes('o3') && !model.includes('o4')) {
          openAIPayload.temperature = temperature;
        }
      } else {
        openAIPayload.max_tokens = maxTokens;
        openAIPayload.temperature = temperature;
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(openAIPayload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ OpenAI successful. Model: ${model}, Tokens: ${data.usage?.total_tokens || 'N/A'}`);
        
        return {
          success: true,
          data,
          provider: 'OpenAI',
          tokensUsed: data.usage?.total_tokens
        };
      } else {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }
    } catch (openAIError) {
      console.warn(`⚠️ OpenAI failed: ${openAIError.message}`);
      
      // Fallback to DeepSeek if available
      if (deepSeekApiKey) {
        console.log(`🔄 Falling back to DeepSeek...`);
        try {
          return await callDeepSeek({
            messages,
            maxTokens,
            temperature,
            responseFormat
          }, deepSeekApiKey);
        } catch (deepSeekError) {
          console.error(`❌ Both OpenAI and DeepSeek failed`);
          // Return structured "AI unavailable" response
          return {
            success: false,
            error: `AI services unavailable: OpenAI - ${openAIError.message}, DeepSeek - ${deepSeekError.message}`,
            provider: 'None',
            fallbackAvailable: false
          };
        }
      } else {
        throw openAIError;
      }
    }
  } else if (deepSeekApiKey) {
    // Use DeepSeek directly if OpenAI key not available
    console.log(`🔄 Using DeepSeek directly...`);
    try {
      return await callDeepSeek({
        messages,
        maxTokens,
        temperature,
        responseFormat
      }, deepSeekApiKey);
    } catch (deepSeekError) {
      console.error(`❌ DeepSeek failed: ${deepSeekError.message}`);
      return {
        success: false,
        error: `AI service unavailable: ${deepSeekError.message}`,
        provider: 'DeepSeek',
        fallbackAvailable: false
      };
    }
  }

  throw new Error('No API keys available');
}

async function callDeepSeek(
  request: {
    messages: any[];
    maxTokens: number;
    temperature: number;
    responseFormat: { type: string };
  },
  apiKey: string
): Promise<AIResponse> {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: request.messages,
        max_tokens: request.maxTokens,
        temperature: request.temperature,
        response_format: request.responseFormat
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ DeepSeek successful. Model: deepseek-chat, Tokens: ${data.usage?.total_tokens || 'N/A'}`);
    
    return {
      success: true,
      data,
      provider: 'DeepSeek',
      tokensUsed: data.usage?.total_tokens
    };
  } catch (error) {
    console.error('DeepSeek error:', error);
    throw error;
  }
}

/**
 * Quick wrapper for simple text generation with fallback
 */
export async function generateTextWithFallback(
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    jsonMode?: boolean;
  } = {}
): Promise<{ text: string; provider: string; tokensUsed?: number }> {
  const {
    model = 'gpt-5-2025-08-07',
    maxTokens = 2000,
    temperature = 0.7,
    jsonMode = false
  } = options;

  const result = await callAIWithFallback({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    model,
    maxTokens,
    temperature,
    responseFormat: jsonMode ? { type: 'json_object' } : { type: 'text' }
  });

  if (result.success && result.data?.choices?.[0]?.message?.content) {
    return {
      text: result.data.choices[0].message.content,
      provider: result.provider,
      tokensUsed: result.tokensUsed
    };
  }

  throw new Error('Failed to generate text with AI fallback');
}

/**
 * Wrapper for JSON generation with automatic parsing and fallback
 */
export async function generateJSONWithFallback<T = any>(
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<{ data: T; provider: string; tokensUsed?: number }> {
  const result = await generateTextWithFallback(
    systemPrompt,
    userPrompt,
    { ...options, jsonMode: true }
  );

  try {
    const parsedData = JSON.parse(result.text);
    return {
      data: parsedData,
      provider: result.provider,
      tokensUsed: result.tokensUsed
    };
  } catch (parseError) {
    console.error('JSON parse error:', parseError);
    console.error('Raw response:', result.text);
    throw new Error(`Failed to parse JSON response from ${result.provider}: ${parseError.message}`);
  }
}