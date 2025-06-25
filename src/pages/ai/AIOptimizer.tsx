
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  FileText, 
  User, 
  MessageSquare, 
  TrendingUp,
  Upload,
  Download,
  Copy,
  Check
} from 'lucide-react';

const AIOptimizer = () => {
  const [content, setContent] = useState('');
  const [optimizedContent, setOptimizedContent] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const optimizationTypes = [
    {
      id: 'posts',
      title: 'Social Posts',
      description: 'Optimize LinkedIn posts and professional content',
      icon: MessageSquare,
      placeholder: 'Paste your social media post here...'
    },
    {
      id: 'resume',
      title: 'Resume Content',
      description: 'Enhance resume sections and bullet points',
      icon: FileText,
      placeholder: 'Paste your resume section or bullet points here...'
    },
    {
      id: 'profile',
      title: 'Profile Summary',
      description: 'Improve your professional profile and bio',
      icon: User,
      placeholder: 'Paste your profile summary or bio here...'
    }
  ];

  const suggestions = [
    { type: 'Tone', value: 'Professional', color: 'bg-blue-50 text-blue-700' },
    { type: 'Keywords', value: 'Industry-specific', color: 'bg-green-50 text-green-700' },
    { type: 'Length', value: 'Optimized', color: 'bg-purple-50 text-purple-700' },
    { type: 'Impact', value: 'Action-oriented', color: 'bg-orange-50 text-orange-700' }
  ];

  const handleOptimize = async () => {
    if (!content.trim()) return;
    
    setIsOptimizing(true);
    
    // Simulate AI optimization
    setTimeout(() => {
      setOptimizedContent(`Here's your optimized content with improved clarity, professional tone, and enhanced keywords:\n\n${content}\n\n[This is a demo response - in a real implementation, this would use AI to optimize the content]`);
      setIsOptimizing(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Content Optimizer</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your professional content with AI-powered optimization. 
            Enhance posts, resume sections, and profiles for maximum impact.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Optimizer */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Content Optimizer</span>
                </CardTitle>
                <CardDescription>
                  Select content type and paste your text to get AI-powered improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="posts" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    {optimizationTypes.map((type) => (
                      <TabsTrigger key={type.id} value={type.id} className="flex items-center space-x-2">
                        <type.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{type.title}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {optimizationTypes.map((type) => (
                    <TabsContent key={type.id} value={type.id} className="space-y-4">
                      <div className="text-sm text-gray-600 mb-4">
                        {type.description}
                      </div>
                      
                      <Textarea
                        placeholder={type.placeholder}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[200px]"
                      />
                      
                      <Button 
                        onClick={handleOptimize}
                        disabled={!content.trim() || isOptimizing}
                        className="w-full"
                      >
                        {isOptimizing ? (
                          <>
                            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                            Optimizing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Optimize Content
                          </>
                        )}
                      </Button>
                    </TabsContent>
                  ))}
                </Tabs>

                {/* Optimized Result */}
                {optimizedContent && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-green-800">Optimized Content</h3>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopy}
                          className="text-green-700 border-green-300"
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="text-green-700 whitespace-pre-wrap text-sm">
                      {optimizedContent}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Optimization Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{suggestion.type}</span>
                    <Badge className={suggestion.color}>
                      {suggestion.value}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Optimization Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Use action verbs to start resume bullet points</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Include industry keywords for better visibility</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Keep LinkedIn posts under 1,300 characters</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Quantify achievements with specific metrics</span>
                </div>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Optimizations Today</span>
                  <span className="font-medium">12/50</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                </div>
                <div className="text-xs text-gray-500">
                  38 optimizations remaining this month
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIOptimizer;
