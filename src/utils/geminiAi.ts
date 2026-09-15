import { supabase } from '@/integrations/supabase/client';
import { getSmartTalentXcelContent } from '@/data/talentxcelAiContentPool';

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
    console.warn('TalentXcel post assistant dynamic engine engaged:', err);
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
export function getSmartCopilotReply(postContent: string, replyType: string): string {
  const normType = (replyType || '').toLowerCase();
  const trimmed = (postContent || '').trim().toLowerCase();

  if (normType.includes('schedule') || normType.includes('meeting') || normType.includes('interview')) {
    const schedulingOptions = [
      "Hi! I'd like to schedule a quick 15–20 minute sync to connect and discuss next steps. What time works best for you this week?",
      "Hello! Would you have 15 minutes available later this week for a brief call? Let me know what days/times suit your schedule.",
      "Hi, thanks for connecting! I'd love to set up a quick meeting to explore opportunities and synergies. When would you be free to chat?"
    ];
    return schedulingOptions[Math.floor(Math.random() * schedulingOptions.length)];
  }

  if (normType.includes('proposal') || normType.includes('accept')) {
    const proposalOptions = [
      "Thank you for sharing the proposal! I have reviewed the details and I'm delighted to accept and move forward. Let's align on kickoff timing.",
      "Everything looks great and aligns with our goals. I'm pleased to accept the proposal—looking forward to collaborating with you!",
      "Thanks for sending over the proposal details. We are happy to proceed! Let me know the immediate next steps to get started."
    ];
    return proposalOptions[Math.floor(Math.random() * proposalOptions.length)];
  }

  if (normType.includes('follow') || normType.includes('inquiry')) {
    const followUpOptions = [
      "Hi, just following up on our previous conversation to see if you've had a chance to review the details. Looking forward to your thoughts!",
      "Hello! Checking in to see if you have any questions or feedback on what we discussed. Happy to provide any additional info whenever convenient.",
      "Hi there, wanted to quickly follow up and see how things are progressing on your end. Let me know if you'd like to reconnect soon!"
    ];
    return followUpOptions[Math.floor(Math.random() * followUpOptions.length)];
  }

  if (normType.includes('congratulat')) {
    return "Congratulations on this incredible achievement! Wishing you continued success and impact ahead. 🎉";
  }

  if (trimmed.includes('how are you') || trimmed.includes('how r u')) {
    return "I'm doing well, thank you! How are things going on your end?";
  }

  if (trimmed.includes('hi') || trimmed.includes('hello') || trimmed.includes('hey')) {
    return "Hello! Great to connect with you. How can I help you today?";
  }

  if (trimmed.includes('thank')) {
    return "You're very welcome! Looking forward to staying in touch.";
  }

  return "Thank you for getting in touch! I appreciate your message and would love to explore how we can collaborate.";
}

export async function generateTalentXcelSmartReply(postContent: string, replyType: string): Promise<TalentXcelReplyResult> {
  const localSmart = getSmartCopilotReply(postContent, replyType);

  // If it's a specific messenger action, deliver instant high-context reply
  const normType = (replyType || '').toLowerCase();
  if (
    normType.includes('schedule') || 
    normType.includes('meeting') || 
    normType.includes('interview') || 
    normType.includes('proposal') || 
    normType.includes('accept') || 
    normType.includes('follow') || 
    normType.includes('inquiry')
  ) {
    return { reply: localSmart };
  }

  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: { action: 'smart_reply', postContent, replyType }
    });

    if (error || !data?.data?.reply) throw error || new Error('No response');
    
    // Discard canned static placeholder if edge function returned it
    if (data.data.reply.includes('Great perspective! Appreciate you sharing these valuable leadership insights')) {
      return { reply: localSmart };
    }

    return data.data;
  } catch (err) {
    console.warn('TalentXcel smart reply fallback engaged:', err);
    return { reply: localSmart };
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

// 5. ✍️ TalentXcel AI Post Rewriter & Optimizer
export async function rewriteTalentXcelPost(
  currentText: string, 
  mode: 'polish' | 'professional' | 'career' | 'engaging' | 'concise' | 'job_seeker' | 'hiring' | 'hindi',
  profile?: any
): Promise<{ text: string; skills: string[]; hashtags: string[] }> {
  try {
    const { data, error } = await supabase.functions.invoke('gemini-ai', {
      body: { action: 'rewrite_post', currentText, mode, profile }
    });
    if (error || !data?.data) throw error || new Error('No response');
    return data.data;
  } catch (err) {
    console.warn('TalentXcel rewrite dynamic pool engaged:', err);
    const smartContent = getSmartTalentXcelContent(mode, currentText, '', '', profile);
    return {
      text: smartContent.text,
      skills: smartContent.skills,
      hashtags: smartContent.hashtags.map(h => h.startsWith('#') ? h : `#${h}`)
    };
  }
}

// 6. 🧠 Skill Extraction Engine from Text
export function extractSkillsFromPost(text: string): string[] {
  const commonSkills = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Next.js', 'Vue.js', 'Angular',
    'Java', 'Spring Boot', 'C++', 'Golang', 'Rust', 'PHP', 'Laravel', 'Django', 'Flask',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'DevOps', 'CI/CD', 'Terraform',
    'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API', 'System Design',
    'Machine Learning', 'AI', 'Deep Learning', 'NLP', 'Data Science', 'Data Analytics',
    'UI/UX', 'Figma', 'Product Management', 'Agile', 'Scrum', 'Leadership', 'Sales',
    'Digital Marketing', 'SEO', 'Content Strategy', 'Cybersecurity', 'Cloud Computing'
  ];

  const matched = commonSkills.filter(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(text);
  });

  return matched.slice(0, 6);
}
