import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  PenTool, 
  FileText, 
  Target, 
  Zap, 
  Download,
  Copy,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

interface ContentGenerationRequest {
  contentType: 'blog_post' | 'landing_page' | 'meta_tags' | 'product_description' | 'article';
  topic: string;
  targetKeywords: string[];
  audience?: string;
  tone?: 'professional' | 'casual' | 'technical' | 'friendly';
  wordCount?: number;
  industry?: string;
  includeSchema?: boolean;
}

export const AIContentGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [formData, setFormData] = useState<ContentGenerationRequest>({
    contentType: 'blog_post',
    topic: '',
    targetKeywords: [],
    audience: 'general',
    tone: 'professional',
    wordCount: 800,
    industry: 'technology',
    includeSchema: true
  });
  const [keywordInput, setKeywordInput] = useState('');

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.targetKeywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        targetKeywords: [...prev.targetKeywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      targetKeywords: prev.targetKeywords.filter(k => k !== keyword)
    }));
  };

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    if (formData.targetKeywords.length === 0) {
      toast.error('Please add at least one target keyword');
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-seo-content-generator', {
        body: formData
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedContent(data.content);
        toast.success('Content generated successfully!');
      } else {
        throw new Error(data.error || 'Content generation failed');
      }
    } catch (error: any) {
      console.error('Content generation error:', error);
      toast.error(`Failed to generate content: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const downloadContent = () => {
    if (!generatedContent) return;
    
    const content = `# ${generatedContent.title}

## Meta Information
**Title:** ${generatedContent.metaTitle}
**Description:** ${generatedContent.metaDescription}
**Keywords:** ${generatedContent.keywords.join(', ')}

## Content
${generatedContent.body}

## SEO Analysis
- **Readability Score:** ${generatedContent.readabilityScore}/100
- **SEO Score:** ${generatedContent.seoScore}/100
- **Word Count:** ${generatedContent.wordCount}

${generatedContent.structuredData ? `## Structured Data\n\`\`\`json\n${JSON.stringify(generatedContent.structuredData, null, 2)}\n\`\`\`` : ''}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.topic.replace(/\s+/g, '-').toLowerCase()}-content.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            AI Content Generator
          </CardTitle>
          <CardDescription>
            Generate SEO-optimized content using advanced AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <Select
                value={formData.contentType}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, contentType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog_post">Blog Post</SelectItem>
                  <SelectItem value="landing_page">Landing Page</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="product_description">Product Description</SelectItem>
                  <SelectItem value="meta_tags">Meta Tags Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tone</label>
              <Select
                value={formData.tone}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, tone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Word Count</label>
              <Input
                type="number"
                value={formData.wordCount}
                onChange={(e) => setFormData(prev => ({ ...prev, wordCount: parseInt(e.target.value) }))}
                min="300"
                max="3000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Topic</label>
            <Input
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="e.g., AI in Digital Marketing"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Keywords</label>
            <div className="flex gap-2">
              <Input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="Add keyword"
                onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              />
              <Button onClick={handleAddKeyword} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.targetKeywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveKeyword(keyword)}>
                  {keyword} ×
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <PenTool className="h-4 w-4 mr-2" />
                Generate AI Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Content
              </div>
              <div className="flex gap-2">
                <Button onClick={() => copyToClipboard(generatedContent.body)} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button onClick={downloadContent} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* SEO Scores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SEO Score</span>
                  <span className="text-sm">{generatedContent.seoScore}/100</span>
                </div>
                <Progress value={generatedContent.seoScore} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Readability</span>
                  <span className="text-sm">{generatedContent.readabilityScore}/100</span>
                </div>
                <Progress value={generatedContent.readabilityScore} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Word Count</span>
                  <span className="text-sm">{generatedContent.wordCount}</span>
                </div>
                <Progress value={(generatedContent.wordCount / formData.wordCount!) * 100} className="h-2" />
              </div>
            </div>

            {/* Meta Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Meta Information</h3>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <div className="p-3 bg-muted rounded-lg">
                    {generatedContent.metaTitle}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <div className="p-3 bg-muted rounded-lg">
                    {generatedContent.metaDescription}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Keywords</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg">
                    {generatedContent.keywords.map((keyword: string, index: number) => (
                      <Badge key={index} variant="outline">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h3 className="font-semibold">Content</h3>
              <div className="p-4 bg-muted rounded-lg max-h-96 overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: generatedContent.body }} />
              </div>
            </div>

            {/* Keyword Density Analysis */}
            {generatedContent.keywordDensity && (
              <div className="space-y-4">
                <h3 className="font-semibold">Keyword Density Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(generatedContent.keywordDensity).map(([keyword, density]: [string, any]) => (
                    <div key={keyword} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{keyword}</span>
                      <Badge variant={density > 2 ? "destructive" : density > 1 ? "default" : "secondary"}>
                        {density}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Structured Data */}
            {generatedContent.structuredData && (
              <div className="space-y-4">
                <h3 className="font-semibold">Structured Data (JSON-LD)</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(generatedContent.structuredData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};