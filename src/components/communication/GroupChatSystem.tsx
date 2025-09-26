import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Settings, Search, MessageSquare, Hash } from "lucide-react";
import { useCommunication } from "@/hooks/useCommunication";
import { useAuth } from "@/contexts/AuthContext";

const GroupChatSystem = () => {
  const { user } = useAuth();
  const { groupChats, createGroupChat, isLoading } = useCommunication();
  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    description: '',
    isPrivate: false
  });
  const [searchQuery, setSearchQuery] = useState('');

  const mockGroups = [
    {
      id: '1',
      name: 'Career Growth Network',
      description: 'A community for professionals looking to advance their careers',
      memberCount: 45,
      lastActivity: '2 hours ago',
      isPrivate: false,
      avatar: '/placeholder-group.png',
      category: 'Career Development'
    },
    {
      id: '2',
      name: 'Tech Interview Prep',
      description: 'Share resources and practice for technical interviews',
      memberCount: 28,
      lastActivity: '30 minutes ago',
      isPrivate: false,
      avatar: '/placeholder-group.png',
      category: 'Interview Prep'
    },
    {
      id: '3',
      name: 'Senior Leaders Circle',
      description: 'Private group for senior professionals and executives',
      memberCount: 12,
      lastActivity: '1 hour ago',
      isPrivate: true,
      avatar: '/placeholder-group.png',
      category: 'Leadership'
    },
    {
      id: '4',
      name: 'Remote Work Hub',
      description: 'Tips and discussions about remote work best practices',
      memberCount: 67,
      lastActivity: '5 minutes ago',
      isPrivate: false,
      avatar: '/placeholder-group.png',
      category: 'Remote Work'
    }
  ];

  const handleCreateGroup = async () => {
    if (!newGroupForm.name.trim()) return;

    try {
      await createGroupChat({
        name: newGroupForm.name,
        description: newGroupForm.description,
        isPrivate: newGroupForm.isPrivate
      });
      setNewGroupForm({ name: '', description: '', isPrivate: false });
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const filteredGroups = mockGroups.filter(group =>
    searchQuery === '' ||
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header with Search and Create Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group Chat</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  placeholder="Enter group name..."
                  value={newGroupForm.name}
                  onChange={(e) => setNewGroupForm({...newGroupForm, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupDescription">Description</Label>
                <Input
                  id="groupDescription"
                  placeholder="What is this group about?"
                  value={newGroupForm.description}
                  onChange={(e) => setNewGroupForm({...newGroupForm, description: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={newGroupForm.isPrivate}
                  onChange={(e) => setNewGroupForm({...newGroupForm, isPrivate: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="isPrivate">Make this group private</Label>
              </div>
              <Button onClick={handleCreateGroup} disabled={!newGroupForm.name.trim()}>
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Group Categories */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Career Development', 'Interview Prep', 'Leadership', 'Remote Work'].map((category) => (
          <Badge 
            key={category} 
            variant="outline" 
            className="cursor-pointer hover:bg-accent"
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={group.avatar} />
                    <AvatarFallback>
                      <Hash className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{group.name}</h3>
                      {group.isPrivate && (
                        <Badge variant="secondary" className="text-xs">Private</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{group.category}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {group.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {group.memberCount} members
                </div>
                <span>{group.lastActivity}</span>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Join Chat
                </Button>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Groups Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Groups
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading your groups...
            </div>
          ) : groupChats && groupChats.length > 0 ? (
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {groupChats.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-group.png" />
                        <AvatarFallback>
                          <Hash className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-foreground">{group.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {group.members?.length || 0} members
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={group.is_active ? 'default' : 'secondary'}>
                        {group.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              You haven't joined any groups yet. Explore the groups above to get started!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupChatSystem;