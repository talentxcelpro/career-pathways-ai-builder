import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedCareerData } from '@/hooks/useOptimizedCareerData';

interface CareerPassportCardProps {
  userProfile?: any;
  isOwner?: boolean;
  publicPassport?: any;
}

export function CareerPassportCard({ userProfile, isOwner = true, publicPassport }: CareerPassportCardProps) {
  const { user } = useAuth();
  const { metrics, insights, profile, isLoading } = useOptimizedCareerData();

  // Use provided data or fall back to current user data
  const displayProfile = userProfile || profile;
  const displayMetrics = (!isOwner && publicPassport?.passport) ? {
    profileCompletion: publicPassport.passport.completion_percentage || 0,
    jobApplications: publicPassport.passport.jobs_applied_count || 0,
    connections: publicPassport.passport.connections_count || 0,
    skillsAdded: 0,
    coursesCompleted: 0,
    postsCreated: 0,
    achievementsEarned: 0,
    totalTXCEarned: 0,
    loginStreak: 0,
    applicationStreak: 0,
    lastActivityDate: publicPassport.passport.last_activity_at || new Date().toISOString()
  } : metrics;

  if (isLoading || !displayProfile) {
    return (
      <Card className="w-full max-w-sm mx-auto min-h-[500px] bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 border-none rounded-3xl animate-pulse">
        <div className="h-full flex items-center justify-center p-8">
          <div className="text-white">Loading...</div>
        </div>
      </Card>
    );
  }

  const careerReadiness = insights?.career_readiness_score || displayMetrics?.profileCompletion || 0;
  const competitiveness = insights?.market_competitiveness_score || Math.min((displayMetrics?.jobApplications || 0) * 10 + (displayMetrics?.connections || 0) * 2, 100);
  const industryPercentile = insights?.industry_percentile || Math.min(careerReadiness + (displayMetrics?.skillsAdded || 0) * 5, 95);
  
  // Generate user ID (simplified version)
  const userId = user?.id?.slice(0, 6)?.toUpperCase().replace(/-/g, '').slice(0, 6) || 'TAL169';
  const userInitials = displayProfile.full_name ? 
    displayProfile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 
    'TP';

  // Generate QR code URL
  const qrCodeUrl = `${window.location.origin}/passport/${displayProfile.username || user?.id}`;

  // Format dates
  const issueDate = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });
  
  const expiryDate = new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <Card className="w-full max-w-sm mx-auto bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 border-none overflow-hidden rounded-3xl shadow-2xl">
      <div className="relative p-6 text-white min-h-[600px]">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold text-orange-400 mb-1 !text-orange-400">TalentXcel Career</h1>
            <h2 className="text-xl font-bold text-orange-400 !text-orange-400">Passport</h2>
            <div className="flex items-center mt-3">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <span className="text-red-400 text-sm !text-red-400">Career Builder</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-white text-sm mb-1 !text-white">Unique ID</div>
            <div className="text-orange-400 font-bold text-lg !text-orange-400">{userId}679</div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex justify-between items-start mb-8">
          {/* Left - Profile Info */}
          <div className="flex items-start space-x-4 flex-1">
            <div className="relative">
              <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden">
                <Avatar className="w-full h-full rounded-2xl">
                  <AvatarImage 
                    src={displayProfile.profile_picture_url || ''} 
                    alt={displayProfile.full_name || 'User'} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-300 text-white text-xl font-bold rounded-2xl">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-white text-xl font-bold mb-1 !text-white">
                {displayProfile.full_name || 'TalentXcel Pro'}
              </h3>
              <p className="text-orange-400 text-sm mb-2 !text-orange-400">
                {displayProfile.headline || 'Transforming Businesses'}
              </p>
              <p className="text-orange-400 text-sm mb-2 !text-orange-400">and Lives</p>
              <div className="flex items-center">
                <span className="text-lg mr-2">🇮🇳</span>
                <span className="text-orange-400 text-sm !text-orange-400">
                  {displayProfile.location || 'india'}
                </span>
              </div>
            </div>
          </div>

          {/* Right - QR Code */}
          <div className="bg-white p-3 rounded-2xl">
            <QRCodeSVG value={qrCodeUrl} size={80} />
          </div>
        </div>

        {/* Career Readiness */}
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-orange-400 mb-2 !text-orange-400">
            {Math.round(careerReadiness)}%
          </div>
          <div className="text-white text-lg !text-white">Career Ready</div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-800/40 rounded-2xl p-4">
            <div className="text-white text-base mb-1 !text-white">Market Rank</div>
            <div className="text-white text-xl font-bold mb-1 !text-white">
              {industryPercentile > 0 ? 'Not ranked' : 'Not ranked'}
            </div>
            <div className="text-gray-300 text-sm !text-gray-300">vs peers</div>
          </div>
          
          <div className="bg-blue-800/40 rounded-2xl p-4">
            <div className="text-white text-base mb-1 !text-white">Competitiveness</div>
            <div className="text-white text-xl font-bold mb-1 !text-white">
              {Math.round(competitiveness)}%
            </div>
            <div className="text-gray-300 text-sm !text-gray-300">Score</div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <div className="text-white text-sm !text-white">Resumes</div>
          </div>
          <div className="text-center">
            <div className="text-white text-sm !text-white">Jobs</div>
            <div className="text-white text-sm !text-white">Applied</div>
          </div>
          <div className="text-center">
            <div className="text-white text-sm !text-white">Certifications</div>
          </div>
          <div className="text-center">
            <div className="text-white text-sm !text-white">Connections</div>
          </div>
        </div>

        {/* Footer with dates and numbers */}
        <div className="border-t border-blue-400 pt-4">
          <div className="grid grid-cols-4 gap-4 mb-4 text-center">
            <div className="text-white text-2xl font-bold !text-white">
              {displayMetrics?.coursesCompleted || 0}
            </div>
            <div className="text-white text-2xl font-bold !text-white">
              {displayMetrics?.jobApplications || 16}
            </div>
            <div className="text-white text-2xl font-bold !text-white">
              {displayMetrics?.skillsAdded || 5}
            </div>
            <div className="text-white text-2xl font-bold !text-white">
              {displayMetrics?.connections || 35}
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div className="text-gray-300 !text-gray-300">Issued {issueDate}</div>
            <div className="flex items-center text-gray-300">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="!text-gray-300">Valid Thru {expiryDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}