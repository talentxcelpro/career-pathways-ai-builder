import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Sparkles, Upload, PenTool, Download, CheckCircle, ArrowRight, ArrowLeft, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ResumeBuilder = () => {
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
    { icon: <PenTool className="w-6 h-6" />, title: "Drag & Drop Editor", description: "Rearrange sections with intuitive drag and drop" },
    { icon: <Sparkles className="w-6 h-6" />, title: "AI-Powered Enhancement", description: "Get intelligent suggestions to improve content" },
    { icon: <Upload className="w-6 h-6" />, title: "Import Existing Resume", description: "Upload your current resume for enhancement" },
    { icon: <Download className="w-6 h-6" />, title: "Multiple Export Formats", description: "Download as PDF, Word, or share online" }
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
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Build Your Dream Resume in
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Minutes</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
              Create a professional resume with our AI-powered tools and beautiful templates.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/resume-builder/upload">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Existing Resume
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold rounded-xl" onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })}>
                <FileText className="w-5 h-5 mr-2" />
                Start from Scratch
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need to Stand Out</h2>
            <p className="text-xl text-slate-600">Professional tools designed to help you create the perfect resume</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-slate-200 hover:shadow-lg transition-all duration-200">
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
      <div id="templates" className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Perfect Template</h2>
            <p className="text-xl text-slate-600">Professional designs crafted by experts</p>
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
    </div>
  );
};

export default ResumeBuilder;