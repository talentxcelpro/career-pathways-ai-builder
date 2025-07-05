
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  ArrowLeft, 
  Mail, 
  MoreHorizontal, 
  UserPlus, 
  Search,
  Edit,
  Trash2,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Copy,
  Send
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  invited_by?: string;
  user_profile?: {
    full_name: string;
    email: string;
    profile_picture_url?: string;
  };
}

interface TeamInvitation {
  id: string;
  invited_email: string;
  role: string;
  status: string;
  invited_at: string;
  expires_at: string;
  invited_by: string;
  invitation_token: string;
}

const EmployerTeam = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('recruiter');
  const [inviteMessage, setInviteMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Fetch team data
  const { data: teamData, isLoading } = useQuery({
    queryKey: ['company-team'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's company
      const { data: userTeamMember } = await supabase
        .from('company_team_members')
        .select('company_id, role')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!userTeamMember) throw new Error('No company found');

      // Get all team members
      const { data: teamMembers } = await supabase
        .from('company_team_members')
        .select('*')
        .eq('company_id', userTeamMember.company_id)
        .order('joined_at', { ascending: false });

      // Get profile data for each team member
      const membersWithProfiles = await Promise.all(
        (teamMembers || []).map(async (member) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, profile_picture_url')
            .eq('id', member.user_id)
            .single();
          
          return {
            ...member,
            user_profile: profile || { full_name: 'Unknown User', email: 'No email', profile_picture_url: null }
          };
        })
      );

      // Get team invitations
      const { data: invitations } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('company_id', userTeamMember.company_id)
        .order('invited_at', { ascending: false });

      return {
        companyId: userTeamMember.company_id,
        userRole: userTeamMember.role,
        members: membersWithProfiles || [],
        invitations: invitations || []
      };
    }
  });

  // Send invitation mutation
  const inviteMutation = useMutation({
    mutationFn: async ({ email, role, message }: { email: string; role: string; message?: string }) => {
      if (!teamData?.companyId) throw new Error('No company found');
      
      const { data, error } = await supabase
        .from('team_invitations')
        .insert({
          company_id: teamData.companyId,
          invited_email: email,
          role: role,
          invited_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully');
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('recruiter');
      setInviteMessage('');
      queryClient.invalidateQueries({ queryKey: ['company-team'] });
    },
    onError: (error: any) => {
      toast.error('Failed to send invitation: ' + error.message);
    }
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: string }) => {
      const { error } = await supabase
        .from('company_team_members')
        .update({ role: newRole as any })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Member role updated successfully');
      setShowEditMember(false);
      setSelectedMember(null);
      queryClient.invalidateQueries({ queryKey: ['company-team'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update role: ' + error.message);
    }
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('company_team_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Member removed successfully');
      queryClient.invalidateQueries({ queryKey: ['company-team'] });
    },
    onError: (error: any) => {
      toast.error('Failed to remove member: ' + error.message);
    }
  });

  // Cancel invitation mutation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Invitation cancelled');
      queryClient.invalidateQueries({ queryKey: ['company-team'] });
    },
    onError: (error: any) => {
      toast.error('Failed to cancel invitation: ' + error.message);
    }
  });

  // Search users
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, profile_picture_url')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Search error:', error);
      return;
    }

    // Filter out existing team members
    const existingUserIds = teamData?.members.map(m => m.user_id) || [];
    const filteredResults = (data || []).filter(user => !existingUserIds.includes(user.id));
    setSearchResults(filteredResults);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    inviteMutation.mutate({ 
      email: inviteEmail, 
      role: inviteRole, 
      message: inviteMessage 
    });
  };

  const handleDirectAdd = async (user: any) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .insert({
          company_id: teamData?.companyId,
          invited_email: user.email,
          role: 'recruiter',
          invited_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
      
      toast.success(`Invitation sent to ${user.full_name}`);
      setShowUserSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      queryClient.invalidateQueries({ queryKey: ['company-team'] });
    } catch (error: any) {
      toast.error('Failed to invite user: ' + error.message);
    }
  };

  const copyInvitationLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/employer/team/accept/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invitation link copied to clipboard');
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'recruiter': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'hiring_manager': return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canManageTeam = teamData?.userRole === 'owner' || teamData?.userRole === 'admin';

  if (isLoading) {
    return (
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const teamMembers = teamData?.members || [];
  const activeMembers = teamMembers.filter(m => m.is_active);
  const teamInvitations = teamData?.invitations || [];
  const pendingInvitations = teamInvitations.filter(inv => inv.status === 'pending');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => navigate('/employer')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Users className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">Manage your hiring team members and permissions</p>
          </div>
        </div>
        {canManageTeam && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowUserSearch(true)}>
              <Search className="h-4 w-4 mr-2" />
              Find Users
            </Button>
            <Button onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>
        )}
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Members</p>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Members</p>
                <p className="text-2xl font-bold">{activeMembers.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Invites</p>
                <p className="text-2xl font-bold">{pendingInvitations.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Your Role</p>
                <p className="text-lg font-semibold">{teamData?.userRole?.replace('_', ' ').toUpperCase()}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Search Dialog */}
      <Dialog open={showUserSearch} onOpenChange={setShowUserSearch}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Find Existing Users</DialogTitle>
            <DialogDescription>
              Search for existing platform users to invite to your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="pl-10"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user.profile_picture_url} />
                      <AvatarFallback>
                        {user.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleDirectAdd(user)}>
                    <Send className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                </div>
              ))}
              {searchQuery && searchResults.length === 0 && (
                <p className="text-center text-gray-500 py-4">No users found</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation to join your hiring team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer - Can view job applications</SelectItem>
                  <SelectItem value="recruiter">Recruiter - Can manage applications</SelectItem>
                  <SelectItem value="hiring_manager">Hiring Manager - Can post jobs</SelectItem>
                  {teamData?.userRole === 'owner' && (
                    <SelectItem value="admin">Admin - Full team management</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea 
                id="message"
                placeholder="Add a personal message to the invitation..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleInvite}
                disabled={inviteMutation.isPending}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={showEditMember} onOpenChange={setShowEditMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>Update team member role and permissions</DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={selectedMember.user_profile?.profile_picture_url} />
                  <AvatarFallback>
                    {selectedMember.user_profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedMember.user_profile?.full_name}</p>
                  <p className="text-sm text-gray-600">{selectedMember.user_profile?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  defaultValue={selectedMember.role} 
                  onValueChange={(value) => updateRoleMutation.mutate({ 
                    memberId: selectedMember.id, 
                    newRole: value 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                    {teamData?.userRole === 'owner' && (
                      <SelectItem value="admin">Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    removeMemberMutation.mutate(selectedMember.id);
                    setShowEditMember(false);
                  }}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Member
                </Button>
                <Button variant="outline" onClick={() => setShowEditMember(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Team Members ({activeMembers.length})</TabsTrigger>
          <TabsTrigger value="invitations">Invitations ({pendingInvitations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Active team members and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              {activeMembers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={member.user_profile?.profile_picture_url || ''} />
                              <AvatarFallback>
                                {member.user_profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.user_profile?.full_name || 'Unknown User'}</p>
                              <p className="text-sm text-gray-600">{member.user_profile?.email || 'No email'}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(member.role)}>
                            {member.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          {canManageTeam && member.role !== 'owner' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setShowEditMember(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Role
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => removeMemberMutation.mutate(member.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No active team members</p>
                  <p className="text-xs mt-1">Invite team members to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>Team Invitations</CardTitle>
              <CardDescription>Pending and sent invitations</CardDescription>
            </CardHeader>
            <CardContent>
              {teamInvitations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamInvitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <div className="font-medium">{invitation.invited_email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(invitation.role)}>
                            {invitation.role.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(invitation.status)}>
                            {invitation.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(invitation.invited_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {new Date(invitation.expires_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {canManageTeam && invitation.status === 'pending' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => copyInvitationLink(invitation.invitation_token)}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => cancelInvitationMutation.mutate(invitation.id)}
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No invitations sent</p>
                  <p className="text-xs mt-1">Send invitations to build your team</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployerTeam;
