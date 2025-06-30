
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map } from 'lucide-react';

const CareerMap = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Map className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Career Map</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Career Path Planning</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Plan your career journey with personalized roadmaps and guidance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CareerMap;
