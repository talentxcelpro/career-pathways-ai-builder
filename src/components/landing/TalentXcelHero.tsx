import React from 'react';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '../auth/AuthDialog';
import { Send, TrendingUp, CheckCircle, BookOpen, Shield } from 'lucide-react';

export const TalentXcelHero = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-48 h-48 bg-purple-300/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[70vh]">
          {/* Left Side - Text Content */}
          <div className="space-y-8 text-white">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Empowering Global
                <span className="block">Career Growth</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed max-w-xl">
                Network, Learn, and Unlock Opportunities – All In One Platform.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <AuthDialog>
                <Button 
                  size="lg" 
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started Free
                </Button>
              </AuthDialog>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 rounded-lg px-8 py-4 text-lg font-semibold backdrop-blur-sm"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-8 pt-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div>
                  <div className="text-2xl font-bold">10k+</div>
                  <div className="text-blue-200 text-sm">Users</div>
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-blue-200 text-sm">Companies</div>
              </div>
              <div>
                <div className="text-2xl font-bold">95%</div>
                <div className="text-blue-200 text-sm">Success</div>
              </div>
            </div>
          </div>

          {/* Right Side - Career Passport Preview */}
          <div className="relative">
            <div className="bg-blue-500/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
              {/* Career Passport Display */}
              <div className="relative h-96 flex items-center justify-center">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl max-w-sm w-full">
                  <img
                    src="/lovable-uploads/f04fa0a1-720d-4c94-889f-58ca8bfc0ddb.png"
                    alt="TalentXcel Career Passport Preview"
                    className="w-full h-auto rounded-xl shadow-lg"
                    loading="lazy"
                  />
                </div>
              </div>
              
              {/* Career Passport Features */}
              <div className="mt-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Your Digital Career Passport</h3>
                <p className="text-blue-100 text-sm">
                  Track your professional journey with AI-powered insights, career readiness scores, and digital certifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards Section */}
      <div className="relative max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gamechanger in Professional */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Gamechanger in Professional</h3>
                <p className="text-gray-600 text-sm">Grow greatest Cohesive-base! Network of future-talent.</p>
              </div>
            </div>
          </div>

          {/* Personalised Career Paths */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Personalised Career Paths</h3>
                <p className="text-gray-600 text-sm">Use work online across job, internship, tailored to your career goals.</p>
              </div>
            </div>
          </div>

          {/* AI-Powered Learnings Hub */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">AI-Powered Learnings Hub</h3>
                <p className="text-gray-600 text-sm">Online driven learn, free and unlock advance opportunities.</p>
              </div>
            </div>
          </div>

          {/* Verified Job & Internship Listings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Verified Job & Internship Listings</h3>
                <p className="text-gray-600 text-sm">Browse roles across industries, tailored to your experience.</p>
              </div>
            </div>
          </div>

          {/* Career Analytics */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Career Analytics</h3>
                <p className="text-gray-600 text-sm">Explore-openings aligned to your skillset.</p>
              </div>
            </div>
          </div>

          {/* Trusted Platform */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Trusted Platform</h3>
                <p className="text-gray-600 text-sm">Seamless upscale allows you to connect and grow professionally.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};