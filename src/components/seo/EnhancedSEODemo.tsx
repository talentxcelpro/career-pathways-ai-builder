import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { JobPostingJSONLD } from '@/components/seo/JobPostingJSONLD';
import { NetworkPostJSONLD } from '@/components/seo/NetworkPostJSONLD';
import { ToolJSONLD, CourseJSONLD } from '@/components/seo/StructuredDataComponents';

interface EnhancedSEODemoProps {
  contentType: 'job' | 'post' | 'tool' | 'course';
}

/**
 * Enhanced SEO Demo Component
 * Demonstrates the new JSON-LD implementation with all required fields
 * for Google rich snippets and Search Console compliance
 */
export const EnhancedSEODemo: React.FC<EnhancedSEODemoProps> = ({ contentType }) => {
  const params = useParams();

  // Sample data for demonstration
  const sampleJob = {
    id: "sample-job-123",
    title: "Senior Software Engineer",
    description: "Join our dynamic team as a Senior Software Engineer. You'll work on cutting-edge projects using modern technologies like React, Node.js, and AWS. We offer competitive salary, flexible working hours, health insurance, and excellent career growth opportunities.",
    company_name: "TechCorp Solutions",
    employment_type: "full-time",
    location: "Mumbai, Maharashtra, India",
    salary_min: 1200000,
    salary_max: 1800000,
    salary_currency: "INR",
    created_at: "2025-08-24T10:00:00Z",
    expires_at: "2025-09-24T23:59:59Z",
    industry: "Information Technology",
    city: "Mumbai",
    state: "Maharashtra",
    country: "IN",
    seo_slug: "senior-software-engineer-techcorp-solutions-mumbai"
  };

  const samplePost = {
    id: "sample-post-456",
    headline: "5 Essential Skills Every Software Engineer Should Master in 2025",
    content: "The tech industry is evolving rapidly, and staying ahead requires continuous learning. Here are the top 5 skills that every software engineer should focus on: 1. Cloud Architecture (AWS/Azure) 2. DevOps & CI/CD 3. Machine Learning Basics 4. System Design 5. Leadership & Communication. These skills will set you apart in the competitive job market.",
    author_id: "author-123",
    author_name: "Rajesh Kumar",
    created_at: "2025-08-24T08:30:00Z",
    updated_at: "2025-08-24T09:15:00Z",
    post_type: "career-advice"
  };

  const sampleTool = {
    id: "sample-tool-789",
    name: "AI Resume Optimizer",
    description: "Our AI-powered resume optimizer analyzes your resume against job descriptions and provides personalized recommendations to improve your chances of getting hired. Features include ATS compatibility check, keyword optimization, and professional formatting.",
    category: "resume-builder",
    features: ["ATS Compatibility Check", "Keyword Optimization", "Professional Templates", "Real-time Feedback"],
    pricing: "freemium",
    rating: 4.8,
    created_at: "2025-08-24T00:00:00Z"
  };

  const sampleCourse = {
    id: "sample-course-101",
    title: "Complete JavaScript Mastery Course",
    description: "Master JavaScript from basics to advanced concepts. This comprehensive course covers ES6+, async programming, DOM manipulation, and modern frameworks. Perfect for beginners and professionals looking to upgrade their skills.",
    category: "programming",
    level: "beginner-to-advanced",
    duration: "40 hours",
    skills: ["JavaScript", "ES6+", "DOM Manipulation", "Async Programming"],
    created_at: "2025-08-24T00:00:00Z"
  };

  const generateMetaTags = () => {
    switch (contentType) {
      case 'job':
        return {
          title: `${sampleJob.title} at ${sampleJob.company_name} in ${sampleJob.city} | TalentXcel Jobs`,
          description: `Apply for ${sampleJob.title} at ${sampleJob.company_name} in ${sampleJob.city}. ${sampleJob.description.substring(0, 100)}... Join TalentXcel today!`,
          canonical: `https://talentxcel.in/jobs/${sampleJob.seo_slug}`
        };
      case 'post':
        return {
          title: `${samplePost.headline} | TalentXcel Network`,
          description: `${samplePost.content.substring(0, 150)}... Read more professional insights on TalentXcel.`,
          canonical: `https://talentxcel.in/network/${samplePost.id}`
        };
      case 'tool':
        return {
          title: `${sampleTool.name} - ${sampleTool.category} | TalentXcel Tools`,
          description: `${sampleTool.description.substring(0, 150)}... Try our ${sampleTool.category} tools for free.`,
          canonical: `https://talentxcel.in/tools/${sampleTool.id}`
        };
      case 'course':
        return {
          title: `${sampleCourse.title} - ${sampleCourse.category} | TalentXcel Learning`,
          description: `${sampleCourse.description.substring(0, 150)}... Start learning today on TalentXcel.`,
          canonical: `https://talentxcel.in/learning/${sampleCourse.id}`
        };
      default:
        return {
          title: "Enhanced SEO Demo | TalentXcel",
          description: "Demonstration of enhanced SEO implementation with JSON-LD structured data",
          canonical: "https://talentxcel.in/seo-demo"
        };
    }
  };

  const metaTags = generateMetaTags();

  const renderStructuredData = () => {
    switch (contentType) {
      case 'job':
        return <JobPostingJSONLD job={sampleJob} />;
      case 'post':
        return <NetworkPostJSONLD post={samplePost} />;
      case 'tool':
        return <ToolJSONLD tool={sampleTool} />;
      case 'course':
        return <CourseJSONLD course={sampleCourse} />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (contentType) {
      case 'job':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">{sampleJob.title}</h1>
                  <div className="text-xl text-muted-foreground mb-4">
                    {sampleJob.company_name} • {sampleJob.city}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
                      {sampleJob.employment_type.replace('-', ' ').toUpperCase()}
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      ₹{(sampleJob.salary_min / 100000).toFixed(1)}L - ₹{(sampleJob.salary_max / 100000).toFixed(1)}L
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                <h2>Job Description</h2>
                <p>{sampleJob.description}</p>
                
                <h3>What We Offer</h3>
                <ul>
                  <li>Competitive salary package</li>
                  <li>Health insurance coverage</li>
                  <li>Flexible working hours</li>
                  <li>Career growth opportunities</li>
                  <li>Modern tech stack</li>
                </ul>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">✅ Enhanced SEO Features</h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Complete JobPosting JSON-LD with all required fields</li>
                  <li>• Dynamic meta title and description</li>
                  <li>• Proper salary, location, and company information</li>
                  <li>• Valid through dates and employment type</li>
                  <li>• Google Jobs rich snippet compatible</li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      case 'post':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-foreground mb-4">{samplePost.headline}</h1>
              <div className="text-sm text-muted-foreground mb-6">
                By {samplePost.author_name} • {new Date(samplePost.created_at).toLocaleDateString()}
              </div>
              
              <div className="prose dark:prose-invert max-w-none mb-8">
                <p>{samplePost.content}</p>
              </div>
              
              <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">✅ Enhanced SEO Features</h3>
                <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <li>• Complete Article JSON-LD schema</li>
                  <li>• Author and publisher information</li>
                  <li>• Publish and modified dates</li>
                  <li>• Proper image and URL metadata</li>
                  <li>• Search engine optimized content structure</li>
                </ul>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-foreground mb-6">Enhanced SEO Implementation</h1>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">🎯 What's New</h2>
                  <ul className="space-y-2 text-sm">
                    <li>✅ Complete JobPosting JSON-LD with all required fields</li>
                    <li>✅ Enhanced Article schema for network posts</li>
                    <li>✅ Tool and Course structured data</li>
                    <li>✅ Dynamic meta tag generation</li>
                    <li>✅ Automated sitemap pipeline for 2M+ pages</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">📈 Benefits</h2>
                  <ul className="space-y-2 text-sm">
                    <li>🔍 Google Jobs rich snippets</li>
                    <li>🚀 Improved search visibility</li>
                    <li>⚡ Search Console compliance</li>
                    <li>🎯 Higher CTR rates</li>
                    <li>🌐 Better crawlability</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
                <h3 className="font-semibold mb-3">🚀 Ready for 2M+ Pages</h3>
                <p className="text-sm text-muted-foreground">
                  This implementation supports automated generation of JSON-LD, meta tags, and sitemaps 
                  for millions of job postings, network posts, tools, courses, and hierarchical SEO pages.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>{metaTags.title}</title>
        <meta name="description" content={metaTags.description} />
        <link rel="canonical" href={metaTags.canonical} />
        <meta property="og:title" content={metaTags.title} />
        <meta property="og:description" content={metaTags.description} />
        <meta property="og:url" content={metaTags.canonical} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTags.title} />
        <meta name="twitter:description" content={metaTags.description} />
      </Helmet>
      
      {renderStructuredData()}
      {renderContent()}
    </>
  );
};