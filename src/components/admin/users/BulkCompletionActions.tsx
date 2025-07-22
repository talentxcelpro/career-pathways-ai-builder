import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Mail, Users, Target, TrendingDown, AlertCircle } from 'lucide-react';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BulkCompletionActionsProps {
  users: any[];
  onRefresh: () => void;
}

export const BulkCompletionActions: React.FC<BulkCompletionActionsProps> = ({
  users,
  onRefresh
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedThreshold, setSelectedThreshold] = useState<string>('50');
  const [isLoading, setIsLoading] = useState(false);
  const [includeNeverLoggedIn, setIncludeNeverLoggedIn] = useState(false);

  // Calculate users below threshold
  const getUsersForBulkReminder = () => {
    const threshold = parseInt(selectedThreshold);
    return users.filter(user => {
      const { percentage } = useProfileCompletion(user);
      const meetsThreshold = percentage < threshold;
      const meetsLoginCriteria = includeNeverLoggedIn || user.last_login_at;
      return meetsThreshold && meetsLoginCriteria && user.email;
    });
  };

  const eligibleUsers = getUsersForBulkReminder();

  const getCompletionStats = () => {
    const stats = {
      total: users.length,
      veryLow: 0,    // 0-25%
      low: 0,        // 26-50%
      medium: 0,     // 51-75%
      high: 0,       // 76-100%
      noEmail: 0,
      neverLoggedIn: 0
    };

    users.forEach(user => {
      const { percentage } = useProfileCompletion(user);
      
      if (!user.email) {
        stats.noEmail++;
        return;
      }

      if (!user.last_login_at) {
        stats.neverLoggedIn++;
      }

      if (percentage <= 25) stats.veryLow++;
      else if (percentage <= 50) stats.low++;
      else if (percentage <= 75) stats.medium++;
      else stats.high++;
    });

    return stats;
  };

  const stats = getCompletionStats();

  const handleBulkReminder = async () => {
    if (eligibleUsers.length === 0) {
      toast.error('No eligible users found for bulk reminder');
      return;
    }

    setIsLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      // Send reminders in batches of 5 to avoid overwhelming the system
      const batchSize = 5;
      for (let i = 0; i < eligibleUsers.length; i += batchSize) {
        const batch = eligibleUsers.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (user) => {
          try {
            const { percentage } = useProfileCompletion(user);
            
            const { error } = await supabase.functions.invoke('send-profile-reminder-email', {
              body: {
                userEmail: user.email,
                userName: user.full_name || 'User',
                completionPercentage: percentage,
                customMessage: `Your profile is ${percentage}% complete. Complete it now to get better job opportunities!`
              }
            });

            if (error) throw error;
            successCount++;
          } catch (error) {
            console.error('Error sending reminder to', user.email, error);
            errorCount++;
          }
        });

        await Promise.all(batchPromises);
        
        // Add delay between batches
        if (i + batchSize < eligibleUsers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Log bulk action
      const { error: logError } = await supabase.from('admin_activity_log').insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        action_type: 'bulk_profile_reminders_sent',
        details: {
          threshold_percentage: selectedThreshold,
          total_eligible: eligibleUsers.length,
          successful_sends: successCount,
          failed_sends: errorCount,
          include_never_logged_in: includeNeverLoggedIn
        }
      });

      if (logError) {
        console.error('Error logging bulk action:', logError);
      }

      if (successCount > 0) {
        toast.success(`Successfully sent ${successCount} profile completion reminders`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to send ${errorCount} reminders`);
      }

      setIsOpen(false);
      onRefresh();
    } catch (error) {
      console.error('Error in bulk reminder:', error);
      toast.error('Failed to send bulk reminders');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Profile Completion Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Completion Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{stats.veryLow}</div>
              <div className="text-xs text-muted-foreground">0-25%</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{stats.low}</div>
              <div className="text-xs text-muted-foreground">26-50%</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{stats.medium}</div>
              <div className="text-xs text-muted-foreground">51-75%</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{stats.high}</div>
              <div className="text-xs text-muted-foreground">76-100%</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-600">{stats.neverLoggedIn}</div>
              <div className="text-xs text-muted-foreground">Never Login</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Bulk Reminders
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Bulk Profile Completion Reminders</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Completion Threshold</Label>
                    <Select value={selectedThreshold} onValueChange={setSelectedThreshold}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">Below 25% (Very Low)</SelectItem>
                        <SelectItem value="50">Below 50% (Low)</SelectItem>
                        <SelectItem value="75">Below 75% (Medium)</SelectItem>
                        <SelectItem value="90">Below 90% (High)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeNeverLoggedIn" 
                      checked={includeNeverLoggedIn}
                      onCheckedChange={(checked) => setIncludeNeverLoggedIn(checked as boolean)}
                    />
                    <Label htmlFor="includeNeverLoggedIn" className="text-sm">
                      Include users who never logged in
                    </Label>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Preview</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {eligibleUsers.length} users will receive completion reminders
                    </div>
                    {eligibleUsers.length === 0 && (
                      <div className="flex items-center gap-1 text-orange-600 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs">No eligible users found</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleBulkReminder}
                      disabled={isLoading || eligibleUsers.length === 0}
                    >
                      {isLoading ? 'Sending...' : `Send ${eligibleUsers.length} Reminders`}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Badge variant="secondary" className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              {((stats.veryLow + stats.low) / stats.total * 100).toFixed(1)}% need attention
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};