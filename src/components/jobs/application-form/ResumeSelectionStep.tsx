import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, FileText, Star, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FormData, Resume } from './types';
import { toast } from "sonner";

interface ResumeSelectionStepProps {
  formData: FormData;
  onUpdate: (data: Partial<FormData>) => void;
  isMobile?: boolean;
}

const ResumeSelectionStep: React.FC<ResumeSelectionStepProps> = ({
  formData,
  onUpdate,
  isMobile = false
}) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserResumes();
  }, []);

  const fetchUserResumes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('ai_resumes')
        .select('id, title, is_primary, created_at, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setResumes(data || []);
      
      // Auto-select primary resume if available
      const primaryResume = data?.find(r => r.is_primary);
      if (primaryResume && !formData.selectedResumeId) {
        onUpdate({ selectedResumeId: primaryResume.id });
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
      toast.error('Failed to load your resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    onUpdate({ 
      uploadedResume: file,
      resumeSource: 'upload',
      selectedResumeId: '' 
    });
    toast.success('Resume uploaded successfully!');
  };

  const handleResumeSourceChange = (value: string) => {
    onUpdate({ 
      resumeSource: value as 'existing' | 'upload',
      selectedResumeId: value === 'upload' ? '' : formData.selectedResumeId,
      uploadedResume: value === 'existing' ? null : formData.uploadedResume
    });
  };

  const handleResumeSelect = (resumeId: string) => {
    onUpdate({ 
      selectedResumeId: resumeId,
      resumeSource: 'existing',
      uploadedResume: null 
    });
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">Loading your resumes...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-${isMobile ? '4' : '6'}`}>
      <div className="text-center">
        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold mb-2`}>Select Your Resume</h3>
        <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
          Choose an existing resume or upload a new one to apply for this position.
        </p>
      </div>

      <RadioGroup
        value={formData.resumeSource}
        onValueChange={handleResumeSourceChange}
        className="space-y-4"
      >
        {/* Existing Resumes Option */}
        {resumes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="existing" id="existing" />
              <Label htmlFor="existing" className="text-base font-medium">
                Use existing resume
              </Label>
            </div>
            
            {formData.resumeSource === 'existing' && (
              <div className="grid gap-3 ml-6">
                {resumes.map((resume) => (
                  <Card
                    key={resume.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      formData.selectedResumeId === resume.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : ''
                    }`}
                    onClick={() => handleResumeSelect(resume.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              {resume.title}
                              {resume.is_primary && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </h4>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(resume.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <RadioGroupItem 
                          value={resume.id} 
                          checked={formData.selectedResumeId === resume.id}
                          className="pointer-events-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload New Resume Option */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="upload" id="upload" />
            <Label htmlFor="upload" className="text-base font-medium">
              Upload new resume
            </Label>
          </div>
          
          {formData.resumeSource === 'upload' && (
            <div className="ml-6">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('resume-upload')?.click()}
                  className={`w-full ${isMobile ? 'text-sm touch-target' : 'max-w-xs'}`}
                  size={isMobile ? "lg" : "default"}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {formData.uploadedResume ? formData.uploadedResume.name : 'Choose Resume File'}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, DOC, DOCX (Max 10MB)
                </p>
              </div>
            </div>
          )}
        </div>
      </RadioGroup>

      {/* No Resumes Available */}
      {resumes.length === 0 && (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-medium mb-2">No resumes found</h4>
            <p className="text-sm text-muted-foreground mb-4">
              You don't have any resumes yet. Upload one to continue with your application.
            </p>
            <Button
              variant="outline"
              onClick={() => onUpdate({ resumeSource: 'upload' })}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Resume
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeSelectionStep;
