import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FOUNDATION_NEWS_ARTICLES } from '@/data/newsArticles';

export const NewsLatestWidget: React.FC = () => {
  const latestNews = FOUNDATION_NEWS_ARTICLES.slice(0, 3);

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
          {latestNews.map((article) => {
            const img = article.imageUrl || (article as any).image_url;
            const published = article.publishedAt || (article as any).published_at || new Date().toISOString();
            return (
              <div key={article.id} className="group">
                <Link to={`/news/${article.slug}`} className="block">
                  <div className="flex gap-3">
                    {img && (
                      <img 
                        src={img} 
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
                          {new Date(published).toLocaleDateString()}
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
            );
          })}
          
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