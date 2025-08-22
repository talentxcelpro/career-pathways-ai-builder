import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, User, MapPin, Briefcase, Filter as FilterIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CVCard } from './CVCard';

interface PlatformCVsProps {
  selectedCVs: string[];
  onSelectCV: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
}

export const PlatformCVs: React.FC<PlatformCVsProps> = ({
  selectedCVs,
  onSelectCV,
  onSelectAll
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: platformCVs, isLoading } = useQuery({
    queryKey: ['platform_cvs'],
    queryFn: async () => {
      // Get all profiles that have meaningful content (resume URL, about section, or work experience)
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          phone,
          location,
          title,
          profile_picture_url,
          about,
          skills,
          experience_years,
          current_company,
          looking_for_job,
          resume_url,
          created_at,
          linkedin_url,
          github_url,
          portfolio_url,
          industry,
          user_role
        `)
        .neq('user_role', 'employer')
        .eq('is_profile_public', true)
        .or('resume_url.neq.,about.neq.,skills.not.is.null')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out profiles with minimal information
      return data?.filter(profile => 
        profile.resume_url || 
        (profile.about && profile.about.length > 50) ||
        (profile.skills && profile.skills.length > 0) ||
        profile.experience_years
      ).map(profile => ({
        id: profile.id,
        full_name: profile.full_name || 'Unknown',
        email: profile.email || '',
        phone: profile.phone,
        location: profile.location,
        title: profile.title,
        resume_url: profile.resume_url,
        profile_picture_url: profile.profile_picture_url,
        about: profile.about,
        skills: profile.skills || [],
        experience_years: profile.experience_years,
        current_company: profile.current_company,
        looking_for_job: profile.looking_for_job,
        created_at: profile.created_at,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url,
        portfolio_url: profile.portfolio_url,
        industry: profile.industry
      })) || [];
    }
  });

  const filteredCVs = platformCVs?.filter(cv => {
    const matchesSearch = !searchTerm || 
      cv.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.current_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cv.about?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLocation = !locationFilter || 
      cv.location?.toLowerCase().includes(locationFilter.toLowerCase());

    const matchesExperience = !experienceFilter || 
      (experienceFilter === '0-2' && (cv.experience_years || 0) <= 2) ||
      (experienceFilter === '3-5' && (cv.experience_years || 0) >= 3 && (cv.experience_years || 0) <= 5) ||
      (experienceFilter === '6-10' && (cv.experience_years || 0) >= 6 && (cv.experience_years || 0) <= 10) ||
      (experienceFilter === '10+' && (cv.experience_years || 0) > 10);

    return matchesSearch && matchesLocation && matchesExperience;
  }) || [];

  const handleSelectAll = () => {
    if (selectedCVs.length === filteredCVs.length) {
      onSelectAll([]);
    } else {
      onSelectAll(filteredCVs.map(cv => cv.id));
    }
  };

  // Get unique locations for filter
  const uniqueLocations = [...new Set(platformCVs?.map(cv => cv.location).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search candidates by name, title, company, skills, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterIcon className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Experience</label>
                <select
                  className="w-full px-3 py-2 border rounded-md"
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                >
                  <option value="">All Experience Levels</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setLocationFilter('');
                    setExperienceFilter('');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            {filteredCVs.length} candidates found
          </p>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedCVs.length === filteredCVs.length && filteredCVs.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm">Select All</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {locationFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {locationFilter}
            </Badge>
          )}
          {experienceFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {experienceFilter} years
            </Badge>
          )}
        </div>
      </div>

      {/* CV Cards */}
      <div className="grid gap-4">
        {filteredCVs.map((cv) => (
          <CVCard
            key={cv.id}
            cv={cv}
            isSelected={selectedCVs.includes(cv.id)}
            onSelect={onSelectCV}
            showJobInfo={false}
          />
        ))}
      </div>

      {filteredCVs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
            <p className="text-gray-600">
              {platformCVs?.length === 0 
                ? "No candidate profiles available in the platform yet" 
                : "Try adjusting your search criteria or filters"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};