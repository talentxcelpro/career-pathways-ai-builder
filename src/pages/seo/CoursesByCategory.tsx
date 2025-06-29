
import React from 'react';
import { useParams } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { SEOHead } from '@/components/seo/SEOHead';
import { EnhancedCourseCard } from '@/components/learning/EnhancedCourseCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CoursesByCategory = () => {
  const { category } = useParams<{ category: string }>();
  const formattedCategory = category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';

  const { data: courses = [] } = useQuery({
    queryKey: ['courses', category],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .ilike('category', `%${formattedCategory}%`)
        .order('enrolled_count', { ascending: false });
      return data || [];
    }
  });

  const seoConfig = {
    title: `${formattedCategory} Courses | Learn ${formattedCategory} Online | TalentXcel`,
    description: `Master ${formattedCategory} with expert-led online courses. Learn ${formattedCategory} fundamentals to advanced concepts. Get certified and boost your career prospects.`,
    keywords: [
      `${formattedCategory.toLowerCase()} courses`,
      `learn ${formattedCategory.toLowerCase()}`,
      `${formattedCategory.toLowerCase()} training`,
      `${formattedCategory.toLowerCase()} certification`,
      'online courses',
      'skill development',
      'professional training'
    ],
    canonical: `/courses/category/${category}`,
    structuredData: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": `${formattedCategory} Courses`,
      "description": `Professional ${formattedCategory} training and certification courses`,
      "educationalCredentialAwarded": "Certificate",
      "url": `https://talentxcel.in/courses/category/${category}`
    })
  };

  useSEO(seoConfig);

  const categoryData = {
    'data-science': {
      description: 'Master data analysis, machine learning, and statistical modeling',
      averageSalary: '₹15L',
      jobRoles: ['Data Scientist', 'ML Engineer', 'Data Analyst', 'Business Intelligence Analyst'],
      skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Tableau']
    },
    'web-development': {
      description: 'Build modern web applications using latest technologies',
      averageSalary: '₹10L',
      jobRoles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Web Designer'],
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB']
    },
    'digital-marketing': {
      description: 'Learn digital marketing strategies and tools to grow businesses online',
      averageSalary: '₹8L',
      jobRoles: ['Digital Marketing Manager', 'SEO Specialist', 'Social Media Manager', 'Content Marketer'],
      skills: ['SEO', 'Google Ads', 'Social Media', 'Content Marketing', 'Analytics', 'Email Marketing']
    }
  };

  const currentCategory = categoryData[category as keyof typeof categoryData] || categoryData['data-science'];

  const handleEnroll = (courseId: string) => {
    console.log('Enrolling in course:', courseId);
    // Add enrollment logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead {...seoConfig} />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {formattedCategory} Courses
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              {currentCategory.description}. Get hands-on experience with real projects 
              and earn industry-recognized certificates.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">50+ Courses</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Expert Instructors</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">Lifetime Access</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Overview */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Average Salary</h3>
              <div className="text-3xl font-bold text-green-600">{currentCategory.averageSalary}</div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Career Opportunities</h3>
              <div className="space-y-1">
                {currentCategory.jobRoles.slice(0, 2).map((role, index) => (
                  <div key={index} className="text-gray-700">{role}</div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Key Skills</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {currentCategory.skills.slice(0, 4).map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8">Featured {formattedCategory} Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <EnhancedCourseCard 
                key={course.id} 
                course={course}
                isEnrolled={false}
                onEnroll={handleEnroll}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            <h2>{formattedCategory} Learning Path</h2>
            <p>
              Our comprehensive {formattedCategory} curriculum is designed to take you from 
              beginner to expert level. Each course builds upon the previous one, ensuring 
              a smooth learning progression.
            </p>
            
            <h3>What You'll Learn</h3>
            <ul>
              <li>Fundamental concepts and best practices</li>
              <li>Hands-on experience with real-world projects</li>
              <li>Industry-standard tools and technologies</li>
              <li>Problem-solving and critical thinking skills</li>
            </ul>

            <h3>Career Opportunities</h3>
            <p>
              Upon completion of our {formattedCategory} courses, you'll be prepared for roles such as:
            </p>
            <ul>
              {currentCategory.jobRoles.map((role, index) => (
                <li key={index}>{role}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CoursesByCategory;
