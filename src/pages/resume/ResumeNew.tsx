import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Zap, Plane } from 'lucide-react';
import resumePreview from '@/assets/resume-preview-ai.png';

const ResumeNew: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Helmet>
        <title>AI Resume Builder | TalentXcel</title>
        <meta name="description" content="Create ATS-friendly resumes, get instant resume scores, and apply with confidence using TalentXcel's AI Resume Builder." />
        <link rel="canonical" href="https://talentxcel.in/resume/new" />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                TalentXcel's AI Resume Builder helps you land your dream job faster
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed">
                Create ATS-friendly resumes, get instant resume scores, and apply with confidence.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => window.location.href = '/resume/builder'}
              >
                Build Your Resume
              </Button>
              
              <Button 
                variant="outline"
                size="lg"
                className="border-slate-300 text-slate-700 hover:bg-white px-8 py-6 text-lg font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
              >
                Get Your Resume
              </Button>
            </div>
          </div>

          {/* Right Side - Resume Preview */}
          <div className="relative">
            <div className="relative max-w-md mx-auto">
              <img
                src={resumePreview}
                alt="Professional resume preview showing Alex Johnson's resume with ATS optimization"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              
              {/* Floating Badges */}
              <div className="absolute -left-4 top-1/4 transform -translate-y-1/2">
                <Badge className="bg-green-500 text-white px-4 py-2 text-sm font-semibold rounded-full shadow-lg">
                  ATS Optimized
                </Badge>
              </div>
              
              <div className="absolute -right-4 top-1/3 transform -translate-y-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-2 text-sm font-semibold rounded-full shadow-lg flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  AI-Power
                </Badge>
              </div>
              
              <div className="absolute -right-4 bottom-1/4 transform translate-y-1/2">
                <Badge className="bg-green-600 text-white px-4 py-2 text-sm font-semibold rounded-full shadow-lg flex items-center gap-2">
                  Hired at Top
                  <Plane className="h-4 w-4" />
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Process Steps */}
        <div className="mt-24">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-slate-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Enter your details</h3>
                <p className="text-slate-600">(education, experience, skills)</p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-slate-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Get AI suggestions</h3>
                <p className="text-slate-600">& improvements</p>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-slate-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Download</h3>
                <p className="text-slate-600">& apply with confidence</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeNew;
