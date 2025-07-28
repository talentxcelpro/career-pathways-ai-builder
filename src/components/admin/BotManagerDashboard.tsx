import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBots, useCreateBot, useUpdateBot, useDeleteBot, useBotStats, type AIBot } from '@/hooks/useBotManagement';
import { Plus, Edit, Trash2, Bot, Activity, FileText, Zap } from 'lucide-react';
import { toast } from 'sonner';

export const BotManagerDashboard: React.FC = () => {
  const { data: bots = [], isLoading } = useBots();
  const { data: stats } = useBotStats();
  const createBot = useCreateBot();
  const updateBot = useUpdateBot();
  const deleteBot = useDeleteBot();

  const [selectedBot, setSelectedBot] = useState<AIBot | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: [] as string[],
    content_domains: [] as string[],
    tone_style: 'professional',
    frequency: 'daily',
    distribution_channels: [] as string[],
    is_active: true,
    bot_config: {}
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      department: [],
      content_domains: [],
      tone_style: 'professional',
      frequency: 'daily',
      distribution_channels: [],
      is_active: true,
      bot_config: {}
    });
  };

  const handleCreateBot = () => {
    setIsEditing(false);
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditBot = (bot: AIBot) => {
    setIsEditing(true);
    setSelectedBot(bot);
    setFormData({
      name: bot.name,
      email: bot.email,
      role: bot.role,
      department: bot.department,
      content_domains: bot.content_domains,
      tone_style: bot.tone_style,
      frequency: bot.frequency,
      distribution_channels: bot.distribution_channels,
      is_active: bot.is_active,
      bot_config: bot.bot_config
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && selectedBot) {
        await updateBot.mutateAsync({ id: selectedBot.id, ...formData });
      } else {
        await createBot.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving bot:', error);
    }
  };

  const handleToggleActive = async (bot: AIBot) => {
    try {
      await updateBot.mutateAsync({ 
        id: bot.id, 
        is_active: !bot.is_active 
      });
    } catch (error) {
      console.error('Error toggling bot status:', error);
    }
  };

  const handleDeleteBot = async (bot: AIBot) => {
    if (window.confirm(`Are you sure you want to delete ${bot.name}?`)) {
      try {
        await deleteBot.mutateAsync(bot.id);
      } catch (error) {
        console.error('Error deleting bot:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading bots...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeBots || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {stats?.totalBots || 0} total bots
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Content</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalContent || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.publishedContent || 0} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalCost?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              AI generation costs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeTemplates || 0}</div>
            <p className="text-xs text-muted-foreground">
              Content templates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Bot Management</h2>
          <p className="text-muted-foreground">
            Manage your AI content generation bots
          </p>
        </div>
        <Button onClick={handleCreateBot}>
          <Plus className="mr-2 h-4 w-4" />
          Create Bot
        </Button>
      </div>

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map((bot) => (
          <Card key={bot.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={bot.profile_picture_url} />
                    <AvatarFallback>
                      {bot.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{bot.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{bot.role}</p>
                  </div>
                </div>
                <Switch
                  checked={bot.is_active}
                  onCheckedChange={() => handleToggleActive(bot)}
                />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Departments</p>
                <div className="flex flex-wrap gap-1">
                  {bot.department.map((dept) => (
                    <Badge key={dept} variant="secondary" className="text-xs">
                      {dept}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Content Domains</p>
                <div className="flex flex-wrap gap-1">
                  {bot.content_domains.map((domain) => (
                    <Badge key={domain} variant="outline" className="text-xs">
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tone:</span>
                <Badge variant="secondary">{bot.tone_style}</Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Frequency:</span>
                <Badge variant="secondary">{bot.frequency}</Badge>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditBot(bot)}
                  className="flex-1"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteBot(bot)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Bot' : 'Create New Bot'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Bot Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tone_style">Tone Style</Label>
                <Select value={formData.tone_style} onValueChange={(value) => setFormData({ ...formData, tone_style: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="authoritative">Authoritative</SelectItem>
                    <SelectItem value="helpful">Helpful</SelectItem>
                    <SelectItem value="motivational">Motivational</SelectItem>
                    <SelectItem value="nurturing">Nurturing</SelectItem>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="inspiring">Inspiring</SelectItem>
                    <SelectItem value="informative">Informative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="as_needed">As Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="department">Departments (comma-separated)</Label>
              <Input
                id="department"
                value={formData.department.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  department: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="Network, Community, Jobs"
              />
            </div>

            <div>
              <Label htmlFor="content_domains">Content Domains (comma-separated)</Label>
              <Input
                id="content_domains"
                value={formData.content_domains.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  content_domains: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="Community Building, Networking, Professional Growth"
              />
            </div>

            <div>
              <Label htmlFor="distribution_channels">Distribution Channels (comma-separated)</Label>
              <Input
                id="distribution_channels"
                value={formData.distribution_channels.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  distribution_channels: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="Feed, Blog, Newsletter"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createBot.isPending || updateBot.isPending}>
                {isEditing ? 'Update Bot' : 'Create Bot'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};