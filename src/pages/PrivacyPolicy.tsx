import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, Users, Database, Globe, FileCheck, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <Shield className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl text-blue-100">Your privacy is our priority. Learn how we protect and use your information.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Last Updated */}
        <Card className="mb-8">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">
              <strong>Effective Date:</strong> July 01, 2025 | <strong>Last Updated:</strong> July 01, 2025
            </p>
            <p className="text-sm text-gray-500 mt-2">
              We may update this privacy policy from time to time. We will notify you of any significant changes via email or through our platform.
            </p>
          </CardContent>
        </Card>

        {/* Introduction */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <FileCheck className="h-6 w-6 mr-2 text-blue-600" />
              Introduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                Welcome to TalentXcel ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our career platform and AI-powered services.
              </p>
              <p>
                TalentXcel is a comprehensive career platform that connects job seekers with employers, provides AI-powered career insights, resume optimization, skill development, and professional networking opportunities. We operate from Noida, India, and serve users globally.
              </p>
              <p>
                By using our services, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <Database className="h-6 w-6 mr-2 text-green-600" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Full name, email address, phone number</li>
                  <li>• Professional title, work experience, education background</li>
                  <li>• Resume and CV data (skills, achievements, certifications)</li>
                  <li>• Profile photos and video resumes</li>
                  <li>• Location and preferred work locations</li>
                  <li>• Salary expectations and career preferences</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Usage Information</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Job search queries and application history</li>
                  <li>• Learning progress and course completions</li>
                  <li>• Platform interactions and feature usage</li>
                  <li>• Communication history and messages</li>
                  <li>• Network connections and professional relationships</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Technical Information</h3>
                <ul className="space-y-1 ml-4">
                  <li>• IP address, browser type, and device information</li>
                  <li>• Cookies, web beacons, and similar tracking technologies</li>
                  <li>• Login timestamps and session data</li>
                  <li>• Performance metrics and error logs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <Eye className="h-6 w-6 mr-2 text-orange-600" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Core Services</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Provide AI-powered job matching and career recommendations</li>
                  <li>• Enable resume optimization and ATS scoring</li>
                  <li>• Facilitate connections between job seekers and employers</li>
                  <li>• Deliver personalized learning and skill development content</li>
                  <li>• Generate career insights and market analytics</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Communication</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Send job alerts and career opportunities</li>
                  <li>• Provide platform updates and feature announcements</li>
                  <li>• Respond to your inquiries and support requests</li>
                  <li>• Send educational content and industry insights</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Platform Improvement</h3>
                <ul className="space-y-1 ml-4">
                  <li>• Analyze usage patterns to enhance user experience</li>
                  <li>• Improve AI algorithms and matching accuracy</li>
                  <li>• Conduct research on career trends and market demands</li>
                  <li>• Prevent fraud and ensure platform security</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Sharing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <Users className="h-6 w-6 mr-2 text-purple-600" />
              How We Share Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">With Your Consent</h3>
                <p>We share your information when you explicitly authorize us to do so, such as when you apply for jobs or connect with other professionals.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">With Employers</h3>
                <p>When you apply for positions, we share relevant profile information, resumes, and application materials with prospective employers. You control which information is shared through your application preferences.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Service Providers</h3>
                <p>We work with trusted third-party service providers who assist with hosting, analytics, payment processing, and other business operations. These providers are bound by strict confidentiality agreements.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Aggregated Data</h3>
                <p>We may share anonymized, aggregated data for research, industry reports, and market analysis. This data cannot be used to identify individual users.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Legal Requirements</h3>
                <p>We may disclose information when required by law, court order, or to protect our rights, property, or safety, or that of our users or others.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <Lock className="h-6 w-6 mr-2 text-red-600" />
              Data Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="space-y-1 ml-4">
                <li>• SSL/TLS encryption for data transmission</li>
                <li>• Encrypted data storage with regular security audits</li>
                <li>• Multi-factor authentication for account access</li>
                <li>• Regular security monitoring and threat detection</li>
                <li>• Limited access controls for our staff</li>
                <li>• Regular security training for our team</li>
              </ul>
              <p>
                While we strive to protect your information, no online platform can guarantee 100% security. We encourage you to use strong passwords and keep your account information confidential.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <Shield className="h-6 w-6 mr-2 text-indigo-600" />
              Your Privacy Rights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>You have the following rights regarding your personal information:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Access & Download</h4>
                  <p className="text-sm text-blue-700">Request a copy of all personal data we hold about you</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Correction</h4>
                  <p className="text-sm text-green-700">Update or correct inaccurate information in your profile</p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Deletion</h4>
                  <p className="text-sm text-orange-700">Request deletion of your account and associated data</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Portability</h4>
                  <p className="text-sm text-purple-700">Transfer your data to another service in a structured format</p>
                </div>
              </div>

              <p>
                To exercise these rights, please contact us at <strong>privacy@talentxcel.co.in</strong>. We will respond to your request within 30 days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cookies */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <Globe className="h-6 w-6 mr-2 text-teal-600" />
              Cookies and Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>We use cookies and similar technologies to enhance your experience:</p>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Essential Cookies</h3>
                <p>Required for basic platform functionality, login sessions, and security features.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Analytics Cookies</h3>
                <p>Help us understand how you use our platform to improve performance and user experience.</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Personalization Cookies</h3>
                <p>Remember your preferences and provide personalized content and job recommendations.</p>
              </div>

              <p>
                You can control cookie settings through your browser preferences. Note that disabling certain cookies may limit platform functionality.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>We retain your information for as long as necessary to provide our services:</p>
              <ul className="space-y-1 ml-4">
                <li>• Active account data: Retained while your account is active</li>
                <li>• Application history: Retained for 3 years after application</li>
                <li>• Communication records: Retained for 2 years</li>
                <li>• Analytics data: Anonymized and retained for 5 years</li>
                <li>• Legal compliance: As required by applicable laws</li>
              </ul>
              <p>
                You can request account deletion at any time, and we will remove your personal data within 30 days, except where retention is required by law.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* International Transfers */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                TalentXcel operates globally, and your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate security measures are in place for international transfers and comply with applicable data protection laws.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Children's Privacy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                Our services are not intended for individuals under 16 years of age. We do not knowingly collect personal information from children under 16. If you believe we have collected information from a child under 16, please contact us immediately.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Third-Party Services */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                Our platform may contain links to third-party websites and services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Changes to Policy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">Changes to This Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes via email or through our platform.
              </p>
              <p>
                Continued use of our services following the posting of changes constitutes your acceptance of such changes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800 flex items-center">
              <Mail className="h-6 w-6 mr-2 text-blue-600" />
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><strong>General Inquiries:</strong></p>
                    <p>info@talentxcel.co.in</p>
                  </div>
                  <div>
                    <p><strong>Privacy Officer:</strong></p>
                    <p>privacy@talentxcel.co.in</p>
                  </div>
                  <div>
                    <p><strong>Address:</strong></p>
                    <p>TalentXcel Services<br />Noida, India</p>
                  </div>
                  <div>
                    <p><strong>Response Time:</strong></p>
                    <p>Within 30 days</p>
                  </div>
                </div>
              </div>
              <p>
                We are committed to resolving any privacy concerns you may have and will work with you to address any issues.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Final Notice */}
        <Card>
          <CardContent className="p-6 text-center bg-blue-50">
            <p className="text-blue-800 font-medium">
              Thank you for trusting TalentXcel with your career journey. Your privacy and security are fundamental to our mission of empowering professionals worldwide.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;