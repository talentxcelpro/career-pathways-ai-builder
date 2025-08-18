import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAIContentGenerator } from "@/hooks/useAIContentGenerator";
import { Sparkles, Download, Copy, Save } from "lucide-react";
import { toast } from "sonner";

export default function ContentGenerator() {
  const { generateContent, isGenerating, generationProgress } = useAIContentGenerator();
  const [formData, setFormData] = useState({
    contentType: 'blog_post' as 'job_description' | 'company_page' | 'blog_post' | 'landing_page' | 'custom',
    topic: '',
    targetAudience: '',
    tone: 'professional' as 'professional' | 'casual' | 'persuasive' | 'informative' | 'friendly',
    keywords: '',
    industry: '',
    location: '',
    wordCount: 500,
    includeSchema: false
  });
  const [generatedContent, setGeneratedContent] = useState('');
  const [metadata, setMetadata] = useState(null);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    const keywordsArray = formData.keywords 
      ? formData.keywords.split(',').map(k => k.trim()).filter(k => k)
      : [];

    const request = {
      contentType: formData.contentType,
      topic: formData.topic,
      targetAudience: formData.targetAudience || undefined,
      tone: formData.tone,
      keywords: keywordsArray.length > 0 ? keywordsArray : undefined,
      industry: formData.industry || undefined,
      location: formData.location || undefined,
      wordCount: formData.wordCount,
      includeSchema: formData.includeSchema
    };

    const result = await generateContent(request);
    
    if (result.success && result.content) {
      setGeneratedContent(result.content);
      setMetadata(result.metadata);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Content copied to clipboard');
  };

  const downloadContent = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${formData.topic.replace(/\s+/g, '_')}_content.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Content downloaded');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Content Generator</h1>
        <p className="text-muted-foreground">Create high-quality content for any purpose using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Content Settings
            </CardTitle>
            <CardDescription>Configure your content generation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={formData.contentType} onValueChange={(value) => handleInputChange('contentType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog_post">Blog Post</SelectItem>
                  <SelectItem value="job_description">Job Description</SelectItem>
                  <SelectItem value="company_page">Company Page</SelectItem>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                  <SelectItem value="custom">Custom Content</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., 'Benefits of Remote Work'"
                value={formData.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                    <SelectItem value="informative">Informative</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="wordCount">Word Count</Label>
                <Input
                  id="wordCount"
                  type="number"
                  min="100"
                  max="2000"
                  value={formData.wordCount}
                  onChange={(e) => handleInputChange('wordCount', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., 'Young professionals in tech'"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                placeholder="e.g., 'remote work, productivity, flexibility'"
                value={formData.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g., 'Technology'"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., 'San Francisco, CA'"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </div>

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Generating content...</span>
                  <span>{generationProgress}%</span>
                </div>
                <Progress value={generationProgress} />
              </div>
            )}

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !formData.topic.trim()}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </Button>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>
              Your AI-generated content will appear here
              {metadata && (
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">
                    {generatedContent.split(' ').length} words
                  </Badge>
                  {metadata.keywords && (
                    <Badge variant="outline">
                      {metadata.keywords.length} keywords
                    </Badge>
                  )}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                <Textarea
                  value={generatedContent}
                  onChange={(e) => setGeneratedContent(e.target.value)}
                  rows={20}
                  className="min-h-[400px]"
                />
                
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadContent} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </div>

                {metadata && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Title</Label>
                        <p className="text-sm">{metadata.title}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <p className="text-sm">{metadata.description}</p>
                      </div>
                      {metadata.keywords && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Keywords</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {metadata.keywords.map((keyword, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generated content will appear here</p>
                  <p className="text-sm">Fill in the form and click "Generate Content"</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}