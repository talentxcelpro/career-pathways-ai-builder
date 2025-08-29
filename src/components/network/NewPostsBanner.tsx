import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NewPostsBannerProps {
  newPostsCount: number;
  isConnected: boolean;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const NewPostsBanner: React.FC<NewPostsBannerProps> = ({
  newPostsCount,
  isConnected,
  onRefresh,
  isLoading = false
}) => {
  if (newPostsCount === 0) {
    return (
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {isConnected && (
                  <>
                    <Wifi className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-muted-foreground">Live updates enabled</span>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-7 px-2"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 backdrop-blur-sm border-b border-primary/20">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-primary/20 text-primary">
              {newPostsCount} new post{newPostsCount > 1 ? 's' : ''}
            </Badge>
            <div className="flex items-center gap-1">
              {isConnected && (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-muted-foreground">Live</span>
                </>
              )}
            </div>
          </div>
          
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            {isLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Load new posts
          </Button>
        </div>
      </div>
    </div>
  );
};