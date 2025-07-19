
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, Edit, Share2, BarChart3, Sparkles } from "lucide-react";

interface SuccessStepProps {
  onComplete: () => void;
  resumeData: any;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({ onComplete, resumeData }) => {
  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Your Resume is Ready! 🎉
          </h2>
          <p className="text-xl text-gray-600">
            We've successfully analyzed and enhanced your resume with AI-powered optimizations.
          </p>
        </div>
      </div>

      {/* Resume Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {resumeData?.atsScore || 87}%
            </div>
            <div className="text-sm text-gray-600">ATS Compatibility Score</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {resumeData?.experience?.length || 2}
            </div>
            <div className="text-sm text-gray-600">Work Experiences Extracted</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {resumeData?.skills?.length || 8}
            </div>
            <div className="text-sm text-gray-600">Skills Identified</div>
          </CardContent>
        </Card>
      </div>

      {/* What's Been Enhanced */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Sparkles className="h-5 w-5 text-green-600 mr-2" />
            What We've Enhanced
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Personal information extracted</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Work experience formatted</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Skills categorized and optimized</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>ATS keywords integrated</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Professional formatting applied</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Content structure optimized</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 text-center">
          What would you like to do next?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={onComplete}
            className="h-16 flex flex-col items-center justify-center space-y-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Edit className="h-6 w-6" />
            <span>Edit & Customize</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1"
          >
            <Download className="h-6 w-6" />
            <span>Download PDF</span>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1"
          >
            <Share2 className="h-6 w-6" />
            <span>Share Online</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1"
          >
            <BarChart3 className="h-6 w-6" />
            <span>View Analytics</span>
          </Button>
        </div>
      </div>

      {/* Upgrade Prompt */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold text-purple-900 mb-2">
            Unlock Premium Features
          </h3>
          <p className="text-purple-700 text-sm mb-4">
            Get access to 50+ templates, unlimited downloads, and advanced AI features.
          </p>
          <Button 
            variant="outline" 
            className="border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
