import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BacklinkDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Backlink System</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Automated backlink management and monitoring system is being implemented.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BacklinkDashboard;