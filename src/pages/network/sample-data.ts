// Sample data for networking pages when no real data is available

export const sampleSkillExchanges = [
  {
    id: 'sample-1',
    skill_offered: 'React Development',
    skill_sought: 'UI/UX Design', 
    description: 'I can help you build responsive React applications in exchange for design guidance on user interfaces.',
    difficulty_level: 'intermediate' as const,
    credits_offered: 50,
    created_at: new Date().toISOString(),
    profiles: {
      full_name: 'Sarah Chen',
      profile_picture_url: null
    }
  },
  {
    id: 'sample-2',
    skill_offered: 'Digital Marketing',
    skill_sought: 'Python Programming',
    description: 'Experienced in SEO, social media marketing, and content strategy. Looking to learn Python for data analysis.',
    difficulty_level: 'beginner' as const,
    credits_offered: 75,
    created_at: new Date().toISOString(),
    profiles: {
      full_name: 'Alex Rodriguez',
      profile_picture_url: null
    }
  }
];

export const sampleVideoIntros = [
  {
    id: 'sample-1',
    title: 'Software Engineer Introduction',
    description: 'Hi! I\'m a full-stack developer with 5 years of experience in React and Node.js. Looking to connect with fellow developers and potential collaborators.',
    video_url: null,
    thumbnail_url: null,
    tags: ['Software Development', 'React', 'Node.js'],
    view_count: 125,
    like_count: 23,
    created_at: new Date().toISOString(),
    user_name: 'Emily Johnson',
    user_title: 'Senior Software Engineer',
    user_avatar: null
  },
  {
    id: 'sample-2',
    title: 'Marketing Professional Intro',
    description: 'Marketing professional with expertise in digital campaigns and brand strategy. Passionate about helping startups grow their online presence.',
    video_url: null,
    thumbnail_url: null,
    tags: ['Marketing', 'Digital Strategy', 'Branding'],
    view_count: 89,
    like_count: 17,
    created_at: new Date().toISOString(),
    user_name: 'Michael Brown',
    user_title: 'Marketing Director',
    user_avatar: null
  }
];

export const sampleVerifiedProfiles = [
  {
    id: 'sample-1',
    full_name: 'Dr. Jennifer Walsh',
    title: 'Chief Technology Officer',
    location: 'San Francisco, CA',
    about: 'Technology leader with 15+ years building scalable products at Fortune 500 companies.',
    profile_picture_url: null,
    is_verified: true,
    verification_level: 'gold' as const,
    company: 'TechCorp Inc',
    experience_years: 15,
    skills: ['Leadership', 'Cloud Architecture', 'Team Management'],
    industry: 'Technology',
    created_at: new Date().toISOString()
  },
  {
    id: 'sample-2', 
    full_name: 'Mark Peterson',
    title: 'Senior Product Manager',
    location: 'New York, NY',
    about: 'Product strategist focused on user-centered design and data-driven decisions.',
    profile_picture_url: null,
    is_verified: true,
    verification_level: 'silver' as const,
    company: 'StartupHub',
    experience_years: 8,
    skills: ['Product Strategy', 'User Research', 'Agile'],
    industry: 'Technology',
    created_at: new Date().toISOString()
  }
];

export const sampleCommunities = [
  {
    id: 'sample-1',
    name: 'React Developers',
    description: 'A community for React developers to share knowledge, discuss best practices, and collaborate on projects.',
    category: 'Technology',
    member_count: 1247,
    is_private: false,
    is_featured: true,
    activity_level: 'high' as const,
    recent_activity: '2 hours ago',
    created_at: new Date().toISOString(),
    avatar_url: null
  },
  {
    id: 'sample-2',
    name: 'UI/UX Designers',
    description: 'Connect with fellow designers, share portfolios, get feedback, and stay updated with design trends.',
    category: 'Design', 
    member_count: 892,
    is_private: false,
    is_featured: false,
    activity_level: 'medium' as const,
    recent_activity: '1 day ago',
    created_at: new Date().toISOString(),
    avatar_url: null
  }
];