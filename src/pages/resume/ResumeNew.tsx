import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Search, Upload, FileText, Zap } from 'lucide-react';
import { AuthDialog } from '@/components/auth/AuthDialog';

const ResumeNew: React.FC = () => {
  const templates = [
    { id: 1, name: 'Professional', category: 'Popular', color: 'bg-blue-50 border-blue-200' },
    { id: 2, name: 'Modern', category: 'Trending', color: 'bg-purple-50 border-purple-200' },
    { id: 3, name: 'Creative', category: 'Popular', color: 'bg-green-50 border-green-200' },
    { id: 4, name: 'Executive', category: 'Premium', color: 'bg-orange-50 border-orange-200' },
  ];

  const categories = ['Popular', 'Modern', 'Creative', 'Executive'];

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Create Resume | TalentXcel</title>
        <meta name="description" content="Create professional resumes with AI-powered suggestions and modern templates." />
        <link rel="canonical" href="https://talentxcel.in/resume/new" />
      </Helmet>
      
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Search className="h-6 w-6 text-slate-600" />
              <h1 className="text-2xl font-semibold text-slate-900">Resume Builder</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              >
                <Zap className="h-4 w-4 mr-2" />
                AI
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-3 mb-8">
            {categories.map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                className="bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <AuthDialog>
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium rounded-lg"
              >
                <FileText className="h-5 w-5 mr-2" />
                Start from Scratch
              </Button>
            </AuthDialog>
            
            <Button 
              variant="outline"
              size="lg"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 text-lg font-medium rounded-lg"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload Resume
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {templates.map((template) => (
              <div 
                key={template.id}
                className={`${template.color} rounded-xl p-6 border cursor-pointer hover:shadow-md transition-all duration-300 group`}
              >
                <div className="aspect-[3/4] bg-white rounded-lg shadow-sm mb-4 flex items-center justify-center">
                  <div className="text-6xl font-light text-slate-300">T</div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900">{template.name}</h3>
                  <p className="text-sm text-slate-600">{template.category}</p>
                  
                  <AuthDialog>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-300 text-slate-700 hover:bg-white group-hover:bg-slate-50"
                    >
                      Use Template
                    </Button>
                  </AuthDialog>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="mt-12 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-3">
              Build Your Professional Resume with TalentXcel
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Choose from professional templates or upload your existing resume to get started. 
              Our AI-powered builder helps you create a standout resume in minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeNew;
