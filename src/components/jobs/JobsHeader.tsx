
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, TrendingUp, MapPin, DollarSign, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobsHeaderProps {
  jobsCount: number;
  remoteJobsCount: number;
  featuredJobsCount: number;
  categoriesCount: number;
}

export const JobsHeader: React.FC<JobsHeaderProps> = ({
  jobsCount,
  remoteJobsCount,
  featuredJobsCount,
  categoriesCount
}) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Find Your Dream Job</h1>
          <p className="text-gray-600 mt-2">
            Discover {jobsCount} opportunities from top companies
          </p>
        </div>
        <Button
          onClick={() => navigate('/jobs/post')}
          className="hidden md:flex"
        >
          <Plus className="h-4 w-4 mr-2" />
          Post a Job
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{jobsCount}</div>
            <div className="text-sm text-gray-500">Active Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <MapPin className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{remoteJobsCount}</div>
            <div className="text-sm text-gray-500">Remote Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{featuredJobsCount}</div>
            <div className="text-sm text-gray-500">Featured</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{categoriesCount}</div>
            <div className="text-sm text-gray-500">Categories</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
