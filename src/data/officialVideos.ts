export interface TXCVideoItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  durationSeconds: number;
  durationFormatted: string;
  category: 'platform' | 'ats' | 'jobs' | 'network' | 'education' | 'skills';
  badge: string;
  ctaText: string;
  ctaLink: string;
}

export const OFFICIAL_TXC_VIDEOS: TXCVideoItem[] = [
  {
    id: 'talentxcel-overview',
    title: 'TalentXcel Platform Tour',
    tagline: 'AI-Powered Careers, Higher Ed & Verified Skills',
    description: 'Explore how TalentXcel unifies verified job discovery, AI resume scoring, 10,250+ Indian colleges, and portable skill passports in one high-velocity career platform.',
    videoUrl: '/videos/txc/talentxcel-overview.mp4',
    thumbnailUrl: '/videos/txc/thumbnails/talentxcel-overview.jpg',
    durationSeconds: 24,
    durationFormatted: '0:24',
    category: 'platform',
    badge: 'Official Tour',
    ctaText: 'Check My Resume — Free ATS Scan',
    ctaLink: '/resume'
  },
  {
    id: 'ats-demo-2',
    title: 'Inside Enterprise ATS Scanners',
    tagline: 'Watch How Fortune 500 ATS Bots Read Your Resume',
    description: 'See live how applicant tracking systems parse section headers, extract technical keywords, quantify metrics, and score candidate resumes before human recruiters see them.',
    videoUrl: '/videos/txc/ats-demo-2.mp4',
    thumbnailUrl: '/videos/txc/thumbnails/ats-demo-2.jpg',
    durationSeconds: 42,
    durationFormatted: '0:42',
    category: 'ats',
    badge: 'ATS Scanner Demo',
    ctaText: 'Scan My Resume Now',
    ctaLink: '/resume/ats-check'
  },
  {
    id: 'talentxcel-job-match',
    title: 'AI Job Matching Engine',
    tagline: 'Semantic Relevance & Instant High-Fit Discovery',
    description: 'Zero-barrier job discovery matched directly against your exact skill profile, compensation targets, and verified career milestones.',
    videoUrl: '/videos/txc/talentxcel-job-match.mp4',
    thumbnailUrl: '/videos/txc/thumbnails/talentxcel-job-match.jpg',
    durationSeconds: 29,
    durationFormatted: '0:29',
    category: 'jobs',
    badge: 'Job Match Demo',
    ctaText: 'Explore Verified Jobs',
    ctaLink: '/jobs'
  },
  {
    id: 'talentxcel-career-hub',
    title: 'Career Hub & Professional Network',
    tagline: 'Connect With Verified Industry Peers & Mentors',
    description: 'Build your professional circle, discover curated career paths, and collaborate with mentors across leading global technology and business domains.',
    videoUrl: '/videos/txc/talentxcel-career-hub.mp4',
    thumbnailUrl: '/videos/txc/thumbnails/talentxcel-career-hub.jpg',
    durationSeconds: 32,
    durationFormatted: '0:32',
    category: 'network',
    badge: 'Network Spotlight',
    ctaText: 'Join Professional Network',
    ctaLink: '/network'
  },
  {
    id: 'talentxcel-career-passport',
    title: 'Career Passport & Verified Credentials',
    tagline: 'Cryptographically Verifiable Professional Proof',
    description: 'Your digital career passport showcasing authenticated project achievements, skills, and industry badges that hiring managers trust instantly.',
    videoUrl: '/videos/txc/talentxcel-career-passport.mp4',
    thumbnailUrl: '/videos/txc/thumbnails/talentxcel-career-passport.jpg',
    durationSeconds: 19,
    durationFormatted: '0:19',
    category: 'skills',
    badge: 'Credential Demo',
    ctaText: 'Build Career Passport',
    ctaLink: '/passport'
  },
  {
    id: 'talentxcel-higher-ed',
    title: 'Higher Education & College Discovery',
    tagline: '10,250+ Indian Colleges, Cutoffs & Career Mapping',
    description: 'Detailed insights on NIRF rankings, courses, placements, and campus life across thousands of verified Indian universities and institutes.',
    videoUrl: '/videos/txc/talentxcel-higher-ed.mp4',
    thumbnailUrl: '/videos/txc/thumbnails/talentxcel-higher-ed.jpg',
    durationSeconds: 37,
    durationFormatted: '0:37',
    category: 'education',
    badge: 'Higher Ed Demo',
    ctaText: 'Explore 10,250+ Colleges',
    ctaLink: '/colleges'
  },
  {
    id: 'ats-demo-1',
    title: 'Real-Time ATS Parsing Breakdown',
    tagline: 'Holographic Scanner Diagnostic HUD',
    description: 'Watch deep semantic parsing identify missing hard skills, layout formatting errors, and unquantified impact statements in real time.',
    videoUrl: '/videos/txc/ats-demo-1.mp4',
    thumbnailUrl: '/videos/txc/thumbnails/ats-demo-1.jpg',
    durationSeconds: 15,
    durationFormatted: '0:15',
    category: 'ats',
    badge: 'Diagnostic HUD',
    ctaText: 'Test Resume Compatibility',
    ctaLink: '/resume/ats-check'
  },
  {
    id: 'ats-demo-6',
    title: 'Enterprise Recruiter Screening Queue',
    tagline: 'Automated Resume Pipeline & Shortlisting',
    description: 'How modern talent acquisition teams filter thousands of inbound applications into top 5% candidate shortlists using automated parsing engines.',
    videoUrl: '/videos/txc/ats-demo-6.mp4',
    thumbnailUrl: '/videos/txc/thumbnails/ats-demo-6.jpg',
    durationSeconds: 62,
    durationFormatted: '1:02',
    category: 'ats',
    badge: 'ATS Pipeline',
    ctaText: 'Optimize Resume for Recruiters',
    ctaLink: '/resume'
  }
];

export const getVideoById = (id: string): TXCVideoItem => {
  return OFFICIAL_TXC_VIDEOS.find(v => v.id === id) || OFFICIAL_TXC_VIDEOS[0];
};
