/**
 * Enhanced Sitemap Generator for TalentXcel's 2M+ Pages
 * Generates batched XML sitemaps with proper pagination and indexing
 */

import { generateJobSitemapUrls, generateNetworkSitemapUrls, generateHierarchicalJobUrls, generateHierarchicalToolUrls } from './automatedSEOPipeline';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

const URLS_PER_SITEMAP = 50000; // Google's limit
const BASE_URL = 'https://talentxcel.in';

// ============= XML GENERATION UTILITIES =============

const generateSitemapXML = (urls: SitemapUrl[]): string => {
  const urlEntries = urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod.split('T')[0]}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
};

const generateSitemapIndex = (sitemapFiles: string[]): string => {
  const now = new Date().toISOString().split('T')[0];
  
  const sitemapEntries = sitemapFiles.map(file => `  <sitemap>
    <loc>${BASE_URL}/${file}</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries}
</sitemapindex>`;
};

// ============= STATIC PAGES =============

const getStaticPages = (): SitemapUrl[] => {
  const now = new Date().toISOString();
  
  return [
    {
      loc: `${BASE_URL}/`,
      lastmod: now,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${BASE_URL}/jobs`,
      lastmod: now,
      changefreq: 'hourly',
      priority: 0.9
    },
    {
      loc: `${BASE_URL}/companies`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.8
    },
    {
      loc: `${BASE_URL}/network`,
      lastmod: now,
      changefreq: 'hourly',
      priority: 0.8
    },
    {
      loc: `${BASE_URL}/tools`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.7
    },
    {
      loc: `${BASE_URL}/services`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.7
    },
    {
      loc: `${BASE_URL}/learning`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.7
    },
    {
      loc: `${BASE_URL}/colleges`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      loc: `${BASE_URL}/career-map`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.7
    },
    {
      loc: `${BASE_URL}/resume-builder`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8
    }
  ];
};

// ============= BATCHED SITEMAP GENERATORS =============

export const generateJobsSitemaps = async (): Promise<string[]> => {
  console.log('📄 Generating jobs sitemaps...');
  
  const sitemapFiles: string[] = [];
  let offset = 0;
  let batchCount = 1;
  
  // Generate dynamic job URLs
  while (true) {
    const urls = await generateJobSitemapUrls(offset, URLS_PER_SITEMAP);
    
    if (urls.length === 0) break;
    
    const fileName = `sitemaps/jobs-sitemap-${batchCount}.xml`;
    const sitemapXML = generateSitemapXML(urls as SitemapUrl[]);
    
    // In a real implementation, you'd write this to file or storage
    console.log(`Generated ${fileName} with ${urls.length} URLs`);
    sitemapFiles.push(fileName);
    
    offset += URLS_PER_SITEMAP;
    batchCount++;
    
    if (urls.length < URLS_PER_SITEMAP) break;
  }
  
  // Add hierarchical job URLs
  const hierarchicalUrls = generateHierarchicalJobUrls();
  if (hierarchicalUrls.length > 0) {
    const fileName = `sitemaps/jobs-hierarchical-sitemap.xml`;
    const sitemapXML = generateSitemapXML(hierarchicalUrls as SitemapUrl[]);
    console.log(`Generated ${fileName} with ${hierarchicalUrls.length} hierarchical URLs`);
    sitemapFiles.push(fileName);
  }
  
  console.log(`✅ Generated ${sitemapFiles.length} job sitemaps`);
  return sitemapFiles;
};

export const generateNetworkSitemaps = async (): Promise<string[]> => {
  console.log('📄 Generating network sitemaps...');
  
  const sitemapFiles: string[] = [];
  let offset = 0;
  let batchCount = 1;
  
  while (true) {
    const urls = await generateNetworkSitemapUrls(offset, URLS_PER_SITEMAP);
    
    if (urls.length === 0) break;
    
    const fileName = `sitemaps/network-sitemap-${batchCount}.xml`;
    const sitemapXML = generateSitemapXML(urls as SitemapUrl[]);
    
    console.log(`Generated ${fileName} with ${urls.length} URLs`);
    sitemapFiles.push(fileName);
    
    offset += URLS_PER_SITEMAP;
    batchCount++;
    
    if (urls.length < URLS_PER_SITEMAP) break;
  }
  
  console.log(`✅ Generated ${sitemapFiles.length} network sitemaps`);
  return sitemapFiles;
};

export const generateToolsAndServicesSitemaps = (): string[] => {
  console.log('📄 Generating tools and services sitemaps...');
  
  const sitemapFiles: string[] = [];
  
  // Tools URLs
  const toolUrls = generateHierarchicalToolUrls();
  if (toolUrls.length > 0) {
    const fileName = 'sitemaps/tools-sitemap.xml';
    const sitemapXML = generateSitemapXML(toolUrls as SitemapUrl[]);
    console.log(`Generated ${fileName} with ${toolUrls.length} URLs`);
    sitemapFiles.push(fileName);
  }
  
  // Services URLs
  const serviceUrls = generateServicesUrls();
  if (serviceUrls.length > 0) {
    const fileName = 'sitemaps/services-sitemap.xml';
    const sitemapXML = generateSitemapXML(serviceUrls);
    console.log(`Generated ${fileName} with ${serviceUrls.length} URLs`);
    sitemapFiles.push(fileName);
  }
  
  // Learning URLs
  const learningUrls = generateLearningUrls();
  if (learningUrls.length > 0) {
    const fileName = 'sitemaps/learning-sitemap.xml';
    const sitemapXML = generateSitemapXML(learningUrls);
    console.log(`Generated ${fileName} with ${learningUrls.length} URLs`);
    sitemapFiles.push(fileName);
  }
  
  // Colleges URLs
  const collegeUrls = generateCollegeUrls();
  if (collegeUrls.length > 0) {
    const fileName = 'sitemaps/colleges-sitemap.xml';
    const sitemapXML = generateSitemapXML(collegeUrls);
    console.log(`Generated ${fileName} with ${collegeUrls.length} URLs`);
    sitemapFiles.push(fileName);
  }
  
  // Career Map URLs
  const careerMapUrls = generateCareerMapUrls();
  if (careerMapUrls.length > 0) {
    const fileName = 'sitemaps/career-map-sitemap.xml';
    const sitemapXML = generateSitemapXML(careerMapUrls);
    console.log(`Generated ${fileName} with ${careerMapUrls.length} URLs`);
    sitemapFiles.push(fileName);
  }
  
  console.log(`✅ Generated ${sitemapFiles.length} tools/services sitemaps`);
  return sitemapFiles;
};

// ============= ADDITIONAL URL GENERATORS =============

const generateServicesUrls = (): SitemapUrl[] => {
  const services = ['resume-writing', 'career-coaching', 'interview-prep', 'linkedin-optimization'];
  const serviceTypes = ['professional', 'executive', 'entry-level', 'career-change'];
  const templates = ['ats-optimized', 'executive-level', 'creative-field'];
  
  const urls: SitemapUrl[] = [];
  const today = new Date().toISOString();
  
  services.forEach(service => {
    urls.push({
      loc: `${BASE_URL}/services/${service}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.6
    });
    
    serviceTypes.forEach(type => {
      urls.push({
        loc: `${BASE_URL}/services/${service}/${type}`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.5
      });
    });
  });
  
  // Resume writing templates
  templates.forEach(template => {
    urls.push({
      loc: `${BASE_URL}/services/resume-writing/${template}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.6
    });
  });
  
  return urls;
};

const generateLearningUrls = (): SitemapUrl[] => {
  const categories = ['programming', 'data-science', 'digital-marketing', 'business-skills'];
  const levels = ['beginner', 'intermediate', 'advanced'];
  const skills = ['javascript', 'python', 'sql', 'project-management', 'leadership'];
  
  const urls: SitemapUrl[] = [];
  const today = new Date().toISOString();
  
  categories.forEach(category => {
    urls.push({
      loc: `${BASE_URL}/learning/${category}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.6
    });
    
    levels.forEach(level => {
      urls.push({
        loc: `${BASE_URL}/learning/${category}/${level}`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.5
      });
    });
  });
  
  // Learning paths by skill
  skills.forEach(skill => {
    urls.push({
      loc: `${BASE_URL}/learning/paths/${skill}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.7
    });
  });
  
  return urls;
};

const generateCollegeUrls = (): SitemapUrl[] => {
  const locations = ['mumbai', 'delhi', 'bangalore', 'pune', 'hyderabad'];
  const fields = ['engineering', 'business', 'medicine', 'arts'];
  
  const urls: SitemapUrl[] = [];
  const today = new Date().toISOString();
  
  locations.forEach(location => {
    urls.push({
      loc: `${BASE_URL}/colleges/${location}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: 0.6
    });
    
    fields.forEach(field => {
      urls.push({
        loc: `${BASE_URL}/colleges/${location}/${field}`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.5
      });
    });
  });
  
  return urls;
};

const generateCareerMapUrls = (): SitemapUrl[] => {
  const industries = ['technology', 'healthcare', 'finance', 'education'];
  const paths = ['entry-level', 'mid-level', 'senior-level'];
  const roles = ['software-engineer', 'data-scientist', 'product-manager'];
  
  const urls: SitemapUrl[] = [];
  const today = new Date().toISOString();
  
  industries.forEach(industry => {
    urls.push({
      loc: `${BASE_URL}/career-map/${industry}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.6
    });
    
    paths.forEach(path => {
      urls.push({
        loc: `${BASE_URL}/career-map/${industry}/${path}`,
        lastmod: today,
        changefreq: 'monthly',
        priority: 0.5
      });
    });
  });
  
  // Career progression by role
  roles.forEach(role => {
    urls.push({
      loc: `${BASE_URL}/career-map/progression/${role}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.7
    });
  });
  
  return urls;
};

// ============= MAIN SITEMAP GENERATION =============

export const generateAllSitemaps = async (): Promise<{
  sitemapIndex: string;
  sitemapFiles: string[];
  stats: { [key: string]: number };
}> => {
  console.log('🚀 Starting comprehensive sitemap generation...');
  
  const allSitemapFiles: string[] = [];
  const stats: { [key: string]: number } = {};
  
  // Generate static pages sitemap
  const staticUrls = getStaticPages();
  const staticSitemapFile = 'sitemaps/static-sitemap.xml';
  const staticSitemapXML = generateSitemapXML(staticUrls);
  console.log(`Generated ${staticSitemapFile} with ${staticUrls.length} static URLs`);
  allSitemapFiles.push(staticSitemapFile);
  stats.static = staticUrls.length;
  
  // Generate jobs sitemaps
  const jobSitemapFiles = await generateJobsSitemaps();
  allSitemapFiles.push(...jobSitemapFiles);
  stats.jobs = jobSitemapFiles.length;
  
  // Generate network sitemaps
  const networkSitemapFiles = await generateNetworkSitemaps();
  allSitemapFiles.push(...networkSitemapFiles);
  stats.network = networkSitemapFiles.length;
  
  // Generate tools, services, learning, etc. sitemaps
  const additionalSitemapFiles = generateToolsAndServicesSitemaps();
  allSitemapFiles.push(...additionalSitemapFiles);
  stats.additional = additionalSitemapFiles.length;
  
  // Generate sitemap index
  const sitemapIndex = generateSitemapIndex(allSitemapFiles);
  
  const totalSitemaps = allSitemapFiles.length;
  const estimatedUrls = totalSitemaps * 25000; // Average estimate
  
  console.log('✅ Sitemap generation complete!');
  console.log(`📊 Statistics:`);
  console.log(`   - Total sitemaps: ${totalSitemaps}`);
  console.log(`   - Static pages: ${stats.static}`);
  console.log(`   - Job sitemaps: ${stats.jobs}`);
  console.log(`   - Network sitemaps: ${stats.network}`);
  console.log(`   - Additional sitemaps: ${stats.additional}`);
  console.log(`   - Estimated total URLs: ~${estimatedUrls.toLocaleString()}`);
  
  return {
    sitemapIndex,
    sitemapFiles: allSitemapFiles,
    stats
  };
};

// ============= SITEMAP VALIDATION =============

export const validateSitemaps = (sitemapFiles: string[]): {
  isValid: boolean;
  warnings: string[];
  recommendations: string[];
} => {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Check sitemap count
  if (sitemapFiles.length > 50000) {
    warnings.push('More than 50,000 sitemaps in index (Google limit)');
  }
  
  if (sitemapFiles.length > 1000) {
    recommendations.push('Consider further categorizing sitemaps for better crawl efficiency');
  }
  
  // Check file naming patterns
  const hasConsistentNaming = sitemapFiles.every(file => 
    file.includes('sitemap') && file.endsWith('.xml')
  );
  
  if (!hasConsistentNaming) {
    warnings.push('Inconsistent sitemap file naming detected');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    recommendations
  };
};