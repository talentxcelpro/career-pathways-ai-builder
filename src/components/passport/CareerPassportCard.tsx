import React from 'react';
import { Badge, Shield } from 'lucide-react';
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
      <Card className="w-full max-w-md mx-auto h-[600px] bg-gradient-to-br from-slate-900 to-slate-800 animate-pulse">
        <div className="h-full flex items-center justify-center">
          <div className="text-slate-400">Loading...</div>
        </div>
      </Card>
    );
  }

  const careerReadiness = insights?.career_readiness_score || displayMetrics?.profileCompletion || 0;
  const competitiveness = insights?.market_competitiveness_score || Math.min((displayMetrics?.jobApplications || 0) * 10 + (displayMetrics?.connections || 0) * 2, 100);
  const industryPercentile = insights?.industry_percentile || Math.min(careerReadiness + (displayMetrics?.skillsAdded || 0) * 5, 95);
  
  // Generate user ID (simplified version)
  const userId = user?.id?.slice(0, 8)?.toUpperCase() || 'TXL116';
  const userInitials = displayProfile.full_name ? 
    displayProfile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 
    'U';

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 overflow-hidden">
      <div className="relative p-6 text-white">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-cyan-400 mb-1">TALENTXCEL</h1>
          <h2 className="text-lg font-semibold">CAREER PASSPORT</h2>
        </div>

        {/* Top Section with Profile and Metrics */}
        <div className="flex items-start justify-between mb-6">
          {/* Profile Section */}
          <div className="flex-1">
            <Avatar className="w-20 h-20 mb-4 border-2 border-slate-600">
              <AvatarImage 
                src={displayProfile.profile_picture_url || ''} 
                alt={displayProfile.full_name || 'User'} 
              />
              <AvatarFallback className="bg-slate-700 text-white text-lg font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            
            <h3 className="text-xl font-bold mb-1">
              {displayProfile.full_name || 'Your Name'}
            </h3>
            <p className="text-slate-300 text-sm mb-2">
              {displayProfile.headline || displayProfile.title || 'Your Professional Title'}
            </p>
            <p className="text-slate-400 text-sm flex items-center">
              📍 {displayProfile.location || 'Your Location'}
            </p>
          </div>

          {/* Career Readiness Circle */}
          <div className="flex flex-col items-center ml-4">
            <div className="relative">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-slate-700"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - careerReadiness / 100)}`}
                  className="text-cyan-400 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{Math.round(careerReadiness)}%</span>
              </div>
            </div>
            <p className="text-cyan-400 text-xs font-semibold mt-1">CAREER</p>
            <p className="text-cyan-400 text-xs font-semibold">READY</p>
          </div>

          {/* User ID Badge */}
          <div className="ml-4">
            <div className="bg-slate-800 border-2 border-cyan-400 rounded-lg px-3 py-2 flex flex-col items-center">
              <div className="text-cyan-400 font-bold text-sm">{userId}</div>
              <Shield className="w-6 h-6 text-cyan-400 mt-1" />
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-cyan-400 text-lg font-bold">TOP {Math.round(industryPercentile)}%</p>
              <p className="text-slate-300 text-sm">vs peers</p>
            </div>
            <div>
              <p className="text-cyan-400 text-xs font-semibold mb-1">COMPETITIVENESS</p>
              <p className="text-2xl font-bold">{Math.round(competitiveness)}%</p>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-700">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <p className="text-2xl font-bold">{displayMetrics?.coursesCompleted || 0}</p>
            <p className="text-xs text-slate-400">Resumes</p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <p className="text-2xl font-bold">{displayMetrics?.jobApplications || 0}</p>
            <p className="text-xs text-slate-400">Jobs</p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
              <Badge className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold">{displayMetrics?.skillsAdded || 0}</p>
            <p className="text-xs text-slate-400">Certificat-</p>
          </div>
          
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="m7.5 4.27 9 5.15"/>
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
                <path d="m3.3 7 8.7 5 8.7-5"/>
                <path d="M12 22V12"/>
              </svg>
            </div>
            <p className="text-2xl font-bold">{displayMetrics?.connections || 0}</p>
            <p className="text-xs text-slate-400">Connections</p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4 w-16 h-16">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path
              d="M20,20 Q80,20 80,80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-cyan-400/30"
            />
          </svg>
        </div>
      </div>
    </Card>
  );
}