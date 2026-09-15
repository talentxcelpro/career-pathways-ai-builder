import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

const FALLBACK_NEWS = [
  {
    id: '1',
    title: 'TalentXcel Launches AI Skill Passport for Engineering & Tech Talent',
    summary: 'Directly verify your skills, certifications, and career achievements with automated recruiter matching.',
    slug: 'talentxcel-launches-ai-skill-passport',
    published_at: new Date().toISOString(),
    category: 'Platform Update',
    image_url: '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png'
  },
  {
    id: '2',
    title: 'Top Hiring Trends for 2026: AI Engineering, Cloud & Fintech Roles',
    summary: 'Explore emerging career pathways and in-demand technical competencies across Indian tech hubs.',
    slug: 'top-hiring-trends-2026',
    published_at: new Date(Date.now() - 86400000).toISOString(),
    category: 'Career Insights',
    image_url: '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png'
  }
];

export const NewsLatestWidget: React.FC = () => {
  const { data: latestNews, isLoading } = useQuery({
    queryKey: ['latest-news'],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('news_articles')
          .select('id, title, summary, slug, published_at, category, image_url')
          .eq('published_status', 'published')
          .order('published_at', { ascending: false })
          .limit(3);

        if (error || !data || data.length === 0) {
          return FALLBACK_NEWS;
        }
        return data;
      } catch {
        return FALLBACK_NEWS;
      }
    },
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Newspaper className="h-5 w-5" />
            Latest News
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestNews?.length) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Latest News
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {latestNews.map((article) => (
            <div key={article.id} className="group">
              <Link to={`/news/${article.slug}`} className="block">
                <div className="flex gap-3">
                  {article.image_url && (
                    <img 
                      src={article.image_url} 
                      alt={article.title}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      loading="lazy"
                      decoding="async"
                      style={{ contentVisibility: 'auto', containIntrinsicSize: '64px 64px' }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(article.published_at).toLocaleDateString()}
                      </div>
                    </div>
                    {article.summary && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
          
          <Link 
            to="/news" 
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors group"
          >
            View all news
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};