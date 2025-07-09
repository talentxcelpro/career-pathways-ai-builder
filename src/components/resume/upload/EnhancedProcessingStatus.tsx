import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2, FileText, Brain, Zap, Target, Sparkles, Image, Eye } from "lucide-react";
import { LivePreviewRenderer } from "./LivePreviewRenderer";

interface EnhancedProcessingStatusProps {
  isProcessing: boolean;
  uploadSuccess: boolean;
  processingStep: number;
  processingSteps: string[];
  processingProgress: number;
  processingStatus: string;
  uploadedFile: File | null;
  ocrMode?: boolean;
  livePreview?: any;
  extractedData?: any;
}

export const EnhancedProcessingStatus: React.FC<EnhancedProcessingStatusProps> = ({
  isProcessing,
  uploadSuccess,
  processingStep,
  processingSteps,
  processingProgress,
  processingStatus,
  uploadedFile,
  ocrMode,
  livePreview,
  extractedData
}) => {
  if (!isProcessing && !uploadSuccess) {
    return null;
  }

  const getStepIcon = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return <FileText className="h-4 w-4" />;
      case 1:
        return <Brain className="h-4 w-4" />;
      case 2:
        return ocrMode ? <Image className="h-4 w-4" /> : <Zap className="h-4 w-4" />;
      case 3:
        return <Target className="h-4 w-4" />;
      case 4:
        return <Sparkles className="h-4 w-4" />;
      case 5:
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Loader2 className="h-4 w-4" />;
    }
  };

  const getProcessingMethod = () => {
    if (!uploadedFile) return 'Standard';
    const isImage = uploadedFile.type.includes('image');
    if (isImage || ocrMode) return 'OCR + AI';
    return 'Standard AI';
  };

  const getQualityMetrics = () => {
    if (!extractedData?.confidenceMetrics) return null;
    
    const metrics = extractedData.confidenceMetrics;
    return [
      { label: 'Overall', value: Math.round(metrics.overall * 100) },
      { label: 'Personal Info', value: Math.round(metrics.personalInfo * 100) },
      { label: 'Experience', value: Math.round(metrics.experience * 100) },
      { label: 'Skills', value: Math.round(metrics.skills * 100) }
    ];
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {uploadSuccess ? (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Resume Processed Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your resume has been analyzed and enhanced using {getProcessingMethod()} processing
                </p>
              </div>
            </div>

            {/* Processing Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800 mb-3">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Content Extracted</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  {extractedData?.personalInfo?.fullName && <li>✓ Personal Information</li>}
                  {extractedData?.experience?.length > 0 && <li>✓ Work Experience ({extractedData.experience.length} positions)</li>}
                  {extractedData?.education?.length > 0 && <li>✓ Education ({extractedData.education.length} entries)</li>}
                  {extractedData?.skills && <li>✓ Skills & Technologies</li>}
                  {extractedData?.projects?.length > 0 && <li>✓ Projects ({extractedData.projects.length})</li>}
                  {extractedData?.atsOptimization?.score && <li>✓ ATS Score: {extractedData.atsOptimization.score}%</li>}
                </ul>
              </div>

              {/* Quality Metrics */}
              {getQualityMetrics() && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-blue-800 mb-3">
                    <Target className="h-5 w-5" />
                    <span className="font-medium">Extraction Quality</span>
                  </div>
                  <div className="space-y-2">
                    {getQualityMetrics()!.map((metric, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-blue-700">{metric.label}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-blue-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${metric.value}%` }}
                            />
                          </div>
                          <span className="text-xs text-blue-600 font-medium">{metric.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live Preview */}
            {livePreview && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-gray-800 mb-3">
                  <Eye className="h-5 w-5" />
                  <span className="font-medium">Content Preview</span>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  <LivePreviewRenderer previewData={livePreview} />
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Redirecting to resume editor...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Processing Header */}
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Processing Your Resume
              </h3>
              <p className="text-gray-600">
                {getProcessingMethod() === 'OCR + AI' 
                  ? 'Using advanced OCR and AI to extract content from your document'
                  : 'Our AI is extracting all sections from your resume'
                }
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{processingStatus || 'Processing...'}</span>
                <span>{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} className="h-3" />
            </div>

            {/* Processing Method Info */}
            {uploadedFile && (
              <div className={`rounded-lg p-3 border ${
                getProcessingMethod() === 'OCR + AI' 
                  ? 'bg-purple-50 border-purple-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className={`flex items-center space-x-2 text-sm font-medium ${
                  getProcessingMethod() === 'OCR + AI' ? 'text-purple-800' : 'text-blue-800'
                }`}>
                  {getProcessingMethod() === 'OCR + AI' ? (
                    <>
                      <Image className="h-4 w-4" />
                      <span>Enhanced OCR Processing</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      <span>Standard AI Processing</span>
                    </>
                  )}
                </div>
                <p className={`text-xs mt-1 ${
                  getProcessingMethod() === 'OCR + AI' ? 'text-purple-700' : 'text-blue-700'
                }`}>
                  {getProcessingMethod() === 'OCR + AI' 
                    ? 'Extracting text from scanned document using optical character recognition'
                    : 'Processing structured document with advanced AI algorithms'
                  }
                </p>
              </div>
            )}

            {/* Processing Steps */}
            <div className="space-y-3">
              {processingSteps.map((step, index) => {
                const isActive = index === processingStep;
                const isCompleted = index < processingStep;
                const isUpcoming = index > processingStep;

                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg border ${
                      isActive
                        ? 'bg-blue-50 border-blue-200'
                        : isCompleted
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-blue-100 text-blue-600'
                          : isCompleted
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {isActive ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        getStepIcon(index)
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div
                        className={`font-medium ${
                          isActive
                            ? 'text-blue-900'
                            : isCompleted
                              ? 'text-green-900'
                              : 'text-gray-500'
                        }`}
                      >
                        {step}
                      </div>
                      {isActive && processingStatus && processingStatus !== step && (
                        <div className="text-sm text-blue-600 mt-1">
                          {processingStatus}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* File Info */}
            {uploadedFile && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {uploadedFile.name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center space-x-2">
                      <span>{(uploadedFile.size / 1024 / 1024).toFixed(1)} MB</span>
                      <span>•</span>
                      <span>{uploadedFile.type.split('/').pop()?.toUpperCase()}</span>
                      <span>•</span>
                      <span>{getProcessingMethod()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Preview During Processing */}
            {livePreview && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-gray-800 mb-3">
                  <Eye className="h-5 w-5" />
                  <span className="font-medium">Live Preview</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Processing</span>
                </div>
                <div className="max-h-32 overflow-y-auto">
                  <LivePreviewRenderer previewData={livePreview} />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};