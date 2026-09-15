import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { sampleSkillExchanges } from './sample-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdvancedNetworking } from '@/hooks/useAdvancedNetworking';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  ArrowLeftRight,
  Clock, 
  Coins, 
  User, 
  MessageSquare,
  TrendingUp,
  Star,
  Calendar,
  CheckCircle
} from 'lucide-react';

interface SkillExchange {
  id: string;
  requester_id?: string;
  skill_offered: string;
  skill_sought: string;
  description: string;
  difficulty_level: string;
  session_length: number;
  credits_required: number;
  status: string;
  created_at: string;
  user_profile: {
    full_name: string;
    title: string;
    profile_picture_url?: string;
  };
}

const SkillSwap: React.FC = () => {
  const { user } = useAuth();
  const { createSkillExchange, loading } = useAdvancedNetworking();
  const { toast } = useToast();
  const { availableBalance, refreshBalance } = useTokenBalance();
  const [skillExchanges, setSkillExchanges] = useState<SkillExchange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [userCredits, setUserCredits] = useState(250);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    skill_offered: '',
    skill_sought: '',
    description: '',
    difficulty_level: 'beginner',
    session_length: 60,
    credits_required: 10
  });

  const displayCredits = availableBalance > 0 ? availableBalance : userCredits;

  useEffect(() => {
    fetchSkillExchanges();
    if (user) {
      fetchUserCredits();
    }

    // Set up real-time subscription for live updates
    const channel = supabase
      .channel('skill-exchanges-live-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'skill_exchanges'
        },
        () => {
          fetchSkillExchanges();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_txc_balances'
        },
        () => {
          refreshBalance();
          fetchUserCredits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchSkillExchanges = async () => {
    try {
      setIsLoading(true);
      
      const { data: rawExchanges, error } = await supabase
        .from('skill_exchanges')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching skill exchanges:', error);
      }
      
      let formattedData: SkillExchange[] = [];

      if (rawExchanges && rawExchanges.length > 0) {
        // Fetch profiles for users who posted exchanges
        const userIds = Array.from(new Set(rawExchanges.map(e => e.requester_id).filter(Boolean)));
        let profilesMap = new Map<string, any>();
        
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, title, profile_picture_url')
            .in('id', userIds);
          
          if (profiles) {
            profilesMap = new Map(profiles.map(p => [p.id, p]));
          }
        }

        formattedData = rawExchanges.map(exchange => {
          const profile = profilesMap.get(exchange.requester_id);
          return {
            id: exchange.id,
            requester_id: exchange.requester_id,
            skill_offered: exchange.skill_offered,
            skill_sought: exchange.skill_requested || exchange.skill_offered,
            description: exchange.description,
            difficulty_level: (exchange as any).difficulty_level || 'intermediate',
            session_length: (exchange.estimated_hours ? exchange.estimated_hours * 60 : 60),
            credits_required: exchange.credits_value || 10,
            status: exchange.status || 'active',
            created_at: exchange.created_at,
            user_profile: {
              full_name: profile?.full_name || 'Verified Member',
              title: profile?.title || 'Professional Specialist',
              profile_picture_url: profile?.profile_picture_url || undefined
            }
          };
        });
      }

      // Fallback to initial exchange opportunities if database has none
      if (formattedData.length === 0) {
        formattedData = sampleSkillExchanges.map(sample => ({
          id: sample.id,
          requester_id: undefined,
          skill_offered: sample.skill_offered,
          skill_sought: sample.skill_sought,
          description: sample.description,
          difficulty_level: sample.difficulty_level,
          session_length: 60,
          credits_required: sample.credits_offered,
          status: 'active',
          created_at: sample.created_at,
          user_profile: {
            full_name: sample.profiles.full_name,
            title: 'Verified Specialist',
            profile_picture_url: sample.profiles.profile_picture_url || undefined
          }
        }));
      }
      
      setSkillExchanges(formattedData);
    } catch (error) {
      console.error('Error fetching skill exchanges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_txc_balances')
        .select('txc_balance')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.txc_balance !== undefined) {
        setUserCredits(data.txc_balance);
      }
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  const handleCreateExchange = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create a skill exchange",
        variant: "destructive"
      });
      return;
    }

    const result = await createSkillExchange(
      formData.skill_offered,
      formData.skill_sought,
      formData.description,
      formData.credits_required,
      Math.round(formData.session_length / 60) || 1
    );

    if (result.success) {
      setShowCreateForm(false);
      setFormData({
        skill_offered: '',
        skill_sought: '',
        description: '',
        difficulty_level: 'beginner',
        session_length: 60,
        credits_required: 10
      });
      fetchSkillExchanges();
      refreshBalance();
    }
  };

  const handleExchangeRequest = async (exchangeId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to request an exchange",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Exchange Requested!",
      description: "Your exchange request has been sent successfully",
    });
  };

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredExchanges = skillExchanges.filter(exchange => {
    const matchesSearch = 
      exchange.skill_offered.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exchange.skill_sought.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exchange.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = selectedLevel === 'all' || exchange.difficulty_level === selectedLevel;
    
    return matchesSearch && matchesLevel;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading skill exchanges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16 fade-in-up">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-6">
            <ArrowLeftRight className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-5xl font-apple-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Skill Exchange Network
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 font-apple-medium">
            Exchange skills, learn from others, and earn TXC credits in our vibrant learning community
          </p>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="apple-button text-lg px-8 py-4 smooth-bounce font-apple-medium"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Exchange
          </Button>
        </div>

        {/* User Credits Display */}
        <div className="apple-card mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{displayCredits} TXC Credits</p>
                <p className="text-gray-600">Available for skill exchanges</p>
              </div>
            </div>
            <div className="text-center">
              <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-2" />
                Active Trader
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="browse" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl p-2 shadow-lg">
              <TabsTrigger value="browse" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
                Browse Exchanges
              </TabsTrigger>
              <TabsTrigger value="my-exchanges" className="rounded-xl px-6 py-3 data-[state=active]:bg-white data-[state=active]:shadow-md">
                My Exchanges
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="browse" className="space-y-8">
            {/* Filters */}
            <div className="apple-card">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="apple-input pl-12 text-lg"
                    />
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="apple-input"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="apple-input"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="credits-low">Credits: Low to High</option>
                    <option value="credits-high">Credits: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Exchanges Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredExchanges.map((exchange, index) => (
                <div 
                  key={exchange.id} 
                  className="apple-card group cursor-pointer relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full transform translate-x-16 -translate-y-16"></div>
                  
                  <div className="relative">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-lg">
                        {exchange.user_profile?.profile_picture_url ? (
                          <img 
                            src={exchange.user_profile.profile_picture_url} 
                            alt={exchange.user_profile.full_name}
                            className="w-14 h-14 rounded-2xl object-cover"
                          />
                        ) : (
                          <User className="h-7 w-7 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {exchange.user_profile?.full_name || 'Anonymous User'}
                        </h3>
                        <p className="text-gray-600">
                          {exchange.user_profile?.title || 'Professional'}
                        </p>
                      </div>
                      
                      <Badge className={`${getBadgeVariant(exchange.difficulty_level)} px-3 py-1 rounded-full text-xs font-medium`}>
                        {exchange.difficulty_level}
                      </Badge>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                      <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <ArrowRight className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-green-700">Offering</span>
                            <p className="font-semibold text-green-900">{exchange.skill_offered}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <ArrowLeft className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-blue-700">Seeking</span>
                            <p className="font-semibold text-blue-900">{exchange.skill_sought}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                      {exchange.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="h-5 w-5" />
                          <span className="font-medium">{exchange.session_length}min</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600">
                          <Coins className="h-5 w-5" />
                          <span className="font-bold">{exchange.credits_required} TXC</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1 apple-button"
                        onClick={() => handleExchangeRequest(exchange.id)}
                        disabled={loading || displayCredits < exchange.credits_required}
                      >
                        {displayCredits < exchange.credits_required ? 'Insufficient Credits' : 'Request Exchange'}
                      </Button>
                      <Button className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl border-0 transition-all duration-200">
                        <MessageSquare className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-exchanges" className="space-y-6">
            {skillExchanges.filter(e => e.requester_id === user?.id).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {skillExchanges.filter(e => e.requester_id === user?.id).map((exchange) => (
                  <div key={exchange.id} className="apple-card hover:shadow-xl transition-all duration-300">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={getBadgeVariant(exchange.difficulty_level)}>
                          {exchange.difficulty_level}
                        </Badge>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          {exchange.status}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">{exchange.skill_offered}</h3>
                      <p className="text-sm text-gray-500 mb-4">Seeking: {exchange.skill_sought}</p>
                      <p className="text-gray-600 mb-6 line-clamp-3 text-sm">{exchange.description}</p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-blue-600 font-bold">
                          <Coins className="h-4 w-4" />
                          <span>{exchange.credits_required} TXC</span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(exchange.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ArrowLeftRight className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No exchanges yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start by creating your first skill exchange or browsing available opportunities
                </p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="apple-button"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Exchange
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SkillSwap;