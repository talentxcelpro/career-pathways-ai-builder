import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useLearningData } from '@/hooks/useLearningData';
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
  Globe,
  BookOpen
} from 'lucide-react';

const quickFilters = [
  { label: 'Free Courses', value: 'free', icon: Star },
  { label: 'Under 2 Hours', value: 'short', icon: Clock },
  { label: 'Most Popular', value: 'popular', icon: TrendingUp },
  { label: 'New Releases', value: 'new', icon: Users }
];

const categoryIcons: Record<string, any> = {
  'technology': Code,
  'business': Briefcase,
  'design': Palette,
  'data-science': BarChart3,
  'health': Heart,
  'marketing': Building,
  'personal-development': GraduationCap,
  'language': Globe
};

interface RealLearningSearchHubProps {
  className?: string;
}

export const RealLearningSearchHub: React.FC<RealLearningSearchHubProps> = ({ className }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { categories, courses, isLoading } = useLearningData();

  const handleSearch = (query: string) => {
    if (query.trim()) {
      window.location.href = `/learning/search?q=${encodeURIComponent(query)}`;
    }
  };

  const handleQuickFilter = (filter: string) => {
    window.location.href = `/learning/courses?filter=${filter}`;
  };

  // Generate trending searches from actual course data
  const trendingSearches = React.useMemo(() => {
    if (!courses.length) return ['Programming', 'Design', 'Business', 'Data Science'];
    
    const skillsMap = new Map<string, number>();
    courses.forEach(course => {
      if (course.skills_taught) {
        course.skills_taught.forEach(skill => {
          skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1);
        });
      }
    });
    
    return Array.from(skillsMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([skill]) => skill);
  }, [courses]);

  // Create categories data from actual categories
  const categoriesData = React.useMemo(() => {
    if (!categories.length) return [];
    
    return categories.map(category => {
      const courseCount = courses.filter(course => course.category === category).length;
      const IconComponent = categoryIcons[category.toLowerCase()] || BookOpen;
      
      return {
        icon: IconComponent,
        title: category.charAt(0).toUpperCase() + category.slice(1),
        courses: `${courseCount}+`,
        href: `/learning/courses?category=${category}`
      };
    }).filter(cat => cat.courses !== '0+');
  }, [categories, courses]);

  if (isLoading) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-12 bg-muted rounded max-w-2xl mx-auto mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        {trendingSearches.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-3">Popular skills:</p>
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
        )}

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
      {categoriesData.length > 0 && (
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
      )}

      {/* Course Stats */}
      <div className="text-center bg-muted/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-foreground mb-2">Join thousands of learners</h3>
        <p className="text-muted-foreground mb-4">
          {courses.length}+ courses • {categories.length}+ categories • Real-world projects
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Interactive Learning</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-primary" />
            <span>Expert Instructors</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-primary" />
            <span>Certificates</span>
          </div>
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