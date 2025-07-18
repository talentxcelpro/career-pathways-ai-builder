import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useResumeUpload } from '@/hooks/useResumeUpload';

const NewResume = () => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    isProcessing, 
    uploadSuccess, 
    processingStep, 
    processingSteps, 
    processResume, 
    resetUpload 
  } = useResumeUpload();

  const handleCreateFromScratch = async () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a title for your resume.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: resume, error } = await supabase
        .from('resumes')
        .insert({ title: title.trim(), content: {} })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Resume created successfully!',
      });

      navigate(`/resume-builder/edit/${resume.id}`);
    } catch (error) {
      console.error('Error creating resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to create resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !title.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide both a title and file.',
        variant: 'destructive',
      });
      return;
    }

    // Get the file input element to access its files
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    await processResume(fileInput.files);
  };


  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/resume-builder')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resume Builder
        </Button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Resume</h1>
        <p className="text-muted-foreground">
          Start from scratch or upload your existing resume to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create from Scratch */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Start from Scratch</CardTitle>
            <CardDescription>
              Build your resume step by step with AI-powered suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title-scratch">Resume Title</Label>
              <Input
                id="title-scratch"
                placeholder="e.g., Software Engineer Resume"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <Button
              onClick={handleCreateFromScratch}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating...' : 'Create Resume'}
            </Button>
          </CardContent>
        </Card>

        {/* Upload Resume */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Upload Existing Resume</CardTitle>
            <CardDescription>
              Upload your resume and let AI extract and enhance the content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title-upload">Resume Title</Label>
              <Input
                id="title-upload"
                placeholder="e.g., My Professional Resume"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="file-upload">Upload File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Supported formats: PDF, DOC, DOCX, TXT
              </p>
            </div>
            <Button
              onClick={handleFileUpload}
              disabled={isProcessing || !file}
              className="w-full"
            >
              {isProcessing ? `${processingSteps[processingStep]}...` : 'Upload & Process'}
            </Button>
            {isProcessing && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Step {processingStep + 1} of {processingSteps.length}: {processingSteps[processingStep]}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Both options will create an AI-powered resume with optimization suggestions
        </p>
      </div>
    </div>
  );
};

export default NewResume;