
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash } from 'lucide-react';

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
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm font-medium">{topic.tag}</span>
              <span className="text-xs text-gray-600">{topic.count} posts</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
