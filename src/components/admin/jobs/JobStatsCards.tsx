
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Building2 } from 'lucide-react';

interface JobStatsCardsProps {
  jobStats: {
    totalJobs: number;
    activeJobs: number;
    featuredJobs: number;
    expiredJobs: number;
    governmentJobs?: number;
    privateJobs?: number;
  } | undefined;
}

export const JobStatsCards: React.FC<JobStatsCardsProps> = ({ jobStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{jobStats?.totalJobs?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{jobStats?.activeJobs?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Featured Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{jobStats?.featuredJobs?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Expired Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{jobStats?.expiredJobs?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-emerald-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Government Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{jobStats?.governmentJobs?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Private Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{jobStats?.privateJobs?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
