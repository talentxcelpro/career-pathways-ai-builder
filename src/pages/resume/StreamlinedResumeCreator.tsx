
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Plus, Sparkles, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useResumeEnhancement } from '@/hooks/useResumeEnhancement';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const StreamlinedResumeCreator: React.FC = () => {
  const [creationMode, setCreationMode] = useState<'start' | 'paste'>('start');
  const [pastedContent, setPastedContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { enhanceResumeText, isEnhancing, extractContactInfo } = useResumeEnhancement();

  const handleCreateFromScratch = async () => {
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to create a resume');
        return;
      }

      // Create a new resume with default structure
      const { data: resume, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          title: 'New Resume',
          content: {
            personalInfo: {
              fullName: '',
              email: user.email || '',
              phone: '',
              location: '',
              summary: ''
            },
            experience: [],
            education: [],
            skills: [],
            projects: [],
            certifications: [],
            awards: []
          },
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/resume/edit/${resume.id}`);
    } catch (error: any) {
      console.error('Failed to create resume:', error);
      toast.error('Failed to create resume: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateFromPaste = async () => {
    if (!pastedContent.trim()) {
      toast.error('Please paste your resume content first');
      return;
    }

    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to create a resume');
        return;
      }

      // Extract contact info from pasted content
      const contactInfo = extractContactInfo(pastedContent);
      
      // Enhance the pasted content with AI
      const enhancedSections = await enhanceResumeText(pastedContent, {
        sectionType: 'all',
        enhancementType: 'professional'
      });

      if (!enhancedSections) {
        throw new Error('Failed to process resume content');
      }

      // Create resume with enhanced content
      const resumeContent = {
        personalInfo: {
          fullName: contactInfo.name || '',
          email: contactInfo.email || user.email || '',
          phone: contactInfo.phone || '',
          location: '',
          summary: enhancedSections.summary || '',
          linkedin: contactInfo.linkedin || '',
          website: contactInfo.website || ''
        },
        experience: enhancedSections.experience ? 
          enhancedSections.experience.split('\n\n').map((exp, index) => ({
            id: `exp-${index}`,
            title: `Position ${index + 1}`,
            company: 'Company Name',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: exp.trim(),
            achievements: []
          })) : [],
        education: enhancedSections.education ?
          enhancedSections.education.split('\n').filter(Boolean).map((edu, index) => ({
            id: `edu-${index}`,
            institution: edu.trim(),
            degree: '',
            field: '',
            location: '',
            graduationDate: '',
            gpa: ''
          })) : [],
        skills: enhancedSections.skills ?
          enhancedSections.skills.split('\n').filter(Boolean).map((skill, index) => ({
            id: `skill-${index}`,
            name: skill.trim(),
            level: 'intermediate' as const,
            category: 'technical'
          })) : [],
        projects: enhancedSections.projects ?
          enhancedSections.projects.split('\n\n').map((project, index) => ({
            id: `proj-${index}`,
            title: `Project ${index + 1}`,
            description: project.trim(),
            technologies: [],
            url: '',
            github: '',
            startDate: '',
            endDate: ''
          })) : [],
        certifications: enhancedSections.certifications ?
          enhancedSections.certifications.split('\n').filter(Boolean).map((cert, index) => ({
            id: `cert-${index}`,
            name: cert.trim(),
            issuer: '',
            date: '',
            expiryDate: '',
            credentialId: '',
            url: ''
          })) : [],
        awards: enhancedSections.awards ?
          enhancedSections.awards.split('\n').filter(Boolean).map((award, index) => ({
            id: `award-${index}`,
            title: award.trim(),
            issuer: '',
            date: '',
            description: ''
          })) : []
      };

      const { data: resume, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          title: contactInfo.name ? `${contactInfo.name}'s Resume` : 'Enhanced Resume',
          content: resumeContent,
          is_public: false
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Resume created and enhanced with AI!');
      navigate(`/resume/edit/${resume.id}`);
    } catch (error: any) {
      console.error('Failed to create resume from paste:', error);
      toast.error('Failed to create resume: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (creationMode === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Create Your Resume</h1>
            <p className="text-xl text-muted-foreground">
              Choose how you'd like to get started with your professional resume
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Start from Scratch</CardTitle>
                <CardDescription>
                  Build your resume step by step with AI-powered suggestions and templates
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={handleCreateFromScratch}
                  disabled={isCreating}
                  className="w-full"
                  size="lg"
                >
                  {isCreating ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Create New Resume
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Copy className="h-8 w-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-xl">Copy & Paste Existing</CardTitle>
                <CardDescription>
                  Paste your current resume text and let AI enhance and structure it
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  onClick={() => setCreationMode('paste')}
                  variant="secondary"
                  className="w-full"
                  size="lg"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Enhance Existing Resume
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setCreationMode('start')}
            className="mb-4"
          >
            ← Back to Options
          </Button>
          <h1 className="text-3xl font-bold mb-2">Enhance Your Existing Resume</h1>
          <p className="text-muted-foreground">
            Paste your current resume content below and our AI will enhance and structure it for you
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI-Powered Resume Enhancement
            </CardTitle>
            <CardDescription>
              Copy your existing resume text from any document and paste it below. 
              Our AI will automatically structure and enhance your content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your resume content here... Include all sections like experience, education, skills, etc."
              value={pastedContent}
              onChange={(e) => setPastedContent(e.target.value)}
              className="min-h-[300px] resize-none"
            />
            
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {pastedContent.length} characters • AI will parse and enhance your content
              </p>
              <Button 
                onClick={handleCreateFromPaste}
                disabled={!pastedContent.trim() || isCreating || isEnhancing}
                size="lg"
              >
                {isCreating || isEnhancing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {isEnhancing ? 'Enhancing with AI...' : 'Creating Resume...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create & Enhance Resume
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• AI will automatically extract and structure your content</li>
            <li>• Your resume will be enhanced with professional language</li>
            <li>• You'll get access to advanced editing tools and templates</li>
            <li>• Real-time ATS scoring and optimization suggestions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
