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
  const slug = userProfile?.username || currentUser;
  const profileUrl = `${window.location.origin}/passport/${slug}`;
  
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
    <Card className="w-full max-w-sm sm:max-w-md mx-auto bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white border-0 overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-cyan-400 mb-1 !important">
              TalentXcel Career Passport
            </h2>
            <div className="flex items-center text-red-400 text-sm">
              <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
              Career Builder
            </div>
          </div>
          <div className="text-left sm:text-right text-sm">
            <div className="text-gray-300">Unique ID</div>
            <div className="text-orange-400 font-mono text-xs sm:text-sm">{uniqueId}</div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4 sm:mb-6">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-lg flex items-center justify-center relative flex-shrink-0">
              {userProfile?.profile_picture_url || userProfile?.profile_photo_url ? (
                <img 
                  src={userProfile.profile_picture_url || userProfile.profile_photo_url} 
                  alt={`${userProfile?.full_name || 'User'} profile photo`}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                />
              ) : (
                <span className="text-lg sm:text-2xl font-bold text-white">
                  {userProfile?.full_name?.charAt(0) || 'U'}
                </span>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-white !important truncate">
                {userProfile?.full_name || 'TalentXcel Pro'}
              </h3>
              <p className="text-cyan-400 text-xs sm:text-sm line-clamp-1 !important">
                {userProfile?.headline || 'Transforming Businesses and Lives'}
              </p>
              <div className="flex items-center text-white text-xs sm:text-sm !important">
                <span className="mr-1">🇮🇳</span>
                <span className="truncate">{userProfile?.location || 'India'}</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-2 rounded self-center sm:self-start flex-shrink-0">
            <QRCodeSVG value={profileUrl} size={48} className="sm:w-16 sm:h-16" />
          </div>
        </div>

        {/* Career Readiness Score */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="text-3xl sm:text-4xl font-bold text-orange-400 mb-1">
            {insights.career_readiness_score}%
          </div>
          <div className="text-white text-sm !important">Career Ready</div>
        </div>

        {/* Market Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-white text-xs sm:text-sm mb-1 !important">Market Rank</div>
            <div className="text-white font-semibold text-sm sm:text-base !important">
              {insights.industry_percentile > 0 ? `${insights.industry_percentile}th percentile` : 'Not ranked'}
            </div>
            <div className="text-white text-xs !important">vs peers</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-white text-xs sm:text-sm mb-1 !important">Competitiveness</div>
            <div className="text-white font-semibold text-sm sm:text-base !important">
              {insights.market_competitiveness_score}%
            </div>
            <div className="text-white text-xs !important">Score</div>
          </div>
        </div>

        {/* Activity Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="text-center p-2 sm:p-0">
            <div className="text-lg sm:text-2xl font-bold text-orange-400">
              {metrics.resumes_count}
            </div>
            <div className="text-white text-xs !important">Resumes</div>
          </div>
          <div className="text-center p-2 sm:p-0">
            <div className="text-lg sm:text-2xl font-bold text-orange-400">
              {metrics.jobs_applied_count}
            </div>
            <div className="text-white text-xs !important">Jobs Applied</div>
          </div>
          <div className="text-center p-2 sm:p-0">
            <div className="text-lg sm:text-2xl font-bold text-orange-400">
              {metrics.certifications_count}
            </div>
            <div className="text-white text-xs !important">Certifications</div>
          </div>
          <div className="text-center p-2 sm:p-0">
            <div className="text-lg sm:text-2xl font-bold text-orange-400">
              {metrics.connections_count}
            </div>
            <div className="text-white text-xs !important">Connections</div>
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