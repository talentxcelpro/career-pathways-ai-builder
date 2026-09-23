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
    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-xs rounded-2xl">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Skills & Expertise</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">Add verified technical and domain skills to boost your TalentScore</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
        <div className="space-y-3.5">
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800/60">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-1.5">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {SKILL_CATEGORIES.map((category) => (
              <div key={category.name}>
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">{category.emoji} {category.name}</label>
                <Select onValueChange={addSkillFromDropdown}>
                  <SelectTrigger className="h-9 text-xs sm:text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shadow-xs">
                    <SelectValue placeholder="Select a skill to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {category.skills.map((skill) => (
                      <SelectItem key={skill} value={skill} className="text-xs">{skill}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          
          {/* Custom skill input for skills not in the list */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Add Custom Skill</label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Enter a custom skill not listed above..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="h-9 text-xs sm:text-sm rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shadow-xs"
              />
              <Button 
                onClick={addSkill} 
                size="sm"
                className="h-9 px-3.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};