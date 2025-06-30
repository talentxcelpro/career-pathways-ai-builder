
import React, { useState } from 'react';
import { SmartJobSearch } from '@/components/jobs/SmartJobSearch';
import { PersonalInsights } from '@/components/jobs/PersonalInsights';
import { EnhancedJobFilters } from '@/components/jobs/EnhancedJobFilters';
import { JobCategoriesGrid } from '@/components/jobs/JobCategoriesGrid';
import { UserControlPanel } from '@/components/jobs/UserControlPanel';
import { EmptyJobsState } from '@/components/jobs/EmptyJobsState';

const ComprehensiveJobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    employment_type: [] as string[],
    experience_level: [] as string[],
    salary_min: 0,
    salary_max: 0,
    is_remote: false,
    skills: [] as string[],
  });

  const handleSearch = () => {
    console.log('Searching for:', searchTerm, 'in', location);
    // Implement search logic here
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setLocation('');
    setFilters({
      search: '',
      location: '',
      employment_type: [],
      experience_level: [],
      salary_min: 0,
      salary_max: 0,
      is_remote: false,
      skills: [],
    });
  };

  const handleUpdateResume = () => {
    console.log('Navigate to resume update');
    // Implement navigation to resume page
  };

  const handleSetAlerts = () => {
    console.log('Set up job alerts');
    // Implement job alerts setup
  };

  const handleClearFilters = () => {
    handleResetFilters();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              TalentXcel Job Portal
            </h1>
            <p className="text-gray-600">
              Filter jobs, explore industries, and save your preferences to receive perfect matches daily.
            </p>
          </div>
          
          <SmartJobSearch
            searchTerm={searchTerm}
            location={location}
            onSearchChange={setSearchTerm}
            onLocationChange={setLocation}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <PersonalInsights />
            
            <EnhancedJobFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Job Categories */}
            <JobCategoriesGrid />

            {/* User Controls */}
            <UserControlPanel />

            {/* Empty State - No Jobs Found */}
            <EmptyJobsState
              onResetFilters={handleResetFilters}
              onUpdateResume={handleUpdateResume}
              onSetAlerts={handleSetAlerts}
            />

            {/* Footer Info */}
            <div className="text-center py-8 border-t">
              <p className="text-gray-600 text-sm">
                🔔 Subscribe for real-time alerts for{' '}
                <a 
                  href="https://talentxcel.in/jobs" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  https://talentxcel.in/jobs
                </a>
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Join thousands of professionals who find their dream jobs through TalentXcel
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveJobs;
