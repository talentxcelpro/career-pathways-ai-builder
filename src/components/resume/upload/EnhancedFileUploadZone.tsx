import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, File, X, Wand2, Image, FileText, 
  Eye, AlertCircle, CheckCircle, Brain 
} from "lucide-react";
import { LivePreviewRenderer } from "./LivePreviewRenderer";

interface EnhancedFileUploadZoneProps {
  onFileSelect: (files: FileList | null) => void;
  uploadedFile: File | null;
  onRemoveFile: () => void;
  onProcessResume: () => void;
  isProcessing: boolean;
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  processingProgress?: number;
  processingStatus?: string;
  ocrMode?: boolean;
  onToggleOCR?: () => void;
  livePreview?: any;
}

export const EnhancedFileUploadZone: React.FC<EnhancedFileUploadZoneProps> = ({
  onFileSelect,
  uploadedFile,
  onRemoveFile,
  onProcessResume,
  isProcessing,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  processingProgress = 0,
  processingStatus = '',
  ocrMode = false,
  onToggleOCR,
  livePreview
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };

  const getFileTypeIcon = (file: File) => {
    if (file.type.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (file.type.includes('image')) return <Image className="h-5 w-5 text-blue-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getFileTypeInfo = (file: File) => {
    const isImage = file.type.includes('image');
    const isPdf = file.type.includes('pdf');
    const isScanned = isImage || (file.name.toLowerCase().includes('scan'));
    
    return {
      isImage,
      isPdf,
      isScanned,
      needsOCR: isScanned || ocrMode
    };
  };

  return (
    <div className="space-y-4">
      {/* File Upload Zone */}
      <Card 
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : uploadedFile 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={uploadedFile ? undefined : handleClick}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        <CardContent className="p-8 text-center">
          <input
            ref={fileInputRef}
            id="resume-upload"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          
          {!uploadedFile ? (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {dragActive ? 'Drop your resume here' : 'Upload your resume'}
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop or click to select your resume file
                </p>
                <p className="text-sm text-gray-500 mb-2">
                  Supports PDF, DOC, DOCX, TXT, and images (max 10MB)
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline" className="text-xs">PDF</Badge>
                  <Badge variant="outline" className="text-xs">Word</Badge>
                  <Badge variant="outline" className="text-xs">Images</Badge>
                  <Badge variant="outline" className="text-xs">OCR Ready</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button type="button" variant="outline">
                  Choose File
                </Button>
                
                {onToggleOCR && (
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      id="ocr-mode"
                      checked={ocrMode}
                      onChange={onToggleOCR}
                      className="rounded"
                    />
                    <label htmlFor="ocr-mode" className="flex items-center space-x-1 text-gray-600">
                      <Brain className="h-4 w-4" />
                      <span>Force OCR mode for scanned documents</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                {getFileTypeIcon(uploadedFile)}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  File Selected
                </h3>
                <div className="flex items-center justify-center space-x-2 text-gray-600 mb-3">
                  <span className="font-medium">{uploadedFile.name}</span>
                  <span className="text-sm">
                    ({(uploadedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </span>
                </div>
                
                {/* File Analysis */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {(() => {
                    const fileInfo = getFileTypeInfo(uploadedFile);
                    const badges = [];
                    
                    if (fileInfo.isImage) {
                      badges.push(<Badge key="image" variant="secondary" className="text-xs bg-blue-100 text-blue-700">Image File</Badge>);
                    }
                    if (fileInfo.isPdf) {
                      badges.push(<Badge key="pdf" variant="secondary" className="text-xs bg-red-100 text-red-700">PDF</Badge>);
                    }
                    if (fileInfo.needsOCR) {
                      badges.push(<Badge key="ocr" variant="secondary" className="text-xs bg-purple-100 text-purple-700">OCR Required</Badge>);
                    }
                    if (!fileInfo.needsOCR) {
                      badges.push(<Badge key="standard" variant="secondary" className="text-xs bg-green-100 text-green-700">Standard Processing</Badge>);
                    }
                    
                    return badges;
                  })()}
                </div>
              </div>
              
              {/* Processing Progress */}
              {isProcessing && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{processingStatus || 'Processing...'}</span>
                      <span>{Math.round(processingProgress)}%</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                  </div>
                  
                  {getFileTypeInfo(uploadedFile).needsOCR && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2 text-blue-800 text-sm">
                        <Brain className="h-4 w-4" />
                        <span className="font-medium">Enhanced OCR Processing</span>
                      </div>
                      <p className="text-xs text-blue-700 mt-1">
                        Using advanced OCR to extract text from your document
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-3 justify-center">
                <Button
                  type="button"
                  onClick={onProcessResume}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isProcessing ? (
                    <>
                      <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      {getFileTypeInfo(uploadedFile).needsOCR ? 'Extract with OCR' : 'Extract Content'}
                    </>
                  )}
                </Button>
                
                {livePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(!showPreview)}
                    disabled={isProcessing}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? 'Hide' : 'Preview'}
                  </Button>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={onRemoveFile}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Live Preview */}
      {showPreview && livePreview && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Live Preview</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <LivePreviewRenderer previewData={livePreview} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};