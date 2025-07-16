import React from 'react';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '../auth/AuthDialog';
import { ChevronRight } from 'lucide-react';

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

          {/* Right Side - Dynamic Visual Story with More Images */}
          <div className="relative">
            {/* Multiple hovering images with advanced animations */}
            <div className="relative z-10 grid grid-cols-3 gap-4 h-[600px]">
              {/* Top row - 3 images */}
              <div className="relative group hover:scale-110 transition-all duration-500 hover:-rotate-1">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-2xl blur-xl group-hover:blur-lg transition-all duration-300"></div>
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Professional woman working"
                  className="relative rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 w-full h-[180px] object-cover"
                />
              </div>

              <div className="relative group hover:scale-110 transition-all duration-500 hover:rotate-1">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-2xl blur-xl group-hover:blur-lg transition-all duration-300"></div>
                <img 
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Team collaboration"
                  className="relative rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 w-full h-[180px] object-cover"
                />
              </div>

              <div className="relative group hover:scale-110 transition-all duration-500 hover:-rotate-1">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl group-hover:blur-lg transition-all duration-300"></div>
                <img 
                  src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Professional presentation"
                  className="relative rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 w-full h-[180px] object-cover"
                />
              </div>

              {/* Bottom row - 2 larger images */}
              <div className="col-span-2 relative group hover:scale-105 transition-all duration-700 hover:rotate-1">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-3xl blur-2xl group-hover:blur-xl transition-all duration-500 animate-pulse"></div>
                <img 
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
                  alt="Professionals collaborating"
                  className="relative rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 w-full h-[380px] object-cover"
                />
              </div>

              <div className="relative group hover:scale-110 transition-all duration-500 hover:rotate-2">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-2xl blur-xl group-hover:blur-lg transition-all duration-300"></div>
                <img 
                  src="https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Professional at work"
                  className="relative rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 w-full h-[380px] object-cover"
                />
              </div>
            </div>

            {/* Floating achievement cards with enhanced animations */}
            <div className="absolute -top-8 -left-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl animate-fade-in hover:scale-105 transition-all duration-300 hover:shadow-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">✅</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">Upskill with Confidence</p>
                  <p className="text-xs text-slate-600">AI-powered learning paths</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-8 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl animate-fade-in delay-1000 hover:scale-105 transition-all duration-300 hover:shadow-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">🎯</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">Land Your Dream Role</p>
                  <p className="text-xs text-slate-600">Personalized job matching</p>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 -right-10 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl animate-fade-in delay-2000 hover:scale-105 transition-all duration-300 hover:shadow-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">🤝</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">Connect. Learn. Grow.</p>
                  <p className="text-xs text-slate-600">Global professional network</p>
                </div>
              </div>
            </div>

            <div className="absolute top-1/4 -left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-2xl animate-fade-in delay-3000 hover:scale-105 transition-all duration-300 hover:shadow-3xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg">🚀</span>
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">Career Acceleration</p>
                  <p className="text-xs text-slate-600">Fast-track your growth</p>
                </div>
              </div>
            </div>

            {/* Enhanced floating elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-1/6 left-1/5 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-70 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
              <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
              <div className="absolute top-1/2 left-1/8 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
              <div className="absolute top-3/4 right-1/3 w-5 h-5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full opacity-40 animate-bounce" style={{ animationDelay: '3s', animationDuration: '6s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};