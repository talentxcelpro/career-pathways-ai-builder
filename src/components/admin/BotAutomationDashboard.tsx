import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Zap, 
  Clock, 
  TrendingUp, 
  Users, 
  FileText, 
  Brain,
  Calendar,
  Target
} from 'lucide-react';
import { useBots, useBotStats, useBotAutomation, useBotContentQueue } from '@/hooks/useBotManagement';

export const BotAutomationDashboard: React.FC = () => {
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  
  // Try to get data safely with error handling
  const { data: bots, isLoading: botsLoading, error: botsError } = useBots();
  const { data: stats, isLoading: statsLoading, error: statsError } = useBotStats();
  const { data: queueItems, isLoading: queueLoading, error: queueError } = useBotContentQueue();
  const { generateBatch, publishQueue } = useBotAutomation();

  // Show loading state
  if (botsLoading || statsLoading || queueLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading automation dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (botsError || statsError || queueError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-destructive">Error loading dashboard: {(botsError || statsError || queueError)?.message}</p>
        </div>
      </div>
    );
  }

  // Handler functions
  const handleGenerateBatch = async () => {
    await generateBatch.mutateAsync({ 
      botId: selectedBotId || undefined, 
      count: 5 
    });
  };

  const handlePublishQueue = async () => {
    await publishQueue.mutateAsync();
  };

  // Calculate automation metrics
  const totalQueuedContent = queueItems?.filter(item => item.status === 'generated').length || 0;
  const failedContent = queueItems?.filter(item => item.status === 'failed').length || 0;
  const publishedToday = queueItems?.filter(item => 
    item.status === 'published' && 
    new Date(item.created_at).toDateString() === new Date().toDateString()
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Bot Automation Engine</h2>
          <p className="text-muted-foreground">
            Automated content generation and publishing system for scale
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateBatch}
            disabled={generateBatch.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {generateBatch.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Generate Content
          </Button>
          
          <Button 
            onClick={handlePublishQueue}
            disabled={publishQueue.isPending || totalQueuedContent === 0}
            variant="outline"
          >
            {publishQueue.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Publish Queue ({totalQueuedContent})
          </Button>
        </div>
      </div>

      {/* Automation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeBots || 0}</div>
            <p className="text-xs text-muted-foreground">
              Generating content automatically
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Prompts</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activePrompts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalPromptUsage || 0} total uses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queued Content</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQueuedContent}</div>
            <p className="text-xs text-muted-foreground">
              Ready to publish
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedToday}</div>
            <p className="text-xs text-muted-foreground">
              Automated posts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bot Selection & Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Content Generation Controls
          </CardTitle>
          <CardDescription>
            Generate targeted content for specific bots or all active bots
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedBotId} onValueChange={setSelectedBotId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bot (or leave empty for all bots)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Active Bots</SelectItem>
                  {bots?.map((bot) => (
                    <SelectItem key={bot.id} value={bot.id}>
                      <div className="flex items-center gap-2">
                        {bot.profile_picture_url && (
                          <img 
                            src={bot.profile_picture_url} 
                            alt={bot.name}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span>{bot.name}</span>
                        <Badge variant="secondary">{bot.role}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {selectedBotId ? 'Generate for selected bot' : 'Generate for all active bots'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Content Queue Status
          </CardTitle>
          <CardDescription>
            Overview of generated content waiting to be published
          </CardDescription>
        </CardHeader>
        <CardContent>
          {queueItems && queueItems.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{totalQueuedContent}</div>
                  <div className="text-sm text-muted-foreground">Ready to Publish</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{publishedToday}</div>
                  <div className="text-sm text-muted-foreground">Published Today</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{failedContent}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recent Queue Items</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {queueItems.slice(0, 10).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.ai_bots?.name}</span>
                          <Badge variant="outline">{item.bot_prompt_library?.category}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Scheduled: {new Date(item.scheduled_for).toLocaleString()}
                        </div>
                      </div>
                      
                      <Badge 
                        variant={
                          item.status === 'generated' ? 'default' :
                          item.status === 'published' ? 'secondary' :
                          item.status === 'failed' ? 'destructive' : 'outline'
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No content in queue. Generate some content to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Automation Performance
          </CardTitle>
          <CardDescription>
            Track the effectiveness of your automated content generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Content Generation Rate</span>
                <span className="text-sm text-muted-foreground">
                  {stats?.totalContent || 0} total
                </span>
              </div>
              <Progress value={((stats?.publishedContent || 0) / Math.max(stats?.totalContent || 1, 1)) * 100} />
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.publishedContent || 0} published / {stats?.totalContent || 0} generated
              </p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Monthly Cost</span>
                <span className="text-sm text-muted-foreground">
                  ${(stats?.totalCost || 0).toFixed(2)}
                </span>
              </div>
              <Progress value={Math.min((stats?.totalCost || 0) / 100 * 100, 100)} />
              <p className="text-xs text-muted-foreground mt-1">
                Estimated monthly AI generation costs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};