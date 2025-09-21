import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';
// Temporary placeholder components
const HubHeader = ({ hub }: any) => (
  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
    <h1 className="text-3xl font-bold">{hub.name}</h1>
    <p className="text-muted-foreground mt-2">{hub.description}</p>
  </div>
);
const HubPanels = ({ hubId }: any) => <div className="grid gap-4"><p>Opportunities and projects coming soon...</p></div>;
const HubCTAs = ({ hub }: any) => <div className="flex gap-4"><button className="px-4 py-2 bg-primary text-primary-foreground rounded">Join Hub</button></div>;
const RelationshipsGraph = ({ hubId }: any) => <div className="p-4 border rounded"><p>Relationships graph coming soon...</p></div>;
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTalentXcelHubHeader } from '@/components/mobile/MobileTalentXcelHubHeader';
import { MobileHubBottomNav } from '@/components/mobile/MobileHubBottomNav';

interface HubData {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  hub_type: 'company' | 'college' | 'organization';
  is_verified: boolean;
  website_url?: string;
  contact_email?: string;
}

export const TalentXcelHub: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();

  const { data: hub, isLoading, error } = useQuery({
    queryKey: ['hub', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Hub slug is required');
      
      const { data, error } = await supabase
        .from('organization_hubs')
        .select(`
          *,
          hub_stats (
            member_count,
            opportunity_count,
            event_count,
            monthly_growth,
            engagement_rate
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as HubData;
    },
    enabled: !!slug
  });

  const handleShare = () => {
    if (navigator.share && hub) {
      navigator.share({
        title: hub.name,
        text: hub.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !hub) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <h1 className="text-2xl font-bold">Hub Not Found</h1>
        <p className="text-muted-foreground">The hub you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {!isMobile && <HubHeader hub={hub} />}
            <HubPanels hubId={hub.id} />
            <RelationshipsGraph hubId={hub.id} />
            {!isMobile && <HubCTAs hub={hub} />}
          </div>
        );
      case 'community':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Community</h2>
            <p className="text-muted-foreground">Community features coming soon...</p>
          </div>
        );
      case 'events':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Events</h2>
            <p className="text-muted-foreground">Events calendar coming soon...</p>
          </div>
        );
      case 'discussions':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Discussions</h2>
            <p className="text-muted-foreground">Discussion forum coming soon...</p>
          </div>
        );
      case 'join':
        return (
          <div className="p-4">
            <HubCTAs hub={hub} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>{hub.name} - TalentXcel Hub</title>
        <meta name="description" content={hub.description} />
        <meta property="og:title" content={`${hub.name} - TalentXcel Hub`} />
        <meta property="og:description" content={hub.description} />
        {hub.logo_url && <meta property="og:image" content={hub.logo_url} />}
      </Helmet>

      <div className={`min-h-screen bg-background ${isMobile ? 'pb-20' : ''}`}>
        {isMobile ? (
          <>
            <MobileTalentXcelHubHeader
              hubName={hub.name}
              isVerified={hub.is_verified}
              onShare={handleShare}
            />
            {renderTabContent()}
            <MobileHubBottomNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </>
        ) : (
          <div className="container mx-auto px-4 py-8">
            {renderTabContent()}
          </div>
        )}
      </div>
    </>
  );
};