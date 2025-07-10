import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Brain, Target, Star, TrendingUp, CheckCircle } from "lucide-react";

const ResumeAnalysis = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">AI Resume Analysis</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get comprehensive insights about your resume with AI-powered analysis. 
            Improve your chances of landing your dream job.
          </p>
        </div>

        {/* Main Analysis Card */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Upload Your Resume for Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Drop your resume here</p>
              <p className="text-gray-600 mb-4">Support PDF, DOC, DOCX files up to 10MB</p>
              <Button className="bg-primary text-white hover:bg-primary/90">
                Choose File
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">ATS Compatibility</h3>
              </div>
              <p className="text-gray-600">
                Check if your resume passes Applicant Tracking Systems used by companies.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Star className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">Content Analysis</h3>
              </div>
              <p className="text-gray-600">
                Get insights on keywords, skills, and content optimization.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
                <h3 className="font-semibold text-lg">Improvement Tips</h3>
              </div>
              <p className="text-gray-600">
                Receive personalized suggestions to enhance your resume.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center mb-6">What You'll Get</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">ATS Score</h4>
                    <p className="text-gray-600 text-sm">Percentage compatibility with tracking systems</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Keyword Analysis</h4>
                    <p className="text-gray-600 text-sm">Missing keywords for your target role</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Format Review</h4>
                    <p className="text-gray-600 text-sm">Layout and structure recommendations</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Content Suggestions</h4>
                    <p className="text-gray-600 text-sm">Improve descriptions and achievements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Industry Benchmarks</h4>
                    <p className="text-gray-600 text-sm">Compare against successful resumes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Action Plan</h4>
                    <p className="text-gray-600 text-sm">Step-by-step improvement guide</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default ResumeAnalysis;