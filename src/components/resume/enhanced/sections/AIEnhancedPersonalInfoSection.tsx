import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, User, Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  professionalSummary: string;
}

interface AIEnhancedPersonalInfoSectionProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export const AIEnhancedPersonalInfoSection: React.FC<AIEnhancedPersonalInfoSectionProps> = ({
  data,
  onChange
}) => {
  const { invokeAITool, isProcessing } = useAIService();
  const [enhancingField, setEnhancingField] = useState<string | null>(null);

  const updateField = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const enhanceSummary = async () => {
    if (!data.professionalSummary.trim()) {
      toast.error('Please enter a basic summary first');
      return;
    }

    setEnhancingField('summary');
    try {
      const result = await invokeAITool({
        toolSlug: 'professional-summary',
        inputData: {
          job_title: 'Professional', // Could be extracted from other sections
          years_experience: '5', // Could be calculated from experience
          skills: 'Various professional skills',
          industry: 'General',
          goal: 'Career advancement',
          current_summary: data.professionalSummary
        },
        category: 'resume_enhancement'
      });

      if (result.success && result.data?.summary) {
        updateField('professionalSummary', result.data.summary);
        toast.success('Summary enhanced with AI!');
      } else {
        toast.error('Failed to enhance summary');
      }
    } catch (error) {
      toast.error('AI enhancement failed');
      console.error('Summary enhancement error:', error);
    } finally {
      setEnhancingField(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              value={data.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="John Doe"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                value={data.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="john.doe@email.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={data.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={data.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="New York, NY"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Website (Optional)</label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={data.website || ''}
                onChange={(e) => updateField('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">LinkedIn (Optional)</label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={data.linkedin || ''}
                onChange={(e) => updateField('linkedin', e.target.value)}
                placeholder="linkedin.com/in/johndoe"
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Professional Summary</label>
            <Button
              onClick={enhanceSummary}
              disabled={isProcessing || enhancingField === 'summary'}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {enhancingField === 'summary' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Enhance with AI
            </Button>
          </div>
          
          <Textarea
            value={data.professionalSummary}
            onChange={(e) => updateField('professionalSummary', e.target.value)}
            placeholder="Write a brief professional summary about yourself..."
            className="min-h-[100px] resize-none"
          />
          
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {data.professionalSummary.split(' ').length} words
            </Badge>
            {data.professionalSummary.length > 200 && (
              <Badge variant="outline" className="text-xs">
                Recommended: 150-200 words
              </Badge>
            )}
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-2">💡 Tips for a Great Summary</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Keep it concise (2-4 sentences)</li>
            <li>• Highlight your key achievements</li>
            <li>• Include relevant keywords for your target role</li>
            <li>• Show your value proposition to employers</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};