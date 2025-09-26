import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, ArrowUpDown, Clock, Star, Users, Coins, Search, Filter } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  user_profile?: {
    full_name: string;
    title: string;
    profile_picture_url: string;
  };
}

interface UserCredits {
  total_credits: number;
  earned_credits: number;
  spent_credits: number;
}

const SkillSwap: React.FC = () => {
  const { user } = useAuth();
  const [skillExchanges, setSkillExchanges] = useState<SkillExchange[]>([]);
  const [userCredits, setUserCredits] = useState<UserCredits>({ total_credits: 100, earned_credits: 0, spent_credits: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [newExchange, setNewExchange] = useState({
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
  }, [user]);

  const fetchSkillExchanges = async () => {
    try {
      setLoading(true);
      
      // Simulate fetching data with sample data
      const sampleData: SkillExchange[] = [
        {
          id: '1',
          skill_offered: 'React Development',
          skill_sought: 'UI/UX Design',
          description: 'I can teach modern React patterns, hooks, and state management in exchange for learning design principles and user experience best practices.',
          difficulty_level: 'intermediate',
          session_length: 90,
          credits_required: 15,
          status: 'active',
          created_at: new Date().toISOString(),
          user_profile: {
            full_name: 'Sarah Chen',
            title: 'Senior Frontend Developer',
            profile_picture_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          id: '2',
          skill_offered: 'Digital Marketing',
          skill_sought: 'Data Analysis',
          description: 'Share growth hacking techniques, social media strategies, and content marketing for analytics insights and dashboard creation.',
          difficulty_level: 'beginner',
          session_length: 60,
          credits_required: 10,
          status: 'active',
          created_at: new Date().toISOString(),
          user_profile: {
            full_name: 'Marcus Rodriguez',
            title: 'Growth Marketing Specialist',
            profile_picture_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          id: '3',
          skill_offered: 'Python Programming',
          skill_sought: 'DevOps & Cloud',
          description: 'Python automation, machine learning, and web scraping skills for AWS/Docker deployment and CI/CD knowledge.',
          difficulty_level: 'advanced',
          session_length: 120,
          credits_required: 20,
          status: 'active',
          created_at: new Date().toISOString(),
          user_profile: {
            full_name: 'Dr. Priya Patel',
            title: 'AI Research Engineer',
            profile_picture_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          id: '4',
          skill_offered: 'Content Writing',
          skill_sought: 'SEO & Analytics',
          description: 'Creative writing, copywriting, and storytelling skills for technical SEO expertise and Google Analytics mastery.',
          difficulty_level: 'intermediate',
          session_length: 75,
          credits_required: 12,
          status: 'active',
          created_at: new Date().toISOString(),
          user_profile: {
            full_name: 'Alex Thompson',
            title: 'Content Strategy Lead',
            profile_picture_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
          }
        },
        {
          id: '5',
          skill_offered: 'Graphic Design',
          skill_sought: 'Frontend Development',
          description: 'Adobe Creative Suite, branding, and visual design in exchange for HTML/CSS/JavaScript and responsive design skills.',
          difficulty_level: 'beginner',
          session_length: 90,
          credits_required: 14,
          status: 'active',
          created_at: new Date().toISOString(),
          user_profile: {
            full_name: 'Emma Wilson',
            title: 'Visual Designer',
            profile_picture_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
          }
        }
      ];
      
      setSkillExchanges(sampleData);
    } catch (error) {
      console.error('Error fetching skill exchanges:', error);
      toast.error('Failed to load skill exchanges');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    try {
      // Simulate user credits
      setUserCredits({
        total_credits: 150,
        earned_credits: 75,
        spent_credits: 25
      });
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  const createSkillExchange = async () => {
    if (!user) {
      toast.error('Please log in to create a skill exchange');
      return;
    }

    try {
      // Simulate creating a new skill exchange
      const newSkillExchange: SkillExchange = {
        id: Date.now().toString(),
        ...newExchange,
        status: 'active',
        created_at: new Date().toISOString(),
        user_profile: {
          full_name: 'You',
          title: 'Your Title',
          profile_picture_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        }
      };

      setSkillExchanges([newSkillExchange, ...skillExchanges]);
      setShowCreateForm(false);
      setNewExchange({
        skill_offered: '',
        skill_sought: '',
        description: '',
        difficulty_level: 'beginner',
        session_length: 60,
        credits_required: 10
      });
      
      toast.success('Skill exchange created successfully!');
    } catch (error) {
      console.error('Error creating skill exchange:', error);
      toast.error('Failed to create skill exchange');
    }
  };

  const requestSkillExchange = async (exchangeId: string, credits: number) => {
    if (!user) {
      toast.error('Please log in to request a skill exchange');
      return;
    }

    if (userCredits.total_credits < credits) {
      toast.error('Insufficient credits for this exchange');
      return;
    }

    try {
      // Simulate skill exchange request
      setUserCredits(prev => ({
        ...prev,
        total_credits: prev.total_credits - credits,
        spent_credits: prev.spent_credits + credits
      }));
      
      toast.success('Skill exchange request sent! You will be notified when accepted.');
    } catch (error) {
      console.error('Error requesting skill exchange:', error);
      toast.error('Failed to send request');
    }
  };

  const filteredExchanges = skillExchanges.filter(exchange => {
    const matchesSearch = exchange.skill_offered.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exchange.skill_sought.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exchange.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === 'all' || exchange.difficulty_level === difficultyFilter;
    
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔄 Skill Swap</h1>
          <p className="text-gray-600">Exchange Skills & Earn Credits</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Coins className="h-5 w-5" />
            <span className="font-semibold">{userCredits.total_credits} Credits</span>
          </div>
          
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Offer Skill
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Skill Exchange</DialogTitle>
                <DialogDescription>
                  Offer your expertise and request skills you want to learn
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="skill_offered">Skill You Offer</Label>
                    <Input
                      id="skill_offered"
                      value={newExchange.skill_offered}
                      onChange={(e) => setNewExchange(prev => ({ ...prev, skill_offered: e.target.value }))}
                      placeholder="e.g., React Development"
                    />
                  </div>
                  <div>
                    <Label htmlFor="skill_sought">Skill You Want</Label>
                    <Input
                      id="skill_sought"
                      value={newExchange.skill_sought}
                      onChange={(e) => setNewExchange(prev => ({ ...prev, skill_sought: e.target.value }))}
                      placeholder="e.g., UI/UX Design"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newExchange.description}
                    onChange={(e) => setNewExchange(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what you can teach and what you want to learn..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select value={newExchange.difficulty_level} onValueChange={(value) => setNewExchange(prev => ({ ...prev, difficulty_level: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="session_length">Session Length (min)</Label>
                    <Input
                      id="session_length"
                      type="number"
                      value={newExchange.session_length}
                      onChange={(e) => setNewExchange(prev => ({ ...prev, session_length: parseInt(e.target.value) }))}
                      min="30"
                      max="180"
                    />
                  </div>
                  <div>
                    <Label htmlFor="credits">Credits Required</Label>
                    <Input
                      id="credits"
                      type="number"
                      value={newExchange.credits_required}
                      onChange={(e) => setNewExchange(prev => ({ ...prev, credits_required: parseInt(e.target.value) }))}
                      min="5"
                      max="50"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createSkillExchange}>
                    Create Exchange
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search skills, descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Skill Exchange Cards */}
      <div className="grid gap-6">
        {filteredExchanges.map((exchange) => (
          <Card key={exchange.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* User Profile */}
                <div className="flex items-center gap-4 lg:w-64">
                  <img
                    src={exchange.user_profile?.profile_picture_url}
                    alt={exchange.user_profile?.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{exchange.user_profile?.full_name}</h3>
                    <p className="text-sm text-gray-600">{exchange.user_profile?.title}</p>
                  </div>
                </div>

                {/* Exchange Details */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {exchange.skill_offered}
                      </Badge>
                      <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {exchange.skill_sought}
                      </Badge>
                    </div>
                    <Badge className={getDifficultyColor(exchange.difficulty_level)}>
                      {exchange.difficulty_level}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{exchange.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {exchange.session_length} min
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      {exchange.credits_required} credits
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>4.8 (23 reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="lg:w-32 flex lg:justify-end">
                  <Button 
                    onClick={() => requestSkillExchange(exchange.id, exchange.credits_required)}
                    className="w-full lg:w-auto"
                    disabled={userCredits.total_credits < exchange.credits_required}
                  >
                    Request Swap
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExchanges.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No skill exchanges found</h3>
          <p className="text-gray-600">Try adjusting your search or filters, or create a new skill exchange!</p>
        </div>
      )}
    </div>
  );
};

export default SkillSwap;