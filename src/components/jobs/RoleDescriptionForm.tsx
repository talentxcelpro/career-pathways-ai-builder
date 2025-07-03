import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, FileText, Brain, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RoleDescriptionFormProps {
  formData: any;
  onInputChange: (key: string, value: any) => void;
}

export default function RoleDescriptionForm({ formData, onInputChange }: RoleDescriptionFormProps) {
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newNiceToHave, setNewNiceToHave] = useState('');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

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

  const generateAIContent = async (type: 'job_summary' | 'job_description' | 'key_responsibilities', isRegenerate = false) => {
    setIsGenerating(type);
    try {
      const { data, error } = await supabase.functions.invoke('ai-job-generator', {
        body: {
          type: isRegenerate ? 'regenerate' : type,
          job_title: formData.job_title,
          industry_domain: formData.industry_domain,
          employment_type: formData.employment_type,
          work_mode: formData.work_mode,
          location_city: formData.location_city,
          experience_level: formData.experience_level,
          required_skills: formData.required_skills || [],
          company_name: formData.company_name,
          existing_content: isRegenerate ? formData[type] : ''
        }
      });

      if (error) throw error;

      onInputChange(type, data.content);
      toast.success(`AI-generated ${type.replace('_', ' ')} created successfully!`);
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(null);
    }
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
          <div className="flex items-center justify-between">
            <Label htmlFor="job_summary">Job Summary *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateAIContent('job_summary')}
                disabled={isGenerating === 'job_summary' || !formData.job_title}
                className="text-xs"
              >
                {isGenerating === 'job_summary' ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Brain className="h-3 w-3 mr-1" />
                )}
                Generate with AI
              </Button>
              {formData.job_summary && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generateAIContent('job_summary', true)}
                  disabled={isGenerating === 'job_summary'}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
              )}
            </div>
          </div>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="job_description">Detailed Job Description *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateAIContent('job_description')}
                disabled={isGenerating === 'job_description' || !formData.job_title}
                className="text-xs"
              >
                {isGenerating === 'job_description' ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Brain className="h-3 w-3 mr-1" />
                )}
                Generate with AI
              </Button>
              {formData.job_description && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generateAIContent('job_description', true)}
                  disabled={isGenerating === 'job_description'}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
              )}
            </div>
          </div>
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
          <div className="flex items-center justify-between">
            <Label>Key Responsibilities</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => generateAIContent('key_responsibilities')}
                disabled={isGenerating === 'key_responsibilities' || !formData.job_title}
                className="text-xs"
              >
                {isGenerating === 'key_responsibilities' ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Brain className="h-3 w-3 mr-1" />
                )}
                Generate with AI
              </Button>
              {(formData.key_responsibilities || []).length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => generateAIContent('key_responsibilities', true)}
                  disabled={isGenerating === 'key_responsibilities'}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
              )}
            </div>
          </div>
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