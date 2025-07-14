
import React, { useState } from 'react';
import { AdvancedHeroSection } from '@/components/jobs/AdvancedHeroSection';
import { IntelligentSearchBar } from '@/components/jobs/IntelligentSearchBar';
import { PersonalDashboard } from '@/components/jobs/PersonalDashboard';
import { EnhancedJobFilters } from '@/components/jobs/EnhancedJobFilters';
import { JobCategoriesGrid } from '@/components/jobs/JobCategoriesGrid';
import { AdvancedJobListings } from '@/components/jobs/AdvancedJobListings';
import { CompanyShowcase } from '@/components/jobs/CompanyShowcase';
import { UserControlPanel } from '@/components/jobs/UserControlPanel';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      {/* Advanced Hero Section */}
      <AdvancedHeroSection />
      
      {/* Intelligent Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <IntelligentSearchBar
          searchTerm={searchTerm}
          location={location}
          onSearchChange={setSearchTerm}
          onLocationChange={setLocation}
          onSearch={handleSearch}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <PersonalDashboard />
            
            <EnhancedJobFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-12">
            {/* Job Categories */}
            <JobCategoriesGrid />

            {/* Advanced Job Listings */}
            <AdvancedJobListings filters={filters} onClearFilters={handleClearFilters} />

            {/* Company Showcase */}
            <CompanyShowcase />

            {/* User Controls */}
            <UserControlPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveJobs;
