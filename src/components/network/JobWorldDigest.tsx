import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, TrendingUp, Users, Building2, MapPin, Clock } from 'lucide-react';

interface DigestItem {
  id: string;
  type: 'hiring' | 'layoff' | 'funding' | 'industry' | 'policy';
  title: string;
  company?: string;
  location?: string;
  impact: 'high' | 'medium' | 'low';
  timeAgo: string;
  engagement: number;
}

export const JobWorldDigest: React.FC = () => {
  // Mock digest data - would be AI-curated from news APIs
  const digestItems: DigestItem[] = [
    {
      id: '1',
      type: 'hiring',
      title: 'Meta opens 3,000 new positions in VR/AR division',
      company: 'Meta',
      location: 'Global',
      impact: 'high',
      timeAgo: '1h',
      engagement: 1250
    },
    {
      id: '2',
      type: 'funding',
      title: 'AI startup Anthropic raises $4B, plans 2K hires',
      company: 'Anthropic',
      location: 'San Francisco',
      impact: 'high',
      timeAgo: '3h',
      engagement: 890
    },
    {
      id: '3',
      type: 'industry',
      title: 'Green tech jobs surge 45% this quarter',
      location: 'Worldwide',
      impact: 'medium',
      timeAgo: '5h',
      engagement: 670
    },
    {
      id: '4',
      type: 'policy',
      title: 'EU announces visa-free tech worker program',
      location: 'Europe',
      impact: 'high',
      timeAgo: '7h',
      engagement: 1100
    },
    {
      id: '5',
      type: 'hiring',
      title: 'Amazon doubles logistics hiring in Southeast Asia',
      company: 'Amazon',
      location: 'Southeast Asia',
      impact: 'medium',
      timeAgo: '12h',
      engagement: 540
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hiring':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'layoff':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'funding':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'industry':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'policy':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <TrendingUp className="h-3 w-3 text-red-500" />;
      case 'medium':
        return <TrendingUp className="h-3 w-3 text-yellow-500" />;
      default:
        return <TrendingUp className="h-3 w-3 text-green-500" />;
    }
  };

  return (
    <Card className="m-4 p-4 bg-white/95 backdrop-blur-sm border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">🌍 Today in Work</h2>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          All News
        </Button>
      </div>
      
      <div className="space-y-3">
        {digestItems.map((item, index) => (
          <div key={item.id} className="group cursor-pointer">
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex-shrink-0 mt-1">
                {getImpactIcon(item.impact)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-xs text-muted-foreground ml-2">{item.timeAgo}</span>
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className={`text-xs ${getTypeColor(item.type)}`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Badge>
                  
                  {item.company && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>{item.company}</span>
                    </div>
                  )}
                  
                  {item.location && (
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{item.engagement}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {index < digestItems.length - 1 && (
              <div className="border-b border-border/30 ml-8 mr-3" />
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-border/30">
        <Button variant="outline" className="w-full text-sm">
          📈 View Career Trends Dashboard
        </Button>
      </div>
    </Card>
  );
};