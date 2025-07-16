import React from 'react';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '../auth/AuthDialog';
import { ChevronRight, Play } from 'lucide-react';

export const AppleHeroSection = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100">
      {/* Floating geometric elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-gradient-to-br from-indigo-200/20 to-cyan-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-to-br from-violet-200/25 to-pink-200/25 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* Left Side - Text Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-light tracking-tight text-slate-900 leading-[1.1]">
                🌍 Powering Global
                <span className="block font-medium bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Career Growth
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-slate-600 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Your all-in-one platform for networking, skill-building, and discovering career opportunities tailored to your unique journey.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <AuthDialog>
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Get Started Free
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </AuthDialog>
              
              <Button 
                variant="ghost" 
                size="lg" 
                className="rounded-full px-8 py-6 text-lg font-medium text-slate-700 hover:bg-slate-100 transition-all duration-300 group"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500 mb-4 font-medium">
                Join thousands of professionals accelerating their careers
              </p>
              <div className="flex items-center justify-center lg:justify-start space-x-8 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-slate-900">10K+</div>
                  <div className="text-slate-600">Professionals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-slate-900">500+</div>
                  <div className="text-slate-600">Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-slate-900">95%</div>
                  <div className="text-slate-600">Success Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Visual Story */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main handshake image */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl group-hover:blur-xl transition-all duration-500"></div>
                <img 
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                  alt="Professionals collaborating"
                  className="relative rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 w-full h-[500px] object-cover"
                />
              </div>

              {/* Floating achievement cards */}
              <div className="absolute -top-6 -left-6 bg-white rounded-2xl p-4 shadow-xl animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    ✅
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">Upskill with Confidence</p>
                    <p className="text-xs text-slate-600">AI-powered learning paths</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl animate-fade-in delay-1000">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    🎯
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">Land Your Dream Role</p>
                    <p className="text-xs text-slate-600">Personalized job matching</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 -right-8 bg-white rounded-2xl p-4 shadow-xl animate-fade-in delay-2000">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    🤝
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">Connect. Learn. Grow.</p>
                    <p className="text-xs text-slate-600">Global professional network</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-blue-400 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-purple-400 rounded-full opacity-60 animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-indigo-400 rounded-full opacity-60 animate-pulse delay-2000"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};