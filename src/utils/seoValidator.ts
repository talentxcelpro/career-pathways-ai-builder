/**
 * SEO Validation Utilities for ensuring optimal SEO implementation
 */

export interface SEOValidationResult {
  isValid: boolean;
  score: number;
  issues: SEOIssue[];
  recommendations: string[];
}

export interface SEOIssue {
  type: 'critical' | 'warning' | 'info';
  category: 'meta' | 'content' | 'technical' | 'performance';
  message: string;
  fix?: string;
}

/**
 * Validate meta tags for SEO compliance
 */
export const validateMetaTags = (
  title?: string,
  description?: string,
  keywords?: string[]
): SEOValidationResult => {
  const issues: SEOIssue[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Title validation
  if (!title) {
    issues.push({
      type: 'critical',
      category: 'meta',
      message: 'Missing page title',
      fix: 'Add a descriptive title tag (50-60 characters)'
    });
    score -= 25;
  } else if (title.length < 30) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Title too short',
      fix: 'Expand title to 50-60 characters for better SEO'
    });
    score -= 10;
  } else if (title.length > 60) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Title too long',
      fix: 'Shorten title to under 60 characters'
    });
    score -= 10;
  }

  // Description validation
  if (!description) {
    issues.push({
      type: 'critical',
      category: 'meta',
      message: 'Missing meta description',
      fix: 'Add a compelling meta description (150-160 characters)'
    });
    score -= 25;
  } else if (description.length < 120) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Meta description too short',
      fix: 'Expand description to 150-160 characters'
    });
    score -= 10;
  } else if (description.length > 160) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Meta description too long',
      fix: 'Shorten description to under 160 characters'
    });
    score -= 10;
  }

  // Keywords validation
  if (!keywords || keywords.length === 0) {
    issues.push({
      type: 'info',
      category: 'meta',
      message: 'No keywords specified',
      fix: 'Add relevant keywords for better targeting'
    });
    score -= 5;
  } else if (keywords.length > 10) {
    issues.push({
      type: 'warning',
      category: 'meta',
      message: 'Too many keywords',
      fix: 'Focus on 3-5 primary keywords'
    });
    score -= 5;
  }

  // Generate recommendations
  if (score < 80) {
    recommendations.push('Focus on critical meta tag issues first');
  }
  if (issues.some(i => i.category === 'meta')) {
    recommendations.push('Review and optimize meta tags for better search visibility');
  }

  return {
    isValid: issues.filter(i => i.type === 'critical').length === 0,
    score: Math.max(0, score),
    issues,
    recommendations
  };
};

/**
 * Generate SEO-optimized meta description fallbacks
 */
export const generateMetaDescription = (
  pageType: string,
  data?: any,
  fallback?: string
): string => {
  const descriptions: Record<string, string> = {
    home: 'Accelerate your career with TalentXcel. Find dream jobs, learn new skills, network with professionals, and get AI-powered career guidance. Join 50,000+ professionals.',
    jobs: 'Discover thousands of job opportunities across India. Latest openings in IT, Finance, Marketing, Healthcare, and more. Apply with one click and get hired faster.',
    'job-detail': data?.title && data?.company && data?.location 
      ? `Apply for ${data.title} at ${data.company} in ${data.location}. ${data.salary ? `Salary: ${data.salary}. ` : ''}Join top companies and advance your career with TalentXcel.`
      : 'Explore exciting job opportunities and advance your career with top companies. Apply now on TalentXcel.',
    companies: 'Explore top companies hiring in India. Get insights into company culture, salaries, interview processes, and current job openings. Make informed career decisions.',
    'company-detail': data?.name 
      ? `Explore career opportunities at ${data.name}. Learn about company culture, current openings, employee benefits, and growth opportunities. Apply to join their team.`
      : 'Discover amazing companies and career opportunities. Explore company profiles, culture, and current job openings.',
    learning: 'Learn new skills with free online courses. Programming, Data Science, Digital Marketing, AI/ML, and more. Get certified and boost your career prospects.',
    'course-detail': data?.title 
      ? `Master new skills with ${data.title}. ${data.duration ? `${data.duration} comprehensive course. ` : ''}Get certified and advance your career with industry-relevant skills.`
      : 'Enhance your skills with comprehensive online courses. Get certified and boost your career prospects.',
    network: 'Build your professional network. Connect with industry experts, join professional groups, attend virtual events, and advance your career through meaningful connections.',
    salary: 'Discover salary insights and compensation data across industries in India. Make informed career decisions with comprehensive salary reports and trends.',
    profile: 'Manage your professional profile, track job applications, update skills, and optimize your career journey with personalized insights and recommendations.',
    'auth-login': 'Sign in to TalentXcel to access thousands of job opportunities, professional networking, skill development courses, and AI-powered career guidance.',
    'auth-register': 'Join TalentXcel today! Create your profile to access exclusive job opportunities, professional networking, and career development resources.',
    'not-found': 'Page not found. Explore TalentXcel for job opportunities, professional networking, skill development, and AI-powered career guidance.'
  };

  return descriptions[pageType] || fallback || descriptions.home;
};

/**
 * Check for duplicate titles across pages
 */
export const checkDuplicateTitles = (titles: { url: string; title: string }[]): string[] => {
  const titleMap = new Map<string, string[]>();
  
  titles.forEach(({ url, title }) => {
    if (!titleMap.has(title)) {
      titleMap.set(title, []);
    }
    titleMap.get(title)!.push(url);
  });

  const duplicates: string[] = [];
  titleMap.forEach((urls, title) => {
    if (urls.length > 1) {
      duplicates.push(`Title "${title}" used on ${urls.length} pages: ${urls.join(', ')}`);
    }
  });

  return duplicates;
};

/**
 * Validate image alt attributes
 */
export const validateImageAlt = (images: { src: string; alt?: string }[]): SEOIssue[] => {
  const issues: SEOIssue[] = [];

  images.forEach(({ src, alt }) => {
    if (!alt || alt.trim() === '') {
      issues.push({
        type: 'critical',
        category: 'content',
        message: `Missing alt attribute for image: ${src}`,
        fix: 'Add descriptive alt text for accessibility and SEO'
      });
    } else if (alt.length < 5) {
      issues.push({
        type: 'warning',
        category: 'content',
        message: `Alt text too short for image: ${src}`,
        fix: 'Provide more descriptive alt text (5+ characters)'
      });
    } else if (alt.length > 125) {
      issues.push({
        type: 'info',
        category: 'content',
        message: `Alt text too long for image: ${src}`,
        fix: 'Keep alt text under 125 characters for optimal accessibility'
      });
    }
  });

  return issues;
};

/**
 * Generate SEO score based on multiple factors
 */
export const calculateSEOScore = (factors: {
  hasTitle: boolean;
  hasDescription: boolean;
  hasKeywords: boolean;
  hasAltText: boolean;
  hasStructuredData: boolean;
  hasCanonical: boolean;
  pageLoadSpeed: number; // in seconds
  mobileOptimized: boolean;
}): number => {
  let score = 0;
  const maxScore = 100;

  // Meta tags (40 points)
  if (factors.hasTitle) score += 15;
  if (factors.hasDescription) score += 15;
  if (factors.hasKeywords) score += 10;

  // Content optimization (20 points)
  if (factors.hasAltText) score += 10;
  if (factors.hasStructuredData) score += 10;

  // Technical SEO (20 points)
  if (factors.hasCanonical) score += 10;
  if (factors.pageLoadSpeed < 3) score += 10;
  else if (factors.pageLoadSpeed < 5) score += 5;

  // Mobile optimization (20 points)
  if (factors.mobileOptimized) score += 20;

  return Math.min(score, maxScore);
};