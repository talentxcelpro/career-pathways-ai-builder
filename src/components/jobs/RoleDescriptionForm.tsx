import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, FileText } from "lucide-react";

interface RoleDescriptionFormProps {
  formData: any;
  onInputChange: (key: string, value: any) => void;
}

export default function RoleDescriptionForm({ formData, onInputChange }: RoleDescriptionFormProps) {
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newNiceToHave, setNewNiceToHave] = useState('');

  const addListItem = (field: string, value: string, setValue: (value: string) => void) => {
    if (value.trim()) {
      const current = formData[field] || [];
      onInputChange(field, [...current, value.trim()]);
      setValue('');
    }
  };

  const removeListItem = (field: string, index: number) => {
    const current = formData[field] || [];
    onInputChange(field, current.filter((_: any, i: number) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Role Description
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="job_summary">Job Summary *</Label>
          <Textarea
            id="job_summary"
            placeholder="Brief overview of the role and what the candidate will do..."
            value={formData.job_summary || ''}
            onChange={(e) => onInputChange('job_summary', e.target.value)}
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="job_description">Detailed Job Description *</Label>
          <Textarea
            id="job_description"
            placeholder="Comprehensive description of the role, team, company culture, growth opportunities..."
            value={formData.job_description || ''}
            onChange={(e) => onInputChange('job_description', e.target.value)}
            rows={5}
            required
          />
        </div>

        {/* Key Responsibilities */}
        <div className="space-y-2">
          <Label>Key Responsibilities</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a key responsibility..."
              value={newResponsibility}
              onChange={(e) => setNewResponsibility(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addListItem('key_responsibilities', newResponsibility, setNewResponsibility);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addListItem('key_responsibilities', newResponsibility, setNewResponsibility)}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.key_responsibilities || []).map((item: string, index: number) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {item}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeListItem('key_responsibilities', index)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Must-Have Requirements */}
        <div className="space-y-2">
          <Label>Must-Have Requirements</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a must-have requirement..."
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addListItem('must_have_requirements', newRequirement, setNewRequirement);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addListItem('must_have_requirements', newRequirement, setNewRequirement)}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.must_have_requirements || []).map((item: string, index: number) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {item}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeListItem('must_have_requirements', index)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Preferred / Nice-to-Have */}
        <div className="space-y-2">
          <Label>Preferred / Nice-to-Have</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a nice-to-have requirement..."
              value={newNiceToHave}
              onChange={(e) => setNewNiceToHave(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addListItem('preferred_requirements', newNiceToHave, setNewNiceToHave);
                }
              }}
            />
            <Button
              type="button"
              onClick={() => addListItem('preferred_requirements', newNiceToHave, setNewNiceToHave)}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(formData.preferred_requirements || []).map((item: string, index: number) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {item}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeListItem('preferred_requirements', index)}
                />
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}