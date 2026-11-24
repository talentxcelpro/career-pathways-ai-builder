import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';

export const ReferralShortlinkRedirect: React.FC = () => {
  const { code } = useParams<{ code: string }>();

  useEffect(() => {
    if (code) {
      const cleanCode = code.trim().toUpperCase();
      try {
        localStorage.setItem('txc_referral_code', cleanCode);
        localStorage.setItem('txc_referral_channel', 'shortlink');
        localStorage.setItem('txc_referral_timestamp', Date.now().toString());
      } catch {}
    }
  }, [code]);

  const cleanCode = code ? code.trim().toUpperCase() : '';
  const destination = cleanCode ? `/auth?mode=signup&ref=${encodeURIComponent(cleanCode)}` : '/auth?mode=signup';

  return <Navigate to={destination} replace />;
};

export default ReferralShortlinkRedirect;
