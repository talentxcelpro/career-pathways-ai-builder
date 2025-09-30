/**
 * AI Fallback Utility for Edge Functions
 * Provides robust AI interactions with fallback mechanisms
 */

interface AIResult {
  success: boolean;
  data: any;
  provider: string;
  error?: string;
}

interface AIConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export async function generateJSONWithFallback(
  systemPrompt: string,
  userPrompt: string,
  config: AIConfig = {}
): Promise<AIResult> {
  const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const {
    model = 'gpt-5-mini-2025-08-07',
    maxTokens = 2000,
    temperature = 0.3
  } = config;

  try {
    console.log(`🤖 Making OpenAI API call with model: ${model}`);
    
    // Prepare request body based on model
    const requestBody: any = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    };

    // Use correct parameter based on model
    if (model.startsWith('gpt-5') || model.startsWith('gpt-4.1') || model.startsWith('o3') || model.startsWith('o4')) {
      requestBody.max_completion_tokens = maxTokens;
      // Don't include temperature for newer models
    } else {
      requestBody.max_tokens = maxTokens;
      requestBody.temperature = temperature;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    try {
      const parsedData = JSON.parse(content);
      return {
        success: true,
        data: parsedData,
        provider: `OpenAI ${model}`
      };
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Invalid JSON response from OpenAI');
    }

  } catch (error) {
    console.error('AI service error:', error);
    throw error;
  }
}

export async function generateTextWithFallback(
  systemPrompt: string,
  userPrompt: string,
  config: AIConfig = {}
): Promise<AIResult> {
  const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const {
    model = 'gpt-5-mini-2025-08-07',
    maxTokens = 1000,
    temperature = 0.7
  } = config;

  try {
    console.log(`🤖 Making OpenAI text generation call with model: ${model}`);
    
    // Prepare request body based on model
    const requestBody: any = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    };

    // Use correct parameter based on model
    if (model.startsWith('gpt-5') || model.startsWith('gpt-4.1') || model.startsWith('o3') || model.startsWith('o4')) {
      requestBody.max_completion_tokens = maxTokens;
      // Don't include temperature for newer models
    } else {
      requestBody.max_tokens = maxTokens;
      requestBody.temperature = temperature;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    return {
      success: true,
      data: content,
      provider: `OpenAI ${model}`
    };

  } catch (error) {
    console.error('AI service error:', error);
    throw error;
  }
}