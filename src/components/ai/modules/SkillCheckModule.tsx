import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Target, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { useAI } from '@/contexts/AIContext';
import { toast } from 'sonner';

interface SkillCheckModuleProps {
  onResult: (message: string) => void;
  userProfile?: any;
}

interface Skill {
  name: string;
  category: string;
  proficiency: number;
  inDemand: boolean;
  trending: boolean;
}

interface LearningRecommendation {
  skill: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  estimatedTime: string;
  resources: string[];
}

export const SkillCheckModule: React.FC<SkillCheckModuleProps> = ({ onResult, userProfile }) => {
  const [currentSkills, setCurrentSkills] = useState<Skill[]>([]);
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([]);
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { userProfile: aiUserProfile } = useAI();

  // Mock skill data - in production, this would come from user profile
  useEffect(() => {
    const mockSkills: Skill[] = [
      { name: 'JavaScript', category: 'Programming', proficiency: 85, inDemand: true, trending: false },
      { name: 'React', category: 'Frontend', proficiency: 80, inDemand: true, trending: true },
      { name: 'Node.js', category: 'Backend', proficiency: 70, inDemand: true, trending: false },
      { name: 'Python', category: 'Programming', proficiency: 60, inDemand: true, trending: true },
      { name: 'SQL', category: 'Database', proficiency: 75, inDemand: true, trending: false },
      { name: 'Docker', category: 'DevOps', proficiency: 50, inDemand: true, trending: true },
      { name: 'AWS', category: 'Cloud', proficiency: 40, inDemand: true, trending: true },
      { name: 'Machine Learning', category: 'AI/ML', proficiency: 30, inDemand: true, trending: true },
    ];
    setCurrentSkills(mockSkills);
  }, []);

  const analyzeSkills = async () => {
    if (!targetRole.trim()) {
      toast.error('Please specify your target role.');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const mockRecommendations: LearningRecommendation[] = [
        {
          skill: 'TypeScript',
          priority: 'High',
          reason: 'Essential for senior frontend roles, builds on your JavaScript expertise',
          estimatedTime: '2-3 weeks',
          resources: ['TypeScript Handbook', 'TypeScript Deep Dive', 'Practical TypeScript Course']
        },
        {
          skill: 'GraphQL',
          priority: 'Medium',
          reason: 'Increasingly popular API technology, complements your React/Node.js skills',
          estimatedTime: '1-2 weeks',
          resources: ['GraphQL Tutorial', 'Apollo Client Guide', 'GraphQL with React']
        },
        {
          skill: 'Kubernetes',
          priority: 'High',
          reason: 'Critical for DevOps and cloud deployment, builds on Docker knowledge',
          estimatedTime: '3-4 weeks',
          resources: ['Kubernetes Basics', 'K8s in Action', 'CKAD Certification Prep']
        },
        {
          skill: 'System Design',
          priority: 'High',
          reason: 'Essential for senior engineering roles and technical interviews',
          estimatedTime: '4-6 weeks',
          resources: ['System Design Primer', 'Designing Data-Intensive Applications', 'System Design Interview']
        }
      ];

      setRecommendations(mockRecommendations);
      setAnalysisComplete(true);
      setIsAnalyzing(false);
      onResult(`Skill analysis complete! Found ${mockRecommendations.length} key areas for growth in ${targetRole} role.`);
    }, 2000);
  };

  const getProficiencyColor = (proficiency: number) => {
    if (proficiency >= 80) return 'text-green-600';
    if (proficiency >= 60) return 'text-blue-600';
    if (proficiency >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProficiencyLabel = (proficiency: number) => {
    if (proficiency >= 80) return 'Expert';
    if (proficiency >= 60) return 'Advanced';
    if (proficiency >= 40) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          AI Skill Assessment & Learning Path
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysisComplete ? (
          <>
            {/* Input Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Role</label>
                <input
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Senior Software Engineer, Full Stack Developer"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Industry/Domain</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select industry</option>
                  <option value="fintech">FinTech</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="saas">SaaS</option>
                  <option value="gaming">Gaming</option>
                  <option value="ai">AI/ML</option>
                </select>
              </div>
            </div>

            {/* Current Skills Overview */}
            <div className="space-y-3">
              <h4 className="font-medium">Current Skill Profile</h4>
              <div className="grid grid-cols-1 gap-3">
                {currentSkills.slice(0, 6).map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{skill.name}</span>
                          {skill.trending && <Badge variant="default" className="text-xs">Trending</Badge>}
                          {skill.inDemand && <Badge variant="outline" className="text-xs">In Demand</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">{skill.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getProficiencyColor(skill.proficiency)}`}>
                        {getProficiencyLabel(skill.proficiency)}
                      </span>
                      <div className="w-16">
                        <Progress value={skill.proficiency} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analyze Button */}
            <Button 
              onClick={analyzeSkills} 
              disabled={isAnalyzing || !targetRole.trim()}
              className="w-full"
            >
              {isAnalyzing ? 'Analyzing Skills & Market Trends...' : 'Analyze Skills & Get Learning Path'}
            </Button>
          </>
        ) : (
          <>
            {/* Analysis Results */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-semibold">Skill Analysis Complete</span>
              </div>

              {/* Skill Gap Summary */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary">8</div>
                  <div className="text-xs text-muted-foreground">Strong Skills</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-amber-600">4</div>
                  <div className="text-xs text-muted-foreground">Skills to Improve</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">3</div>
                  <div className="text-xs text-muted-foreground">Critical Gaps</div>
                </div>
              </div>

              {/* Learning Recommendations */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Recommended Learning Path
                </h4>
                
                {recommendations.map((rec, index) => (
                  <div key={rec.skill} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rec.skill}</span>
                        <Badge variant={rec.priority === 'High' ? 'destructive' : rec.priority === 'Medium' ? 'secondary' : 'outline'}>
                          {rec.priority} Priority
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {rec.estimatedTime}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Recommended Resources:</span>
                      <div className="flex flex-wrap gap-1">
                        {rec.resources.map((resource, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Market Insights */}
              <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Market Insights for {targetRole}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• TypeScript adoption increased 40% among senior roles</li>
                  <li>• Cloud skills (AWS/K8s) are required in 85% of job postings</li>
                  <li>• System design knowledge is tested in 90% of senior interviews</li>
                  <li>• Companies are prioritizing full-stack engineers with DevOps skills</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setAnalysisComplete(false);
                    setRecommendations([]);
                  }}
                  className="flex-1"
                >
                  New Analysis
                </Button>
                <Button 
                  onClick={() => onResult('Learning path saved! Track your progress and update skills as you learn.')}
                  className="flex-1"
                >
                  Save Learning Path
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};