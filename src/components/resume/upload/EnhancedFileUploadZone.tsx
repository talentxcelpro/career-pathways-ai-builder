import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, FileText, Wand2, Target, BookOpen, Award, 
  X, CheckCircle, AlertCircle, Loader2, Eye, Sparkles 
} from 'lucide-react';

interface EnhancedFileUploadZoneProps {
  onFileSelect: (files: FileList | null) => void;
  uploadedFile: File | null;
  onRemoveFile: () => void;
  onProcessResume: () => void;
  processingStatus: {
    isProcessing: boolean;
    currentStep: string;
    progress: number;
    error?: string;
    completed: boolean;
  };
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const ProcessingSteps = [
  { id: 'upload', label: 'Upload File', icon: Upload, description: 'Securely uploading your resume' },
  { id: 'extract', label: 'Content Extraction', icon: FileText, description: 'AI extracts sections and content' },
  { id: 'optimize', label: 'ATS Optimization', icon: Target, description: 'Optimizing for ATS systems' },
  { id: 'enhance', label: 'AI Enhancement', icon: Sparkles, description: 'Improving content quality' },
  { id: 'complete', label: 'Ready to Edit', icon: CheckCircle, description: 'Opening in resume builder' }
];

export const EnhancedFileUploadZone = ({
  onFileSelect,
  uploadedFile,
  onRemoveFile,
  onProcessResume,
  processingStatus,
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop
}: EnhancedFileUploadZoneProps) => {
  const [previewExpanded, setPreviewExpanded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCurrentStepIndex = () => {
    return ProcessingSteps.findIndex(step => step.id === processingStatus.currentStep);
  };

  if (processingStatus.isProcessing || processingStatus.completed) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Processing Header */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                {processingStatus.completed ? (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                ) : (
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                )}
                <h3 className="text-lg font-semibold">
                  {processingStatus.completed ? 'Processing Complete!' : 'Processing Your Resume'}
                </h3>
              </div>
              <Progress value={processingStatus.progress} className="w-full mb-6" />
              <p className="text-sm text-muted-foreground">
                {processingStatus.progress}% Complete
              </p>
            </div>

            {/* Processing Steps */}
            <div className="space-y-4">
              {ProcessingSteps.map((step, index) => {
                const currentStepIndex = getCurrentStepIndex();
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex || processingStatus.completed;
                const isUpcoming = index > currentStepIndex && !processingStatus.completed;

                return (
                  <div key={step.id} className="flex items-center space-x-4">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full transition-all
                      ${isCompleted ? 'bg-green-100 text-green-700' : 
                        isActive ? 'bg-primary/10 text-primary' : 
                        'bg-gray-100 text-gray-400'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : isActive ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-700' : 'text-gray-500'}`}>
                          {step.label}
                        </h4>
                        {isCompleted && <Badge variant="secondary" className="text-xs">Done</Badge>}
                        {isActive && <Badge variant="default" className="text-xs">Processing...</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {processingStatus.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <h4 className="font-medium text-red-700">Processing Error</h4>
                </div>
                <p className="text-sm text-red-600 mt-1">{processingStatus.error}</p>
              </div>
            )}

            {processingStatus.completed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-medium text-green-700 mb-2">Resume Processing Complete!</h4>
                <p className="text-sm text-green-600 mb-4">
                  Your resume has been analyzed and enhanced. Ready to edit!
                </p>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Eye className="h-4 w-4 mr-2" />
                  Open in Editor
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card className={`
        border-2 border-dashed transition-all cursor-pointer hover:border-primary/50
        ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
        ${uploadedFile ? 'border-green-300 bg-green-50/50' : ''}
      `}>
        <CardContent className="p-8">
          <div
            className="text-center space-y-4"
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <div className="flex items-center justify-center">
              {uploadedFile ? (
                <div className="flex items-center space-x-3">
                  <FileText className="h-12 w-12 text-green-600" />
                  <div className="text-left">
                    <h3 className="font-medium text-green-700">{uploadedFile.name}</h3>
                    <p className="text-sm text-green-600">{formatFileSize(uploadedFile.size)}</p>
                  </div>
                </div>
              ) : (
                <Upload className={`h-12 w-12 ${dragActive ? 'text-primary' : 'text-gray-400'}`} />
              )}
            </div>
            
            {!uploadedFile ? (
              <>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {dragActive ? 'Drop your resume here' : 'Drop your resume here'}
                  </h3>
                  <p className="text-gray-600">or click to browse files</p>
                </div>
                
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('resume-upload')?.click()}
                  className="bg-white hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                
                <p className="text-sm text-gray-500">
                  Supported formats: PDF, DOCX • Max size: 10MB
                </p>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    onClick={onProcessResume}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Process with AI
                  </Button>
                  <Button variant="outline" onClick={onRemoveFile}>
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setPreviewExpanded(!previewExpanded)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {previewExpanded ? 'Hide' : 'Show'} File Details
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Details Preview */}
      {uploadedFile && previewExpanded && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                File Information
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <p className="font-medium">{uploadedFile.name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Size:</span>
                  <p className="font-medium">{formatFileSize(uploadedFile.size)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium">{uploadedFile.type || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Last Modified:</span>
                  <p className="font-medium">{new Date(uploadedFile.lastModified).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* What Happens Next */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h4 className="font-medium text-center mb-6">What happens next?</h4>
            <p className="text-center text-muted-foreground mb-6">Our AI will analyze and enhance your resume</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    1
                  </div>
                  <div>
                    <h5 className="font-medium">Content Extraction</h5>
                    <p className="text-sm text-muted-foreground">AI extracts all sections including experience, education, and skills</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 font-semibold text-sm">
                    2
                  </div>
                  <div>
                    <h5 className="font-medium">ATS Optimization</h5>
                    <p className="text-sm text-muted-foreground">Automatic formatting and keyword optimization for ATS systems</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 font-semibold text-sm">
                    3
                  </div>
                  <div>
                    <h5 className="font-medium">Enhancement Suggestions</h5>
                    <p className="text-sm text-muted-foreground">AI provides improvement suggestions for better impact</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 font-semibold text-sm">
                    4
                  </div>
                  <div>
                    <h5 className="font-medium">Ready to Edit</h5>
                    <p className="text-sm text-muted-foreground">Open in our editor with your enhanced content</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};