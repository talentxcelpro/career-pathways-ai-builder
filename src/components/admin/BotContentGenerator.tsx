import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBots, useBotGeneratedContent } from '@/hooks/useBotManagement';
import { supabase } from '@/integrations/supabase/client';
import { Play, Clock, Eye, TrendingUp, FileText, Bot } from 'lucide-react';
import { toast } from 'sonner';

export const BotContentGenerator: React.FC = () => {
  const { data: bots = [], refetch } = useBots();
  const { data: generatedContent = [], refetch: refetchContent } = useBotGeneratedContent();
  const [selectedBot, setSelectedBot] = useState<string>('');
  const [contentType, setContentType] = useState<string>('post');
  const [category, setCategory] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<any>(null);

  const activeBots = bots?.filter(bot => bot.is_ai_bot) || [];
  const recentContent = generatedContent?.slice(0, 10) || [];

  const categories = [
    'Job Alerts',
    'Career Growth Tips',
    'Resume/Interview',
    'Motivation/Stories',
    'Learning & Upskill',
    'Company/Market News',
    'Mentorship & Support',
    'Tools/Tutorials'
  ];

  // Network connectivity check
  const checkConnectivity = async () => {
    try {
      console.log('🔍 Checking function connectivity...');
      const response = await fetch(`https://dthlgsnakhoftinssokm.supabase.co/functions/v1/bot-content-generator/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Function health check passed:', data);
        return true;
      } else {
        console.log('❌ Function health check failed:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ Function connectivity failed:', error);
      return false;
    }
  };

  // Enhanced function invocation with retry logic
  const invokeWithRetry = async (payload: any, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} - Invoking function...`);
        
        // Method 1: Use Supabase client
        const { data, error } = await supabase.functions.invoke('bot-content-generator', {
          body: payload,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!error && data) {
          console.log('✅ Supabase client method successful');
          return { data, error: null };
        }

        console.log(`❌ Attempt ${attempt} failed with Supabase client:`, error);

        // Method 2: Direct fetch as fallback
        if (attempt === maxRetries) {
          console.log('🔄 Trying direct fetch as fallback...');
          
          const response = await fetch(`https://dthlgsnakhoftinssokm.supabase.co/functions/v1/bot-content-generator`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc`,
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          console.log('✅ Direct fetch method successful');
          return { data, error: null };
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
  };

  const handleGenerateContent = async () => {
    if (!selectedBot || !category) {
      toast.error('Please select a bot and category');
      return;
    }

    setIsGenerating(true);
    try {
      console.log('=== Starting Content Generation ===');
      console.log('Selected bot:', selectedBot);
      console.log('Category:', category);
      console.log('Content type:', contentType);
      
      // Check connectivity first
      const isConnected = await checkConnectivity();
      if (!isConnected) {
        console.log('⚠️ Function connectivity issues detected, but proceeding anyway...');
      }

      const payload = {
        botId: selectedBot,
        category,
        contentType,
        prompt: customPrompt || undefined
      };

      console.log('📦 Sending payload:', payload);

      const { data, error } = await invokeWithRetry(payload);

      if (error) {
        console.error('Function invocation error:', error);
        throw new Error(`Function error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No response from function');
      }

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      console.log('✅ Content generated successfully:', data.content);
      setLastGenerated(data.content);
      toast.success('Content generated successfully!');
      setCustomPrompt('');
      
      // Refresh content list
      await refetchContent();
      
    } catch (error) {
      console.error('❌ Generation error:', error);
      
      let message = 'Failed to generate content';
      if (error.message.includes('DeepSeek API key')) {
        message = 'AI service not configured. Please contact administrator.';
      } else if (error.message.includes('Missing required fields')) {
        message = 'Please select both a bot and category.';
      } else if (error.message.includes('timeout')) {
        message = 'Request timed out. Please try again.';
      } else if (error.message.includes('HTTP 404')) {
        message = 'Function not found. Please check deployment.';
      } else if (error.message.includes('HTTP 500')) {
        message = 'Server error. Please try again later.';
      } else {
        message = `Generation failed: ${error.message}`;
      }
      
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBulkGenerate = async () => {
    setIsGenerating(true);
    try {
      console.log('=== Starting Bulk Generation ===');
      
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Please log in to generate content');
      }
      
      // Generate content for all active bots
      const { data, error } = await supabase.functions.invoke('bot-content-generator', {
        body: {
          bulkGenerate: true,
          count: 50 // Generate 50 pieces of content across all bots
        }
      });

      if (error) {
        console.error('Bulk generation error:', error);
        throw new Error(error.message || 'Bulk generation failed');
      }

      if (data?.success) {
        toast.success(`Bulk generation completed! Generated ${data.generated}/${data.total} content pieces.`);
        // Refresh the content list
        await refetchContent();
      } else {
        throw new Error(data?.error || 'Bulk generation failed');
      }
    } catch (error) {
      console.error('Error with bulk generation:', error);
      toast.error(`Failed to start bulk generation: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Generator */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bot className="mr-2 h-5 w-5" />
              AI Content Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bot-select">Select Bot</Label>
                <Select value={selectedBot} onValueChange={setSelectedBot}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a bot..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeBots.map((bot) => (
                      <SelectItem key={bot.id} value={bot.id}>
                        {bot.full_name} - {bot.role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Social Post</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="seo_page">SEO Page</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="custom-prompt">Custom Prompt (Optional)</Label>
              <Textarea
                id="custom-prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Add specific instructions for content generation..."
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleGenerateContent} 
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
              <Button 
                onClick={handleBulkGenerate}
                disabled={isGenerating}
                variant="outline"
              >
                Bulk Generate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Generation Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {generatedContent.length}
              </div>
              <p className="text-sm text-muted-foreground">Total Generated</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-xl font-semibold text-green-600">
                  {generatedContent.filter(c => c.status === 'published').length}
                </div>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
              <div>
                <div className="text-xl font-semibold text-blue-600">
                  {generatedContent.filter(c => c.status === 'draft').length}
                </div>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>

            <div className="text-center">
              <div className="text-lg font-medium">
                ${generatedContent.reduce((sum, c) => sum + (c.generation_cost || 0), 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Total Cost</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Generated Content Preview */}
      {lastGenerated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Latest Generated Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(lastGenerated.status)}>
                  {lastGenerated.status}
                </Badge>
                <Badge variant="outline">
                  {lastGenerated.content_type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Generated {new Date(lastGenerated.created_at).toLocaleString()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{lastGenerated.title}</h3>
                <div className="prose max-w-none">
                  <p className="text-muted-foreground whitespace-pre-line">
                    {lastGenerated.content}
                  </p>
                </div>
              </div>
              {lastGenerated.seo_keywords && lastGenerated.seo_keywords.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">SEO Keywords:</p>
                  <div className="flex flex-wrap gap-1">
                    {lastGenerated.seo_keywords.map((keyword: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Generated Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Recent Generated Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentContent.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No content generated yet. Start by generating some content above!
              </p>
            ) : (
              recentContent.map((content) => {
                const bot = bots.find(b => b.id === content.bot_id);
                return (
                  <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{content.title}</h4>
                        <Badge className={getStatusColor(content.status)}>
                          {content.status}
                        </Badge>
                        <Badge variant="outline">
                          {content.content_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By {bot?.full_name} • {new Date(content.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {content.content.substring(0, 100)}...
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {content.generation_cost > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ${content.generation_cost.toFixed(3)}
                        </span>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};