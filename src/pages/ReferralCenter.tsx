import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Share2 } from 'lucide-react';
import ReferralCenter from '@/components/referral/ReferralCenter';

const ReferralCenterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Referral Center - Invite Friends & Earn TXC | TalentXcel</title>
        <meta name="description" content="Invite friends to TalentXcel and earn TXC tokens for every successful referral. Share your unique code and build your network." />
        <link rel="canonical" href="https://talentxcel.in/referral" />
      </Helmet>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-b border-border/50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 viewBox%3D%220 0 32 32%22 width%3D%2232%22 height%3D%2232%22 fill%3D%22none%22 stroke%3D%22rgb(0 0 0 / 0.05)%22%3E%3Cpath d%3D%22m0 2 30 30M2 0 32 30%22%2F%3E%3C%2Fsvg%3E')] opacity-30"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mb-6 shadow-lg">
              <Share2 className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
              Referral Center
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Invite friends to TalentXcel and earn TXC tokens for every successful referral. 
              Share your unique code and build your network while earning rewards.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <ReferralCenter />
      </div>
    </div>
  );
};

export default ReferralCenterPage;