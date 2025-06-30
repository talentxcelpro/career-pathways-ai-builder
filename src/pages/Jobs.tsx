
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';

const Jobs = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Briefcase className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Find Your Next Opportunity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Discover amazing job opportunities that match your skills and preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Jobs;
