import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2, Lightbulb, Plus, X, Target } from 'lucide-react';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: 'Technical' | 'Soft' | 'Language' | 'Certification';
}

interface AIEnhancedSkillsSectionProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

export const AIEnhancedSkillsSection: React.FC<AIEnhancedSkillsSectionProps> = ({
  data,
  onChange
}) => {
  const { invokeAITool, isProcessing } = useAIService();
  const [jobDescription, setJobDescription] = useState('');
  const [newSkill, setNewSkill] = useState({ name: '', level: 'Intermediate' as const, category: 'Technical' as const });
  const [optimizing, setOptimizing] = useState(false);

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    
    const skill: Skill = {
      id: Date.now().toString(),
      name: newSkill.name.trim(),
      level: newSkill.level,
      category: newSkill.category
    };
    
    onChange([...data, skill]);
    setNewSkill({ name: '', level: 'Intermediate', category: 'Technical' });
  };

  const removeSkill = (id: string) => {
    onChange(data.filter(skill => skill.id !== id));
  };

  const updateSkill = (id: string, field: keyof Skill, value: any) => {
    onChange(data.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const optimizeSkills = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please enter a job description to optimize skills');
      return;
    }

    setOptimizing(true);
    try {
      const currentSkills = data.map(skill => skill.name).join(', ');
      
      const result = await invokeAITool({
        toolSlug: 'skills-optimizer',
        inputData: {
          resume_text: currentSkills,
          job_description: jobDescription,
          target_role: 'Professional'
        },
        category: 'skills_optimization'
      });

      if (result.success && result.data) {
        const { technicalSkills = [], softSkills = [], recommendations = [] } = result.data;
        
        // Add suggested skills that aren't already present
        const existingSkillNames = data.map(skill => skill.name.toLowerCase());
        const newSkills: Skill[] = [];
        
        [...technicalSkills, ...softSkills].forEach((skillName: string) => {
          if (!existingSkillNames.includes(skillName.toLowerCase())) {
            newSkills.push({
              id: Date.now().toString() + Math.random(),
              name: skillName,
              level: 'Intermediate',
              category: technicalSkills.includes(skillName) ? 'Technical' : 'Soft'
            });
          }
        });

        if (newSkills.length > 0) {
          onChange([...data, ...newSkills]);
          toast.success(`Added ${newSkills.length} AI-suggested skills!`);
        } else {
          toast.info('Your skills are already well-optimized for this job!');
        }

        if (recommendations.length > 0) {
          toast.info(`AI Recommendations: ${recommendations.slice(0, 2).join(', ')}`);
        }
      } else {
        toast.error('Failed to optimize skills');
      }
    } catch (error) {
      toast.error('AI optimization failed');
      console.error('Skills optimization error:', error);
    } finally {
      setOptimizing(false);
    }
  };

  const skillsByCategory = data.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Expert': return 'bg-green-100 text-green-800 border-green-200';
      case 'Advanced': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Beginner': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Technical': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Soft': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Language': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Certification': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Skills & Competencies
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Optimization Panel */}
        <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-medium">AI Skills Optimization</h3>
            </div>
            <div className="space-y-3">
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste a job description here to get AI-powered skill suggestions..."
                className="min-h-[100px]"
              />
              <Button
                onClick={optimizeSkills}
                disabled={isProcessing || optimizing || !jobDescription.trim()}
                className="w-full sm:w-auto"
              >
                {optimizing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Optimize Skills with AI
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add New Skill */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-3">Add New Skill</h3>
            <div className="flex flex-wrap gap-2">
              <Input
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                placeholder="Skill name"
                className="flex-1 min-w-[200px]"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <select
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value as any })}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as any })}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="Technical">Technical</option>
                <option value="Soft">Soft Skills</option>
                <option value="Language">Language</option>
                <option value="Certification">Certification</option>
              </select>
              <Button onClick={addSkill} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skills by Category */}
        {Object.entries(skillsByCategory).length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No skills added yet.</p>
            <p className="text-sm">Add your first skill or use AI optimization to get started.</p>
          </div>
        ) : (
          Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category} className="space-y-3">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <Badge className={getCategoryColor(category)}>
                  {category} Skills
                </Badge>
                <span className="text-sm text-muted-foreground">({skills.length})</span>
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="group relative flex items-center gap-2 p-2 border rounded-lg bg-background hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium">{skill.name}</span>
                    <Badge 
                      variant="outline"
                      className={`${getLevelColor(skill.level)} text-xs`}
                    >
                      {skill.level}
                    </Badge>
                    <Button
                      onClick={() => removeSkill(skill.id)}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-2">💡 Tips for Better Skills Section</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Include both technical and soft skills relevant to your target role</li>
            <li>• Be honest about your skill levels - it builds trust</li>
            <li>• Use industry-standard skill names and terminology</li>
            <li>• Prioritize skills mentioned in job descriptions you're targeting</li>
            <li>• Include certifications and languages as separate categories</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};