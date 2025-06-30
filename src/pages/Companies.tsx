
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';

const Companies = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Building2 className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Explore Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Discover companies, read reviews, and find the perfect workplace culture for you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Companies;
