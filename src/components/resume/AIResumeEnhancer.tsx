import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, Download, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIResumeEnhancerProps {
  resumeData: any;
  onEnhancementApplied: (enhancedData: any) => void;
}

const ENHANCEMENT_PROMPTS = {
  general: {
    title: "🔧 General Enhancement",
    prompts: [
      "Enhance my resume to sound more professional and impactful.",
      "Rewrite this resume to better highlight achievements and results.",
      "Improve this resume for clarity, conciseness, and formatting.",
      "Make my resume sound confident, modern, and action-driven.",
      "Improve the grammar, vocabulary, and flow of my resume."
    ]
  },
  jobSpecific: {
    title: "🎯 Job-Specific Tailoring",
    prompts: [
      "Tailor my resume for a [Job Title] role at [Company Name].",
      "Match my resume to this job description for better alignment.",
      "Optimize this resume for a [Remote/Hybrid/Onsite] [Job Title] role.",
      "Highlight relevant experience for this job posting.",
      "Customize key sections for maximum job relevance."
    ]
  },
  ats: {
    title: "📈 ATS Optimization",
    prompts: [
      "Rewrite my resume to be ATS-friendly and keyword optimized.",
      "Add relevant industry keywords for better ATS scoring.",
      "Identify and fix potential ATS compatibility issues.",
      "Score this resume for ATS compatibility and suggest fixes.",
      "Optimize formatting and keywords for applicant tracking systems."
    ]
  },
  achievements: {
    title: "🚀 Achievement & Impact Focus",
    prompts: [
      "Convert responsibilities into achievement-focused bullet points.",
      "Add quantifiable metrics to strengthen impact statements.",
      "Rewrite experience to emphasize outcomes, not just duties.",
      "Use the STAR method to enhance work experience descriptions.",
      "Transform job duties into compelling accomplishment stories."
    ]
  },
  fresher: {
    title: "🎓 Fresher & Student",
    prompts: [
      "Help me write a compelling resume with limited work experience.",
      "Enhance academic projects and internships for a fresher resume.",
      "Create a strong resume summary for a recent graduate.",
      "Suggest skills and sections to stand out as a new graduate.",
      "Optimize resume for entry-level positions in my field."
    ]
  },
  skills: {
    title: "🧠 Skills & Strengths",
    prompts: [
      "Strengthen the soft skills presentation throughout this resume.",
      "Better integrate leadership, communication, and teamwork skills.",
      "Enhance technical skills section with proper categorization.",
      "Improve presentation of problem-solving and analytical abilities.",
      "Balance technical and soft skills for maximum impact."
    ]
  },
  design: {
    title: "✨ Design & Structure",
    prompts: [
      "Suggest better structure for a modern, professional resume.",
      "Provide layout recommendations for optimal readability.",
      "Optimize section ordering and content hierarchy.",
      "Create clean, impactful one-page resume suggestions.",
      "Improve visual flow and professional formatting."
    ]
  },
  review: {
    title: "🔍 Review & Feedback",
    prompts: [
      "Review this resume and provide detailed improvement suggestions.",
      "Score this resume for tone, formatting, and clarity (0-10 scale).",
      "Act as a recruiter and give honest feedback on this resume.",
      "Identify weak points and suggest specific improvements.",
      "Provide comprehensive resume critique with actionable advice."
    ]
  }
};

export const AIResumeEnhancer: React.FC<AIResumeEnhancerProps> = ({
  resumeData,
  onEnhancementApplied
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<string>('');

  const handleEnhance = async () => {
    if (!selectedPrompt && !customPrompt) {
      toast.error('Please select a prompt or write a custom one');
      return;
    }

    setIsEnhancing(true);
    
    try {
      const promptToUse = customPrompt || selectedPrompt;
      const resumeText = JSON.stringify(resumeData, null, 2);
      
      const enhancementContext = jobDescription 
        ? `Job Description: ${jobDescription}\n\nResume to enhance: ${resumeText}`
        : `Resume to enhance: ${resumeText}`;

      const { data, error } = await supabase.functions.invoke('enhance-resume', {
        body: {
          text: enhancementContext,
          provider: 'deepseek'
        }
      });

      if (error) throw error;

      setEnhancedResult(data.enhancement);
      toast.success('Resume enhanced successfully!');
      
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error('Failed to enhance resume. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(enhancedResult);
    toast.success('Enhancement copied to clipboard!');
  };

  const applyEnhancement = () => {
    try {
      // Try to parse if it's JSON, otherwise treat as text feedback
      let parsedEnhancement;
      try {
        parsedEnhancement = JSON.parse(enhancedResult);
        onEnhancementApplied(parsedEnhancement);
        toast.success('Enhancement applied to resume!');
      } catch {
        // If not JSON, show as feedback
        toast.success('Enhancement feedback received. Please apply changes manually.');
      }
    } catch (error) {
      toast.error('Failed to apply enhancement');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Resume Enhancement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Enhancement Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Choose enhancement type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ENHANCEMENT_PROMPTS).map(([key, category]) => (
                  <SelectItem key={key} value={key}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Selection */}
          {selectedCategory && (
            <div>
              <label className="text-sm font-medium mb-2 block">Select Enhancement Prompt</label>
              <div className="grid gap-2">
                {ENHANCEMENT_PROMPTS[selectedCategory as keyof typeof ENHANCEMENT_PROMPTS].prompts.map((prompt, index) => (
                  <Badge
                    key={index}
                    variant={selectedPrompt === prompt ? "default" : "outline"}
                    className="cursor-pointer p-2 text-sm justify-start h-auto"
                    onClick={() => setSelectedPrompt(prompt)}
                  >
                    {prompt}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Job Description for Job-Specific Prompts */}
          {selectedCategory === 'jobSpecific' && (
            <div>
              <label className="text-sm font-medium mb-2 block">Job Description (Optional)</label>
              <Textarea
                placeholder="Paste the job description here for better tailoring..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {/* Custom Prompt */}
          <div>
            <label className="text-sm font-medium mb-2 block">Custom Enhancement Prompt</label>
            <Textarea
              placeholder="Or write your own enhancement request..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleEnhance}
            disabled={isEnhancing || (!selectedPrompt && !customPrompt)}
            className="w-full"
          >
            {isEnhancing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enhancing Resume...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Enhance Resume
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Enhancement Result */}
      {enhancedResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Enhanced Resume
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" onClick={applyEnhancement}>
                  <Download className="h-4 w-4 mr-1" />
                  Apply
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{enhancedResult}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};