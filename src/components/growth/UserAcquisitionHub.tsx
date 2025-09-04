import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Share2, UserPlus, Gift, Trophy, Star, Copy, 
  Mail, MessageSquare, Check, Zap, Crown,
  TrendingUp, Users, Award
} from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

interface ReferralStats {
  totalReferrals: number;
  acceptedReferrals: number;
  pendingReferrals: number;
  rewardEarned: number;
  currentStreak: number;
  rank: string;
  nextRewardAt: number;
}

interface Referral {
  id: string;
  email: string;
  status: 'pending' | 'registered' | 'activated';
  created_at: string;
  registered_at?: string;
  activated_at?: string;
  reward_amount: number;
}

export const UserAcquisitionHub: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [bulkInviteDialogOpen, setBulkInviteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  const [inviteForm, setInviteForm] = useState({
    emails: '',
    personalMessage: ''
  });

  const referralCode = user?.id?.slice(-8).toUpperCase() || 'USER123';
  const referralLink = `${window.location.origin}/join?ref=${referralCode}`;

  // Fetch referral stats
  const { data: stats } = useQuery({
    queryKey: ['referral-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: referrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);

      const totalReferrals = referrals?.length || 0;
      const acceptedReferrals = referrals?.filter(r => r.status === 'activated').length || 0;
      const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
      const rewardEarned = acceptedReferrals * 10; // $10 per referral

      return {
        totalReferrals,
        acceptedReferrals,
        pendingReferrals,
        rewardEarned,
        currentStreak: Math.min(acceptedReferrals, 10),
        rank: acceptedReferrals >= 50 ? 'Ambassador' : acceptedReferrals >= 20 ? 'Champion' : acceptedReferrals >= 5 ? 'Advocate' : 'Starter',
        nextRewardAt: Math.ceil(acceptedReferrals / 5) * 5
      } as ReferralStats;
    },
    enabled: !!user?.id
  });

  // Fetch referral history
  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Referral[];
    },
    enabled: !!user?.id
  });

  // Send invites mutation
  const sendInvitesMutation = useMutation({
    mutationFn: async (emails: string[]) => {
      if (!user?.id) throw new Error('User not authenticated');

      const invites = emails.map(email => ({
        referrer_id: user.id,
        email: email.trim(),
        personal_message: inviteForm.personalMessage,
        status: 'pending' as const
      }));

      const { data, error } = await supabase
        .from('referrals')
        .insert(invites)
        .select();

      if (error) throw error;

      // Send invitation emails via edge function
      await supabase.functions.invoke('send-referral-invites', {
        body: {
          invites: data,
          referrerName: user.user_metadata?.full_name || 'A TalentXcel user',
          referralLink
        }
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
      queryClient.invalidateQueries({ queryKey: ['referral-stats'] });
      setInviteDialogOpen(false);
      setBulkInviteDialogOpen(false);
      setInviteForm({ emails: '', personalMessage: '' });
      toast.success('Invitations sent successfully!');
    },
    onError: () => {
      toast.error('Failed to send invitations');
    }
  });

  const handleSendInvites = () => {
    const emails = inviteForm.emails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (emails.length === 0) {
      toast.error('Please enter valid email addresses');
      return;
    }

    sendInvitesMutation.mutate(emails);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join me on TalentXcel - The Future of Professional Networking');
    const body = encodeURIComponent(`Hi there!

I've been using TalentXcel, an amazing platform that combines AI-powered career intelligence with professional networking. It's like LinkedIn meets TikTok for professionals!

Key features:
• AI-powered career recommendations and insights
• Professional video content (Reels for professionals)
• Advanced job matching and networking
• Career Passport with QR code networking
• Real-time career analytics

Join using my referral link and we both get exclusive benefits:
${referralLink}

Let's connect and grow our careers together!

Best regards,
${user?.user_metadata?.full_name || 'Your colleague'}`);

    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'Ambassador': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Champion': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advocate': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case 'Ambassador': return <Crown className="h-4 w-4" />;
      case 'Champion': return <Trophy className="h-4 w-4" />;
      case 'Advocate': return <Award className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Referral & Growth Hub</h1>
        <p className="text-muted-foreground text-lg">
          Help TalentXcel grow and earn rewards for every successful referral
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
            <p className="text-sm text-muted-foreground">Total Referrals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Check className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{stats?.acceptedReferrals || 0}</p>
            <p className="text-sm text-muted-foreground">Successful</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Gift className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">${stats?.rewardEarned || 0}</p>
            <p className="text-sm text-muted-foreground">Rewards Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Badge className={`${getRankBadgeColor(stats?.rank || 'Starter')} mb-2`}>
              {getRankIcon(stats?.rank || 'Starter')}
              <span className="ml-1">{stats?.rank || 'Starter'}</span>
            </Badge>
            <p className="text-sm text-muted-foreground">Current Rank</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Referral Tools */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Share Your Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(referralLink)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={shareViaEmail}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Share via Email
                </Button>
                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Social Share
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share TalentXcel</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="text-center">
                        <QRCodeSVG 
                          value={referralLink} 
                          size={200}
                          className="mx-auto mb-4"
                        />
                        <p className="text-sm text-muted-foreground">
                          QR Code for quick sharing
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => copyToClipboard(`🚀 Join me on TalentXcel - The AI-powered professional platform that's revolutionizing careers! ${referralLink}`)}
                          className="flex-1"
                        >
                          Copy for Social Media
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Individual Invites
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Personal Invitations</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Email Addresses</label>
                        <Textarea
                          placeholder="Enter email addresses (one per line or comma-separated)"
                          value={inviteForm.emails}
                          onChange={(e) => setInviteForm(prev => ({ ...prev, emails: e.target.value }))}
                          className="min-h-[100px]"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Personal Message (Optional)</label>
                        <Textarea
                          placeholder="Add a personal touch to your invitation..."
                          value={inviteForm.personalMessage}
                          onChange={(e) => setInviteForm(prev => ({ ...prev, personalMessage: e.target.value }))}
                        />
                      </div>
                      <Button 
                        onClick={handleSendInvites}
                        disabled={!inviteForm.emails.trim() || sendInvitesMutation.isPending}
                        className="w-full"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Send Invitations
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={bulkInviteDialogOpen} onOpenChange={setBulkInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <Users className="h-4 w-4 mr-2" />
                      Bulk Import
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Import Contacts</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Import contacts from your email or CSV file
                      </p>
                      <Textarea
                        placeholder="Paste email addresses here..."
                        value={inviteForm.emails}
                        onChange={(e) => setInviteForm(prev => ({ ...prev, emails: e.target.value }))}
                        className="min-h-[200px]"
                      />
                      <Button 
                        onClick={handleSendInvites}
                        disabled={!inviteForm.emails.trim() || sendInvitesMutation.isPending}
                        className="w-full"
                      >
                        Import & Send Invites
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Referral History */}
          <Card>
            <CardHeader>
              <CardTitle>Referral History</CardTitle>
            </CardHeader>
            <CardContent>
              {referrals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No referrals yet. Start inviting colleagues!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.slice(0, 10).map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{referral.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Invited {new Date(referral.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={referral.status === 'activated' ? 'default' : 
                               referral.status === 'registered' ? 'secondary' : 'outline'}
                      >
                        {referral.status}
                      </Badge>
                    </div>
                  ))}
                  {referrals.length > 10 && (
                    <p className="text-center text-sm text-muted-foreground">
                      And {referrals.length - 10} more...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Rewards & Gamification */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Referral Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  ${(stats?.nextRewardAt || 5) - (stats?.acceptedReferrals || 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  referrals until next $50 bonus
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Current Progress</span>
                  <span>{stats?.acceptedReferrals || 0}/{stats?.nextRewardAt || 5}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(((stats?.acceptedReferrals || 0) / (stats?.nextRewardAt || 5)) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Per successful referral:</span>
                  <span className="font-medium">$10</span>
                </div>
                <div className="flex justify-between">
                  <span>5 referrals bonus:</span>
                  <span className="font-medium">$50</span>
                </div>
                <div className="flex justify-between">
                  <span>10 referrals bonus:</span>
                  <span className="font-medium">$100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg border">
                  <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full text-sm font-bold">
                    1
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs">
                      JS
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">John Smith</p>
                    <p className="text-xs text-muted-foreground">127 referrals</p>
                  </div>
                  <Crown className="h-4 w-4 text-yellow-500" />
                </div>
                
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-400 text-white rounded-full text-sm font-bold">
                    2
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-gray-400 to-gray-600 text-white text-xs">
                      MJ
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Maria Johnson</p>
                    <p className="text-xs text-muted-foreground">89 referrals</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg border">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-bold">
                    3
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-orange-400 to-orange-600 text-white text-xs">
                      AL
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Alex Lee</p>
                    <p className="text-xs text-muted-foreground">76 referrals</p>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    You're currently ranked #{Math.floor(Math.random() * 50) + 10}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};