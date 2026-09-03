import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { JobCard } from '@/components/jobs/JobCard';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, Briefcase } from 'lucide-react';

interface JobCategoryPageProps {}

const JobCategoryPage: React.FC<JobCategoryPageProps> = () => {
  const { category } = useParams<{ category: string }>();
  
  const categoryData = getCategoryData(category || '');
  
  // Mock job data - in production, this would come from API
  const mockJobs = [
    {
      id: '1',
      title: 'Software Developer Fresher',
      description: 'Exciting opportunity for fresh graduates...',
      location: 'Bangalore',
      salary_min: 300000,
      salary_max: 500000,
      employment_type: 'full_time',
      is_remote: false,
      posted_at: new Date().toISOString(),
      company: {
        id: 'techcorp',
        name: 'TechCorp',
        logo_url: '/images/company-logo.png',
        industry: 'Technology'
      }
    }
  ];

  return (
    <>
      <Helmet>
        <title>{categoryData.title}</title>
        <meta name="description" content={categoryData.description} />
        <meta name="keywords" content={categoryData.keywords.join(', ')} />
        <link rel="canonical" href={`https://talentxcel.in/jobs/${category}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={categoryData.title} />
        <meta property="og:description" content={categoryData.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://talentxcel.in/jobs/${category}`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={categoryData.title} />
        <meta name="twitter:description" content={categoryData.description} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(categoryData.structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 to-secondary/5 py-16">
          <div className="container mx-auto px-4">
            {/* Breadcrumbs */}
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                <li><a href="/" className="hover:text-foreground transition-colors">Home</a></li>
                <li><span className="mx-2">/</span></li>
                <li><a href="/jobs" className="hover:text-foreground transition-colors">Jobs</a></li>
                <li><span className="mx-2">/</span></li>
                <li className="text-foreground font-medium">{categoryData.name}</li>
              </ol>
            </nav>

            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                {categoryData.h1}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {categoryData.description}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Button size="lg" className="gap-2">
                  <Search className="h-5 w-5" />
                  Browse Jobs
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Jobs
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="bg-card p-6 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <Briefcase className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold text-foreground">500+</span>
                  </div>
                  <p className="text-muted-foreground">Active Job Openings</p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold text-foreground">25+</span>
                  </div>
                  <p className="text-muted-foreground">Cities Covered</p>
                </div>
                <div className="bg-card p-6 rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <Search className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold text-foreground">₹3-15L</span>
                  </div>
                  <p className="text-muted-foreground">Salary Range</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div 
                  className="prose prose-lg max-w-none mb-12"
                  dangerouslySetInnerHTML={{ __html: categoryData.content }}
                />

                {/* Job Listings */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-foreground">Latest {categoryData.name} Jobs</h2>
                  <div className="grid gap-6">
                    {mockJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Popular Locations */}
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Popular Locations</h3>
                  <div className="space-y-2">
                    {['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune'].map((city) => (
                      <a 
                        key={city}
                        href={`/jobs/${city.toLowerCase()}`}
                        className="block text-muted-foreground hover:text-primary transition-colors"
                      >
                        {categoryData.name} Jobs in {city}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Experience Levels */}
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Experience Levels</h3>
                  <div className="space-y-2">
                    {['Fresher', 'Entry Level', 'Mid Level', 'Senior Level'].map((level) => (
                      <a 
                        key={level}
                        href={`/jobs?experience=${level.toLowerCase().replace(' ', '-')}`}
                        className="block text-muted-foreground hover:text-primary transition-colors"
                      >
                        {level} {categoryData.name} Jobs
                      </a>
                    ))}
                  </div>
                </div>

                {/* Related Skills */}
                <div className="bg-card p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">Related Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {categoryData.relatedSkills.map((skill) => (
                      <a
                        key={skill}
                        href={`/jobs/skill/${skill.toLowerCase().replace(' ', '-')}`}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                      >
                        {skill}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {categoryData.faqs && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl">
                <h2 className="text-3xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {categoryData.faqs.map((faq, index) => (
                    <div key={index} className="bg-card p-6 rounded-lg border">
                      <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

// Category data configuration
function getCategoryData(category: string) {
  const categories: Record<string, any> = {
    'it-jobs': {
      name: 'IT Jobs',
      title: 'IT Fresher Jobs 2025 | Software, Tech & Programming | TalentXcel',
      description: 'Find the best IT fresher jobs in India. Software developer, programmer, tech support roles with top companies. Great learning opportunities and career growth.',
      h1: 'IT Fresher Jobs & Career Opportunities',
      keywords: ['it jobs', 'software jobs', 'programming jobs', 'tech jobs', 'it fresher jobs', 'developer jobs'],
      relatedSkills: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'MySQL'],
      content: `
        <div class="space-y-6">
          <p>The IT industry offers tremendous opportunities for fresh graduates. From software development to technical support, there are numerous entry-level positions that provide excellent learning experiences and career growth potential.</p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Popular IT Job Roles for Freshers</h2>
          <ul class="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Software Developer / Programmer</li>
            <li>Web Developer (Frontend/Backend)</li>
            <li>Mobile App Developer</li>
            <li>Quality Assurance Tester</li>
            <li>Technical Support Specialist</li>
            <li>Database Administrator</li>
            <li>System Administrator</li>
            <li>UI/UX Designer</li>
          </ul>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Skills Required for IT Jobs</h2>
          <p>Success in IT requires both technical and soft skills. Programming languages like Java, Python, JavaScript are highly valued. Additionally, problem-solving, analytical thinking, and communication skills are essential for career growth.</p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Salary Expectations for IT Freshers</h2>
          <p>IT freshers can expect starting salaries ranging from ₹3-8 lakhs per annum, depending on skills, company, and location. With experience and skill development, salaries can grow significantly within 2-3 years.</p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Top IT Companies Hiring Freshers</h2>
          <p>Leading companies like TCS, Infosys, Wipro, Cognizant, Accenture, and numerous startups actively recruit fresh graduates. Many offer comprehensive training programs and mentorship opportunities.</p>
        </div>
      `,
      faqs: [
        {
          question: "What qualifications do I need for IT fresher jobs?",
          answer: "Most IT companies accept graduates from Computer Science, IT, Electronics, or related fields. Some companies also consider candidates from other engineering branches with good programming skills."
        },
        {
          question: "Do I need prior experience for fresher IT jobs?",
          answer: "No, fresher positions are designed for new graduates. However, having personal projects, internships, or relevant certifications can give you an advantage."
        },
        {
          question: "Which programming languages should I learn?",
          answer: "Popular languages include Java, Python, JavaScript, C++, and C#. The choice depends on your career goals - web development, mobile apps, data science, or enterprise applications."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "IT Fresher Jobs & Career Opportunities",
        "description": "Find the best IT fresher jobs in India. Software developer, programmer, tech support roles with top companies.",
        "url": "https://talentxcel.in/jobs/category/it-jobs",
        "publisher": {
          "@type": "Organization",
          "name": "TalentXcel Services",
          "sameAs": "https://talentxcel.in"
        }
      }
    },
    'engineering-jobs': {
      name: 'Engineering Jobs',
      title: 'Engineering Fresher Jobs 2025 | Mechanical, Civil, Electrical | TalentXcel',
      description: 'Explore engineering fresher jobs across mechanical, civil, electrical, and other core branches. Join leading companies with excellent training and growth opportunities.',
      h1: 'Engineering Fresher Jobs & Career Opportunities',
      keywords: ['engineering jobs', 'mechanical jobs', 'civil jobs', 'electrical jobs', 'engineering fresher', 'core engineering'],
      relatedSkills: ['AutoCAD', 'SolidWorks', 'Project Management', 'Quality Control', 'Manufacturing', 'Design'],
      content: `
        <div class="space-y-6">
          <p>Engineering offers diverse career opportunities across various disciplines. Fresh engineering graduates can find exciting roles in manufacturing, construction, automotive, aerospace, and emerging technology sectors.</p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Core Engineering Branches</h2>
          <ul class="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Mechanical Engineering - Design, manufacturing, automotive</li>
            <li>Civil Engineering - Construction, infrastructure, urban planning</li>
            <li>Electrical Engineering - Power systems, electronics, automation</li>
            <li>Chemical Engineering - Process industries, pharmaceuticals</li>
            <li>Aerospace Engineering - Aircraft, spacecraft, defense</li>
            <li>Production Engineering - Manufacturing processes, quality control</li>
          </ul>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Industry Sectors for Engineers</h2>
          <p>Engineers work across diverse industries including automotive (Tata Motors, Mahindra), infrastructure (L&T, Shapoorji Pallonji), manufacturing (Godrej, Bajaj), and government sectors (ISRO, DRDO, Railways).</p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Skills for Modern Engineers</h2>
          <p>Besides technical knowledge, modern engineers need CAD software skills, project management capabilities, and understanding of digital technologies like IoT, AI, and automation systems.</p>
        </div>
      `,
      faqs: [
        {
          question: "Which engineering branch has the best job prospects?",
          answer: "All engineering branches have good prospects, but currently, mechanical, electrical, and chemical engineering have strong demand due to infrastructure development and manufacturing growth."
        },
        {
          question: "What is the average salary for engineering freshers?",
          answer: "Engineering freshers typically earn ₹3-6 lakhs per annum initially, with significant growth potential based on performance, skills, and industry choice."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Engineering Fresher Jobs & Career Opportunities",
        "description": "Explore engineering fresher jobs across mechanical, civil, electrical, and other core branches.",
        "url": "https://talentxcel.in/jobs/category/engineering-jobs",
        "publisher": {
          "@type": "Organization",
          "name": "TalentXcel Services",
          "sameAs": "https://talentxcel.in"
        }
      }
    },
    'marketing-jobs': {
      name: 'Marketing Jobs',
      title: 'Marketing Fresher Jobs 2025 | Digital, Sales & Brand Marketing | TalentXcel',
      description: 'Discover marketing fresher jobs in digital marketing, sales, brand management, and communications. Join dynamic teams and build your marketing career.',
      h1: 'Marketing Fresher Jobs & Career Opportunities',
      keywords: ['marketing jobs', 'digital marketing jobs', 'sales jobs', 'brand management', 'marketing fresher', 'advertising jobs'],
      relatedSkills: ['Digital Marketing', 'SEO', 'Social Media', 'Content Writing', 'Google Analytics', 'PPC'],
      content: `
        <div class="space-y-6">
          <p>Marketing is an exciting field that combines creativity with analytics. Fresh graduates can explore roles in digital marketing, traditional advertising, brand management, and sales across various industries.</p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Marketing Job Roles for Freshers</h2>
          <ul class="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Digital Marketing Executive</li>
            <li>Social Media Coordinator</li>
            <li>Content Marketing Specialist</li>
            <li>Sales Executive / Business Development</li>
            <li>Brand Assistant</li>
            <li>Market Research Analyst</li>
            <li>Public Relations Coordinator</li>
            <li>Event Management Executive</li>
          </ul>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Digital Marketing Focus</h2>
          <p>Digital marketing dominates modern marketing strategies. Skills in SEO, SEM, social media marketing, email marketing, and analytics tools are highly valued by employers across all industries.</p>
          
          <h2 class="text-2xl font-semibold mt-8 mb-4">Career Growth in Marketing</h2>
          <p>Marketing offers rapid career progression for talented individuals. You can advance to specialist roles (SEO Expert, Social Media Manager) or management positions (Marketing Manager, Brand Manager) within 3-5 years.</p>
        </div>
      `,
      faqs: [
        {
          question: "Do I need specific qualifications for marketing jobs?",
          answer: "While marketing, MBA, or communications degrees are preferred, many companies accept graduates from any field with good communication skills and marketing aptitude."
        },
        {
          question: "Is certification necessary for digital marketing roles?",
          answer: "While not mandatory, certifications from Google, Facebook, HubSpot, or similar platforms significantly enhance your profile and job prospects."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Marketing Fresher Jobs & Career Opportunities",
        "description": "Discover marketing fresher jobs in digital marketing, sales, brand management, and communications.",
        "url": "https://talentxcel.in/jobs/category/marketing-jobs",
        "publisher": {
          "@type": "Organization",
          "name": "TalentXcel Services",
          "sameAs": "https://talentxcel.in"
        }
      }
    }
  };

  return categories[category] || categories['it-jobs'];
}

export default JobCategoryPage;