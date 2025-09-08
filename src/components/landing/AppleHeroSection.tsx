import React from 'react';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '../auth/AuthDialog';
import resumePreview from '@/assets/resume-preview.png';

export const AppleHeroSection = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="text-center space-y-12">
          {/* Main Headline */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              TalentXcel's AI Resume Builder helps you{' '}
              <span className="text-blue-600">land your dream job faster</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-4xl mx-auto">
              Create ATS-friendly resumes, get instant resume scores, and apply with confidence.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => window.location.href = '/resume/new'}
            >
              Build Your Resume
            </Button>
            
            <Button 
              variant="outline"
              size="lg" 
              className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-10 py-4 text-lg font-semibold rounded-xl"
              onClick={() => window.location.href = '/resume/new'}
            >
              Get Your Resume
            </Button>
          </div>

          {/* Resume Preview */}
          <div className="relative mt-16">
            <div className="max-w-2xl mx-auto">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-200">
                <img
                  src={resumePreview}
                  alt="Professional resume template preview showing Alex Johnson's resume with ATS optimization badges"
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
                
                {/* Floating badges */}
                <div className="absolute bottom-6 left-6">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    ATS Optimized
                  </div>
                </div>
                
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                    <span className="text-yellow-300">⚡</span>
                    AI-Power
                  </div>
                </div>
                
                <div className="absolute bottom-6 right-6">
                  <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                    Hired at Top
                    <span>🚀</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Enter your details</h3>
              <p className="text-slate-600">(education, experience, skills)</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Get AI suggestions & improvements</h3>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Download & apply with confidence</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};