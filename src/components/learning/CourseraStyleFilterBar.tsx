import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Award,
  TrendingUp,
  Filter,
  Grid3X3,
  List,
  ArrowUpDown
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  totalCourses: number;
  currentView: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  level: string;
  onLevelChange: (level: string) => void;
  duration: string;
  onDurationChange: (duration: string) => void;
  subject: string;
  onSubjectChange: (subject: string) => void;
}

const CourseraStyleFilterBar: React.FC<FilterBarProps> = ({
  totalCourses,
  currentView,
  onViewChange,
  sortBy,
  onSortChange,
  level,
  onLevelChange,
  duration,
  onDurationChange,
  subject,
  onSubjectChange
}) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4">
          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {totalCourses.toLocaleString()} results
              </h2>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                <TrendingUp className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">View:</span>
              <div className="flex border border-gray-300 rounded-md">
                <Button
                  variant={currentView === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={currentView === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onViewChange('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 overflow-x-auto pb-2">
            {/* Sort */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most-popular">Most Popular</SelectItem>
                  <SelectItem value="highest-rated">Highest Rated</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Level */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={level} onValueChange={onLevelChange}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <Select value={duration} onValueChange={onDurationChange}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Duration</SelectItem>
                <SelectItem value="1-3">1-3 hours</SelectItem>
                <SelectItem value="3-6">3-6 hours</SelectItem>
                <SelectItem value="6-12">6-12 hours</SelectItem>
                <SelectItem value="12+">12+ hours</SelectItem>
              </SelectContent>
            </Select>

            {/* Subject */}
            <Select value={subject} onValueChange={onSubjectChange}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                <SelectItem value="computer-science">Computer Science</SelectItem>
                <SelectItem value="data-science">Data Science</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="arts">Arts & Humanities</SelectItem>
                <SelectItem value="language">Language Learning</SelectItem>
              </SelectContent>
            </Select>

            {/* Quick Filters */}
            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
              <Badge variant="outline" className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
                <Star className="h-3 w-3 mr-1" />
                Free
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
                <Award className="h-3 w-3 mr-1" />
                Certificate
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex items-center space-x-2 mt-3">
            {(level !== 'all' || duration !== 'all' || subject !== 'all') && (
              <>
                <span className="text-sm text-gray-600">Active filters:</span>
                {level !== 'all' && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Level: {level}
                    <button 
                      onClick={() => onLevelChange('all')}
                      className="ml-1 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {duration !== 'all' && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Duration: {duration}
                    <button 
                      onClick={() => onDurationChange('all')}
                      className="ml-1 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {subject !== 'all' && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Subject: {subject.replace('-', ' ')}
                    <button 
                      onClick={() => onSubjectChange('all')}
                      className="ml-1 hover:text-blue-900"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    onLevelChange('all');
                    onDurationChange('all');
                    onSubjectChange('all');
                  }}
                  className="text-blue-600 hover:text-blue-700 h-auto p-1 text-xs"
                >
                  Clear all
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseraStyleFilterBar;