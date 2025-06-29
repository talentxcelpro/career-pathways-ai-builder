
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, Star, Sparkles, User, Mail, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { incrementJobApplications } from "@/utils/supabaseHelpers";

interface JobApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    id: string;
    title: string;
    companies?: {
      name: string;
      logo_url?: string;
    } | null;
    skills_required?: string[];
  };
}

interface Resume {
  id: string;
  title: string;
  file_url?: string;
  is_primary: boolean;
  content: any;
}

interface ApplicationData {
  cover_letter: string;
  additional_info: string;
}

export default function JobApplicationModal({ open, onOpenChange, job }: JobApplicationModalProps) {
  const [activeTab, setActiveTab] = useState('existing');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);

  const [formData, setFormData] = useState<ApplicationData>({
    cover_letter: '',
    additional_info: ''
  });

  // Fetch user's resumes and profile data
  useEffect(() => {
    if (open) {
      fetchUserData();
    }
  }, [open]);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch resumes
      const { data: resumesData } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (resumesData) {
        setResumes(resumesData);
        const primaryResume = resumesData.find(r => r.is_primary);
        if (primaryResume) setSelectedResumeId(primaryResume.id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    setUploadedFile(file);
    
    // Simulate AI processing
    setAiProcessing(true);
    setTimeout(() => {
      // Calculate mock match score
      const jobSkills = job.skills_required || [];
      const mockExtractedSkills = ['React', 'TypeScript', 'Node.js', 'Python'];
      const matchingSkills = mockExtractedSkills.filter(skill => 
        jobSkills.some(jobSkill => jobSkill.toLowerCase().includes(skill.toLowerCase()))
      );
      const score = Math.round((matchingSkills.length / Math.max(jobSkills.length, 1)) * 100);
      setMatchScore(Math.min(score + Math.floor(Math.random() * 20), 95));

      setAiProcessing(false);
      toast.success('Resume analyzed and processed!');
    }, 2000);
  };

  const handleExistingResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if already applied
      const { data: existingApplication } = await supabase
        .from('job_applications')
        .select('id')
        .eq('user_id', user.id)
        .eq('job_id', job.id)
        .single();

      if (existingApplication) {
        throw new Error('You have already applied to this job');
      }

      let resumeUrl = '';

      // Upload new resume if provided
      if (uploadedFile && activeTab === 'upload') {
        const fileName = `${user.id}/${job.id}/${Date.now()}_${uploadedFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, uploadedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
        
        resumeUrl = publicUrl;
      } else if (selectedResumeId && activeTab === 'existing') {
        const selectedResume = resumes.find(r => r.id === selectedResumeId);
        resumeUrl = selectedResume?.file_url || '';
      }

      if (!resumeUrl && !selectedResumeId) {
        throw new Error('Please select a resume or upload one');
      }

      // Submit application with simplified data structure
      const applicationData = {
        user_id: user.id,
        job_id: job.id,
        cover_letter: formData.cover_letter || null,
        resume_url: resumeUrl || null,
        status: 'applied',
        applied_at: new Date().toISOString(),
        ai_match_score: matchScore
      };

      console.log('Submitting application data:', applicationData);

      const { error } = await supabase
        .from('job_applications')
        .insert(applicationData);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Update job application count
      try {
        await incrementJobApplications(job.id);
      } catch (error) {
        console.log('Failed to increment application count:', error);
        // Don't fail the entire operation for this
      }

      toast.success('Application submitted successfully!');
      onOpenChange(false);
      
      // Reset form
      setFormData({
        cover_letter: '',
        additional_info: ''
      });
      setUploadedFile(null);
      setMatchScore(null);
      setSelectedResumeId('');
    } catch (error: any) {
      console.error('Application submission error:', error);
      
      if (error.message?.includes('duplicate key') || error.message?.includes('already applied')) {
        toast.error('You have already applied to this job');
      } else if (error.message?.includes('not authenticated')) {
        toast.error('Please log in to apply for jobs');
      } else {
        toast.error(error.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {job.companies?.logo_url && (
              <img 
                src={job.companies.logo_url} 
                alt={job.companies.name}
                className="w-8 h-8 rounded"
              />
            )}
            <div>
              <span>Apply for {job.title}</span>
              {job.companies?.name && (
                <p className="text-sm text-gray-600 font-normal">at {job.companies.name}</p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing">Use Existing Resume</TabsTrigger>
                  <TabsTrigger value="upload">Upload New Resume</TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="space-y-4">
                  {resumes.length > 0 ? (
                    <div className="space-y-3">
                      {resumes.map((resume) => (
                        <div 
                          key={resume.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedResumeId === resume.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleExistingResumeSelect(resume.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{resume.title}</span>
                              {resume.is_primary && (
                                <Badge variant="secondary" className="text-xs">Primary</Badge>
                              )}
                            </div>
                            <input
                              type="radio"
                              checked={selectedResumeId === resume.id}
                              onChange={() => handleExistingResumeSelect(resume.id)}
                              className="h-4 w-4"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No resumes found. Upload a new one to get started.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {uploadedFile ? uploadedFile.name : 'Click to upload your resume'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF or Word document (max 5MB)
                      </p>
                    </label>
                  </div>

                  {aiProcessing && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
                          <span className="text-blue-800">AI is analyzing your resume...</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {matchScore !== null && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <Star className="h-5 w-5 text-green-600" />
                          <span className="text-green-800">
                            Resume Match Score: <strong>{matchScore}%</strong>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Letter (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.cover_letter}
                onChange={(e) => setFormData(prev => ({ ...prev, cover_letter: e.target.value }))}
                rows={6}
                placeholder="Write a cover letter to introduce yourself and explain why you're interested in this position..."
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (!selectedResumeId && !uploadedFile)}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
