import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, User, Settings, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';

interface AIBot {
  id: string;
  name: string;
  email: string;
  role: string;
  profile_picture_url?: string;
  banner_picture_url?: string;
  user_id?: string;
  is_active: boolean;
  created_at: string;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
}

export const BotIdentityManager: React.FC = () => {
  const { toast } = useToast();
  const [bots, setBots] = useState<AIBot[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load bots
      const { data: botsData, error: botsError } = await supabase
        .from('ai_bots')
        .select('*')
        .order('name');

      if (botsError) throw botsError;
      setBots(botsData || []);

      // Load users (admin users who can manage bots)
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('is_ai_bot', false)
        .order('full_name');

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load bot data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assignUserToBot = async (botId: string, userId: string) => {
    setIsUpdating(botId);
    try {
      const { error } = await supabase
        .from('ai_bots')
        .update({ user_id: userId })
        .eq('id', botId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Bot identity assigned successfully",
      });

      loadData();
    } catch (error) {
      console.error('Error assigning user to bot:', error);
      toast({
        title: "Error",
        description: "Failed to assign user to bot",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.full_name || user?.email || 'Unknown User';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bot Identity Manager</h2>
          <p className="text-muted-foreground">
            Assign user accounts to AI bots for posting and identity management
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          {bots.length} Total Bots
        </Badge>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">How Bot Identity Works</p>
              <p className="text-blue-700">
                Each bot needs to be linked to a real user account to post content. When a bot posts, 
                it will use the assigned user's authentication but display the bot's name and profile.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bot List */}
      <div className="grid gap-4">
        {bots.map((bot) => (
          <Card key={bot.id} className={bot.is_active ? '' : 'opacity-60'}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Bot Avatar */}
                  <div className="relative">
                    {bot.profile_picture_url ? (
                      <img 
                        src={bot.profile_picture_url} 
                        alt={bot.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    {bot.is_active && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* Bot Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{bot.name}</h3>
                      <Badge variant={bot.is_active ? 'default' : 'secondary'}>
                        {bot.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{bot.role}</p>
                    <p className="text-xs text-muted-foreground">{bot.email}</p>
                  </div>
                </div>

                {/* User Assignment */}
                <div className="flex items-center gap-3">
                  {bot.user_id ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div className="text-right">
                        <div className="text-sm font-medium">Assigned to:</div>
                        <div className="text-xs text-muted-foreground">
                          {getUserName(bot.user_id)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">No user assigned</div>
                        <div className="text-xs text-muted-foreground">Bot cannot post</div>
                      </div>
                    </div>
                  )}

                  {/* Assign Button */}
                  <div className="min-w-[200px]">
                    <select
                      className="w-full p-2 border rounded text-sm"
                      value={bot.user_id || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          assignUserToBot(bot.id, e.target.value);
                        }
                      }}
                      disabled={isUpdating === bot.id}
                    >
                      <option value="">Select user...</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bots.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No AI Bots Found</h3>
            <p className="text-sm text-muted-foreground">
              Create AI bots first to manage their identities
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};