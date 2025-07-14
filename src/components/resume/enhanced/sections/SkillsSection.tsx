import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Plus, X, Code, Users, Brain, Layers } from "lucide-react";
import { SkillsSection as SkillsSectionType, Skill } from "@/types/enhanced-resume";

interface SkillsSectionProps {
  data: SkillsSectionType;
  onChange: (data: SkillsSectionType) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  data,
  onChange
}) => {
  const [newSkills, setNewSkills] = useState<{ [key: string]: string }>({});

  const skillCategories = [
    { key: 'technical', title: 'Technical Skills', icon: Code, description: 'Programming languages, frameworks, databases' },
    { key: 'soft', title: 'Soft Skills', icon: Users, description: 'Communication, leadership, problem-solving' },
    { key: 'domain', title: 'Domain Knowledge', icon: Brain, description: 'Industry-specific expertise' },
    { key: 'frameworks', title: 'Frameworks & Libraries', icon: Layers, description: 'Development frameworks and tools' }
  ];

  const addSkill = (category: keyof SkillsSectionType) => {
    const skillName = newSkills[category]?.trim();
    if (skillName) {
      const newSkill: Skill = {
        name: skillName,
        level: 'intermediate',
        yearsOfExperience: 1
      };
      
      onChange({
        ...data,
        [category]: [...(data[category] || []), newSkill]
      });
      
      setNewSkills({ ...newSkills, [category]: '' });
    }
  };

  const updateSkill = (category: keyof SkillsSectionType, index: number, field: keyof Skill, value: any) => {
    const categorySkills = [...(data[category] || [])];
    categorySkills[index] = { ...categorySkills[index], [field]: value };
    
    onChange({
      ...data,
      [category]: categorySkills
    });
  };

  const removeSkill = (category: keyof SkillsSectionType, index: number) => {
    const categorySkills = data[category] || [];
    onChange({
      ...data,
      [category]: categorySkills.filter((_, i) => i !== index)
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-red-100 text-red-800 border-red-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expert': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderSkillCategory = (category: keyof SkillsSectionType, categoryInfo: any) => {
    const skills = data[category] || [];
    const Icon = categoryInfo.icon;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <div>
            <h4 className="font-medium">{categoryInfo.title}</h4>
            <p className="text-sm text-muted-foreground">{categoryInfo.description}</p>
          </div>
        </div>

        {/* Existing Skills */}
        {skills.length > 0 && (
          <div className="space-y-3">
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <Input
                    value={skill.name}
                    onChange={(e) => updateSkill(category, index, 'name', e.target.value)}
                    placeholder="Skill name"
                    className="border-none p-0 h-auto font-medium"
                  />
                </div>
                
                <Select
                  value={skill.level}
                  onValueChange={(value) => updateSkill(category, index, 'level', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={skill.yearsOfExperience?.toString() || '1'}
                  onValueChange={(value) => updateSkill(category, index, 'yearsOfExperience', parseInt(value))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 yr</SelectItem>
                    <SelectItem value="2">2 yrs</SelectItem>
                    <SelectItem value="3">3 yrs</SelectItem>
                    <SelectItem value="4">4 yrs</SelectItem>
                    <SelectItem value="5">5+ yrs</SelectItem>
                    <SelectItem value="10">10+ yrs</SelectItem>
                  </SelectContent>
                </Select>

                <Badge className={getLevelColor(skill.level)}>
                  {skill.level}
                </Badge>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSkill(category, index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Skill */}
        <div className="flex gap-2">
          <Input
            value={newSkills[category] || ''}
            onChange={(e) => setNewSkills({ ...newSkills, [category]: e.target.value })}
            placeholder={`Add ${categoryInfo.title.toLowerCase()}...`}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(category);
              }
            }}
          />
          <Button
            onClick={() => addSkill(category)}
            disabled={!newSkills[category]?.trim()}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Category-specific tips */}
        <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3">
          {category === 'technical' && (
            <div>
              <strong>Examples:</strong> JavaScript, Python, React, Node.js, AWS, Docker, Git
            </div>
          )}
          {category === 'soft' && (
            <div>
              <strong>Examples:</strong> Leadership, Communication, Problem-solving, Team collaboration, Project management
            </div>
          )}
          {category === 'domain' && (
            <div>
              <strong>Examples:</strong> Financial Services, Healthcare, E-commerce, Machine Learning, DevOps
            </div>
          )}
          {category === 'frameworks' && (
            <div>
              <strong>Examples:</strong> React, Angular, Django, Spring Boot, TensorFlow, Kubernetes
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Skills & Competencies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="technical" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {skillCategories.map((category) => (
              <TabsTrigger key={category.key} value={category.key} className="text-xs">
                {category.title.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {skillCategories.map((category) => (
            <TabsContent key={category.key} value={category.key} className="mt-6">
              {renderSkillCategory(category.key as keyof SkillsSectionType, category)}
            </TabsContent>
          ))}
        </Tabs>

        {/* Overall Skills Summary */}
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-3">Skills Overview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skillCategories.map((category) => {
              const count = data[category.key as keyof SkillsSectionType]?.length || 0;
              return (
                <div key={category.key} className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="font-semibold text-lg">{count}</div>
                  <div className="text-xs text-muted-foreground">{category.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Enhancement Suggestion */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Skills Optimization
            </span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
            Get AI suggestions for in-demand skills in your field and optimize skill levels for better ATS matching.
          </p>
          <Button size="sm" variant="outline" className="text-blue-600 border-blue-300">
            <Zap className="h-4 w-4 mr-2" />
            Optimize Skills
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
