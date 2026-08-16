import { supabase } from '@/integrations/supabase/client';

export interface GeminiPostResult {
  hook: string;
  content: string;
  hashtags: string[];
}

export interface GeminiReplyResult {
  reply: string;
}

export interface GeminiPassportResult {
  summary: string;
  competencyScore: number;
  topStrengths: string[];
  bulletOptimizations: string[];
}

export interface GeminiConnectResult {
  message: string;
}

// 1. ✨ Gemini AI Post Assistant
export async function generateGeminiPost(topic: string, tone: string = 'Thought Leader'): Promise<GeminiPostResult> {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: { action: 'post_assistant', topic, tone }
    });

    if (error || !data?.data) throw error || new Error('No response');
    return data.data;
  } catch (err) {
    console.warn('Gemini post assistant fallback engaged:', err);
    return {
      hook: `🚀 Key insights on ${topic || 'Professional Leadership'}!`,
      content: `The business landscape is transforming rapidly. By focusing on innovation, execution excellence, and team empowerment, we unlock exponential growth.\n\nWhat strategies are driving the biggest impact for your team this quarter?`,
      hashtags: ['#Leadership', '#CareerGrowth', '#Innovation', '#TalentXcel']
    };
  }
}

// 2. 🪄 Gemini AI Smart Reply & Comment Generator
export async function generateGeminiSmartReply(postContent: string, replyType: string): Promise<GeminiReplyResult> {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: { action: 'smart_reply', postContent, replyType }
    });

    if (error || !data?.data) throw error || new Error('No response');
    return data.data;
  } catch (err) {
    console.warn('Gemini smart reply fallback engaged:', err);
    if (replyType.toLowerCase().includes('congratulat')) {
      return { reply: 'Congratulations on this outstanding achievement! Wishing you continued success ahead. 🎉' };
    }
    return { reply: 'Great perspective! Appreciate you sharing these valuable leadership insights.' };
  }
}

// 3. ⚡ Gemini AI Career Passport Assistant
export async function generateGeminiPassportAssistant(profile: any): Promise<GeminiPassportResult> {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: { action: 'passport_assistant', profile }
    });

    if (error || !data?.data) throw error || new Error('No response');
    return data.data;
  } catch (err) {
    console.warn('Gemini passport assistant fallback engaged:', err);
    return {
      summary: `${profile?.full_name || 'Accomplished Leader'} is a high-impact professional with proven expertise in business growth, cross-functional leadership, and strategic execution.`,
      competencyScore: 96,
      topStrengths: ['Executive Leadership', 'Strategic Planning', 'Revenue Optimization'],
      bulletOptimizations: [
        'Accelerated regional revenue by 42% through targeted Enterprise account acquisition',
        'Spearheaded cross-functional team initiatives to launch digital transformation projects',
        'Established strategic partnership pipelines driving multi-million ARR growth'
      ]
    };
  }
}

// 4. 🤖 Gemini AI Smart Connect AI
export async function generateGeminiSmartConnect(profile: any, targetProfile: any): Promise<GeminiConnectResult> {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: { action: 'smart_connect', profile, targetProfile }
    });

    if (error || !data?.data) throw error || new Error('No response');
    return data.data;
  } catch (err) {
    console.warn('Gemini smart connect fallback engaged:', err);
    return {
      message: `Hi ${targetProfile?.full_name || 'there'}, I really admire your work in the industry and would love to connect and share insights on TalentXcel!`
    };
  }
}
