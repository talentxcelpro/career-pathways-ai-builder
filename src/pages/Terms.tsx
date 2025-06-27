
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  UserCheck, 
  Settings, 
  Brain, 
  Copyright, 
  XCircle,
  AlertTriangle,
  Power,
  Scale,
  Calendar
} from 'lucide-react';

const Terms = () => {
  const sections = [
    {
      title: "Acceptance of Terms",
      icon: UserCheck,
      content: [
        "By accessing or using TalentXcel, you agree to be bound by these Terms of Service",
        "If you do not agree to these terms, please do not use our platform",
        "We may update these terms from time to time with notice to users",
        "Continued use after changes constitutes acceptance of new terms"
      ]
    },
    {
      title: "User Accounts & Responsibilities", 
      icon: Settings,
      content: [
        "You must provide accurate and complete information when creating an account",
        "You are responsible for maintaining the security of your account credentials",
        "You must be at least 18 years old to use our services",
        "One person may not maintain multiple accounts without permission",
        "You are responsible for all activities that occur under your account"
      ]
    },
    {
      title: "Platform Features & Limitations",
      icon: FileText,
      content: [
        "We provide career services including job matching, resume building, and networking",
        "Services are provided 'as is' without warranty of specific outcomes",
        "We reserve the right to modify or discontinue features with notice",
        "Some features may have usage limits or require premium subscriptions",
        "We strive for 99.9% uptime but cannot guarantee uninterrupted service"
      ]
    },
    {
      title: "AI Tools & Accuracy Disclaimer",
      icon: Brain,
      content: [
        "Our AI tools provide suggestions and insights based on available data",
        "AI recommendations are not guaranteed to be accurate or suitable for all users",
        "Users should verify AI-generated content before using it professionally",
        "We continuously improve our AI but cannot guarantee perfect results",
        "Final decisions about career choices remain solely with the user"
      ]
    },
    {
      title: "Intellectual Property",
      icon: Copyright,
      content: [
        "TalentXcel and its content are protected by copyright and trademark laws",
        "Users retain ownership of their personal content (resumes, profiles, etc.)",
        "By using our platform, you grant us license to use your content for service provision",
        "You may not copy, modify, or distribute our proprietary content",
        "We respect third-party intellectual property and expect users to do the same"
      ]
    },
    {
      title: "Prohibited Uses",
      icon: XCircle,
      content: [
        "Using the platform for illegal activities or to harm others",
        "Posting false, misleading, or defamatory information",
        "Attempting to circumvent security measures or access unauthorized areas",
        "Scraping, crawling, or extracting data without permission",
        "Spamming other users or engaging in harassment",
        "Creating fake profiles or impersonating others"
      ]
    },
    {
      title: "Limitation of Liability",
      icon: AlertTriangle,
      content: [
        "TalentXcel's liability is limited to the maximum extent permitted by law",
        "We are not liable for indirect, incidental, or consequential damages",
        "Our total liability will not exceed the amount you paid for our services",
        "We are not responsible for actions of third-party employers or users",
        "Users assume risk when sharing personal information or applying for jobs"
      ]
    },
    {
      title: "Termination",
      icon: Power,
      content: [
        "Either party may terminate the agreement at any time with notice",
        "We may suspend or terminate accounts for violation of these terms",
        "Upon termination, you lose access to the platform and its features",
        "We will retain your data according to our Privacy Policy",
        "Certain provisions will survive termination (intellectual property, liability limits)"
      ]
    },
    {
      title: "Governing Law",
      icon: Scale,
      content: [
        "These terms are governed by the laws of India",
        "Any disputes will be resolved in the courts of Bengaluru, Karnataka",
        "We will attempt to resolve disputes through negotiation first",
        "Arbitration may be required for certain types of disputes",
        "Indian law applies regardless of your location when using our services"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-purple-600 rounded-full">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            TalentXcel Terms & Conditions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please read these terms carefully before using our platform. They outline your rights and responsibilities as a user.
          </p>
        </div>

        {/* Effective Date */}
        <Card className="bg-purple-50 border-purple-200 mb-8">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">Effective Date: June 2025</span>
            </div>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <section.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Important Notice */}
        <Card className="bg-yellow-50 border-yellow-200 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Notice</h3>
                <p className="text-yellow-800">
                  These terms constitute a legally binding agreement between you and TalentXcel. 
                  If you have questions about any provision, please contact our legal team before using the platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 shadow-xl mt-12">
          <CardContent className="p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
            <p className="text-purple-100 mb-6">
              Our legal team is available to clarify any questions you may have about these terms and conditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge className="bg-white text-purple-600 px-4 py-2">
                legal@talentxcel.in
              </Badge>
              <Badge className="bg-white/20 text-white px-4 py-2">
                Legal Department
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
