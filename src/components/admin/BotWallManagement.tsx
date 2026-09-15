import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, FileText, Calendar, TrendingUp } from 'lucide-react';
import { useBots } from '@/hooks/useBotManagement';
import { useBotWallPosts } from '@/hooks/useBotWall';
import { ManualWallPostEditor } from './ManualWallPostEditor';
import { BotWallFeed } from './BotWallFeed';

export const BotWallManagement: React.FC = () => {
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [showEditor, setShowEditor] = useState(false);
  const { data: bots } = useBots();
  const { data: allPosts } = useBotWallPosts();
  const { data: selectedBotPosts } = useBotWallPosts(selectedBotId || undefined);

  const selectedBot = bots?.find(bot => bot.id === selectedBotId);

  // Stats calculations
  const totalPosts = allPosts?.length || 0;
  const publishedPosts = allPosts?.filter(post => !post.is_draft && post.published_at)?.length || 0;
  const draftPosts = allPosts?.filter(post => post.is_draft)?.length || 0;
  const manualPosts = allPosts?.filter(post => post.source === 'manual')?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bot Wall Management</h2>
          <p className="text-muted-foreground">
            Create and manage manual posts for your AI bots' wall feeds
          </p>
        </div>
        
        {selectedBot && (
          <Button onClick={() => setShowEditor(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Wall Post
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              All wall posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedPosts}</div>
            <p className="text-xs text-muted-foreground">
              Live posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftPosts}</div>
            <p className="text-xs text-muted-foreground">
              Unpublished drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manual Posts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{manualPosts}</div>
            <p className="text-xs text-muted-foreground">
              Hand-crafted content
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bot Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Bot</CardTitle>
          <CardDescription>
            Choose a bot to view and manage its wall posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedBotId} onValueChange={setSelectedBotId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose a bot..." />
            </SelectTrigger>
            <SelectContent>
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
                    <span className="text-muted-foreground">({bot.role})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Editor Modal */}
      {showEditor && selectedBot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ManualWallPostEditor
              bot={selectedBot}
              onClose={() => setShowEditor(false)}
            />
          </div>
        </div>
      )}

      {/* Wall Feed */}
      {selectedBot && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedBot.profile_picture_url && (
                <img 
                  src={selectedBot.profile_picture_url} 
                  alt={selectedBot.name}
                  className="w-8 h-8 rounded-full"
                />
              )}
              {selectedBot.name}'s Wall Feed
            </CardTitle>
            <CardDescription>
              All posts for this bot, both manual and AI-generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BotWallFeed 
              botId={selectedBotId}
              showActions={true}
            />
          </CardContent>
        </Card>
      )}

      {!selectedBot && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Select a Bot</h3>
            <p>Choose a bot above to view and manage its wall posts</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};