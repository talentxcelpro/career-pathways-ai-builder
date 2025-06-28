
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { X, Filter } from "lucide-react";

interface JobFilters {
  search: string;
  location: string;
  employment_type: string[];
  experience_level: string[];
  salary_min: number;
  salary_max: number;
  is_remote: boolean;
  skills: string[];
}

interface EnhancedJobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  onClearFilters: () => void;
  className?: string;
}

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' }
];

const EXPERIENCE_LEVELS = [
  { value: 'entry-level', label: 'Entry Level' },
  { value: 'mid-level', label: 'Mid Level' },
  { value: 'senior-level', label: 'Senior Level' },
  { value: 'executive', label: 'Executive' }
];

const POPULAR_SKILLS = [
  'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'TypeScript',
  'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'PostgreSQL',
  'Machine Learning', 'Data Science', 'DevOps', 'UI/UX Design',
  'Project Management', 'Agile', 'Scrum', 'Product Management'
];

export const EnhancedJobFilters: React.FC<EnhancedJobFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ''
}) => {
  const updateFilters = (updates: Partial<JobFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleEmploymentTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked
      ? [...filters.employment_type, type]
      : filters.employment_type.filter(t => t !== type);
    updateFilters({ employment_type: newTypes });
  };

  const handleExperienceLevelChange = (level: string, checked: boolean) => {
    const newLevels = checked
      ? [...filters.experience_level, level]
      : filters.experience_level.filter(l => l !== level);
    updateFilters({ experience_level: newLevels });
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    updateFilters({ skills: newSkills });
  };

  const handleSalaryChange = (values: number[]) => {
    updateFilters({ 
      salary_min: values[0] * 1000,
      salary_max: values[1] * 1000
    });
  };

  const activeFiltersCount = 
    filters.employment_type.length +
    filters.experience_level.length +
    filters.skills.length +
    (filters.is_remote ? 1 : 0) +
    (filters.salary_min > 0 || filters.salary_max > 0 ? 1 : 0);

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-base">Filters</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Keywords</Label>
          <Input
            id="search"
            placeholder="Job title, company, keywords..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, state, or remote"
            value={filters.location}
            onChange={(e) => updateFilters({ location: e.target.value })}
          />
        </div>

        {/* Remote toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="remote">Remote Only</Label>
          <Switch
            id="remote"
            checked={filters.is_remote}
            onCheckedChange={(checked) => updateFilters({ is_remote: checked })}
          />
        </div>

        {/* Employment Type */}
        <div className="space-y-3">
          <Label>Employment Type</Label>
          <div className="space-y-2">
            {EMPLOYMENT_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={type.value}
                  checked={filters.employment_type.includes(type.value)}
                  onCheckedChange={(checked) => 
                    handleEmploymentTypeChange(type.value, checked as boolean)
                  }
                />
                <Label htmlFor={type.value} className="text-sm font-normal">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div className="space-y-3">
          <Label>Experience Level</Label>
          <div className="space-y-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <div key={level.value} className="flex items-center space-x-2">
                <Checkbox
                  id={level.value}
                  checked={filters.experience_level.includes(level.value)}
                  onCheckedChange={(checked) => 
                    handleExperienceLevelChange(level.value, checked as boolean)
                  }
                />
                <Label htmlFor={level.value} className="text-sm font-normal">
                  {level.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div className="space-y-3">
          <Label>Salary Range (₹ thousands)</Label>
          <div className="px-2">
            <Slider
              value={[filters.salary_min / 1000, filters.salary_max / 1000]}
              onValueChange={handleSalaryChange}
              max={2000}
              min={0}
              step={50}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₹{filters.salary_min / 1000}k</span>
              <span>₹{filters.salary_max / 1000}k</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-3">
          <Label>Popular Skills</Label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SKILLS.map((skill) => (
              <Badge
                key={skill}
                variant={filters.skills.includes(skill) ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => handleSkillToggle(skill)}
              >
                {skill}
                {filters.skills.includes(skill) && (
                  <X className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
