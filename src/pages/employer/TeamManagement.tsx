import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  UserPlus, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MoreHorizontal,
  Shield,
  Trash2,
  Send,
  Copy,
  AlertCircle,
  UserCheck,
  UserX
} from 'lucide-react';
import { toast } from 'sonner';
import { useTeamPermissions } from '@/hooks/useTeamPermissions';
import { PendingAccessRequests } from '@/components/employer/PendingAccessRequests';
import { useEmployerAccess } from '@/hooks/useEmployerAccess';

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  user_profile?: {
    full_name: string;
    email: string;
    profile_picture_url?: string;
  };
}

interface PendingInvitation {
  id: string;
  invited_email: string;
  role: string;
  status: string;
  invited_at: string;
  expires_at: string;
  invitation_token: string;
  invited_by: string;
}

const TeamManagement = () => {
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('recruiter');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<string | null>(null);

  // Get employer access
  const { hasEmployerAccess } = useEmployerAccess();

  // Fetch current user and company data
  const { data: userData } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's company
      const { data: companies } = await supabase
        .from('company_team_members')
        .select('company_id, companies!inner(name)')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      return {
        user,
        companyId: companies?.[0]?.company_id || null,
        companyName: companies?.[0]?.companies?.name || null
      };
    }
  });

  // Get team permissions (after userData is available)
  const { hasPermission, role: userRole, companyId } = useTeamPermissions(userData?.companyId);
  const canManageTeam = hasPermission('manage_team');
  const canInviteMembers = hasPermission('invite_team_members');

  // Fetch team members
  const { data: teamMembers, isLoading: membersLoading } = useQuery({
    queryKey: ['team-members', userData?.companyId],
    queryFn: async () => {
      if (!userData?.companyId) return [];

      const { data: members } = await supabase
        .from('company_team_members')
        .select('*')
        .eq('company_id', userData.companyId)
        .eq('is_active', true);

      if (!members || members.length === 0) return [];

      // Get user profiles separately
      const userIds = members.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, profile_picture_url')
        .in('id', userIds);

      // Map profiles to members
      return members.map(member => ({
        ...member,
        user_profile: profiles?.find(p => p.id === member.user_id) || {
          full_name: 'Unknown User',
          email: 'No email',
          profile_picture_url: null
        }
      }));
    },
    enabled: !!userData?.companyId
  });

  // Fetch pending invitations
  const { data: pendingInvitations, isLoading: invitationsLoading } = useQuery({
    queryKey: ['pending-invitations', userData?.companyId],
    queryFn: async () => {
      if (!userData?.companyId) return [];

      const { data } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('company_id', userData.companyId)
        .eq('status', 'pending')
        .order('invited_at', { ascending: false });

      return data || [];
    },
    enabled: !!userData?.companyId
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      if (!userData?.companyId) throw new Error('No company found');

      const { data, error } = await supabase
        .from('team_invitations')
        .insert({
          company_id: userData.companyId,
          invited_email: email,
          role: role,
          invited_by: userData.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Team invitation sent successfully!');
      setShowInviteDialog(false);
      setInviteEmail('');
      setInviteRole('recruiter');
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
    },
    onError: (error: any) => {
      toast.error('Failed to send invitation: ' + error.message);
    }
  });

  // Accept invitation mutation (for users who received invitations)
  const acceptInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await supabase.rpc('accept_team_invitation', {
        invitation_token: pendingInvitations?.find(inv => inv.id === invitationId)?.invitation_token
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (result: any) => {
      if (result.success) {
        toast.success('Invitation accepted! Welcome to the team!');
        queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
        queryClient.invalidateQueries({ queryKey: ['team-members'] });
      } else {
        toast.error(result.error);
      }
    },
    onError: (error: any) => {
      toast.error('Failed to accept invitation: ' + error.message);
    }
  });

  // Reject invitation mutation (for users who received invitations)
  const rejectInvitationMutation = useMutation({
    mutationFn: async ({ invitationId, reason }: { invitationId: string; reason?: string }) => {
      const { error } = await supabase
        .from('team_invitations')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Invitation rejected');
      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedInvitation(null);
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
    },
    onError: (error: any) => {
      toast.error('Failed to reject invitation: ' + error.message);
    }
  });

  // Cancel invitation mutation (for admins/owners)
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
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
    },
    onError: (error: any) => {
      toast.error('Failed to cancel invitation: ' + error.message);
    }
  });

  // Remove team member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('company_team_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Team member removed');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (error: any) => {
      toast.error('Failed to remove member: ' + error.message);
    }
  });

  const handleSendInvitation = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    sendInvitationMutation.mutate({
      email: inviteEmail,
      role: inviteRole
    });
  };

  const copyInvitationLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/employer/team/accept/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invitation link copied to clipboard');
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner': return 'bg-red-100 text-red-700 border-red-200';
      case 'admin': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'recruiter': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Check if current user has a pending invitation (for approve/reject buttons)
  const userPendingInvitations = pendingInvitations?.filter(
    inv => inv.invited_email === userData?.user?.email
  ) || [];

  if (membersLoading || invitationsLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show access requests if user doesn't have employer access
  if (!hasEmployerAccess) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Team Management</h1>
          <p className="text-muted-foreground mb-6">
            You need employer access to manage team members
          </p>
        </div>
        <PendingAccessRequests />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your team members and invitations for {userData?.companyName}
          </p>
        </div>
        
        {(canInviteMembers || userRole === 'owner') && (
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSendInvitation}
                    disabled={sendInvitationMutation.isPending}
                  >
                    {sendInvitationMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Invitation
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Team Members ({teamMembers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-2" />
            Pending Invitations ({pendingInvitations?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="my-invitations">
            <Mail className="h-4 w-4 mr-2" />
            My Invitations ({userPendingInvitations.length})
          </TabsTrigger>
        </TabsList>

        {/* Team Members Tab */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Current Team Members</CardTitle>
              <CardDescription>
                Active members of your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.user_profile?.profile_picture_url} />
                        <AvatarFallback>
                          {member.user_profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{member.user_profile?.full_name}</h4>
                        <p className="text-sm text-muted-foreground">{member.user_profile?.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(member.role)}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                      {canManageTeam && member.role !== 'owner' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeMemberMutation.mutate(member.id)}
                          disabled={removeMemberMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!teamMembers || teamMembers.length === 0) && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
                    <p className="text-gray-600">Start by inviting your first team member</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pending Invitations Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>
                Invitations waiting for response
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingInvitations?.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{invitation.invited_email}</h4>
                      <p className="text-sm text-muted-foreground">
                        Invited {new Date(invitation.invited_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires {new Date(invitation.expires_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(invitation.role)}>
                        {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                      </Badge>
                      <Badge className={getStatusColor(invitation.status)}>
                        {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInvitationLink(invitation.invitation_token)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {canManageTeam && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelInvitationMutation.mutate(invitation.id)}
                          disabled={cancelInvitationMutation.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!pendingInvitations || pendingInvitations.length === 0) && (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h3>
                    <p className="text-gray-600">All invitations have been responded to</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Invitations Tab - For approve/reject */}
        <TabsContent value="my-invitations">
          <Card>
            <CardHeader>
              <CardTitle>Your Team Invitations</CardTitle>
              <CardDescription>
                Invitations you've received - approve or reject them here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPendingInvitations.map((invitation) => (
                  <div key={invitation.id} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900">
                          Invitation to join {userData?.companyName}
                        </h4>
                        <p className="text-sm text-blue-700">
                          Role: <strong>{invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}</strong>
                        </p>
                        <p className="text-xs text-blue-600">
                          Invited {new Date(invitation.invited_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptInvitationMutation.mutate(invitation.id)}
                          disabled={acceptInvitationMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedInvitation(invitation.id);
                            setShowRejectDialog(true);
                          }}
                          disabled={rejectInvitationMutation.isPending}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {userPendingInvitations.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending invitations</h3>
                    <p className="text-gray-600">You don't have any pending team invitations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Invitation</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this team invitation?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedInvitation) {
                    rejectInvitationMutation.mutate({
                      invitationId: selectedInvitation,
                      reason: rejectionReason
                    });
                  }
                }}
                disabled={rejectInvitationMutation.isPending}
              >
                {rejectInvitationMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Reject Invitation
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;