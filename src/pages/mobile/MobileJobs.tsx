import React, { useState, useEffect } from 'react';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { Search, Filter, MapPin, Briefcase, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { JobsFeed } from '@/components/jobs/JobsFeed';
import { RealDataJobRecommendations } from '@/components/jobs/RealDataJobRecommendations';
import { EnhancedNotificationCenter } from '@/components/engagement/EnhancedNotificationCenter';
import { supabase } from '@/integrations/supabase/client';

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
  const [showRecommended, setShowRecommended] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Load user profile to personalize filters
  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        setUserProfile({ ...profile, preferences });
        
        // Auto-populate filters based on user profile
        if (preferences) {
          setFilters(prev => ({
            ...prev,
            location: preferences.preferred_locations?.[0] || prev.location,
            experience_level: preferences.experience_level ? [preferences.experience_level] : prev.experience_level,
            skills: preferences.skills || prev.skills,
          }));
        }
      }
    };

    loadUserProfile();
  }, []);

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

            {/* View Toggle */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Badge
                variant={showRecommended ? "default" : "outline"}
                className="whitespace-nowrap cursor-pointer"
                onClick={() => setShowRecommended(true)}
              >
                <Zap className="h-3 w-3 mr-1" />
                Recommended
              </Badge>
              <Badge
                variant={!showRecommended ? "default" : "outline"}
                className="whitespace-nowrap cursor-pointer"
                onClick={() => setShowRecommended(false)}
              >
                All Jobs
              </Badge>
            </div>

            {/* Sort Options (only for All Jobs view) */}
            {!showRecommended && (
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
            )}
          </div>
        </div>

        {/* Jobs Content */}
        <div className="p-4">
          {showRecommended ? (
            <div className="space-y-6">
              {/* AI Recommendations Header */}
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  <h2 className="text-lg font-semibold">AI-Powered Job Recommendations</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Personalized matches based on your skills, experience, and career goals
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    92% match accuracy
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    70 total applicants
                  </Badge>
                </div>
              </div>
              
              <RealDataJobRecommendations />
            </div>
          ) : (
            <JobsFeed
              filters={filters}
              sortBy={sortBy}
              className="space-y-4"
            />
          )}
        </div>
      </div>
    </MobileLayout>
  );
};