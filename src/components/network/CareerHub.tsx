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
    <div className="space-y-6 bg-background">
      {/* Header */}
      <div className="text-center space-y-4 bg-gradient-to-br from-primary/5 via-background to-accent/30 p-6 rounded-xl border border-border/50">
        <div className="flex items-center justify-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold text-foreground">TalentXcel</h1>
            <p className="text-base text-primary font-medium">Career Hub</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-base text-foreground flex items-center justify-center gap-2">
            <span className="text-lg">🚀</span>
            Share your expertise, discover career insights, and grow with a community of professionals.
          </p>
          <p className="text-base font-semibold text-primary bg-primary/10 inline-block px-4 py-1 rounded-full">
            Your success story starts here!
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-border/50">
              <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <Card className="bg-background border border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="🔍 Search articles, topics, or skills with AI..."
                className="pl-12 h-12 bg-accent/50 border-border text-base font-medium placeholder:text-muted-foreground focus:bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="lg" className="px-8 h-12 bg-primary hover:bg-primary/90 font-semibold">
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 justify-center">
        {filters.map((filter) => (
          <Badge
            key={filter.label}
            variant={activeFilter === filter.label ? "default" : "outline"}
            className={`cursor-pointer text-sm py-2 px-4 font-medium hover:scale-105 transition-all duration-200 ${
              activeFilter === filter.label 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-background hover:bg-accent border-border text-foreground'
            }`}
            onClick={() => setActiveFilter(filter.label)}
          >
            <filter.icon className="w-4 h-4 mr-2" />
            {filter.label}
          </Badge>
        ))}
      </div>

      {/* Latest Articles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-background/80 backdrop-blur-sm p-4 rounded-lg border border-border/50">
          <h2 className="text-lg font-bold text-foreground">Latest Articles</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/50 px-3 py-1 rounded-full">
            <TrendingUp className="w-4 h-4" />
            0 articles
          </div>
        </div>

        {/* Empty State */}
        <Card className="bg-gradient-to-br from-accent/30 to-muted/20 border-dashed border-2 border-muted-foreground/30 hover:border-primary/30 transition-all duration-300">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-muted to-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-3">No articles found</h3>
            <p className="text-base text-muted-foreground max-w-md mx-auto">
              Be the first to share career insights and valuable content with the community.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};