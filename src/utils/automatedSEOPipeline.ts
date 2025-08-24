/**
 * Automated SEO Pipeline for TalentXcel
 * Generates JSON-LD, meta tags, and sitemaps for 2M+ pages
 */

import { supabase } from '@/integrations/supabase/client';

// Types for different content
interface JobData {
  id: string;
  title: string;
  description: string;
  company_name: string;
  employment_type: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  created_at: string;
  updated_at?: string;
  seo_slug?: string;
  expires_at?: string;
}

interface NetworkPostData {
  id: string;
  headline: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at?: string;
}

// ============= JSON-LD GENERATORS =============

export const generateJobJSONLD = (job: JobData) => {
  const locationParts = job.location?.split(',') || [];
  const city = locationParts[0]?.trim() || 'Unknown City';
  const state = locationParts[1]?.trim() || 'Unknown State';
  const country = job.location?.toLowerCase().includes('uae') ? 'AE' : 'IN';

  return {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "identifier": {
      "@type": "PropertyValue",
      "name": "TalentXcel",
      "value": job.id
    },
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company_name,
      "sameAs": "https://talentxcel.in"
    },
    "employmentType": job.employment_type?.toUpperCase().replace('-', '_') || 'FULL_TIME',
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city,
        "addressRegion": state,
        "addressCountry": country
      }
    },
    "baseSalary": job.salary_min ? {
      "@type": "MonetaryAmount",
      "currency": country === 'AE' ? 'AED' : 'INR',
      "value": {
        "@type": "QuantitativeValue",
        "value": job.salary_min,
        "minValue": job.salary_min,
        "maxValue": job.salary_max || job.salary_min,
        "unitText": "YEAR"
      }
    } : undefined,
    "datePosted": job.created_at.split('T')[0],
    "validThrough": job.expires_at?.split('T')[0] || (() => {
      const date = new Date(job.created_at);
      date.setDate(date.getDate() + 30);
      return date.toISOString().split('T')[0];
    })(),
    "industry": "Information Technology",
    "url": `https://talentxcel.in/jobs/${job.seo_slug || job.id}`
  };
};

export const generateNetworkPostJSONLD = (post: NetworkPostData) => {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.headline,
    "description": post.content?.substring(0, 160) + '...',
    "author": {
      "@type": "Person",
      "name": "TalentXcel User"
    },
    "publisher": {
      "@type": "Organization",
      "name": "TalentXcel",
      "logo": {
        "@type": "ImageObject",
        "url": "https://talentxcel.in/logo.png"
      }
    },
    "datePublished": post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://talentxcel.in/network/${post.id}`
    }
  };
};

// ============= META TAG GENERATORS =============

export const generateJobMetaTags = (job: JobData) => {
  const locationParts = job.location?.split(',') || [];
  const city = locationParts[0]?.trim();
  
  return {
    title: `${job.title} at ${job.company_name}${city ? ` in ${city}` : ''} | TalentXcel Jobs`,
    description: `Apply for ${job.title} position at ${job.company_name}${city ? ` in ${city}` : ''}. ${job.description?.substring(0, 100)}... Join TalentXcel today!`,
    keywords: [
      job.title.toLowerCase(),
      `${job.title.toLowerCase()} jobs`,
      job.company_name.toLowerCase(),
      city?.toLowerCase(),
      job.employment_type?.toLowerCase(),
      'career opportunities',
      'talentxcel jobs'
    ].filter(Boolean),
    canonical: `https://talentxcel.in/jobs/${job.seo_slug || job.id}`
  };
};

export const generateNetworkPostMetaTags = (post: NetworkPostData) => {
  return {
    title: `${post.headline} | TalentXcel Network`,
    description: `${post.content?.substring(0, 150)}... Join the professional conversation on TalentXcel.`,
    keywords: [
      'professional network',
      'career advice',
      'industry insights',
      'networking',
      'talentxcel community'
    ],
    canonical: `https://talentxcel.in/network/${post.id}`
  };
};

// ============= BULK CONTENT PROCESSORS =============

export const processBulkJobSEO = async (limit: number = 1000) => {
  console.log(`Processing SEO for ${limit} jobs...`);
  
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .limit(limit);

  if (error) {
    console.error('Error fetching jobs:', error);
    return { success: false, error };
  }

  const processedJobs = jobs?.map(job => ({
    id: job.id,
    jsonLD: generateJobJSONLD(job),
    metaTags: generateJobMetaTags(job),
    url: `https://talentxcel.in/jobs/${job.seo_slug || job.id}`,
    lastmod: job.updated_at || job.created_at
  })) || [];

  console.log(`✅ Processed ${processedJobs.length} jobs`);
  return { success: true, data: processedJobs, count: processedJobs.length };
};

export const processBulkNetworkSEO = async (limit: number = 1000) => {
  console.log(`Processing SEO for ${limit} network posts...`);
  
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('is_public', true)
    .eq('publication_type', 'published_content')
    .limit(limit);

  if (error) {
    console.error('Error fetching posts:', error);
    return { success: false, error };
  }

  const processedPosts = posts?.map(post => ({
    id: post.id,
    jsonLD: generateNetworkPostJSONLD(post),
    metaTags: generateNetworkPostMetaTags(post),
    url: `https://talentxcel.in/network/${post.id}`,
    lastmod: post.updated_at || post.created_at
  })) || [];

  console.log(`✅ Processed ${processedPosts.length} network posts`);
  return { success: true, data: processedPosts, count: processedPosts.length };
};

// ============= SITEMAP URL GENERATORS =============

export const generateJobSitemapUrls = async (offset: number = 0, limit: number = 50000) => {
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, seo_slug, updated_at, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return jobs?.map(job => ({
    loc: `https://talentxcel.in/jobs/${job.seo_slug || job.id}`,
    lastmod: job.updated_at || job.created_at,
    changefreq: 'daily',
    priority: 0.8
  })) || [];
};

export const generateNetworkSitemapUrls = async (offset: number = 0, limit: number = 50000) => {
  const { data: posts } = await supabase
    .from('posts')
    .select('id, updated_at, created_at')
    .eq('is_public', true)
    .eq('publication_type', 'published_content')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return posts?.map(post => ({
    loc: `https://talentxcel.in/network/${post.id}`,
    lastmod: post.updated_at || post.created_at,
    changefreq: 'weekly',
    priority: 0.6
  })) || [];
};

// ============= HIERARCHICAL SEO PAGE GENERATORS =============

export const generateHierarchicalJobUrls = () => {
  const types = ['full-time', 'part-time', 'remote', 'contract', 'internship'];
  const locations = ['mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad', 'chennai', 'kolkata'];
  const roles = ['software-engineer', 'data-scientist', 'product-manager', 'ui-ux-designer', 'business-analyst'];
  const skills = ['javascript', 'python', 'react', 'nodejs', 'machine-learning', 'sql', 'aws'];

  const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: number }> = [];
  const today = new Date().toISOString();

  // Type + Location combinations
  types.forEach(type => {
    locations.forEach(location => {
      urls.push({
        loc: `https://talentxcel.in/jobs/${type}/${location}`,
        lastmod: today,
        changefreq: 'daily',
        priority: 0.7
      });

      // Type + Location + Role combinations
      roles.forEach(role => {
        urls.push({
          loc: `https://talentxcel.in/jobs/${type}/${location}/${role}`,
          lastmod: today,
          changefreq: 'daily',
          priority: 0.8
        });
      });
    });
  });

  // Skill + Location combinations
  skills.forEach(skill => {
    locations.forEach(location => {
      urls.push({
        loc: `https://talentxcel.in/jobs/skill/${skill}/${location}`,
        lastmod: today,
        changefreq: 'daily',
        priority: 0.7
      });
    });
  });

  // Remote roles
  roles.forEach(role => {
    urls.push({
      loc: `https://talentxcel.in/jobs/remote/${role}`,
      lastmod: today,
      changefreq: 'daily',
      priority: 0.8
    });
  });

  return urls;
};

export const generateHierarchicalToolUrls = () => {
  const categories = ['resume-builder', 'interview-prep', 'career-assessment', 'salary-tools'];
  const tools = ['ai-optimizer', 'template-gallery', 'skill-analyzer', 'market-insights'];
  const templates = ['modern', 'classic', 'creative', 'professional', 'minimal'];
  
  const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: number }> = [];
  const today = new Date().toISOString();

  categories.forEach(category => {
    urls.push({
      loc: `https://talentxcel.in/tools/${category}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.6
    });

    tools.forEach(tool => {
      urls.push({
        loc: `https://talentxcel.in/tools/${category}/${tool}`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.5
      });
    });
  });

  // Resume builder templates
  templates.forEach(template => {
    urls.push({
      loc: `https://talentxcel.in/tools/resume-builder/${template}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.7
    });
  });

  return urls;
};

// ============= MAIN AUTOMATION FUNCTIONS =============

export const generateCompleteSEOData = async () => {
  console.log('🚀 Starting complete SEO data generation...');
  
  const results = {
    jobs: await processBulkJobSEO(10000),
    network: await processBulkNetworkSEO(5000),
    hierarchicalJobs: generateHierarchicalJobUrls(),
    hierarchicalTools: generateHierarchicalToolUrls(),
    timestamp: new Date().toISOString()
  };

  const totalUrls = (results.jobs.success ? results.jobs.count : 0) + 
                   (results.network.success ? results.network.count : 0) +
                   results.hierarchicalJobs.length +
                   results.hierarchicalTools.length;

  console.log(`✅ Generated SEO data for ${totalUrls} total URLs`);
  console.log(`   - Jobs: ${results.jobs.success ? results.jobs.count : 0}`);
  console.log(`   - Network: ${results.network.success ? results.network.count : 0}`);
  console.log(`   - Hierarchical Jobs: ${results.hierarchicalJobs.length}`);
  console.log(`   - Hierarchical Tools: ${results.hierarchicalTools.length}`);

  return results;
};

export const validateSEOImplementation = async () => {
  console.log('🔍 Validating SEO implementation...');
  
  const checks = {
    jobsWithSEOSlug: 0,
    jobsWithoutSEOSlug: 0,
    postsCount: 0,
    totalValidUrls: 0
  };

  // Check jobs with SEO slugs
  const { data: jobsWithSlug } = await supabase
    .from('jobs')
    .select('id')
    .not('seo_slug', 'is', null)
    .eq('is_active', true);
  
  checks.jobsWithSEOSlug = jobsWithSlug?.length || 0;

  // Check jobs without SEO slugs
  const { data: jobsWithoutSlug } = await supabase
    .from('jobs')
    .select('id')
    .is('seo_slug', null)
    .eq('is_active', true);
    
  checks.jobsWithoutSEOSlug = jobsWithoutSlug?.length || 0;

  // Check posts
  const { data: posts } = await supabase
    .from('posts')
    .select('id')
    .eq('is_public', true);
    
  checks.postsCount = posts?.length || 0;

  checks.totalValidUrls = checks.jobsWithSEOSlug + checks.postsCount;

  console.log('📊 SEO Validation Results:');
  console.log(`   - Jobs with SEO slugs: ${checks.jobsWithSEOSlug}`);
  console.log(`   - Jobs needing SEO slugs: ${checks.jobsWithoutSEOSlug}`);
  console.log(`   - Network posts: ${checks.postsCount}`);
  console.log(`   - Total valid URLs: ${checks.totalValidUrls}`);

  return checks;
};