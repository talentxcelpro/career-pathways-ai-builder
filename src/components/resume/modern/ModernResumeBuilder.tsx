import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, ChevronRight, Sparkles, FileText, 
  Palette, Eye, Download, Star, Zap, Target 
} from 'lucide-react';
import { ResumePreview } from '../ResumePreview';

interface ModernResumeBuilderProps {
  resumeData: any;
  onDataChange: (data: any) => void;
}

const steps = [
  { id: 'template', title: 'Choose Template', icon: Palette },
  { id: 'content', title: 'Add Content', icon: FileText },
  { id: 'optimize', title: 'AI Optimize', icon: Sparkles },
  { id: 'preview', title: 'Preview & Download', icon: Download }
];

export const ModernResumeBuilder: React.FC<ModernResumeBuilderProps> = ({
  resumeData,
  onDataChange
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('modern-minimal');

  const templates = [
    {
      id: 'modern-minimal',
      name: 'Modern Minimal',
      category: 'Professional',
      rating: 4.9,
      preview: '/api/placeholder/300/400',
      features: ['ATS-Friendly', 'Clean Design', 'Professional']
    },
    {
      id: 'creative-bold',
      name: 'Creative Bold',
      category: 'Creative',
      rating: 4.8,
      preview: '/api/placeholder/300/400',
      features: ['Eye-catching', 'Color Accents', 'Modern']
    },
    {
      id: 'executive-pro',
      name: 'Executive Pro',
      category: 'Executive',
      rating: 4.9,
      preview: '/api/placeholder/300/400',
      features: ['Premium Look', 'Leadership Focus', 'Elegant']
    },
    {
      id: 'tech-focused',
      name: 'Tech Focused',
      category: 'Technology',
      rating: 4.7,
      preview: '/api/placeholder/300/400',
      features: ['Technical Skills', 'Projects Section', 'GitHub Ready']
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderTemplateStep = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
          <Star className="h-4 w-4" />
          Choose from 20+ Professional Templates
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Pick Your Perfect Template
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Select a template that matches your industry and personal style. All templates are ATS-optimized and recruiter-approved.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((template) => (
          <Card 
            key={template.id}
            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl ${
              selectedTemplate === template.id 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardContent className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <FileText className="h-16 w-16 text-gray-400" />
                </div>
                {selectedTemplate === template.id && (
                  <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                    <div className="bg-blue-500 text-white rounded-full p-2">
                      <Star className="h-5 w-5 fill-current" />
                    </div>
                  </div>
                )}
                <Badge className="absolute top-2 right-2 bg-white/90 text-gray-700">
                  {template.category}
                </Badge>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{template.rating}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.features.map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button size="lg" className="px-8">
          Browse All Templates →
        </Button>
      </div>
    </div>
  );

  const renderContentStep = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Writing Assistant</h3>
              <p className="text-sm text-gray-600">Get personalized suggestions as you write</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Generate Content with AI
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Software Engineer"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Summary
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write a compelling summary of your experience and skills..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <Button size="sm">Add Position</Button>
            </div>
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Add your work experience to get started</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:border-l lg:pl-8">
        <div className="sticky top-8">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-700">Live Preview</span>
            <Badge variant="secondary">Updates in real-time</Badge>
          </div>
          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <ResumePreview content={resumeData} fullPage={false} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderOptimizeStep = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
          <Target className="h-4 w-4" />
          AI-Powered Optimization
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Optimize for Success
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Our AI analyzes your resume against industry standards and provides personalized recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">ATS Score</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
            <p className="text-sm text-gray-600">Great! Your resume will pass most ATS systems.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">AI Suggestions</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">12</div>
            <p className="text-sm text-gray-600">Improvements ready to apply to your resume.</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Match Score</h3>
            <div className="text-3xl font-bold text-purple-600 mb-2">92%</div>
            <p className="text-sm text-gray-600">Excellent match for target positions.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">AI Recommendations</h3>
          <div className="space-y-3">
            {[
              'Add quantified achievements to your experience section',
              'Include relevant keywords for your target role',
              'Optimize your professional summary for impact'
            ].map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm">{suggestion}</span>
                <Button size="sm" variant="outline">Apply</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
          <Download className="h-4 w-4" />
          Ready to Download
        </div>
        <h2 className="text-3xl font-bold text-gray-900">
          Your Professional Resume is Ready!
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Review your final resume and download in multiple formats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Download Options</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" size="lg">
                  <Download className="h-5 w-5 mr-3" />
                  Download PDF (Recommended)
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Download className="h-5 w-5 mr-3" />
                  Download Word Document
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Download className="h-5 w-5 mr-3" />
                  Share Online Link
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">1</div>
                  <div>
                    <p className="font-medium">Create a Cover Letter</p>
                    <p className="text-sm text-gray-600">Match your resume with a professional cover letter</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">Practice Interviews</p>
                    <p className="text-sm text-gray-600">Prepare for interviews with AI-generated questions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Track Applications</p>
                    <p className="text-sm text-gray-600">Keep track of your job applications and responses</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="sticky top-8">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-700">Final Preview</span>
            </div>
            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <ResumePreview content={resumeData} fullPage={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderTemplateStep();
      case 1:
        return renderContentStep();
      case 2:
        return renderOptimizeStep();
      case 3:
        return renderPreviewStep();
      default:
        return renderTemplateStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                R
              </div>
              <span className="text-xl font-bold text-gray-900">ResumeBuilder Pro</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">Save Draft</Button>
              <Button size="sm">Upgrade to Pro</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <currentStepData.icon className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">{currentStepData.title}</span>
              </div>
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`text-xs font-medium ${
                    index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-3">
              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} className="flex items-center gap-2">
                  Next Step
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};