
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

interface SkillsBenefitsFormProps {
  formData: {
    skills_required: string[];
    benefits: string[];
  };
  onInputChange: (key: string, value: any) => void;
}

export default function SkillsBenefitsForm({ formData, onInputChange }: SkillsBenefitsFormProps) {
  const [newSkill, setNewSkill] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills_required.includes(newSkill.trim())) {
      onInputChange('skills_required', [...formData.skills_required, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    onInputChange('skills_required', formData.skills_required.filter(s => s !== skill));
  };

  const addBenefit = () => {
    if (newBenefit.trim() && !formData.benefits.includes(newBenefit.trim())) {
      onInputChange('benefits', [...formData.benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const removeBenefit = (benefit: string) => {
    onInputChange('benefits', formData.benefits.filter(b => b !== benefit));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Benefits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skills */}
        <div>
          <Label>Required Skills</Label>
          <div className="flex space-x-2 mt-2">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.skills_required.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div>
          <Label>Benefits</Label>
          <div className="flex space-x-2 mt-2">
            <Input
              placeholder="Add a benefit..."
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
            />
            <Button type="button" onClick={addBenefit} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.benefits.map((benefit) => (
              <Badge key={benefit} variant="outline">
                {benefit}
                <button
                  type="button"
                  onClick={() => removeBenefit(benefit)}
                  className="ml-2 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
