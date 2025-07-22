import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Users, Mail, Send, UserCheck, UserX, AlertTriangle, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BulkActionsToolbarProps {
  selectedUsers: any[];
  allUsers: any[];
  onClearSelection: () => void;
  onRefresh: () => void;
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedUsers,
  allUsers,
  onClearSelection,
  onRefresh
}) => {
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailType, setEmailType] = useState<string>('welcome');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const emailTemplates = {
    welcome: {
      subject: 'Welcome to TalentXcel!',
      message: 'Welcome to our platform! We\'re excited to have you join our community of professionals.'
    },
    reactivation: {
      subject: 'We miss you at TalentXcel',
      message: 'It\'s been a while since your last visit. Check out the new opportunities waiting for you!'
    },
    profile_completion: {
      subject: 'Complete Your Profile to Get Noticed',
      message: 'A complete profile helps you get discovered by top employers. Take a few minutes to finish yours!'
    },
    custom: {
      subject: '',
      message: ''
    }
  };

  const filteredUsers = roleFilter === 'all' 
    ? selectedUsers 
    : selectedUsers.filter(user => user.user_role === roleFilter);

  useEffect(() => {
    const template = emailTemplates[emailType as keyof typeof emailTemplates];
    if (template && emailType !== 'custom') {
      setCustomSubject(template.subject);
      setCustomMessage(template.message);
    }
  }, [emailType]);

  const handleBulkEmail = async () => {
    if (filteredUsers.length === 0) {
      toast.error('No users selected for email campaign');
      return;
    }

    setIsLoading(true);
    try {
      const emailData = {
        recipients: filteredUsers.map(user => ({
          email: user.email,
          name: user.full_name || 'User'
        })),
        subject: customSubject,
        message: customMessage,
        emailType
      };

      const { error } = await supabase.functions.invoke('send-bulk-email-campaign', {
        body: emailData
      });

      if (error) throw error;

      // Log the bulk action
      await supabase.from('admin_activity_log').insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'bulk_email_sent',
        details: {
          email_type: emailType,
          recipient_count: filteredUsers.length,
          role_filter: roleFilter,
          subject: customSubject
        }
      });

      toast.success(`Email campaign sent to ${filteredUsers.length} users`);
      setIsEmailDialogOpen(false);
      onClearSelection();
    } catch (error) {
      console.error('Error sending bulk email:', error);
      toast.error('Failed to send email campaign');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkActivation = async (action: 'activate' | 'deactivate') => {
    if (selectedUsers.length === 0) return;

    setIsLoading(true);
    try {
      const updates = selectedUsers.map(user =>
        supabase
          .from('profiles')
          .update({ profile_completed: action === 'activate' })
          .eq('id', user.id)
      );

      await Promise.all(updates);

      await supabase.from('admin_activity_log').insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: `bulk_user_${action}`,
        details: {
          affected_users: selectedUsers.length,
          user_ids: selectedUsers.map(u => u.id)
        }
      });

      toast.success(`${selectedUsers.length} users ${action}d successfully`);
      onClearSelection();
      onRefresh();
    } catch (error) {
      console.error(`Error ${action}ing users:`, error);
      toast.error(`Failed to ${action} users`);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedUsers.length === 0) return null;

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Bulk Actions ({selectedUsers.length} selected)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Bulk Email Campaign</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email Template</Label>
                    <Select value={emailType} onValueChange={setEmailType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">Welcome Email</SelectItem>
                        <SelectItem value="reactivation">Reactivation Email</SelectItem>
                        <SelectItem value="profile_completion">Profile Completion</SelectItem>
                        <SelectItem value="custom">Custom Message</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Target Role</Label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Selected Users</SelectItem>
                        <SelectItem value="job_seeker">Job Seekers Only</SelectItem>
                        <SelectItem value="employer">Employers Only</SelectItem>
                        <SelectItem value="candidate">Candidates Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Subject Line</Label>
                  <Input
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter email subject..."
                  />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={6}
                    placeholder="Enter your email message..."
                  />
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Send className="h-4 w-4" />
                    <span className="font-medium">Campaign Preview</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Recipients:</strong> {filteredUsers.length} users</p>
                    <p><strong>Subject:</strong> {customSubject}</p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkEmail}
                    disabled={isLoading || !customSubject || !customMessage}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send Campaign
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => handleBulkActivation('activate')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Activate Users
          </Button>

          <Button
            variant="outline"
            onClick={() => handleBulkActivation('deactivate')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <UserX className="h-4 w-4" />
            Deactivate Users
          </Button>

          <Button
            variant="ghost"
            onClick={onClearSelection}
            className="flex items-center gap-2"
          >
            Clear Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};