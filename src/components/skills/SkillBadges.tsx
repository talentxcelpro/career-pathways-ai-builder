import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Award, 
  Star, 
  Shield, 
  Trophy, 
  Medal,
  CheckCircle,
  Clock,
  Users,
  ExternalLink,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

interface SkillBadge {
  id: string;
  skill: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  score: number;
  verifiedBy: string;
  verifiedAt: string;
  expiresAt?: string;
  type: 'assessment' | 'peer' | 'certification' | 'project';
  endorsements: number;
}

interface SkillBadgesProps {
  onVerifySkill: (skill: string) => void;
}

export const SkillBadges: React.FC<SkillBadgesProps> = ({ onVerifySkill }) => {
  const [selectedBadge, setSelectedBadge] = useState<SkillBadge | null>(null);

  // Mock data - in reality, this would come from your API
  const [badges, setBadges] = useState<SkillBadge[]>([
    {
      id: '1',
      skill: 'React.js',
      level: 'advanced',
      score: 92,
      verifiedBy: 'AI Assessment',
      verifiedAt: '2024-01-15',
      type: 'assessment',
      endorsements: 8
    },
    {
      id: '2',
      skill: 'TypeScript',
      level: 'intermediate',
      score: 78,
      verifiedBy: 'John Smith',
      verifiedAt: '2024-01-10',
      type: 'peer',
      endorsements: 5
    },
    {
      id: '3',
      skill: 'Node.js',
      level: 'expert',
      score: 95,
      verifiedBy: 'TechCorp Inc',
      verifiedAt: '2024-01-05',
      expiresAt: '2025-01-05',
      type: 'certification',
      endorsements: 12
    }
  ]);

  const pendingSkills = ['Python', 'AWS', 'Docker', 'MongoDB'];

  const getBadgeIcon = (type: string, level: string) => {
    switch (type) {
      case 'certification':
        return <Award className="h-6 w-6" />;
      case 'peer':
        return <Users className="h-6 w-6" />;
      case 'project':
        return <Trophy className="h-6 w-6" />;
      default:
        return level === 'expert' ? <Medal className="h-6 w-6" /> : <Star className="h-6 w-6" />;
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-purple-600 bg-purple-100';
      case 'advanced': return 'text-blue-600 bg-blue-100';
      case 'intermediate': return 'text-green-600 bg-green-100';
      case 'beginner': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleEndorse = (badgeId: string) => {
    setBadges(badges.map(badge => 
      badge.id === badgeId 
        ? { ...badge, endorsements: badge.endorsements + 1 }
        : badge
    ));
    toast.success('Skill endorsed!');
  };

  const handleShare = (badge: SkillBadge) => {
    if (navigator.share) {
      navigator.share({
        title: `${badge.skill} Skill Verification`,
        text: `I've been verified as ${badge.level} level in ${badge.skill} with a score of ${badge.score}%`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(
        `I've been verified as ${badge.level} level in ${badge.skill} with a score of ${badge.score}%`
      );
      toast.success('Shared to clipboard!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Verified Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verified Skills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <Card key={badge.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedBadge(badge)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${getBadgeColor(badge.level)}`}>
                      {getBadgeIcon(badge.type, badge.level)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {badge.level}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{badge.skill}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score:</span>
                      <span className="font-medium">{badge.score}%</span>
                    </div>
                    <Progress value={badge.score} className="h-2" />
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{badge.verifiedBy}</span>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {badge.endorsements}
                      </div>
                    </div>
                  </div>
                  
                  {badge.expiresAt && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                      <Clock className="h-3 w-3" />
                      Expires {new Date(badge.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills to Verify */}
      <Card>
        <CardHeader>
          <CardTitle>Skills Awaiting Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pendingSkills.map((skill) => (
              <Button
                key={skill}
                variant="outline"
                onClick={() => onVerifySkill(skill)}
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Star className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm">{skill}</span>
                <span className="text-xs text-muted-foreground">Start Assessment</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
             onClick={() => setSelectedBadge(null)}>
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${getBadgeColor(selectedBadge.level)}`}>
                    {getBadgeIcon(selectedBadge.type, selectedBadge.level)}
                  </div>
                  {selectedBadge.skill}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedBadge(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Level:</span>
                  <Badge className={`ml-2 ${getBadgeColor(selectedBadge.level)}`}>
                    {selectedBadge.level}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Score:</span>
                  <span className="ml-2 font-medium">{selectedBadge.score}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Verified by:</span>
                  <span className="ml-2">{selectedBadge.verifiedBy}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Date:</span>
                  <span className="ml-2">{new Date(selectedBadge.verifiedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="h-4 w-4" />
                  {selectedBadge.endorsements} endorsements
                </div>
                <Button size="sm" variant="outline" onClick={() => handleEndorse(selectedBadge.id)}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Endorse
                </Button>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  variant="outline"
                  onClick={() => handleShare(selectedBadge)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};