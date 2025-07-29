import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBots, useBotGeneratedContent, useBotStats } from '@/hooks/useBotManagement';
import { Activity, TrendingUp, DollarSign, Clock, Bot, FileText } from 'lucide-react';

export const BotAnalytics: React.FC = () => {
  const { data: bots = [] } = useBots();
  const { data: generatedContent = [] } = useBotGeneratedContent();
  const { data: stats } = useBotStats();

  // Calculate analytics data
  const contentByBot = generatedContent.reduce((acc, content) => {
    acc[content.bot_id] = (acc[content.bot_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const contentByType = generatedContent.reduce((acc, content) => {
    acc[content.content_type] = (acc[content.content_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const contentByStatus = generatedContent.reduce((acc, content) => {
    acc[content.status] = (acc[content.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalCostByBot = generatedContent.reduce((acc, content) => {
    acc[content.bot_id] = (acc[content.bot_id] || 0) + (content.generation_cost || 0);
    return acc;
  }, {} as Record<string, number>);

  const topPerformingBots = Object.entries(contentByBot)
    .map(([botId, count]) => {
      const bot = bots.find(b => b.id === botId);
      return {
        bot,
        count,
        cost: totalCostByBot[botId] || 0
      };
    })
    .filter(item => item.bot)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bots.length}</div>
            <p className="text-xs text-muted-foreground">
              {bots.filter(b => b.is_ai_bot).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generatedContent.length}</div>
            <p className="text-xs text-muted-foreground">
              {contentByStatus.published || 0} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${generatedContent.reduce((sum, c) => sum + (c.generation_cost || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Generation costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Cost</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${generatedContent.length > 0 
                ? (generatedContent.reduce((sum, c) => sum + (c.generation_cost || 0), 0) / generatedContent.length).toFixed(3)
                : '0.000'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per content piece
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Bots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Top Performing Bots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingBots.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No content generated yet
                </p>
              ) : (
                topPerformingBots.map(({ bot, count, cost }, index) => (
                  <div key={bot!.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{bot!.full_name}</p>
                        <p className="text-sm text-muted-foreground">{bot!.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{count} posts</p>
                      <p className="text-sm text-muted-foreground">${cost.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Content Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">By Content Type</h4>
                <div className="space-y-2">
                  {Object.entries(contentByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="capitalize">{type.replace('_', ' ')}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">By Status</h4>
                <div className="space-y-2">
                  {Object.entries(contentByStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="capitalize">{status}</span>
                      <Badge 
                        variant={status === 'published' ? 'default' : 'secondary'}
                      >
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bot Activity Details */}
      <Card>
        <CardHeader>
          <CardTitle>Bot Activity Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bots.map((bot) => {
              const botContentCount = contentByBot[bot.id] || 0;
              const botCost = totalCostByBot[bot.id] || 0;
              
              return (
                <div key={bot.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {bot.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium">{bot.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{bot.role}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={bot.is_ai_bot ? 'default' : 'secondary'}>
                          {bot.is_ai_bot ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{bot.content_frequency}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Content</p>
                        <p className="font-medium">{botContentCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Cost</p>
                        <p className="font-medium">${botCost.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Domains</p>
                        <p className="font-medium">{(bot.content_domains || []).length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};