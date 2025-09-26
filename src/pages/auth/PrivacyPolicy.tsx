import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, Database, Share, Bell } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link to="/auth/register" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Registration
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Your Privacy Matters to Us
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate max-w-none space-y-6">
            
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                1. Information We Collect
              </h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We collect information to provide better services to our users. This includes:
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-800 mb-2">Personal Information:</h3>
                  <ul className="list-disc pl-6 space-y-1 text-slate-700">
                    <li>Name, email address, and profile picture</li>
                    <li>Professional information (job title, company, skills)</li>
                    <li>Resume and career history data</li>
                    <li>Contact information and preferences</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium text-slate-800 mb-2">Usage Information:</h3>
                  <ul className="list-disc pl-6 space-y-1 text-slate-700">
                    <li>Platform activity and interactions</li>
                    <li>Search queries and preferences</li>
                    <li>Device information and IP address</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                2. How We Use Your Information
              </h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Provide and improve our services</li>
                <li>Match you with relevant job opportunities</li>
                <li>Enable networking and communication features</li>
                <li>Send you career insights and platform updates</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Share className="w-5 h-5 text-purple-600" />
                3. Information Sharing
              </h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We do not sell your personal information. We may share information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>With your consent:</strong> When you explicitly agree to share information</li>
                <li><strong>Public profile information:</strong> Information you choose to make public</li>
                <li><strong>Service providers:</strong> Trusted partners who help us operate our platform</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business transfers:</strong> In connection with mergers or acquisitions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                4. Data Security
              </h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                We implement robust security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Industry-standard encryption for data transmission</li>
                <li>Secure data storage with access controls</li>
                <li>Regular security audits and monitoring</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Your Rights and Choices</h2>
              <p className="text-slate-700 leading-relaxed mb-3">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request transfer of your data</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
              <p className="text-slate-700 leading-relaxed">
                We retain your information only as long as necessary to provide our services and comply 
                with legal obligations. You can request deletion of your account and associated data at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. International Data Transfers</h2>
              <p className="text-slate-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your data during such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking</h2>
              <p className="text-slate-700 leading-relaxed">
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                and provide personalized content. You can control cookie settings through your browser.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
              <p className="text-slate-700 leading-relaxed">
                Our services are not intended for individuals under 18 years of age. We do not knowingly 
                collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Changes to This Policy</h2>
              <p className="text-slate-700 leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of significant changes 
                via email or platform notifications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-600" />
                11. Contact Us
              </h2>
              <p className="text-slate-700 leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us:
                <br />
                <strong>Privacy Team:</strong> privacy@talentxcel.com
                <br />
                <strong>Data Protection Officer:</strong> dpo@talentxcel.com
                <br />
                <strong>Phone:</strong> +1 (555) 123-4567
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-slate-500 text-center">
                Your trust is important to us. We are committed to protecting your privacy and 
                handling your data responsibly.
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

export default PrivacyPolicy;