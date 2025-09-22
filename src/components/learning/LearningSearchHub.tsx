import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Search,
  TrendingUp,
  Clock,
  Users,
  Star,
  Filter,
  Code,
  Briefcase,
  Palette,
  BarChart3,
  Heart,
  Building,
  GraduationCap,
  Globe
} from 'lucide-react';

const trendingSearches = [
  'Python Programming',
  'Machine Learning',
  'Digital Marketing',
  'UI/UX Design',
  'Data Science',
  'Project Management'
];

const quickFilters = [
  { label: 'Free Courses', value: 'free', icon: Star },
  { label: 'Under 2 Hours', value: 'short', icon: Clock },
  { label: 'Most Popular', value: 'popular', icon: TrendingUp },
  { label: 'New Releases', value: 'new', icon: Users }
];

const categoriesData = [
  { icon: Code, title: 'Technology', courses: '2,100+', href: '/learning/courses?category=technology' },
  { icon: Briefcase, title: 'Business', courses: '1,500+', href: '/learning/courses?category=business' },
  { icon: Palette, title: 'Design', courses: '800+', href: '/learning/courses?category=design' },
  { icon: BarChart3, title: 'Data Science', courses: '1,200+', href: '/learning/courses?category=data-science' },
  { icon: Heart, title: 'Health', courses: '600+', href: '/learning/courses?category=health' },
  { icon: Building, title: 'Marketing', courses: '900+', href: '/learning/courses?category=marketing' },
  { icon: GraduationCap, title: 'Personal Development', courses: '700+', href: '/learning/courses?category=personal-development' },
  { icon: Globe, title: 'Language Learning', courses: '400+', href: '/learning/courses?category=language' }
];

interface LearningSearchHubProps {
  className?: string;
}

export const LearningSearchHub: React.FC<LearningSearchHubProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Navigate to search results
      window.location.href = `/learning/search?q=${encodeURIComponent(query)}`;
    }
  };

  const handleQuickFilter = (filter: string) => {
    window.location.href = `/learning/courses?filter=${filter}`;
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Search Section */}
      <div className="text-center space-y-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            What do you want to learn today?
          </h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for courses, skills, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 focus:border-primary"
            />
            <Button 
              onClick={() => handleSearch(searchQuery)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-lg"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Trending Searches */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">Trending searches:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {trendingSearches.map((search) => (
              <Badge
                key={search}
                variant="secondary"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleSearch(search)}
              >
                {search}
              </Badge>
            ))}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap justify-center gap-3">
          {quickFilters.map((filter) => (
            <Button
              key={filter.value}
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter(filter.value)}
              className="flex items-center space-x-2"
            >
              <filter.icon className="h-4 w-4" />
              <span>{filter.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-foreground">Browse by Category</h3>
          <Button asChild variant="outline">
            <Link to="/learning/courses">
              <Filter className="h-4 w-4 mr-2" />
              View All Courses
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoriesData.map((category) => (
            <Card 
              key={category.title} 
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => window.location.href = category.href}
            >
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <category.icon className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">{category.title}</h4>
                <p className="text-sm text-muted-foreground">{category.courses} courses</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Advanced Search Link */}
      <div className="text-center">
        <Button asChild variant="ghost" className="text-primary">
          <Link to="/learning/search">
            Need more specific results? Try Advanced Search →
          </Link>
        </Button>
      </div>
    </div>
  );
};