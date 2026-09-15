interface SEOContent {
  metaTitle: string;
  metaDescription: string;
  h1Title: string;
  introContent: string;
  faqs: Array<{ question: string; answer: string }>;
  structuredData: any;
  contentBlocks: any[];
  keywords: string[];
  qualityScore: number;
}

interface PageRequest {
  pageType: string;
  primarySlug: string;
  secondarySlug?: string;
  tertiarySlug?: string;
  priority?: string;
}

export class SEOTemplateEngine {
  private templates: Record<string, any> = {
    'job-location': {
      metaTitle: '{job} Jobs in {location} | TalentXcel',
      h1Title: '{job} Jobs in {location}',
      metaDescription: 'Find the best {job} jobs in {location}. Browse {job} opportunities with top companies. Apply now and advance your career in {location}.',
      introContent: 'Discover exciting {job} opportunities in {location}. Our platform connects talented professionals with leading companies offering {job} positions. Whether you\'re an experienced {job} or just starting your career, find the perfect role in {location}.',
      keywords: ['{job}', '{location}', 'jobs', 'careers', 'employment', 'opportunities'],
      qualityScore: 85
    },
    'skill-location': {
      metaTitle: '{skill} Jobs in {location} | TalentXcel',
      h1Title: '{skill} Developer Jobs in {location}',
      metaDescription: 'Explore {skill} developer positions in {location}. Find {skill} jobs with competitive salaries and growth opportunities in {location}.',
      introContent: 'Looking for {skill} opportunities in {location}? Our platform features the latest {skill} positions from top employers. Build your career with {skill} technology in {location}.',
      keywords: ['{skill}', '{location}', 'developer', 'programming', 'technology', 'software'],
      qualityScore: 80
    },
    'location': {
      metaTitle: 'Jobs in {location} | TalentXcel',
      h1Title: 'Find Jobs in {location}',
      metaDescription: 'Discover career opportunities in {location}. Browse thousands of jobs across various industries and experience levels in {location}.',
      introContent: 'Explore the thriving job market in {location}. From startups to established companies, find your next career opportunity in {location}.',
      keywords: ['{location}', 'jobs', 'careers', 'employment', 'city jobs'],
      qualityScore: 75
    },
    'company': {
      metaTitle: '{company} Jobs & Careers | TalentXcel',
      h1Title: 'Careers at {company}',
      metaDescription: 'Explore career opportunities at {company}. Join a dynamic team and grow your career with one of the leading companies.',
      introContent: 'Build your career with {company}. Discover exciting opportunities, competitive benefits, and a collaborative work environment.',
      keywords: ['{company}', 'careers', 'jobs', 'company culture', 'employment'],
      qualityScore: 70
    },
    'salary': {
      metaTitle: '{job} Salary in {location} - {salary} | TalentXcel',
      h1Title: '{job} Salary Guide for {location}',
      metaDescription: 'Discover {job} salary ranges in {location}. Get insights into {salary} compensation packages and career growth opportunities.',
      introContent: 'Understanding {job} compensation in {location} is crucial for career planning. Explore salary trends, benefits, and growth potential.',
      keywords: ['{job}', '{location}', 'salary', 'compensation', 'pay scale'],
      qualityScore: 75
    }
  };

  private locationData: Record<string, any> = {
    'bangalore': { name: 'Bangalore', fullName: 'Bangalore, Karnataka', population: '12.3 million', industries: ['Technology', 'Biotechnology', 'Aerospace'] },
    'mumbai': { name: 'Mumbai', fullName: 'Mumbai, Maharashtra', population: '21.3 million', industries: ['Finance', 'Entertainment', 'Textiles'] },
    'delhi': { name: 'Delhi', fullName: 'New Delhi, Delhi', population: '32.9 million', industries: ['Government', 'Technology', 'Manufacturing'] },
    'hyderabad': { name: 'Hyderabad', fullName: 'Hyderabad, Telangana', population: '10.5 million', industries: ['Technology', 'Pharmaceuticals', 'Biotechnology'] },
    'chennai': { name: 'Chennai', fullName: 'Chennai, Tamil Nadu', population: '11.5 million', industries: ['Automotive', 'Healthcare', 'Technology'] },
    'pune': { name: 'Pune', fullName: 'Pune, Maharashtra', population: '7.4 million', industries: ['Technology', 'Automotive', 'Manufacturing'] },
    'remote': { name: 'Remote', fullName: 'Remote Work', population: 'Global', industries: ['Technology', 'Consulting', 'Digital Services'] }
  };

  private jobData: Record<string, any> = {
    'software-engineer': { 
      title: 'Software Engineer', 
      description: 'Design and develop software applications',
      skills: ['Programming', 'Problem Solving', 'Debugging'],
      avgSalary: '8-15 LPA'
    },
    'data-scientist': { 
      title: 'Data Scientist', 
      description: 'Analyze complex data to derive business insights',
      skills: ['Python', 'Machine Learning', 'Statistics'],
      avgSalary: '10-20 LPA'
    },
    'product-manager': { 
      title: 'Product Manager', 
      description: 'Lead product development and strategy',
      skills: ['Strategy', 'Communication', 'Analytics'],
      avgSalary: '15-30 LPA'
    },
    'frontend-developer': { 
      title: 'Frontend Developer', 
      description: 'Build user-facing web applications',
      skills: ['JavaScript', 'React', 'CSS'],
      avgSalary: '6-12 LPA'
    }
  };

  private skillData: Record<string, any> = {
    'javascript': { name: 'JavaScript', category: 'Programming Language', demand: 'Very High' },
    'python': { name: 'Python', category: 'Programming Language', demand: 'Very High' },
    'react': { name: 'React', category: 'Frontend Framework', demand: 'High' },
    'node-js': { name: 'Node.js', category: 'Backend Technology', demand: 'High' },
    'aws': { name: 'AWS', category: 'Cloud Platform', demand: 'Very High' },
    'docker': { name: 'Docker', category: 'DevOps Tool', demand: 'High' }
  };

  async generateContent(request: PageRequest): Promise<SEOContent | null> {
    try {
      const template = this.templates[request.pageType];
      if (!template) {
        console.warn(`No template found for page type: ${request.pageType}`);
        return null;
      }

      // Parse slugs into readable names
      const parsedData = this.parseRequestData(request);
      
      // Generate content using template
      const content = this.populateTemplate(template, parsedData);
      
      // Generate FAQs
      const faqs = this.generateFAQs(request, parsedData);
      
      // Generate structured data
      const structuredData = this.generateStructuredData(request, parsedData, content);
      
      // Generate content blocks
      const contentBlocks = this.generateContentBlocks(request, parsedData);

      return {
        metaTitle: content.metaTitle.substring(0, 60),
        metaDescription: content.metaDescription.substring(0, 160),
        h1Title: content.h1Title,
        introContent: content.introContent,
        faqs,
        structuredData,
        contentBlocks,
        keywords: content.keywords,
        qualityScore: template.qualityScore + this.calculateQualityBonus(parsedData)
      };
    } catch (error) {
      console.error('Error generating SEO content:', error);
      return null;
    }
  }

  private parseRequestData(request: PageRequest): Record<string, any> {
    const data: Record<string, any> = {};

    if (request.primarySlug) {
      const primary = request.primarySlug.replace(/-/g, ' ');
      data.primary = primary;
      data.primaryTitle = this.titleCase(primary);
    }

    if (request.secondarySlug) {
      const secondary = request.secondarySlug.replace(/-/g, ' ');
      data.secondary = secondary;
      data.secondaryTitle = this.titleCase(secondary);
    }

    if (request.tertiarySlug) {
      const tertiary = request.tertiarySlug.replace(/-/g, ' ');
      data.tertiary = tertiary;
      data.tertiaryTitle = this.titleCase(tertiary);
    }

    // Map common patterns
    if (request.pageType.includes('job')) {
      data.job = data.primaryTitle;
      data.location = data.secondaryTitle;
    } else if (request.pageType.includes('skill')) {
      data.skill = data.primaryTitle;
      data.location = data.secondaryTitle;
    } else if (request.pageType.includes('location')) {
      data.location = data.primaryTitle;
    } else if (request.pageType.includes('company')) {
      data.company = data.primaryTitle;
    } else if (request.pageType.includes('salary')) {
      data.salary = data.primaryTitle;
      data.job = data.secondaryTitle;
      data.location = data.tertiaryTitle;
    }

    return data;
  }

  private populateTemplate(template: any, data: Record<string, any>): any {
    const result: any = {};

    Object.keys(template).forEach(key => {
      if (typeof template[key] === 'string') {
        result[key] = this.replacePlaceholders(template[key], data);
      } else if (Array.isArray(template[key])) {
        result[key] = template[key].map((item: string) => 
          this.replacePlaceholders(item, data)
        );
      } else {
        result[key] = template[key];
      }
    });

    return result;
  }

  private replacePlaceholders(text: string, data: Record<string, any>): string {
    let result = text;
    
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{${key}}`, 'g');
      result = result.replace(regex, data[key] || '');
    });

    return result;
  }

  private generateFAQs(request: PageRequest, data: Record<string, any>): Array<{ question: string; answer: string }> {
    const faqs: Array<{ question: string; answer: string }> = [];

    if (request.pageType === 'job-location' && data.job && data.location) {
      faqs.push(
        {
          question: `What are the requirements for ${data.job} jobs in ${data.location}?`,
          answer: `${data.job} positions in ${data.location} typically require relevant technical skills, educational background, and experience. Many companies also look for strong problem-solving abilities and communication skills.`
        },
        {
          question: `What is the average salary for ${data.job} in ${data.location}?`,
          answer: `${data.job} salaries in ${data.location} vary based on experience, company size, and specific skills. Entry-level positions typically start from 3-6 LPA, while experienced professionals can earn 15-30 LPA or more.`
        },
        {
          question: `Which companies are hiring ${data.job} in ${data.location}?`,
          answer: `Many leading technology companies, startups, and established businesses in ${data.location} are actively hiring ${data.job} professionals. Check our job listings for the most current opportunities.`
        }
      );
    } else if (request.pageType === 'skill-location' && data.skill && data.location) {
      faqs.push(
        {
          question: `Is ${data.skill} in demand in ${data.location}?`,
          answer: `Yes, ${data.skill} skills are highly sought after in ${data.location}. The technology sector continues to grow, creating numerous opportunities for ${data.skill} developers.`
        },
        {
          question: `How can I improve my ${data.skill} skills for jobs in ${data.location}?`,
          answer: `To enhance your ${data.skill} skills, consider taking online courses, building projects, contributing to open source, and staying updated with the latest ${data.skill} trends and best practices.`
        }
      );
    } else if (request.pageType === 'location' && data.location) {
      faqs.push(
        {
          question: `What industries are prominent in ${data.location}?`,
          answer: `${data.location} has a diverse economy with strong presence in technology, finance, healthcare, and manufacturing sectors, offering various career opportunities.`
        },
        {
          question: `How is the job market in ${data.location}?`,
          answer: `The job market in ${data.location} is dynamic with growing opportunities across multiple sectors. The city attracts both startups and established companies, creating a vibrant employment landscape.`
        }
      );
    }

    return faqs;
  }

  private generateStructuredData(request: PageRequest, data: Record<string, any>, content: any): any {
    const baseStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": content.h1Title,
      "description": content.metaDescription,
      "url": `https://talentxcel.in/${request.pageType}/${request.primarySlug}${request.secondarySlug ? `/${request.secondarySlug}` : ''}`,
      "mainEntity": {
        "@type": "Organization",
        "name": "TalentXcel",
        "url": "https://talentxcel.in"
      }
    };

    if (request.pageType.includes('job')) {
      return {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": data.job,
        "description": content.metaDescription,
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": data.location
          }
        },
        "hiringOrganization": {
          "@type": "Organization",
          "name": "TalentXcel"
        }
      };
    }

    return baseStructuredData;
  }

  private generateContentBlocks(request: PageRequest, data: Record<string, any>): any[] {
    const blocks = [];

    if (request.pageType === 'job-location' && data.job && data.location) {
      blocks.push(
        {
          type: 'overview',
          title: `${data.job} Career Overview in ${data.location}`,
          content: `Explore the thriving ${data.job} job market in ${data.location}. This comprehensive guide covers opportunities, salary expectations, and career growth prospects.`
        },
        {
          type: 'skills',
          title: 'Key Skills Required',
          content: `Success as a ${data.job} in ${data.location} requires a combination of technical expertise, problem-solving abilities, and continuous learning mindset.`
        },
        {
          type: 'companies',
          title: 'Top Hiring Companies',
          content: `Leading companies in ${data.location} are actively recruiting ${data.job} professionals. From established corporations to innovative startups, opportunities abound.`
        }
      );
    }

    return blocks;
  }

  private calculateQualityBonus(data: Record<string, any>): number {
    let bonus = 0;

    // Bonus for popular locations
    if (data.location && ['bangalore', 'mumbai', 'delhi', 'hyderabad'].includes(data.location.toLowerCase())) {
      bonus += 5;
    }

    // Bonus for in-demand skills
    if (data.skill && ['javascript', 'python', 'react', 'aws'].includes(data.skill.toLowerCase())) {
      bonus += 5;
    }

    // Bonus for popular job roles
    if (data.job && ['software engineer', 'data scientist', 'product manager'].includes(data.job.toLowerCase())) {
      bonus += 5;
    }

    return Math.min(bonus, 15); // Cap at 15 points
  }

  private titleCase(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }
}