import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Copy, RefreshCw, Linkedin, Mail, FileText } from 'lucide-react';
import { useAIContentGenerator } from '@/hooks/useAIContentGenerator';
import { toast } from 'sonner';

interface GeneratePostModuleProps {
  onResult: (message: string) => void;
  userProfile?: any;
}

export const GeneratePostModule: React.FC<GeneratePostModuleProps> = ({ onResult, userProfile }) => {
  const [contentType, setContentType] = useState<'linkedin_post' | 'outreach_email' | 'project_summary'>('linkedin_post');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'enthusiastic' | 'formal'>('professional');
  const [context, setContext] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [variations, setVariations] = useState<string[]>([]);
  const { generateContent, isGenerating } = useAIContentGenerator();

  const contentTemplates = {
    linkedin_post: {
      title: 'LinkedIn Post',
      icon: <Linkedin className="w-4 h-4" />,
      placeholder: 'e.g., Career milestone, Project launch, Industry insights',
      contextPlaceholder: 'Additional context about your achievement, project, or thoughts...'
    },
    outreach_email: {
      title: 'Outreach Email',
      icon: <Mail className="w-4 h-4" />,
      placeholder: 'e.g., Networking, Job inquiry, Partnership proposal',
      contextPlaceholder: 'Recipient details, your goal, and any relevant background...'
    },
    project_summary: {
      title: 'Project Summary',
      icon: <FileText className="w-4 h-4" />,
      placeholder: 'e.g., App development, Research project, Campaign results',
      contextPlaceholder: 'Project details, technologies used, challenges overcome, results achieved...'
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please provide a topic or theme for your content.');
      return;
    }

    try {
      const request = {
        contentType: 'custom' as const,
        topic,
        tone: tone as 'professional' | 'casual' | 'persuasive' | 'informative' | 'friendly',
        keywords: [topic],
        targetAudience: 'professionals',
        additionalContext: context,
        userProfile: userProfile ? {
          name: userProfile.name,
          role: userProfile.title,
          industry: userProfile.industry
        } : undefined
      };

      const result = await generateContent(request);
      
      if (result.success && result.content) {
        setGeneratedContent(result.content);
        // Generate 2 additional variations
        const variations = await Promise.all([
          generateContent({ ...request, tone: tone === 'professional' ? 'casual' : 'professional' }),
          generateContent({ ...request, tone: 'enthusiastic' })
        ]);
        
        setVariations(variations.filter(v => v.success).map(v => v.content || ''));
        onResult(`${contentTemplates[contentType].title} generated successfully! ${result.wordCount} words, ${result.tokensUsed} tokens used.`);
      }
    } catch (error) {
      toast.error('Content generation failed. Please try again.');
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  const regenerateContent = () => {
    setGeneratedContent('');
    setVariations([]);
    handleGenerate();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          AI Content Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Content Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Content Type</label>
          <Tabs value={contentType} onValueChange={(value) => setContentType(value as typeof contentType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="linkedin_post" className="flex items-center gap-2">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </TabsTrigger>
              <TabsTrigger value="outreach_email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </TabsTrigger>
              <TabsTrigger value="project_summary" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Summary
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Topic Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Topic/Theme</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={contentTemplates[contentType].placeholder}
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Tone Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tone</label>
          <div className="flex gap-2 flex-wrap">
            {['professional', 'casual', 'enthusiastic', 'formal'].map((toneOption) => (
              <Button
                key={toneOption}
                variant={tone === toneOption ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTone(toneOption as typeof tone)}
              >
                {toneOption.charAt(0).toUpperCase() + toneOption.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Context Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Context</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={contentTemplates[contentType].contextPlaceholder}
            className="w-full h-24 p-3 border rounded-md resize-none"
          />
        </div>

        {/* Generate Button */}
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating || !topic.trim()}
          className="w-full"
        >
          {isGenerating ? 'Generating Content...' : `Generate ${contentTemplates[contentType].title}`}
        </Button>

        {/* Generated Content */}
        {generatedContent && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Generated Content</h4>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={regenerateContent}>
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedContent)}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-4 border rounded-lg bg-background">
              <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
            </div>

            {/* Content Stats */}
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Words: {generatedContent.split(' ').length}</span>
              <span>Characters: {generatedContent.length}</span>
              <Badge variant="outline">{tone}</Badge>
            </div>

            {/* Variations */}
            {variations.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Alternative Versions</h4>
                {variations.map((variation, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Variation {index + 1}</span>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(variation)}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="p-3 border rounded-lg bg-muted text-sm">
                      <pre className="whitespace-pre-wrap">{variation.substring(0, 200)}...</pre>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Usage Tips */}
            <div className="space-y-2">
              <h4 className="font-medium">Usage Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {contentType === 'linkedin_post' && (
                  <>
                    <li>• Add relevant hashtags to increase visibility</li>
                    <li>• Tag relevant people or companies when appropriate</li>
                    <li>• Post during peak engagement hours (9-10 AM, 12-1 PM)</li>
                  </>
                )}
                {contentType === 'outreach_email' && (
                  <>
                    <li>• Personalize the subject line for better open rates</li>
                    <li>• Keep it concise and action-oriented</li>
                    <li>• Include a clear call-to-action</li>
                  </>
                )}
                {contentType === 'project_summary' && (
                  <>
                    <li>• Include quantifiable results and metrics</li>
                    <li>• Highlight key technologies and methodologies</li>
                    <li>• Mention challenges overcome and lessons learned</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};