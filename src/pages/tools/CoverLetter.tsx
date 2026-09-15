import React, { useState } from 'react';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface JobInfo {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  requirements: string;
}

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  experience: string;
  skills: string;
  achievements: string;
}

const CoverLetter = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [jobInfo, setJobInfo] = useState<JobInfo>({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    requirements: ''
  });
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    email: '',
    phone: '',
    experience: '',
    skills: '',
    achievements: ''
  });
  const [tone, setTone] = useState('professional');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCoverLetter = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          contentType: 'cover_letter',
          topic: `Cover letter for ${jobInfo.jobTitle} at ${jobInfo.companyName}`,
          targetAudience: 'hiring_manager',
          tone: tone,
          keywords: [jobInfo.jobTitle, jobInfo.companyName],
          additionalContext: {
            jobInfo,
            personalInfo,
            tone
          }
        }
      });

      if (error) throw error;
      
      setGeneratedLetter(data.content);
      setCurrentStep(3);
      toast.success('Cover letter generated successfully!');
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error('Failed to generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLetter);
    toast.success('Cover letter copied to clipboard!');
  };

  const downloadAsDoc = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${jobInfo.companyName}_${jobInfo.jobTitle}_CoverLetter.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Cover letter downloaded!');
  };

  const toneOptions = [
    { value: 'professional', label: 'Professional', desc: 'Formal and business-appropriate' },
    { value: 'enthusiastic', label: 'Enthusiastic', desc: 'Energetic and passionate' },
    { value: 'confident', label: 'Confident', desc: 'Bold and assertive' },
    { value: 'friendly', label: 'Friendly', desc: 'Warm and approachable' }
  ];

  const steps = [
    {
      id: 'job-info',
      title: 'Job Information',
      description: 'Tell us about the position you\'re applying for',
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Job Title *
              </label>
              <Input
                value={jobInfo.jobTitle}
                onChange={(e) => setJobInfo({ ...jobInfo, jobTitle: e.target.value })}
                placeholder="e.g., Software Engineer"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Company Name *
              </label>
              <Input
                value={jobInfo.companyName}
                onChange={(e) => setJobInfo({ ...jobInfo, companyName: e.target.value })}
                placeholder="e.g., TechCorp Inc."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Job Description
            </label>
            <Textarea
              value={jobInfo.jobDescription}
              onChange={(e) => setJobInfo({ ...jobInfo, jobDescription: e.target.value })}
              placeholder="Paste the job description here..."
              className="h-32"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Key Requirements
            </label>
            <Textarea
              value={jobInfo.requirements}
              onChange={(e) => setJobInfo({ ...jobInfo, requirements: e.target.value })}
              placeholder="List the key requirements from the job posting..."
              className="h-24"
            />
          </div>

          <Button
            onClick={() => setCurrentStep(1)}
            className="w-full"
            disabled={!jobInfo.jobTitle || !jobInfo.companyName}
          >
            Continue to Personal Information
          </Button>
        </div>
      )
    },
    {
      id: 'personal-info',
      title: 'Your Information',
      description: 'Add your personal details and experience',
      component: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name *
              </label>
              <Input
                value={personalInfo.fullName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email *
              </label>
              <Input
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone
              </label>
              <Input
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Relevant Experience
            </label>
            <Textarea
              value={personalInfo.experience}
              onChange={(e) => setPersonalInfo({ ...personalInfo, experience: e.target.value })}
              placeholder="Describe your relevant work experience..."
              className="h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Key Skills
            </label>
            <Textarea
              value={personalInfo.skills}
              onChange={(e) => setPersonalInfo({ ...personalInfo, skills: e.target.value })}
              placeholder="List your key skills relevant to this position..."
              className="h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Key Achievements
            </label>
            <Textarea
              value={personalInfo.achievements}
              onChange={(e) => setPersonalInfo({ ...personalInfo, achievements: e.target.value })}
              placeholder="Highlight your notable achievements..."
              className="h-20"
            />
          </div>

          <Button
            onClick={() => setCurrentStep(2)}
            className="w-full"
            disabled={!personalInfo.fullName || !personalInfo.email}
          >
            Continue to Customization
          </Button>
        </div>
      )
    },
    {
      id: 'customize',
      title: 'Customize Style',
      description: 'Choose the tone and style for your cover letter',
      component: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-4">
              Select Tone & Style
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {toneOptions.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all duration-200 ${
                    tone === option.value
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setTone(option.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{option.label}</h3>
                      {tone === option.value && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{option.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Preview Information</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Position:</strong> {jobInfo.jobTitle} at {jobInfo.companyName}</p>
                <p><strong>Applicant:</strong> {personalInfo.fullName}</p>
                <p><strong>Tone:</strong> {toneOptions.find(t => t.value === tone)?.label}</p>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={generateCoverLetter}
            className="w-full"
            size="lg"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating Cover Letter...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Cover Letter
              </>
            )}
          </Button>
        </div>
      )
    },
    {
      id: 'result',
      title: 'Your Cover Letter',
      description: 'Review and customize your generated cover letter',
      component: generatedLetter ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated Cover Letter</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadAsDoc}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                  {generatedLetter}
                </pre>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold text-green-800">Professional Format</p>
                <p className="text-sm text-green-600">Industry-standard structure</p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Sparkles className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-blue-800">AI-Optimized</p>
                <p className="text-sm text-blue-600">Tailored to job requirements</p>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <Badge className="h-8 w-8 bg-purple-600 mx-auto mb-2 flex items-center justify-center">
                  ATS
                </Badge>
                <p className="font-semibold text-purple-800">ATS-Friendly</p>
                <p className="text-sm text-purple-600">Passes tracking systems</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Pro Tips</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Customize the opening paragraph to match the company culture</li>
                <li>• Add specific examples that demonstrate your achievements</li>
                <li>• Keep the letter to one page for maximum impact</li>
                <li>• Proofread carefully before submitting</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : null
    }
  ];

  return (
    <ToolLayout
      title="AI Cover Letter Generator"
      description="Create compelling, personalized cover letters tailored to specific job applications using AI. Stand out from the competition with professionally crafted content."
      category="resume"
      estimatedTime="8-12 min"
      popularity={85}
      steps={steps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      results={generatedLetter}
      isProcessing={isGenerating}
      onSave={() => toast.success('Cover letter saved to your dashboard!')}
      onExport={downloadAsDoc}
      onShare={() => {
        navigator.clipboard.writeText(generatedLetter);
        toast.success('Cover letter copied to clipboard!');
      }}
    />
  );
};

export default CoverLetter;