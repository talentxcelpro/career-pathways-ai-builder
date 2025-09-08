import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Zap, Brain, Target, Download, BarChart3, Users, Trophy, CheckCircle } from 'lucide-react';
import { AuthDialog } from '@/components/auth/AuthDialog';

const ResumeNew: React.FC = () => {
  const tools = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Resume Builder',
      description: 'Create professional resumes with AI-powered suggestions',
      href: '/resume/builder',
      color: 'bg-blue-500',
      features: ['ATS-Optimized Templates', 'Real-time Preview', 'Multiple Formats']
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'AI Enhancement',
      description: 'Get intelligent suggestions to improve your resume',
      href: '/resume/ai-enhancement',
      color: 'bg-purple-500',
      features: ['Content Optimization', 'Keyword Analysis', 'ATS Score']
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Job Targeting',
      description: 'Tailor your resume for specific job descriptions',
      href: '/resume/job-targeting',
      color: 'bg-green-500',
      features: ['Job Match Score', 'Keyword Gaps', 'Customization Tips']
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Resume Analytics',
      description: 'Track your resume performance and views',
      href: '/resume/analytics',
      color: 'bg-orange-500',
      features: ['View Analytics', 'Download Stats', 'Performance Insights']
    }
  ];

  const quickActions = [
    { icon: <FileText className="h-5 w-5" />, label: 'Start from Scratch', href: '/resume/builder' },
    { icon: <Upload className="h-5 w-5" />, label: 'Upload Resume', href: '/resume/upload' },
    { icon: <Zap className="h-5 w-5" />, label: 'AI Enhancement', href: '/resume/ai-enhancement' },
    { icon: <Download className="h-5 w-5" />, label: 'Export Resume', href: '/resume/export' }
  ];

  const features = [
    { icon: <CheckCircle className="h-5 w-5 text-green-500" />, text: 'ATS-Friendly Templates' },
    { icon: <CheckCircle className="h-5 w-5 text-green-500" />, text: 'AI-Powered Suggestions' },
    { icon: <CheckCircle className="h-5 w-5 text-green-500" />, text: 'Real-time Scoring' },
    { icon: <CheckCircle className="h-5 w-5 text-green-500" />, text: 'Multiple Export Formats' },
    { icon: <CheckCircle className="h-5 w-5 text-green-500" />, text: 'Job Targeting Tools' },
    { icon: <CheckCircle className="h-5 w-5 text-green-500" />, text: 'Performance Analytics' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Helmet>
        <title>Complete TalentXcel Career Toolkit | AI-Powered Resume Builder</title>
        <meta name="description" content="Access the complete TalentXcel career toolkit with AI resume builder, job targeting, analytics, and more. Create ATS-friendly resumes that land interviews." />
        <link rel="canonical" href="https://talentxcel.in/resume/new" />
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
            <Zap className="h-4 w-4" />
            Complete Career Toolkit
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            TalentXcel Career Toolkit
          </h1>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Everything you need to create, optimize, and track your professional resume. 
            From AI-powered building to job targeting and analytics.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-20 flex flex-col items-center gap-2 border-2 hover:border-blue-300 hover:bg-blue-50"
              onClick={() => window.location.href = action.href}
            >
              {action.icon}
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Main Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {tools.map((tool, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition-all duration-300 group">
              <div className="flex items-start gap-4 mb-6">
                <div className={`${tool.color} text-white p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{tool.title}</h3>
                  <p className="text-slate-600">{tool.description}</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                {tool.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full"
                onClick={() => window.location.href = tool.href}
              >
                Get Started
              </Button>
            </div>
          ))}
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-16">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
            Why Choose TalentXcel Career Toolkit?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                {feature.icon}
                <span className="text-slate-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Start building your professional resume with our AI-powered tools today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3"
              onClick={() => window.location.href = '/resume/builder'}
            >
              <FileText className="h-5 w-5 mr-2" />
              Start Building Resume
            </Button>
            
            <AuthDialog>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 py-3"
              >
                <Users className="h-5 w-5 mr-2" />
                Join TalentXcel
              </Button>
            </AuthDialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeNew;
