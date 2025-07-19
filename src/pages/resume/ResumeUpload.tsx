
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Upload, FileText, Loader2 } from "lucide-react";
import { EnhancedFileUpload } from "@/components/resume/EnhancedFileUpload";
import { useResumeUpload } from "@/hooks/useResumeUpload";

const ResumeUpload = () => {
  const navigate = useNavigate();
  const {
    isProcessing,
    uploadSuccess,
    processingStep,
    processingSteps,
    processResume,
    resetUpload
  } = useResumeUpload();

  const handleFileSelect = (files: FileList) => {
    processResume(files);
  };

  const handleReset = () => {
    resetUpload();
  };

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Upload Complete!</h2>
            <p className="text-gray-600 mb-6">Your resume has been processed successfully.</p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/resume-builder')} className="w-full">
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={handleReset} className="w-full">
                Upload Another Resume
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => navigate('/resume-builder')} className="flex items-center text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Resume</h1>
          <p className="text-lg text-gray-600">Upload your existing resume and let our AI enhance it</p>
        </div>

        <EnhancedFileUpload
          onFileSelect={handleFileSelect}
          isProcessing={isProcessing}
          processingProgress={(processingStep / processingSteps.length) * 100}
          processingStatus={processingSteps[processingStep] || 'Processing...'}
          className="max-w-2xl mx-auto"
        />

        {isProcessing && (
          <div className="max-w-2xl mx-auto mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing Your Resume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={(processingStep / processingSteps.length) * 100} />
                  <div className="text-sm text-gray-600">
                    Step {processingStep + 1} of {processingSteps.length}: {processingSteps[processingStep]}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
