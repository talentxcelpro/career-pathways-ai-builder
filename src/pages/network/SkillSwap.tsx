import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { sampleSkillExchanges } from './sample-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdvancedNetworking } from '@/hooks/useAdvancedNetworking';
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

  useEffect(() => {
    fetchSkillExchanges();
    if (user) {
      fetchUserCredits();
    }

    // Set up real-time subscription
    const channel = supabase
      .channel('skill-exchanges-changes')
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchSkillExchanges = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('skill_exchanges')
        .select(`
          *,
          profiles!skill_exchanges_user_id_fkey (
            full_name,
            title,
            profile_picture_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedData = data?.map(exchange => ({
        ...exchange,
        user_profile: {
          full_name: exchange.profiles?.full_name || 'Anonymous User',
          title: exchange.profiles?.title || 'Professional',
          profile_picture_url: exchange.profiles?.profile_picture_url
        }
      })) || [];
      
      setSkillExchanges(formattedData);
    } catch (error) {
      console.error('Error fetching skill exchanges:', error);
      toast({
        title: "Error",
        description: "Failed to load skill exchanges",
        variant: "destructive"
      });
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
      
      setUserCredits(data?.txc_balance || 250);
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
      formData.description
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
                <p className="text-2xl font-bold text-gray-900">{userCredits} TXC Credits</p>
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
                        disabled={loading || userCredits < exchange.credits_required}
                      >
                        {userCredits < exchange.credits_required ? 'Insufficient Credits' : 'Request Exchange'}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SkillSwap;