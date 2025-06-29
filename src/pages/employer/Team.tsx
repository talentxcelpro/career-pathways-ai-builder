import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, ArrowLeft, Mail, MoreHorizontal, UserPlus } from "lucide-react";
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
  user_profile?: {
    full_name: string;
    email: string;
    profile_picture_url?: string;
  };
}

const EmployerTeam = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('recruiter');

  // Fetch team members
  const { data: teamData, isLoading } = useQuery({
    queryKey: ['company-team'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's company
      const { data: userTeamMember } = await supabase
        .from('company_team_members')
        .select('company_id')
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
            user_profile: profile || { full_name: 'Unknown User', email: 'No email' }
          };
        })
      );

      return {
        companyId: userTeamMember.company_id,
        members: membersWithProfiles || []
      };
    }
  });

  // Send invitation mutation (simplified for now)
  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      // For now, just show a success message
      // In a real implementation, you would send an email invitation
      console.log('Sending invitation to:', email, 'with role:', role);
    },
    onSuccess: () => {
      toast.success('Invitation sent successfully');
      setShowInviteForm(false);
      setInviteEmail('');
      setInviteRole('recruiter');
      queryClient.invalidateQueries({ queryKey: ['company-team'] });
    },
    onError: (error: any) => {
      toast.error('Failed to send invitation: ' + error.message);
    }
  });

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'recruiter': return 'bg-blue-100 text-blue-800';
      case 'hiring_manager': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

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
  const pendingInvites = teamMembers.filter(m => !m.is_active);

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
        <Button onClick={() => setShowInviteForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Team Member
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-green-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Invites</p>
                <p className="text-2xl font-bold">{pendingInvites.length}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-yellow-600"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
            <CardDescription>Send an invitation to join your hiring team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                    <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleInvite}
                disabled={inviteMutation.isPending}
              >
                <Mail className="h-4 w-4 mr-2" />
                {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
              <Button variant="outline" onClick={() => setShowInviteForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Manage your hiring team members and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
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
                    <TableCell>
                      <Badge className={getStatusColor(member.is_active)}>
                        {member.is_active ? 'Active' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'Pending'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No team members found</p>
              <p className="text-xs mt-1">Invite team members to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployerTeam;
