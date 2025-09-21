import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, TrendingUp, Users, FileText, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DigitalPassportCardProps {
  profile?: {
    full_name?: string;
    talentxcel_id?: string;
    profile_picture_url?: string;
  };
  careerPassport?: {
    completion_percentage?: number;
    career_readiness_score?: number;
    market_competitiveness_score?: number;
    resumes_count?: number;
    jobs_applied_count?: number;
    certifications_count?: number;
    connections_count?: number;
  };
  qrCodeUrl?: string;
}

export const DigitalPassportCard: React.FC<DigitalPassportCardProps> = ({
  profile,
  careerPassport,
  qrCodeUrl
}) => {
  const { user } = useAuth();
  
  const generateUniqueId = () => {
    return profile?.talentxcel_id || `TAL${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getValidThruDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 3);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getMarketRank = () => {
    const score = careerPassport?.market_competitiveness_score || 0;
    if (score >= 90) return "95th percentile";
    if (score >= 80) return "85th percentile";
    if (score >= 70) return "75th percentile";
    if (score >= 60) return "65th percentile";
    return "50th percentile";
  };

  return (
    <Card className="relative overflow-hidden border-0 h-[400px] w-full max-w-sm mx-auto">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-indigo-900" />
      
      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col text-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-orange-400 mb-1">
              TalentXcel Career<br />Passport
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              <span className="text-sm text-orange-300">Career Builder</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-300 mb-1">Unique ID</div>
            <div className="text-sm font-mono text-orange-400">
              {generateUniqueId()}
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center relative">
              {profile?.profile_picture_url ? (
                <img 
                  src={profile.profile_picture_url} 
                  alt="Profile" 
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <span className="text-blue-900 font-bold text-sm">TX</span>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <div className="font-semibold text-white">TalentXcel Pro</div>
              <div className="text-sm text-orange-300 font-medium">
                Transforming...
              </div>
              <div className="text-xs text-orange-200">in India</div>
            </div>
          </div>
          
          {/* QR Code */}
          <div className="w-16 h-16 bg-white rounded-lg p-1">
            {qrCodeUrl ? (
              <QRCodeSVG
                value={qrCodeUrl}
                size={56}
                bgColor="#ffffff"
                fgColor="#000000"
                level="L"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">QR</span>
              </div>
            )}
          </div>
        </div>

        {/* Career Ready Percentage */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-orange-400 mb-1">
            {careerPassport?.completion_percentage || 67}%
          </div>
          <div className="text-sm text-gray-300">Career Ready</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 flex-1">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-xs text-gray-300 mb-1">Market Rank</div>
            <div className="font-semibold text-white">{getMarketRank()}</div>
            <div className="text-xs text-gray-400">vs peers</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="text-xs text-gray-300 mb-1">Competitiveness</div>
            <div className="font-semibold text-white">
              {careerPassport?.market_competitiveness_score || 100}%
            </div>
            <div className="text-xs text-gray-400">Score</div>
          </div>
        </div>

        {/* Bottom Metrics */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4">
          <div>
            <div className="font-semibold text-white">{careerPassport?.resumes_count || 0}</div>
            <div className="text-gray-400">Resumes</div>
          </div>
          <div>
            <div className="font-semibold text-white">{careerPassport?.jobs_applied_count || 0}</div>
            <div className="text-gray-400">Jobs Applied</div>
          </div>
          <div>
            <div className="font-semibold text-white">{careerPassport?.certifications_count || 0}</div>
            <div className="text-gray-400">Certifications</div>
          </div>
          <div>
            <div className="font-semibold text-white">{careerPassport?.connections_count || 0}</div>
            <div className="text-gray-400">Connections</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-gray-400 pt-2 border-t border-white/20">
          <div>Issued {getCurrentDate()}</div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Valid Thru {getValidThruDate()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};