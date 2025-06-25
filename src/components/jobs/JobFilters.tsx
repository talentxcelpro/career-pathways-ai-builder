
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Search, MapPin, DollarSign } from "lucide-react";

interface JobFiltersProps {
  filters: {
    search: string;
    location: string;
    employment_type: string[];
    experience_level: string[];
    salary_min: number;
    salary_max: number;
    is_remote: boolean;
    skills: string[];
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
  categories: Array<{ id: string; name: string; slug: string }>;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  categories
}) => {
  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];
  const popularSkills = ['JavaScript', 'React', 'Python', 'Node.js', 'TypeScript', 'AWS', 'SQL', 'Git'];

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: string, value: string) => {
    const currentArray = filters[key as keyof typeof filters] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const removeSkill = (skill: string) => {
    updateFilter('skills', filters.skills.filter(s => s !== skill));
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'search' || key === 'location') return value !== '';
    if (Array.isArray(value)) return value.length > 0;
    if (key === 'salary_min') return value > 0;
    if (key === 'salary_max') return value < 500000;
    if (key === 'is_remote') return value === true;
    return false;
  });

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <label className="text-sm font-medium mb-2 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Job title, company, or keywords"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="text-sm font-medium mb-2 block">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="City, state, or country"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Remote Work */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remote"
            checked={filters.is_remote}
            onCheckedChange={(checked) => updateFilter('is_remote', checked)}
          />
          <label htmlFor="remote" className="text-sm font-medium">
            Remote work only
          </label>
        </div>

        {/* Employment Type */}
        <div>
          <label className="text-sm font-medium mb-3 block">Employment Type</label>
          <div className="space-y-2">
            {employmentTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={filters.employment_type.includes(type)}
                  onCheckedChange={() => toggleArrayFilter('employment_type', type)}
                />
                <label htmlFor={type} className="text-sm">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="text-sm font-medium mb-3 block">Experience Level</label>
          <div className="space-y-2">
            {experienceLevels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={level}
                  checked={filters.experience_level.includes(level)}
                  onCheckedChange={() => toggleArrayFilter('experience_level', level)}
                />
                <label htmlFor={level} className="text-sm">
                  {level}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Salary Range: ${filters.salary_min.toLocaleString()} - ${filters.salary_max.toLocaleString()}
          </label>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Minimum</label>
              <Slider
                value={[filters.salary_min]}
                onValueChange={([value]) => updateFilter('salary_min', value)}
                max={500000}
                min={0}
                step={5000}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Maximum</label>
              <Slider
                value={[filters.salary_max]}
                onValueChange={([value]) => updateFilter('salary_max', value)}
                max={500000}
                min={0}
                step={5000}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="text-sm font-medium mb-3 block">Skills</label>
          <div className="space-y-3">
            {/* Selected Skills */}
            {filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Popular Skills */}
            <div className="space-y-2">
              <label className="text-xs text-gray-500">Popular skills:</label>
              <div className="flex flex-wrap gap-1">
                {popularSkills
                  .filter(skill => !filters.skills.includes(skill))
                  .map((skill) => (
                    <Button
                      key={skill}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => toggleArrayFilter('skills', skill)}
                    >
                      + {skill}
                    </Button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-3 block">Categories</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
