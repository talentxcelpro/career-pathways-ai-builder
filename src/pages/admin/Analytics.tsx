
import React from 'react';
import { CareerAnalyticsAdmin } from '@/components/CareerAnalytics/CareerAnalyticsAdmin';

const CareerAnalyticsPage = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CareerAnalytics Management</h1>
        <p className="text-gray-600">
          Configure and monitor Google CareerAnalytics 4 and Search Console integration
        </p>
      </div>
      <CareerAnalyticsAdmin />
    </div>
  );
};

export default CareerAnalyticsPage;




