
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Code, Star } from 'lucide-react';
import { Skill } from '@/types/enhanced-resume';

interface SkillsSectionProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  data,
  onChange
}) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('technical');
  const [newSkillLevel, setNewSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');

  const skillCategories = [
    { value: 'technical', label: 'Technical Skills' },
    { value: 'soft', label: 'Soft Skills' },
    { value: 'language', label: 'Languages' },
    { value: 'tools', label: 'Tools & Software' },
    { value: 'other', label: 'Other' }
  ];

  const skillLevels = [
    { value: 'beginner', label: 'Beginner', color: 'text-red-600' },
    { value: 'intermediate', label: 'Intermediate', color: 'text-yellow-600' },
    { value: 'advanced', label: 'Advanced', color: 'text-blue-600' },
    { value: 'expert', label: 'Expert', color: 'text-green-600' }
  ];

  const addSkill = () => {
    if (!newSkillName.trim()) return;

    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      name: newSkillName.trim(),
      level: newSkillLevel,
      category: newSkillCategory
    };

    onChange([...data, newSkill]);
    setNewSkillName('');
  };

  const removeSkill = (id: string) => {
    onChange(data.filter(skill => skill.id !== id));
  };

  const updateSkill = (id: string, field: keyof Skill, value: any) => {
    onChange(data.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const getSkillsByCategory = (category: string) => {
    return data.filter(skill => skill.category === category);
  };

  const getLevelIcon = (level: string) => {
    const count = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 }[level] || 1;
    return (
      <div className="flex gap-1">
        {[...Array(4)].map((_, index) => (
          <Star
            key={index}
            className={`h-3 w-3 ${
              index < count ? 'fill-current text-yellow-500' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Skills & Expertise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Skill */}
        <div className="border rounded-lg p-4 space-y-4">
          <h4 className="font-medium">Add New Skill</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Skill Name</Label>
              <Input
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="JavaScript, Leadership, etc."
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Proficiency Level</Label>
              <Select value={newSkillLevel} onValueChange={(value: any) => setNewSkillLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skillLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addSkill} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>
          </div>
        </div>

        {/* Skills by Category */}
        {skillCategories.map((category) => {
          const categorySkills = getSkillsByCategory(category.value);
          if (categorySkills.length === 0) return null;

          return (
            <div key={category.value} className="space-y-3">
              <h4 className="font-medium text-lg">{category.label}</h4>
              <div className="grid gap-3">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{skill.name}</span>
                      {getLevelIcon(skill.level)}
                      <Badge variant="outline" className="text-xs">
                        {skillLevels.find(l => l.value === skill.level)?.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={skill.level}
                        onValueChange={(value: any) => updateSkill(skill.id, 'level', value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {skillLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(skill.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No skills added yet. Add your first skill above.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
