import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, X, Sparkles, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CoverLetterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: any;
}

export const CoverLetterPanel: React.FC<CoverLetterPanelProps> = ({ 
  isOpen, 
  onClose, 
  resumeData 
}) => {
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState<'professional' | 'friendly' | 'formal'>('professional');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!jobTitle || !companyName) {
      toast.error('Please provide job title and company name');
      return;
    }

    setIsGenerating(true);
    toast.loading('Generating your cover letter...', { id: 'generate-cover-letter' });

    try {
      const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
        body: {
          resumeData,
          jobTitle,
          companyName,
          jobDescription,
          tone
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate cover letter');
      }

      setGeneratedLetter(data.coverLetter);
      toast.dismiss('generate-cover-letter');
      toast.success('Cover letter generated successfully!');
    } catch (error: any) {
      console.error('Cover letter generation error:', error);
      toast.dismiss('generate-cover-letter');
      
      if (error.message?.includes('429')) {
        toast.error('Rate limit reached. Please try again in a moment.');
      } else if (error.message?.includes('402')) {
        toast.error('AI credits exhausted. Please add credits to continue.');
      } else {
        toast.error('Failed to generate cover letter. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLetter) return;
    
    try {
      await navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      toast.success('Cover letter copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleSave = async () => {
    if (!generatedLetter) return;

    try {
      const { error } = await supabase.from('ai_cover_letters_enhanced').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        title: `${jobTitle} at ${companyName}`,
        job_title: jobTitle,
        company_name: companyName,
        content: generatedLetter,
        tone,
        ai_generated: true
      });

      if (error) throw error;
      
      toast.success('Cover letter saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save cover letter');
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <aside className="absolute right-0 top-0 h-full w-full sm:w-[640px] bg-background border-l shadow-xl flex flex-col">
        <header className="px-5 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">AI Cover Letter Generator</h2>
          </div>
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <section className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title *</Label>
              <Input
                id="job-title"
                placeholder="e.g., Senior Software Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name *</Label>
              <Input
                id="company-name"
                placeholder="e.g., Google"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job-description">Job Description (Optional)</Label>
              <Textarea
                id="job-description"
                placeholder="Paste the job description here for better targeting..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[100px]"
                disabled={isGenerating}
              />
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <div className="flex gap-2">
                {(['professional', 'friendly', 'formal'] as const).map((t) => (
                  <Button
                    key={t}
                    variant={tone === t ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTone(t)}
                    disabled={isGenerating}
                    className="capitalize"
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !jobTitle || !companyName}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Cover Letter
                </>
              )}
            </Button>
          </section>

          {generatedLetter && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Generated Cover Letter</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    disabled={!generatedLetter}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                </div>
              </div>
              <Textarea
                value={generatedLetter}
                onChange={(e) => setGeneratedLetter(e.target.value)}
                className="min-h-[400px] font-serif"
                placeholder="Your generated cover letter will appear here..."
              />
            </section>
          )}
        </main>

        <footer className="px-5 py-3 border-t flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </footer>
      </aside>
    </div>
  );
};