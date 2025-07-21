import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PublicPostDetail = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Post Detail</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Public post details will be displayed here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublicPostDetail;