
import { supabase } from "@/integrations/supabase/client";

export const insertSampleCourses = async () => {
  const sampleCourses = [
    {
      title: "React Development Fundamentals",
      description: "Learn the basics of React development including components, state management, and hooks.",
      instructor_name: "Sarah Johnson",
      instructor_bio: "Senior Frontend Developer with 8+ years experience",
      duration_hours: 25,
      difficulty_level: "beginner",
      category: "Web Development",
      skills_taught: ["React", "JavaScript", "HTML", "CSS", "Hooks"],
      price: 99.99,
      is_free: false,
      rating: 4.8,
      enrolled_count: 1234
    },
    {
      title: "Advanced JavaScript Patterns",
      description: "Master advanced JavaScript concepts and design patterns used in modern web development.",
      instructor_name: "Michael Chen",
      instructor_bio: "JavaScript expert and technical author",
      duration_hours: 35,
      difficulty_level: "advanced",
      category: "Web Development",
      skills_taught: ["JavaScript", "Design Patterns", "ES6+", "Async Programming"],
      price: 149.99,
      is_free: false,
      rating: 4.9,
      enrolled_count: 856
    },
    {
      title: "UI/UX Design Principles",
      description: "Learn fundamental design principles and user experience best practices.",
      instructor_name: "Emily Rodriguez",
      instructor_bio: "Lead UX Designer at top tech company",
      duration_hours: 20,
      difficulty_level: "beginner",
      category: "Design",
      skills_taught: ["UI Design", "UX Research", "Figma", "Prototyping"],
      price: 0,
      is_free: true,
      rating: 4.7,
      enrolled_count: 2341
    },
    {
      title: "Data Science with Python",
      description: "Complete introduction to data science using Python, pandas, and machine learning.",
      instructor_name: "Dr. James Wilson",
      instructor_bio: "Data Scientist and Machine Learning researcher",
      duration_hours: 45,
      difficulty_level: "intermediate",
      category: "Data Science",
      skills_taught: ["Python", "Pandas", "NumPy", "Machine Learning", "Data Analysis"],
      price: 199.99,
      is_free: false,
      rating: 4.8,
      enrolled_count: 1567
    },
    {
      title: "Cloud Architecture Basics",
      description: "Introduction to cloud computing concepts and AWS fundamentals.",
      instructor_name: "Alex Kumar",
      instructor_bio: "Cloud Solutions Architect with AWS certifications",
      duration_hours: 30,
      difficulty_level: "intermediate",
      category: "Cloud Computing",
      skills_taught: ["AWS", "Cloud Architecture", "DevOps", "Containers"],
      price: 129.99,
      is_free: false,
      rating: 4.6,
      enrolled_count: 934
    },
    {
      title: "Product Management Essentials",
      description: "Learn the fundamentals of product management and strategy.",
      instructor_name: "Lisa Thompson",
      instructor_bio: "Senior Product Manager with 10+ years experience",
      duration_hours: 18,
      difficulty_level: "beginner",
      category: "Business",
      skills_taught: ["Product Strategy", "User Research", "Agile", "Analytics"],
      price: 0,
      is_free: true,
      rating: 4.5,
      enrolled_count: 1890
    }
  ];

  const sampleLearningPaths = [
    {
      title: "Full-Stack Web Developer",
      description: "Complete learning path to become a full-stack web developer from scratch.",
      target_role: "Full-Stack Developer",
      difficulty_level: "beginner",
      estimated_duration_weeks: 24,
      skills_gained: ["React", "Node.js", "JavaScript", "HTML", "CSS", "MongoDB", "Express.js"]
    },
    {
      title: "Data Scientist Career Track",
      description: "Comprehensive path covering statistics, programming, and machine learning for data science roles.",
      target_role: "Data Scientist",
      difficulty_level: "intermediate",
      estimated_duration_weeks: 32,
      skills_gained: ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization", "R"]
    },
    {
      title: "Product Manager Bootcamp",
      description: "Everything you need to transition into product management from any background.",
      target_role: "Product Manager",
      difficulty_level: "beginner",
      estimated_duration_weeks: 16,
      skills_gained: ["Product Strategy", "Market Research", "Agile", "Analytics", "User Experience"]
    },
    {
      title: "Cloud Solutions Architect",
      description: "Master cloud architecture patterns and prepare for AWS certification.",
      target_role: "Solutions Architect",
      difficulty_level: "advanced",
      estimated_duration_weeks: 20,
      skills_gained: ["AWS", "Azure", "Cloud Architecture", "DevOps", "Microservices", "Security"]
    }
  ];

  try {
    // Insert courses
    const { error: coursesError } = await supabase
      .from('courses')
      .insert(sampleCourses);

    if (coursesError) {
      console.error('Error inserting courses:', coursesError);
      return;
    }

    // Insert learning paths
    const { error: pathsError } = await supabase
      .from('learning_paths')
      .insert(sampleLearningPaths);

    if (pathsError) {
      console.error('Error inserting learning paths:', pathsError);
      return;
    }

    console.log('Sample data inserted successfully!');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};
