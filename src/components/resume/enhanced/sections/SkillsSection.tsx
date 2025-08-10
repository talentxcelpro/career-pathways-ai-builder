
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Code, Star } from "lucide-react";
import { Skill } from "@/types/enhanced-resume";

interface SkillsSectionProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  data,
  onChange,
}) => {
  const addSkill = () => {
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: "",
      level: "intermediate",
      category: "Technical",
      years: 0,
    };
    onChange([...data, newSkill]);
  };

  const updateSkill = (id: string, field: keyof Skill, value: any) => {
    onChange(
      data.map((skill) =>
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    );
  };

  const removeSkill = (id: string) => {
    onChange(data.filter((skill) => skill.id !== id));
  };

  const skillLevels = ["beginner", "intermediate", "advanced", "expert"];
  const skillCategories = ["Technical", "Design", "Management", "Language", "Other"];

  const groupedSkills = data.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Skills
        </CardTitle>
        <Button onClick={addSkill} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedSkills).map(([category, skills]) => (
          <div key={category} className="space-y-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              {category}
            </h4>
            <div className="space-y-3">
              {skills.map((skill) => (
                <Card key={skill.id} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <Label htmlFor={`skill-name-${skill.id}`}>Skill Name *</Label>
                      <Input
                        id={`skill-name-${skill.id}`}
                        value={skill.name || ""}
                        onChange={(e) => updateSkill(skill.id, "name", e.target.value)}
                        placeholder="e.g., JavaScript"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`skill-level-${skill.id}`}>Proficiency Level</Label>
                      <Select
                        value={skill.level}
                        onValueChange={(value) => updateSkill(skill.id, "level", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {skillLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < skillLevels.indexOf(level) + 1
                                          ? "fill-primary text-primary"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span>{level}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`skill-category-${skill.id}`}>Category</Label>
                      <Select
                        value={skill.category}
                        onValueChange={(value) => updateSkill(skill.id, "category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {skillCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`skill-years-${skill.id}`}>Years</Label>
                        <Input
                          id={`skill-years-${skill.id}`}
                          type="number"
                          min="0"
                          max="50"
                          value={skill.years || 0}
                          onChange={(e) => updateSkill(skill.id, "years", parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <Button
                        onClick={() => removeSkill(skill.id)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
        
        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No skills added yet.</p>
            <p className="text-sm">Click "Add Skill" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
