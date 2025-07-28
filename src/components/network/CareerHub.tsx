import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, BookOpen, Users, TrendingUp, Award } from 'lucide-react';

export const CareerHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = [
    { label: 'All', icon: Filter },
    { label: 'Career Advice', icon: BookOpen },
    { label: 'Interview Tips', icon: Users },
    { label: 'Resume Help', icon: Award },
    { label: 'Skill Development', icon: TrendingUp },
    { label: 'Industry Insights', icon: TrendingUp },
    { label: 'Market Trends', icon: TrendingUp },
  ];

  const stats = [
    { label: '0+ Articles', icon: BookOpen },
    { label: 'Expert Community', icon: Users },
    { label: 'AI-Powered', icon: TrendingUp },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">TalentXcel</h1>
            <p className="text-sm text-muted-foreground">Career Hub</p>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <span>🚀</span>
            Share your expertise, discover career insights, and grow with a community of professionals.
          </p>
          <p className="text-sm font-medium text-primary">Your success story starts here!</p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
                <stat.icon className="w-3 h-3 text-primary" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <Card className="bg-muted/30 border-0">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="🔍 Search articles, topics, or skills with AI..."
                className="pl-10 bg-background border-border/50 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="sm" className="px-6">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Badge
            key={filter.label}
            variant={activeFilter === filter.label ? "default" : "outline"}
            className={`cursor-pointer text-xs py-1 px-3 hover:bg-primary/10 transition-colors ${
              activeFilter === filter.label ? 'bg-primary text-primary-foreground' : ''
            }`}
            onClick={() => setActiveFilter(filter.label)}
          >
            <filter.icon className="w-3 h-3 mr-1" />
            {filter.label}
          </Badge>
        ))}
      </div>

      {/* Latest Articles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">Latest Articles</h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            0 articles
          </div>
        </div>

        {/* Empty State */}
        <Card className="bg-muted/20 border-dashed border-2 border-muted-foreground/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-2">No articles found</h3>
            <p className="text-xs text-muted-foreground">
              Be the first to share career insights and valuable content with the community.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};