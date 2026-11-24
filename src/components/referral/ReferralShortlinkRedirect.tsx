import React, { useEffect } from 'react';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';

export const ReferralShortlinkRedirect: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();

  const rawTarget = searchParams.get('to') || searchParams.get('target') || searchParams.get('redirect');
  const cleanTarget = rawTarget && rawTarget.startsWith('/') && !rawTarget.startsWith('//') ? rawTarget : null;

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
  
  // Route to specific target if provided, otherwise route to the high-converting jobs portal
  let destination = cleanTarget || '/jobs';
  if (cleanCode) {
    destination += (destination.includes('?') ? '&' : '?') + `ref=${encodeURIComponent(cleanCode)}`;
  }

  return <Navigate to={destination} replace />;
};

export default ReferralShortlinkRedirect;
