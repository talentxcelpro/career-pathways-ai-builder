import React from 'react';
import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
      <Card className="w-full max-w-sm mx-auto h-[700px] bg-[#1e293b] border-none rounded-3xl animate-pulse">
        <div className="h-full flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </Card>
    );
  }

  const careerReadiness = insights?.career_readiness_score || displayMetrics?.profileCompletion || 0;
  const competitiveness = insights?.market_competitiveness_score || Math.min((displayMetrics?.jobApplications || 0) * 10 + (displayMetrics?.connections || 0) * 2, 100);
  const industryPercentile = insights?.industry_percentile || Math.min(careerReadiness + (displayMetrics?.skillsAdded || 0) * 5, 95);
  
  // Generate user ID (simplified version)
  const userId = user?.id?.slice(0, 6)?.toUpperCase().replace(/-/g, '').slice(0, 6) || 'TXL116';
  const userInitials = displayProfile.full_name ? 
    displayProfile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 
    'U';

  return (
    <Card className="w-full max-w-sm mx-auto bg-[#1e293b] border-none overflow-hidden rounded-3xl shadow-2xl">
      <div className="relative p-8 text-white h-[700px]">
        {/* Decorative corner element */}
        <div className="absolute top-6 right-6">
          <svg width="64" height="64" viewBox="0 0 64 64" className="text-cyan-400">
            <path
              d="M16 16 Q48 16 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">TALENTXCEL</h1>
          <h2 className="text-xl font-bold text-cyan-400">CAREER PASSPORT</h2>
        </div>

        {/* Main content layout */}
        <div className="flex justify-between items-start mb-8">
          {/* Left side - Profile */}
          <div className="flex-1">
            {/* Profile Picture */}
            <div className="w-28 h-28 mb-6 bg-slate-400 rounded-2xl overflow-hidden">
              <Avatar className="w-full h-full rounded-2xl">
                <AvatarImage 
                  src={displayProfile.profile_picture_url || ''} 
                  alt={displayProfile.full_name || 'User'} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-slate-400 text-slate-800 text-2xl font-bold rounded-2xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Center - Career Readiness Circle */}
          <div className="flex flex-col items-center mx-6">
            <div className="relative">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="rgba(156, 163, 175, 0.3)"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#06b6d4"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - careerReadiness / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-cyan-400 text-sm font-normal mb-1">CAREER</span>
                <span className="text-white text-3xl font-bold">{Math.round(careerReadiness)}%</span>
                <span className="text-cyan-400 text-sm font-normal mt-1">READY</span>
              </div>
            </div>
          </div>

          {/* Right side - User ID Badge */}
          <div className="flex-shrink-0">
            <div className="bg-transparent border-2 border-cyan-400 rounded-xl px-4 py-3 text-center min-w-[80px]">
              <div className="text-white font-bold text-lg mb-2">{userId}</div>
              <svg className="w-8 h-8 mx-auto text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mb-8">
          <h3 className="text-white text-3xl font-bold mb-2">
            {displayProfile.full_name || 'Your Name'}
          </h3>
          <p className="text-white text-lg mb-4">
            {displayProfile.headline || displayProfile.title || 'Your Professional Title'}
          </p>
          <div className="flex items-center text-white">
            <MapPin className="w-5 h-5 mr-2 text-white" />
            <span className="text-lg text-white">{displayProfile.location || 'Your Location'}</span>
          </div>
        </div>

        {/* Performance Metrics Section */}
        <div className="bg-slate-800/80 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-2">
            <div>
              <div className="text-cyan-400 text-2xl font-bold">TOP {Math.round(industryPercentile)}%</div>
              <div className="text-white text-base">vs peers</div>
            </div>
            <div>
              <div className="text-cyan-400 text-sm font-bold mb-1">COMPETITIVENESS</div>
              <div className="text-white text-3xl font-bold">{Math.round(competitiveness)}%</div>
            </div>
          </div>
        </div>

        {/* Bottom Stats Grid */}
        <div className="border-t border-cyan-400 pt-6">
          <div className="grid grid-cols-4 gap-4">
            {/* Resumes */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-white text-3xl font-bold mb-1">{displayMetrics?.coursesCompleted || 0}</div>
              <div className="text-white text-sm">Resumes</div>
            </div>

            {/* Jobs */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-white text-3xl font-bold mb-1">{displayMetrics?.jobApplications || 0}</div>
              <div className="text-white text-sm">Jobs</div>
            </div>

            {/* Certificates */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-white text-3xl font-bold mb-1">{displayMetrics?.skillsAdded || 0}</div>
              <div className="text-white text-sm">Certificates</div>
            </div>

            {/* Connections */}
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-white text-3xl font-bold mb-1">{displayMetrics?.connections || 0}</div>
              <div className="text-white text-sm">Connections</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}