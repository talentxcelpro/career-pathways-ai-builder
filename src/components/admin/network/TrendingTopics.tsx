
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrendingTopicsProps {
  trendingTopics: Array<{ tag: string; count: number }> | undefined;
}

export const TrendingTopics: React.FC<TrendingTopicsProps> = ({ trendingTopics }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-purple-600" />
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {trendingTopics?.map((topic, index) => (
            <Link
              key={index}
              to={`/network?hashtag=${topic.tag}`}
              className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50 transition-colors group"
            >
              <span className="text-sm font-medium group-hover:text-primary">#{topic.tag}</span>
              <span className="text-xs text-muted-foreground">{topic.count} posts</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
