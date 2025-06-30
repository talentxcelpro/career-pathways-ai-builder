
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, CheckCircle, Users, Briefcase } from 'lucide-react';

interface CompanyStatsCardsProps {
  companyStats: {
    totalCompanies: number;
    verifiedCompanies: number;
    activeCompanies: number;
    industries: string[];
  } | undefined;
}

export const CompanyStatsCards: React.FC<CompanyStatsCardsProps> = ({ companyStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900">{companyStats?.totalCompanies?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-gray-900">{companyStats?.verifiedCompanies?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">New (30 days)</p>
              <p className="text-2xl font-bold text-gray-900">{companyStats?.activeCompanies?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Industries</p>
              <p className="text-2xl font-bold text-gray-900">{companyStats?.industries?.length || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
