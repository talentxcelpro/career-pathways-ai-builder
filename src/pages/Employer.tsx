
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building } from 'lucide-react';

const Employer = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Building className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Employer Dashboard</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Employer Portal</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Manage job postings, view applications, and find the best talent for your company.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Employer;
