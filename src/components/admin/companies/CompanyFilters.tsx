
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ExportButton } from '@/components/admin/ExportButton';

interface CompanyFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  verificationFilter: string;
  setVerificationFilter: (filter: string) => void;
  industryFilter: string;
  setIndustryFilter: (filter: string) => void;
  companies: any[];
  industries: string[];
}

export const CompanyFilters: React.FC<CompanyFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  verificationFilter,
  setVerificationFilter,
  industryFilter,
  setIndustryFilter,
  companies,
  industries
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search companies by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Companies</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Industries</option>
            {industries?.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          <ExportButton 
            data={companies || []} 
            filename="companies-export" 
            format="csv"
          />
        </div>
      </CardContent>
    </Card>
  );
};
