import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIPromptLibrary, useCreateAIPrompt } from '@/hooks/useAdvancedAdmin';
import { Brain, Lightbulb, MessageSquare, Zap, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const AIAssistantPanel = () => {
  const [selectedTab, setSelectedTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState([
    {
      id: 1,
      type: 'seo',
      title: 'Improve SEO for Job Pages',
      description: 'Add structured data and optimize meta descriptions for better search visibility',
      priority: 'high',
      impact: 'High traffic increase',
      action: 'View SEO Manager',
      icon: TrendingUp,
    },
    {
      id: 2,
      type: 'performance',
      title: 'Database Query Optimization',
      description: '3 slow queries detected that could benefit from indexing',
      priority: 'medium',
      impact: '40% faster load times',
      action: 'View Analytics',
      icon: Zap,
    },
    {
      id: 3,
      type: 'ux',
      title: 'Mobile Conversion Improvement',
      description: 'Mobile users have 15% lower conversion rates. Consider mobile-first design',
      priority: 'high',
      impact: '15% conversion boost',
      action: 'View Page Builder',
      icon: CheckCircle,
    },
    {
      id: 4,
      type: 'content',
      title: 'Content Gap Analysis',
      description: 'Missing content for "remote work" and "AI jobs" trending topics',
      priority: 'medium',
      impact: 'Capture trending searches',
      action: 'Create Content',
      icon: MessageSquare,
    },
  ]);

  const location = useLocation();
  const currentPage = location.pathname.split('/').pop() || 'dashboard';

  const getContextualSuggestions = () => {
    const contextSuggestions = {
      'seo': [
        'Add missing meta descriptions to 15 pages',
        'Optimize page load speed for better Core Web Vitals',
        'Create schema markup for job postings',
      ],
      'jobs': [
        'Add AI-powered job matching algorithm',
        'Implement job recommendation engine',
        'Optimize job search filters for better UX',
      ],
      'users': [
        'Set up automated user onboarding emails',
        'Create user segmentation for targeted campaigns',
        'Implement user retention analytics',
      ],
      'analytics': [
        'Set up conversion tracking for key actions',
        'Create custom dashboards for stakeholders',
        'Implement A/B testing for landing pages',
      ],
    };

    return contextSuggestions[currentPage] || [
      'Review overall platform performance',
      'Check for security updates needed',
      'Optimize database queries for better performance',
    ];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <UnifiedAdminLayout title="AI Assistant Panel" description="Smart suggestions and insights for platform optimization">
      <div className="space-y-6">
        {/* Quick AI Insights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-600" />
                AI Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">87/100</div>
              <p className="text-sm text-muted-foreground">Platform optimization</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                Active Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{suggestions.length}</div>
              <p className="text-sm text-muted-foreground">Pending actions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Critical Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">2</div>
              <p className="text-sm text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                Auto-Fixed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">12</div>
              <p className="text-sm text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="suggestions">Smart Suggestions</TabsTrigger>
            <TabsTrigger value="contextual">Page Context</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Recommendations</CardTitle>
                <CardDescription>
                  Smart suggestions based on platform analysis and best practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestions.map((suggestion) => {
                    const IconComponent = suggestion.icon;
                    return (
                      <div key={suggestion.id} className="border rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-blue-50">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium">{suggestion.title}</h3>
                              <Badge className={getPriorityColor(suggestion.priority)}>
                                {suggestion.priority}
                              </Badge>
                              <Badge variant="outline">{suggestion.type}</Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {suggestion.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <span className="font-medium text-green-600">
                                  Expected impact: {suggestion.impact}
                                </span>
                              </div>
                              
                              <Button size="sm" variant="outline">
                                {suggestion.action}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline">
                    <Brain className="h-4 w-4 mr-2" />
                    Generate More Suggestions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contextual" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Context-Aware Suggestions</CardTitle>
                <CardDescription>
                  Relevant suggestions for your current admin page: {currentPage}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getContextualSuggestions().map((suggestion, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      <span className="flex-1">{suggestion}</span>
                      <Button size="sm" variant="ghost">
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Page Load Speed</span>
                      <Badge variant="outline">Good</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">SEO Score</span>
                      <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">User Experience</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Needs Work</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Conversion Rate</span>
                      <Badge variant="outline">Average</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Content Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Content Freshness</span>
                      <Badge className="bg-green-100 text-green-800">Fresh</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Keyword Coverage</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Engagement Rate</span>
                      <Badge className="bg-green-100 text-green-800">High</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Content Gaps</span>
                      <Badge className="bg-red-100 text-red-800">Found</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>AI-Generated Insights</CardTitle>
                <CardDescription>Deep analysis and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Traffic Opportunity</h4>
                    <p className="text-sm text-blue-800">
                      Based on keyword analysis, adding content about "AI resume optimization" 
                      could capture an additional 2,500 monthly searches with low competition.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Conversion Optimization</h4>
                    <p className="text-sm text-green-800">
                      Users who view the pricing page have a 12% higher conversion rate 
                      when they've previously used the resume builder. Consider cross-promotion.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">User Experience</h4>
                    <p className="text-sm text-yellow-800">
                      Mobile users spend 23% less time on job detail pages. 
                      Simplifying the mobile layout could improve engagement.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Automation Rules</CardTitle>
                <CardDescription>
                  Set up automated actions based on AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Auto-Generate Meta Descriptions</h4>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Automatically create SEO-optimized meta descriptions for new job postings
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-600">12 auto-generated this week</span>
                      <Button size="sm" variant="outline">Configure</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Smart Content Tagging</h4>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Automatically tag content with relevant categories and keywords
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-600">8 posts tagged automatically</span>
                      <Button size="sm" variant="outline">Configure</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Performance Alerts</h4>
                      <Badge variant="outline">Inactive</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Get notified when page performance drops below threshold
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Not configured</span>
                      <Button size="sm">Set Up</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedAdminLayout>
  );
};

export default AIAssistantPanel;