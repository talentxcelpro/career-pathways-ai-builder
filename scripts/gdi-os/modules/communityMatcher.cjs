const PLATFORM_COMMUNITY_MAP = {
  'Tier 2/3 Regional Hubs': [
    { platform: 'telegram', communityName: 'UP & Regional Job Alerts (@VaranasiJobs, @UPJobAlerts)', format: 'channel_broadcast', rules: 'Direct verified job cards only, no link shorteners' },
    { platform: 'facebook', communityName: 'Varanasi / Patiala Local Employment Groups', format: 'community_post', rules: 'No spam, must include verified salary and job description' },
    { platform: 'linkedin', communityName: 'LinkedIn City Groups (#VaranasiTech, #PatialaHiring)', format: 'social_post', rules: 'Professional tone, direct application link' }
  ],
  'Metro Tech Hubs': [
    { platform: 'linkedin', communityName: 'LinkedIn Tech Communities (#BangaloreJobs, #PuneTech)', format: 'carousel', rules: 'High-value tech data, salary benchmarks, or architecture insights' },
    { platform: 'reddit', communityName: 'r/developersIndia', format: 'community_post', rules: 'No direct advertisements, provide open benchmark or community advice' }
  ],
  'Tech, Data, Cloud & AI Roles': [
    { platform: 'reddit', communityName: 'r/datascience, r/dataanalysis, r/MachineLearning', format: 'community_post', rules: 'Provide detailed project breakdown or portfolio advice' },
    { platform: 'linkedin', communityName: 'LinkedIn Data & AI Leaders (#DataEngineering, #MLOps)', format: 'social_post', rules: 'Tech stack discussion, interview question teardown' },
    { platform: 'twitter', communityName: 'Tech Twitter / X Engineering Community', format: 'thread', rules: 'Concise insights, link in bio or final tweet' }
  ],
  'Freshers, Entry-Level & Campus': [
    { platform: 'linkedin', communityName: 'LinkedIn Campus & Fresher Circles (#FreshersHiring2026)', format: 'social_post', rules: 'Highlight 0-2 yrs experience, no registration barriers' },
    { platform: 'youtube', communityName: 'YouTube Shorts Career Advice', format: 'short_video', rules: 'Visual 30s punchy tip on resume formatting or interview questions' },
    { platform: 'whatsapp', communityName: 'College Placement Cell Broadcast Groups', format: 'channel_broadcast', rules: 'Clean job links with direct Google 1-tap application' }
  ],
  'Interview Prep & Career Copilot': [
    { platform: 'medium', communityName: 'Towards Data Science / Medium Tech Publications', format: 'newsletter', rules: 'Comprehensive 20-question deep dive with code snippets' },
    { platform: 'reddit', communityName: 'r/interviewprep, r/cscareerquestions', format: 'community_post', rules: 'Share complete question bank openly in text' }
  ],
  'Salary, Benchmarking & CTC': [
    { platform: 'linkedin', communityName: 'LinkedIn Professional Feed (#SalaryTrends, #TechCareers)', format: 'carousel', rules: 'Infographic slides comparing percentiles and cities' },
    { platform: 'reddit', communityName: 'r/developersIndia, r/india', format: 'community_post', rules: 'Open compensation analysis without paywalls' }
  ],
  'Resume Writing & ATS Optimization': [
    { platform: 'youtube', communityName: 'YouTube Shorts / Instagram Reels', format: 'short_video', rules: 'Live screen recording before/after ATS score demonstration' },
    { platform: 'reddit', communityName: 'r/resumes', format: 'comment', rules: 'Offer genuine resume critique, link to free ATS scanner utility' }
  ],
  'Company & Employer Specific': [
    { platform: 'linkedin', communityName: 'Company-specific Alumni & Employee Networks', format: 'social_post', rules: 'Inside look at hiring process, culture, and interview rounds' }
  ],
  'Government & Banking Careers': [
    { platform: 'telegram', communityName: 'Banking & Sarkari Exam Prep Channels (@BankExamAlerts)', format: 'channel_broadcast', rules: 'Direct exam notification dates, eligibility, and links' }
  ],
  'Remote, WFH & Freelance': [
    { platform: 'reddit', communityName: 'r/remotejobs, r/digitalnomad, r/WorkOnline', format: 'community_post', rules: 'Verified international remote roles with USD/INR pay transparency' }
  ]
};

function matchCommunities(clusterName) {
  const matched = PLATFORM_COMMUNITY_MAP[clusterName];
  if (matched && matched.length > 0) return matched;
  return [
    { platform: 'linkedin', communityName: 'LinkedIn Professional Careers Network', format: 'social_post', rules: 'Professional value post' },
    { platform: 'telegram', communityName: 'Global Career Alerts', format: 'channel_broadcast', rules: 'Direct job link' }
  ];
}

module.exports = { matchCommunities, PLATFORM_COMMUNITY_MAP };
