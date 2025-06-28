
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface EnhancedSearchFiltersProps {
  filters: {
    search: string;
    category: string;
    difficulty: string;
    duration: string;
    skills: string[];
  };
  onFiltersChange: (filters: any) => void;
  availableSkills: string[];
}

export const EnhancedSearchFilters: React.FC<EnhancedSearchFiltersProps> = ({
  filters,
  onFiltersChange,
  availableSkills
}) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addSkillFilter = (skill: string) => {
    if (!filters.skills.includes(skill)) {
      updateFilter('skills', [...filters.skills, skill]);
    }
  };

  const removeSkillFilter = (skill: string) => {
    updateFilter('skills', filters.skills.filter(s => s !== skill));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      category: '',
      difficulty: '',
      duration: '',
      skills: []
    });
  };

  const hasActiveFilters = filters.search || filters.category || filters.difficulty || filters.duration || filters.skills.length > 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="font-medium">Search & Filter Courses</h3>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="ml-auto"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search courses..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filters.category || undefined} onValueChange={(value) => updateFilter('category', value || '')}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="programming">Programming</SelectItem>
            <SelectItem value="data-science">Data Science</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.difficulty || undefined} onValueChange={(value) => updateFilter('difficulty', value || '')}>
          <SelectTrigger>
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.duration || undefined} onValueChange={(value) => updateFilter('duration', value || '')}>
          <SelectTrigger>
            <SelectValue placeholder="Duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="short">Under 5 hours</SelectItem>
            <SelectItem value="medium">5-20 hours</SelectItem>
            <SelectItem value="long">20+ hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Skills Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Skills</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {filters.skills.map((skill) => (
            <Badge
              key={skill}
              variant="default"
              className="cursor-pointer"
              onClick={() => removeSkillFilter(skill)}
            >
              {skill}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
        </div>
        {availableSkills.length > 0 && (
          <Select onValueChange={addSkillFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Add skill filter" />
            </SelectTrigger>
            <SelectContent>
              {availableSkills
                .filter(skill => !filters.skills.includes(skill))
                .map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};
