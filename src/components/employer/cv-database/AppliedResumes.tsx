import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CVCard } from './CVCard';

interface AppliedResumesProps {
  selectedCVs: string[];
  onSelectCV: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
}

export const AppliedResumes: React.FC<AppliedResumesProps> = ({
  selectedCVs,
  onSelectCV,
  onSelectAll
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: appliedCVs, isLoading } = useQuery({
    queryKey: ['applied_resumes'],
    queryFn: async () => {
      // Get job applications with user profiles and job details
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          applied_at,
          status,
          resume_url,
          application_data,
          job_id,
          jobs (
            title,
            company_name
          ),
          profiles (
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
            current_company
          )
        `)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our CV format
      return data?.map((app: any) => ({
        id: app.id,
        full_name: app.profiles?.full_name || 'Unknown',
        email: app.profiles?.email || '',
        phone: app.profiles?.phone,
        location: app.profiles?.location,
        title: app.profiles?.title,
        resume_url: app.resume_url || app.profiles?.resume_url,
        profile_picture_url: app.profiles?.profile_picture_url,
        about: app.profiles?.about,
        skills: app.profiles?.skills || [],
        experience_years: app.profiles?.experience_years,
        current_company: app.profiles?.current_company,
        applied_at: app.applied_at,
        job_title: app.jobs?.title,
        company_name: app.jobs?.company_name,
        status: app.status,
        application_source: 'platform'
      })) || [];
    }
  });

  const filteredCVs = appliedCVs?.filter(cv =>
    cv.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cv.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleSelectAll = () => {
    if (selectedCVs.length === filteredCVs.length) {
      onSelectAll([]);
    } else {
      onSelectAll(filteredCVs.map(cv => cv.id));
    }
  };

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
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search applied candidates by name, job title, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-gray-600">
            {filteredCVs.length} applied candidates found
          </p>
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedCVs.length === filteredCVs.length && filteredCVs.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm">Select All</span>
          </div>
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
            showJobInfo={true}
          />
        ))}
      </div>

      {filteredCVs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No applied candidates found</h3>
            <p className="text-gray-600">
              {appliedCVs?.length === 0 
                ? "No one has applied to your jobs yet" 
                : "Try adjusting your search criteria"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};