import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAdvancedNetworking } from '@/hooks/useAdvancedNetworking';
import { Coins, ArrowUpDown, Plus, Handshake, Star } from 'lucide-react';
import { toast } from 'sonner';

export const SkillSwapNetwork = () => {
  const { user } = useAuth();
  const { createSkillExchange, loading } = useAdvancedNetworking();
  const [exchanges, setExchanges] = useState([]);
  const [userCredits, setUserCredits] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    skillOffered: '',
    skillSought: '',
    description: ''
  });

  useEffect(() => {
    fetchExchanges();
    if (user) fetchUserCredits();
  }, [user]);

  const fetchExchanges = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_exchanges')
        .select(`
          *,
          profiles!skill_exchanges_user_id_fkey(full_name, profile_picture_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExchanges(data || []);
    } catch (error) {
      console.error('Error fetching exchanges:', error);
    }
  };

  const fetchUserCredits = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_credits')
        .select('credits_balance')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserCredits(data?.credits_balance || 0);
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createSkillExchange(
      formData.skillOffered,
      formData.skillSought,
      formData.description
    );

    if (result.success) {
      toast.success('Skill exchange created successfully!');
      setFormData({ skillOffered: '', skillSought: '', description: '' });
      setIsDialogOpen(false);
      fetchExchanges();
    } else {
      toast.error('Failed to create skill exchange');
    }
  };

  const handleConnect = async (exchangeId: string) => {
    if (!user?.id) return;

    try {
      // Create a skill transaction to connect users
      const { error } = await supabase
        .from('skill_transactions')
        .insert({
          exchange_id: exchangeId,
          partner_user_id: user.id,
          transaction_type: 'exchange',
          status: 'pending'
        });

      if (error) throw error;
      toast.success('Connection request sent!');
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Failed to send connection request');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Skill Swap Network</h2>
          <p className="text-muted-foreground">Exchange skills with professionals and earn credits</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-amber-600">
            <Coins className="w-5 h-5" />
            <span className="font-semibold">{userCredits} Credits</span>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Exchange
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Skill Exchange</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Skill You Offer</label>
                  <Input
                    value={formData.skillOffered}
                    onChange={(e) => setFormData(prev => ({ ...prev, skillOffered: e.target.value }))}
                    placeholder="e.g., React Development"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Skill You Want</label>
                  <Input
                    value={formData.skillSought}
                    onChange={(e) => setFormData(prev => ({ ...prev, skillSought: e.target.value }))}
                    placeholder="e.g., UI/UX Design"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what you can teach and what you want to learn..."
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Creating...' : 'Create Exchange'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Exchanges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exchanges.map((exchange: any) => (
          <Card key={exchange.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={exchange.profiles?.profile_picture_url} />
                  <AvatarFallback>
                    {exchange.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{exchange.profiles?.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs text-muted-foreground">4.8</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Offers: {exchange.skill_offered}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3 h-3 text-muted-foreground" />
                  <Badge variant="outline">
                    Wants: {exchange.skill_sought}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {exchange.description}
              </p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => handleConnect(exchange.id)}
              >
                <Handshake className="w-4 h-4 mr-2" />
                Connect & Exchange
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {exchanges.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ArrowUpDown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No skill exchanges yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to create a skill exchange!</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Exchange
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};