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
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Crown className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-lg font-bold mb-4">Pro Subscription Policy</h1>
          <p className="text-xl text-blue-100">Terms and conditions for TalentXcel Pro subscription services</p>
          
          <div className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/pro/subscription')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subscription Plans
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Last Updated */}
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">
              <strong>Effective Date:</strong> January 15, 2025 | <strong>Last Updated:</strong> January 15, 2025
            </p>
            <p className="text-sm text-gray-500 mt-2">
              We may update this subscription policy from time to time. Existing subscribers will be notified 30 days before any changes take effect.
            </p>
          </CardContent>
        </Card>

        {/* Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <Crown className="h-6 w-6 mr-2 text-purple-600" />
              Subscription Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                TalentXcel Pro subscription services ("Pro Services") provide premium features and enhanced functionality for career advancement, professional services, and business growth. This policy governs all Pro subscription tiers including Pro Starter, Pro Business, and Pro Elite.
              </p>
              <p>
                By subscribing to any Pro plan, you agree to these terms in addition to our general Terms of Service and Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plans */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-green-600" />
              Subscription Plans & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Pro Starter (₹999/month)</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Up to 3 service listings</li>
                  <li>• Basic CRM and lead management</li>
                  <li>• Portfolio upload and showcase</li>
                  <li>• Basic analytics dashboard</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Pro Business (₹2,499/month)</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Up to 10 service listings</li>
                  <li>• Advanced CRM with automation</li>
                  <li>• AI business tools and insights</li>
                  <li>• Payment integration capabilities</li>
                  <li>• Priority marketplace positioning</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Pro Elite (₹4,999/month)</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Unlimited service listings</li>
                  <li>• Full CRM suite with advanced analytics</li>
                  <li>• Complete AI business toolkit</li>
                  <li>• E-contracts and NDA management</li>
                  <li>• Custom branding and white-label options</li>
                  <li>• Dedicated account management</li>
                </ul>
              </div>

              <p className="mt-4 p-4 bg-blue-50 rounded-lg">
                <strong>Note:</strong> All prices are in Indian Rupees (₹) and are subject to applicable taxes. International pricing may vary based on local currency and tax requirements.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Billing and Payment */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <CreditCard className="h-6 w-6 mr-2 text-blue-600" />
              Billing & Payment Terms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Payment Processing</h3>
                <ul className="space-y-1 ml-4">
                  <li>• All payments are processed securely through Razorpay</li>
                  <li>• We accept major credit cards, debit cards, and UPI payments</li>
                  <li>• Subscriptions are billed monthly in advance</li>
                  <li>• Failed payments may result in service suspension</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Automatic Renewal</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Subscriptions automatically renew on the same date each month</li>
                  <li>• You will be charged the current subscription rate at renewal</li>
                  <li>• We will notify you 7 days before each renewal</li>
                  <li>• You can cancel at any time to avoid future charges</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Price Changes</h3>
                <ul className="space-y-1 ml-4">
                  <li>• We reserve the right to modify subscription prices</li>
                  <li>• Existing subscribers will receive 60 days advance notice</li>
                  <li>• Price changes apply to renewal cycles after the notice period</li>
                  <li>• You may cancel before price changes take effect</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cancellation & Refunds */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <RefreshCw className="h-6 w-6 mr-2 text-orange-600" />
              Cancellation & Refund Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Cancellation</h3>
                <ul className="space-y-1 ml-4">
                  <li>• You can cancel your subscription at any time from your account settings</li>
                  <li>• Cancellation takes effect at the end of your current billing period</li>
                  <li>• You retain access to Pro features until the end of the paid period</li>
                  <li>• No partial refunds are provided for unused portion of the billing cycle</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Refund Policy</h3>
                <ul className="space-y-1 ml-4">
                  <li>• New subscribers: 7-day money-back guarantee from first payment</li>
                  <li>• Refunds are processed within 5-10 business days</li>
                  <li>• Refunds are issued to the original payment method</li>
                  <li>• Service must be cancelled within the refund period</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800">Important Notice</h4>
                    <p className="text-amber-700 text-sm mt-1">
                      Refunds are not available for subscribers who have violated our Terms of Service or engaged in fraudulent activities.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Availability */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-green-600" />
              Service Availability & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Service Level Agreement</h3>
                <ul className="space-y-1 ml-4">
                  <li>• We strive for 99.9% uptime for all Pro services</li>
                  <li>• Scheduled maintenance will be announced 48 hours in advance</li>
                  <li>• Emergency maintenance may occur with minimal notice</li>
                  <li>• Service credits may be available for extended outages</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Customer Support</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Pro Starter: Email support with 24-hour response time</li>
                  <li>• Pro Business: Priority email support with 12-hour response time</li>
                  <li>• Pro Elite: Dedicated support with 4-hour response time</li>
                  <li>• All plans include access to our comprehensive help center</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Limits */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <Users className="h-6 w-6 mr-2 text-indigo-600" />
              Usage Limits & Fair Use
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Service Limits</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Service listings are limited per plan tier</li>
                  <li>• API calls and data export have reasonable usage limits</li>
                  <li>• Storage limits apply to uploaded content and files</li>
                  <li>• Excessive usage may result in temporary throttling</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Fair Use Policy</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Services must be used for legitimate business purposes</li>
                  <li>• Automated or bot usage is prohibited without approval</li>
                  <li>• Sharing accounts or credentials is strictly forbidden</li>
                  <li>• Violating fair use may result in account suspension</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-purple-600" />
              Data Handling & Privacy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Pro Subscriber Data</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Enhanced data analytics and insights for business growth</li>
                  <li>• CRM data is securely stored and encrypted</li>
                  <li>• Client and lead information remains private to your account</li>
                  <li>• Data export available in standard formats upon request</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Data Retention</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Pro features data is retained for 90 days after cancellation</li>
                  <li>• Account deletion removes all Pro-specific data permanently</li>
                  <li>• Backup and recovery services available for Elite subscribers</li>
                  <li>• Data portability rights apply as per applicable laws</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-blue-600" />
              Contact & Support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                For questions about your Pro subscription, billing issues, or policy clarifications, please contact us:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <p><strong>Email:</strong> pro-support@talentxcel.in</p>
                  <p><strong>Phone:</strong> +91-120-XXXXXX</p>
                  <p><strong>Business Hours:</strong> Monday to Friday, 9:00 AM to 6:00 PM IST</p>
                  <p><strong>Address:</strong> TalentXcel Technologies Pvt Ltd, Noida, Uttar Pradesh, India</p>
                </div>
              </div>

              <p className="text-sm">
                This policy is governed by Indian law and any disputes will be resolved in the courts of Noida, Uttar Pradesh, India.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Agreement */}
        <Card>
          <CardContent className="p-6 text-center bg-gradient-to-r from-purple-50 to-blue-50">
            <Crown className="h-12 w-12 mx-auto mb-4 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Agreement Acceptance</h3>
            <p className="text-gray-600">
              By subscribing to any TalentXcel Pro plan, you acknowledge that you have read, understood, and agree to be bound by this Subscription Policy along with our Terms of Service and Privacy Policy.
            </p>
            <div className="mt-4 space-x-4">
              <Button onClick={() => navigate('/pro/subscription')} className="bg-purple-600 hover:bg-purple-700">
                View Subscription Plans
              </Button>
              <Button variant="outline" onClick={() => navigate('/terms')}>
                View Terms of Service
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProSubscriptionPolicy;