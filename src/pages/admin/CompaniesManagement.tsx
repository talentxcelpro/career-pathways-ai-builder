
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { CompanyStatsCards } from '@/components/admin/companies/CompanyStatsCards';
import { CompanyFilters } from '@/components/admin/companies/CompanyFilters';
import { CompaniesList } from '@/components/admin/companies/CompaniesList';
import { useCompaniesManagement } from '@/hooks/useCompaniesManagement';

const CompaniesManagement = () => {
  const {
    searchTerm,
    setSearchTerm,
    verificationFilter,
    setVerificationFilter,
    industryFilter,
    setIndustryFilter,
    companies,
    isLoading,
    companyStats,
    handleToggleVerification
  } = useCompaniesManagement();

  return (
    <UnifiedAdminLayout 
      title="Companies Management" 
      description="Manage company profiles and verification status"
    >
      <div className="space-y-8">
        <CompanyStatsCards companyStats={companyStats} />
        
        <CompanyFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          verificationFilter={verificationFilter}
          setVerificationFilter={setVerificationFilter}
          industryFilter={industryFilter}
          setIndustryFilter={setIndustryFilter}
          companies={companies || []}
          industries={companyStats?.industries || []}
        />

        <CompaniesList
          companies={companies || []}
          isLoading={isLoading}
          onToggleVerification={handleToggleVerification}
        />
      </div>
    </UnifiedAdminLayout>
  );
};

export default CompaniesManagement;
