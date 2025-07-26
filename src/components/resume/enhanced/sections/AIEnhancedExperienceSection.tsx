import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Briefcase, Plus, Trash2, Calendar, Building } from 'lucide-react';
import { useAIService } from '@/hooks/useAIService';
import { toast } from 'sonner';

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

interface AIEnhancedExperienceSectionProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export const AIEnhancedExperienceSection: React.FC<AIEnhancedExperienceSectionProps> = ({
  data,
  onChange
}) => {
  const { invokeAITool, isProcessing } = useAIService();
  const [enhancingId, setEnhancingId] = useState<string | null>(null);

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    };
    onChange([...data, newExp]);
  };

  const removeExperience = (id: string) => {
    onChange(data.filter(exp => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    onChange(data.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const enhanceExperienceDescription = async (experience: Experience) => {
    if (!experience.description.trim()) {
      toast.error('Please enter a basic job description first');
      return;
    }

    setEnhancingId(experience.id);
    try {
      const result = await invokeAITool({
        toolSlug: 'experience-enhancer',
        inputData: {
          job_title: experience.jobTitle,
          company: experience.company,
          duration: `${experience.startDate} - ${experience.current ? 'Present' : experience.endDate}`,
          responsibilities: experience.description,
          achievements: experience.achievements.join(', '),
          target_industry: 'Professional'
        },
        category: 'experience_enhancement'
      });

      if (result.success && result.data?.bulletPoints) {
        updateExperience(experience.id, 'achievements', result.data.bulletPoints);
        toast.success('Experience enhanced with AI bullet points!');
      } else {
        toast.error('Failed to enhance experience');
      }
    } catch (error) {
      toast.error('AI enhancement failed');
      console.error('Experience enhancement error:', error);
    } finally {
      setEnhancingId(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Work Experience
          </CardTitle>
          <Button onClick={addExperience} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No work experience added yet.</p>
            <p className="text-sm">Click "Add Experience" to get started.</p>
          </div>
        ) : (
          data.map((experience, index) => (
            <Card key={experience.id} className="relative">
              <CardContent className="pt-6">
                <div className="absolute top-4 right-4">
                  <Button
                    onClick={() => removeExperience(experience.id)}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Job Title</label>
                    <Input
                      value={experience.jobTitle}
                      onChange={(e) => updateExperience(experience.id, 'jobTitle', e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={experience.company}
                        onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                        placeholder="Tech Corp"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      value={experience.location}
                      onChange={(e) => updateExperience(experience.id, 'location', e.target.value)}
                      placeholder="New York, NY"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Duration</label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="month"
                        value={experience.startDate}
                        onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-muted-foreground">to</span>
                      {experience.current ? (
                        <Badge variant="secondary">Present</Badge>
                      ) : (
                        <Input
                          type="month"
                          value={experience.endDate}
                          onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                          className="flex-1"
                        />
                      )}
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={experience.current}
                          onChange={(e) => updateExperience(experience.id, 'current', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        Current
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Job Description</label>
                    <Textarea
                      value={experience.description}
                      onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
                      placeholder="Describe your main responsibilities and what you did in this role..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Key Achievements (AI Enhanced)</label>
                      <Button
                        onClick={() => enhanceExperienceDescription(experience)}
                        disabled={isProcessing || enhancingId === experience.id}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {enhancingId === experience.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        Generate Bullets
                      </Button>
                    </div>
                    
                    {experience.achievements.length > 0 ? (
                      <div className="space-y-2">
                        {experience.achievements.map((achievement, achIndex) => (
                          <div key={achIndex} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                            <span className="text-primary mt-1">•</span>
                            <span className="flex-1 text-sm">{achievement}</span>
                            <Button
                              onClick={() => {
                                const newAchievements = experience.achievements.filter((_, i) => i !== achIndex);
                                updateExperience(experience.id, 'achievements', newAchievements);
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Add a job description above, then click "Generate Bullets" to create AI-powered achievement statements.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}

        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="text-sm font-medium mb-2">💡 Tips for Better Experience Descriptions</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Start with action verbs (Led, Managed, Developed, Improved)</li>
            <li>• Include specific numbers and metrics when possible</li>
            <li>• Focus on achievements rather than just responsibilities</li>
            <li>• Use keywords relevant to your target industry</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};