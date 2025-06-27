
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Eye, 
  Database, 
  Share2, 
  UserCheck, 
  Cookie,
  Globe,
  Calendar
} from 'lucide-react';

const Privacy = () => {
  const sections = [
    {
      title: "What We Collect",
      icon: Database,
      content: [
        "Personal Information: Name, email address, phone number, and profile picture",
        "Resume Data: Work experience, education, skills, and achievements",
        "Usage Behavior: Pages visited, features used, time spent on platform",
        "Device Information: Browser type, operating system, IP address",
        "Communication Data: Messages, feedback, and support interactions"
      ]
    },
    {
      title: "How We Use Data",
      icon: Eye,
      content: [
        "AI Personalization: Customizing job recommendations and career insights",
        "Job Matching: Connecting you with relevant opportunities",
        "Analytics: Improving platform performance and user experience",
        "Communication: Sending notifications, updates, and support responses",
        "Security: Protecting your account and preventing fraud"
      ]
    },
    {
      title: "Data Sharing",
      icon: Share2,
      content: [
        "With Your Consent: We share data only when you explicitly agree",
        "Anonymized Insights: Aggregated, non-identifiable data for research",
        "Service Providers: Trusted partners who help us operate the platform",
        "Legal Requirements: When required by law or to protect rights",
        "Business Transfers: In case of merger or acquisition (with notice)"
      ]
    },
    {
      title: "Your Rights",
      icon: UserCheck,
      content: [
        "Access: View all personal data we have about you",
        "Correct: Update or fix any inaccurate information",
        "Delete: Request removal of your personal data",
        "Restrict: Limit how we process your information",
        "Portability: Download your data in a standard format",
        "Object: Opt-out of certain data processing activities"
      ]
    },
    {
      title: "Cookies & Tracking",
      icon: Cookie,
      content: [
        "Essential Cookies: Required for platform functionality",
        "Performance Cookies: Help us understand how you use the site",
        "Personalization Cookies: Remember your preferences and settings",
        "Marketing Cookies: Used for targeted advertising (with consent)",
        "Third-party Cookies: From integrated services like analytics providers"
      ]
    },
    {
      title: "Compliance",
      icon: Globe,
      content: [
        "GDPR Compliance: Full compliance with European data protection laws",
        "CCPA Compliance: Adhering to California Consumer Privacy Act",
        "Data Retention: We keep data only as long as necessary",
        "International Transfers: Proper safeguards for cross-border data",
        "Regular Audits: Ongoing security and privacy assessments"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-blue-600 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Privacy Matters to Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are committed to protecting your personal information and being transparent about how we collect, use, and share your data.
          </p>
        </div>

        {/* Last Updated */}
        <Card className="bg-blue-50 border-blue-200 mb-8">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Last updated: June 2025</span>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <section.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 shadow-xl mt-12">
          <CardContent className="p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Questions About Your Privacy?</h2>
            <p className="text-blue-100 mb-6">
              We're here to help. Contact our privacy team if you have any questions or concerns about how we handle your data.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge className="bg-white text-blue-600 px-4 py-2">
                privacy@talentxcel.in
              </Badge>
              <Badge className="bg-white/20 text-white px-4 py-2">
                Data Protection Officer
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-green-50 border-green-200 mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Privacy Summary</h3>
            <p className="text-green-800">
              We collect only the data necessary to provide our services, use it to enhance your experience, 
              and never sell your personal information. You have full control over your data and can access, 
              modify, or delete it at any time.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
