import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface SmartApplicationFormProps {
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const SmartApplicationForm: React.FC<SmartApplicationFormProps> = ({
  jobTitle,
  companyName,
  jobDescription,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    currentRole: '',
    experience: '',
    currentCTC: '',
    expectedCTC: '',
    noticePeriod: '',
    location: '',
    linkedinProfile: '',
    portfolioWebsite: '',
    coverLetter: '',
    keySkills: [] as string[],
    relevantExperience: '',
    whyInterested: '',
    availability: ''
  });
  
  const [aiSuggestions, setAiSuggestions] = useState({
    coverLetter: '',
    keySkills: [] as string[],
    whyInterested: '',
    matchScore: 0
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  // Calculate form completion progress
  React.useEffect(() => {
    const requiredFields = ['fullName', 'email', 'phone', 'currentRole', 'expectedCTC'];
    const completedFields = requiredFields.filter(field => formData[field as keyof typeof formData]);
    setFormProgress((completedFields.length / requiredFields.length) * 100);
  }, [formData]);

  const generateAISuggestions = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generation - in real app, this would call your AI service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAiSuggestions({
        coverLetter: `Dear Hiring Manager,\n\nI am excited to apply for the ${jobTitle} position at ${companyName}. With my background in ${formData.currentRole}, I believe I can contribute significantly to your team.\n\nMy experience in ${formData.relevantExperience} aligns well with the requirements outlined in your job posting. I am particularly drawn to this opportunity because of ${companyName}'s innovative approach and growth potential.\n\nI look forward to discussing how my skills can benefit your organization.\n\nBest regards,\n${formData.fullName}`,
        keySkills: ['JavaScript', 'React', 'Node.js', 'Problem Solving', 'Team Collaboration'],
        whyInterested: `I'm interested in this role because ${companyName} is known for innovation and this ${jobTitle} position offers great growth opportunities in areas I'm passionate about.`,
        matchScore: 85
      });
      
      toast.success('AI suggestions generated successfully!');
    } catch (error) {
      toast.error('Failed to generate AI suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillAdd = (skill: string) => {
    if (skill && !formData.keySkills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        keySkills: [...prev.keySkills, skill]
      }));
    }
  };

  const handleSkillRemove = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      keySkills: prev.keySkills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formProgress < 100) {
      toast.error('Please complete all required fields');
      return;
    }
    
    onSubmit({
      ...formData,
      aiSuggestions,
      submittedAt: new Date().toISOString()
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Apply for {jobTitle}</h2>
        <p className="text-muted-foreground">at {companyName}</p>
        
        <div className="flex items-center justify-center gap-2 mt-4">
          <Progress value={formProgress} className="w-64 h-2" />
          <span className="text-sm font-medium">{Math.round(formProgress)}% Complete</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+91 9876543210"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Current Location</label>
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, State"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Current Role *</label>
                <Input
                  value={formData.currentRole}
                  onChange={(e) => handleInputChange('currentRole', e.target.value)}
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Experience</label>
                <Select onValueChange={(value) => handleInputChange('experience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-8">5-8 years</SelectItem>
                    <SelectItem value="8+">8+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Current CTC (LPA)</label>
                <Input
                  value={formData.currentCTC}
                  onChange={(e) => handleInputChange('currentCTC', e.target.value)}
                  placeholder="e.g., 12"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Expected CTC (LPA) *</label>
                <Input
                  value={formData.expectedCTC}
                  onChange={(e) => handleInputChange('expectedCTC', e.target.value)}
                  placeholder="e.g., 15"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Notice Period</label>
                <Select onValueChange={(value) => handleInputChange('noticePeriod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select notice period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="15-days">15 days</SelectItem>
                    <SelectItem value="1-month">1 month</SelectItem>
                    <SelectItem value="2-months">2 months</SelectItem>
                    <SelectItem value="3-months">3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">LinkedIn Profile</label>
                <Input
                  value={formData.linkedinProfile}
                  onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI-Powered Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI-Powered Application Enhancement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg">
              <Zap className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <h4 className="font-medium">Generate AI Suggestions</h4>
                <p className="text-sm text-muted-foreground">
                  Let AI help you create a personalized cover letter and highlight relevant skills
                </p>
              </div>
              <Button 
                type="button"
                onClick={generateAISuggestions}
                disabled={isGenerating || !formData.fullName || !formData.currentRole}
              >
                {isGenerating ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate AI Content
                  </>
                )}
              </Button>
            </div>

            {aiSuggestions.matchScore > 0 && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Job Match Score: {aiSuggestions.matchScore}%
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  Great match! Your profile aligns well with the job requirements.
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Cover Letter</label>
              <Textarea
                value={formData.coverLetter || aiSuggestions.coverLetter}
                onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                placeholder="Write a compelling cover letter or use AI to generate one..."
                rows={6}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Key Skills</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.keySkills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleSkillRemove(skill)}
                  >
                    {skill} ×
                  </Badge>
                ))}
              </div>
              <Input
                placeholder="Add a skill and press Enter"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSkillAdd(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={formProgress < 100}
            className="bg-primary hover:bg-primary/90"
          >
            {formProgress < 100 ? (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Complete Required Fields
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};