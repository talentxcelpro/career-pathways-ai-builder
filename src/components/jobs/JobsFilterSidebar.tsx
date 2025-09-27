import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface JobsFilterSidebarProps {
  role?: string;
  city?: string;
  onFiltersChange: (filters: any) => void;
}

/**
 * Jobs Filter Sidebar Component
 * Provides filtering options for job searches
 */
export const JobsFilterSidebar: React.FC<JobsFilterSidebarProps> = ({
  role,
  city,
  onFiltersChange
}) => {
  const [filters, setFilters] = useState({
    employmentTypes: [] as string[],
    experienceLevels: [] as string[],
    salaryRange: { min: '', max: '' },
    isRemote: false,
    skills: [] as string[]
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const employmentTypes = [
    'Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'
  ];

  const experienceLevels = [
    'Entry Level', 'Mid Level', 'Senior Level', 'Lead Level', 'Executive'
  ];

  const popularSkills = [
    'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'SQL',
    'AWS', 'Docker', 'Kubernetes', 'Machine Learning'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Employment Type */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Employment Type</Label>
            <div className="space-y-2">
              {employmentTypes.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`employment-${type}`}
                    checked={filters.employmentTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleFilterChange('employmentTypes', [...filters.employmentTypes, type]);
                      } else {
                        handleFilterChange('employmentTypes', filters.employmentTypes.filter(t => t !== type));
                      }
                    }}
                  />
                  <Label htmlFor={`employment-${type}`} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Experience Level</Label>
            <div className="space-y-2">
              {experienceLevels.map(level => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`experience-${level}`}
                    checked={filters.experienceLevels.includes(level)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleFilterChange('experienceLevels', [...filters.experienceLevels, level]);
                      } else {
                        handleFilterChange('experienceLevels', filters.experienceLevels.filter(l => l !== level));
                      }
                    }}
                  />
                  <Label htmlFor={`experience-${level}`} className="text-sm">{level}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Salary Range (LPA)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Min"
                type="number"
                value={filters.salaryRange.min}
                onChange={(e) => handleFilterChange('salaryRange', {
                  ...filters.salaryRange,
                  min: e.target.value
                })}
              />
              <Input
                placeholder="Max"
                type="number"
                value={filters.salaryRange.max}
                onChange={(e) => handleFilterChange('salaryRange', {
                  ...filters.salaryRange,
                  max: e.target.value
                })}
              />
            </div>
          </div>

          {/* Remote Work */}
          <div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remote-work"
                checked={filters.isRemote}
                onCheckedChange={(checked) => handleFilterChange('isRemote', checked)}
              />
              <Label htmlFor="remote-work" className="text-sm">Remote Work</Label>
            </div>
          </div>

          {/* Skills */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Required Skills</Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {popularSkills.map(skill => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`skill-${skill}`}
                    checked={filters.skills.includes(skill)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleFilterChange('skills', [...filters.skills, skill]);
                      } else {
                        handleFilterChange('skills', filters.skills.filter(s => s !== skill));
                      }
                    }}
                  />
                  <Label htmlFor={`skill-${skill}`} className="text-sm">{skill}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              const resetFilters = {
                employmentTypes: [],
                experienceLevels: [],
                salaryRange: { min: '', max: '' },
                isRemote: false,
                skills: []
              };
              setFilters(resetFilters);
              onFiltersChange(resetFilters);
            }}
          >
            Reset Filters
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};