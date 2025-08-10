import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, X } from "lucide-react";
import { EditorSkills } from "@/types/editor-resume";

interface SkillsSectionProps {
  data: EditorSkills;
  onChange: (data: EditorSkills) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  data,
  onChange,
}) => {
  const addSkill = (category: keyof EditorSkills, skill: string) => {
    if (!skill.trim() || data[category].includes(skill.trim())) return;
    
    onChange({
      ...data,
      [category]: [...data[category], skill.trim()]
    });
  };

  const removeSkill = (category: keyof EditorSkills, skill: string) => {
    onChange({
      ...data,
      [category]: data[category].filter(s => s !== skill)
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Technical Skills */}
        <div>
          <Label className="text-base font-medium">Technical Skills</Label>
          <div className="flex flex-wrap gap-2 mt-2 mb-2">
            {data.technical.map((skill, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {skill}
                <Button
                  onClick={() => removeSkill('technical', skill)}
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <Input
            placeholder="Add technical skill and press Enter..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const value = e.currentTarget.value.trim();
                if (value) {
                  addSkill('technical', value);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};