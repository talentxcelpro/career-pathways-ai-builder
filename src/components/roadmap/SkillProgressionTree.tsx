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

interface Skill {
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
  resources: {
    courses: number;
    projects: number;
    certifications: number;
  };
}

interface SkillCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  skills: Skill[];
  progress: number;
}

interface SkillProgressionTreeProps {
  categories: SkillCategory[];
  userProfile?: {
    currentLevel: string;
    targetRole: string;
    experience: string;
  };
  className?: string;
}

export const SkillProgressionTree: React.FC<SkillProgressionTreeProps> = ({
  categories,
  userProfile,
  className
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['core']);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getSkillStatusIcon = (skill: Skill) => {
    if (skill.isCompleted) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (!skill.isUnlocked) return <Lock className="h-4 w-4 text-gray-400" />;
    return <Target className="h-4 w-4 text-blue-500" />;
  };

  const getSkillStatusColor = (skill: Skill) => {
    if (skill.isCompleted) return 'border-green-200 bg-green-50';
    if (!skill.isUnlocked) return 'border-gray-200 bg-gray-50';
    return 'border-blue-200 bg-blue-50';
  };

  const getCategoryIcon = (category: SkillCategory) => {
    return category.icon;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Personalization */}
      {userProfile && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  Based on your profile: {userProfile.currentLevel} → {userProfile.targetRole}
                </h3>
                <p className="text-sm text-blue-700">
                  AI-personalized skill recommendations for {userProfile.experience} experience
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-blue-700">92% Match Score</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-blue-700">High Success Probability</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Tree */}
        <div className="lg:col-span-2 space-y-4">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden">
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
                      {getCategoryIcon(category)}
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
                      <div
                        key={skill.id}
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
                          <span className="capitalize">{skill.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
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

                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Learning Resources</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-500" />
                        <span>Courses</span>
                      </div>
                      <Badge variant="secondary">{selectedSkill.resources.courses}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span>Projects</span>
                      </div>
                      <Badge variant="secondary">{selectedSkill.resources.projects}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-500" />
                        <span>Certifications</span>
                      </div>
                      <Badge variant="secondary">{selectedSkill.resources.certifications}</Badge>
                    </div>
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
                  Click on any skill in the tree to view details and learning resources.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};