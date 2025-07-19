
import React from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Shield, ArrowRight } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
  canGoNext: boolean;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext, canGoNext }) => {
  return (
    <div className="text-center space-y-8">
      {/* Profile Image Placeholder */}
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome to TalentXcel Resume Builder
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Great! Please upload your resume for a quick start. Our AI will analyze and enhance it to help you stand out.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Enhancement</h3>
          <p className="text-sm text-gray-600">Our AI analyzes your resume and suggests improvements for better ATS compatibility.</p>
        </div>
        
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Upload className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Easy Upload</h3>
          <p className="text-sm text-gray-600">Upload PDF, Word, or image files. We'll extract all your information automatically.</p>
        </div>
        
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Shield className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
          <p className="text-sm text-gray-600">Your data is encrypted and secure. We never share your personal information.</p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="pt-6">
        <Button 
          onClick={onNext}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Trust Indicator */}
      <div className="pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Join thousands of professionals who've enhanced their resumes with TalentXcel
        </p>
      </div>
    </div>
  );
};
