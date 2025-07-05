
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { EnhancedFileUploadZone } from "@/components/resume/upload/EnhancedFileUploadZone";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { useEnhancedResumeUpload } from "@/hooks/useEnhancedResumeUpload";

const UploadResume = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const {
    processingStatus,
    processResume,
    resetUpload
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
            <h1 className="text-3xl font-bold text-gray-900">AI Resume Upload & Enhancement</h1>
            <p className="text-gray-600">Upload your existing resume for intelligent AI analysis and optimization</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <EnhancedFileUploadZone
            onFileSelect={handleFileSelect}
            uploadedFile={uploadedFile}
            onRemoveFile={removeFile}
            onProcessResume={handleProcessResume}
            processingStatus={processingStatus}
            dragActive={dragActive}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          />
          
          {(processingStatus.isProcessing || processingStatus.error) && (
            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={handleResetUpload}
                disabled={processingStatus.completed}
              >
                {processingStatus.completed ? 'Processing Complete' : 'Cancel & Start Over'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
