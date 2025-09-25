import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronRight, 
  ChevronDown, 
  Lock, 
  CheckCircle, 
  Target, 
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRealTimeCareerData } from './RealTimeCareerData';
import { motion } from 'framer-motion';

interface SkillNode {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  category: 'core' | 'technical' | 'soft' | 'leadership';
  isUnlocked: boolean;
  isCompleted: boolean;
  prerequisites?: string[];
  estimatedTime: string;
  description: string;
  marketDemand: number;
  salaryImpact: string;
}

interface SkillCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  skills: SkillNode[];
  progress: number;
}

interface RealSkillsTreeProps {
  skillCategories?: any[];
}

export const RealSkillsTree: React.FC<RealSkillsTreeProps> = ({ skillCategories: propSkillCategories = [] }) => {
  const { data, isLoading } = useRealTimeCareerData();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['technical']);
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);

  // Generate skill categories based on real user data
  const generateSkillCategories = (): SkillCategory[] => {
    if (!data?.profile || !data?.careerGoals?.length) {
      return [];
    }

    const currentRole = data.profile.title || 'Software Developer';
    const targetRole = data.careerGoals[0]?.target_role || 'Senior Software Engineer';
    const userSkills = data.profile.skills || [];

    // Generate skills based on actual career progression
    const technicalSkills: SkillNode[] = [
      {
        id: 'javascript',
        name: 'JavaScript/TypeScript',
        level: userSkills.includes('JavaScript') ? 4 : 2,
        maxLevel: 5,
        category: 'technical',
        isUnlocked: true,
        isCompleted: userSkills.includes('JavaScript'),
        estimatedTime: '3 months',
        description: 'Master modern JavaScript and TypeScript for full-stack development',
        marketDemand: 95,
        salaryImpact: '+$8k-15k'
      },
      {
        id: 'react',
        name: 'React/Next.js',
        level: userSkills.includes('React') ? 3 : 1,
        maxLevel: 5,
        category: 'technical',
        isUnlocked: userSkills.includes('JavaScript'),
        isCompleted: userSkills.includes('React'),
        prerequisites: ['JavaScript/TypeScript'],
        estimatedTime: '4 months',
        description: 'Build modern web applications with React ecosystem',
        marketDemand: 88,
        salaryImpact: '+$10k-20k'
      },
      {
        id: 'cloud',
        name: 'Cloud Architecture (AWS/Azure)',
        level: userSkills.includes('AWS') ? 3 : 0,
        maxLevel: 5,
        category: 'technical',
        isUnlocked: targetRole.toLowerCase().includes('senior') || targetRole.toLowerCase().includes('architect'),
        isCompleted: false,
        prerequisites: ['JavaScript/TypeScript', 'React/Next.js'],
        estimatedTime: '6 months',
        description: 'Design and implement scalable cloud solutions',
        marketDemand: 92,
        salaryImpact: '+$15k-30k'
      }
    ];

    const softSkills: SkillNode[] = [
      {
        id: 'communication',
        name: 'Technical Communication',
        level: 3,
        maxLevel: 5,
        category: 'soft',
        isUnlocked: true,
        isCompleted: false,
        estimatedTime: '2 months',
        description: 'Effectively communicate technical concepts to diverse audiences',
        marketDemand: 85,
        salaryImpact: '+$5k-12k'
      },
      {
        id: 'leadership',
        name: 'Team Leadership',
        level: targetRole.toLowerCase().includes('lead') || targetRole.toLowerCase().includes('manager') ? 2 : 0,
        maxLevel: 5,
        category: 'leadership',
        isUnlocked: targetRole.toLowerCase().includes('senior') || targetRole.toLowerCase().includes('lead'),
        isCompleted: false,
        prerequisites: ['Technical Communication'],
        estimatedTime: '4 months',
        description: 'Lead technical teams and mentor junior developers',
        marketDemand: 78,
        salaryImpact: '+$12k-25k'
      }
    ];

    const categories: SkillCategory[] = [
      {
        id: 'technical',
        name: 'Technical Skills',
        icon: <BookOpen className="h-5 w-5 text-white" />,
        color: 'from-blue-500 to-cyan-500',
        description: 'Core technical competencies for your career path',
        skills: technicalSkills,
        progress: Math.round((technicalSkills.reduce((sum, skill) => sum + (skill.level / skill.maxLevel) * 100, 0) / technicalSkills.length))
      },
      {
        id: 'soft',
        name: 'Soft Skills',
        icon: <Target className="h-5 w-5 text-white" />,
        color: 'from-green-500 to-emerald-500',
        description: 'Communication and collaboration skills',
        skills: softSkills.filter(s => s.category === 'soft'),
        progress: Math.round((softSkills.filter(s => s.category === 'soft').reduce((sum, skill) => sum + (skill.level / skill.maxLevel) * 100, 0) / softSkills.filter(s => s.category === 'soft').length))
      },
      {
        id: 'leadership',
        name: 'Leadership',
        icon: <Award className="h-5 w-5 text-white" />,
        color: 'from-purple-500 to-pink-500',
        description: 'Leadership and management capabilities',
        skills: softSkills.filter(s => s.category === 'leadership'),
        progress: Math.round((softSkills.filter(s => s.category === 'leadership').reduce((sum, skill) => sum + (skill.level / skill.maxLevel) * 100, 0) / softSkills.filter(s => s.category === 'leadership').length) || 0)
      }
    ];

    return categories;
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getSkillStatusIcon = (skill: SkillNode) => {
    if (skill.isCompleted) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (!skill.isUnlocked) return <Lock className="h-4 w-4 text-gray-400" />;
    return <Target className="h-4 w-4 text-blue-500" />;
  };

  const getSkillStatusColor = (skill: SkillNode) => {
    if (skill.isCompleted) return 'border-green-200 bg-green-50';
    if (!skill.isUnlocked) return 'border-gray-200 bg-gray-50';
    return 'border-blue-200 bg-blue-50';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const generatedSkillCategories = generateSkillCategories();
  const skillCategories = propSkillCategories.length > 0 ? propSkillCategories : generatedSkillCategories;

  if (!skillCategories.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-gray-700 mb-2">Complete Your Profile</h3>
          <p className="text-sm text-gray-500">
            Add your skills and career goals to generate your personalized skill tree.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personalization Header */}
      {data?.profile && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  Skills Roadmap: {data.profile.title || 'Current Role'} → {data.careerGoals?.[0]?.target_role || 'Target Role'}
                </h3>
                <p className="text-sm text-blue-700">
                  AI-curated skills based on your career trajectory and market demand
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-blue-700">Real-time market data</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-blue-700">Personalized progression</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Tree */}
        <div className="lg:col-span-2 space-y-4">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardHeader 
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-slate-50 pb-3",
                    `bg-gradient-to-r ${category.color}`
                  )}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        {category.icon}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{category.name}</CardTitle>
                        <p className="text-white/80 text-sm">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-white text-sm font-medium">
                          {Math.round(category.progress)}% Complete
                        </div>
                        <Progress value={category.progress} className="w-20 h-2 bg-white/20" />
                      </div>
                      {expandedCategories.includes(category.id) ? 
                        <ChevronDown className="h-5 w-5 text-white" /> : 
                        <ChevronRight className="h-5 w-5 text-white" />
                      }
                    </div>
                  </div>
                </CardHeader>

                {expandedCategories.includes(category.id) && (
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.skills.map((skill) => (
                        <motion.div
                          key={skill.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            "p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                            getSkillStatusColor(skill),
                            selectedSkill?.id === skill.id && "ring-2 ring-blue-400"
                          )}
                          onClick={() => setSelectedSkill(skill)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getSkillStatusIcon(skill)}
                              <h4 className="font-medium text-sm">{skill.name}</h4>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Level {skill.level}/{skill.maxLevel}
                            </Badge>
                          </div>
                          
                          <Progress 
                            value={(skill.level / skill.maxLevel) * 100} 
                            className="h-2 mb-2" 
                          />
                          
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{skill.estimatedTime}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-green-500" />
                              <span>{skill.marketDemand}%</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Skill Detail Panel */}
        <div className="space-y-4">
          {selectedSkill ? (
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-2">
                  {getSkillStatusIcon(selectedSkill)}
                  <CardTitle className="text-lg">{selectedSkill.name}</CardTitle>
                </div>
                <Badge 
                  variant={selectedSkill.isCompleted ? "default" : "outline"}
                  className="w-fit"
                >
                  {selectedSkill.category} skill
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-1">Progress</h4>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Level {selectedSkill.level}</span>
                    <span>{Math.round((selectedSkill.level / selectedSkill.maxLevel) * 100)}%</span>
                  </div>
                  <Progress value={(selectedSkill.level / selectedSkill.maxLevel) * 100} className="h-3" />
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-600">{selectedSkill.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Market Demand</h4>
                    <div className="flex items-center gap-2">
                      <Progress value={selectedSkill.marketDemand} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{selectedSkill.marketDemand}%</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Salary Impact</h4>
                    <div className="text-sm font-medium text-green-600">{selectedSkill.salaryImpact}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Estimated Time</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{selectedSkill.estimatedTime}</span>
                  </div>
                </div>

                {selectedSkill.prerequisites && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Prerequisites</h4>
                    <div className="space-y-1">
                      {selectedSkill.prerequisites.map((prereq, index) => (
                        <Badge key={index} variant="outline" className="text-xs mr-1">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  disabled={!selectedSkill.isUnlocked}
                >
                  {selectedSkill.isCompleted ? 'Completed' : 'Start Learning'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-700 mb-2">Select a Skill</h3>
                <p className="text-sm text-gray-500">
                  Click on any skill in the tree to view details and learning path.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};