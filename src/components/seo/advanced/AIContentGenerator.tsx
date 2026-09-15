import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, Copy, Download, RefreshCw, Target, TrendingUp, Globe } from 'lucide-react';

export const AIContentGenerator: React.FC = () => {
  const [targetKeyword, setTargetKeyword] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [industry, setIndustry] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [generatedContent, setGeneratedContent] = useState({
    title: '',
    metaDescription: '',
    outline: '',
    content: '',
    schema: '',
    keywords: []
  });

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    // Simulate AI content generation
    setTimeout(() => {
      setGeneratedContent({
        title: `Ultimate Guide to ${targetKeyword}: Expert Strategies for 2024`,
        metaDescription: `Discover proven ${targetKeyword} strategies that drive results. Expert tips, case studies, and actionable insights to boost your success.`,
        outline: `1. Introduction to ${targetKeyword}\n2. Current Market Trends\n3. Best Practices & Strategies\n4. Case Studies\n5. Tools & Resources\n6. Future Outlook\n7. Conclusion & Next Steps`,
        content: `# Ultimate Guide to ${targetKeyword}\n\n## Introduction\n\nIn today's competitive digital landscape, understanding ${targetKeyword} is crucial for business success...\n\n## Key Strategies\n\n1. **Data-Driven Approach**: Leverage analytics to make informed decisions\n2. **User-Centric Design**: Focus on user experience and satisfaction\n3. **Continuous Optimization**: Regular testing and improvement`,
        schema: `{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Ultimate Guide to ${targetKeyword}",
  "author": { "@type": "Person", "name": "TalentXcel Expert" },
  "datePublished": "${new Date().toISOString()}",
  "image": "https://example.com/image.jpg"
}`,
        keywords: [`${targetKeyword}`, `${targetKeyword} guide`, `${targetKeyword} strategies`, `${targetKeyword} best practices`]
      });
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            AI Content Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Target Keyword</label>
              <Input
                placeholder="e.g., digital marketing"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Content Type</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              >
                <option value="blog">Blog Post</option>
                <option value="product">Product Page</option>
                <option value="landing">Landing Page</option>
                <option value="service">Service Page</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Industry</label>
              <Input
                placeholder="e.g., Technology"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleGenerateContent} 
            disabled={!targetKeyword || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate AI Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedContent.title && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="meta">Meta Tags</TabsTrigger>
                <TabsTrigger value="outline">Outline</TabsTrigger>
                <TabsTrigger value="schema">Schema</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Title</label>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input value={generatedContent.title} readOnly />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Content</label>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={generatedContent.content}
                    readOnly
                    className="min-h-[300px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="meta" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meta Description</label>
                  <Textarea
                    value={generatedContent.metaDescription}
                    readOnly
                    rows={3}
                  />
                  <div className="text-xs text-muted-foreground">
                    Length: {generatedContent.metaDescription.length}/160 characters
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="outline">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content Outline</label>
                  <Textarea
                    value={generatedContent.outline}
                    readOnly
                    rows={8}
                  />
                </div>
              </TabsContent>

              <TabsContent value="schema">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Structured Data (JSON-LD)</label>
                  <Textarea
                    value={generatedContent.schema}
                    readOnly
                    rows={10}
                    className="font-mono text-xs"
                  />
                </div>
              </TabsContent>

              <TabsContent value="keywords">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Suggested Keywords</label>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 mt-4">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Content
              </Button>
              <Button variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Optimize Further
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};