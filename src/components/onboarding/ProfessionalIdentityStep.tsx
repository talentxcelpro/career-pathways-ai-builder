import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfessionalIdentityStepProps {
  data: {
    currentRole: string;
    experience: string;
    industry: string;
  };
  updateData: (updates: any) => void;
}

export const ProfessionalIdentityStep: React.FC<ProfessionalIdentityStepProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="currentRole">Current Role / Desired Role *</Label>
        <Input
          id="currentRole"
          value={data.currentRole}
          onChange={(e) => updateData({ currentRole: e.target.value })}
          placeholder="e.g., Software Engineer, Marketing Manager"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">Experience Level *</Label>
        <Select value={data.experience} onValueChange={(value) => updateData({ experience: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select your experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fresher">Fresher (0-1 years)</SelectItem>
            <SelectItem value="entry">Entry Level (1-3 years)</SelectItem>
            <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
            <SelectItem value="senior">Senior (5-10 years)</SelectItem>
            <SelectItem value="expert">Expert (10+ years)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry *</Label>
        <Select value={data.industry} onValueChange={(value) => updateData({ industry: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">Technology / IT</SelectItem>
            <SelectItem value="finance">Finance / Banking</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="retail">Retail / E-commerce</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="consulting">Consulting</SelectItem>
            <SelectItem value="marketing">Marketing / Advertising</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
