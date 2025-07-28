import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ResumeUploaderProps {
  onResumeExtracted: (extractedData: any) => void;
  onClose: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ 
  onResumeExtracted, 
  onClose 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<any>(null);
  const { invokeAITool } = useAIService();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setUploadProgress(30);

      // Extract text content using AI service
      const result = await invokeAITool({
        toolSlug: 'resume-parser',
        inputData: {
          file: base64,
          fileName: file.name,
          fileType: file.type
        },
        category: 'resume'
      });

      setUploadProgress(70);

      if (result.success && result.data) {
        setExtractedData(result.data);
        setUploadProgress(100);
        toast.success('Resume parsed successfully!');
      } else {
        throw new Error(result.error || 'Failed to parse resume');
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      toast.error('Failed to parse resume. Please try again.');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, [invokeAITool]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const applyExtractedData = () => {
    if (extractedData) {
      onResumeExtracted(extractedData);
      toast.success('Resume data applied successfully!');
      onClose();
    }
  };

  const renderExtractedData = () => {
    if (!extractedData) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Resume parsed successfully!</span>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-3">
          {/* Personal Info */}
          {extractedData.personal && (
            <div>
              <h4 className="font-medium text-sm mb-2">Personal Information</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {extractedData.personal.fullName && (
                  <p><strong>Name:</strong> {extractedData.personal.fullName}</p>
                )}
                {extractedData.personal.email && (
                  <p><strong>Email:</strong> {extractedData.personal.email}</p>
                )}
                {extractedData.personal.phone && (
                  <p><strong>Phone:</strong> {extractedData.personal.phone}</p>
                )}
                {extractedData.personal.location && (
                  <p><strong>Location:</strong> {extractedData.personal.location}</p>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          {extractedData.summary && (
            <div>
              <h4 className="font-medium text-sm mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground">
                {extractedData.summary.length > 200 
                  ? `${extractedData.summary.substring(0, 200)}...`
                  : extractedData.summary
                }
              </p>
            </div>
          )}

          {/* Experience */}
          {extractedData.experience && extractedData.experience.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">
                Experience ({extractedData.experience.length} items)
              </h4>
              <div className="space-y-2">
                {extractedData.experience.slice(0, 2).map((exp: any, index: number) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    <p><strong>{exp.title}</strong> at {exp.company}</p>
                    <p>{exp.startDate} - {exp.endDate || 'Present'}</p>
                  </div>
                ))}
                {extractedData.experience.length > 2 && (
                  <p className="text-xs text-muted-foreground">
                    +{extractedData.experience.length - 2} more items
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {extractedData.skills && extractedData.skills.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">
                Skills ({extractedData.skills.length} items)
              </h4>
              <div className="flex flex-wrap gap-1">
                {extractedData.skills.slice(0, 10).map((skill: any, index: number) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-muted text-xs rounded"
                  >
                    {typeof skill === 'string' ? skill : skill.name}
                  </span>
                ))}
                {extractedData.skills.length > 10 && (
                  <span className="px-2 py-1 bg-muted text-xs rounded">
                    +{extractedData.skills.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={applyExtractedData} className="flex-1">
            Apply to Resume
          </Button>
          <Button variant="outline" onClick={() => setExtractedData(null)}>
            Re-upload
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload Existing Resume
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!extractedData ? (
          <>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive && "border-primary bg-primary/5",
                isUploading && "cursor-not-allowed opacity-50",
                !isDragActive && !isUploading && "border-muted-foreground/25 hover:border-primary"
              )}
            >
              <input {...getInputProps()} />
              
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                
                <div>
                  <p className="text-sm font-medium">
                    {isDragActive 
                      ? "Drop your resume here..." 
                      : "Drag & drop your resume, or click to browse"
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports PDF, DOC, and DOCX files (max 10MB)
                  </p>
                </div>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Processing resume...</span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>AI will extract and organize your resume data automatically</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>Supports multiple file formats and layouts</span>
              </div>
            </div>
          </>
        ) : (
          renderExtractedData()
        )}
      </CardContent>
    </Card>
  );
};