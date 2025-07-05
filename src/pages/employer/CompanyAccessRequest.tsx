import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CompanyAccessRequests } from '@/components/employer/CompanyAccessRequests';

const CompanyAccessRequestPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/employer/settings')}
              className="flex items-center mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Company Access Requests</h1>
              <p className="text-gray-600">Join existing companies or manage access requests for your company</p>
            </div>
          </div>
        </div>

        {/* Company Access Requests Component */}
        <CompanyAccessRequests />
      </div>
    </div>
  );
};

export default CompanyAccessRequestPage;