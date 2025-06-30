
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const Admin = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Platform Administration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Manage users, content, and platform settings from this admin panel.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
