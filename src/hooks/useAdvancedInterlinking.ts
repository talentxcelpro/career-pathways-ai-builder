import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface LinkMetrics {
  href: string;
  clicks: number;
  hoverTime: number;
  conversionRate: number;
  lastAccessed: Date;
  contextualRelevance: number;
}

interface ContextualLink {
  text: string;
  href: string;
  relevanceScore: number;
  reason: string;
}

export const useAdvancedInterlinking = () => {
  const location = useLocation();
  const [linkMetrics, setLinkMetrics] = useState<Record<string, LinkMetrics>>({});
  const [contextualSuggestions, setContextualSuggestions] = useState<ContextualLink[]>([]);

  // AI-powered contextual link generation
  const generateContextualLinks = useCallback((content: string, currentPath: string): ContextualLink[] => {
    const linkMap = {
      '/': [
        { text: 'Explore Jobs', href: '/jobs', reason: 'Career advancement', relevance: 0.9 },
        { text: 'Build Network', href: '/network', reason: 'Professional growth', relevance: 0.8 },
        { text: 'Skill Development', href: '/learn', reason: 'Career enhancement', relevance: 0.85 }
      ],
      '/jobs': [
        { text: 'Resume Builder', href: '/resume', reason: 'Application optimization', relevance: 0.95 },
        { text: 'Interview Prep', href: '/interview-prep', reason: 'Job application support', relevance: 0.9 },
        { text: 'Salary Insights', href: '/salary', reason: 'Compensation research', relevance: 0.8 }
      ],
      '/network': [
        { text: 'Industry Events', href: '/events', reason: 'Networking opportunities', relevance: 0.9 },
        { text: 'Company Insights', href: '/companies', reason: 'Professional research', relevance: 0.85 },
        { text: 'Mentorship', href: '/mentors', reason: 'Career guidance', relevance: 0.8 }
      ],
      '/learn': [
        { text: 'Skill Assessment', href: '/assessment', reason: 'Learning optimization', relevance: 0.9 },
        { text: 'Certification Paths', href: '/certifications', reason: 'Career advancement', relevance: 0.85 },
        { text: 'Industry Trends', href: '/trends', reason: 'Market insights', relevance: 0.8 }
      ]
    };

    // Get base suggestions for current path
    const baseSuggestions = linkMap[currentPath as keyof typeof linkMap] || [];
    
    // Add content-based suggestions
    const keywords = content.toLowerCase();
    const contentBasedLinks: ContextualLink[] = [];
    
    if (keywords.includes('job') || keywords.includes('career')) {
      contentBasedLinks.push({
        text: 'Career Opportunities',
        href: '/jobs',
        relevanceScore: 0.85,
        reason: 'Content mentions careers'
      });
    }
    
    if (keywords.includes('skill') || keywords.includes('learn')) {
      contentBasedLinks.push({
        text: 'Skill Development',
        href: '/learn',
        relevanceScore: 0.8,
        reason: 'Content mentions learning'
      });
    }
    
    if (keywords.includes('network') || keywords.includes('connect')) {
      contentBasedLinks.push({
        text: 'Professional Network',
        href: '/network',
        relevanceScore: 0.8,
        reason: 'Content mentions networking'
      });
    }

    // Combine and rank suggestions
    return [
      ...baseSuggestions.map(link => ({
        text: link.text,
        href: link.href,
        relevanceScore: link.relevance,
        reason: link.reason
      })),
      ...contentBasedLinks
    ].sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5);
  }, []);

  // Track link performance
  const trackLinkInteraction = useCallback((href: string, action: 'hover' | 'click', duration?: number) => {
    setLinkMetrics(prev => {
      const current = prev[href] || {
        href,
        clicks: 0,
        hoverTime: 0,
        conversionRate: 0,
        lastAccessed: new Date(),
        contextualRelevance: 0.5
      };

      return {
        ...prev,
        [href]: {
          ...current,
          clicks: action === 'click' ? current.clicks + 1 : current.clicks,
          hoverTime: action === 'hover' && duration ? current.hoverTime + duration : current.hoverTime,
          lastAccessed: new Date(),
          contextualRelevance: Math.min(1, current.contextualRelevance + 0.1)
        }
      };
    });

    // Send analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'link_interaction', {
        event_category: 'interlinking',
        event_label: href,
        action_type: action,
        duration: duration || 0
      });
    }
  }, []);

  // Real-time link scoring
  const getLinkScore = useCallback((href: string): number => {
    const metrics = linkMetrics[href];
    if (!metrics) return 0.5;

    const recencyScore = Math.max(0, 1 - (Date.now() - metrics.lastAccessed.getTime()) / (1000 * 60 * 60 * 24 * 7)); // 7 days
    const engagementScore = Math.min(1, (metrics.clicks * 0.3 + metrics.hoverTime * 0.0001) / 10);
    const contextScore = metrics.contextualRelevance;

    return (recencyScore * 0.3 + engagementScore * 0.4 + contextScore * 0.3);
  }, [linkMetrics]);

  // Smart prefetching based on user behavior
  const shouldPrefetch = useCallback((href: string): boolean => {
    const score = getLinkScore(href);
    const metrics = linkMetrics[href];
    
    if (!metrics) return false;
    
    // Prefetch if high engagement or recent interaction
    return score > 0.7 || metrics.clicks > 2 || metrics.hoverTime > 3000;
  }, [getLinkScore, linkMetrics]);

  // Auto-update contextual suggestions when page changes
  useEffect(() => {
    const pageContent = document.body.innerText || '';
    const suggestions = generateContextualLinks(pageContent, location.pathname);
    setContextualSuggestions(suggestions);
  }, [location.pathname, generateContextualLinks]);

  // Setup hover tracking
  useEffect(() => {
    let hoverStartTime: number;
    
    const handleMouseEnter = (e: MouseEvent) => {
      const link = (e.target as Element)?.closest('a[href]') as HTMLAnchorElement;
      if (link && link.href) {
        hoverStartTime = Date.now();
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const link = (e.target as Element)?.closest('a[href]') as HTMLAnchorElement;
      if (link && link.href && hoverStartTime) {
        const duration = Date.now() - hoverStartTime;
        trackLinkInteraction(link.href, 'hover', duration);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const link = (e.target as Element)?.closest('a[href]') as HTMLAnchorElement;
      if (link && link.href) {
        trackLinkInteraction(link.href, 'click');
      }
    };

    document.addEventListener('mouseenter', handleMouseEnter, true);
    document.addEventListener('mouseleave', handleMouseLeave, true);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mouseenter', handleMouseEnter, true);
      document.removeEventListener('mouseleave', handleMouseLeave, true);
      document.removeEventListener('click', handleClick, true);
    };
  }, [trackLinkInteraction]);

  return {
    contextualSuggestions,
    linkMetrics,
    getLinkScore,
    shouldPrefetch,
    trackLinkInteraction
  };
};