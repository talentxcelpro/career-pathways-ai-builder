
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp, Clock, Star, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAICareerMapping } from '@/hooks/useAICareerMapping';

interface Skill {
  name: string;
  proficiency: number;
  category: string;
}

interface SkillsGapAnalyzerProps {
  currentSkills?: Skill[];
  targetRole?: string;
  onAnalysisComplete?: (analysis: any) => void;
}

export const SkillsGapAnalyzer: React.FC<SkillsGapAnalyzerProps> = ({
  currentSkills = [],
  targetRole = '',
  onAnalysisComplete
}) => {
  const [skills, setSkills] = useState<Skill[]>(currentSkills);
  const [role, setRole] = useState(targetRole);
  const [industry, setIndustry] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);

  const { analyzeSkillsGap, isAnalyzingSkillsGap } = useAICareerMapping();

  const addSkill = () => {
    setSkills([...skills, { name: '', proficiency: 3, category: 'Technical' }]);
  };

  const updateSkill = (index: number, field: keyof Skill, value: string | number) => {
    const updatedSkills = [...skills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setSkills(updatedSkills);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const runAnalysis = async () => {
    if (!role || skills.length === 0) return;

    try {
      const result = await analyzeSkillsGap.mutateAsync({
        currentSkills: skills.filter(skill => skill.name.trim() !== ''),
        targetRole: role,
        industryFocus: industry
      });

      if (result.success) {
        setAnalysis(result.analysis);
        onAnalysisComplete?.(result.analysis);
      }
    } catch (error) {
      console.error('Skills gap analysis failed:', error);
    }
  };

  const getGapColor = (gapSize: string) => {
    switch (gapSize) {
      case 'Large': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Small': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Skills Gap Analysis Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Role</label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Data Scientist, Product Manager"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Industry Focus (Optional)</label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Current Skills */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Current Skills</h3>
              <Button onClick={addSkill} variant="outline" size="sm">
                Add Skill
              </Button>
            </div>

            {skills.map((skill, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border rounded-lg">
                <Input
                  value={skill.name}
                  onChange={(e) => updateSkill(index, 'name', e.target.value)}
                  placeholder="Skill name"
                />
                <Select 
                  value={skill.category} 
                  onValueChange={(value) => updateSkill(index, 'category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Programming">Programming</SelectItem>
                    <SelectItem value="Tools">Tools</SelectItem>
                    <SelectItem value="Frameworks">Frameworks</SelectItem>
                    <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                    <SelectItem value="Leadership">Leadership</SelectItem>
                  </SelectContent>
                </Select>
                <div className="space-y-2">
                  <label className="text-xs text-gray-600">Proficiency (1-5)</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={skill.proficiency}
                    onChange={(e) => updateSkill(index, 'proficiency', parseInt(e.target.value))}
                  />
                </div>
                <Button 
                  onClick={() => removeSkill(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <Button 
            onClick={runAnalysis}
            disabled={!role || skills.length === 0 || isAnalyzingSkillsGap}
            className="w-full"
          >
            {isAnalyzingSkillsGap ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Analyzing Skills Gap...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Analyze Skills Gap
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Overall Readiness Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analysis.gapAnalysis.overallScore}%
                  </div>
                  <p className="text-sm text-gray-600">Readiness Score</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-2">
                    {analysis.gapAnalysis.readinessLevel}
                  </div>
                  <p className="text-sm text-gray-600">Current Level</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold mb-2">
                    {analysis.gapAnalysis.estimatedTimeToReadiness}
                  </div>
                  <p className="text-sm text-gray-600">Time to Ready</p>
                </div>
              </div>
              <Progress value={analysis.gapAnalysis.overallScore} className="mt-6" />
            </CardContent>
          </Card>

          {/* Critical Gaps */}
          {analysis.criticalGaps && analysis.criticalGaps.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Critical Skill Gaps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.criticalGaps.map((gap: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">{gap.skillName}</h4>
                        <div className="flex gap-2">
                          <Badge className={getUrgencyColor(gap.urgency)}>
                            {gap.urgency}
                          </Badge>
                          <Badge variant="outline">
                            {gap.marketDemand} Demand
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Current:</span> {gap.currentLevel}/5
                        </div>
                        <div>
                          <span className="text-gray-600">Required:</span> {gap.requiredLevel}/5
                        </div>
                        <div>
                          <span className="text-gray-600">Gap Size:</span> {gap.gapSize}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {gap.learningTimeEstimate}
                        </div>
                      </div>
                      {gap.recommendedResources && (
                        <div className="mt-3">
                          <p className="text-sm font-medium mb-2">Recommended Resources:</p>
                          <div className="flex flex-wrap gap-1">
                            {gap.recommendedResources.map((resource: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.strengths.map((strength: any, index: number) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{strength.skillName}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{strength.currentLevel}/5</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Market Value: {strength.marketValue}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {strength.transferability} Transfer
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
