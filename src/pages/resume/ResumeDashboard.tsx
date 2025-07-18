
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Upload, PenTool, Download, CheckCircle, ArrowRight, ArrowLeft, Star, Users, Target, Award, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ResumeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const templates = [
    { id: 'modern', name: 'Modern Professional', description: 'Clean and contemporary design', popular: true, color: 'from-blue-500 to-purple-500' },
    { id: 'creative', name: 'Creative Designer', description: 'Eye-catching layout for creatives', popular: false, color: 'from-pink-500 to-orange-500' },
    { id: 'executive', name: 'Executive', description: 'Sophisticated for leadership roles', popular: false, color: 'from-gray-700 to-gray-900' },
    { id: 'minimalist', name: 'Minimalist', description: 'Simple and elegant design', popular: true, color: 'from-green-500 to-teal-500' }
  ];

  const features = [
    { 
      icon: <PenTool className="w-6 h-6" />, 
      title: "Drag & Drop Editor", 
      description: "Rearrange sections with intuitive drag and drop interface" 
    },
    { 
      icon: <Sparkles className="w-6 h-6" />, 
      title: "AI-Powered Enhancement", 
      description: "Get intelligent suggestions to improve your content" 
    },
    { 
      icon: <Upload className="w-6 h-6" />, 
      title: "Import Existing Resume", 
      description: "Upload your current resume for instant enhancement" 
    },
    { 
      icon: <Download className="w-6 h-6" />, 
      title: "Multiple Export Formats", 
      description: "Download as PDF, Word, or share with a professional link" 
    }
  ];

  const stats = [
    { icon: <FileText className="w-8 h-8" />, number: "2M+", label: "Resumes Created" },
    { icon: <Target className="w-8 h-8" />, number: "85%", label: "Interview Success Rate" },
    { icon: <Star className="w-8 h-8" />, number: "4.8/5", label: "User Rating" },
    { icon: <Award className="w-8 h-8" />, number: "50K+", label: "Success Stories" }
  ];

  const createNewResume = () => {
    const newResumeId = `new-${Date.now()}`;
    navigate(`/resume-builder/edit/${newResumeId}`);
  };

  const getResumeScore = () => {
    navigate('/resume-builder/upload');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Badge variant="outline" className="mb-6 bg-blue-50 text-blue-700 border-blue-200">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Resume Builder
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Build Your Resume.
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Unlock Your Career.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              TalentXcel helps you craft professional resumes that open doors.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl" onClick={createNewResume}>
                <FileText className="w-5 h-5 mr-2" />
                Build Your Resume
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold rounded-xl" onClick={getResumeScore}>
                <TrendingUp className="w-5 h-5 mr-2" />
                Get Your Resume Score
              </Button>
            </div>

            {/* Resume Preview Mockup */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-slate-300 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    <div className="space-y-2 mt-6">
                      <div className="h-3 bg-blue-200 rounded w-2/3"></div>
                      <div className="h-2 bg-slate-200 rounded w-full"></div>
                      <div className="h-2 bg-slate-200 rounded w-4/5"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-3 bg-purple-200 rounded w-1/2"></div>
                    <div className="space-y-2">
                      <div className="h-2 bg-slate-200 rounded w-full"></div>
                      <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-2 bg-slate-200 rounded w-5/6"></div>
                    </div>
                    <div className="h-3 bg-green-200 rounded w-1/2 mt-6"></div>
                    <div className="space-y-2">
                      <div className="h-2 bg-slate-200 rounded w-full"></div>
                      <div className="h-2 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-3 bg-orange-200 rounded w-2/3"></div>
                    <div className="space-y-2">
                      <div className="h-2 bg-slate-200 rounded w-full"></div>
                      <div className="h-2 bg-slate-200 rounded w-4/5"></div>
                      <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-2xl font-semibold text-slate-900 mb-8">
              Pick a resume template and build your resume in minutes!
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-2">{stat.number}</div>
                <div className="text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need to Stand Out</h2>
            <p className="text-xl text-slate-600">Professional tools designed to help you create the perfect resume</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-slate-200 hover:shadow-lg transition-all duration-200 bg-white/80 backdrop-blur-sm">
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Perfect Template</h2>
            <p className="text-xl text-slate-600">Professional designs crafted by experts, loved by recruiters</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {templates.map((template) => (
              <Card key={template.id} className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${selectedTemplate === template.id ? 'ring-2 ring-blue-500 shadow-lg' : ''}`} onClick={() => setSelectedTemplate(template.id)}>
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
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg font-semibold rounded-xl" onClick={createNewResume}>
              Start Building Your Resume
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Trusted by Professionals Worldwide</h2>
          <p className="text-xl mb-8 opacity-90">Join millions who have successfully landed their dream jobs</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-4 text-lg font-semibold rounded-xl" onClick={createNewResume}>
              <FileText className="w-5 h-5 mr-2" />
              Create Your Resume Now
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-xl" onClick={getResumeScore}>
              <Upload className="w-5 h-5 mr-2" />
              Upload & Improve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDashboard;
