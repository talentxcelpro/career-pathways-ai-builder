interface CoachContext {
  profile?: {
    full_name?: string | null;
    title?: string | null;
    current_job_title?: string | null;
    location?: string | null;
    industry?: string | null;
    bio?: string | null;
    skills?: string[] | null;
  } | null;
  skills?: string[];
  latestResume?: {
    ats_score?: number | null;
    content?: unknown;
  } | null;
}

interface LocalCoachInput {
  message: string;
  command?: string;
  context?: CoachContext | null;
}

const DEFAULT_SKILLS = ['communication', 'problem solving', 'ownership'];

function profileName(context?: CoachContext | null) {
  const fullName = context?.profile?.full_name?.trim();
  return fullName?.split(/\s+/)[0] || 'there';
}

function roleLabel(context?: CoachContext | null) {
  return context?.profile?.title || context?.profile?.current_job_title || 'your target role';
}

function skillList(context?: CoachContext | null) {
  const profileSkills = Array.isArray(context?.profile?.skills) ? context?.profile?.skills : [];
  const querySkills = Array.isArray(context?.skills) ? context?.skills : [];
  return [...new Set([...profileSkills, ...querySkills].filter(Boolean))].slice(0, 8);
}

function contextSummary(context?: CoachContext | null) {
  const skills = skillList(context);
  const atsScore = context?.latestResume?.ats_score;

  return [
    `Role focus: ${roleLabel(context)}`,
    `Location: ${context?.profile?.location || 'not set'}`,
    `Top skills: ${(skills.length ? skills : DEFAULT_SKILLS).join(', ')}`,
    typeof atsScore === 'number' ? `Latest ATS score: ${atsScore}/100` : 'Latest ATS score: not available',
  ].join('\n');
}

function mockInterviewResponse(context?: CoachContext | null) {
  const role = roleLabel(context);
  const skills = skillList(context);

  return `Absolutely, ${profileName(context)}. I will run this like a focused first-round interview for ${role}.

Profile context I am using:
${contextSummary(context)}

Start with these questions:
1. Tell me about yourself and why this next role fits your career direction.
2. Walk me through the strongest project or achievement that proves you can do this job.
3. Describe a time you handled ambiguity, pressure, or a difficult stakeholder.
4. What are your strongest technical or domain skills${skills.length ? `, especially around ${skills.slice(0, 3).join(', ')}` : ''}?
5. Where are you currently weaker than the ideal candidate, and what are you doing about it?
6. Why should this company choose you over another qualified candidate?

Answer style:
Use STAR for behavioral answers, keep each answer under 90 seconds, and close every answer with business impact. After you answer question 1, send it here and I will score it on clarity, confidence, relevance, and hiring insight.`;
}

function atsResponse(context?: CoachContext | null) {
  const atsScore = context?.latestResume?.ats_score;

  return `Here is the resume scan I can do from your available TalentXcel context.

${contextSummary(context)}

Priority fixes:
1. Put your target role in the headline and summary using the exact hiring-market wording.
2. Add 6-10 role keywords in skills, but only if you can defend them in an interview.
3. Rewrite bullets as outcome statements: action + scope + measurable result.
4. Move tools, projects, and certifications closer to the top if they match the next role.
5. Keep formatting simple: no tables, no text boxes, no image-only content.

${typeof atsScore === 'number' ? `Your stored ATS score is ${atsScore}/100. A realistic next target is ${Math.min(100, atsScore + 12)}/100 after keyword and impact rewrites.` : 'I do not see a stored ATS score yet. Upload or mark a primary resume so I can make this more precise.'}`;
}

function jobTailorResponse(context?: CoachContext | null) {
  return `Send me the job description and I will tailor the strategy line by line.

Until then, use this structure for ${roleLabel(context)}:
1. Extract the top 10 repeated requirements from the JD.
2. Map each requirement to one proof point from your profile, resume, or project history.
3. Put the strongest 3 proof points in the resume summary.
4. Reorder skills so the JD-critical skills appear first.
5. Rewrite 4 bullets using the employer's language, but keep the facts true.

Current profile metrics:
${contextSummary(context)}

The winning version should make the recruiter think: this person has already done 70% of this job.`;
}

function marketScanResponse(context?: CoachContext | null) {
  const skills = skillList(context);

  return `Here is the market-scan playbook for ${roleLabel(context)}.

Strong match criteria:
${(skills.length ? skills : DEFAULT_SKILLS).slice(0, 5).map((skill) => `- ${skill}`).join('\n')}

Next actions:
1. Open Matches and run Talent Matcher.
2. Prioritize roles above 75% match.
3. For every 60-75% role, identify the one missing skill that would move you above 80%.
4. Focus only where salary, location, and role level are aligned.
5. Use Network Pulse to find employees at those companies before applying.

If the cloud Talent Engine is configured, I can turn this into live ranked matches. Right now I am using your stored TalentXcel context and local guidance.`;
}

function generalResponse(message: string, context?: CoachContext | null) {
  const lower = message.toLowerCase();

  if (lower.includes('interview')) return mockInterviewResponse(context);
  if (lower.includes('resume') || lower.includes('ats')) return atsResponse(context);
  if (lower.includes('job') || lower.includes('apply') || lower.includes('match')) return marketScanResponse(context);
  if (lower.includes('salary') || lower.includes('lpa') || lower.includes('package')) {
    return `To move compensation up, treat it like a 12-month operating plan.

${contextSummary(context)}

Plan:
1. Pick one target role and one target salary band.
2. Benchmark 20 jobs in that band and list the repeated must-have skills.
3. Close the top 2 skill gaps with proof projects, not only courses.
4. Build referral paths through the Network before applying.
5. Track weekly progress in TalentScore: profile, skills, network, learning, activity.

For India salary jumps, the strongest indicators are role clarity, interview-ready projects, company-tier targeting, and warm referrals.`;
  }

  return `I can help. Here is the career strategy I would start with based on your TalentXcel profile.

${contextSummary(context)}

Best next move:
1. Clarify the exact role you want next.
2. Improve the highest-impact growth category first.
3. Use your Network to build warm paths into target companies.
4. Use Matches to avoid wasting time on low-fit jobs.
5. Bring me a resume, JD, or interview answer and I will make it sharper.

Ask me one specific thing like "review my resume", "prep me for interviews", or "how do I reach 30 LPA" and I will go deeper.`;
}

export function generateLocalCareerCoachResponse({ message, command, context }: LocalCoachInput) {
  switch (command) {
    case '/mock-interview':
      return mockInterviewResponse(context);
    case '/ats-scan':
      return atsResponse(context);
    case '/jd-tailor':
      return jobTailorResponse(context);
    case '/matcher-scan':
      return marketScanResponse(context);
    default:
      return generalResponse(message, context);
  }
}
