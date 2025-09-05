import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, X } from 'lucide-react';
import { ConnectionActions } from './ConnectionActions';

interface Person {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  mutualConnections: number;
  badges?: string[];
}

export const PeopleYouMayKnow: React.FC = () => {
  const { user } = useAuth();

  // Fetch real people data from profiles
  const { data: people = [], isLoading } = useQuery({
    queryKey: ['people-suggestions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, headline, current_company, profile_picture_url, email')
        .neq('id', user.id)
        .not('full_name', 'is', null)
        .limit(5);

      if (error) throw error;

      return (data || []).map((profile: any) => ({
        id: profile.id,
        name: profile.full_name || 'Professional User',
        title: profile.headline || 'Professional',
        company: profile.current_company || 'Company',
        avatar: profile.profile_picture_url,
        mutualConnections: Math.floor(Math.random() * 20) + 1,
        badges: Math.random() > 0.7 ? ['Hiring'] : Math.random() > 0.5 ? ['Open to work'] : undefined
      })) as Person[];
    },
    enabled: !!user?.id
  });

  const handleConnect = async (personId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: personId,
          status: 'pending'
        });
      
      if (error) throw error;
      console.log('Connection request sent to:', personId);
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleDismiss = (personId: string) => {
    console.log('Dismissing:', personId);
  };

  if (isLoading) {
    return (
      <Card className="rounded-none border-0 border-b border-gray-100 bg-white shadow-none">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (people.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-none border-0 border-b border-gray-100 bg-white shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900">
          People you may know
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {people.map((person) => (
            <div key={person.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={person.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {person.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {person.name}
                    </h4>
                    {person.badges?.map((badge, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-xs rounded-full bg-green-100 text-green-700"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {person.title} at {person.company}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {person.mutualConnections} mutual connections
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-3">
                <ConnectionActions
                  userId={person.id}
                  size="sm"
                  className="rounded-full px-4 py-1 h-8 border-primary text-primary hover:bg-primary hover:text-white"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full p-1 h-8 w-8 text-gray-400 hover:text-gray-600"
                  onClick={() => handleDismiss(person.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
          
          <Button 
            variant="ghost" 
            className="w-full text-primary hover:bg-primary/5 rounded-2xl mt-4"
          >
            See all suggestions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};