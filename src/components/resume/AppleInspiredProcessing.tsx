import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Brain, Zap, Target, CheckCircle, 
  Loader2, Sparkles, Upload, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppleInspiredProcessingProps {
  isProcessing: boolean;
  progress: number;
  status: string;
  file: File | null;
  livePreview?: any;
  className?: string;
}

export const AppleInspiredProcessing: React.FC<AppleInspiredProcessingProps> = ({
  isProcessing,
  progress,
  status,
  file,
  livePreview,
  className
}) => {
  const processingSteps = [
    { icon: FileText, label: "Reading File", description: "Analyzing document structure" },
    { icon: Brain, label: "AI Extraction", description: "Intelligent content parsing" },
    { icon: Zap, label: "Enhancement", description: "Optimizing for ATS systems" },
    { icon: Target, label: "Validation", description: "Quality checking content" },
    { icon: CheckCircle, label: "Complete", description: "Ready for editing" }
  ];

  const currentStepIndex = Math.floor((progress / 100) * processingSteps.length);

  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl flex items-center justify-center mb-6 animate-pulse">
          <Brain className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Processing Your Resume</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our AI is analyzing your resume and optimizing it for ATS systems. This will take just a moment.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl mb-8">
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">{status || 'Processing...'}</span>
                <span className="text-lg font-bold text-blue-600">{Math.round(progress)}%</span>
              </div>
              <div className="relative">
                <Progress 
                  value={progress} 
                  className="h-3 bg-gray-200/80 rounded-full overflow-hidden"
                />
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* File Info */}
            {file && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200/50">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{file.name}</div>
                    <div className="text-sm text-gray-600 flex items-center space-x-2">
                      <span>{getFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.type.split('/').pop()?.toUpperCase()}</span>
                      {file.type.includes('image') && (
                        <>
                          <span>•</span>
                          <Badge className="bg-purple-100 text-purple-700 text-xs">OCR Processing</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Steps */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {processingSteps.map((step, index) => {
          const isActive = index === currentStepIndex && isProcessing;
          const isCompleted = index < currentStepIndex;
          const isUpcoming = index > currentStepIndex;

          return (
            <Card
              key={index}
              className={cn(
                "transition-all duration-500 border-0",
                isActive && "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-xl scale-105",
                isCompleted && "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg",
                isUpcoming && "bg-white/60 backdrop-blur-sm shadow-sm"
              )}
            >
              <CardContent className="p-4 text-center">
                <div className={cn(
                  "mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300",
                  isActive && "bg-white/20 animate-pulse",
                  isCompleted && "bg-white/20",
                  isUpcoming && "bg-gray-100"
                )}>
                  {isActive ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <step.icon className={cn(
                      "h-6 w-6",
                      isActive || isCompleted ? "text-white" : "text-gray-400"
                    )} />
                  )}
                </div>
                <div className={cn(
                  "font-semibold text-sm mb-1",
                  isActive || isCompleted ? "text-white" : "text-gray-600"
                )}>
                  {step.label}
                </div>
                <div className={cn(
                  "text-xs",
                  isActive || isCompleted ? "text-white/80" : "text-gray-500"
                )}>
                  {step.description}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Live Preview */}
      {livePreview && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
              <Badge className="bg-green-100 text-green-700 text-xs ml-auto">Processing</Badge>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
              <div className="space-y-2 text-sm">
                {livePreview.personalInfo?.fullName && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Name:</span>
                    <span>{livePreview.personalInfo.fullName}</span>
                  </div>
                )}
                {livePreview.personalInfo?.email && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Email:</span>
                    <span>{livePreview.personalInfo.email}</span>
                  </div>
                )}
                {livePreview.experience?.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Experience:</span>
                    <span>{livePreview.experience.length} positions found</span>
                  </div>
                )}
                {livePreview.skills?.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Skills:</span>
                    <span>{livePreview.skills.slice(0, 3).join(', ')}...</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Animations */}
      <div className="mt-8 flex justify-center">
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};