
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, PlusCircle, CheckCircle, Download, Edit, Sparkles, TrendingUp, Award } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const ResumeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Create New Resume",
      description: "Start fresh with TalentXcel templates",
      icon: <PlusCircle className="h-6 w-6" />,
      path: "/resume-builder/new",
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
      iconColor: "text-blue-600"
    },
    {
      title: "Upload Resume",
      description: "Import and enhance existing resume",
      icon: <Upload className="h-6 w-6" />,
      path: "/resume-builder/upload",
      color: "bg-green-50 hover:bg-green-100 border-green-200",
      iconColor: "text-green-600"
    },
    {
      title: "Get Resume Score",
      description: "Free AI analysis and feedback",
      icon: <CheckCircle className="h-6 w-6" />,
      path: "/resume-builder/checker",
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
      iconColor: "text-purple-600",
      badge: "Popular"
    },
    {
      title: "Browse Templates",
      description: "Professional TalentXcel designs",
      icon: <FileText className="h-6 w-6" />,
      path: "/resume-builder/templates",
      color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
      iconColor: "text-orange-600"
    }
  ];

  const features = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "AI-Powered Enhancement",
      description: "Intelligent suggestions to improve your resume content and structure"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "ATS Optimization",
      description: "Ensure your resume passes applicant tracking systems"
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: "Professional Templates",
      description: "Choose from dozens of professionally designed templates"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <FileText className="h-12 w-12" />
              <h1 className="text-4xl md:text-5xl font-bold">
                TalentXcel Resume Builder
              </h1>
            </div>
            <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
              Create professional resumes with AI-powered tools and land your dream job
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
                onClick={() => navigate('/resume-builder/checker')}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Get Free Resume Score
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold"
                onClick={() => navigate('/resume-builder/new')}
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create New Resume
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What would you like to do?
          </h2>
          <p className="text-xl text-gray-600">
            Choose your starting point to build the perfect resume
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${action.color} border-2`}
              onClick={() => navigate(action.path)}
            >
              {action.badge && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                  {action.badge}
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${action.iconColor} bg-white`}>
                  {action.icon}
                </div>
                <CardTitle className="text-lg text-gray-900">{action.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-gray-600 text-sm leading-relaxed">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Why Choose TalentXcel?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <div className="text-blue-600">{feature.icon}</div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Resumes Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Recent Resumes</h3>
            <Button variant="outline" onClick={() => navigate('/resume-builder/new')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New
            </Button>
          </div>
          
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h4>
              <p className="text-gray-600 mb-6">
                Start building your professional resume with TalentXcel
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/resume-builder/new')}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Resume
                </Button>
                <Button variant="outline" onClick={() => navigate('/resume-builder/upload')}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Existing
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResumeDashboard;
