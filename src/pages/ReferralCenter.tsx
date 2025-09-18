import React from 'react';
import { Helmet } from 'react-helmet-async';
import ReferralCenter from '@/components/referral/ReferralCenter';

const ReferralCenterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Referral Center - Invite Friends & Earn TXC | TalentXcel</title>
        <meta name="description" content="Invite friends to TalentXcel and earn TXC tokens for every successful referral. Share your unique code and build your network." />
        <link rel="canonical" href="https://talentxcel.in/referral" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <ReferralCenter />
      </div>
    </div>
  );
};

export default ReferralCenterPage;