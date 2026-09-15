import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Plus, Award, TrendingUp, Users, Star, CheckCircle, Clock, Target } from 'lucide-react';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { toast } from 'sonner';

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'industry' | 'language';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  endorsements: number;
  verified: boolean;
  trending: boolean;
  endorsers: {
    id: string;
    name: string;
    avatar: string;
    title: string;
    relationship: 'colleague' | 'manager' | 'client' | 'other';
  }[];
  certifications?: {
    name: string;
    issuer: string;
    date: string;
    verified: boolean;
  }[];
  projects?: number;
  lastUsed?: string;
}

interface SkillEndorsementsProps {
  className?: string;
}

export const SkillEndorsements: React.FC<SkillEndorsementsProps> = ({ className = '' }) => {
  const [skills, setSkills] = useState<Skill[]>([
    {
      id: '1',
      name: 'Product Management',
      category: 'industry',
      level: 'advanced',
      endorsements: 24,
      verified: true,
      trending: true,
      endorsers: [
        {
          id: 'e1',
          name: 'Sarah Kim',
          avatar: '/api/placeholder/32/32',
          title: 'VP Product',
          relationship: 'manager'
        },
        {
          id: 'e2',
          name: 'Alex Chen',
          avatar: '/api/placeholder/32/32',
          title: 'Senior Engineer',
          relationship: 'colleague'
        }
      ],
      certifications: [
        {
          name: 'Certified Product Manager',
          issuer: 'Product School',
          date: '2023',
          verified: true
        }
      ],
      projects: 12,
      lastUsed: '2 days ago'
    },
    {
      id: '2',
      name: 'React',
      category: 'technical',
      level: 'expert',
      endorsements: 18,
      verified: true,
      trending: false,
      endorsers: [
        {
          id: 'e3',
          name: 'Maria Garcia',
          avatar: '/api/placeholder/32/32',
          title: 'Tech Lead',
          relationship: 'colleague'
        }
      ],
      certifications: [
        {
          name: 'React Certification',
          issuer: 'Meta',
          date: '2023',
          verified: true
        }
      ],
      projects: 8,
      lastUsed: '1 day ago'
    },
    {
      id: '3',
      name: 'Leadership',
      category: 'soft',
      level: 'advanced',
      endorsements: 15,
      verified: false,
      trending: true,
      endorsers: [
        {
          id: 'e4',
          name: 'John Doe',
          avatar: '/api/placeholder/32/32',
          title: 'Director',
          relationship: 'manager'
        }
      ],
      projects: 5,
      lastUsed: '1 week ago'
    },
    {
      id: '4',
      name: 'Spanish',
      category: 'language',
      level: 'intermediate',
      endorsements: 8,
      verified: false,
      trending: false,
      endorsers: [],
      lastUsed: '2 weeks ago'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'verified' | 'trending' | 'needs-endorsement'>('all');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const { triggerHaptic } = useHapticFeedback();
  const { sync, isOnline } = useRealtimeSync();

  const handleEndorseRequest = async (skillId: string) => {
    triggerHaptic('medium');
    // Logic to request endorsements from connections
    await sync('skills', { action: 'request_endorsement', skillId });
    toast.success('Endorsement request sent to your connections');
  };

  const handleAddSkill = async (skillName: string) => {
    triggerHaptic('success');
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: skillName,
      category: 'technical',
      level: 'beginner',
      endorsements: 0,
      verified: false,
      trending: false,
      endorsers: [],
      projects: 0
    };
    
    setSkills(prev => [...prev, newSkill]);
    setShowAddSkill(false);
    await sync('skills', { action: 'add', skill: newSkill });
    toast.success('Skill added to your profile');
  };

  const getCategoryColor = (category: Skill['category']) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'soft': return 'bg-green-100 text-green-800 border-green-200';
      case 'industry': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'language': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelProgress = (level: Skill['level']) => {
    switch (level) {
      case 'beginner': return 25;
      case 'intermediate': return 50;
      case 'advanced': return 75;
      case 'expert': return 100;
      default: return 0;
    }
  };

  const getLevelColor = (level: Skill['level']) => {
    switch (level) {
      case 'beginner': return 'text-orange-600';
      case 'intermediate': return 'text-blue-600';
      case 'advanced': return 'text-purple-600';
      case 'expert': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredSkills = skills.filter(skill => {
    switch (filter) {
      case 'verified': return skill.verified;
      case 'trending': return skill.trending;
      case 'needs-endorsement': return skill.endorsements < 5;
      default: return true;
    }
  });

  const totalEndorsements = skills.reduce((sum, skill) => sum + skill.endorsements, 0);
  const verifiedSkills = skills.filter(skill => skill.verified).length;
  const trendingSkills = skills.filter(skill => skill.trending).length;

  return (
    <div className={`${className}`}>
      {/* Skills Overview */}
      <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 p-4 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Award className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Skills & Endorsements</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Showcase your expertise and get recognized by your network
        </p>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-foreground">{totalEndorsements}</p>
            <p className="text-xs text-muted-foreground">Total Endorsements</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{verifiedSkills}</p>
            <p className="text-xs text-muted-foreground">Verified Skills</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-purple-600">{trendingSkills}</p>
            <p className="text-xs text-muted-foreground">Trending</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 mb-4">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="text-xs whitespace-nowrap"
            >
              All Skills
            </Button>
            <Button
              variant={filter === 'verified' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('verified')}
              className="text-xs whitespace-nowrap"
            >
              Verified
            </Button>
            <Button
              variant={filter === 'trending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('trending')}
              className="text-xs whitespace-nowrap"
            >
              Trending
            </Button>
            <Button
              variant={filter === 'needs-endorsement' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('needs-endorsement')}
              className="text-xs whitespace-nowrap"
            >
              Need Endorsements
            </Button>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowAddSkill(true)}
            className="ml-2"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Skills List */}
      <div className="px-4 space-y-3 pb-6">
        {filteredSkills.map(skill => (
          <Card key={skill.id} className="p-4 bg-card border-border/50 shadow-sm">
            {/* Skill Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-foreground text-sm">
                    {skill.name}
                  </h3>
                  {skill.verified && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  {skill.trending && (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getCategoryColor(skill.category)}>
                    {skill.category}
                  </Badge>
                  <span className={`text-xs font-medium ${getLevelColor(skill.level)}`}>
                    {skill.level}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium text-foreground">
                    {skill.endorsements}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">endorsements</p>
              </div>
            </div>

            {/* Skill Level Progress */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Proficiency Level</span>
                <span className={`text-xs font-medium ${getLevelColor(skill.level)}`}>
                  {skill.level}
                </span>
              </div>
              <Progress value={getLevelProgress(skill.level)} className="h-2" />
            </div>

            {/* Skill Details */}
            <div className="space-y-2 mb-3">
              {skill.projects && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Target className="w-3 h-3" />
                  <span>{skill.projects} projects</span>
                </div>
              )}
              {skill.lastUsed && (
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Last used {skill.lastUsed}</span>
                </div>
              )}
            </div>

            {/* Certifications */}
            {skill.certifications && skill.certifications.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-foreground mb-2">Certifications</p>
                <div className="space-y-1">
                  {skill.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {cert.name}
                      </Badge>
                      {cert.verified && (
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {cert.issuer} • {cert.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Endorsers */}
            {skill.endorsers.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-foreground mb-2">Recent Endorsements</p>
                <div className="space-y-2">
                  {skill.endorsers.slice(0, 2).map(endorser => (
                    <div key={endorser.id} className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={endorser.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {endorser.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {endorser.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {endorser.title} • {endorser.relationship}
                        </p>
                      </div>
                    </div>
                  ))}
                  {skill.endorsers.length > 2 && (
                    <p className="text-xs text-muted-foreground">
                      +{skill.endorsers.length - 2} more endorsements
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-3 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEndorseRequest(skill.id)}
                className="w-full text-xs"
                disabled={!isOnline}
              >
                <Users className="w-4 h-4 mr-2" />
                Request Endorsements
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Skill Modal */}
      {showAddSkill && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-background w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Add New Skill</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddSkill(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {['React', 'Python', 'Project Management', 'Data Analysis', 'Design Thinking', 'Agile'].map(skillName => (
                  <Button
                    key={skillName}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddSkill(skillName)}
                    className="text-xs"
                  >
                    + {skillName}
                  </Button>
                ))}
              </div>
              
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => setShowAddSkill(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};