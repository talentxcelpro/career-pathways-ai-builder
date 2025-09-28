import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Users, 
  Plus, 
  Hash, 
  TrendingUp, 
  Globe, 
  Lock, 
  EyeOff,
  Settings,
  Crown,
  Shield,
  User
} from 'lucide-react';
import { useGroups } from '@/hooks/useGroups';
import { CreateGroupDialog } from './CreateGroupDialog';

export const GroupsHub: React.FC = () => {
  const { groups, isLoading, joinGroup, leaveGroup } = useGroups();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discover');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myGroups = groups.filter(group => group.is_member);
  const publicGroups = groups.filter(group => group.group_type === 'public' && !group.is_member);

  const getGroupIcon = (type: string) => {
    switch (type) {
      case 'public': return <Globe className="w-4 h-4 text-green-500" />;
      case 'private': return <Lock className="w-4 h-4 text-yellow-500" />;
      case 'secret': return <EyeOff className="w-4 h-4 text-red-500" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'moderator': return <Shield className="w-3 h-3 text-blue-500" />;
      case 'member': return <User className="w-3 h-3 text-gray-500" />;
      default: return null;
    }
  };

  const handleJoinGroup = (groupId: string) => {
    joinGroup({ groupId });
  };

  const handleLeaveGroup = (groupId: string) => {
    leaveGroup(groupId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Groups & Communities</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Groups & Communities</h2>
          <p className="text-muted-foreground">Connect with like-minded professionals</p>
        </div>
        <Button onClick={() => setShowCreateGroup(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups ({myGroups.length})</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getGroupIcon(group.group_type)}
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                    </div>
                    {group.category && (
                      <Badge variant="secondary" className="text-xs">
                        {group.category}
                      </Badge>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {group.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {group.member_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {group.post_count}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleJoinGroup(group.id)}
                      className="gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {publicGroups.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No public groups found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-groups" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getGroupIcon(group.group_type)}
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      {getRoleIcon(group.user_role)}
                    </div>
                    <Badge variant="outline" className="text-xs capitalize">
                      {group.user_role}
                    </Badge>
                  </div>
                  {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {group.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {group.member_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {group.post_count}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {group.user_role === 'admin' && (
                        <Button variant="outline" size="sm" className="gap-1">
                          <Settings className="w-3 h-3" />
                          Manage
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLeaveGroup(group.id)}
                      >
                        Leave
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {myGroups.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">You haven't joined any groups yet</p>
              <Button 
                className="mt-4" 
                onClick={() => setActiveTab('discover')}
              >
                Discover Groups
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { topic: '#AI', count: 1234 },
                  { topic: '#RemoteWork', count: 956 },
                  { topic: '#Startups', count: 743 },
                  { topic: '#WebDevelopment', count: 612 },
                  { topic: '#DataScience', count: 489 }
                ].map((trend, index) => (
                  <div key={trend.topic} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <span className="font-medium">{trend.topic}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {trend.count} posts
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.slice(0, 6).map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <Badge variant="secondary">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  </div>
                  {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {group.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {group.member_count}
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        {group.post_count}
                      </div>
                    </div>
                    {group.is_member ? (
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => handleJoinGroup(group.id)}>
                        Join
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Group Dialog */}
      <CreateGroupDialog
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
      />
    </div>
  );
};