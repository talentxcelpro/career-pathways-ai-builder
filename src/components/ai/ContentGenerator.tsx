import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAIContentGenerator } from '@/hooks/useAIContentGenerator';
import { Sparkles, Copy, Download, Save } from 'lucide-react';
import { toast } from 'sonner';

const contentTypes = [
  { value: 'job_description', label: 'Job Description', description: 'Compelling job postings that attract talent' },
  { value: 'company_page', label: 'Company Page', description: 'Engaging company profiles and about pages' },
  { value: 'blog_post', label: 'Blog Post', description: 'SEO-optimized articles and thought leadership' },
  { value: 'landing_page', label: 'Landing Page', description: 'High-converting marketing pages' },
  { value: 'custom', label: 'Custom Content', description: 'Any other type of content' }
];

const tones = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'persuasive', label: 'Persuasive' },
  { value: 'informative', label: 'Informative' },
  { value: 'friendly', label: 'Friendly' }
];

export const ContentGenerator = () => {
  const { generateContent, isGenerating, generationProgress } = useAIContentGenerator();
  
  const [formData, setFormData] = useState({
    contentType: '',
    topic: '',
    targetAudience: '',
    tone: 'professional',
    keywords: '',
    industry: '',
    location: '',
    wordCount: 500
  });
  
  const [generatedContent, setGeneratedContent] = useState('');
  const [seoMetadata, setSeoMetadata] = useState(null);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.contentType || !formData.topic) {
      toast.error('Please fill in content type and topic');
      return;
    }

    const keywords = formData.keywords.split(',').map(k => k.trim()).filter(k => k);
    
    const result = await generateContent({
      contentType: formData.contentType as any,
      topic: formData.topic,
      targetAudience: formData.targetAudience,
      tone: formData.tone as any,
      keywords,
      industry: formData.industry,
      location: formData.location,
      wordCount: formData.wordCount
    });

    if (result.success) {
      setGeneratedContent(result.content || '');
      setSeoMetadata(result.metadata || null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Content copied to clipboard!');
  };

  const downloadContent = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.topic.replace(/\s+/g, '_')}_content.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Content downloaded!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Content Generator
          </CardTitle>
          <CardDescription>
            Generate high-quality, SEO-optimized content for any purpose
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentTypes.map((type) => (
              <Card 
                key={type.value}
                className={`cursor-pointer transition-all hover:border-primary ${
                  formData.contentType === type.value ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => handleInputChange('contentType', type.value)}
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold">{type.label}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {formData.contentType && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic">Topic / Subject *</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Senior React Developer, About TechCorp, Content Marketing Tips"
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    placeholder="e.g., Job seekers, Developers, Marketing professionals"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="tone">Tone & Style</Label>
                  <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tones.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Right Column - Advanced Options */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="keywords">SEO Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    placeholder="e.g., remote work, react developer, tech jobs"
                    value={formData.keywords}
                    onChange={(e) => handleInputChange('keywords', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      placeholder="e.g., Technology, Healthcare"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Remote, New York"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="wordCount">Target Word Count</Label>
                  <Select 
                    value={formData.wordCount.toString()} 
                    onValueChange={(value) => handleInputChange('wordCount', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">300 words</SelectItem>
                      <SelectItem value="500">500 words</SelectItem>
                      <SelectItem value="750">750 words</SelectItem>
                      <SelectItem value="1000">1000 words</SelectItem>
                      <SelectItem value="1500">1500 words</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {formData.contentType && (
            <div className="flex justify-center">
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !formData.topic}
                size="lg"
                className="min-w-[200px]"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={generationProgress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                Generating your content...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Content</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadContent}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* SEO Metadata */}
            {seoMetadata && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">SEO Metadata</h4>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Title:</span> {seoMetadata.title}
                  </div>
                  <div>
                    <span className="font-medium">Description:</span> {seoMetadata.description}
                  </div>
                  {seoMetadata.keywords && (
                    <div>
                      <span className="font-medium">Keywords:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {seoMetadata.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <Textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Generated content will appear here..."
            />
            
            <div className="mt-4 text-sm text-muted-foreground">
              Word count: {generatedContent.split(' ').filter(word => word.length > 0).length} words
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};