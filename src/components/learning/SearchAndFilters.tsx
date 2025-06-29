
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchAndFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (difficulty: string) => void;
  categories: string[];
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  categories
}) => {
  const activeFiltersCount = [
    selectedCategory !== 'all' ? 1 : 0,
    selectedDifficulty !== 'all' ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search courses, instructors, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/80 border-slate-200 focus:border-blue-300 focus:ring-blue-200 rounded-lg"
        />
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Filters:</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
              {activeFiltersCount} active
            </Badge>
          )}
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40 bg-white/80 border-slate-200 text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
          <SelectTrigger className="w-36 bg-white/80 border-slate-200 text-sm">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent className="bg-white border-slate-200">
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        {(selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedDifficulty('all');
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};
