import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Sparkles, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function PublicResumeBuilder() {
  const [activeTemplate, setActiveTemplate] = useState(0);

  const templates = [
    { id: 1, name: 'Professional', description: 'Clean and modern design', preview: '/templates/professional.jpg' },
    { id: 2, name: 'Creative', description: 'Bold and colorful layout', preview: '/templates/creative.jpg' },
    { id: 3, name: 'Minimal', description: 'Simple and elegant', preview: '/templates/minimal.jpg' },
    { id: 4, name: 'Technical', description: 'Perfect for developers', preview: '/templates/technical.jpg' }
  ];

  const features = [
    'AI-powered content suggestions',
    'ATS-optimized templates',
    'Real-time preview',
    'One-click download',
    'Multiple formats (PDF, DOCX)',
    'Mobile responsive'
  ];

  return (
    <>
      <Helmet>
        <title>Free Resume Builder | Create Professional Resumes - TalentXcel</title>
        <meta name="description" content="Build professional resumes for free with our AI-powered resume builder. Choose from ATS-optimized templates and get hired faster." />
        <meta name="keywords" content="free resume builder, professional resume, CV maker, resume templates, ATS resume" />
        <link rel="canonical" href="https://talentxcel.in/public/resume-builder" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Free AI-Powered Resume Builder
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Build Your Perfect Resume in Minutes
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Create a professional, ATS-optimized resume that gets you noticed. 
              No signup required - start building for free now.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                <FileText className="h-5 w-5 mr-2" />
                Start Building Free
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                <Eye className="h-5 w-5 mr-2" />
                View Templates
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-12 border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">50K+</div>
                <div className="text-sm text-muted-foreground">Resumes Created</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">ATS Pass Rate</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">4.9★</div>
                <div className="text-sm text-muted-foreground">User Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">12</div>
                <div className="text-sm text-muted-foreground">Templates</div>
              </div>
            </div>
          </div>

          {/* Template Showcase */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Choose Your Perfect Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates.map((template, index) => (
                <Card 
                  key={template.id} 
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                    activeTemplate === index ? 'ring-2 ring-primary shadow-lg scale-105' : ''
                  }`}
                  onClick={() => setActiveTemplate(index)}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
                    <FileText className="h-16 w-16 text-gray-400" />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    {activeTemplate === index && (
                      <Badge className="mt-2" variant="default">Selected</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardHeader>
                <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>AI-Powered Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get intelligent suggestions for skills, experience, and achievements tailored to your industry.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>ATS-Optimized</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All templates are designed to pass Applicant Tracking Systems and get you to human recruiters.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Download className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Instant Download</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Download your resume in multiple formats (PDF, DOCX) with one click. No waiting, no limitations.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feature List */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Everything You Need to Get Hired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-primary to-purple-600 text-white rounded-2xl p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Build Your Resume?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of professionals who've landed their dream jobs with our resume builder.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                <FileText className="h-5 w-5 mr-2" />
                Start Building Now
              </Button>
              <Link to="/auth/register">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 border-white/30 text-white hover:bg-white/20">
                  Sign Up for More Features
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}