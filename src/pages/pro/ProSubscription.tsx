import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from 'react-router-dom';
import { AppleSubscriptionUI } from '@/components/subscription/AppleSubscriptionUI';
import { RazorpayScript } from '@/components/RazorpayScript';

export const ProSubscription: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <RazorpayScript />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/pro')} 
            className="mr-4 hover:bg-white/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                TalentXcel Pro
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Unlock your full potential with premium features
            </p>
            <div className="mt-4">
              <Link 
                to="/pro/subscription-policy" 
                className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <FileText className="w-4 h-4 mr-1" />
                View Subscription Policy & Terms
              </Link>
            </div>
          </div>
        </div>

        {/* Apple-inspired Subscription UI */}
        <AppleSubscriptionUI />
      </div>
    </div>
  );
};