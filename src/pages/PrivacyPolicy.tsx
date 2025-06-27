
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "What We Collect",
      content: `We collect information that you provide directly to us, including:
      • Personal information (name, email address, phone number)
      • Professional information (resume data, work experience, skills)
      • Usage behavior (how you interact with our platform)
      • Device information (browser type, IP address, operating system)
      • Communication preferences and feedback`
    },
    {
      title: "How We Use Data",
      content: `We use your information to:
      • Provide and improve our AI-powered career services
      • Personalize job matching and career recommendations
      • Facilitate connections between professionals and employers
      • Analyze platform usage to enhance user experience
      • Send relevant notifications and updates
      • Comply with legal obligations and prevent fraud`
    },
    {
      title: "Data Sharing",
      content: `We only share your data:
      • With your explicit consent
      • With employers when you apply for jobs (limited to application-relevant information)
      • As anonymized insights for research and analytics
      • With service providers who assist in platform operations
      • When required by law or to protect our legal rights
      • In case of business transfers (with prior notice)`
    },
    {
      title: "User Rights",
      content: `You have the right to:
      • Access your personal data and download a copy
      • Correct inaccurate or incomplete information
      • Delete your account and associated data
      • Restrict processing of your data
      • Object to certain uses of your information
      • Data portability (transfer to another service)
      • Withdraw consent at any time`
    },
    {
      title: "Cookies & Tracking",
      content: `We use cookies and similar technologies to:
      • Remember your preferences and settings
      • Analyze platform performance and user behavior
      • Provide personalized content and recommendations
      • Enable social media features and advertising
      You can control cookie settings through your browser preferences.`
    },
    {
      title: "GDPR & CCPA Compliance",
      content: `We are committed to compliance with:
      • General Data Protection Regulation (GDPR) for EU residents
      • California Consumer Privacy Act (CCPA) for California residents
      • Other applicable privacy laws and regulations
      We have implemented appropriate technical and organizational measures to protect your data.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Shield className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Your Privacy Matters to Us</h1>
          <p className="text-xl text-blue-100">Transparent data practices for your peace of mind</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Last Updated */}
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">
              <strong>Last updated:</strong> June 2025
            </p>
            <p className="text-sm text-gray-500 mt-2">
              We may update this privacy policy from time to time. We will notify you of any significant changes.
            </p>
          </CardContent>
        </Card>

        {/* Privacy Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">Contact Us About Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="text-gray-600">
              <p><strong>Email:</strong> privacy@talentxcel.in</p>
              <p><strong>Address:</strong> TalentXcel Services, Bengaluru, India</p>
              <p><strong>Data Protection Officer:</strong> dpo@talentxcel.in</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
