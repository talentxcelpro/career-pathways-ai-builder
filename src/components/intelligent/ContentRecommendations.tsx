import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAdvancedFeedAlgorithm } from '@/hooks/useAdvancedFeedAlgorithm';
import { useProfileLinking } from '@/hooks/useProfileLinking';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  Users,
  Briefcase,
  Play,
  Heart,
  MessageCircle,
  Share,
  ChevronRight,
  Star
} from 'lucide-react';

interface ContentRecommendationsProps {
  module: 'reels' | 'network' | 'jobs';
  className?: string;
  maxItems?: number;
}

export const ContentRecommendations: React.FC<ContentRecommendationsProps> = ({
  module,
  className,
  maxItems = 5
}) => {
  const navigate = useNavigate();
  const { personalizedFeed, isLoading, trackBehavior } = useAdvancedFeedAlgorithm(module);
  const { goToProfile } = useProfileLinking();

  const handleItemClick = (item: any) => {
    trackBehavior('view', item.id, item.type, { 
      relevanceScore: item.relevanceScore,
      module 
    });

    // Navigate based on content type using React Router
    switch (item.type) {
      case 'reel':
        navigate(`/mobile/reels?id=${item.id}`);
        break;
      case 'post':
        navigate(`/mobile/network?post=${item.id}`);
        break;
      case 'job':
        navigate(`/jobs/${item.id}`);
        break;
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'reels':
        return <Play className="h-4 w-4" />;
      case 'network':
        return <Users className="h-4 w-4" />;
      case 'jobs':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const displayItems = personalizedFeed.slice(0, maxItems);

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            {getModuleIcon(module)}
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="h-12 w-12 bg-muted rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayItems.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            {getModuleIcon(module)}
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground text-sm py-6">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Building your personalized recommendations...</p>
            <p className="text-xs mt-1">Interact with content to improve suggestions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getModuleIcon(module)}
            Recommended for You
          </div>
          <Badge variant="secondary" className="text-xs">
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {displayItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                onClick={() => handleItemClick(item)}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://avatar.vercel.sh/${item.author.id}`} />
                    <AvatarFallback className="text-xs">
                      {item.author.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1">
                    {getModuleIcon(item.metadata.module)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {item.type === 'job' ? `${item.author.name} - ${item.id}` : item.author.name}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.metadata.tags.slice(0, 2).map(tag => `#${tag}`).join(' ')}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star 
                        className={cn(
                          "h-3 w-3",
                          getRelevanceColor(item.relevanceScore)
                        )}
                        fill="currentColor"
                      />
                      <span className={cn(
                        "text-xs font-medium",
                        getRelevanceColor(item.relevanceScore)
                      )}>
                        {Math.round(item.relevanceScore * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{item.engagement.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{item.engagement.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share className="h-3 w-3" />
                      <span>{item.engagement.shares}</span>
                    </div>
                  </div>

                  {item.metadata.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.metadata.skills.slice(0, 2).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs py-0 px-1">
                          {skill}
                        </Badge>
                      ))}
                      {item.metadata.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs py-0 px-1">
                          +{item.metadata.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-3 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs"
            onClick={() => window.location.href = `/mobile/${module}`}
          >
            View All in {module.charAt(0).toUpperCase() + module.slice(1)}
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};