import React, { useState } from 'react';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { Search, Filter, MapPin, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobsFeed } from '@/components/jobs/JobsFeed';
import { EnhancedNotificationCenter } from '@/components/engagement/EnhancedNotificationCenter';

export const MobileJobs: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    employment_type: [] as string[],
    experience_level: [] as string[],
    is_remote: false,
    skills: [] as string[],
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleLocationChange = (value: string) => {
    setFilters(prev => ({ ...prev, location: value }));
  };

  const toggleRemote = () => {
    setFilters(prev => ({ ...prev, is_remote: !prev.is_remote }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      employment_type: [],
      experience_level: [],
      is_remote: false,
      skills: [],
    });
  };

  const quickFilters = [
    { label: 'Remote', value: 'remote', type: 'remote' },
    { label: 'Full-time', value: 'full_time', type: 'employment_type' },
    { label: 'Part-time', value: 'part_time', type: 'employment_type' },
    { label: 'Fresher', value: 'entry', type: 'experience_level' },
    { label: 'Senior', value: 'senior', type: 'experience_level' },
  ];

  const isFilterActive = (filter: typeof quickFilters[0]) => {
    if (filter.type === 'remote') return filters.is_remote;
    if (filter.type === 'employment_type') return filters.employment_type.includes(filter.value);
    if (filter.type === 'experience_level') return filters.experience_level.includes(filter.value);
    return false;
  };

  const toggleQuickFilter = (filter: typeof quickFilters[0]) => {
    if (filter.type === 'remote') {
      toggleRemote();
    } else if (filter.type === 'employment_type') {
      setFilters(prev => ({
        ...prev,
        employment_type: prev.employment_type.includes(filter.value)
          ? prev.employment_type.filter(t => t !== filter.value)
          : [...prev.employment_type, filter.value]
      }));
    } else if (filter.type === 'experience_level') {
      setFilters(prev => ({
        ...prev,
        experience_level: prev.experience_level.includes(filter.value)
          ? prev.experience_level.filter(l => l !== filter.value)
          : [...prev.experience_level, filter.value]
      }));
    }
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Jobs</h1>
            </div>
            <EnhancedNotificationCenter variant="mobile" />
          </div>

          {/* Search Bar */}
          <div className="p-4 pt-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, skills..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  value={filters.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-10"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickFilters.map((filter) => (
                <Badge
                  key={filter.value}
                  variant={isFilterActive(filter) ? "default" : "secondary"}
                  className="whitespace-nowrap cursor-pointer"
                  onClick={() => toggleQuickFilter(filter)}
                >
                  {filter.label}
                </Badge>
              ))}
              {(filters.search || filters.location || filters.is_remote || 
                filters.employment_type.length > 0 || filters.experience_level.length > 0) && (
                <Badge
                  variant="outline"
                  className="whitespace-nowrap cursor-pointer"
                  onClick={clearFilters}
                >
                  Clear All
                </Badge>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { label: 'Latest', value: 'created_at' },
                { label: 'Salary', value: 'salary_max' },
                { label: 'Popular', value: 'views_count' },
                { label: 'Easy Apply', value: 'applications_count' },
              ].map((sort) => (
                <Badge
                  key={sort.value}
                  variant={sortBy === sort.value ? "default" : "outline"}
                  className="whitespace-nowrap cursor-pointer"
                  onClick={() => setSortBy(sort.value)}
                >
                  {sort.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs Feed */}
        <div className="p-4">
          <JobsFeed
            filters={filters}
            sortBy={sortBy}
            className="space-y-4"
          />
        </div>
      </div>
    </MobileLayout>
  );
};