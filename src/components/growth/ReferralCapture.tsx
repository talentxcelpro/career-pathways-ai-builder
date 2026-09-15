import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const ReferralCapture = () => {
  const { referrerId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (referrerId) {
      console.log('Capturing referral from:', referrerId);
      localStorage.setItem('referral_code', referrerId);
      // You could also track this click in Supabase if needed
    }
    // Redirect to landing or signup
    navigate('/auth/register', { replace: true });
  }, [referrerId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-lg font-medium animate-pulse">Initializing TalentXcel Referral...</p>
      </div>
    </div>
  );
};
