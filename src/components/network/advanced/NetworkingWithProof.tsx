import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Award, CheckCircle, Star, Trophy, Target } from 'lucide-react';
import { toast } from 'sonner';

export const NetworkingWithProof = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [proofs, setProofs] = useState([]);

  useEffect(() => {
    fetchMatches();
    fetchProofs();
  }, [user]);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('networking_matches')
        .select(`
          *,
          profiles!networking_matches_matched_user_id_fkey(full_name, profile_picture_url, title)
        `)
        .eq('user_id', user?.id)
        .order('match_score', { ascending: false });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchProofs = async () => {
    try {
      const { data, error } = await supabase
        .from('connection_proofs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProofs(data || []);
    } catch (error) {
      console.error('Error fetching proofs:', error);
    }
  };

  const getProofIcon = (type: string) => {
    switch (type) {
      case 'linkedin': return <Shield className="w-4 h-4" />;
      case 'github': return <Award className="w-4 h-4" />;
      case 'portfolio': return <Trophy className="w-4 h-4" />;
      case 'certification': return <Star className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getMatchStrength = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 75) return { label: 'Strong', color: 'text-blue-600' };
    if (score >= 60) return { label: 'Good', color: 'text-yellow-600' };
    return { label: 'Moderate', color: 'text-gray-600' };
  };

  const handleConnect = async (matchId: string) => {
    try {
      // Update match status to connected
      const { error } = await supabase
        .from('networking_matches')
        .update({ status: 'connected' })
        .eq('id', matchId);

      if (error) throw error;
      toast.success('Connected successfully!');
      fetchMatches();
    } catch (error) {
      console.error('Error connecting:', error);
      toast.error('Failed to connect');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Networking with Proof</h2>
          <p className="text-muted-foreground">Connect with verified professionals based on proven compatibility</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {proofs.length} Verifications
          </Badge>
        </div>
      </div>

      {/* Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Your Verification Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { type: 'linkedin', label: 'LinkedIn', verified: proofs.some(p => p.proof_type === 'linkedin') },
              { type: 'github', label: 'GitHub', verified: proofs.some(p => p.proof_type === 'github') },
              { type: 'portfolio', label: 'Portfolio', verified: proofs.some(p => p.proof_type === 'portfolio') },
              { type: 'certification', label: 'Certifications', verified: proofs.some(p => p.proof_type === 'certification') }
            ].map((item) => (
              <div key={item.type} className="flex items-center gap-2 p-3 border rounded-lg">
                {getProofIcon(item.type)}
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className={`text-xs ${item.verified ? 'text-green-600' : 'text-gray-500'}`}>
                    {item.verified ? 'Verified' : 'Not verified'}
                  </p>
                </div>
                {item.verified && <CheckCircle className="w-4 h-4 text-green-600" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Matches */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Smart Matches Based on Verified Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map((match: any) => {
            const strength = getMatchStrength(match.match_score);
            return (
              <Card key={match.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={match.profiles?.profile_picture_url} />
                        <AvatarFallback>
                          {match.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1">
                        <Shield className="w-4 h-4 text-green-600 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{match.profiles?.full_name}</h4>
                      <p className="text-sm text-muted-foreground">{match.profiles?.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className={strength.color}>
                          {strength.label} Match
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {match.match_score}% compatible
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Compatibility Score</span>
                      <span className="font-medium">{match.match_score}%</span>
                    </div>
                    <Progress value={match.match_score} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Matching Factors:</p>
                    <div className="flex flex-wrap gap-1">
                      {['Skills', 'Location', 'Industry', 'Experience'].map((factor, index) => (
                        <Badge key={factor} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleConnect(match.id)}
                      disabled={match.status === 'connected'}
                    >
                      {match.status === 'connected' ? 'Connected' : 'Connect'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Target className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {matches.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No matches found yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete your verifications to get better matches
              </p>
              <Button variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Complete Verifications
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};