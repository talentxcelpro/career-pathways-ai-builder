import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSecurityManagement } from '@/hooks/useSecurityManagement';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Shield, Ban, Clock, Globe, AlertTriangle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const IPManagementPanel = () => {
  const { 
    blockedIPs, 
    failedLogins, 
    blockedIPsLoading, 
    blockIP, 
    unblockIP,
    blockingIP,
    unblockingIP
  } = useSecurityManagement();
  
  const [newIPAddress, setNewIPAddress] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [isPermanentBlock, setIsPermanentBlock] = useState(false);
  const [blockDuration, setBlockDuration] = useState('24');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleBlockIP = () => {
    if (!newIPAddress || !blockReason) return;
    
    const expiresAt = isPermanentBlock ? undefined : 
      new Date(Date.now() + (parseInt(blockDuration) * 60 * 60 * 1000)).toISOString();
    
    blockIP({
      ipAddress: newIPAddress,
      reason: blockReason,
      isPermanent: isPermanentBlock,
      expiresAt
    });
    
    // Reset form
    setNewIPAddress('');
    setBlockReason('');
    setIsPermanentBlock(false);
    setBlockDuration('24');
    setIsDialogOpen(false);
  };

  const handleUnblockIP = (ipBlockId: string) => {
    unblockIP(ipBlockId);
  };

  const isValidIP = (ip: string) => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  return (
    <div className="space-y-6">
      {/* Failed Login Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Failed Login Attempts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!failedLogins || failedLogins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
              No failed login attempts detected recently.
            </div>
          ) : (
            <div className="space-y-4">
              {failedLogins.slice(0, 10).map((attempt) => (
                <div key={attempt.id} className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-950">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{String(attempt.ip_address)}</span>
                        <Badge variant="destructive">
                          {attempt.attempt_count} attempts
                        </Badge>
                        {attempt.blocked_until && new Date(attempt.blocked_until) > new Date() && (
                          <Badge variant="outline" className="text-red-600">
                            <Clock className="w-3 h-3 mr-1" />
                            Temporarily Blocked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Email attempted: {attempt.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Last attempt: {formatDistanceToNow(new Date(attempt.last_attempt_at), { addSuffix: true })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        First attempt: {formatDistanceToNow(new Date(attempt.first_attempt_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!blockedIPs?.some(blocked => blocked.ip_address === attempt.ip_address) && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setNewIPAddress(String(attempt.ip_address));
                            setBlockReason(`Multiple failed login attempts (${attempt.attempt_count} attempts)`);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Block IP
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* IP Blocklist Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              Blocked IP Addresses ({blockedIPs?.length || 0})
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Ban className="w-4 h-4 mr-2" />
                  Block IP
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Block IP Address</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ip-address">IP Address</Label>
                    <Input
                      id="ip-address"
                      placeholder="e.g., 192.168.1.1 or 2001:db8::1"
                      value={newIPAddress}
                      onChange={(e) => setNewIPAddress(e.target.value)}
                      className={!newIPAddress || isValidIP(newIPAddress) ? '' : 'border-red-500'}
                    />
                    {newIPAddress && !isValidIP(newIPAddress) && (
                      <p className="text-sm text-red-600 mt-1">Please enter a valid IP address</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="block-reason">Reason for Blocking</Label>
                    <Textarea
                      id="block-reason"
                      placeholder="Enter the reason for blocking this IP..."
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="permanent-block">Permanent Block</Label>
                    <Switch
                      id="permanent-block"
                      checked={isPermanentBlock}
                      onCheckedChange={setIsPermanentBlock}
                    />
                  </div>

                  {!isPermanentBlock && (
                    <div>
                      <Label htmlFor="block-duration">Block Duration</Label>
                      <Select value={blockDuration} onValueChange={setBlockDuration}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Hour</SelectItem>
                          <SelectItem value="24">24 Hours</SelectItem>
                          <SelectItem value="168">7 Days</SelectItem>
                          <SelectItem value="720">30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={handleBlockIP}
                      disabled={!newIPAddress || !blockReason || !isValidIP(newIPAddress) || blockingIP}
                    >
                      {blockingIP ? 'Blocking...' : 'Block IP'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {blockedIPsLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          ) : !blockedIPs || blockedIPs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 text-green-500" />
              No IP addresses are currently blocked.
            </div>
          ) : (
            <div className="space-y-4">
              {blockedIPs.map((blockedIP) => {
                const isExpired = blockedIP.expires_at && new Date(blockedIP.expires_at) <= new Date();
                const isActive = blockedIP.is_permanent || (!isExpired && (!blockedIP.expires_at || new Date(blockedIP.expires_at) > new Date()));
                
                return (
                  <div 
                    key={blockedIP.id} 
                    className={`border rounded-lg p-4 ${
                      isActive 
                        ? 'border-red-200 bg-red-50 dark:bg-red-950' 
                        : 'border-gray-200 bg-gray-50 dark:bg-gray-950 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="w-4 h-4" />
                          <span className="font-medium">{String(blockedIP.ip_address)}</span>
                          <Badge variant={isActive ? "destructive" : "secondary"}>
                            {isActive ? 'Blocked' : 'Expired'}
                          </Badge>
                          <Badge variant="outline">
                            {blockedIP.block_type}
                          </Badge>
                          {blockedIP.is_permanent && (
                            <Badge variant="destructive">Permanent</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Reason: {blockedIP.reason}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Blocked: {formatDistanceToNow(new Date(blockedIP.blocked_at), { addSuffix: true })}
                        </p>
                        {typeof blockedIP.profiles === 'object' && blockedIP.profiles && 'full_name' in blockedIP.profiles && (
                          <p className="text-sm text-muted-foreground mb-1">
                            By: {(blockedIP.profiles as any).full_name} {(blockedIP.profiles as any).email && `(${(blockedIP.profiles as any).email})`}
                          </p>
                        )}
                        {blockedIP.expires_at && !blockedIP.is_permanent && (
                          <p className="text-sm text-muted-foreground">
                            {isExpired 
                              ? `Expired: ${new Date(blockedIP.expires_at).toLocaleString()}`
                              : `Expires: ${new Date(blockedIP.expires_at).toLocaleString()}`
                            }
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUnblockIP(blockedIP.id)}
                          disabled={unblockingIP}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {unblockingIP ? 'Unblocking...' : 'Unblock'}
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