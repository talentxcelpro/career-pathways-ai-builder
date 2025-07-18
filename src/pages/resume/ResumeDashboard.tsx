import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Upload, PenTool, Download, CheckCircle, ArrowRight, ArrowLeft, Star, Users, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ResumeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const templates = [
    { id: 'modern', name: 'Modern Professional', description: 'Clean and contemporary design perfect for tech roles', popular: true, color: 'from-blue-500 to-purple-500' },
    { id: 'creative', name: 'Creative Designer', description: 'Eye-catching layout ideal for creative professionals', popular: false, color: 'from-pink-500 to-orange-500' },
    { id: 'executive', name: 'Executive', description: 'Sophisticated template for senior leadership positions', popular: false, color: 'from-gray-700 to-gray-900' },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple and elegant design that lets your content shine', popular: true, color: 'from-green-500 to-teal-500' }
  ];

  const features = [
    { icon: <PenTool className="w-6 h-6" />, title: "Drag & Drop Editor", description: "Rearrange sections with intuitive drag and drop interface" },
    { icon: <Sparkles className="w-6 h-6" />, title: "AI-Powered Enhancement", description: "Get intelligent suggestions to improve your content" },
    { icon: <Upload className="w-6 h-6" />, title: "Import Existing Resume", description: "Upload your current resume for instant enhancement" },
    { icon: <Download className="w-6 h-6" />, title: "Multiple Export Formats", description: "Download as PDF, Word, or share with a professional link" }
  ];

  const stats = [
    { number: "2M+", label: "Resumes Created", icon: <FileText className="w-5 h-5" /> },
    { number: "85%", label: "Interview Success Rate", icon: <Users className="w-5 h-5" /> },
    { number: "4.8/5", label: "User Rating", icon: <Star className="w-5 h-5" /> },
    { number: "50K+", label: "Success Stories", icon: <Award className="w-5 h-5" /> }
  ];

  const createNewResume = () => {
    const newResumeId = `new-${Date.now()}`;
    navigate(`/resume-builder/edit/${newResumeId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">ResumeBuilder</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              {user && (
                <span className="text-sm text-slate-600">
                  Welcome back!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
            <div>
              <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-700 border-blue-200">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Resume Builder
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Enhancv's 
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Resume Builder</span>
                <br />
                helps you get hired at top companies
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Create a professional resume that gets you hired. Our AI-powered tools and beautiful templates make it easy to build your dream resume in minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg"
                  onClick={createNewResume}
                >
                  Build Your Resume
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg font-semibold rounded-xl"
                  onClick={() => navigate('/resume-builder/upload')}
                >
                  Get Your Resume Score
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="ml-2 text-sm font-medium text-slate-900">Excellent</span>
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-semibold">4,662 Reviews</span>
                </div>
              </div>
            </div>

            {/* Resume Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-300 rounded w-32"></div>
                      <div className="h-2 bg-slate-200 rounded w-24"></div>
                    </div>
                    <div className="w-16 h-16 bg-blue-100 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 bg-slate-300 rounded w-full"></div>
                    <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-2 bg-slate-200 rounded w-4/6"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-2 bg-blue-300 rounded w-full"></div>
                      <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-purple-300 rounded w-full"></div>
                      <div className="h-2 bg-purple-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Pick a resume template and build your resume in minutes!
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl mb-4">
                  <div className="text-blue-600">{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.number}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything You Need to Stand Out
            </h2>
            <p className="text-xl text-slate-600">
              Professional tools designed to help you create the perfect resume
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-slate-200 hover:shadow-lg transition-all duration-200 bg-white">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <div className="text-blue-600">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-lg text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Choose Your Perfect Template
            </h2>
            <p className="text-xl text-slate-600">
              Professional designs crafted by experts, loved by recruiters
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {templates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${
                  selectedTemplate === template.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardHeader className="p-0">
                  <div className="relative">
                    <div className={`w-full h-64 bg-gradient-to-br ${template.color} rounded-t-lg flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm"></div>
                      <div className="relative z-10 text-white">
                        <FileText className="w-16 h-16 opacity-80" />
                      </div>
                    </div>
                    {template.popular && (
                      <Badge className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                        <Star className="w-3 h-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    {selectedTemplate === template.id && (
                      <div className="absolute inset-0 bg-blue-500/20 rounded-t-lg flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-blue-600" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{template.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={createNewResume}
            >
              Start Building Your Resume
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who've upgraded their careers with our resume builder
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-xl"
              onClick={() => navigate('/resume-builder/upload')}
            >
              Upload Resume
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl"
              onClick={createNewResume}
            >
              Start from Template
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDashboard;