import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  PenTool, 
  Tags, 
  Code, 
  RefreshCw, 
  Package, 
  Layout, 
  HelpCircle, 
  FileText 
} from 'lucide-react';

const AIContentSubcategories = () => {
  const [activeSubcategory, setActiveSubcategory] = useState('blog-generator');
  const [isGenerating, setIsGenerating] = useState(false);

  const subcategories = [
    {
      id: 'blog-generator',
      title: 'AI Blog Post Generation',
      icon: PenTool,
      description: 'Generate SEO-optimized blog posts with AI',
      status: 'active'
    },
    {
      id: 'meta-optimization',
      title: 'Meta Tag Optimization',
      icon: Tags,
      description: 'AI-powered meta titles and descriptions',
      status: 'active'
    },
    {
      id: 'schema-generation',
      title: 'Schema Markup Generation',
      icon: Code,
      description: 'Generate structured data markup automatically',
      status: 'beta'
    },
    {
      id: 'content-rewriting',
      title: 'Content Rewriting & Enhancement',
      icon: RefreshCw,
      description: 'Improve existing content with AI suggestions',
      status: 'active'
    },
    {
      id: 'product-descriptions',
      title: 'SEO Product Descriptions',
      icon: Package,
      description: 'Generate optimized product descriptions',
      status: 'beta'
    },
    {
      id: 'landing-pages',
      title: 'Landing Page Copy Generation',
      icon: Layout,
      description: 'Create high-converting landing page content',
      status: 'coming-soon'
    },
    {
      id: 'faq-generation',
      title: 'FAQ Generation',
      icon: HelpCircle,
      description: 'Generate relevant FAQ sections for better SEO',
      status: 'active'
    },
    {
      id: 'content-briefs',
      title: 'Content Brief Creation',
      icon: FileText,
      description: 'Create detailed content briefs for writers',
      status: 'beta'
    }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  const renderSubcategoryContent = () => {
    const subcategory = subcategories.find(sub => sub.id === activeSubcategory);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{subcategory?.title}</h3>
            <p className="text-muted-foreground mt-1">{subcategory?.description}</p>
          </div>
          <Badge variant={subcategory?.status === 'active' ? 'default' : 'secondary'}>
            {subcategory?.status?.replace('-', ' ')}
          </Badge>
        </div>

        {activeSubcategory === 'blog-generator' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Blog Post</CardTitle>
                <CardDescription>Create SEO-optimized blog content with AI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Topic/Keyword</label>
                  <Input placeholder="Enter your main topic or keyword" />
                </div>
                <div>
                  <label className="text-sm font-medium">Content Type</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>How-to Guide</option>
                    <option>Listicle</option>
                    <option>Opinion/Editorial</option>
                    <option>Case Study</option>
                    <option>Product Review</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Target Word Count</label>
                  <Input type="number" placeholder="1500" />
                </div>
                <div>
                  <label className="text-sm font-medium">Tone</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Professional</option>
                    <option>Conversational</option>
                    <option>Technical</option>
                    <option>Friendly</option>
                  </select>
                </div>
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? 'Generating...' : 'Generate Blog Post'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Generated Content</CardTitle>
                <CardDescription>Your AI-generated blog posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { title: 'Complete Guide to SEO in 2024', date: '2 hours ago', words: '2,150' },
                    { title: '10 Best AI Tools for Content Creation', date: '1 day ago', words: '1,850' },
                    { title: 'How to Optimize for Voice Search', date: '3 days ago', words: '1,650' }
                  ].map((post, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <h4 className="font-medium">{post.title}</h4>
                      <p className="text-sm text-muted-foreground">{post.words} words • {post.date}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Export</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'meta-optimization' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Meta Tag Generator</CardTitle>
                <CardDescription>Generate optimized meta titles and descriptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Page URL or Content</label>
                  <Input placeholder="Enter URL or paste content snippet" />
                </div>
                <div>
                  <label className="text-sm font-medium">Primary Keyword</label>
                  <Input placeholder="Main keyword to optimize for" />
                </div>
                <div>
                  <label className="text-sm font-medium">Secondary Keywords</label>
                  <Input placeholder="Additional keywords (comma separated)" />
                </div>
                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                  {isGenerating ? 'Generating...' : 'Generate Meta Tags'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Meta Tags</CardTitle>
                <CardDescription>AI-optimized meta titles and descriptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Meta Title (58 chars)</label>
                  <Textarea 
                    placeholder="AI-generated meta title will appear here..."
                    value="Complete SEO Guide 2024: Master Search Engine Optimization"
                    className="min-h-[60px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Meta Description (155 chars)</label>
                  <Textarea 
                    placeholder="AI-generated meta description will appear here..."
                    value="Learn SEO best practices with our comprehensive 2024 guide. Boost rankings, increase traffic, and dominate search results with proven strategies."
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button size="sm">Copy HTML</Button>
                  <Button size="sm" variant="outline">Regenerate</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubcategory === 'faq-generation' && (
          <Card>
            <CardHeader>
              <CardTitle>FAQ Section Generator</CardTitle>
              <CardDescription>Generate relevant FAQs to improve search visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Topic/Page Content</label>
                  <Textarea 
                    placeholder="Paste your page content or describe the topic..."
                    className="min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <select className="w-full p-2 border rounded-md mb-4">
                    <option>Beginners</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>General Public</option>
                  </select>
                  <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
                    {isGenerating ? 'Generating FAQs...' : 'Generate FAQ Section'}
                  </Button>
                </div>
              </div>

              <div className="space-y-4 mt-6">
                <h4 className="font-semibold">Generated FAQs</h4>
                {[
                  {
                    question: "What is SEO and why is it important?",
                    answer: "SEO (Search Engine Optimization) is the practice of optimizing websites to rank higher in search engine results. It's important because it increases visibility, drives organic traffic, and helps businesses reach their target audience effectively."
                  },
                  {
                    question: "How long does it take to see SEO results?",
                    answer: "SEO results typically take 3-6 months to become noticeable, with significant improvements often visible after 6-12 months of consistent optimization efforts."
                  },
                  {
                    question: "What are the most important SEO ranking factors?",
                    answer: "Key SEO ranking factors include high-quality content, relevant keywords, page load speed, mobile-friendliness, backlinks, and user experience signals."
                  }
                ].map((faq, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h5 className="font-medium">{faq.question}</h5>
                    <p className="text-sm text-muted-foreground mt-2">{faq.answer}</p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="outline">Copy Schema</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {subcategories.map((subcategory) => {
          const Icon = subcategory.icon;
          return (
            <Button
              key={subcategory.id}
              variant={activeSubcategory === subcategory.id ? "default" : "outline"}
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setActiveSubcategory(subcategory.id)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs text-center">{subcategory.title}</span>
            </Button>
          );
        })}
      </div>

      {renderSubcategoryContent()}
    </div>
  );
};

export default AIContentSubcategories;