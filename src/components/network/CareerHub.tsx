import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, BookOpen, Users, TrendingUp, Award, Briefcase, FileText, Brain, BarChart3, Bot, Home, Heart, Crown, Sparkles, Plus } from 'lucide-react';

export const CareerHub = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = [
    { label: 'All', icon: Filter },
    { label: 'Career Advice', icon: BookOpen },
    { label: 'Interview Tips', icon: Users },
    { label: 'Resume Help', icon: FileText },
    { label: 'Skill Development', icon: TrendingUp },
    { label: 'Industry Insights', icon: BarChart3 },
    { label: 'Market Trends', icon: TrendingUp },
    { label: 'AI Tools for Professionals', icon: Bot },
    { label: 'Remote Work & Freelancing', icon: Home },
    { label: 'Work-Life Balance', icon: Heart },
    { label: 'Leadership & Management', icon: Crown },
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
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-slate-900 p-2">
            <img src="/talentxcel-official-logo.png" alt="TalentXcel Logo" className="w-full h-full object-contain" />
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

      {/* AI Spotlight */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/20 border border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">AI Spotlight</h2>
            <Badge variant="secondary" className="ml-auto">Top 3 Trending</Badge>
          </div>
          <p className="text-muted-foreground mb-4">AI-powered trending articles based on community engagement</p>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 bg-background/60 rounded-lg border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/15 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{i}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">AI Article Placeholder {i}</p>
                    <p className="text-xs text-muted-foreground">Trending in {filters[i + 1]?.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Share Your Expertise Button */}
      <Card className="bg-gradient-to-br from-accent/30 to-primary/10 border border-primary/30">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Share Your Expertise</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Have valuable insights to share? Help grow the community by contributing your knowledge.
          </p>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
            <Plus className="w-4 h-4 mr-2" />
            Create Article
          </Button>
        </CardContent>
      </Card>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recommended for You */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recommended for You
            </h3>
            <p className="text-muted-foreground text-sm mb-4">Personalized article feed based on your interests</p>
            <div className="space-y-2">
              <div className="p-2 bg-accent/30 rounded border-l-2 border-primary">
                <p className="text-sm font-medium">Coming Soon</p>
                <p className="text-xs text-muted-foreground">AI-curated content for you</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Authors This Week */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Top Authors This Week
            </h3>
            <p className="text-muted-foreground text-sm mb-4">Most active and engaging contributors</p>
            <div className="space-y-2">
              <div className="p-2 bg-accent/30 rounded border-l-2 border-primary">
                <p className="text-sm font-medium">Coming Soon</p>
                <p className="text-xs text-muted-foreground">Community leaders showcase</p>
              </div>
            </div>
          </CardContent>
        </Card>
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