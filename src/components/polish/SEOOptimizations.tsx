import React, { useEffect, useState, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  Users, 
  Globe, 
  Star, 
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  structuredData?: any;
  noIndex?: boolean;
}

interface SEOEnhancementsProps {
  data: SEOData;
  showDebug?: boolean;
}

// Main SEO component
export const SEOEnhancements: React.FC<SEOEnhancementsProps> = memo(({
  data,
  showDebug = false
}) => {
  const location = useLocation();
  const currentUrl = `${window.location.origin}${location.pathname}`;

  const structuredData = data.structuredData || {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": data.title,
    "description": data.description,
    "url": currentUrl,
    "publisher": {
      "@type": "Organization",
      "name": "TalentXcel",
      "url": "https://talentxcel.in"
    }
  };

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{data.title}</title>
        <meta name="description" content={data.description} />
        <meta name="keywords" content={data.keywords.join(', ')} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={data.canonical || currentUrl} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={data.description} />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:type" content={data.ogType || 'website'} />
        <meta property="og:site_name" content="TalentXcel" />
        {data.ogImage && <meta property="og:image" content={data.ogImage} />}
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content={data.twitterCard || 'summary_large_image'} />
        <meta name="twitter:title" content={data.title} />
        <meta name="twitter:description" content={data.description} />
        {data.ogImage && <meta name="twitter:image" content={data.ogImage} />}
        
        {/* Additional Meta Tags */}
        <meta name="robots" content={data.noIndex ? 'noindex,nofollow' : 'index,follow'} />
        <meta name="googlebot" content={data.noIndex ? 'noindex,nofollow' : 'index,follow'} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        
        {/* Performance and Mobile Optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#3b82f6" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Helmet>
      
      {/* Debug Panel (Development Only) */}
      {showDebug && process.env.NODE_ENV === 'development' && (
        <SEODebugPanel data={data} currentUrl={currentUrl} />
      )}
    </>
  );
});

// SEO Debug Panel for development
const SEODebugPanel: React.FC<{
  data: SEOData;
  currentUrl: string;
}> = memo(({ data, currentUrl }) => {
  const [seoScore, setSeoScore] = useState(0);
  const [issues, setIssues] = useState<Array<{
    type: 'error' | 'warning' | 'success';
    message: string;
  }>>([]);

  useEffect(() => {
    // Calculate SEO score and identify issues
    let score = 0;
    const foundIssues: typeof issues = [];

    // Title check
    if (data.title.length >= 30 && data.title.length <= 60) {
      score += 20;
      foundIssues.push({ type: 'success', message: 'Title length is optimal' });
    } else {
      foundIssues.push({ 
        type: 'warning', 
        message: `Title should be 30-60 characters (current: ${data.title.length})` 
      });
    }

    // Description check
    if (data.description.length >= 120 && data.description.length <= 160) {
      score += 20;
      foundIssues.push({ type: 'success', message: 'Description length is optimal' });
    } else {
      foundIssues.push({ 
        type: 'warning', 
        message: `Description should be 120-160 characters (current: ${data.description.length})` 
      });
    }

    // Keywords check
    if (data.keywords.length >= 3 && data.keywords.length <= 10) {
      score += 15;
      foundIssues.push({ type: 'success', message: 'Keywords count is good' });
    } else {
      foundIssues.push({ 
        type: 'warning', 
        message: `Use 3-10 keywords (current: ${data.keywords.length})` 
      });
    }

    // Image check
    if (data.ogImage) {
      score += 15;
      foundIssues.push({ type: 'success', message: 'Open Graph image is set' });
    } else {
      foundIssues.push({ type: 'warning', message: 'Missing Open Graph image' });
    }

    // Structured data check
    if (data.structuredData) {
      score += 15;
      foundIssues.push({ type: 'success', message: 'Structured data is present' });
    } else {
      foundIssues.push({ type: 'warning', message: 'Missing structured data' });
    }

    // Canonical URL check
    if (data.canonical || currentUrl) {
      score += 15;
      foundIssues.push({ type: 'success', message: 'Canonical URL is set' });
    }

    setSeoScore(score);
    setIssues(foundIssues);
  }, [data, currentUrl]);

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-96 shadow-lg border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800 text-sm">
          <Search className="w-4 h-4" />
          SEO Debug Panel
          <Badge variant="outline" className="ml-auto">
            Score: {seoScore}/100
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* SEO Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">SEO Score</span>
            <span className="text-sm text-muted-foreground">{seoScore}/100</span>
          </div>
          <Progress 
            value={seoScore} 
            className={cn(
              "h-2",
              seoScore >= 80 ? "bg-green-100" : seoScore >= 60 ? "bg-yellow-100" : "bg-red-100"
            )} 
          />
        </div>

        {/* Current Page Info */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Current Page</h4>
          <div className="text-xs space-y-1">
            <div><strong>Title:</strong> {data.title}</div>
            <div><strong>Description:</strong> {data.description.substring(0, 50)}...</div>
            <div><strong>Keywords:</strong> {data.keywords.slice(0, 3).join(', ')}</div>
          </div>
        </div>

        {/* Issues */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Issues & Recommendations</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {issues.map((issue, index) => (
              <div key={index} className="flex items-start gap-2">
                {issue.type === 'success' && <CheckCircle className="w-3 h-3 text-green-600 mt-0.5" />}
                {issue.type === 'warning' && <AlertTriangle className="w-3 h-3 text-yellow-600 mt-0.5" />}
                {issue.type === 'error' && <AlertTriangle className="w-3 h-3 text-red-600 mt-0.5" />}
                <span className="text-xs">{issue.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs"
            onClick={() => window.open(`https://search.google.com/test/mobile-friendly?url=${encodeURIComponent(currentUrl)}`)}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Mobile Test
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs"
            onClick={() => window.open(`https://pagespeed.web.dev/report?url=${encodeURIComponent(currentUrl)}`)}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            PageSpeed
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

// SEO-optimized page wrapper
interface SEOPageWrapperProps {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  structuredData?: any;
  children: React.ReactNode;
}

export const SEOPageWrapper: React.FC<SEOPageWrapperProps> = memo(({
  title,
  description,
  keywords = [],
  ogImage,
  structuredData,
  children
}) => {
  return (
    <>
      <SEOEnhancements
        data={{
          title,
          description,
          keywords,
          ogImage,
          structuredData
        }}
        showDebug={process.env.NODE_ENV === 'development'}
      />
      <div id="main-content" role="main">
        {children}
      </div>
    </>
  );
});

// Automatic SEO for post pages
export const PostSEO: React.FC<{
  post: {
    id: string;
    title?: string;
    content: string;
    author: { name: string };
    created_at: string;
    media_url?: string;
  };
}> = memo(({ post }) => {
  const title = post.title || `Post by ${post.author.name}`;
  const description = post.content.length > 160 
    ? post.content.substring(0, 157) + '...'
    : post.content;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "author": {
      "@type": "Person",
      "name": post.author.name
    },
    "datePublished": post.created_at,
    "url": `${window.location.origin}/posts/${post.id}`,
    ...(post.media_url && {
      "image": {
        "@type": "ImageObject",
        "url": post.media_url
      }
    })
  };

  return (
    <SEOEnhancements
      data={{
        title: `${title} | TalentXcel`,
        description,
        keywords: ['professional', 'networking', 'career', 'post'],
        ogImage: post.media_url,
        ogType: 'article',
        structuredData
      }}
    />
  );
});

// SEO for user profiles
export const ProfileSEO: React.FC<{
  profile: {
    id: string;
    full_name: string;
    title?: string;
    bio?: string;
    profile_picture_url?: string;
  };
}> = memo(({ profile }) => {
  const title = `${profile.full_name}${profile.title ? ` - ${profile.title}` : ''}`;
  const description = profile.bio || `Professional profile of ${profile.full_name} on TalentXcel`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": profile.full_name,
    "jobTitle": profile.title,
    "description": description,
    "url": `${window.location.origin}/profile/${profile.id}`,
    ...(profile.profile_picture_url && {
      "image": profile.profile_picture_url
    })
  };

  return (
    <SEOEnhancements
      data={{
        title: `${title} | TalentXcel`,
        description,
        keywords: ['professional', 'profile', 'career', profile.full_name.toLowerCase()],
        ogImage: profile.profile_picture_url,
        ogType: 'profile',
        structuredData
      }}
    />
  );
});

SEOEnhancements.displayName = 'SEOEnhancements';
SEOPageWrapper.displayName = 'SEOPageWrapper';
PostSEO.displayName = 'PostSEO';
ProfileSEO.displayName = 'ProfileSEO';