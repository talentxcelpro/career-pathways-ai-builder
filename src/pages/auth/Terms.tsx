import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, UserCheck } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/auth/register" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Registration
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Welcome to TalentXcel
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none space-y-6">
            
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                1. Acceptance of Terms
              </h2>
              <p className="text-slate-700 leading-relaxed">
                By creating an account and using TalentXcel, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                TalentXcel is a professional networking and career development platform that provides:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>AI-powered job matching and career recommendations</li>
                <li>Professional networking tools and community features</li>
                <li>Career coaching and development resources</li>
                <li>Skills assessment and learning opportunities</li>
                <li>Industry insights and market intelligence</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts and Registration</h2>
              <div className="space-y-3 text-slate-700">
                <p>You must provide accurate and complete information when creating your account.</p>
                <p>You are responsible for maintaining the confidentiality of your account credentials.</p>
                <p>You must notify us immediately of any unauthorized use of your account.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. User Conduct</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                You agree not to use the platform for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Posting false, misleading, or harmful content</li>
                <li>Harassing, threatening, or discriminating against others</li>
                <li>Violating any applicable laws or regulations</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Sharing copyrighted material without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                5. Privacy and Data Protection
              </h2>
              <p className="text-slate-700 leading-relaxed">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect 
                your personal information. By using our services, you consent to our privacy practices as 
                described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
              <p className="text-slate-700 leading-relaxed">
                All content and materials on TalentXcel, including logos, text, graphics, and software, 
                are protected by intellectual property laws. You may not reproduce, distribute, or create 
                derivative works without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p className="text-slate-700 leading-relaxed">
                TalentXcel is provided "as is" without warranties of any kind. We are not liable for any 
                indirect, incidental, or consequential damages arising from your use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
              <p className="text-slate-700 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violations of 
                these terms or for any other reason we deem appropriate.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
              <p className="text-slate-700 leading-relaxed">
                We may update these Terms of Service from time to time. Continued use of our services 
                after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
              <p className="text-slate-700 leading-relaxed">
                If you have questions about these Terms of Service, please contact us at:
                <br />
                Email: support@talentxcel.com
                <br />
                Phone: +1 (555) 123-4567
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-slate-500 text-center">
                By continuing to use TalentXcel, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms of Service.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <Button asChild>
            <Link to="/auth/register">Return to Registration</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Terms;