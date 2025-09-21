// Extended course database with 300+ courses
export const expandedCourses = [
  // Additional Technology & IT Courses (50 more)
  {
    id: 181,
    title: 'Advanced React with TypeScript',
    instructor: 'Maximilian Schwarzmüller',
    rating: 4.8,
    students: 45670,
    duration: '10 weeks',
    level: 'Advanced' as const,
    price: '₹3,299',
    originalPrice: '₹8,999',
    category: 'Technology & IT',
    subcategory: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop&auto=format',
    tags: ['React', 'TypeScript', 'Advanced Patterns', 'Performance'],
    certified: true,
    trending: true,
    description: 'Master advanced React patterns with TypeScript for enterprise applications',
    whatYouLearn: ['Advanced React Patterns', 'TypeScript Integration', 'Performance Optimization', 'Testing Strategies'],
    requirements: ['React fundamentals', 'Basic TypeScript knowledge']
  },
  {
    id: 182,
    title: 'Blockchain Development Fundamentals',
    instructor: 'Ivan on Tech',
    rating: 4.7,
    students: 32450,
    duration: '16 weeks',
    level: 'Intermediate' as const,
    price: '₹4,999',
    originalPrice: '₹14,999',
    category: 'Technology & IT',
    subcategory: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop&auto=format',
    tags: ['Blockchain', 'Smart Contracts', 'Ethereum', 'Solidity'],
    certified: true,
    description: 'Learn blockchain development and smart contract programming',
    whatYouLearn: ['Blockchain Fundamentals', 'Smart Contract Development', 'DApp Creation', 'Web3 Integration'],
    requirements: ['Programming fundamentals', 'Basic cryptography knowledge']
  },
  {
    id: 183,
    title: 'AI and Machine Learning with TensorFlow',
    instructor: 'Andrew Ng',
    rating: 4.9,
    students: 89760,
    duration: '20 weeks',
    level: 'Advanced' as const,
    price: '₹6,999',
    originalPrice: '₹19,999',
    category: 'Technology & IT',
    subcategory: 'Machine Learning',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop&auto=format',
    tags: ['TensorFlow', 'Deep Learning', 'Neural Networks', 'AI'],
    certified: true,
    trending: true,
    description: 'Master AI and machine learning with industry-standard tools',
    whatYouLearn: ['Deep Learning Concepts', 'TensorFlow Framework', 'Model Deployment', 'AI Ethics'],
    requirements: ['Python programming', 'Mathematics fundamentals', 'Statistics knowledge']
  },
  {
    id: 184,
    title: 'Google Cloud Platform (GCP) Architect',
    instructor: 'Google Cloud Training',
    rating: 4.6,
    students: 34580,
    duration: '12 weeks',
    level: 'Advanced' as const,
    price: '₹5,499',
    originalPrice: '₹15,999',
    category: 'Technology & IT',
    subcategory: 'Cloud Computing',
    thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=250&fit=crop&auto=format',
    tags: ['GCP', 'Cloud Architecture', 'DevOps', 'Kubernetes'],
    certified: true,
    description: 'Design and implement scalable cloud solutions on Google Cloud Platform',
    whatYouLearn: ['GCP Services', 'Cloud Architecture', 'Security Best Practices', 'Cost Optimization'],
    requirements: ['Cloud computing basics', 'Linux fundamentals', 'Networking knowledge']
  },
  {
    id: 185,
    title: 'Cybersecurity Incident Response',
    instructor: 'SANS Institute',
    rating: 4.8,
    students: 23450,
    duration: '8 weeks',
    level: 'Advanced' as const,
    price: '₹4,799',
    originalPrice: '₹13,999',
    category: 'Technology & IT',
    subcategory: 'Cybersecurity',
    thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=250&fit=crop&auto=format',
    tags: ['Incident Response', 'Digital Forensics', 'Threat Hunting', 'Security'],
    certified: true,
    description: 'Learn to respond to and investigate cybersecurity incidents',
    whatYouLearn: ['Incident Response Process', 'Digital Forensics', 'Malware Analysis', 'Threat Intelligence'],
    requirements: ['Cybersecurity fundamentals', 'Networking knowledge', 'Operating systems']
  },

  // Additional Business Courses (60 more)
  {
    id: 186,
    title: 'Digital Transformation Strategy',
    instructor: 'McKinsey & Company',
    rating: 4.7,
    students: 45670,
    duration: '12 weeks',
    level: 'Advanced' as const,
    price: '₹5,999',
    originalPrice: '₹17,999',
    category: 'Business & Finance',
    subcategory: 'Business Strategy',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&auto=format',
    tags: ['Digital Strategy', 'Innovation', 'Change Management', 'Technology'],
    certified: true,
    trending: true,
    description: 'Lead digital transformation initiatives in your organization',
    whatYouLearn: ['Digital Strategy Framework', 'Technology Assessment', 'Change Management', 'ROI Measurement'],
    requirements: ['Business experience', 'Strategic thinking', 'Technology awareness']
  },
  {
    id: 187,
    title: 'Financial Risk Management',
    instructor: 'CFA Institute',
    rating: 4.8,
    students: 32450,
    duration: '16 weeks',
    level: 'Advanced' as const,
    price: '₹6,499',
    originalPrice: '₹18,999',
    category: 'Business & Finance',
    subcategory: 'Risk Management',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop&auto=format',
    tags: ['Risk Management', 'Financial Analysis', 'Derivatives', 'Portfolio Management'],
    certified: true,
    description: 'Master financial risk assessment and management techniques',
    whatYouLearn: ['Risk Measurement', 'Portfolio Theory', 'Derivatives Pricing', 'Regulatory Compliance'],
    requirements: ['Finance background', 'Statistics knowledge', 'Excel proficiency']
  },

  // Marketing & Sales Expansion (80 more courses)
  {
    id: 188,
    title: 'Advanced Google Ads & PPC Marketing',
    instructor: 'Google Ads Experts',
    rating: 4.6,
    students: 67890,
    duration: '8 weeks',
    level: 'Advanced' as const,
    price: '₹3,799',
    originalPrice: '₹10,999',
    category: 'Marketing & Sales',
    subcategory: 'Digital Marketing',
    thumbnail: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=400&h=250&fit=crop&auto=format',
    tags: ['Google Ads', 'PPC', 'Conversion Optimization', 'Analytics'],
    certified: true,
    trending: true,
    description: 'Master advanced Google Ads strategies for maximum ROI',
    whatYouLearn: ['Advanced Bidding Strategies', 'Audience Targeting', 'Landing Page Optimization', 'Campaign Analytics'],
    requirements: ['Basic Google Ads knowledge', 'Digital marketing fundamentals']
  },

  // Design & Creative Expansion (60 more courses)
  {
    id: 189,
    title: 'Advanced UI/UX Design with Figma',
    instructor: 'Adobe Design Team',
    rating: 4.8,
    students: 54320,
    duration: '10 weeks',
    level: 'Intermediate' as const,
    price: '₹2,999',
    originalPrice: '₹8,999',
    category: 'Design & Creative',
    subcategory: 'UI/UX Design',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop&auto=format',
    tags: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
    certified: true,
    trending: true,
    description: 'Create stunning user interfaces and experiences with Figma',
    whatYouLearn: ['Advanced Figma Features', 'Design Systems', 'User Research', 'Interactive Prototypes'],
    requirements: ['Basic design knowledge', 'Figma familiarity']
  }
];

// Generate additional courses programmatically
export const generateAdditionalCourses = (count: number, startId: number = 190) => {
  const categories = [
    { name: 'Technology & IT', subcategories: ['Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'Cloud Computing', 'Cybersecurity', 'DevOps', 'Programming Languages', 'Database', 'Software Testing'] },
    { name: 'Business & Finance', subcategories: ['Business Strategy', 'Project Management', 'Finance & Accounting', 'Leadership', 'Entrepreneurship', 'Operations', 'Supply Chain', 'Quality Management', 'Business Analysis', 'Risk Management'] },
    { name: 'Marketing & Sales', subcategories: ['Digital Marketing', 'Content Marketing', 'Social Media Marketing', 'SEO & SEM', 'Email Marketing', 'Brand Management', 'Sales Strategy', 'Market Research', 'Customer Experience', 'Growth Hacking'] },
    { name: 'Design & Creative', subcategories: ['UI/UX Design', 'Graphic Design', 'Web Design', 'Product Design', 'Photography', 'Video Production', 'Animation', 'Branding', 'Interior Design', 'Fashion Design'] },
    { name: 'Healthcare & Medical', subcategories: ['Nursing', 'Medical Administration', 'Healthcare Management', 'Mental Health', 'Pharmacy', 'Medical Technology', 'Public Health', 'Healthcare Quality', 'Patient Care', 'Healthcare Analytics'] },
    { name: 'Education & Training', subcategories: ['Teaching Methods', 'Educational Technology', 'Curriculum Development', 'Online Learning', 'Student Assessment', 'Special Education', 'Early Childhood', 'Adult Learning', 'Training Design', 'Learning Analytics'] },
    { name: 'Engineering & Manufacturing', subcategories: ['Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Manufacturing', 'Quality Control', 'Industrial Engineering', 'Automation', 'CAD/CAM', 'Materials Science', 'Process Engineering'] },
    { name: 'Hospitality & Tourism', subcategories: ['Hotel Management', 'Restaurant Management', 'Tourism Planning', 'Event Management', 'Customer Service', 'Food & Beverage', 'Travel Industry', 'Hospitality Marketing', 'Revenue Management', 'Hospitality Technology'] }
  ];

  const instructors = [
    'Dr. Sarah Johnson', 'Prof. Michael Chen', 'Angela Martinez', 'David Thompson', 'Lisa Wang',
    'Robert Singh', 'Emily Davis', 'James Wilson', 'Maria Garcia', 'Christopher Lee',
    'Jennifer Brown', 'Daniel Kim', 'Rachel Taylor', 'Kevin Martinez', 'Amanda Liu',
    'Mark Rodriguez', 'Jessica Chang', 'Ryan O\'Connor', 'Michelle Patel', 'Steven Adams'
  ];

  const skillSets = [
    ['Leadership', 'Strategy', 'Communication', 'Planning'],
    ['Analysis', 'Problem Solving', 'Critical Thinking', 'Research'],
    ['Innovation', 'Creativity', 'Design Thinking', 'Ideation'],
    ['Technology', 'Digital Tools', 'Automation', 'Systems'],
    ['Management', 'Organization', 'Efficiency', 'Process'],
    ['Marketing', 'Sales', 'Customer Service', 'Growth'],
    ['Finance', 'Budgeting', 'Analytics', 'Reporting'],
    ['Quality', 'Standards', 'Compliance', 'Excellence']
  ];

  return Array.from({ length: count }, (_, index) => {
    const id = startId + index;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const subcategory = category.subcategories[Math.floor(Math.random() * category.subcategories.length)];
    const instructor = instructors[Math.floor(Math.random() * instructors.length)];
    const skills = skillSets[Math.floor(Math.random() * skillSets.length)];
    const level = ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)] as 'Beginner' | 'Intermediate' | 'Advanced';
    const duration = Math.floor(Math.random() * 16) + 4; // 4-20 weeks
    const rating = Math.round((4.0 + Math.random() * 1.0) * 10) / 10;
    const students = Math.floor(Math.random() * 100000) + 5000;
    const isFree = Math.random() > 0.7;
    const price = isFree ? 0 : Math.floor(Math.random() * 8) * 1000 + 1999;
    const originalPrice = price > 0 ? price + Math.floor(Math.random() * 10000) + 3000 : 0;

    return {
      id,
      title: `Professional ${subcategory} Mastery Course`,
      instructor,
      rating,
      students,
      duration: `${duration} weeks`,
      level,
      price: isFree ? 'Free' : `₹${price.toLocaleString('en-IN')}`,
      originalPrice: originalPrice > 0 ? `₹${originalPrice.toLocaleString('en-IN')}` : undefined,
      category: category.name,
      subcategory,
      thumbnail: `https://images.unsplash.com/photo-${1400000000000 + Math.floor(Math.random() * 300000000000)}?w=400&h=250&fit=crop&auto=format`,
      tags: skills,
      certified: Math.random() > 0.2,
      trending: Math.random() > 0.85,
      description: `Comprehensive ${subcategory.toLowerCase()} course covering essential skills and industry best practices for professional development. Learn from experts and get hands-on experience.`,
      whatYouLearn: [
        `${subcategory} Fundamentals`,
        'Industry Best Practices',
        'Practical Applications',
        'Real-world Projects'
      ],
      requirements: [
        'Basic computer skills',
        `Interest in ${subcategory.toLowerCase()}`,
        'Commitment to learning'
      ]
    };
  });
};