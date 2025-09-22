import { supabase } from '@/integrations/supabase/client';

interface CourseTemplate {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  instructor: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  price: number;
  skills: string[];
  tags: string[];
}

const courseTemplates: CourseTemplate[] = [
  // Technology Courses (200 variations)
  {
    title: 'Complete JavaScript Mastery',
    description: 'Master JavaScript from basics to advanced concepts including ES6+, DOM manipulation, and async programming',
    category: 'Technology',
    subcategory: 'Programming',
    instructor: 'Tech Expert',
    difficulty: 'beginner',
    duration_hours: 40,
    price: 2999,
    skills: ['JavaScript', 'ES6+', 'DOM', 'Async Programming'],
    tags: ['frontend', 'programming', 'web development']
  },
  {
    title: 'Advanced React Development',
    description: 'Build modern web applications with React, Redux, and modern development practices',
    category: 'Technology',
    subcategory: 'Frontend Development',
    instructor: 'React Master',
    difficulty: 'intermediate',
    duration_hours: 35,
    price: 3999,
    skills: ['React', 'Redux', 'JSX', 'Component Architecture'],
    tags: ['react', 'frontend', 'javascript']
  },
  {
    title: 'Node.js Backend Development',
    description: 'Create scalable backend applications with Node.js, Express, and databases',
    category: 'Technology',
    subcategory: 'Backend Development',
    instructor: 'Backend Guru',
    difficulty: 'intermediate',
    duration_hours: 45,
    price: 4499,
    skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
    tags: ['backend', 'nodejs', 'api development']
  },
  {
    title: 'Python Data Science Bootcamp',
    description: 'Learn data analysis, visualization, and machine learning with Python',
    category: 'Technology',
    subcategory: 'Data Science',
    instructor: 'Data Scientist',
    difficulty: 'beginner',
    duration_hours: 60,
    price: 5999,
    skills: ['Python', 'Pandas', 'NumPy', 'Machine Learning'],
    tags: ['python', 'data science', 'machine learning']
  },
  {
    title: 'Cloud Computing with AWS',
    description: 'Master Amazon Web Services and cloud computing fundamentals',
    category: 'Technology',
    subcategory: 'Cloud Computing',
    instructor: 'Cloud Expert',
    difficulty: 'intermediate',
    duration_hours: 50,
    price: 6999,
    skills: ['AWS', 'EC2', 'S3', 'Lambda', 'Cloud Architecture'],
    tags: ['cloud', 'aws', 'devops']
  },
  
  // Business Courses (100 variations)
  {
    title: 'Digital Marketing Strategy',
    description: 'Comprehensive digital marketing from SEO to social media and paid advertising',
    category: 'Business',
    subcategory: 'Marketing',
    instructor: 'Marketing Pro',
    difficulty: 'beginner',
    duration_hours: 30,
    price: 2499,
    skills: ['SEO', 'Social Media Marketing', 'Google Ads', 'Analytics'],
    tags: ['marketing', 'digital marketing', 'seo']
  },
  {
    title: 'Project Management Professional',
    description: 'Learn project management methodologies including Agile and Scrum',
    category: 'Business',
    subcategory: 'Project Management',
    instructor: 'PM Expert',
    difficulty: 'intermediate',
    duration_hours: 40,
    price: 4999,
    skills: ['Project Management', 'Agile', 'Scrum', 'Risk Management'],
    tags: ['project management', 'agile', 'business']
  },
  {
    title: 'Business Analytics & Intelligence',
    description: 'Transform data into actionable business insights using modern analytics tools',
    category: 'Business',
    subcategory: 'Analytics',
    instructor: 'Analytics Expert',
    difficulty: 'intermediate',
    duration_hours: 35,
    price: 3499,
    skills: ['Business Intelligence', 'Data Analysis', 'Tableau', 'Power BI'],
    tags: ['analytics', 'business intelligence', 'data']
  },
  
  // Design Courses (80 variations)
  {
    title: 'UI/UX Design Fundamentals',
    description: 'Learn user interface and user experience design principles and tools',
    category: 'Design',
    subcategory: 'UI/UX Design',
    instructor: 'Design Master',
    difficulty: 'beginner',
    duration_hours: 25,
    price: 1999,
    skills: ['UI Design', 'UX Design', 'Figma', 'Prototyping'],
    tags: ['design', 'ui', 'ux', 'figma']
  },
  {
    title: 'Graphic Design Mastery',
    description: 'Create stunning visual designs using Adobe Creative Suite',
    category: 'Design',
    subcategory: 'Graphic Design',
    instructor: 'Creative Designer',
    difficulty: 'beginner',
    duration_hours: 30,
    price: 2299,
    skills: ['Photoshop', 'Illustrator', 'InDesign', 'Brand Design'],
    tags: ['graphic design', 'adobe', 'creative']
  },
  
  // Healthcare Courses (50 variations)
  {
    title: 'Healthcare Management Essentials',
    description: 'Learn healthcare administration, policy, and quality management',
    category: 'Healthcare',
    subcategory: 'Healthcare Management',
    instructor: 'Healthcare Admin',
    difficulty: 'intermediate',
    duration_hours: 35,
    price: 3999,
    skills: ['Healthcare Policy', 'Quality Management', 'Patient Care', 'Compliance'],
    tags: ['healthcare', 'management', 'administration']
  },
  {
    title: 'Medical Coding & Billing',
    description: 'Master medical coding standards and healthcare billing processes',
    category: 'Healthcare',
    subcategory: 'Medical Administration',
    instructor: 'Medical Coder',
    difficulty: 'beginner',
    duration_hours: 40,
    price: 2999,
    skills: ['ICD-10', 'CPT Coding', 'Medical Billing', 'HIPAA'],
    tags: ['medical coding', 'healthcare', 'billing']
  },
  
  // Education Courses (40 variations)
  {
    title: 'Online Teaching Excellence',
    description: 'Develop effective online teaching strategies and digital pedagogy',
    category: 'Education',
    subcategory: 'Online Learning',
    instructor: 'Education Expert',
    difficulty: 'intermediate',
    duration_hours: 25,
    price: 1999,
    skills: ['Online Teaching', 'Digital Pedagogy', 'LMS', 'Student Engagement'],
    tags: ['education', 'teaching', 'online learning']
  },
  {
    title: 'Curriculum Design & Development',
    description: 'Design effective learning curricula and assessment strategies',
    category: 'Education',
    subcategory: 'Curriculum Development',
    instructor: 'Curriculum Designer',
    difficulty: 'advanced',
    duration_hours: 30,
    price: 2499,
    skills: ['Curriculum Design', 'Learning Objectives', 'Assessment', 'Instructional Design'],
    tags: ['curriculum', 'education', 'instructional design']
  },
  
  // Finance Courses (30 variations)
  {
    title: 'Financial Planning & Analysis',
    description: 'Master financial modeling, budgeting, and investment analysis',
    category: 'Finance',
    subcategory: 'Financial Analysis',
    instructor: 'Finance Professional',
    difficulty: 'intermediate',
    duration_hours: 45,
    price: 4999,
    skills: ['Financial Modeling', 'Investment Analysis', 'Budgeting', 'Risk Management'],
    tags: ['finance', 'investment', 'analysis']
  }
];

const variations = [
  'Fundamentals', 'Advanced', 'Complete', 'Mastery', 'Professional', 'Expert',
  'Bootcamp', 'Intensive', 'Comprehensive', 'Essential', 'Ultimate', 'Complete Guide',
  'Practical', 'Applied', 'Real-World', 'Industry-Ready', 'Certification', 'Specialization'
];

const instructorPrefixes = [
  'Dr.', 'Prof.', 'Expert', 'Senior', 'Lead', 'Principal', 'Master', 'Certified'
];

const instructorNames = [
  'Sarah Johnson', 'Michael Chen', 'David Rodriguez', 'Emily Davis', 'James Wilson',
  'Lisa Thompson', 'Robert Garcia', 'Jennifer Lee', 'Christopher Brown', 'Amanda Miller',
  'Daniel Anderson', 'Jessica Taylor', 'Matthew Martinez', 'Ashley White', 'Ryan Jackson',
  'Nicole Harris', 'Kevin Martin', 'Stephanie Clark', 'Brandon Lewis', 'Megan Walker'
];

export const generateMassiveCourseDatabase = async () => {
  const courses = [];
  let courseId = 1;

  // Generate variations for each template
  for (const template of courseTemplates) {
    for (let i = 0; i < 15; i++) { // 15 variations per template
      for (const variation of variations.slice(0, 3)) { // 3 variation types per iteration
        const instructor = `${instructorPrefixes[Math.floor(Math.random() * instructorPrefixes.length)]} ${
          instructorNames[Math.floor(Math.random() * instructorNames.length)]
        }`;

        const priceVariation = 1 + (Math.random() - 0.5) * 0.4; // ±20% price variation
        const durationVariation = 1 + (Math.random() - 0.5) * 0.3; // ±15% duration variation

        courses.push({
          title: `${variation} ${template.title}`,
          description: `${template.description} - ${variation} level course with industry-standard practices.`,
          instructor_name: instructor,
          category: template.category,
          subcategory: template.subcategory,
          difficulty_level: template.difficulty,
          duration_hours: Math.round(template.duration_hours * durationVariation),
          price: Math.round(template.price * priceVariation),
          is_free: Math.random() < 0.15, // 15% free courses
          skills_taught: template.skills,
          tags: template.tags,
          is_published: true,
          is_featured: Math.random() < 0.1, // 10% featured courses
          rating: Number((4.0 + Math.random() * 1.0).toFixed(1)), // 4.0-5.0 rating
          enrolled_count: Math.floor(Math.random() * 10000) + 100,
          thumbnail_url: `https://images.unsplash.com/photo-${1500000000000 + courseId}?w=400&h=250&fit=crop&auto=format`,
          course_language: 'English',
          prerequisites: courseId % 3 === 0 ? ['Basic computer knowledge'] : [],
          learning_outcomes: [
            `Master ${template.skills[0]}`,
            `Apply ${template.skills[1] || 'practical skills'}`,
            'Build real-world projects',
            'Earn industry certification'
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        courseId++;
        if (courses.length >= 500) break;
      }
      if (courses.length >= 500) break;
    }
    if (courses.length >= 500) break;
  }

  return courses.slice(0, 500); // Ensure exactly 500 courses
};

export const populateMassiveCourseDatabase = async () => {
  try {
    console.log('Starting massive course population...');
    
    const courses = await generateMassiveCourseDatabase();
    console.log(`Generated ${courses.length} courses`);

    // Insert courses in batches to avoid timeout
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < courses.length; i += batchSize) {
      const batch = courses.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('courses')
        .insert(batch)
        .select('id');

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        continue;
      }

      insertedCount += batch.length;
      console.log(`Inserted batch ${i / batchSize + 1}: ${insertedCount}/${courses.length} courses`);
    }

    console.log(`Successfully populated ${insertedCount} courses!`);
    return { success: true, count: insertedCount };
  } catch (error) {
    console.error('Error in massive course population:', error);
    throw error;
  }
};