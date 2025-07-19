
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Shield, Zap } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
  canGoNext: boolean;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext, canGoNext }) => {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
          <FileText className="h-8 w-8 text-blue-600" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900">
          Transform Your Resume with AI
        </h2>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your existing resume and let our AI analyze, optimize, and enhance it 
          for maximum impact with recruiters and ATS systems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center text-center p-6 bg-blue-50 rounded-lg">
          <Sparkles className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">AI Enhancement</h3>
          <p className="text-sm text-gray-600">
            Advanced AI analyzes your content and suggests improvements
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center p-6 bg-green-50 rounded-lg">
          <Zap className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">ATS Optimization</h3>
          <p className="text-sm text-gray-600">
            Optimize for Applicant Tracking Systems used by employers
          </p>
        </div>
        
        <div className="flex flex-col items-center text-center p-6 bg-purple-50 rounded-lg">
          <Shield className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
          <p className="text-sm text-gray-600">
            Your data is encrypted and never shared with third parties
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={onNext}
          disabled={!canGoNext}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
        >
          Get Started
        </Button>
        
        <p className="text-xs text-gray-500">
          Supported formats: PDF, Word (.docx, .doc) • Max size: 5MB
        </p>
      </div>
    </div>
  );
};
