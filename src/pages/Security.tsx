import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Server, FileCheck, Users } from 'lucide-react';

const Security = () => {
  const securityFeatures = [
    {
      icon: <Lock className="h-8 w-8 text-blue-600" />,
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard AES-256 encryption."
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: "SOC 2 Compliance",
      description: "We maintain SOC 2 Type II certification for security, availability, and confidentiality."
    },
    {
      icon: <Eye className="h-8 w-8 text-purple-600" />,
      title: "Privacy by Design",
      description: "Your personal information is protected with zero-knowledge architecture and minimal data collection."
    },
    {
      icon: <Server className="h-8 w-8 text-orange-600" />,
      title: "Secure Infrastructure", 
      description: "Our platform runs on enterprise-grade cloud infrastructure with 99.99% uptime SLA."
    },
    {
      icon: <FileCheck className="h-8 w-8 text-red-600" />,
      title: "Regular Audits",
      description: "Independent security audits and penetration testing performed quarterly by certified experts."
    },
    {
      icon: <Users className="h-8 w-8 text-indigo-600" />,
      title: "Access Controls",
      description: "Role-based access controls and multi-factor authentication protect your account and data."
    }
  ];

  const certifications = [
    "SOC 2 Type II",
    "GDPR Compliant", 
    "CCPA Compliant",
    "ISO 27001",
    "PCI DSS Level 1"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6">
            Security & Privacy
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Your trust is our foundation. We employ enterprise-grade security measures to protect 
            your personal information and career data at every step of your journey.
          </p>
        </div>

        {/* Security Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certifications */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Certifications & Compliance</CardTitle>
            <CardDescription>
              We maintain the highest industry standards for security and privacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4">
              {certifications.map((cert, index) => (
                <Badge key={index} variant="secondary" className="text-sm px-4 py-2">
                  {cert}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Protection Principles */}
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Data Protection</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Minimal Data Collection</h3>
                <p className="text-slate-600">
                  We only collect data that's essential for providing our services and improving your experience.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">User Control</h3>
                <p className="text-slate-600">
                  You have complete control over your data with options to export, delete, or modify at any time.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Transparent Processing</h3>
                <p className="text-slate-600">
                  We're transparent about how we use your data and never sell it to third parties.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Security Measures</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">24/7 Monitoring</h3>
                <p className="text-slate-600">
                  Our security team monitors our systems around the clock for any suspicious activity.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Incident Response</h3>
                <p className="text-slate-600">
                  We have a comprehensive incident response plan and will notify users promptly if any issues arise.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Employee Training</h3>
                <p className="text-slate-600">
                  All TalentXcel employees undergo regular security training and background checks.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center mt-16 p-8 bg-slate-100 rounded-lg">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Security Questions?
          </h3>
          <p className="text-slate-600 mb-6">
            Our security team is here to address any concerns you may have.
          </p>
          <p className="text-slate-800 font-medium">
            Contact us at: <span className="text-blue-600">security@talentxcel.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Security;