import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { validateMetaTags, validateImageAlt, calculateSEOScore, type SEOValidationResult } from '@/utils/seoValidator';

interface SEOAuditResult {
  score: number;
  issues: any[];
  recommendations: string[];
  pageMetrics: {
    hasTitle: boolean;
    hasDescription: boolean;
    hasKeywords: boolean;
    hasCanonical: boolean;
    hasStructuredData: boolean;
    imagesWithoutAlt: number;
    totalImages: number;
    loadTime: number;
    mobileOptimized: boolean;
  };
}

/**
 * Hook for real-time SEO auditing and monitoring
 */
export const useSEOAudit = () => {
  const location = useLocation();
  const [auditResult, setAuditResult] = useState<SEOAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const performAudit = async (): Promise<SEOAuditResult> => {
    setIsAuditing(true);
    
    try {
      // Get current page meta information
      const title = document.title;
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content')?.split(',').map(k => k.trim()) || [];
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
      const structuredData = document.querySelector('script[type="application/ld+json"]')?.textContent || '';

      // Validate meta tags
      const metaValidation = validateMetaTags(title, metaDescription, metaKeywords);

      // Check images for alt attributes
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt
      }));
      const imageIssues = validateImageAlt(images);
      const imagesWithoutAlt = imageIssues.filter(issue => issue.type === 'critical').length;

      // Calculate page load time (approximate)
      const loadTime = performance.timing ? 
        (performance.timing.loadEventEnd - performance.timing.loadEventStart) / 1000 : 0;

      // Check mobile optimization
      const viewport = document.querySelector('meta[name="viewport"]');
      const mobileOptimized = viewport?.getAttribute('content')?.includes('width=device-width') || false;

      const pageMetrics = {
        hasTitle: !!title,
        hasDescription: !!metaDescription,
        hasKeywords: metaKeywords.length > 0,
        hasCanonical: !!canonical,
        hasStructuredData: !!structuredData,
        imagesWithoutAlt,
        totalImages: images.length,
        loadTime,
        mobileOptimized
      };

      // Calculate overall SEO score
      const score = calculateSEOScore({
        hasTitle: pageMetrics.hasTitle,
        hasDescription: pageMetrics.hasDescription,
        hasKeywords: pageMetrics.hasKeywords,
        hasAltText: imagesWithoutAlt === 0,
        hasStructuredData: pageMetrics.hasStructuredData,
        hasCanonical: pageMetrics.hasCanonical,
        pageLoadSpeed: loadTime,
        mobileOptimized: pageMetrics.mobileOptimized
      });

      // Combine all issues and recommendations
      const allIssues = [...metaValidation.issues, ...imageIssues];
      const recommendations = [
        ...metaValidation.recommendations,
        ...(imagesWithoutAlt > 0 ? [`Add alt text to ${imagesWithoutAlt} images`] : []),
        ...(loadTime > 3 ? ['Optimize page load speed'] : []),
        ...(!mobileOptimized ? ['Add mobile viewport meta tag'] : [])
      ];

      return {
        score,
        issues: allIssues,
        recommendations,
        pageMetrics
      };
    } catch (error) {
      console.error('SEO audit failed:', error);
      return {
        score: 0,
        issues: [],
        recommendations: ['SEO audit failed - check console for errors'],
        pageMetrics: {
          hasTitle: false,
          hasDescription: false,
          hasKeywords: false,
          hasCanonical: false,
          hasStructuredData: false,
          imagesWithoutAlt: 0,
          totalImages: 0,
          loadTime: 0,
          mobileOptimized: false
        }
      };
    } finally {
      setIsAuditing(false);
    }
  };

  // Perform audit when location changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      const result = await performAudit();
      setAuditResult(result);
    }, 1000); // Wait for page to fully load

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return {
    auditResult,
    isAuditing,
    performAudit,
    refreshAudit: async () => {
      const result = await performAudit();
      setAuditResult(result);
    }
  };
};

/**
 * Hook for tracking SEO improvements over time
 */
export const useSEOTracking = () => {
  const [history, setHistory] = useState<Array<{ date: string; score: number; url: string }>>([]);

  const recordScore = (score: number, url: string) => {
    const record = {
      date: new Date().toISOString(),
      score,
      url
    };

    setHistory(prev => {
      const updated = [...prev, record];
      // Keep only last 50 records
      return updated.slice(-50);
    });

    // Store in localStorage for persistence
    localStorage.setItem('seo-tracking-history', JSON.stringify(history));
  };

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('seo-tracking-history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to load SEO tracking history:', error);
      }
    }
  }, []);

  const getAverageScore = () => {
    if (history.length === 0) return 0;
    return history.reduce((sum, record) => sum + record.score, 0) / history.length;
  };

  const getScoreTrend = () => {
    if (history.length < 2) return 'stable';
    const recent = history.slice(-5);
    const earlier = history.slice(-10, -5);
    
    if (recent.length === 0 || earlier.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, r) => sum + r.score, 0) / earlier.length;
    
    if (recentAvg > earlierAvg + 2) return 'improving';
    if (recentAvg < earlierAvg - 2) return 'declining';
    return 'stable';
  };

  return {
    history,
    recordScore,
    getAverageScore,
    getScoreTrend,
    clearHistory: () => {
      setHistory([]);
      localStorage.removeItem('seo-tracking-history');
    }
  };
};
