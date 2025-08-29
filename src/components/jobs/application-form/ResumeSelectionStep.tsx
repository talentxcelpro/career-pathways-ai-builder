
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { FormData, Resume } from './types';

interface ResumeSelectionStepProps {
  formData: FormData;
  resumes: Resume[];
  onInputChange: (key: keyof FormData, value: any) => void;
  onResumeUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ResumeSelectionStep({ 
  formData, 
  resumes, 
  onInputChange, 
  onResumeUpload 
}: ResumeSelectionStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Step 1: Select Resume
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={formData.resumeSource}
          onValueChange={(value: 'existing' | 'upload') => onInputChange('resumeSource', value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="existing" id="existing" />
            <Label htmlFor="existing">Use Existing Resume</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upload" id="upload" />
            <Label htmlFor="upload">Upload New Resume</Label>
          </div>
        </RadioGroup>

        {formData.resumeSource === 'existing' && (
          <div className="space-y-3">
            {resumes.length > 0 ? (
              <RadioGroup
                value={formData.selectedResumeId}
                onValueChange={(value) => onInputChange('selectedResumeId', value)}
              >
                {resumes.map((resume) => (
                  <div key={resume.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value={resume.id} id={resume.id} />
                    <Label htmlFor={resume.id} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>{resume.title}</span>
                        {resume.is_primary && (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-orange-200 rounded-lg bg-orange-50">
                <FileText className="h-12 w-12 text-orange-400 mx-auto mb-3" />
                <h3 className="font-semibold text-orange-800 mb-2">No Resume Found</h3>
                <p className="text-orange-700 text-sm mb-4">
                  You need to upload a resume to apply for this position. Please select "Upload New Resume" below.
                </p>
                <button 
                  onClick={() => onInputChange('resumeSource', 'upload')}
                  className="text-orange-600 font-medium hover:text-orange-800 underline"
                >
                  Upload Resume Now
                </button>
              </div>
            )}
          </div>
        )}

        {formData.resumeSource === 'upload' && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={onResumeUpload}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600 font-medium">
                {formData.uploadedResume ? (
                  <span className="text-green-600 flex items-center justify-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {formData.uploadedResume.name}
                  </span>
                ) : (
                  'Upload Resume (PDF, DOCX, max 5MB)'
                )}
              </p>
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
