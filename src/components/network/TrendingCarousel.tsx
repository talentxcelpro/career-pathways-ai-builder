import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, Briefcase, Globe, BarChart3, Flame } from 'lucide-react';

interface TrendingItem {
  id: string;
  type: 'job_news' | 'career_news' | 'company_news' | 'skill_trend';
  title: string;
  summary: string;
  tags: string[];
  engagement: number;
  timeAgo: string;
  source?: string;
}

interface TrendingCarouselProps {
  items?: TrendingItem[];
}

export const TrendingCarousel: React.FC<TrendingCarouselProps> = ({ items = [] }) => {
  // Mock trending data - this would be fetched from API/Supabase
  const mockTrendingItems: TrendingItem[] = [
    {
      id: '1',
      type: 'job_news',
      title: 'Google hiring 5,000 engineers in India 🚀',
      summary: 'Google announces massive hiring drive focusing on AI and cloud technologies',
      tags: ['#AIJobs', '#GoogleCareers', '#TechHiring'],
      engagement: 2450,
      timeAgo: '2h',
      source: 'TechCrunch'
    },
    {
      id: '2',
      type: 'skill_trend',
      title: 'Python salaries grew 20% in 2025',
      summary: 'Latest salary report shows significant growth in Python developer compensation',
      tags: ['#PythonDev', '#SalaryTrends', '#TechCareers'],
      engagement: 1890,
      timeAgo: '4h',
      source: 'Stack Overflow'
    },
    {
      id: '3',
      type: 'career_news',
      title: 'Remote work policies evolving globally',
      summary: 'Companies adapting hybrid models with new productivity metrics',
      tags: ['#RemoteWork', '#FutureOfWork', '#HybridJobs'],
      engagement: 3200,
      timeAgo: '6h',
      source: 'Forbes'
    },
    {
      id: '4',
      type: 'company_news',
      title: 'Startups raising $10B+ in Q1 2025',
      summary: 'Record funding rounds create thousands of new job opportunities',
      tags: ['#StartupJobs', '#Funding', '#GreenCareers'],
      engagement: 1650,
      timeAgo: '8h',
      source: 'Crunchbase'
    }
  ];

  const trendingData = items.length > 0 ? items : mockTrendingItems;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job_news':
        return <Briefcase className="h-4 w-4" />;
      case 'skill_trend':
        return <BarChart3 className="h-4 w-4" />;
      case 'career_news':
        return <TrendingUp className="h-4 w-4" />;
      case 'company_news':
        return <Globe className="h-4 w-4" />;
      default:
        return <Flame className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job_news':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'skill_trend':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'career_news':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'company_news':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-bold text-foreground">Trending Now</h2>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          View All
        </Button>
      </div>
      
      <ScrollArea className="w-full whitespace-nowrap rounded-lg">
        <div className="flex space-x-3 pb-2">
          {trendingData.map((item) => (
            <Card key={item.id} className="flex-shrink-0 w-72 p-4 bg-white/95 backdrop-blur-sm border border-border/50 hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <Badge variant="secondary" className={`text-xs ${getTypeColor(item.type)}`}>
                    <span className="flex items-center space-x-1">
                      {getTypeIcon(item.type)}
                      <span className="capitalize">{item.type.replace('_', ' ')}</span>
                    </span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">{item.timeAgo}</span>
                </div>
                
                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.summary}
                  </p>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-0.5 bg-primary/5 text-primary border-primary/20">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    <span>{item.engagement.toLocaleString()}</span>
                  </div>
                  {item.source && (
                    <span className="text-xs text-muted-foreground">{item.source}</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};