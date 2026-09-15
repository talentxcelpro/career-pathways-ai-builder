
import React from 'react';
import { AnalyticsAdmin } from '@/components/analytics/AnalyticsAdmin';

const AnalyticsPage = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Management</h1>
        <p className="text-gray-600">
          Configure and monitor Google Analytics 4 and Search Console integration
        </p>
      </div>
      <AnalyticsAdmin />
    </div>
  );
};

export default AnalyticsPage;
