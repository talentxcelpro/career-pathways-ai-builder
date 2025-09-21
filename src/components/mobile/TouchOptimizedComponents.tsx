import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSwipeable } from 'react-swipeable';
import { 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreHorizontal,
  X
} from 'lucide-react';

interface TouchOptimizedNewsCardProps {
  article: any;
  onLike?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onComment?: () => void;
}

export const TouchOptimizedNewsCard: React.FC<TouchOptimizedNewsCardProps> = ({
  article,
  onLike,
  onSave,
  onShare,
  onComment
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlers = useSwipeable({
    onSwipeStart: () => setShowActions(false),
    onSwiping: (eventData) => {
      const offset = Math.max(-100, Math.min(100, eventData.deltaX));
      setSwipeOffset(offset);
    },
    onSwipedLeft: () => {
      setSwipeOffset(0);
      setShowActions(true);
    },
    onSwipedRight: () => {
      setSwipeOffset(0);
      setShowActions(false);
    },
    onSwiped: () => {
      setSwipeOffset(0);
    },
    trackMouse: false,
    trackTouch: true,
  });

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.();
  };

  // Double tap to like
  const [lastTap, setLastTap] = useState(0);
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      handleLike();
    }
    setLastTap(now);
  };

  return (
    <div className="relative overflow-hidden">
      <Card 
        {...handlers}
        ref={cardRef}
        className="touch-manipulation transition-transform duration-200 ease-out select-none"
        style={{ 
          transform: `translateX(${swipeOffset}px)`,
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
        onTouchEnd={handleDoubleTap}
      >
        {/* Swipe Indicator */}
        {Math.abs(swipeOffset) > 20 && (
          <div 
            className={`absolute inset-y-0 ${
              swipeOffset > 0 ? 'left-0' : 'right-0'
            } w-16 flex items-center justify-center bg-primary/20 z-10`}
          >
            {swipeOffset > 0 ? (
              <ChevronRight className="w-6 h-6 text-primary" />
            ) : (
              <ChevronLeft className="w-6 h-6 text-primary" />
            )}
          </div>
        )}

        <CardContent className="p-0">
          {/* Image */}
          {article.image_url && (
            <div className="relative h-48 overflow-hidden">
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover"
                draggable={false}
              />
              
              {/* Quick action overlay */}
              <div className="absolute top-3 right-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 h-8 w-8 p-0 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(!showActions);
                  }}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Category badge */}
              <div className="absolute top-3 left-3">
                <Badge className="bg-black/20 backdrop-blur-sm text-white">
                  {article.category}
                </Badge>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-4 space-y-3">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2">
              {article.title}
            </h3>
            
            <p className="text-muted-foreground text-sm line-clamp-3">
              {article.description}
            </p>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{article.source_name}</span>
              <span>{new Date(article.published_at).toLocaleDateString()}</span>
            </div>

            {/* Touch-friendly action bar */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`touch-manipulation h-10 w-10 p-0 rounded-full ${
                    isLiked ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onComment}
                  className="touch-manipulation h-10 w-10 p-0 rounded-full text-muted-foreground"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onShare}
                  className="touch-manipulation h-10 w-10 p-0 rounded-full text-muted-foreground"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className={`touch-manipulation h-10 w-10 p-0 rounded-full ${
                  isSaved ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Panel */}
      {showActions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Article Actions</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActions(false)}
                  className="h-8 w-8 p-0 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleSave();
                    setShowActions(false);
                  }}
                  className="touch-manipulation h-12"
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  {isSaved ? 'Unsave' : 'Save'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    onShare?.();
                    setShowActions(false);
                  }}
                  className="touch-manipulation h-12"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    // Open in reader mode
                    setShowActions(false);
                  }}
                  className="touch-manipulation h-12 col-span-2"
                >
                  Read Article
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Mobile-optimized infinite scroll container
export const MobileNewsFeed: React.FC<{ articles: any[] }> = ({ articles }) => {
  const [visibleArticles, setVisibleArticles] = useState(10);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && visibleArticles < articles.length) {
          setLoading(true);
          setTimeout(() => {
            setVisibleArticles(prev => Math.min(prev + 5, articles.length));
            setLoading(false);
          }, 500);
        }
      },
      { rootMargin: '100px' }
    );

    if (bottomRef.current) {
      observer.observe(bottomRef.current);
    }

    return () => observer.disconnect();
  }, [articles.length, loading, visibleArticles]);

  return (
    <div className="space-y-4 pb-20">
      {articles.slice(0, visibleArticles).map((article, index) => (
        <TouchOptimizedNewsCard 
          key={`${article.id}-${index}`} 
          article={article}
          onLike={() => console.log('liked:', article.id)}
          onSave={() => console.log('saved:', article.id)}
          onShare={() => console.log('shared:', article.id)}
          onComment={() => console.log('comment:', article.id)}
        />
      ))}
      
      <div ref={bottomRef} className="py-4 text-center">
        {loading && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
        {visibleArticles >= articles.length && (
          <p className="text-muted-foreground text-sm">You've reached the end!</p>
        )}
      </div>
    </div>
  );
};