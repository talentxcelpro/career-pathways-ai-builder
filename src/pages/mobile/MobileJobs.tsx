import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MobileSearchHeader } from '@/components/search/MobileSearchHeader';
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Bookmark, 
  ExternalLink,
  Filter,
  Briefcase,
  Building
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MobileJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('');

  // Fetch jobs from Supabase
  const { data: jobs = [], isLoading } = useQuery<any[]>({
    queryKey: ['mobile-jobs', searchTerm, locationFilter, jobTypeFilter],
    queryFn: async () => {
      let query = supabase
        .from('jobs')
        .select(`
          id, 
          title, 
          company_name, 
          location, 
          created_at, 
          salary_min, 
          salary_max, 
          employment_type, 
          skills_required, 
          description, 
          external_url,
          is_active
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%`);
      }

      if (locationFilter) {
        query = query.ilike('location', `%${locationFilter}%`);
      }

      if (jobTypeFilter) {
        query = query.eq('employment_type', jobTypeFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Jobs query error:', error);
        return [];
      }
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const formatSalary = (min: number, max: number) => {
    if (min && max) {
      return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    }
    if (min) {
      return `$${(min / 1000).toFixed(0)}k+`;
    }
    return 'Salary not specified';
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Enhanced Search Header */}
        <MobileSearchHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearch={() => {}}
          activeFilters={[
            locationFilter && `Location: ${locationFilter}`,
            jobTypeFilter && `Type: ${jobTypeFilter}`
          ].filter(Boolean)}
          onClearFilters={() => {
            setLocationFilter('');
            setJobTypeFilter('');
            setSearchTerm('');
          }}
        />

        <div className="px-4 py-4 space-y-4">
          {/* Quick Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Select value={locationFilter} onValueChange={(v) => setLocationFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="min-w-[120px] rounded-2xl border-gray-200 bg-white/80">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="hyderabad">Hyderabad</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={jobTypeFilter} onValueChange={(v) => setJobTypeFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="min-w-[120px] rounded-2xl border-gray-200 bg-white/80">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

        {/* Jobs List */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4 pb-20">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : jobs.length === 0 ? (
              <Card className="p-8 text-center rounded-3xl border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No jobs found matching your criteria</p>
              </Card>
            ) : (
              jobs.map((job) => (
                <Card 
                  key={job.id} 
                  className="rounded-3xl border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-1">{job.title}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600 font-medium">{(job as any).company_name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(job.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-gray-100"
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 rounded-full">
                        {(job as any).employment_type}
                      </Badge>
                      {((job as any).skills_required || []).slice(0, 2).map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary" className="rounded-full">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {(job.salary_min || job.salary_max) && (
                      <div className="flex items-center gap-1 mb-4 text-green-600 font-semibold">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                      </div>
                    )}

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                        onClick={() => {
                          if ((job as any).external_url) {
                            window.open((job as any).external_url, '_blank');
                          } else {
                            navigate(`/jobs/${job.id}`);
                          }
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Apply Now
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 rounded-2xl border-gray-200 hover:bg-gray-50"
                        onClick={() => navigate(`/jobs/${job.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
        </div>
      </div>
    </MobileLayout>
  );
};