import { supabase } from '@/integrations/supabase/client';
import { getSmartTalentXcelContent, getRandomTalentXcelPost } from '@/data/talentxcelAiContentPool';

export interface TalentXcelPostResult {
  hook: string;
  content: string;
  hashtags: string[];
}

export interface TalentXcelReplyResult {
  reply: string;
}

export interface TalentXcelPassportResult {
  summary: string;
  competencyScore: number;
  topStrengths: string[];
  bulletOptimizations: string[];
}

export interface TalentXcelConnectResult {
  message: string;
}

// Aliases for backward compatibility
export type GeminiPostResult = TalentXcelPostResult;
export type GeminiReplyResult = TalentXcelReplyResult;
export type GeminiPassportResult = TalentXcelPassportResult;
export type GeminiConnectResult = TalentXcelConnectResult;

// 1. ✨ TalentXcel AI Post Assistant
export async function generateTalentXcelPost(topic: string, tone: string = 'Thought Leader'): Promise<TalentXcelPostResult> {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: { action: 'post_assistant', topic, tone }
    });

    if (error || !data?.data) throw error || new Error('No response');
    return data.data;
  } catch (err) {
    console.warn('TalentXcel post assistant dynamic pool engaged:', err);
    const smartContent = getSmartTalentXcelContent('professional', '', topic, tone);
    return {
      hook: smartContent.hook,
      content: smartContent.content,
      hashtags: smartContent.hashtags.map(h => h.startsWith('#') ? h : `#${h}`)
    };
  }
}
export const generateGeminiPost = generateTalentXcelPost;

// 2. 🪄 TalentXcel AI Smart Reply & Comment Generator
export async function generateTalentXcelSmartReply(postContent: string, replyType: string): Promise<TalentXcelReplyResult> {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: { action: 'smart_reply', postContent, replyType }
    });

    if (error || !data?.data) throw error || new Error('No response');
    return data.data;
  } catch (err) {
    console.warn('TalentXcel smart reply fallback engaged:', err);
    if (replyType.toLowerCase().includes('congratulat')) {
      return { reply: 'Congratulations on this outstanding achievement! Wishing you continued success ahead. 🎉' };
    }
    return { reply: 'Great perspective! Appreciate you sharing these valuable leadership insights.' };
  }
}
export const generateGeminiSmartReply = generateTalentXcelSmartReply;

// 3. ⚡ TalentXcel AI Career Passport Assistant
export async function generateTalentXcelPassportAssistant(profile: any): Promise<TalentXcelPassportResult> {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: { action: 'passport_assistant', profile }
    });

    if (error || !data?.data) throw error || new Error('No response');
    return data.data;
  } catch (err) {
    console.warn('TalentXcel passport assistant fallback engaged:', err);
    return {
      summary: `${profile?.full_name || 'Dynamic Leader'} is an accomplished ${profile?.title || 'technology and operations strategist'} known for driving impactful transformations.`,
      competencyScore: 88,
      topStrengths: ['Strategic Leadership', 'Cross-Functional Execution', 'Industry Versatility'],
      bulletOptimizations: [
        'Quantified business ROI by aligning stakeholder priorities',
        'Accelerated digital transformation and team capabilities'
      ]
    };
  }
}
export const generateGeminiPassportAssistant = generateTalentXcelPassportAssistant;

// 4. 🤖 TalentXcel AI Smart Connect AI
export async function generateTalentXcelSmartConnect(profile: any, targetProfile: any): Promise<TalentXcelConnectResult> {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: { action: 'smart_connect', profile, targetProfile }
    });

    if (error || !data?.data) throw error || new Error('No response');
    return data.data;
  } catch (err) {
    console.warn('TalentXcel smart connect fallback engaged:', err);
    const targetName = targetProfile?.full_name?.split(' ')[0] || 'there';
    return {
      message: `Hi ${targetName}, I noticed your impressive background in ${targetProfile?.title || 'the industry'} on TalentXcel. I would love to connect and share perspectives on leadership and growth!`
    };
  }
}
export const generateGeminiSmartConnect = generateTalentXcelSmartConnect;
