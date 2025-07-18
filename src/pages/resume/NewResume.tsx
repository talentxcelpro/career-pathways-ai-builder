import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const NewResume = () => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
        .insert([{ title: title.trim(), content: {} }])
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

    setLoading(true);
    try {
      // Create the resume first
      const { data: resume, error: resumeError } = await supabase
        .from('resumes')
        .insert([{ title: title.trim(), content: {} }])
        .select()
        .single();

      if (resumeError) throw resumeError;

      // Extract text from file
      const fileText = await extractTextFromFile(file);
      
      // Call extract-resume function
      const { data: extractedData, error: extractError } = await supabase.functions
        .invoke('extract-resume', {
          body: {
            resumeText: fileText,
            userId: (await supabase.auth.getUser()).data.user?.id
          }
        });

      if (extractError) throw extractError;

      if (extractedData.success) {
        // Save the extracted data to resume sections
        const sectionsToInsert = Object.entries(extractedData.data).map(([sectionType, data]) => ({
          resume_id: resume.id,
          section_type: sectionType,
          content: data as any,
          display_order: getSectionOrder(sectionType)
        }));

        await supabase
          .from('resume_sections')
          .insert(sectionsToInsert);

        toast({
          title: 'Success',
          description: 'Resume uploaded and processed successfully!',
        });

        navigate(`/resume-builder/edit/${resume.id}`);
      } else {
        throw new Error('Failed to extract resume data');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const getSectionOrder = (section: string): number => {
    const order = {
      personal_info: 1,
      summary: 2,
      experience: 3,
      education: 4,
      skills: 5,
      certifications: 6,
      projects: 7,
      languages: 8,
      awards: 9,
      hobbies: 10
    };
    return order[section as keyof typeof order] || 99;
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
              disabled={loading || !file}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Upload & Process'}
            </Button>
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