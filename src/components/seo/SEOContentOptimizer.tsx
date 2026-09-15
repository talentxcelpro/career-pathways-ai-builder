import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Brain, 
  Target, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Users,
  Clock,
  Hash,
  Type
} from 'lucide-react';
import { toast } from 'sonner';

export const SEOContentOptimizer = () => {
  const [targetKeyword, setTargetKeyword] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);

  const contentAnalysis = {
    overallScore: 72,
    readabilityScore: 68,
    seoScore: 76,
    wordCount: 847,
    readingTime: 3.4,
    keywordDensity: 2.1,
    sentiments: {
      positive: 65,
      neutral: 30,
      negative: 5
    },
    issues: [
      { type: 'warning', text: 'Title is too short (45 characters)', suggestion: 'Aim for 50-60 characters' },
      { type: 'error', text: 'Missing target keyword in H1', suggestion: 'Include "ai resume builder" in your main heading' },
      { type: 'success', text: 'Good use of subheadings (H2, H3)' },
      { type: 'warning', text: 'Meta description is too long', suggestion: 'Keep under 160 characters' }
    ],
    suggestions: [
      'Add more internal links to related content',
      'Include long-tail keyword variations',
      'Add bullet points to improve readability',
      'Include relevant statistics and data',
      'Add a FAQ section for better user engagement'
    ]
  };

  const handleOptimize = async () => {
    if (!targetKeyword.trim()) {
      toast.error('Please enter a target keyword');
      return;
    }

    setIsOptimizing(true);
    // Simulate AI optimization
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsOptimizing(false);
    toast.success('Content optimization completed!');
  };

  const generateAIContent = async (type: string) => {
    toast.info(`Generating AI-optimized ${type}...`);
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    switch (type) {
      case 'title':
        setTitle('Ultimate AI Resume Builder: Create Professional Resumes in Minutes');
        break;
      case 'meta':
        setMetaDescription('Create stunning professional resumes with our AI-powered builder. 50+ templates, ATS-friendly formats. Start building your dream career today!');
        break;
      case 'outline':
        setContent(`# Ultimate AI Resume Builder Guide

## Introduction
- Why AI resume builders are revolutionizing job search
- Benefits of using AI for resume creation

## How AI Resume Builders Work
- Machine learning algorithms
- Natural language processing
- Template optimization

## Key Features to Look For
- ATS compatibility
- Customizable templates
- Real-time optimization
- Industry-specific suggestions

## Best Practices
- Keyword optimization
- Formatting guidelines
- Content structure

## Conclusion
- Future of AI in recruitment
- Getting started with AI resume tools`);
        break;
    }
    toast.success(`AI ${type} generated successfully!`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Content Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Content Optimizer
          </CardTitle>
          <CardDescription>
            Optimize your content for search engines and user engagement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Target Keyword</label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your target keyword (e.g., ai resume builder)"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
              />
              <Button onClick={handleOptimize} disabled={isOptimizing}>
                {isOptimizing ? 'Optimizing...' : 'Analyze'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title Tag</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your page title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Button variant="outline" onClick={() => generateAIContent('title')}>
                  <Brain className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {title.length}/60 characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meta Description</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter meta description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
                <Button variant="outline" onClick={() => generateAIContent('meta')}>
                  <Brain className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {metaDescription.length}/160 characters
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Content</label>
              <Button variant="outline" size="sm" onClick={() => generateAIContent('outline')}>
                <Brain className="h-4 w-4 mr-2" />
                Generate AI Outline
              </Button>
            </div>
            <Textarea
              placeholder="Paste your content here for optimization..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
            />
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {targetKeyword && (
        <>
          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <div className={`text-3xl font-bold ${getScoreColor(contentAnalysis.overallScore)}`}>
                  {contentAnalysis.overallScore}/100
                </div>
                <div className="text-sm text-muted-foreground">Overall Score</div>
                <Progress value={contentAnalysis.overallScore} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className={`text-3xl font-bold ${getScoreColor(contentAnalysis.readabilityScore)}`}>
                  {contentAnalysis.readabilityScore}/100
                </div>
                <div className="text-sm text-muted-foreground">Readability</div>
                <Progress value={contentAnalysis.readabilityScore} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className={`text-3xl font-bold ${getScoreColor(contentAnalysis.seoScore)}`}>
                  {contentAnalysis.seoScore}/100
                </div>
                <div className="text-sm text-muted-foreground">SEO Score</div>
                <Progress value={contentAnalysis.seoScore} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Content Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Content Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-semibold">{contentAnalysis.wordCount}</div>
                    <div className="text-sm text-muted-foreground">Words</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-semibold">{contentAnalysis.readingTime} min</div>
                    <div className="text-sm text-muted-foreground">Reading Time</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-semibold">{contentAnalysis.keywordDensity}%</div>
                    <div className="text-sm text-muted-foreground">Keyword Density</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-semibold">{contentAnalysis.sentiments.positive}%</div>
                    <div className="text-sm text-muted-foreground">Positive Sentiment</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="issues" className="space-y-6">
            <TabsList>
              <TabsTrigger value="issues">Issues & Fixes</TabsTrigger>
              <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
              <TabsTrigger value="keywords">Keyword Analysis</TabsTrigger>
              <TabsTrigger value="competitors">Competitor Content</TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Content Issues & Recommendations</CardTitle>
                  <CardDescription>Fix these issues to improve your content performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contentAnalysis.issues.map((issue, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold">{issue.text}</h4>
                          {issue.suggestion && (
                            <p className="text-sm text-muted-foreground mt-1">{issue.suggestion}</p>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          Fix
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    AI-Powered Suggestions
                  </CardTitle>
                  <CardDescription>Improve your content with these AI recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contentAnalysis.suggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm">{suggestion}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Keyword Analysis</CardTitle>
                  <CardDescription>How well your content targets the focus keyword</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Primary Keyword</h4>
                        <Badge className="mb-2">{targetKeyword}</Badge>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>In Title</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>In H1</span>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>In Meta Description</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>In Content (2.1%)</span>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Related Keywords</h4>
                        <div className="space-y-2">
                          <Badge variant="outline">resume builder</Badge>
                          <Badge variant="outline">ai tools</Badge>
                          <Badge variant="outline">professional resume</Badge>
                          <Badge variant="outline">job application</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="competitors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Competitor Content Analysis</CardTitle>
                  <CardDescription>How your content compares to top-ranking pages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-muted-foreground py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Analyzing competitor content for "{targetKeyword}"...</p>
                    <Button className="mt-4">Start Analysis</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};