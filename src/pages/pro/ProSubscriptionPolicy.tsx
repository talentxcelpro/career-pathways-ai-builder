import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, RefreshCw, Shield, FileText, AlertTriangle, Crown, Calendar, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const ProSubscriptionPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-4">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Crown className="h-6 w-6 mx-auto mb-2" />
          <h1 className="text-sm font-bold mb-2">Pro Subscription Policy</h1>
          <p className="text-xs text-blue-100">Terms and conditions for TalentXcel Pro subscription services</p>
          
          <div className="mt-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/pro/subscription')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs px-2 py-1"
            >
              <ArrowLeft className="w-3 h-3 mr-1" />
              Back to Subscription Plans
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Last Updated */}
        <Card className="mb-2">
          <CardContent className="p-2 text-center">
            <p className="text-xs text-gray-600">
              <strong>Effective Date:</strong> January 15, 2025 | <strong>Last Updated:</strong> January 15, 2025
            </p>
            <p className="text-xs text-gray-500 mt-1">
              We may update this subscription policy from time to time. Existing subscribers will be notified 30 days before any changes take effect.
            </p>
          </CardContent>
        </Card>

        {/* Overview */}
        <Card className="mb-2">
          <CardHeader>
            <CardTitle className="text-sm text-gray-800 flex items-center">
              <Crown className="h-3 w-3 mr-1 text-purple-600" />
              Subscription Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                TalentXcel Pro subscription services provide premium features and enhanced functionality for career advancement.
              </p>
              <p>
                By subscribing to any Pro plan, you agree to these terms.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <Card className="mb-2">
          <CardHeader>
            <CardTitle className="text-sm text-gray-800 flex items-center">
              <DollarSign className="h-3 w-3 mr-1 text-green-600" />
              Subscription Plans & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Pro Starter (₹999/month)</h3>
                <ul className="space-y-0.5 ml-2">
                  <li>• Up to 3 service listings</li>
                  <li>• Basic CRM and lead management</li>
                  <li>• Portfolio upload</li>
                  <li>• Basic analytics</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Pro Business (₹2,499/month)</h3>
                <ul className="space-y-0.5 ml-2">
                  <li>• Up to 10 service listings</li>
                  <li>• Advanced CRM</li>
                  <li>• AI business tools</li>
                  <li>• Payment integration</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Pro Elite (₹4,999/month)</h3>
                <ul className="space-y-0.5 ml-2">
                  <li>• Unlimited service listings</li>
                  <li>• Full CRM suite</li>
                  <li>• Complete AI toolkit</li>
                  <li>• E-contracts and NDA</li>
                </ul>
              </div>

              <p className="mt-2 p-2 bg-blue-50 rounded-lg">
                <strong>Note:</strong> All prices are in Indian Rupees (₹) and are subject to applicable taxes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Billing and Payment */}
        <Card className="mb-2">
          <CardHeader>
            <CardTitle className="text-sm text-gray-800 flex items-center">
              <CreditCard className="h-3 w-3 mr-1 text-blue-600" />
              Billing & Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Payment Processing</h3>
                <ul className="space-y-0.5 ml-2">
                  <li>• All payments are processed securely through Razorpay</li>
                  <li>• We accept major credit cards, debit cards, and UPI</li>
                  <li>• Subscriptions are billed monthly in advance</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Automatic Renewal</h3>
                <ul className="space-y-0.5 ml-2">
                  <li>• Subscriptions automatically renew monthly</li>
                  <li>• You will be charged the current subscription rate</li>
                  <li>• 7 days advance notice for each renewal</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation & Refunds */}
        <Card className="mb-2">
          <CardHeader>
            <CardTitle className="text-sm text-gray-800 flex items-center">
              <RefreshCw className="h-3 w-3 mr-1 text-orange-600" />
              Cancellation & Refund Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Cancellation</h3>
                <ul className="space-y-0.5 ml-2">
                  <li>• You can cancel your subscription at any time</li>
                  <li>• Cancellation takes effect at the end of billing period</li>
                  <li>• You retain access to Pro features until paid period ends</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Refund Policy</h3>
                <ul className="space-y-0.5 ml-2">
                  <li>• New subscribers: 7-day money-back guarantee</li>
                  <li>• Refunds are processed within 5-10 business days</li>
                  <li>• Refunds are issued to the original payment method</li>
                </ul>
              </div>

              <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start">
                  <AlertTriangle className="h-3 w-3 text-amber-500 mr-1 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 text-xs">Important Notice</h4>
                    <p className="text-amber-700 text-xs mt-1">
                      Refunds are not available for subscribers who have violated our Terms of Service.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agreement */}
        <Card>
          <CardContent className="p-3 text-center bg-gradient-to-r from-purple-50 to-blue-50">
            <Crown className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Agreement Acceptance</h3>
            <p className="text-xs text-gray-600">
              By subscribing to any TalentXcel Pro plan, you acknowledge that you have read, understood, and agree to be bound by this Subscription Policy.
            </p>
            <div className="mt-2 space-x-2">
              <Button onClick={() => navigate('/pro/subscription')} className="bg-purple-600 hover:bg-purple-700 text-xs px-2 py-1">
                View Plans
              </Button>
              <Button variant="outline" onClick={() => navigate('/terms')} className="text-xs px-2 py-1">
                View Terms
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProSubscriptionPolicy;