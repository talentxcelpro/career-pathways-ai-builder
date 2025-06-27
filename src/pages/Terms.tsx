
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const Terms = () => {
  const sections = [
    {
      title: "Acceptance of Terms",
      content: `By accessing and using TalentXcel, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      title: "User Accounts & Responsibilities",
      content: `• You must provide accurate and complete information when creating an account
      • You are responsible for maintaining the confidentiality of your account credentials
      • You must notify us immediately of any unauthorized use of your account
      • You are responsible for all activities that occur under your account
      • You must be at least 18 years old to use our services`
    },
    {
      title: "Platform Features & Limitations",
      content: `• Our platform provides career-related tools and services
      • We strive to maintain high availability but do not guarantee uninterrupted service
      • Features may be modified, suspended, or discontinued at any time
      • We reserve the right to limit usage to prevent abuse
      • Some features may require paid subscriptions`
    },
    {
      title: "AI Tools & Accuracy Disclaimer",
      content: `• Our AI-powered tools provide suggestions and recommendations
      • Results are based on algorithms and may not always be accurate
      • AI recommendations should be used as guidance, not definitive advice
      • We do not guarantee job placement or career success
      • Users should verify all information and make independent decisions`
    },
    {
      title: "Intellectual Property",
      content: `• All content, trademarks, and intellectual property remain our property
      • Users retain ownership of their uploaded content (resumes, profiles, etc.)
      • By uploading content, you grant us license to use it for platform operations
      • Users may not copy, modify, or distribute our proprietary content
      • We respect intellectual property rights and respond to valid DMCA notices`
    },
    {
      title: "Prohibited Uses",
      content: `You may not use our platform to:
      • Post false, misleading, or fraudulent information
      • Harass, threaten, or spam other users
      • Violate any applicable laws or regulations
      • Attempt to gain unauthorized access to our systems
      • Use automated tools to scrape or collect data
      • Impersonate others or create fake profiles`
    },
    {
      title: "Limitation of Liability",
      content: `• Our services are provided "as is" without warranties
      • We are not liable for indirect, incidental, or consequential damages
      • Our total liability is limited to the amount paid for our services
      • We do not guarantee specific outcomes from using our platform
      • Users assume all risks associated with their use of our services`
    },
    {
      title: "Termination",
      content: `• Either party may terminate this agreement at any time
      • We may suspend or terminate accounts for violations of these terms
      • Upon termination, your right to use our services ceases immediately
      • We may retain certain information as required by law
      • Termination does not affect accrued rights or obligations`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <FileText className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">TalentXcel Terms & Conditions</h1>
          <p className="text-xl text-blue-100">Please read these terms carefully before using our services</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Effective Date */}
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">
              <strong>Effective Date:</strong> June 2025
            </p>
            <p className="text-sm text-gray-500 mt-2">
              These terms govern your use of TalentXcel services and supersede all prior agreements.
            </p>
          </CardContent>
        </Card>

        {/* Terms Sections */}
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

        {/* Governing Law */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">Governing Law</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              These terms and conditions are governed by and construed in accordance with the laws of India. 
              Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts in Bengaluru, India.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">Questions About These Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="text-gray-600">
              <p><strong>Email:</strong> legal@talentxcel.in</p>
              <p><strong>Address:</strong> TalentXcel Services, Bengaluru, India</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
