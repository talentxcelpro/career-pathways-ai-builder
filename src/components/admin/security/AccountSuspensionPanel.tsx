import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSecurityManagement } from '@/hooks/useSecurityManagement';
import { useUserManagement } from '@/hooks/useUserManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Shield, Clock, CheckCircle, Ban } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const AccountSuspensionPanel = () => {
  const { 
    suspendAccount, 
    reactivateAccount, 
    suspendingAccount, 
    reactivatingAccount 
  } = useSecurityManagement();
  
  const { filteredUsers } = useUserManagement();
  
  const [selectedUser, setSelectedUser] = useState('');
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspensionDuration, setSuspensionDuration] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSuspendAccount = () => {
    if (!selectedUser || !suspensionReason) return;
    
    const durationHours = suspensionDuration === 'permanent' ? undefined : parseInt(suspensionDuration);
    
    suspendAccount({
      userId: selectedUser,
      reason: suspensionReason,
      durationHours
    });
    
    // Reset form
    setSelectedUser('');
    setSuspensionReason('');
    setSuspensionDuration('');
    setIsDialogOpen(false);
  };

  const handleReactivateAccount = (userId: string) => {
    reactivateAccount(userId);
  };

  // Get suspended users from filtered users (placeholder - implement with proper query)
  const suspendedUsers: any[] = [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              Account Suspension Management
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Suspend Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Suspend User Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="user-select">Select User</Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user to suspend" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredUsers?.filter(user => 
                          !Array.isArray(user.user_security_settings) || !user.user_security_settings.some((setting: any) => setting?.account_status === 'suspended')
                        ).map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="duration-select">Suspension Duration</Label>
                    <Select value={suspensionDuration} onValueChange={setSuspensionDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Hour</SelectItem>
                        <SelectItem value="24">24 Hours</SelectItem>
                        <SelectItem value="168">7 Days</SelectItem>
                        <SelectItem value="720">30 Days</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="suspension-reason">Reason for Suspension</Label>
                    <Textarea
                      id="suspension-reason"
                      placeholder="Enter the reason for suspension..."
                      value={suspensionReason}
                      onChange={(e) => setSuspensionReason(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleSuspendAccount}
                      disabled={!selectedUser || !suspensionReason || !suspensionDuration || suspendingAccount}
                    >
                      {suspendingAccount ? 'Suspending...' : 'Suspend Account'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {suspendedUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
              No suspended accounts. All users are currently active.
            </div>
          ) : (
            <div className="space-y-4">
              {suspendedUsers.map((user) => {
                const securitySettings = user.user_security_settings?.[0];
                const isLockoutActive = securitySettings?.lockout_until && new Date(securitySettings.lockout_until) > new Date();
                
                return (
                  <div key={user.id} className="border border-red-200 rounded-lg p-4 bg-red-50 dark:bg-red-950">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{user.full_name}</h3>
                          <Badge variant="destructive">
                            <Ban className="w-3 h-3 mr-1" />
                            Suspended
                          </Badge>
                          {isLockoutActive && (
                            <Badge variant="outline" className="text-orange-600">
                              <Clock className="w-3 h-3 mr-1" />
                              Temporary
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Email: {user.email}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Role: {user.user_role || 'User'}
                        </p>
                        {securitySettings?.lockout_until && (
                          <p className="text-sm text-orange-600 font-medium">
                            {isLockoutActive 
                              ? `Suspended until: ${new Date(securitySettings.lockout_until).toLocaleString()}`
                              : 'Suspension period has expired'
                            }
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          Account created: {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReactivateAccount(user.id)}
                          disabled={reactivatingAccount}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {reactivatingAccount ? 'Reactivating...' : 'Reactivate'}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};