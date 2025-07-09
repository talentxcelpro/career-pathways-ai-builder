import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { EnhancedFileUploadZone } from "@/components/resume/upload/EnhancedFileUploadZone";
import { EnhancedProcessingStatus } from "@/components/resume/upload/EnhancedProcessingStatus";
import { FeaturesPreview } from "@/components/resume/upload";
import { LivePreviewRenderer } from "@/components/resume/upload/LivePreviewRenderer";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useEnhancedResumeUpload } from "@/hooks/useEnhancedResumeUpload";

const UploadResume = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const {
    isProcessing,
    uploadSuccess,
    processingStep,
    processingSteps,
    processingProgress,
    processingStatus,
    ocrMode,
    livePreview,
    extractedData,
    processResume,
    resetUpload,
    toggleOCR
  } = useEnhancedResumeUpload();

  const { dragActive, handleDrag, handleDrop } = useDragAndDrop((files) => {
    if (files && files[0]) {
      setUploadedFile(files[0]);
    }
  });

  const handleFileSelect = (files: FileList | null) => {
    if (files && files[0]) {
      setUploadedFile(files[0]);
    }
  };

  const handleProcessResume = () => {
    if (uploadedFile) {
      // Create a FileList-like object from the single file
      const fileList = {
        0: uploadedFile,
        length: 1,
        item: (index: number) => index === 0 ? uploadedFile : null,
        [Symbol.iterator]: function* () {
          yield uploadedFile;
        }
      } as FileList;
      
      processResume(fileList);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleResetUpload = () => {
    setUploadedFile(null);
    resetUpload();
    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/resume-builder')}
            className="flex items-center mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Resume</h1>
            <p className="text-gray-600">Upload your existing resume for AI enhancement and analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Resume</CardTitle>
                <CardDescription>
                  Support for PDF, DOCX, and image files. Our advanced AI will extract, analyze, and enhance your content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EnhancedProcessingStatus
                  isProcessing={isProcessing}
                  uploadSuccess={uploadSuccess}
                  processingStep={processingStep}
                  processingSteps={processingSteps}
                  processingProgress={processingProgress}
                  processingStatus={processingStatus}
                  uploadedFile={uploadedFile}
                  ocrMode={ocrMode}
                  livePreview={livePreview}
                  extractedData={extractedData}
                />
                
                {!uploadSuccess && !isProcessing && (
                  <div className="space-y-4">
                    <EnhancedFileUploadZone
                      onFileSelect={handleFileSelect}
                      uploadedFile={uploadedFile}
                      onRemoveFile={removeFile}
                      onProcessResume={handleProcessResume}
                      isProcessing={isProcessing}
                      dragActive={dragActive}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      processingProgress={processingProgress}
                      processingStatus={processingStatus}
                      ocrMode={ocrMode}
                      onToggleOCR={toggleOCR}
                      livePreview={livePreview}
                    />
                    
                    {isProcessing && (
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          onClick={handleResetUpload}
                          className="w-full"
                        >
                          Cancel Processing
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Preview */}
            {livePreview && (
              <Card>
                <CardHeader>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>Real-time extraction preview</CardDescription>
                </CardHeader>
                <CardContent>
                  <LivePreviewRenderer previewData={livePreview} />
                </CardContent>
              </Card>
            )}

            {/* Features Preview */}
            <FeaturesPreview />
            
            {/* Upload Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <p>Use high-quality PDFs for best results</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <p>For scanned documents, enable OCR mode</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                    <p>Ensure text is clear and readable</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <p>File size limit: 10MB maximum</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;