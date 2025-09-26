import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAdvancedNetworking } from '@/hooks/useAdvancedNetworking';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowUpDown, Users, Star, Clock } from 'lucide-react';

interface SkillExchange {
  id: string;
  user_id: string;
  skill_offered: string;
  skill_sought: string;
  description: string;
  status: string;
  created_at: string;
  profiles?: {
    full_name: string;
    profile_picture_url?: string;
    title?: string;
  };
}

const SkillSwap: React.FC = () => {
  const { user } = useAuth();
  const { createSkillExchange, loading } = useAdvancedNetworking();
  const [skillExchanges, setSkillExchanges] = useState<SkillExchange[]>([]);
  const [myExchanges, setMyExchanges] = useState<SkillExchange[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    skillOffered: '',
    skillSought: '',
    description: ''
  });

  useEffect(() => {
    fetchSkillExchanges();
    if (user?.id) {
      fetchMyExchanges();
    }
  }, [user?.id]);

  const fetchSkillExchanges = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_exchanges')
        .select(`
          *,
          profiles!skill_exchanges_user_id_fkey(full_name, profile_picture_url, title)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSkillExchanges(data || []);
    } catch (error) {
      console.error('Error fetching skill exchanges:', error);
    }
  };

  const fetchMyExchanges = async () => {
    try {
      const { data, error } = await supabase
        .from('skill_exchanges')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyExchanges(data || []);
    } catch (error) {
      console.error('Error fetching my exchanges:', error);
    }
  };

  const handleCreateExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createSkillExchange(
      formData.skillOffered,
      formData.skillSought,
      formData.description
    );

    if (result.success) {
      toast.success('Skill exchange created successfully!');
      setIsDialogOpen(false);
      setFormData({ skillOffered: '', skillSought: '', description: '' });
      fetchSkillExchanges();
      fetchMyExchanges();
    } else {
      toast.error('Failed to create skill exchange');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Skill Exchange</h1>
          <p className="text-muted-foreground">Exchange skills and knowledge with other professionals</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 lg:mt-0">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Create Exchange
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Skill Exchange</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateExchange} className="space-y-4">
              <div>
                <Label htmlFor="skillOffered">Skill I Can Offer</Label>
                <Input
                  id="skillOffered"
                  value={formData.skillOffered}
                  onChange={(e) => setFormData(prev => ({ ...prev, skillOffered: e.target.value }))}
                  placeholder="e.g., React Development, Digital Marketing"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="skillSought">Skill I'm Looking For</Label>
                <Input
                  id="skillSought"
                  value={formData.skillSought}
                  onChange={(e) => setFormData(prev => ({ ...prev, skillSought: e.target.value }))}
                  placeholder="e.g., UI/UX Design, Data Analysis"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your experience and what you're looking to learn..."
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Exchanges */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Available Skill Exchanges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillExchanges.filter(exchange => exchange.user_id !== user?.id).map((exchange) => (
                  <div key={exchange.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {exchange.profiles?.profile_picture_url ? (
                            <img 
                              src={exchange.profiles.profile_picture_url} 
                              alt={exchange.profiles.full_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold">{exchange.profiles?.full_name}</h4>
                          <p className="text-sm text-muted-foreground">{exchange.profiles?.title}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(exchange.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-green-600 mb-1">Offers:</p>
                        <Badge variant="secondary" className="bg-green-50 text-green-700">
                          {exchange.skill_offered}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-600 mb-1">Seeks:</p>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                          {exchange.skill_sought}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{exchange.description}</p>
                    
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </div>
                ))}
                
                {skillExchanges.filter(exchange => exchange.user_id !== user?.id).length === 0 && (
                  <div className="text-center py-8">
                    <ArrowUpDown className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No skill exchanges available yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Exchanges */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                My Exchanges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myExchanges.map((exchange) => (
                  <div key={exchange.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={exchange.status === 'active' ? 'default' : 'secondary'}>
                        {exchange.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(exchange.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-green-600">Offering:</p>
                        <p className="text-sm">{exchange.skill_offered}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-blue-600">Seeking:</p>
                        <p className="text-sm">{exchange.skill_sought}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {myExchanges.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No exchanges created yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SkillSwap;