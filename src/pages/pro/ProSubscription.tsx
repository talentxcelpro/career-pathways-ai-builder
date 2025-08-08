import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from 'react-router-dom';
import { AppleSubscriptionUI } from '@/components/subscription/AppleSubscriptionUI';
import { RazorpayScript } from '@/components/RazorpayScript';

export const ProSubscription: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <Helmet>
        <title>Pro Subscription | Razorpay Checkout</title>
        <meta name="description" content="Upgrade to Pro securely via Razorpay. Access premium career tools and unlimited downloads." />
        <link rel="canonical" href="https://talentxcel.in/pro/subscription" />
      </Helmet>
      <RazorpayScript />
      <div className="container mx-auto px-4 py-4">
        <h1 className="sr-only">Pro Subscription – Razorpay Payment</h1>
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/pro')} 
            className="hover:bg-white/80 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-right">
            <Link 
              to="/pro/subscription-policy" 
              className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              <FileText className="w-4 h-4 mr-1" />
              View Subscription Policy & Terms
            </Link>
          </div>
        </div>

        {/* Apple-inspired Subscription UI */}
        <AppleSubscriptionUI />
      </div>
    </div>
  );
};