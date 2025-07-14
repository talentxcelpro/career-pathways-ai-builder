import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Target, Zap, Star, Crown } from "lucide-react";
import { templateRecommendationEngine } from '@/services/templateRecommendationEngine';
import { 
  TemplateRecommendation, 
  RecommendationRequest, 
  Industry, 
  ExperienceLevel 
} from '@/types/resume-templates';

interface TemplateRecommendationWidgetProps {
  onTemplateSelect: (templateId: string) => void;
  currentTemplateId?: string;
}

export const TemplateRecommendationWidget = ({ 
  onTemplateSelect, 
  currentTemplateId 
}: TemplateRecommendationWidgetProps) => {
  const [recommendations, setRecommendations] = useState<TemplateRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RecommendationRequest>({});

  const industries: { value: Industry; label: string }[] = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'creative', label: 'Creative' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'legal', label: 'Legal' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'research', label: 'Research' },
    { value: 'startup', label: 'Startup' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'nonprofit', label: 'Non-Profit' },
  ];

  const experienceLevels: { value: ExperienceLevel; label: string }[] = [
    { value: 'entry-level', label: 'Entry Level (0-2 years)' },
    { value: 'junior', label: 'Junior (2-4 years)' },
    { value: 'mid-level', label: 'Mid-Level (4-7 years)' },
    { value: 'senior', label: 'Senior (7+ years)' },
    { value: 'executive', label: 'Executive/Leadership' },
    { value: 'career-switcher', label: 'Career Switcher' },
    { value: 'freelancer', label: 'Freelancer/Consultant' },
  ];

  const designPreferences = [
    { value: 'conservative', label: 'Conservative & Traditional' },
    { value: 'modern', label: 'Modern & Professional' },
    { value: 'creative', label: 'Creative & Visual' },
  ];

  const atsRequirements = [
    { value: 'critical', label: 'Critical (95%+ ATS score)' },
    { value: 'important', label: 'Important (85%+ ATS score)' },
    { value: 'flexible', label: 'Flexible (75%+ ATS score)' },
  ];

  const generateRecommendations = async () => {
    setIsLoading(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const results = templateRecommendationEngine.generateRecommendations(formData);
    setRecommendations(results);
    setIsLoading(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'perfect-match':
        return <Target className="h-4 w-4 text-green-600" />;
      case 'good-fit':
        return <Zap className="h-4 w-4 text-blue-600" />;
      default:
        return <Star className="h-4 w-4 text-orange-600" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'perfect-match':
        return 'Perfect Match';
      case 'good-fit':
        return 'Good Fit';
      default:
        return 'Alternative';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'perfect-match':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good-fit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Template Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title/Role</Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Software Engineer, Marketing Manager"
                value={formData.jobTitle || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Industry</Label>
              <Select 
                value={formData.industry || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value as Industry }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select 
                value={formData.experienceLevel || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, experienceLevel: value as ExperienceLevel }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Design Preference</Label>
              <Select 
                value={formData.designPreference || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, designPreference: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select design style" />
                </SelectTrigger>
                <SelectContent>
                  {designPreferences.map(pref => (
                    <SelectItem key={pref.value} value={pref.value}>
                      {pref.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>ATS Requirement</Label>
              <Select 
                value={formData.atsRequirement || ''} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, atsRequirement: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How important is ATS compatibility?" />
                </SelectTrigger>
                <SelectContent>
                  {atsRequirements.map(req => (
                    <SelectItem key={req.value} value={req.value}>
                      {req.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={generateRecommendations} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Analyzing Your Requirements...' : 'Get Smart Recommendations'}
          </Button>
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recommended Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <Card 
                key={rec.template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  currentTemplateId === rec.template.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{rec.template.name}</CardTitle>
                        {rec.template.isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getCategoryColor(rec.category)}`}>
                          {getCategoryIcon(rec.category)}
                          <span className="ml-1">{getCategoryLabel(rec.category)}</span>
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {rec.score}% match
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{rec.template.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">ATS Score:</span>
                      <Badge variant="outline">{rec.template.atsScore}%</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{rec.template.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">Why it's recommended:</h4>
                    <div className="space-y-1">
                      {rec.reasons.map((reason, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <div className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => onTemplateSelect(rec.template.id)}
                    className="w-full"
                    disabled={currentTemplateId === rec.template.id}
                  >
                    {currentTemplateId === rec.template.id ? 'Currently Selected' : 'Use This Template'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};