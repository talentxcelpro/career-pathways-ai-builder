import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Calendar, MapPin, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  course_id?: string;
  learning_path_id?: string;
  max_members: number;
  is_public: boolean;
  meeting_schedule?: string;
  status: string;
  member_count: number;
  is_member: boolean;
  creator_name: string;
  course_title?: string;
}

interface CreateGroupData {
  name: string;
  description: string;
  course_id?: string;
  max_members: number;
  is_public: boolean;
  meeting_schedule: string;
}

export const StudyGroups: React.FC = () => {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  const [createData, setCreateData] = useState<CreateGroupData>({
    name: '',
    description: '',
    max_members: 10,
    is_public: true,
    meeting_schedule: ''
  });

  useEffect(() => {
    fetchStudyGroups();
  }, []);

  const fetchStudyGroups = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all public study groups with member counts and user membership info
      const { data: allGroups } = await supabase
        .from('study_groups')
        .select(`
          *,
          study_group_members!inner (count),
          study_group_members!left (
            user_id,
            is_active
          ),
          profiles!study_groups_creator_id_fkey (
            full_name
          ),
          courses (
            title
          )
        `)
        .eq('status', 'active')
        .eq('is_public', true);

      if (allGroups) {
        const groupsWithInfo = allGroups.map(group => ({
          ...group,
          member_count: group.study_group_members?.length || 0,
          is_member: group.study_group_members?.some(
            (member: any) => member.user_id === user.id && member.is_active
          ) || false,
          creator_name: group.profiles?.full_name || 'Unknown',
          course_title: group.courses?.title
        }));

        setStudyGroups(groupsWithInfo);
      }

      // Fetch user's groups (created or joined)
      const { data: userGroups } = await supabase
        .from('study_groups')
        .select(`
          *,
          study_group_members!inner (count),
          profiles!study_groups_creator_id_fkey (
            full_name
          ),
          courses (
            title
          )
        `)
        .or(`creator_id.eq.${user.id},study_group_members.user_id.eq.${user.id}`)
        .eq('status', 'active');

      if (userGroups) {
        const myGroupsWithInfo = userGroups.map(group => ({
          ...group,
          member_count: group.study_group_members?.length || 0,
          is_member: true,
          creator_name: group.profiles?.full_name || 'Unknown',
          course_title: group.courses?.title
        }));

        setMyGroups(myGroupsWithInfo);
      }

    } catch (error) {
      console.error('Error fetching study groups:', error);
      toast.error("Failed to load study groups");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to create a study group");
        return;
      }

      if (!createData.name.trim()) {
        toast.error("Please enter a group name");
        return;
      }

      const { data: newGroup, error } = await supabase
        .from('study_groups')
        .insert({
          name: createData.name,
          description: createData.description,
          creator_id: user.id,
          course_id: createData.course_id || null,
          max_members: createData.max_members,
          is_public: createData.is_public,
          meeting_schedule: createData.meeting_schedule,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Create group error:', error);
        toast.error("Failed to create study group");
        return;
      }

      // Auto-join the creator as admin
      await supabase
        .from('study_group_members')
        .insert({
          group_id: newGroup.id,
          user_id: user.id,
          role: 'admin'
        });

      toast.success("Study group created successfully!");
      setShowCreateDialog(false);
      setCreateData({
        name: '',
        description: '',
        max_members: 10,
        is_public: true,
        meeting_schedule: ''
      });
      fetchStudyGroups();
    } catch (error) {
      console.error('Create group error:', error);
      toast.error("An error occurred while creating the group");
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to join study groups");
        return;
      }

      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (error) {
        console.error('Join group error:', error);
        toast.error("Failed to join study group");
        return;
      }

      toast.success("Successfully joined study group!");
      fetchStudyGroups();
    } catch (error) {
      console.error('Join group error:', error);
      toast.error("An error occurred while joining the group");
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('study_group_members')
        .update({ is_active: false })
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Leave group error:', error);
        toast.error("Failed to leave study group");
        return;
      }

      toast.success("Left study group");
      fetchStudyGroups();
    } catch (error) {
      console.error('Leave group error:', error);
      toast.error("An error occurred while leaving the group");
    }
  };

  const filteredGroups = (activeTab === 'all' ? studyGroups : myGroups).filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 bg-muted rounded mb-4" />
                <div className="h-8 bg-muted rounded" />
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
          <h2 className="text-2xl font-bold">Study Groups</h2>
          <p className="text-muted-foreground">Join collaborative learning communities</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
              <DialogDescription>
                Create a new study group to learn with others
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  value={createData.name}
                  onChange={(e) => setCreateData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter group name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={createData.description}
                  onChange={(e) => setCreateData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your study group"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Meeting Schedule</label>
                <Input
                  value={createData.meeting_schedule}
                  onChange={(e) => setCreateData(prev => ({ ...prev, meeting_schedule: e.target.value }))}
                  placeholder="e.g., Wednesdays 7 PM EST"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Max Members</label>
                <Select
                  value={createData.max_members.toString()}
                  onValueChange={(value) => setCreateData(prev => ({ ...prev, max_members: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 members</SelectItem>
                    <SelectItem value="10">10 members</SelectItem>
                    <SelectItem value="15">15 members</SelectItem>
                    <SelectItem value="20">20 members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleCreateGroup} className="w-full">
                Create Study Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-1">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
          >
            All Groups
          </Button>
          <Button
            variant={activeTab === 'my' ? 'default' : 'outline'}
            onClick={() => setActiveTab('my')}
          >
            My Groups
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-[300px]"
          />
        </div>
      </div>

      {/* Study Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {group.description}
                  </CardDescription>
                </div>
                <Badge variant={group.is_public ? 'secondary' : 'outline'}>
                  {group.is_public ? 'Public' : 'Private'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {group.member_count}/{group.max_members} members
                </div>
                <div>
                  by {group.creator_name}
                </div>
              </div>

              {group.course_title && (
                <div className="text-sm">
                  <Badge variant="outline">{group.course_title}</Badge>
                </div>
              )}

              {group.meeting_schedule && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {group.meeting_schedule}
                </div>
              )}

              <div className="pt-2">
                {group.is_member ? (
                  <Button
                    variant="outline"
                    onClick={() => handleLeaveGroup(group.id)}
                    className="w-full"
                  >
                    Leave Group
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={group.member_count >= group.max_members}
                    className="w-full"
                  >
                    {group.member_count >= group.max_members ? "Full" : "Join Group"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {activeTab === 'all' ? 'No Study Groups Found' : 'No Groups Joined Yet'}
            </h3>
            <p className="text-muted-foreground text-center">
              {activeTab === 'all' 
                ? 'Try adjusting your search or create a new study group'
                : 'Join existing groups or create your own to start collaborating'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};