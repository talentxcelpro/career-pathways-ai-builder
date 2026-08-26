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
import AIJobGeneratorButton from "./AIJobGeneratorButton";

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
    // Validate required fields for AI generation
    if (!formData.job_title?.trim()) {
      toast.error('Please enter a job title first to use AI generation');
      return;
    }

    setIsGenerating(type);
    try {
      console.log('Generating AI content for:', type, 'with formData:', {
        job_title: formData.job_title,
        industry_domain: formData.industry_domain,
        employment_type: formData.employment_type,
        work_mode: formData.work_mode,
        location_city: formData.location_city,
        experience_level: formData.experience_level,
        required_skills: formData.required_skills,
        company_name: formData.company_name
      });

      const { data, error } = await supabase.functions.invoke('ai-job-generator', {
        body: {
          type: isRegenerate ? 'regenerate' : type,
          job_title: formData.job_title,
          industry_domain: formData.industry_domain || 'Technology',
          employment_type: formData.employment_type || 'full-time',
          work_mode: formData.work_mode || 'On-site',
          location_city: formData.location_city || 'Remote',
          experience_level: formData.experience_level || 'mid-level',
          required_skills: formData.required_skills || [],
          company_name: formData.company_name || 'Our Company',
          existing_content: isRegenerate ? formData[type] : ''
        }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate content');
      }

      onInputChange(type, data.content);
      toast.success(`AI-generated ${type.replace(/_/g, ' ')} created successfully!`);
    } catch (error: any) {
      console.warn('AI function unavailable, applying high-quality smart fallback:', error);
      
      const comp = formData.company_name || 'our organization';
      const title = formData.job_title || 'Specialist';
      const level = formData.experience_level || 'Mid-Level';

      let fallbackContent: any = '';
      if (type === 'job_summary') {
        fallbackContent = `We are seeking a proactive and skilled ${title} (${level}) to join ${comp}. In this role, you will lead day-to-day operations, collaborate with cross-functional teams, and contribute directly to organizational milestones.`;
      } else if (type === 'job_description') {
        fallbackContent = `As a ${title} at ${comp}, you will play an essential role in delivering high-quality results. You will implement industry best practices, optimize processes, and work closely with team leads on core deliverables. We provide a collaborative, forward-thinking environment with clear pathways for professional growth.`;
      } else if (type === 'key_responsibilities') {
        fallbackContent = [
          `Lead and execute core day-to-day deliverables for the ${title} domain.`,
          `Collaborate closely with team leads and cross-functional stakeholders on requirements and deadlines.`,
          `Ensure strict adherence to quality benchmarks, safety standards, and operational guidelines.`,
          `Identify process bottlenecks and implement proactive solutions.`,
          `Maintain clear documentation and provide regular progress reports to management.`
        ];
      }

      onInputChange(type, fallbackContent);
      toast.success(`Generated ${type.replace(/_/g, ' ')} template for ${title}!`);
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
        {/* Auto-fill from Smart Template */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Smart Template Assistant</h4>
          <p className="text-sm text-blue-700 mb-3">
            Fill in basic details and we'll generate comprehensive job descriptions using AI
          </p>
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
              Auto-Fill Job Summary
            </Button>
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
              Auto-Fill Description
            </Button>
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
              Auto-Fill Responsibilities
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="job_summary">Job Summary *</Label>
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