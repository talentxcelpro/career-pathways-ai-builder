import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AdConfig {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  link_url: string;
  cta_text: string;
  background_color?: string;
  text_color?: string;
  badge_text?: string;
  badge_color?: string;
  is_active: boolean;
  display_order: number;
  target_audience?: string[];
  created_at: string;
}

interface AdvertisingSidebarProps {
  position?: 'left' | 'right';
  maxAds?: number;
}

export const AdvertisingSidebar: React.FC<AdvertisingSidebarProps> = ({
  position = 'right',
  maxAds = 3
}) => {
  // Fetch advertising configuration from Supabase
  const { data: ads, isLoading } = useQuery({
    queryKey: ['advertising-config'],
    queryFn: async () => {
      // For now, return demo config data. Later this can be from a database table
      const demoAds: AdConfig[] = [
        {
          id: '1',
          title: 'Boost Your Career with Pro',
          description: 'Unlock premium features, priority support, and exclusive networking opportunities.',
          image_url: '/lovable-uploads/ec6599d8-d8de-4d2d-a983-5df2b95cddc0.png',
          link_url: '/upgrade',
          cta_text: 'Upgrade Now',
          background_color: 'bg-gradient-to-r from-emerald-500 to-green-500',
          text_color: 'text-white',
          badge_text: 'Popular',
          badge_color: 'bg-yellow-400 text-yellow-900',
          is_active: true,
          display_order: 1,
          target_audience: ['job_seekers', 'professionals'],
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Find Your Dream Job',
          description: 'Browse thousands of job opportunities from top companies.',
          link_url: '/jobs',
          cta_text: 'Browse Jobs',
          background_color: 'bg-gradient-to-r from-blue-500 to-purple-500',
          text_color: 'text-white',
          badge_text: 'New',
          badge_color: 'bg-green-400 text-green-900',
          is_active: true,
          display_order: 2,
          target_audience: ['job_seekers'],
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Skill Assessment',
          description: 'Take our AI-powered skill assessment and get personalized recommendations.',
          link_url: '/assessments',
          cta_text: 'Start Assessment',
          background_color: 'bg-gradient-to-r from-orange-500 to-red-500',
          text_color: 'text-white',
          is_active: true,
          display_order: 3,
          target_audience: ['students', 'professionals'],
          created_at: new Date().toISOString()
        }
      ];

      // Filter active ads and sort by display order
      return demoAds
        .filter(ad => ad.is_active)
        .sort((a, b) => a.display_order - b.display_order)
        .slice(0, maxAds);
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-full mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!ads || ads.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground font-medium px-2">
        Sponsored
      </div>
      
      {ads.map((ad) => (
        <Card 
          key={ad.id} 
          className={`overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${ad.background_color || 'bg-white'}`}
        >
          <CardContent className="p-4">
            {/* Badge */}
            {ad.badge_text && (
              <div className="flex justify-between items-start mb-3">
                <Badge 
                  className={`${ad.badge_color || 'bg-primary text-primary-foreground'} text-xs font-medium`}
                >
                  {ad.badge_text}
                </Badge>
              </div>
            )}

            {/* Image */}
            {ad.image_url && (
              <div className="mb-3 rounded-lg overflow-hidden">
                <img 
                  src={ad.image_url} 
                  alt={ad.title}
                  className="w-full h-24 object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="space-y-3">
              <h3 className={`font-semibold text-sm leading-tight ${ad.text_color || 'text-foreground'}`}>
                {ad.title}
              </h3>
              
              <p className={`text-xs leading-relaxed opacity-90 ${ad.text_color || 'text-muted-foreground'}`}>
                {ad.description}
              </p>

              {/* CTA Button */}
              <Button 
                size="sm" 
                className="w-full text-xs font-medium"
                variant={ad.background_color ? "secondary" : "default"}
                onClick={() => {
                  if (ad.link_url.startsWith('http')) {
                    window.open(ad.link_url, '_blank');
                  } else {
                    window.location.href = ad.link_url;
                  }
                }}
              >
                {ad.cta_text}
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Ad Settings Link for Admins */}
      <div className="text-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => console.log('Open ad management - this could link to admin panel')}
        >
          Manage Ads
        </Button>
      </div>
    </div>
  );
};