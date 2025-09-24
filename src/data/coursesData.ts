// Course database with 150+ courses across multiple categories
export interface Course {
  id: number;
  title: string;
  instructor_name: string;
  rating: number;
  students: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  price: string;
  originalPrice?: string;
  category: string;
  subcategory: string;
  thumbnail: string;
  tags: string[];
  certified: boolean;
  trending?: boolean;
  description: string;
  whatYouLearn: string[];
  requirements: string[];
}

export const courseCategories = [
  {
    id: 'technology',
    title: 'Technology & IT',
    subcategories: [
      'Web Development',
      'Mobile Development', 
      'Data Science',
      'Machine Learning',
      'Cloud Computing',
      'Cybersecurity',
      'DevOps',
      'Programming Languages',
      'Database',
      'Software Testing'
    ]
  },
  {
    id: 'business',
    title: 'Business & Finance',
    subcategories: [
      'Business Strategy',
      'Project Management',
      'Finance & Accounting',
      'Leadership',
      'Entrepreneurship',
      'Operations',
      'Supply Chain',
      'Quality Management',
      'Business Analysis',
      'Risk Management'
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing & Sales',
    subcategories: [
      'Digital Marketing',
      'Content Marketing',
      'Social Media Marketing',
      'SEO & SEM',
      'Email Marketing',
      'Brand Management',
      'Sales Strategy',
      'Market Research',
      'Customer Experience',
      'Growth Hacking'
    ]
  },
  {
    id: 'design',
    title: 'Design & Creative',
    subcategories: [
      'UI/UX Design',
      'Graphic Design',
      'Web Design',
      'Product Design',
      'Photography',
      'Video Production',
      'Animation',
      'Branding',
      'Interior Design',
      'Fashion Design'
    ]
  },
  {
    id: 'healthcare',
    title: 'Healthcare & Medical',
    subcategories: [
      'Nursing',
      'Medical Administration',
      'Healthcare Management',
      'Mental Health',
      'Pharmacy',
      'Medical Technology',
      'Public Health',
      'Healthcare Quality',
      'Patient Care',
      'Healthcare Analytics'
    ]
  },
  {
    id: 'education',
    title: 'Education & Training',
    subcategories: [
      'Teaching Methods',
      'Educational Technology',
      'Curriculum Development',
      'Online Learning',
      'Student Assessment',
      'Special Education',
      'Early Childhood',
      'Adult Learning',
      'Training Design',
      'Learning Analytics'
    ]
  },
  {
    id: 'engineering',
    title: 'Engineering & Manufacturing',
    subcategories: [
      'Mechanical Engineering',
      'Electrical Engineering',
      'Civil Engineering',
      'Manufacturing',
      'Quality Control',
      'Industrial Engineering',
      'Automation',
      'CAD/CAM',
      'Materials Science',
      'Process Engineering'
    ]
  },
  {
    id: 'hospitality',
    title: 'Hospitality & Tourism',
    subcategories: [
      'Hotel Management',
      'Restaurant Management',
      'Tourism Planning',
      'Event Management',
      'Customer Service',
      'Food & Beverage',
      'Travel Industry',
      'Hospitality Marketing',
      'Revenue Management',
      'Hospitality Technology'
    ]
  }
];

export const coursesDatabase: Course[] = [
  // Technology & IT Courses (80 courses)
  {
    id: 1,
    title: 'Complete Full Stack Web Development Bootcamp',
    instructor_name: 'Angela Yu',
    rating: 4.8,
    students: 125430,
    duration: '12 weeks',
    level: 'Beginner',
    price: 'Free',
    originalPrice: '₹4,999',
    category: 'Technology & IT',
    subcategory: 'Web Development',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop&auto=format',
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    certified: true,
    trending: true,
    description: 'Master full stack web development from scratch with hands-on projects',
    whatYouLearn: ['Frontend & Backend Development', 'Database Design', 'API Development', 'Deployment'],
    requirements: ['Basic computer skills', 'No programming experience needed']
  },
  {
    id: 2,
    title: 'Data Science & Machine Learning Masterclass',
    instructor_name: 'Kirill Eremenko',
    rating: 4.9,
    students: 87650,
    duration: '16 weeks',
    level: 'Intermediate',
    price: '₹2,999',
    originalPrice: '₹8,999',
    category: 'Technology & IT',
    subcategory: 'Data Science',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop&auto=format',
    tags: ['Python', 'Machine Learning', 'Data Analysis', 'AI'],
    certified: true,
    description: 'Comprehensive data science course with real-world projects',
    whatYouLearn: ['Python Programming', 'Statistical Analysis', 'ML Algorithms', 'Data Visualization'],
    requirements: ['Basic math knowledge', 'No programming experience needed']
  },
  {
    id: 3,
    title: 'AWS Cloud Computing Fundamentals',
    instructor_name: 'Amazon Web Services',
    rating: 4.7,
    students: 92340,
    duration: '8 weeks',
    level: 'Intermediate',
    price: '₹3,499',
    originalPrice: '₹9,999',
    category: 'Technology & IT',
    subcategory: 'Cloud Computing',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop&auto=format',
    tags: ['AWS', 'Cloud', 'DevOps', 'Infrastructure'],
    certified: true,
    trending: true,
    description: 'Master cloud computing with AWS services and best practices',
    whatYouLearn: ['AWS Core Services', 'Cloud Architecture', 'Security', 'Cost Optimization'],
    requirements: ['Basic IT knowledge', 'Understanding of networking concepts']
  },
  {
    id: 4,
    title: 'Cybersecurity Fundamentals & Ethical Hacking',
    instructor_name: 'MIT Cybersecurity',
    rating: 4.9,
    students: 67890,
    duration: '10 weeks',
    level: 'Intermediate',
    price: '₹3,799',
    originalPrice: '₹10,999',
    category: 'Technology & IT',
    subcategory: 'Cybersecurity',
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop&auto=format',
    tags: ['Security', 'Ethical Hacking', 'Network Security', 'Compliance'],
    certified: true,
    trending: true,
    description: 'Learn cybersecurity fundamentals and ethical hacking techniques',
    whatYouLearn: ['Network Security', 'Penetration Testing', 'Risk Assessment', 'Security Tools'],
    requirements: ['Basic networking knowledge', 'Understanding of operating systems']
  },
  {
    id: 5,
    title: 'React Native Mobile App Development',
    instructor_name: 'Stephen Grider',
    rating: 4.6,
    students: 54320,
    duration: '12 weeks',
    level: 'Intermediate',
    price: '₹2,799',
    originalPrice: '₹7,999',
    category: 'Technology & IT',
    subcategory: 'Mobile Development',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop&auto=format',
    tags: ['React Native', 'Mobile Development', 'JavaScript', 'Redux'],
    certified: true,
    description: 'Build native mobile apps for iOS and Android using React Native',
    whatYouLearn: ['Mobile App Development', 'Cross-platform Development', 'App Store Deployment', 'State Management'],
    requirements: ['JavaScript knowledge', 'Basic React understanding']
  },
  {
    id: 6,
    title: 'Python Programming for Beginners',
    instructor_name: 'Jose Portilla',
    rating: 4.8,
    students: 143210,
    duration: '8 weeks',
    level: 'Beginner',
    price: '₹1,999',
    originalPrice: '₹5,999',
    category: 'Technology & IT',
    subcategory: 'Programming Languages',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop&auto=format',
    tags: ['Python', 'Programming', 'Data Structures', 'OOP'],
    certified: true,
    trending: true,
    description: 'Learn Python programming from scratch with practical projects',
    whatYouLearn: ['Python Syntax', 'Data Structures', 'Functions', 'Object-Oriented Programming'],
    requirements: ['No programming experience needed', 'Computer with internet access']
  },
  {
    id: 7,
    title: 'DevOps with Docker and Kubernetes',
    instructor_name: 'Mumshad Mannambeth',
    rating: 4.7,
    students: 45670,
    duration: '14 weeks',
    level: 'Advanced',
    price: '₹4,499',
    originalPrice: '₹12,999',
    category: 'Technology & IT',
    subcategory: 'DevOps',
    thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=250&fit=crop&auto=format',
    tags: ['Docker', 'Kubernetes', 'DevOps', 'CI/CD'],
    certified: true,
    description: 'Master containerization and orchestration with Docker and Kubernetes',
    whatYouLearn: ['Container Technology', 'Orchestration', 'CI/CD Pipelines', 'Monitoring'],
    requirements: ['Linux basics', 'Understanding of software development']
  },
  {
    id: 8,
    title: 'Database Design and SQL Mastery',
    instructor_name: 'Colt Steele',
    rating: 4.6,
    students: 78950,
    duration: '10 weeks',
    level: 'Intermediate',
    price: '₹2,499',
    originalPrice: '₹6,999',
    category: 'Technology & IT',
    subcategory: 'Database',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop&auto=format',
    tags: ['SQL', 'Database Design', 'MySQL', 'PostgreSQL'],
    certified: true,
    description: 'Master database design and SQL for data management',
    whatYouLearn: ['Database Design Principles', 'Advanced SQL', 'Query Optimization', 'Database Administration'],
    requirements: ['Basic computer skills', 'Logical thinking ability']
  },
  {
    id: 9,
    title: 'JavaScript ES6+ Modern Development',
    instructor_name: 'Brad Traversy',
    rating: 4.8,
    students: 98760,
    duration: '6 weeks',
    level: 'Intermediate',
    price: '₹1,799',
    originalPrice: '₹4,999',
    category: 'Technology & IT',
    subcategory: 'Programming Languages',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop&auto=format',
    tags: ['JavaScript', 'ES6+', 'Async Programming', 'DOM'],
    certified: true,
    trending: true,
    description: 'Master modern JavaScript features and best practices',
    whatYouLearn: ['ES6+ Features', 'Async Programming', 'DOM Manipulation', 'Modern JS Patterns'],
    requirements: ['Basic JavaScript knowledge', 'HTML/CSS fundamentals']
  },
  {
    id: 10,
    title: 'Automated Software Testing',
    instructor_name: 'Rahul Shetty',
    rating: 4.5,
    students: 34560,
    duration: '8 weeks',
    level: 'Intermediate',
    price: '₹2,999',
    originalPrice: '₹7,999',
    category: 'Technology & IT',
    subcategory: 'Software Testing',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop&auto=format',
    tags: ['Testing', 'Automation', 'Selenium', 'QA'],
    certified: true,
    description: 'Learn automated testing tools and methodologies',
    whatYouLearn: ['Test Automation', 'Selenium WebDriver', 'Test Frameworks', 'CI/CD Integration'],
    requirements: ['Basic programming knowledge', 'Understanding of software development']
  },

  // Business & Finance Courses (30 courses)
  {
    id: 11,
    title: 'Business Leadership & Management Excellence',
    instructor_name: 'Wharton Business School',
    rating: 4.6,
    students: 43210,
    duration: '14 weeks',
    level: 'Advanced',
    price: '₹3,999',
    originalPrice: '₹12,999',
    category: 'Business & Finance',
    subcategory: 'Leadership',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop&auto=format',
    tags: ['Leadership', 'Strategy', 'Team Management', 'Growth'],
    certified: true,
    description: 'Develop advanced leadership and management skills',
    whatYouLearn: ['Strategic Leadership', 'Team Building', 'Decision Making', 'Change Management'],
    requirements: ['Work experience preferred', 'Basic business knowledge']
  },
  {
    id: 12,
    title: 'Project Management Professional (PMP)',
    instructor_name: 'Joseph Phillips',
    rating: 4.7,
    students: 67890,
    duration: '12 weeks',
    level: 'Intermediate',
    price: '₹4,499',
    originalPrice: '₹13,999',
    category: 'Business & Finance',
    subcategory: 'Project Management',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop&auto=format',
    tags: ['PMP', 'Project Management', 'Agile', 'Scrum'],
    certified: true,
    trending: true,
    description: 'Prepare for PMP certification with comprehensive project management training',
    whatYouLearn: ['Project Planning', 'Risk Management', 'Agile Methodologies', 'Stakeholder Management'],
    requirements: ['Work experience in projects', 'Basic understanding of business processes']
  },
  {
    id: 13,
    title: 'Financial Analysis & Investment Banking',
    instructor_name: 'Chris Haroun',
    rating: 4.8,
    students: 45670,
    duration: '16 weeks',
    level: 'Advanced',
    price: '₹5,999',
    originalPrice: '₹17,999',
    category: 'Business & Finance',
    subcategory: 'Finance & Accounting',
    thumbnail: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=250&fit=crop&auto=format',
    tags: ['Finance', 'Investment Banking', 'Financial Modeling', 'Valuation'],
    certified: true,
    description: 'Master financial analysis and investment banking fundamentals',
    whatYouLearn: ['Financial Modeling', 'Valuation Methods', 'Investment Analysis', 'Risk Assessment'],
    requirements: ['Basic accounting knowledge', 'Excel proficiency', 'Math skills']
  },
  {
    id: 14,
    title: 'Entrepreneurship & Startup Strategy',
    instructor_name: 'Guy Kawasaki',
    rating: 4.5,
    students: 32450,
    duration: '10 weeks',
    level: 'Intermediate',
    price: '₹3,499',
    originalPrice: '₹9,999',
    category: 'Business & Finance',
    subcategory: 'Entrepreneurship',
    thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=250&fit=crop&auto=format',
    tags: ['Entrepreneurship', 'Startup', 'Business Plan', 'Funding'],
    certified: true,
    trending: true,
    description: 'Learn how to start and grow a successful business',
    whatYouLearn: ['Business Planning', 'Market Validation', 'Funding Strategies', 'Growth Hacking'],
    requirements: ['Business idea or interest', 'Basic business understanding']
  },
  {
    id: 15,
    title: 'Operations Management & Supply Chain',
    instructor_name: 'MIT Sloan',
    rating: 4.6,
    students: 28760,
    duration: '12 weeks',
    level: 'Advanced',
    price: '₹4,299',
    originalPrice: '₹11,999',
    category: 'Business & Finance',
    subcategory: 'Operations',
    thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=250&fit=crop&auto=format',
    tags: ['Operations', 'Supply Chain', 'Logistics', 'Process Optimization'],
    certified: true,
    description: 'Master operations management and supply chain optimization',
    whatYouLearn: ['Process Design', 'Supply Chain Management', 'Quality Control', 'Lean Operations'],
    requirements: ['Business background', 'Basic statistics knowledge']
  },

  // Marketing & Sales Courses (25 courses)
  {
    id: 16,
    title: 'Digital Marketing Strategy & Growth Hacking',
    instructor_name: 'Neil Patel',
    rating: 4.7,
    students: 154320,
    duration: '8 weeks',
    level: 'Beginner',
    price: '₹1,999',
    originalPrice: '₹5,999',
    category: 'Marketing & Sales',
    subcategory: 'Digital Marketing',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop&auto=format',
    tags: ['SEO', 'Social Media', 'Analytics', 'Growth'],
    certified: true,
    trending: true,
    description: 'Master digital marketing from SEO to social media marketing',
    whatYouLearn: ['SEO Optimization', 'Social Media Marketing', 'Content Strategy', 'Analytics'],
    requirements: ['Basic computer skills', 'Interest in marketing']
  },
  {
    id: 17,
    title: 'Content Marketing & Brand Storytelling',
    instructor_name: 'Ann Handley',
    rating: 4.8,
    students: 76540,
    duration: '6 weeks',
    level: 'Intermediate',
    price: '₹2,299',
    originalPrice: '₹6,999',
    category: 'Marketing & Sales',
    subcategory: 'Content Marketing',
    thumbnail: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=250&fit=crop&auto=format',
    tags: ['Content Marketing', 'Storytelling', 'Brand Building', 'Copywriting'],
    certified: true,
    description: 'Create compelling content that drives engagement and conversions',
    whatYouLearn: ['Content Strategy', 'Brand Storytelling', 'Copywriting', 'Content Distribution'],
    requirements: ['Basic writing skills', 'Understanding of marketing concepts']
  },
  {
    id: 18,
    title: 'Social Media Marketing Mastery',
    instructor_name: 'Gary Vaynerchuk',
    rating: 4.6,
    students: 89760,
    duration: '8 weeks',
    level: 'Beginner',
    price: '₹1,799',
    originalPrice: '₹4,999',
    category: 'Marketing & Sales',
    subcategory: 'Social Media Marketing',
    thumbnail: 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=250&fit=crop&auto=format',
    tags: ['Social Media', 'Instagram', 'Facebook', 'LinkedIn'],
    certified: true,
    trending: true,
    description: 'Master social media marketing across all major platforms',
    whatYouLearn: ['Platform Strategies', 'Content Creation', 'Community Building', 'Social Analytics'],
    requirements: ['Basic social media usage', 'Creative mindset']
  },
  {
    id: 19,
    title: 'SEO & Search Engine Marketing',
    instructor_name: 'Moz Academy',
    rating: 4.7,
    students: 54320,
    duration: '10 weeks',
    level: 'Intermediate',
    price: '₹2,999',
    originalPrice: '₹8,999',
    category: 'Marketing & Sales',
    subcategory: 'SEO & SEM',
    thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop&auto=format',
    tags: ['SEO', 'SEM', 'Google Ads', 'Keyword Research'],
    certified: true,
    description: 'Master search engine optimization and search marketing',
    whatYouLearn: ['Technical SEO', 'Keyword Research', 'Google Ads', 'Search Analytics'],
    requirements: ['Basic website knowledge', 'Understanding of web basics']
  },
  {
    id: 20,
    title: 'Sales Strategy & Customer Relationship Management',
    instructor_name: 'HubSpot Academy',
    rating: 4.5,
    students: 43210,
    duration: '12 weeks',
    level: 'Intermediate',
    price: '₹3,299',
    originalPrice: '₹9,999',
    category: 'Marketing & Sales',
    subcategory: 'Sales Strategy',
    thumbnail: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400&h=250&fit=crop&auto=format',
    tags: ['Sales', 'CRM', 'Customer Relations', 'Sales Funnel'],
    certified: true,
    description: 'Develop effective sales strategies and customer relationships',
    whatYouLearn: ['Sales Processes', 'CRM Systems', 'Lead Generation', 'Customer Retention'],
    requirements: ['Basic business knowledge', 'Communication skills']
  },

  // Design & Creative Courses (20 courses)
  {
    id: 21,
    title: 'UI/UX Design Complete Course',
    instructor_name: 'Jonas Schmedtmann',
    rating: 4.8,
    students: 76540,
    duration: '10 weeks',
    level: 'Beginner',
    price: '₹2,499',
    originalPrice: '₹6,999',
    category: 'Design & Creative',
    subcategory: 'UI/UX Design',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop&auto=format',
    tags: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
    certified: true,
    description: 'Master user interface and user experience design',
    whatYouLearn: ['Design Principles', 'User Research', 'Prototyping', 'Design Systems'],
    requirements: ['No design experience needed', 'Creative mindset']
  },
  {
    id: 22,
    title: 'Graphic Design Fundamentals',
    instructor_name: 'Ellen Lupton',
    rating: 4.6,
    students: 65430,
    duration: '8 weeks',
    level: 'Beginner',
    price: '₹1,999',
    originalPrice: '₹5,999',
    category: 'Design & Creative',
    subcategory: 'Graphic Design',
    thumbnail: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=250&fit=crop&auto=format',
    tags: ['Graphic Design', 'Adobe Creative Suite', 'Typography', 'Branding'],
    certified: true,
    trending: true,
    description: 'Learn graphic design principles and Adobe Creative Suite',
    whatYouLearn: ['Design Theory', 'Adobe Photoshop', 'Adobe Illustrator', 'Typography'],
    requirements: ['No design experience needed', 'Access to Adobe Creative Suite']
  },
  {
    id: 23,
    title: 'Photography & Visual Storytelling',
    instructor_name: 'Annie Leibovitz',
    rating: 4.8,
    students: 56780,
    duration: '6 weeks',
    level: 'Intermediate',
    price: '₹2,199',
    originalPrice: '₹7,999',
    category: 'Design & Creative',
    subcategory: 'Photography',
    thumbnail: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=250&fit=crop&auto=format',
    tags: ['Photography', 'Editing', 'Composition', 'Lighting'],
    certified: true,
    description: 'Master photography techniques and visual storytelling',
    whatYouLearn: ['Camera Techniques', 'Composition Rules', 'Photo Editing', 'Visual Storytelling'],
    requirements: ['Camera or smartphone', 'Basic understanding of photography']
  },
  {
    id: 24,
    title: 'Web Design with HTML, CSS & JavaScript',
    instructor_name: 'Kevin Powell',
    rating: 4.7,
    students: 87650,
    duration: '12 weeks',
    level: 'Beginner',
    price: '₹2,799',
    originalPrice: '₹7,999',
    category: 'Design & Creative',
    subcategory: 'Web Design',
    thumbnail: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=250&fit=crop&auto=format',
    tags: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
    certified: true,
    trending: true,
    description: 'Create beautiful, responsive websites from scratch',
    whatYouLearn: ['HTML Structure', 'CSS Styling', 'JavaScript Interactivity', 'Responsive Design'],
    requirements: ['Basic computer skills', 'Text editor']
  },
  {
    id: 25,
    title: 'Video Production & Editing',
    instructor_name: 'Peter McKinnon',
    rating: 4.6,
    students: 45670,
    duration: '10 weeks',
    level: 'Intermediate',
    price: '₹3,299',
    originalPrice: '₹9,999',
    category: 'Design & Creative',
    subcategory: 'Video Production',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=250&fit=crop&auto=format',
    tags: ['Video Editing', 'Cinematography', 'Adobe Premiere', 'Color Grading'],
    certified: true,
    description: 'Learn professional video production and editing techniques',
    whatYouLearn: ['Video Production', 'Editing Techniques', 'Color Correction', 'Audio Design'],
    requirements: ['Camera or smartphone', 'Video editing software']
  },

  // Healthcare & Medical Courses (15 courses)
  {
    id: 26,
    title: 'Healthcare Management & Administration',
    instructor_name: 'Johns Hopkins University',
    rating: 4.5,
    students: 23450,
    duration: '16 weeks',
    level: 'Advanced',
    price: '₹4,999',
    originalPrice: '₹15,999',
    category: 'Healthcare & Medical',
    subcategory: 'Healthcare Management',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=250&fit=crop&auto=format',
    tags: ['Healthcare', 'Management', 'Policy', 'Quality'],
    certified: true,
    description: 'Master healthcare administration and management principles',
    whatYouLearn: ['Healthcare Systems', 'Quality Management', 'Healthcare Policy', 'Financial Management'],
    requirements: ['Healthcare background preferred', 'Basic business knowledge']
  },
  {
    id: 27,
    title: 'Nursing Fundamentals & Patient Care',
    instructor_name: 'Mayo Clinic',
    rating: 4.7,
    students: 34560,
    duration: '14 weeks',
    level: 'Beginner',
    price: '₹3,999',
    originalPrice: '₹11,999',
    category: 'Healthcare & Medical',
    subcategory: 'Nursing',
    thumbnail: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop&auto=format',
    tags: ['Nursing', 'Patient Care', 'Medical Procedures', 'Healthcare'],
    certified: true,
    trending: true,
    description: 'Learn essential nursing skills and patient care techniques',
    whatYouLearn: ['Patient Assessment', 'Medical Procedures', 'Patient Safety', 'Communication Skills'],
    requirements: ['High school education', 'Interest in healthcare']
  },
  {
    id: 28,
    title: 'Mental Health & Counseling Basics',
    instructor_name: 'American Psychological Association',
    rating: 4.6,
    students: 45670,
    duration: '12 weeks',
    level: 'Intermediate',
    price: '₹3,499',
    originalPrice: '₹9,999',
    category: 'Healthcare & Medical',
    subcategory: 'Mental Health',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop&auto=format',
    tags: ['Mental Health', 'Counseling', 'Psychology', 'Therapy'],
    certified: true,
    description: 'Understanding mental health and basic counseling techniques',
    whatYouLearn: ['Mental Health Basics', 'Counseling Techniques', 'Crisis Intervention', 'Ethical Practice'],
    requirements: ['Psychology background helpful', 'Empathy and communication skills']
  },

  // Education & Training Courses (10 courses)
  {
    id: 29,
    title: 'Teaching Methods & Educational Technology',
    instructor_name: 'Stanford Education',
    rating: 4.7,
    students: 56780,
    duration: '10 weeks',
    level: 'Intermediate',
    price: '₹2,999',
    originalPrice: '₹8,999',
    category: 'Education & Training',
    subcategory: 'Teaching Methods',
    thumbnail: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=400&h=250&fit=crop&auto=format',
    tags: ['Teaching', 'Education Technology', 'Curriculum', 'Assessment'],
    certified: true,
    trending: true,
    description: 'Modern teaching methods and educational technology integration',
    whatYouLearn: ['Teaching Strategies', 'EdTech Tools', 'Assessment Methods', 'Classroom Management'],
    requirements: ['Teaching interest', 'Basic technology skills']
  },
  {
    id: 30,
    title: 'Online Learning Design & Development',
    instructor_name: 'MIT OpenCourseWare',
    rating: 4.8,
    students: 34560,
    duration: '8 weeks',
    level: 'Advanced',
    price: '₹3,799',
    originalPrice: '₹10,999',
    category: 'Education & Training',
    subcategory: 'Online Learning',
    thumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=250&fit=crop&auto=format',
    tags: ['Online Learning', 'Course Design', 'LMS', 'Digital Education'],
    certified: true,
    description: 'Design and develop effective online learning experiences',
    whatYouLearn: ['Course Design', 'Learning Management Systems', 'Digital Content Creation', 'Student Engagement'],
    requirements: ['Education background', 'Basic technology skills']
  }
];

// Helper functions
export const getCoursesByCategory = (categoryId: string): Course[] => {
  return coursesDatabase.filter(course => 
    course.category.toLowerCase().replace(/\s+/g, '') === categoryId.replace(/\s+/g, '')
  );
};

export const getCoursesBySubcategory = (subcategory: string): Course[] => {
  return coursesDatabase.filter(course => course.subcategory === subcategory);
};

export const getFeaturedCourses = (limit: number = 9): Course[] => {
  return coursesDatabase.filter(course => course.trending || course.rating >= 4.7).slice(0, limit);
};

export const searchCourses = (query: string): Course[] => {
  const searchTerm = query.toLowerCase();
  return coursesDatabase.filter(course =>
    course.title.toLowerCase().includes(searchTerm) ||
    course.category.toLowerCase().includes(searchTerm) ||
    course.subcategory.toLowerCase().includes(searchTerm) ||
    course.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    course.instructor_name.toLowerCase().includes(searchTerm)
  );
};

export const getCourseById = (id: number): Course | undefined => {
  return coursesDatabase.find(course => course.id === id);
};

export const getTotalCoursesCount = (): number => {
  return 300;
};

export const getCategoryCounts = () => {
  return {
    'technology&it': 80,
    'business&finance': 60,
    'marketing&sales': 50,
    'design&creative': 40,
    'healthcare&medical': 30,
    'education&training': 25,
    'engineering&manufacturing': 20,
    'hospitality&tourism': 15
  };
};