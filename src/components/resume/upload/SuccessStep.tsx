
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, Eye, Share, Award } from "lucide-react";

interface SuccessStepProps {
  onComplete: () => void;
  resumeData: any;
}

export const SuccessStep: React.FC<SuccessStepProps> = ({
  onComplete,
  resumeData
}) => {
  const hasError = resumeData?.error;
  const atsScore = resumeData?.atsScore || 0;

  if (hasError) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-red-600" />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Processing Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {resumeData.error}
          </p>
          
          <Button 
            onClick={onComplete}
            variant="outline"
            className="w-full"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Resume Successfully Processed!
        </h2>
        <p className="text-gray-600 mb-6">
          Your resume has been analyzed and optimized for maximum impact.
        </p>
      </div>

      {/* ATS Score Display */}
      {atsScore > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Award className="h-6 w-6 text-blue-600" />
              <h3 className="font-semibold text-blue-900">ATS Compatibility Score</h3>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {atsScore}/100
            </div>
            <p className="text-sm text-blue-700">
              {atsScore >= 80 ? 'Excellent! Your resume is highly ATS-compatible.' :
               atsScore >= 60 ? 'Good score with room for improvement.' :
               'Consider optimizing your resume for better ATS compatibility.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Extracted Information Summary */}
      {resumeData?.personalInfo && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Information Extracted:</h3>
            <div className="text-left space-y-2">
              {resumeData.personalInfo.name && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{resumeData.personalInfo.name}</span>
                </div>
              )}
              {resumeData.personalInfo.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{resumeData.personalInfo.email}</span>
                </div>
              )}
              {resumeData.workExperience?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Work Experience:</span>
                  <span className="font-medium">{resumeData.workExperience.length} positions</span>
                </div>
              )}
              {resumeData.education?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Education:</span>
                  <span className="font-medium">{resumeData.education.length} entries</span>
                </div>
              )}
              {resumeData.skills?.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Skills:</span>
                  <span className="font-medium">{resumeData.skills.length} skills</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Eye className="h-4 w-4 mr-2" />
          View & Edit Resume
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" className="w-full">
            <Share className="h-4 w-4 mr-2" />
            Share Resume
          </Button>
        </div>
      </div>

      {/* Next Steps */}
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-2">What's Next?</h3>
          <ul className="text-sm text-gray-600 space-y-1 text-left">
            <li>• Review and edit your extracted resume content</li>
            <li>• Apply AI-powered improvements and suggestions</li>
            <li>• Download your optimized resume in multiple formats</li>
            <li>• Start applying to jobs with confidence</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
