
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const Resume = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <FileText className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Resume</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Resume Builder & Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Create, edit, and manage your professional resume with our powerful tools.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Resume;
