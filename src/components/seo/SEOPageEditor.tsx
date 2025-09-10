import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Eye, 
  Wand2, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileText,
  Image,
  Search,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

interface SEOPageData {
  url: string;
  title: string;
  metaDescription: string;
  h1: string;
  content: string;
  imageAlt: string[];
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  readabilityScore: number;
}

interface SEOPageEditorProps {
  pageUrl: string;
  onSave: (data: SEOPageData) => void;
  onClose: () => void;
}

export const SEOPageEditor: React.FC<SEOPageEditorProps> = ({
  pageUrl,
  onSave,
  onClose
}) => {
  const [pageData, setPageData] = useState<SEOPageData>({
    url: pageUrl,
    title: '',
    metaDescription: '',
    h1: '',
    content: '',
    imageAlt: [],
    internalLinks: 0,
    externalLinks: 0,
    wordCount: 0,
    readabilityScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [seoScore, setSeoScore] = useState(0);

  useEffect(() => {
    loadPageData();
  }, [pageUrl]);

  useEffect(() => {
    calculateSEOScore();
  }, [pageData]);

  const loadPageData = async () => {
    setIsLoading(true);
    try {
      // Simulate loading page data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockData: SEOPageData = {
        url: pageUrl,
        title: 'Software Engineer Jobs in Bangalore | TalentXcel',
        metaDescription: 'Find top software engineer jobs in Bangalore. Browse 500+ opportunities from leading companies. Apply now!',
        h1: 'Software Engineer Jobs in Bangalore',
        content: 'Discover exciting software engineer opportunities in Bangalore, India\'s tech capital...',
        imageAlt: ['Job search interface', 'Bangalore tech office'],
        internalLinks: 8,
        externalLinks: 3,
        wordCount: 850,
        readabilityScore: 72
      };
      
      setPageData(mockData);
    } catch (error) {
      toast.error('Failed to load page data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSEOScore = () => {
    let score = 0;
    
    // Title optimization (0-25 points)
    if (pageData.title) {
      score += 10;
      if (pageData.title.length >= 30 && pageData.title.length <= 60) score += 10;
      if (pageData.title.toLowerCase().includes('jobs')) score += 5;
    }
    
    // Meta description (0-20 points)
    if (pageData.metaDescription) {
      score += 10;
      if (pageData.metaDescription.length >= 120 && pageData.metaDescription.length <= 160) score += 10;
    }
    
    // Content quality (0-30 points)
    if (pageData.wordCount >= 300) score += 10;
    if (pageData.wordCount >= 600) score += 10;
    if (pageData.readabilityScore >= 60) score += 10;
    
    // Technical SEO (0-25 points)
    if (pageData.h1) score += 10;
    if (pageData.internalLinks >= 3) score += 8;
    if (pageData.imageAlt.length > 0) score += 7;
    
    setSeoScore(Math.min(score, 100));
  };

  const generateAIContent = async (type: 'title' | 'description' | 'h1') => {
    setIsGenerating(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const suggestions = {
        title: [
          'Software Engineer Jobs in Bangalore - Latest Openings | TalentXcel',
          'Top Software Engineer Careers in Bangalore | Apply Now',
          'Bangalore Software Engineer Jobs - 500+ Open Positions'
        ],
        description: [
          'Explore 500+ software engineer jobs in Bangalore from top tech companies. Competitive salaries, remote options available. Apply today!',
          'Find your dream software engineer role in Bangalore. Browse opportunities from startups to MNCs. Get hired faster with TalentXcel.',
          'Discover software engineer jobs in Bangalore with leading companies. Full-time, part-time & remote positions available.'
        ],
        h1: [
          'Find Software Engineer Jobs in Bangalore',
          'Software Engineer Opportunities in Bangalore',
          'Latest Software Engineer Jobs in Bangalore'
        ]
      };
      
      const randomSuggestion = suggestions[type][Math.floor(Math.random() * suggestions[type].length)];
      
      setPageData(prev => ({
        ...prev,
        [type === 'description' ? 'metaDescription' : type]: randomSuggestion
      }));
      
      toast.success(`AI-generated ${type} suggestion applied!`);
    } catch (error) {
      toast.error('Failed to generate AI content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave(pageData);
      toast.success('Page SEO data saved successfully!');
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Poor';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading page data...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">SEO Page Editor</h2>
          <p className="text-muted-foreground">{pageData.url}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">SEO Score</div>
            <div className={`text-2xl font-bold ${getScoreColor(seoScore)}`}>
              {seoScore}/100
            </div>
            <Badge variant={seoScore >= 80 ? "default" : seoScore >= 60 ? "secondary" : "destructive"}>
              {getScoreBadge(seoScore)}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="meta">Meta Tags</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Page Title
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateAIContent('title')}
                    disabled={isGenerating}
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    AI Generate
                  </Button>
                </CardTitle>
                <CardDescription>
                  Optimize your title tag for search engines and users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={pageData.title}
                  onChange={(e) => setPageData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter page title..."
                  className="mb-2"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className={pageData.title.length > 60 ? 'text-red-600' : 'text-muted-foreground'}>
                    {pageData.title.length}/60 characters
                  </span>
                  {pageData.title.length >= 30 && pageData.title.length <= 60 && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  H1 Heading
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateAIContent('h1')}
                    disabled={isGenerating}
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    AI Generate
                  </Button>
                </CardTitle>
                <CardDescription>
                  Main heading that appears on the page
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={pageData.h1}
                  onChange={(e) => setPageData(prev => ({ ...prev, h1: e.target.value }))}
                  placeholder="Enter H1 heading..."
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Meta Description
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateAIContent('description')}
                    disabled={isGenerating}
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    AI Generate
                  </Button>
                </CardTitle>
                <CardDescription>
                  Compelling description that appears in search results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={pageData.metaDescription}
                  onChange={(e) => setPageData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Enter meta description..."
                  rows={3}
                  className="mb-2"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className={pageData.metaDescription.length > 160 ? 'text-red-600' : 'text-muted-foreground'}>
                    {pageData.metaDescription.length}/160 characters
                  </span>
                  {pageData.metaDescription.length >= 120 && pageData.metaDescription.length <= 160 && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="meta">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Checklist</CardTitle>
                <CardDescription>Essential SEO elements status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Title Tag Present</span>
                    {pageData.title ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Title Length Optimal</span>
                    {pageData.title.length >= 30 && pageData.title.length <= 60 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Meta Description Present</span>
                    {pageData.metaDescription ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Meta Description Length</span>
                    {pageData.metaDescription.length >= 120 && pageData.metaDescription.length <= 160 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">H1 Tag Present</span>
                    {pageData.h1 ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Analysis</CardTitle>
                <CardDescription>Content quality metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Word Count</span>
                      <span className={pageData.wordCount >= 300 ? 'text-green-600' : 'text-red-600'}>
                        {pageData.wordCount}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Recommended: 300+ words
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Readability Score</span>
                      <span className={pageData.readabilityScore >= 60 ? 'text-green-600' : 'text-red-600'}>
                        {pageData.readabilityScore}/100
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Target: 60+ (easy to read)
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Internal Links</span>
                      <span className={pageData.internalLinks >= 3 ? 'text-green-600' : 'text-red-600'}>
                        {pageData.internalLinks}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Recommended: 3+ internal links
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technical">
          <Card>
            <CardHeader>
              <CardTitle>Technical SEO</CardTitle>
              <CardDescription>Technical optimization settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Images
                  </h4>
                  <div className="space-y-2">
                    <div className="text-sm">Images with Alt Text: {pageData.imageAlt.length}</div>
                    <div className="text-xs text-muted-foreground">
                      All images should have descriptive alt text
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Links
                  </h4>
                  <div className="space-y-2">
                    <div className="text-sm">Internal: {pageData.internalLinks}</div>
                    <div className="text-sm">External: {pageData.externalLinks}</div>
                    <div className="text-xs text-muted-foreground">
                      Balance internal and external links
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Content
                  </h4>
                  <div className="space-y-2">
                    <div className="text-sm">Word Count: {pageData.wordCount}</div>
                    <div className="text-sm">Readability: {pageData.readabilityScore}%</div>
                    <div className="text-xs text-muted-foreground">
                      Aim for comprehensive, readable content
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Search Result Preview
              </CardTitle>
              <CardDescription>
                How your page will appear in Google search results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-lg p-4 bg-white border rounded-lg">
                <div className="space-y-1">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {pageData.title || 'Page Title'}
                  </div>
                  <div className="text-green-700 text-sm">
                    {pageData.url}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {pageData.metaDescription || 'Meta description will appear here...'}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>Title: {pageData.title.length}/60 chars</span>
                  <span>Description: {pageData.metaDescription.length}/160 chars</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};