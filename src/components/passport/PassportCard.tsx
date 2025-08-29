import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/contexts/AuthContext';

interface PassportCardProps {
  userProfile?: any;
  metrics: {
    resumes_count: number;
    jobs_applied_count: number;
    certifications_count: number;
    connections_count: number;
  };
  insights: {
    career_readiness_score: number;
    market_competitiveness_score: number;
    industry_percentile: number;
  };
  userId?: string;
}

export function PassportCard({ userProfile, metrics, insights, userId }: PassportCardProps) {
  const { user } = useAuth();
  const currentUser = userId || user?.id;
  const profileUrl = `${window.location.origin}/passport/${currentUser}`;
  
  // Format issue date and expiry
  const issueDate = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
  
  const expiryDate = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });

  // Use a stable unique ID based on user profile or generate once
  const uniqueId = React.useMemo(() => {
    if (userProfile?.talentxcel_id) {
      return userProfile.talentxcel_id;
    }
    // Generate stable ID based on user ID to prevent changes on re-render
    const userId = currentUser || 'guest';
    const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const randomNum = (seed * 9999) % 999999;
    return `TAL${String(randomNum).padStart(6, '0')}`;
  }, [userProfile?.talentxcel_id, currentUser]);

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white border-0 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-orange-400 mb-1">
              TalentXcel Career Passport
            </h2>
            <div className="flex items-center text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
              Career Builder
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-gray-300">Unique ID</div>
            <div className="text-orange-400 font-mono">{uniqueId}</div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-lg flex items-center justify-center relative">
              {userProfile?.profile_picture_url ? (
                <img 
                  src={userProfile.profile_picture_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {userProfile?.full_name?.charAt(0) || 'U'}
                </span>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {userProfile?.full_name || 'TalentXcel Pro'}
              </h3>
              <p className="text-orange-300 text-sm">
                {userProfile?.headline || 'Transforming Businesses and Lives'}
              </p>
              <div className="flex items-center text-yellow-300 text-sm">
                <span className="mr-1">🇮🇳</span>
                {userProfile?.location || 'India'}
              </div>
            </div>
          </div>
          <div className="bg-white p-2 rounded">
            <QRCodeSVG value={profileUrl} size={64} />
          </div>
        </div>

        {/* Career Readiness Score */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-orange-400 mb-1">
            {insights.career_readiness_score}%
          </div>
          <div className="text-gray-300 text-sm">Career Ready</div>
        </div>

        {/* Market Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-gray-300 text-sm mb-1">Market Rank</div>
            <div className="text-white font-semibold">
              {insights.industry_percentile > 0 ? `${insights.industry_percentile}th percentile` : 'Not ranked'}
            </div>
            <div className="text-gray-400 text-xs">vs peers</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-gray-300 text-sm mb-1">Competitiveness</div>
            <div className="text-white font-semibold">
              {insights.market_competitiveness_score}%
            </div>
            <div className="text-gray-400 text-xs">Score</div>
          </div>
        </div>

        {/* Activity Metrics */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {metrics.resumes_count}
            </div>
            <div className="text-gray-300 text-xs">Resumes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {metrics.jobs_applied_count}
            </div>
            <div className="text-gray-300 text-xs">Jobs Applied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {metrics.certifications_count}
            </div>
            <div className="text-gray-300 text-xs">Certifications</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {metrics.connections_count}
            </div>
            <div className="text-gray-300 text-xs">Connections</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-gray-400 border-t border-white/20 pt-3">
          <div>Issued {issueDate}</div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Valid Thru {expiryDate}
          </div>
        </div>
      </div>
    </Card>
  );
}