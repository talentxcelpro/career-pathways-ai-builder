import React, { useState } from 'react';
import { Filter, Search, Sliders, MapPin, Clock, DollarSign, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface FilterDiscoveryWidgetProps {
  activeFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  totalJobs: number;
  isMobile?: boolean;
}

export const FilterDiscoveryWidget: React.FC<FilterDiscoveryWidgetProps> = ({
  activeFilters,
  onFilterChange,
  totalJobs,
  isMobile = false
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.search) count++;
    if (activeFilters.location) count++;
    if (activeFilters.employment_type?.length > 0) count++;
    if (activeFilters.experience_level?.length > 0) count++;
    if (activeFilters.is_remote) count++;
    if (activeFilters.salary_min > 0 || activeFilters.salary_max > 0) count++;
    if (activeFilters.skills?.length > 0) count++;
    return count;
  };

  const quickFilters = [
    {
      label: 'Remote Jobs',
      icon: <MapPin className="h-3 w-3" />,
      active: activeFilters.is_remote,
      onClick: () => onFilterChange({ ...activeFilters, is_remote: !activeFilters.is_remote })
    },
    {
      label: 'Full Time',
      icon: <Clock className="h-3 w-3" />,
      active: activeFilters.employment_type?.includes('full_time'),
      onClick: () => {
        const types = activeFilters.employment_type || [];
        const newTypes = types.includes('full_time') 
          ? types.filter(t => t !== 'full_time')
          : [...types, 'full_time'];
        onFilterChange({ ...activeFilters, employment_type: newTypes });
      }
    },
    {
      label: 'High Salary',
      icon: <DollarSign className="h-3 w-3" />,
      active: activeFilters.salary_min >= 1000000,
      onClick: () => onFilterChange({ 
        ...activeFilters, 
        salary_min: activeFilters.salary_min >= 1000000 ? 0 : 1000000 
      })
    },
    {
      label: 'Senior Level',
      icon: <Star className="h-3 w-3" />,
      active: activeFilters.experience_level?.includes('senior'),
      onClick: () => {
        const levels = activeFilters.experience_level || [];
        const newLevels = levels.includes('senior')
          ? levels.filter(l => l !== 'senior')
          : [...levels, 'senior'];
        onFilterChange({ ...activeFilters, experience_level: newLevels });
      }
    }
  ];

  const clearAllFilters = () => {
    onFilterChange({
      search: '',
      location: '',
      employment_type: [],
      experience_level: [],
      salary_min: 0,
      salary_max: 0,
      is_remote: false,
      skills: [],
      department: [],
      company_type: [],
      work_mode: [],
      industry: [],
      role_category: [],
      education: [],
      posted_by: [],
      freshness: [],
      company_id: ''
    });
  };

  return (
    <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-background">
      <CardContent className="py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Smart Filters</h3>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="text-xs">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {totalJobs.toLocaleString()} jobs
            </span>
            {getActiveFilterCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Quick Filters:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter, index) => (
              <Button
                key={index}
                variant={filter.active ? "default" : "outline"}
                size="sm"
                onClick={filter.onClick}
                className="gap-1 text-xs"
              >
                {filter.icon}
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Active Filters Summary */}
          {getActiveFilterCount() > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Active Filters:</span>
              <div className="flex flex-wrap gap-1">
                {activeFilters.search && (
                  <Badge variant="outline" className="text-xs">
                    <Search className="h-3 w-3 mr-1" />
                    "{activeFilters.search}"
                  </Badge>
                )}
                {activeFilters.location && (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {activeFilters.location}
                  </Badge>
                )}
                {activeFilters.employment_type?.map((type: string) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {type.replace('_', ' ')}
                  </Badge>
                ))}
                {activeFilters.experience_level?.map((level: string) => (
                  <Badge key={level} variant="outline" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />
                    {level}
                  </Badge>
                ))}
                {(activeFilters.salary_min > 0 || activeFilters.salary_max > 0) && (
                  <Badge variant="outline" className="text-xs">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Salary: ₹{Math.floor((activeFilters.salary_min || 0)/100000)}L
                    {activeFilters.salary_max > 0 && ` - ₹${Math.floor(activeFilters.salary_max/100000)}L`}
                  </Badge>
                )}
                {activeFilters.skills?.map((skill: string) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Filters CTA */}
          <Popover open={isFilterPanelOpen} onOpenChange={setIsFilterPanelOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Sliders className="h-4 w-4" />
                More Filters
                <Badge variant="secondary" className="text-xs ml-auto">
                  Advanced
                </Badge>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <h4 className="font-semibold">Advanced Filters</h4>
                <p className="text-sm text-muted-foreground">
                  Access detailed filters in the sidebar for precise job matching including:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>• Industry</div>
                  <div>• Company Size</div>
                  <div>• Work Mode</div>
                  <div>• Education</div>
                  <div>• Department</div>
                  <div>• Posted Date</div>
                </div>
                <Button 
                  className="w-full" 
                  size="sm" 
                  onClick={() => {
                    setIsFilterPanelOpen(false);
                    // Scroll to sidebar on mobile
                    if (isMobile) {
                      document.querySelector('[data-filter-sidebar]')?.scrollIntoView({ 
                        behavior: 'smooth' 
                      });
                    }
                  }}
                >
                  Open Advanced Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Filter Tips for New Users */}
        {getActiveFilterCount() === 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Pro Tip:</strong> Use filters to find exactly what you're looking for. 
              Start with location and job type, then refine with salary and experience level.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};