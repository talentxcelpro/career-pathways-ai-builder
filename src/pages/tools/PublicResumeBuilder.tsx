import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, Sparkles, ChevronRight, Briefcase, MessageSquare, TrendingUp } from 'lucide-react';
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
        <title>Free Resume Builder Online | ATS-Friendly CV Maker India - TalentXcel</title>
        <meta name="description" content="Create professional ATS-optimized resumes for free. 20+ templates, AI content suggestions, instant PDF download. Trusted by 50,000+ professionals in India." />
        <meta name="keywords" content="free resume builder, ATS resume maker, online CV creator India, professional resume templates, resume maker free, CV builder online" />
        <link rel="canonical" href="https://talentxcel.in/public/resume-builder" />
        <meta property="og:title" content="Free Resume Builder Online | ATS-Friendly CV Maker India - TalentXcel" />
        <meta property="og:description" content="Create professional ATS-optimized resumes for free. 20+ templates, AI content suggestions, instant PDF download." />
        <meta property="og:image" content="https://talentxcel.in/og-resume-builder.jpg" />
        <meta property="og:url" content="https://talentxcel.in/public/resume-builder" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "TalentXcel Resume Builder",
            "description": "Free online resume builder with ATS-optimized templates",
            "url": "https://talentxcel.in/public/resume-builder",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "INR"
            },
            "featureList": [
              "ATS-optimized templates",
              "AI content suggestions", 
              "Multiple download formats",
              "Real-time preview",
              "Mobile responsive"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Sticky Signup Banner */}
        <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="text-sm font-medium">
              ✨ Join 50,000+ professionals who built winning resumes
            </div>
            <Link to="/auth/register">
              <Button size="sm" variant="secondary" className="text-xs">
                Start Free
              </Button>
            </Link>
          </div>
        </div>

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

            {/* Social Proof */}
            <div className="mt-8 flex justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 border-2 border-white"></div>
                  ))}
                </div>
                <span>50,000+ users</span>
              </div>
              <div>⭐⭐⭐⭐⭐ 4.9/5 rating</div>
              <div>🚀 95% ATS pass rate</div>
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

          {/* Internal Linking Section */}
          <Card className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-6">Complete Your Career Journey</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Link to="/public/jobs" className="group">
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <Briefcase className="h-8 w-8 text-green-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Find Jobs</h3>
                      <p className="text-sm text-muted-foreground">Search 15,000+ jobs with your new resume</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/public/interview-prep" className="group">
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <MessageSquare className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Interview Prep</h3>
                      <p className="text-sm text-muted-foreground">Practice with AI mock interviews</p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/public/market-insights" className="group">
                  <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                      <h3 className="font-semibold mb-2">Market Insights</h3>
                      <p className="text-sm text-muted-foreground">Check salary trends for your role</p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
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