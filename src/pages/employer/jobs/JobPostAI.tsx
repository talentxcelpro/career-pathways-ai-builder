
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const JobPostAI = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: '',
    department: '',
    location: '',
    experienceLevel: '',
    employmentType: '',
    companyInfo: '',
    specificRequirements: ''
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setIsGenerating(false);
      navigate('/jobs/post/preview', { 
        state: { 
          aiGenerated: true, 
          formData 
        } 
      });
    }, 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Brain className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Job Post Generator</h1>
          <p className="text-gray-600">Let AI create a compelling job post for you</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Job Details
          </CardTitle>
          <CardDescription>
            Provide basic information and let our AI generate a complete, optimized job posting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                placeholder="e.g., Senior Software Engineer"
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g., Engineering, Marketing"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, Remote"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
            <div>
              <Label>Experience Level</Label>
              <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({...formData, experienceLevel: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="lead">Lead/Principal</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Employment Type</Label>
            <Select value={formData.employmentType} onValueChange={(value) => setFormData({...formData, employmentType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select employment type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">Full-time</SelectItem>
                <SelectItem value="part_time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="companyInfo">Company Information</Label>
            <Textarea
              id="companyInfo"
              placeholder="Brief description of your company, culture, and what makes it unique..."
              value={formData.companyInfo}
              onChange={(e) => setFormData({...formData, companyInfo: e.target.value})}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="specificRequirements">Specific Requirements (Optional)</Label>
            <Textarea
              id="specificRequirements"
              placeholder="Any specific skills, technologies, or requirements for this role..."
              value={formData.specificRequirements}
              onChange={(e) => setFormData({...formData, specificRequirements: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => navigate('/jobs/post')}>
              Back to Manual Form
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={!formData.jobTitle || isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Job Post
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Features Info */}
      <Card>
        <CardHeader>
          <CardTitle>What our AI will generate:</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">✓ Compelling Job Description</h4>
              <h4 className="font-semibold text-green-700">✓ Skills & Requirements</h4>
              <h4 className="font-semibold text-green-700">✓ Responsibilities</h4>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">✓ Benefits & Perks</h4>
              <h4 className="font-semibold text-green-700">✓ SEO-Optimized Keywords</h4>
              <h4 className="font-semibold text-green-700">✓ ATS-Friendly Format</h4>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobPostAI;
