import { supabase } from '@/integrations/supabase/client';

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
    console.warn('TalentXcel post assistant fallback engaged:', err);
    return {
      hook: `🚀 Key insights on ${topic || 'Professional Leadership'}!`,
      content: `The business landscape is transforming rapidly. By focusing on innovation, execution excellence, and team empowerment, we unlock exponential growth.\n\nWhat strategies are driving the biggest impact for your team this quarter?`,
      hashtags: ['#Leadership', '#CareerGrowth', '#Innovation', '#TalentXcel']
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
    console.warn('TalentXcel rewrite fallback engaged:', err);
    const cleaned = currentText.trim();
    const role = profile?.title || profile?.headline || 'Professional';
    const skills = extractSkillsFromPost(cleaned);

    switch (mode) {
      case 'professional':
        return {
          text: `In today’s fast-evolving landscape, strategic execution and continuous upskilling are paramount.\n\n${cleaned}\n\nKey takeaways:\n• Focus on measurable outcomes\n• Emphasize team collaboration\n• Drive continuous value creation\n\nHow is your organization approaching this transition?`,
          skills: skills.length > 0 ? skills : ['Strategic Thinking', 'Execution'],
          hashtags: ['#ProfessionalGrowth', '#Leadership', '#TalentXcel', '#CareerMilestone']
        };
      case 'career':
        return {
          text: `Excited to share a major career update & learning milestone! 🚀\n\n${cleaned}\n\nThis experience has strengthened my expertise in ${skills.join(', ') || 'modern industry practices'} and sharpened my technical problem-solving capabilities.\n\nAlways open to connecting with peers and mentors working on similar challenges!`,
          skills: skills.length > 0 ? skills : ['Skill Development', 'Career Growth'],
          hashtags: ['#CareerJourney', '#ContinuousLearning', '#SkillsFirst', '#TalentXcel']
        };
      case 'engaging':
        return {
          text: `💡 Quick insight that changed how I approach my work:\n\n${cleaned}\n\nThree things I’ve learned along the way:\n1️⃣ Consistency beats intensity\n2️⃣ Real-world projects build real competence\n3️⃣ Knowledge sharing multiplies impact\n\nDrop your thoughts below — I’d love to hear your perspective! 👇`,
          skills: skills.length > 0 ? skills : ['Innovation', 'Productivity'],
          hashtags: ['#CareerInsights', '#TechCommunity', '#LearningInPublic', '#TalentXcel']
        };
      case 'concise':
        return {
          text: `${cleaned.split('\n')[0]}\n\nFocus: Driving measurable impact, learning systematically, and building resilient solutions.`,
          skills: skills,
          hashtags: ['#Impact', '#Execution']
        };
      case 'job_seeker':
        return {
          text: `👋 I am actively exploring new career opportunities in ${role}!\n\n${cleaned}\n\nCore Strengths & Technical Toolkit:\n• ${skills.join(' • ') || 'Full-Stack Problem Solving'}\n• High-velocity execution and cross-functional leadership\n\nIf your team is hiring or if you know of open roles, let’s connect! DMs are open.`,
          skills: skills.length > 0 ? skills : ['OpenToWork', 'Problem Solving'],
          hashtags: ['#OpenToWork', '#Hiring', '#JobSearch', '#TalentXcel']
        };
      case 'hiring':
        return {
          text: `📢 We are hiring! Join our team as we build the next generation of solutions.\n\n${cleaned}\n\nWhat we are looking for:\n• Passion for high quality & craftsmanship\n• Proficiency in ${skills.join(', ') || 'modern technologies'}\n• Collaborative mindset\n\n📩 Apply directly via TalentXcel or reach out in my DMs!`,
          skills: skills.length > 0 ? skills : ['Hiring', 'TechRecruitment'],
          hashtags: ['#WeAreHiring', '#TechJobs', '#Recruitment', '#Careers']
        };
      case 'hindi':
        return {
          text: `आज के समय में निरंतर सीखना और सही दिशा में आगे बढ़ना सबसे महत्वपूर्ण है। ✨\n\n${cleaned}\n\nसफलता का असली राज़ है: निरंतर प्रयास, सही कौशल और सकारात्मक दृष्टिकोण।\n\nआपकी क्या राय है? कमेंट में ज़रूर बताएं!`,
          skills: skills,
          hashtags: ['#करियर', '#सफलता', '#प्रेरणा', '#TalentXcel']
        };
      case 'polish':
      default:
        return {
          text: `${cleaned}\n\nContinuous learning and systematic problem solving remain the foundation of lasting career success. Looking forward to your insights!`,
          skills: skills,
          hashtags: ['#CareerGrowth', '#TalentXcel', '#Learning']
        };
    }
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
