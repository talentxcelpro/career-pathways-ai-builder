import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Star,
  Clock,
  DollarSign,
  Brain,
  TrendingUp,
  Users,
  X
} from 'lucide-react';

interface LearningFiltersProps {
  categories: string[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
}

export const LearningFilters: React.FC<LearningFiltersProps> = ({
  categories,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty
}) => {
  const [sortBy, setSortBy] = useState('popularity');
  const [aiRecommended, setAiRecommended] = useState(true);
  const [priceFilter, setPriceFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];
  const sortOptions = [
    { value: 'popularity', label: 'Popularity', icon: TrendingUp },
    { value: 'rating', label: 'Rating', icon: Star },
    { value: 'duration', label: 'Duration', icon: Clock },
    { value: 'price', label: 'Price', icon: DollarSign },
    { value: 'enrollments', label: 'Enrollments', icon: Users }
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setPriceFilter('all');
    setRatingFilter('all');
    setSortBy('popularity');
  };

  const activeFiltersCount = [
    selectedCategory !== 'all',
    selectedDifficulty !== 'all',
    priceFilter !== 'all',
    ratingFilter !== 'all',
    searchTerm !== ''
  ].filter(Boolean).length;

  return (
    <div className="space-y-6 sticky top-6">
      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-5 w-5" />
            Search Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, skills, instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <Label htmlFor="ai-recommended" className="text-sm font-medium">
                AI Recommended for You
              </Label>
            </div>
            <Switch
              id="ai-recommended"
              checked={aiRecommended}
              onCheckedChange={setAiRecommended}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Active Filters ({activeFiltersCount})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-auto p-1 text-xs"
              >
                Clear all
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: {searchTerm}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setSearchTerm('')}
                  />
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {selectedCategory}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setSelectedCategory('all')}
                  />
                </Badge>
              )}
              {selectedDifficulty !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  {selectedDifficulty}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setSelectedDifficulty('all')}
                  />
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'ghost'}
            className="w-full justify-start text-sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'ghost'}
              className="w-full justify-start text-sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Difficulty Levels */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={selectedDifficulty === 'all' ? 'default' : 'ghost'}
            className="w-full justify-start text-sm"
            onClick={() => setSelectedDifficulty('all')}
          >
            All Levels
          </Button>
          {difficulties.map((difficulty) => (
            <Button
              key={difficulty}
              variant={selectedDifficulty === difficulty.toLowerCase() ? 'default' : 'ghost'}
              className="w-full justify-start text-sm"
              onClick={() => setSelectedDifficulty(difficulty.toLowerCase())}
            >
              {difficulty}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Sort Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Sort by</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sortOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={sortBy === option.value ? 'default' : 'ghost'}
                className="w-full justify-start text-sm"
                onClick={() => setSortBy(option.value)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {option.label}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Price Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Price</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {['all', 'free', 'paid'].map((price) => (
            <Button
              key={price}
              variant={priceFilter === price ? 'default' : 'ghost'}
              className="w-full justify-start text-sm capitalize"
              onClick={() => setPriceFilter(price)}
            >
              {price === 'all' ? 'All Prices' : price}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Rating Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {['all', '4+', '4.5+'].map((rating) => (
            <Button
              key={rating}
              variant={ratingFilter === rating ? 'default' : 'ghost'}
              className="w-full justify-start text-sm"
              onClick={() => setRatingFilter(rating)}
            >
              {rating === 'all' ? 'All Ratings' : (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {rating} & up
                </div>
              )}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};