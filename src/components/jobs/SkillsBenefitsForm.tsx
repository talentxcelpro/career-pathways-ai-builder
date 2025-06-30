
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SkillsBenefitsFormProps {
  formData: {
    skills_required: string[];
    benefits: string[];
  };
  onInputChange: (key: string, value: any) => void;
}

const popularSkills = [
  'JavaScript', 'React.js', 'Python', 'Data Analysis', 'Sales Strategy',
  'Figma', 'Node.js', 'SEO', 'CRM Tools', 'Communication Skills',
  'Java', 'Angular', 'Vue.js', 'TypeScript', 'PHP', 'Laravel',
  'Django', 'Flask', 'MongoDB', 'MySQL', 'PostgreSQL', 'AWS',
  'Azure', 'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS',
  'Tailwind CSS', 'Bootstrap', 'Photoshop', 'Illustrator',
  'Digital Marketing', 'Content Writing', 'Social Media Marketing'
];

const benefitOptions = [
  'Work from Home', 'Health Insurance', 'Flexible Hours', 'Paid Leaves',
  'Travel Allowance', 'Annual Bonus', 'Equipment Reimbursement',
  'Learning & Development Stipend', 'Stock Options (ESOPs)',
  'Internet Reimbursement', 'Maternity / Paternity Leave', 'Team Retreats',
  'Gym Membership', 'Meal Allowance', 'Transport Allowance',
  'Performance Bonus', 'Professional Development', 'Certification Support'
];

export default function SkillsBenefitsForm({ formData, onInputChange }: SkillsBenefitsFormProps) {
  const [newSkill, setNewSkill] = useState('');
  const [selectedBenefit, setSelectedBenefit] = useState('');

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills_required.includes(newSkill.trim()) && formData.skills_required.length < 15) {
      onInputChange('skills_required', [...formData.skills_required, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const addSkillFromPopular = (skill: string) => {
    if (!formData.skills_required.includes(skill) && formData.skills_required.length < 15) {
      onInputChange('skills_required', [...formData.skills_required, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    onInputChange('skills_required', formData.skills_required.filter(s => s !== skill));
  };

  const addBenefit = () => {
    if (selectedBenefit && !formData.benefits.includes(selectedBenefit)) {
      onInputChange('benefits', [...formData.benefits, selectedBenefit]);
      setSelectedBenefit('');
    }
  };

  const removeBenefit = (benefit: string) => {
    onInputChange('benefits', formData.benefits.filter(b => b !== benefit));
  };

  return (
    <div className="space-y-6">
      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle>🧠 Required Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Add Skills (up to 15 skills)</Label>
            <div className="flex space-x-2 mt-2">
              <Input
                placeholder="Start typing to add skills..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button 
                type="button" 
                onClick={addSkill} 
                size="sm"
                disabled={formData.skills_required.length >= 15}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.skills_required.length}/15 skills added
            </p>
          </div>

          {/* Popular Skills */}
          <div>
            <Label className="text-sm text-muted-foreground">Popular Skills (click to add):</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {popularSkills
                .filter(skill => !formData.skills_required.includes(skill))
                .slice(0, 10)
                .map((skill) => (
                <Button
                  key={skill}
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => addSkillFromPopular(skill)}
                  className="text-xs h-7"
                  disabled={formData.skills_required.length >= 15}
                >
                  + {skill}
                </Button>
              ))}
            </div>
          </div>

          {/* Selected Skills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.skills_required.map((skill) => (
              <Badge key={skill} variant="secondary" className="px-3 py-1">
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
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle>🎁 Benefits Offered</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select applicable perks and benefits</Label>
            <div className="flex space-x-2 mt-2">
              <Select value={selectedBenefit} onValueChange={setSelectedBenefit}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Choose benefits to add..." />
                </SelectTrigger>
                <SelectContent>
                  {benefitOptions
                    .filter(benefit => !formData.benefits.includes(benefit))
                    .map((benefit) => (
                    <SelectItem key={benefit} value={benefit}>
                      {benefit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                onClick={addBenefit} 
                size="sm"
                disabled={!selectedBenefit}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected Benefits */}
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.benefits.map((benefit) => (
              <Badge key={benefit} variant="outline" className="px-3 py-1">
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
        </CardContent>
      </Card>

      {/* Upload Supporting Documents */}
      <Card>
        <CardHeader>
          <CardTitle>📎 Upload Supporting Documents (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">You can upload up to 3 files (PDF or DOCX):</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">JD Flyer</p>
              <p className="text-xs text-gray-500">Upload PDF/DOCX</p>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Team Brochure</p>
              <p className="text-xs text-gray-500">Upload PDF/DOCX</p>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Benefits Policy</p>
              <p className="text-xs text-gray-500">Upload PDF/DOCX</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
