
import React from 'react';
import { UnifiedAuthForm } from '../auth/UnifiedAuthForm';

export const HeroSection = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
      <div className="absolute top-0 right-0 -z-10 transform-gpu overflow-hidden blur-3xl">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20"></div>
      </div>

      {/* Main Hero Section */}
      <section className="relative pt-20 pb-20 sm:pt-24 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="min-h-screen flex flex-col lg:flex-row items-center gap-12">
            {/* Left Section - Text Content */}
            <div className="flex-1 flex flex-col justify-center text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Powering Global
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Career Growth
                </span>
              </h1>
              
              <div className="text-xl md:text-2xl font-bold text-gray-700 mb-6">
                AI-powered career platform
              </div>
              
              <p className="text-gray-600 text-lg md:text-xl mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Your all-in-one platform for networking, skill-building, and finding the perfect career opportunities tailored to your unique journey.
              </p>
              
              <div className="text-sm text-gray-500 max-w-lg mx-auto lg:mx-0 mb-8">
                Join thousands of professionals accelerating their careers with TalentXcel
              </div>

              {/* Social Proof */}
              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900">10K+</span>
                  <span className="ml-1">Professionals</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900">500+</span>
                  <span className="ml-1">Companies</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-gray-900">95%</span>
                  <span className="ml-1">Success Rate</span>
                </div>
              </div>
            </div>

            {/* Right Section - Auth Form */}
            <div className="flex-1 flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <UnifiedAuthForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
