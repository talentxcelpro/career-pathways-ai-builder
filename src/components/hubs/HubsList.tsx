import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Users, Calendar, BarChart3, ExternalLink } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface Hub {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  hub_type: 'company' | 'college' | 'organization';
  is_verified: boolean;
  is_active: boolean;
  member_count?: number;
  opportunity_count?: number;
  event_count?: number;
}

export const HubsList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const navigate = useNavigate();

  const { data: hubs, isLoading } = useQuery({
    queryKey: ['hubs', searchQuery, selectedType],
    queryFn: async () => {
      let query = supabase
        .from('organization_hubs')
        .select(`
          *,
          hub_stats (
            member_count,
            opportunity_count,
            event_count
          )
        `)
        .eq('is_active', true)
        .order('is_verified', { ascending: false })
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (selectedType !== 'all') {
        query = query.eq('hub_type', selectedType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Hub[];
    }
  });

  const hubTypes = [
    { value: 'all', label: 'All Hubs' },
    { value: 'company', label: 'Companies' },
    { value: 'college', label: 'Colleges' },
    { value: 'organization', label: 'Organizations' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {hubTypes.map((type) => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type.value)}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Hubs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hubs?.map((hub) => (
          <Card key={hub.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {hub.logo_url && (
                    <img 
                      src={hub.logo_url} 
                      alt={hub.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {hub.name}
                      {hub.is_verified && (
                        <Badge variant="secondary" className="text-xs">✓</Badge>
                      )}
                    </CardTitle>
                    <Badge variant="outline" className="capitalize text-xs">
                      {hub.hub_type}
                    </Badge>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/hubs/${hub.slug}`);
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {hub.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{hub.member_count || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span>{hub.opportunity_count || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{hub.event_count || 0}</span>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  onClick={() => navigate(`/hubs/${hub.slug}`)}
                >
                  Explore
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hubs?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hubs found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};