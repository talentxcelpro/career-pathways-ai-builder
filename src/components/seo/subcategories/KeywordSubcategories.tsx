import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Target, MapPin, TrendingUp, Brain, Lightbulb } from 'lucide-react';

export const KeywordSubcategories = () => {
  const [activeCategory, setActiveCategory] = useState('research');
  
  const categories = [
    { id: 'research', label: 'Research', icon: Search },
    { id: 'tracking', label: 'Tracking', icon: Target },
    { id: 'local', label: 'Local SEO', icon: MapPin },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'gaps', label: 'Content Gaps', icon: Lightbulb },
    { id: 'clustering', label: 'AI Clustering', icon: Brain }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyword Intelligence Center</CardTitle>
        <CardDescription>Comprehensive keyword research for TalentXcel.in</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className="h-20 flex-col gap-2"
                onClick={() => setActiveCategory(category.id)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{category.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};