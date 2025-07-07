import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, ArrowRight, Brain } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AIJobGeneratorProps {
  formData: any;
  onDataGenerated: (data: any) => void;
  onClose: () => void;
}

const AIJobGenerator: React.FC<AIJobGeneratorProps> = ({ formData, onDataGenerated, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    jobTitle: formData.job_title || '',
    industry: formData.industry_domain || '',
    location: formData.location_city || '',
    experienceLevel: formData.experience_level || '',
    employmentType: formData.employment_type || '',
    companyInfo: formData.company_name || ''
  });

  const handleInputChange = (key: string, value: string) => {
    setBasicInfo(prev => ({ ...prev, [key]: value }));
  };

  const generateJobContent = async () => {
    if (!basicInfo.jobTitle.trim()) {
      toast.error('Job title is required for AI generation');
      return;
    }

    setIsGenerating(true);
    try {
      // Generate job summary
      const summaryResponse = await supabase.functions.invoke('ai-job-generator', {
        body: {
          type: 'job_summary',
          job_title: basicInfo.jobTitle,
          industry_domain: basicInfo.industry,
          employment_type: basicInfo.employmentType,
          work_mode: formData.work_mode || 'On-site',
          location_city: basicInfo.location,
          experience_level: basicInfo.experienceLevel,
          company_name: basicInfo.companyInfo
        }
      });

      if (summaryResponse.error) throw summaryResponse.error;

      // Generate job description
      const descriptionResponse = await supabase.functions.invoke('ai-job-generator', {
        body: {
          type: 'job_description',
          job_title: basicInfo.jobTitle,
          industry_domain: basicInfo.industry,
          employment_type: basicInfo.employmentType,
          work_mode: formData.work_mode || 'On-site',
          location_city: basicInfo.location,
          experience_level: basicInfo.experienceLevel,
          company_name: basicInfo.companyInfo,
          required_skills: formData.required_skills || []
        }
      });

      if (descriptionResponse.error) throw descriptionResponse.error;

      // Generate key responsibilities
      const responsibilitiesResponse = await supabase.functions.invoke('ai-job-generator', {
        body: {
          type: 'key_responsibilities',
          job_title: basicInfo.jobTitle,
          industry_domain: basicInfo.industry,
          experience_level: basicInfo.experienceLevel
        }
      });

      if (responsibilitiesResponse.error) throw responsibilitiesResponse.error;

      // Merge generated content with form data
      const generatedData = {
        ...formData,
        job_title: basicInfo.jobTitle,
        industry_domain: basicInfo.industry,
        location_city: basicInfo.location,
        experience_level: basicInfo.experienceLevel,
        employment_type: basicInfo.employmentType,
        company_name: basicInfo.companyInfo,
        job_summary: summaryResponse.data?.content || '',
        job_description: descriptionResponse.data?.content || '',
        key_responsibilities: responsibilitiesResponse.data?.content || []
      };

      onDataGenerated(generatedData);
      toast.success('Job content generated successfully!');
      onClose();

    } catch (error) {
      console.error('AI generation failed:', error);
      toast.error('Failed to generate job content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Job Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Senior Software Engineer"
                value={basicInfo.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="e.g., Technology, Healthcare"
                value={basicInfo.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Mumbai, Remote"
                value={basicInfo.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select
                value={basicInfo.experienceLevel}
                onValueChange={(value) => handleInputChange('experienceLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fresher">Fresher</SelectItem>
                  <SelectItem value="mid-level">2–5 Years</SelectItem>
                  <SelectItem value="senior-level">5–10 Years</SelectItem>
                  <SelectItem value="executive">10+ Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select
                value={basicInfo.employmentType}
                onValueChange={(value) => handleInputChange('employmentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-Time</SelectItem>
                  <SelectItem value="part-time">Part-Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyInfo">Company Name</Label>
              <Input
                id="companyInfo"
                placeholder="e.g., TechCorp Inc"
                value={basicInfo.companyInfo}
                onChange={(e) => handleInputChange('companyInfo', e.target.value)}
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              What will be generated:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Professional job summary</li>
              <li>• Comprehensive job description</li>
              <li>• Key responsibilities list</li>
              <li>• ATS-optimized content</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={generateJobContent}
              className="flex-1"
              disabled={isGenerating || !basicInfo.jobTitle.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Job Content
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIJobGenerator;