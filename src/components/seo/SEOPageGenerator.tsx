import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useStructuredData } from '@/hooks/useStructuredData';

interface SEOPage {
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  content: string;
  breadcrumbs: Array<{ name: string; url: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  structuredData?: any;
}

interface SEOPageGeneratorProps {
  pageType: 'job-location' | 'job-role' | 'company-location' | 'skill-guide' | 'career-path';
  location?: string;
  role?: string;
  skill?: string;
  company?: string;
  industry?: string;
}

// Generate thousands of SEO-optimized pages for long-tail keywords
export const SEOPageGenerator: React.FC<SEOPageGeneratorProps> = ({
  pageType,
  location,
  role,
  skill,
  company,
  industry
}) => {
  const page = generateSEOPage(pageType, { location, role, skill, company, industry });
  
  // Add structured data
  useStructuredData({
    schema: JSON.stringify(page.structuredData),
    id: `seo-${pageType}-structured-data`
  });

  const canonicalUrl = `https://talentxcel.in${typeof window !== 'undefined' ? window.location.pathname : ''}`;

  return (
    <>
      <Helmet>
        <title>{page.title}</title>
        <meta name="description" content={page.description} />
        <meta name="keywords" content={page.keywords.join(', ')} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.title} />
        <meta name="twitter:description" content={page.description} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            {page.breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && <span className="mx-2">/</span>}
                <a 
                  href={crumb.url}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.name}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Main Content */}
        <article className="max-w-4xl">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">{page.h1}</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">{page.description}</p>
          </header>

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />

          {/* FAQs Section */}
          {page.faqs && page.faqs.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {page.faqs.map((faq, index) => (
                  <div key={index} className="border-l-4 border-primary pl-6">
                    <h3 className="text-lg font-medium mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  );
};

// Generate dynamic content based on page type and parameters
function generateSEOPage(
  pageType: string, 
  params: { location?: string; role?: string; skill?: string; company?: string; industry?: string }
): SEOPage {
  const { location, role, skill, company, industry } = params;

  switch (pageType) {
    case 'job-location':
      return generateJobLocationPage(location!, role);
    case 'job-role':
      return generateJobRolePage(role!, location);
    case 'company-location':
      return generateCompanyLocationPage(company!, location!);
    case 'skill-guide':
      return generateSkillGuidePage(skill!);
    case 'career-path':
      return generateCareerPathPage(role!, industry);
    default:
      return generateDefaultPage();
  }
}

function generateJobLocationPage(location: string, role?: string): SEOPage {
  const roleText = role ? ` ${role}` : '';
  const title = `${roleText} Jobs in ${location} 2025 | TalentXcel`;
  const description = `Find the best${roleText} jobs in ${location}. Browse ${roleText} openings, salary information, and career opportunities. Apply today on TalentXcel.`;
  
  return {
    title,
    description,
    keywords: [`jobs in ${location}`, `${location} careers`, `${role || 'employment'} ${location}`, 'job search', 'career opportunities'],
    h1: `${roleText} Jobs in ${location}`,
    content: `
      <div class="space-y-6">
        <p>Looking for${roleText} jobs in ${location}? You've come to the right place. TalentXcel connects job seekers with top employers in ${location}, offering competitive salaries and excellent career growth opportunities.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Why Choose ${location} for Your Career?</h2>
        <p>${location} offers a thriving job market with opportunities across various industries. The city provides excellent infrastructure, networking opportunities, and a vibrant professional community.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Top${roleText} Employers in ${location}</h2>
        <p>Major companies in ${location} are actively hiring${roleText} professionals. These include technology firms, financial services, healthcare organizations, and startups offering competitive packages.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Salary Expectations</h2>
        <p>${roleText} professionals in ${location} can expect competitive salaries based on experience, skills, and company size. The average salary range varies from entry-level to senior positions.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">How to Apply</h2>
        <p>Browse our latest${roleText} job listings in ${location} below. Create your profile, upload your resume, and start applying to positions that match your skills and career goals.</p>
      </div>
    `,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Jobs', url: '/jobs' },
      { name: `${location}`, url: `/jobs/${location.toLowerCase()}` }
    ],
    faqs: [
      {
        question: `What types of${roleText} jobs are available in ${location}?`,
        answer: `${location} offers a wide range of${roleText} positions including full-time, part-time, contract, and remote opportunities across various industries.`
      },
      {
        question: `What is the average salary for${roleText} jobs in ${location}?`,
        answer: `Salaries vary based on experience, skills, and company. Our platform provides detailed salary information for each job listing.`
      },
      {
        question: `How do I apply for jobs in ${location}?`,
        answer: `Simply create a profile on TalentXcel, upload your resume, and start applying to relevant positions. Our AI-powered matching helps connect you with suitable opportunities.`
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": `${roleText} Jobs in ${location}`,
      "description": description,
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": location,
          "addressCountry": "IN"
        }
      },
      "hiringOrganization": {
        "@type": "Organization",
        "name": "TalentXcel",
        "sameAs": "https://talentxcel.in"
      }
    }
  };
}

function generateJobRolePage(role: string, location?: string): SEOPage {
  const locationText = location ? ` in ${location}` : '';
  const title = `${role} Jobs${locationText} | Career Guide & Opportunities | TalentXcel`;
  const description = `Complete guide to ${role} careers${locationText}. Explore job opportunities, salary information, skills required, and career growth paths for ${role} professionals.`;
  
  return {
    title,
    description,
    keywords: [`${role} jobs`, `${role} career`, `${role} salary`, `${role} skills`, 'career development'],
    h1: `${role} Career Guide & Job Opportunities`,
    content: `
      <div class="space-y-6">
        <p>Explore comprehensive career information for ${role} professionals. This guide covers everything you need to know about ${role} jobs${locationText}, including skills required, salary expectations, and career growth opportunities.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">What Does a ${role} Do?</h2>
        <p>A ${role} is responsible for various tasks that contribute to organizational success. The role involves strategic thinking, problem-solving, and collaboration with different teams to achieve business objectives.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Skills Required for ${role}</h2>
        <p>To excel as a ${role}, you need a combination of technical and soft skills. Key competencies include analytical thinking, communication, project management, and domain-specific expertise.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Career Path & Growth</h2>
        <p>The ${role} career path offers excellent growth opportunities. Starting from entry-level positions, professionals can advance to senior roles, leadership positions, and specialized expert roles.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Salary & Benefits</h2>
        <p>${role} professionals enjoy competitive compensation packages. Salary ranges vary based on experience, location, industry, and company size, with additional benefits including healthcare, retirement plans, and professional development opportunities.</p>
      </div>
    `,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Career Guides', url: '/career-guides' },
      { name: role, url: `/career-guides/${role.toLowerCase().replace(/\s+/g, '-')}` }
    ],
    faqs: [
      {
        question: `What qualifications do I need to become a ${role}?`,
        answer: `Qualifications vary, but typically include relevant education, certifications, and experience. Our career guide provides detailed information about requirements for ${role} positions.`
      },
      {
        question: `What is the career outlook for ${role} professionals?`,
        answer: `The ${role} field shows strong growth prospects with increasing demand across industries. Professionals with relevant skills and experience have excellent career opportunities.`
      },
      {
        question: `How can I advance my ${role} career?`,
        answer: `Career advancement involves continuous learning, skill development, networking, and gaining relevant experience. Consider pursuing certifications, attending industry events, and seeking mentorship.`
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": `${role} Career Guide & Job Opportunities`,
      "description": description,
      "author": {
        "@type": "Organization",
        "name": "TalentXcel"
      },
      "publisher": {
        "@type": "Organization",
        "name": "TalentXcel",
        "logo": {
          "@type": "ImageObject",
          "url": "https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png"
        }
      }
    }
  };
}

function generateCompanyLocationPage(company: string, location: string): SEOPage {
  const title = `${company} Jobs in ${location} | Company Profile & Careers | TalentXcel`;
  const description = `Explore career opportunities at ${company} in ${location}. Learn about company culture, benefits, job openings, and how to apply for positions at ${company}.`;
  
  return {
    title,
    description,
    keywords: [`${company} jobs`, `${company} careers`, `${company} ${location}`, `jobs at ${company}`, 'company profile'],
    h1: `${company} Careers in ${location}`,
    content: `
      <div class="space-y-6">
        <p>Discover exciting career opportunities at ${company} in ${location}. Learn about the company culture, available positions, benefits, and application process.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">About ${company}</h2>
        <p>${company} is a leading organization known for innovation, excellence, and employee development. The company offers a dynamic work environment with opportunities for professional growth and career advancement.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Why Work at ${company}?</h2>
        <p>Employees at ${company} enjoy competitive benefits, professional development opportunities, and a collaborative work culture. The company values diversity, innovation, and work-life balance.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">${company} ${location} Office</h2>
        <p>The ${location} office of ${company} is strategically located with excellent connectivity and modern facilities. The workplace promotes collaboration and provides a comfortable environment for employees.</p>
      </div>
    `,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Companies', url: '/companies' },
      { name: company, url: `/companies/${company.toLowerCase().replace(/\s+/g, '-')}` },
      { name: location, url: `/companies/${company.toLowerCase().replace(/\s+/g, '-')}/${location.toLowerCase()}` }
    ],
    faqs: [
      {
        question: `What positions are available at ${company} in ${location}?`,
        answer: `${company} offers various positions across departments including technology, sales, marketing, operations, and management roles.`
      },
      {
        question: `What benefits does ${company} offer?`,
        answer: `${company} provides comprehensive benefits including health insurance, retirement plans, professional development, and flexible work arrangements.`
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": company,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": location,
        "addressCountry": "IN"
      },
      "description": description
    }
  };
}

function generateSkillGuidePage(skill: string): SEOPage {
  const title = `${skill} Skills Guide 2025 | Learn, Develop & Master | TalentXcel`;
  const description = `Complete guide to ${skill} skills. Learn how to develop ${skill} expertise, find relevant courses, and advance your career with ${skill} proficiency.`;
  
  return {
    title,
    description,
    keywords: [`${skill} skills`, `learn ${skill}`, `${skill} courses`, `${skill} certification`, 'skill development'],
    h1: `Master ${skill} Skills for Career Success`,
    content: `
      <div class="space-y-6">
        <p>Develop expertise in ${skill} with our comprehensive skill guide. Learn about the importance of ${skill} in today's job market and how to build proficiency.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Why ${skill} Skills Matter</h2>
        <p>${skill} is a crucial skill in today's competitive job market. Professionals with strong ${skill} capabilities are in high demand across various industries and can command higher salaries.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">How to Develop ${skill} Skills</h2>
        <p>Building ${skill} expertise requires structured learning, practice, and real-world application. Start with foundational concepts and gradually advance to complex applications.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Career Opportunities with ${skill}</h2>
        <p>Professionals with ${skill} skills can pursue various career paths and roles across different industries. The skill opens doors to specialized positions and leadership opportunities.</p>
      </div>
    `,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Skills', url: '/skills' },
      { name: skill, url: `/skills/${skill.toLowerCase().replace(/\s+/g, '-')}` }
    ],
    faqs: [
      {
        question: `How long does it take to learn ${skill}?`,
        answer: `The time to learn ${skill} varies based on prior experience and learning intensity. With consistent effort, basic proficiency can be achieved in a few months.`
      },
      {
        question: `What are the best resources to learn ${skill}?`,
        answer: `Effective resources include online courses, books, tutorials, and hands-on projects. Practice and real-world application are key to mastering ${skill}.`
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": `${skill} Skills Guide`,
      "description": description,
      "provider": {
        "@type": "Organization",
        "name": "TalentXcel"
      }
    }
  };
}

function generateCareerPathPage(role: string, industry?: string): SEOPage {
  const industryText = industry ? ` in ${industry}` : '';
  const title = `${role} Career Path${industryText} | Roadmap & Progression | TalentXcel`;
  const description = `Explore the complete ${role} career path${industryText}. Understand progression stages, required skills, salary growth, and how to advance your ${role} career.`;
  
  return {
    title,
    description,
    keywords: [`${role} career path`, `${role} progression`, `${role} roadmap`, 'career development', 'professional growth'],
    h1: `${role} Career Path & Progression${industryText}`,
    content: `
      <div class="space-y-6">
        <p>Navigate your ${role} career journey with our comprehensive career path guide. Understand the progression stages, skills development, and strategic planning for ${role} professionals${industryText}.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Career Stages for ${role}</h2>
        <p>The ${role} career path typically includes entry-level, mid-level, senior, and leadership positions. Each stage requires specific skills and offers different responsibilities and growth opportunities.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Skills Development Roadmap</h2>
        <p>Advancing as a ${role} requires continuous skill development. Focus on technical competencies, leadership skills, and industry knowledge to progress in your career.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Salary Progression</h2>
        <p>${role} professionals can expect salary growth as they advance in their careers. Compensation increases with experience, skills, and leadership responsibilities.</p>
      </div>
    `,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Career Paths', url: '/career-paths' },
      { name: role, url: `/career-paths/${role.toLowerCase().replace(/\s+/g, '-')}` }
    ],
    faqs: [
      {
        question: `What are the typical career stages for a ${role}?`,
        answer: `Career stages typically include junior, mid-level, senior, lead, and management positions, each with increasing responsibilities and compensation.`
      },
      {
        question: `How can I accelerate my ${role} career progression?`,
        answer: `Focus on skill development, seek mentorship, take on challenging projects, and build a strong professional network to accelerate career growth.`
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": `${role} Career Path & Progression`,
      "description": description,
      "author": {
        "@type": "Organization",
        "name": "TalentXcel"
      }
    }
  };
}

function generateDefaultPage(): SEOPage {
  return {
    title: 'Career Resources | TalentXcel',
    description: 'Explore career resources, job opportunities, and professional development guides on TalentXcel.',
    keywords: ['careers', 'jobs', 'professional development', 'career guidance'],
    h1: 'Career Resources & Opportunities',
    content: '<p>Discover comprehensive career resources and opportunities on TalentXcel.</p>',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Resources', url: '/resources' }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Career Resources",
      "description": "Career resources and opportunities"
    }
  };
}