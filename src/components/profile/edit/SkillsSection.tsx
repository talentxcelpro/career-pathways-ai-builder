import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { SKILL_CATEGORIES } from './skillCategories';

interface SkillsSectionProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, onSkillsChange }) => {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onSkillsChange([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  const addSkillFromDropdown = (value: string) => {
    if (value && !skills.includes(value)) {
      onSkillsChange([...skills, value]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Expertise</CardTitle>
        <CardDescription>Add your technical and professional skills from our comprehensive list</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="relative group">
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SKILL_CATEGORIES.map((category) => (
              <div key={category.name}>
                <label className="text-sm font-medium mb-2 block">{category.emoji} {category.name}</label>
                <Select onValueChange={addSkillFromDropdown}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {category.skills.map((skill) => (
                      <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          
          {/* Custom skill input for skills not in the list */}
          <div className="border-t pt-4">
            <label className="text-sm font-medium mb-2 block">Add Custom Skill</label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter a custom skill not listed above"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};