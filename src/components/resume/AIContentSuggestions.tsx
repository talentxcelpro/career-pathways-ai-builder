import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Wand2, Target, Copy, RefreshCw, Lightbulb } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

interface AIContentSuggestionsProps {
  resumeData: any;
  onContentGenerated: (content: string, type: string, sectionIndex?: number) => void;
}

export const AIContentSuggestions: React.FC<AIContentSuggestionsProps> = ({
  resumeData,
  onContentGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [contentType, setContentType] = useState('summary');
  const [selectedSection, setSelectedSection] = useState(0);

  const generateContent = async (type: string, sectionData?: any, sectionIndex?: number) => {
    if (!type) return;

    setIsGenerating(true);
    setContentType(type);

    try {
      const { data, error } = await supabase.functions.invoke('ai-resume-content', {
        body: {
          type,
          data: sectionData || resumeData,
          jobDescription,
          industry,
          role: targetRole
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      toast.success('AI content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyGeneratedContent = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent, contentType, selectedSection);
      setGeneratedContent('');
      toast.success('Content applied to your resume!');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Content copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Job Context Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Job Context (Optional)
          </CardTitle>
          <CardDescription>
            Provide job details for more targeted content suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Target Role</label>
              <Input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Software Engineer, Marketing Manager"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Job Description</label>
            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here for more targeted suggestions..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Generation Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Content Generation
          </CardTitle>
          <CardDescription>
            Generate professional content for different resume sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              onClick={() => generateContent('summary')}
              disabled={isGenerating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Wand2 className="h-4 w-4" />
              Generate Summary
            </Button>

            <Button
              onClick={() => generateContent('skills')}
              disabled={isGenerating}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              Suggest Skills
            </Button>

            {resumeData.experience?.length > 0 && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Enhance Experience</label>
                <div className="flex gap-2">
                  <Select value={selectedSection.toString()} onValueChange={(value) => setSelectedSection(parseInt(value))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resumeData.experience.map((exp: any, index: number) => (
                        <SelectItem key={index} value={index.toString()}>
                          {exp.position || exp.title} at {exp.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => generateContent('experience', resumeData.experience[selectedSection], selectedSection)}
                    disabled={isGenerating}
                    variant="outline"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Enhance
                  </Button>
                </div>
              </div>
            )}

            {resumeData.projects?.length > 0 && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Enhance Projects</label>
                <div className="flex gap-2">
                  <Select value={selectedSection.toString()} onValueChange={(value) => setSelectedSection(parseInt(value))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resumeData.projects.map((project: any, index: number) => (
                        <SelectItem key={index} value={index.toString()}>
                          {project.title || `Project ${index + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => generateContent('projects', resumeData.projects[selectedSection], selectedSection)}
                    disabled={isGenerating}
                    variant="outline"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Enhance
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generated Content Display */}
      {(generatedContent || isGenerating) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generated Content
              <Badge variant="secondary">{contentType}</Badge>
            </CardTitle>
            <CardDescription>
              Review and apply the AI-generated content to your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Generating content...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {generatedContent}
                  </pre>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={applyGeneratedContent} className="flex-1">
                    Apply to Resume
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button 
                    onClick={() => generateContent(contentType, 
                      contentType === 'experience' ? resumeData.experience[selectedSection] :
                      contentType === 'projects' ? resumeData.projects[selectedSection] :
                      resumeData, selectedSection)}
                    variant="outline"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};