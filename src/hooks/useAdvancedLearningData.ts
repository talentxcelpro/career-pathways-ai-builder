import { useMemo } from 'react';
import { useStructuredData } from './useStructuredData';

interface LearningPageSEOData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  structuredData: string;
}

interface AdvancedLearningConfig {
  pageType: 'hub' | 'courses' | 'paths' | 'category' | 'search';
  category?: string;
  searchQuery?: string;
  userContext?: {
    isAuthenticated: boolean;
    completedCourses: number;
    currentPath?: string;
  };
}

export const useAdvancedLearningData = (config: AdvancedLearningConfig) => {
  const seoData = useMemo((): LearningPageSEOData => {
    const baseUrl = 'https://talentxcel.lovable.app';
    
    switch (config.pageType) {
      case 'hub':
        return {
          title: 'TalentXcel Learning Hub | Professional Skills Development Platform',
          description: 'Master industry-relevant skills with 7,000+ courses across technology, business, healthcare, and more. Join millions of learners advancing their careers.',
          keywords: ['online learning', 'professional development', 'skill training', 'career advancement', 'technology courses', 'business training'],
          canonicalUrl: `${baseUrl}/learning`,
          structuredData: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": "TalentXcel Learning",
            "description": "Professional skills development platform with comprehensive learning solutions",
            "url": `${baseUrl}/learning`,
            "sameAs": [
              "https://linkedin.com/company/talentxcel",
              "https://twitter.com/talentxcel"
            ],
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "US"
            },
            "offers": {
              "@type": "Offer",
              "category": "Educational Services",
              "availability": "https://schema.org/InStock"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Learning Courses",
              "itemListElement": [
                {
                  "@type": "Course",
                  "name": "Technology Courses",
                  "description": "2,100+ technology and programming courses",
                  "provider": {
                    "@type": "Organization",
                    "name": "TalentXcel"
                  }
                },
                {
                  "@type": "Course",
                  "name": "Business Courses", 
                  "description": "1,500+ business and management courses",
                  "provider": {
                    "@type": "Organization",
                    "name": "TalentXcel"
                  }
                }
              ]
            }
          })
        };

      case 'category':
        const categoryName = config.category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Courses';
        return {
          title: `${categoryName} Courses | TalentXcel Learning Platform`,
          description: `Explore ${categoryName.toLowerCase()} courses designed by industry experts. Build practical skills and advance your career with hands-on projects and real-world applications.`,
          keywords: [categoryName.toLowerCase(), 'online courses', 'professional training', 'skill development', 'certification'],
          canonicalUrl: `${baseUrl}/learning/courses?category=${config.category}`,
          structuredData: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `${categoryName} Courses`,
            "description": `Professional ${categoryName.toLowerCase()} courses and training programs`,
            "url": `${baseUrl}/learning/courses?category=${config.category}`,
            "mainEntity": {
              "@type": "ItemList",
              "name": `${categoryName} Course Collection`,
              "description": `Curated collection of ${categoryName.toLowerCase()} courses for professional development`
            }
          })
        };

      case 'search':
        const query = config.searchQuery || 'courses';
        return {
          title: `Search Results for "${query}" | TalentXcel Learning`,
          description: `Find the best courses for "${query}". Browse through thousands of expert-led courses and start learning today.`,
          keywords: [query, 'course search', 'learning', 'online education', 'skill development'],
          canonicalUrl: `${baseUrl}/learning/search?q=${encodeURIComponent(query)}`,
          structuredData: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            "name": `Search Results for ${query}`,
            "url": `${baseUrl}/learning/search?q=${encodeURIComponent(query)}`
          })
        };

      default:
        return {
          title: 'TalentXcel Learning | Professional Development Platform',
          description: 'Advance your career with industry-relevant courses and certifications.',
          keywords: ['learning', 'professional development', 'online courses'],
          canonicalUrl: `${baseUrl}/learning`,
          structuredData: '{}'
        };
    }
  }, [config]);

  // Apply structured data
  useStructuredData({
    schema: seoData.structuredData,
    id: `learning-${config.pageType}`
  });

  const breadcrumbs = useMemo(() => {
    const crumbs = [
      { label: 'Home', href: '/' },
      { label: 'Learning', href: '/learning' }
    ];

    if (config.pageType === 'category' && config.category) {
      crumbs.push({
        label: config.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        href: `/learning/courses?category=${config.category}`
      });
    } else if (config.pageType === 'search' && config.searchQuery) {
      crumbs.push({
        label: `Search: ${config.searchQuery}`,
        href: `/learning/search?q=${encodeURIComponent(config.searchQuery)}`
      });
    }

    return crumbs;
  }, [config]);

  const performanceOptimizations = useMemo(() => ({
    preloadResources: [
      { href: '/learning/courses', as: 'fetch' },
      { href: '/learning/paths', as: 'fetch' },
      { href: '/api/learning/categories', as: 'fetch' }
    ],
    lazyLoadComponents: config.pageType === 'hub' ? [
      'PersonalizedDashboard',
      'LearningSearchHub',
      'SmartLearningNav'
    ] : []
  }), [config.pageType]);

  return {
    seoData,
    breadcrumbs,
    performanceOptimizations,
    isPersonalized: !!config.userContext?.isAuthenticated
  };
};