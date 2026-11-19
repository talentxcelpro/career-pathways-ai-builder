/**
 * Post-Application Network Prompt Engine
 * 
 * Generates personalized, high-converting discussion prompts after a candidate
 * applies to a job. Never reveals employer, salary, or application context.
 */

export interface PostApplyPromptContext {
  role?: string;
  industry?: string;
  topSkill?: string;
  city?: string;
  experienceLevel?: string;
}

export interface PostApplyPrompt {
  id: string;
  archetype: string;
  title: string;
  promptText: string;
  starterDraft: string;
}

const SEEN_PROMPTS_KEY = 'tx_seen_apply_prompts';

function getSeenPromptIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SEEN_PROMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordSeenPrompt(promptId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const seen = getSeenPromptIds();
    if (!seen.includes(promptId)) {
      seen.push(promptId);
      // Keep last 30
      if (seen.length > 30) seen.shift();
      localStorage.setItem(SEEN_PROMPTS_KEY, JSON.stringify(seen));
    }
  } catch {
    // Ignore localStorage errors
  }
}

export function generatePostApplyPrompts(context: PostApplyPromptContext = {}): PostApplyPrompt[] {
  const role = (context.role || 'Professional').trim();
  const industry = (context.industry || 'Tech & Modern Business').trim();
  const topSkill = (context.topSkill || 'System Architecture').trim();
  const city = (context.city || 'Global Remote').trim();
  const experience = (context.experienceLevel || 'experienced').toLowerCase();

  const allPrompts: PostApplyPrompt[] = [
    {
      id: `stack-arch-${topSkill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      archetype: 'Tech Stack & Tools',
      title: `${topSkill} Stack Best Practices`,
      promptText: `What is the single most underrated tool in your ${topSkill} workflow in 2026?`,
      starterDraft: `In 2026, my ${topSkill} stack has evolved significantly. The biggest productivity unlock for our team hasn't been the most hyped framework, but focusing on solid fundamentals and automation. What is your go-to tooling setup right now?`
    },
    {
      id: `industry-debate-${industry.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      archetype: 'Industry Direction',
      title: `${industry} Outlook 2026`,
      promptText: `Where is the biggest growth or bottleneck in ${industry} heading over the next 12 months?`,
      starterDraft: `Looking at current trends in ${industry}, the landscape is shifting rapidly toward autonomous AI workflows and stricter quality benchmarks. Are teams in your space investing more in infrastructure, product velocity, or specialized talent this year?`
    },
    {
      id: `case-study-${topSkill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      archetype: 'Real-World Lessons',
      title: `Hardest ${topSkill} Challenge`,
      promptText: `What is the toughest architectural or operational challenge you solved using ${topSkill}?`,
      starterDraft: `One of the most complex engineering challenges I navigated recently involved scaling ${topSkill} under real-world production load. The key takeaway was that premature optimization hurts less than lack of proper telemetry. How do others approach this?`
    },
    {
      id: `market-trends-${city.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      archetype: 'Market & Hiring Insights',
      title: `${role} Market in ${city}`,
      promptText: `How is the hiring bar and compensation structure shifting for ${role}s across ${city}?`,
      starterDraft: `For ${role}s operating in and around ${city}, hiring expectations have matured significantly. Companies are filtering heavily for end-to-end ownership and verified execution over generic credentials. What shifts are you noticing in interviews recently?`
    },
    {
      id: `framework-faceoff-${role.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      archetype: 'Perspective & Debate',
      title: `${topSkill} vs Modern Alternatives`,
      promptText: `Is ${topSkill} still the gold standard, or are alternative paradigms replacing it?`,
      starterDraft: `There is a lively debate on whether ${topSkill} remains the default choice or if modern lightweight alternatives are truly ready for mission-critical enterprise workloads. Here is my perspective from hands-on delivery:`
    },
    {
      id: `career-milestone-${role.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      archetype: 'Career Growth',
      title: `Accelerating as a ${role}`,
      promptText: `What is one principle that accelerated your growth as a ${role}?`,
      starterDraft: `The biggest inflection point in my career as a ${role} came when I stopped just solving tickets and started focusing on business impact and high-leverage systems. What was the single shift that moved the needle most for you?`
    },
    {
      id: `peer-help-${role.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      archetype: 'Peer Networking',
      title: `Open Peer Discussion: ${role}`,
      promptText: `Calling fellow ${role}s: How are you navigating rapid AI integration in day-to-day work?`,
      starterDraft: `To fellow ${role}s and ${industry} peers: How much of your weekly engineering and delivery workflow is now augmented by AI agents? Where is it saving hours, and where does it still fall short?`
    }
  ];

  // Rotate seen prompts so returning users get fresh variations
  const seenIds = new Set(getSeenPromptIds());
  const unseen = allPrompts.filter(p => !seenIds.has(p.id));
  const candidatePool = unseen.length >= 3 ? unseen : allPrompts;

  // Return top 3 prioritized for context
  return candidatePool.slice(0, 3);
}

export function getAllPostApplyPrompts(context: PostApplyPromptContext = {}): PostApplyPrompt[] {
  const role = (context.role || 'Professional').trim();
  const industry = (context.industry || 'Tech & Modern Business').trim();
  const topSkill = (context.topSkill || 'System Architecture').trim();
  const city = (context.city || 'Global Remote').trim();

  return [
    {
      id: `stack-arch-${topSkill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      archetype: 'Tech Stack & Tools',
      title: `${topSkill} Stack Best Practices`,
      promptText: `What is the single most underrated tool in your ${topSkill} workflow in 2026?`,
      starterDraft: `In 2026, my ${topSkill} stack has evolved significantly. The biggest productivity unlock for our team hasn't been the most hyped framework, but focusing on solid fundamentals and automation. What is your go-to tooling setup right now?`
    },
    {
      id: `industry-debate-${industry.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      archetype: 'Industry Direction',
      title: `${industry} Outlook 2026`,
      promptText: `Where is the biggest growth or bottleneck in ${industry} heading over the next 12 months?`,
      starterDraft: `Looking at current trends in ${industry}, the landscape is shifting rapidly toward autonomous AI workflows and stricter quality benchmarks. Are teams in your space investing more in infrastructure, product velocity, or specialized talent this year?`
    },
    {
      id: `case-study-${topSkill.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      archetype: 'Real-World Lessons',
      title: `Hardest ${topSkill} Challenge`,
      promptText: `What is the toughest architectural or operational challenge you solved using ${topSkill}?`,
      starterDraft: `One of the most complex engineering challenges I navigated recently involved scaling ${topSkill} under real-world production load. The key takeaway was that premature optimization hurts less than lack of proper telemetry. How do others approach this?`
    },
    {
      id: `market-trends-${city.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      archetype: 'Market & Hiring Insights',
      title: `${role} Market in ${city}`,
      promptText: `How is the hiring bar and compensation structure shifting for ${role}s across ${city}?`,
      starterDraft: `For ${role}s operating in and around ${city}, hiring expectations have matured significantly. Companies are filtering heavily for end-to-end ownership and verified execution over generic credentials. What shifts are you noticing in interviews recently?`
    },
    {
      id: `framework-faceoff-${role.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      archetype: 'Perspective & Debate',
      title: `${topSkill} vs Modern Alternatives`,
      promptText: `Is ${topSkill} still the gold standard, or are alternative paradigms replacing it?`,
      starterDraft: `There is a lively debate on whether ${topSkill} remains the default choice or if modern lightweight alternatives are truly ready for mission-critical enterprise workloads. Here is my perspective from hands-on delivery:`
    },
    {
      id: `career-milestone-${role.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      archetype: 'Career Growth',
      title: `Accelerating as a ${role}`,
      promptText: `What is one principle that accelerated your growth as a ${role}?`,
      starterDraft: `The biggest inflection point in my career as a ${role} came when I stopped just solving tickets and started focusing on business impact and high-leverage systems. What was the single shift that moved the needle most for you?`
    },
    {
      id: `peer-help-${role.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      archetype: 'Peer Networking',
      title: `Open Peer Discussion: ${role}`,
      promptText: `Calling fellow ${role}s: How are you navigating rapid AI integration in day-to-day work?`,
      starterDraft: `To fellow ${role}s and ${industry} peers: How much of your weekly engineering and delivery workflow is now augmented by AI agents? Where is it saving hours, and where does it still fall short?`
    }
  ];
}
