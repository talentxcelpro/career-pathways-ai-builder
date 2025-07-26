
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConversationalResumeBuilder from '@/components/resume/ConversationalResumeBuilder';
import { EnhancedFileUpload } from '@/components/resume/upload/EnhancedFileUpload';
import { PasteAndParse } from '@/components/resume/upload/PasteAndParse';
import { TextBasedResumeBuilder } from '@/components/resume/enhanced/TextBasedResumeBuilder';
import { NetworkErrorFallback } from '@/components/resume/enhanced/NetworkErrorFallback';
import { FileText, Upload, ClipboardPaste } from "lucide-react";

const SimpleResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  const handleDataExtracted = (extractedData: any) => {
    setResumeData(extractedData);
    setUploadError(null);
    setShowFallback(false);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    setUploadError(error);
    // Show fallback for connection issues
    if (error.includes('Failed to send') || error.includes('Failed to fetch') || error.includes('connection')) {
      setShowFallback(true);
    }
  };

  const handleRetryUpload = () => {
    setUploadError(null);
    setShowFallback(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI-Powered Resume Builder
          </h1>
          <p className="text-gray-600">
            Upload, paste, or build your resume with intelligent AI assistance
          </p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload & Parse</span>
            </TabsTrigger>
            <TabsTrigger value="paste" className="flex items-center space-x-2">
              <ClipboardPaste className="h-4 w-4" />
              <span>Paste & Parse</span>
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Build from Scratch</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {showFallback ? (
              <NetworkErrorFallback 
                onRetry={handleRetryUpload}
                onManualEntry={() => {/* User can switch tabs manually */}}
              />
            ) : (
              <EnhancedFileUpload 
                onFileProcessed={handleDataExtracted}
                onError={handleUploadError}
              />
            )}
          </TabsContent>

          <TabsContent value="paste" className="space-y-6">
            <TextBasedResumeBuilder 
              onDataExtracted={handleDataExtracted}
              onManualEntry={() => {/* User can switch to builder tab */}}
            />
          </TabsContent>

          <TabsContent value="builder" className="space-y-6">
            <ConversationalResumeBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SimpleResumeBuilder;
