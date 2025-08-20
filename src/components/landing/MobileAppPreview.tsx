import React from 'react';
import { Button } from '@/components/ui/button';
import { Smartphone, Download, Star } from 'lucide-react';

export const MobileAppPreview = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 to-indigo-950 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(59,130,246,0.1),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent_70%)]"></div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="text-white space-y-8">
            <div>
              <h2 className="text-4xl lg:text-6xl font-light mb-6 leading-tight">
                Take Your Career
                <span className="block font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  On The Go
                </span>
              </h2>
              <p className="text-xl text-slate-300 font-light leading-relaxed max-w-lg">
                Access your professional network, apply to jobs, and continue learning wherever you are with our mobile app.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-slate-300">Real-time notifications for new opportunities</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-slate-300">Offline access to your learning content</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-slate-300">Quick apply to jobs with one tap</span>
              </div>
            </div>

            {/* App Store Buttons - Coming Soon */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Button 
                disabled
                className="bg-white/90 text-slate-700 hover:bg-white rounded-2xl px-6 py-4 text-base font-semibold shadow-lg group transition-all duration-300 opacity-75 cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-slate-500">Coming Soon</div>
                    <div className="text-lg font-bold">App Store</div>
                  </div>
                </div>
              </Button>

              <Button 
                disabled
                className="bg-white/90 text-slate-700 hover:bg-white rounded-2xl px-6 py-4 text-base font-semibold shadow-lg group transition-all duration-300 opacity-75 cursor-not-allowed"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-slate-500">Coming Soon</div>
                    <div className="text-lg font-bold">Google Play</div>
                  </div>
                </div>
              </Button>
            </div>

            {/* App Rating */}
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-slate-300">4.8/5 (12K+ reviews)</span>
            </div>
          </div>

          {/* Right Side - Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative group">
              {/* Floating animation */}
              <div className="absolute inset-0 animate-pulse">
                <div className="w-80 h-[600px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[3rem] blur-2xl group-hover:blur-xl transition-all duration-500"></div>
              </div>
              
              {/* Phone mockup */}
              <div className="relative z-10 w-80 h-[600px] bg-slate-900 rounded-[3rem] p-4 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20"></div>
                  
                  {/* Screen content */}
                  <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-6 pt-12">
                    {/* Status bar */}
                    <div className="flex justify-between items-center mb-8 text-xs text-slate-600">
                      <span>9:41</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-2 bg-slate-300 rounded-sm"></div>
                        <div className="w-1 h-3 bg-slate-300 rounded-sm"></div>
                        <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
                      </div>
                    </div>

                    {/* App content preview */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full"></div>
                          <div>
                            <div className="w-20 h-3 bg-slate-200 rounded"></div>
                            <div className="w-16 h-2 bg-slate-100 rounded mt-1"></div>
                          </div>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded mb-2"></div>
                        <div className="w-3/4 h-3 bg-slate-100 rounded"></div>
                      </div>

                      <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="w-full h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl mb-3"></div>
                        <div className="w-1/2 h-3 bg-slate-200 rounded"></div>
                      </div>

                      <div className="bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-24 h-3 bg-slate-200 rounded"></div>
                          <div className="w-12 h-6 bg-green-100 rounded-full"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="w-full h-2 bg-slate-100 rounded"></div>
                          <div className="w-4/5 h-2 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom navigation */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-white rounded-2xl p-3 shadow-lg">
                        <div className="flex justify-around">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-6 h-6 bg-slate-200 rounded"></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute top-20 -left-8 bg-white rounded-xl p-3 shadow-lg animate-fade-in">
                <Download className="w-6 h-6 text-green-500" />
              </div>
              <div className="absolute bottom-32 -right-8 bg-white rounded-xl p-3 shadow-lg animate-fade-in delay-1000">
                <Smartphone className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};