
import React, { useState } from 'react';
import { AppleCard, AppleCardContent, AppleCardHeader, AppleCardTitle } from '@/components/ui/apple-card';
import { AppleButton } from '@/components/ui/apple-button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Building, MapPin, X } from 'lucide-react';

interface JobDescriptionInputProps {
  onAnalyze: (jobDescription: string, jobTitle: string, industry: string, company: string) => void;
  isAnalyzing: boolean;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({ onAnalyze, isAnalyzing }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [company, setCompany] = useState('');
  const [savedJobs, setSavedJobs] = useState<Array<{
    title: string;
    company: string;
    industry: string;
    description: string;
  }>>([]);

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Marketing', 'Sales', 'Education', 
    'Manufacturing', 'Retail', 'Consulting', 'Real Estate', 'Media', 'Legal'
  ];

  const handleSubmit = () => {
    if (jobDescription.trim()) {
      // Save job for future reference
      const newJob = { title: jobTitle, company, industry, description: jobDescription };
      setSavedJobs(prev => [newJob, ...prev.slice(0, 4)]); // Keep last 5 jobs
      
      onAnalyze(jobDescription, jobTitle, industry, company);
    }
  };

  const loadSavedJob = (job: typeof savedJobs[0]) => {
    setJobTitle(job.title);
    setCompany(job.company);
    setIndustry(job.industry);
    setJobDescription(job.description);
  };

  const clearForm = () => {
    setJobDescription('');
    setJobTitle('');
    setIndustry('');
    setCompany('');
  };

  return (
    <AppleCard>
      <AppleCardHeader>
        <AppleCardTitle className="flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Target Job Analysis
        </AppleCardTitle>
        <p className="text-sm text-gray-600">
          Add job details to get personalized optimization recommendations
        </p>
      </AppleCardHeader>
      <AppleCardContent className="space-y-6">
        {/* Quick Load Saved Jobs */}
        {savedJobs.length > 0 && (
          <div>
            <Label className="text-sm font-medium mb-2 block">Recently Analyzed Jobs</Label>
            <div className="flex flex-wrap gap-2">
              {savedJobs.map((job, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="cursor-pointer hover:bg-blue-50 p-2"
                  onClick={() => loadSavedJob(job)}
                >
                  <div className="text-left">
                    <div className="font-medium text-xs">{job.title}</div>
                    <div className="text-xs text-gray-500">{job.company}</div>
                  </div>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Job Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle" className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Job Title
            </Label>
            <Input
              id="jobTitle"
              placeholder="e.g., Senior Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="apple-blur border-gray-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-1">
              <Building className="w-3 h-3" />
              Company
            </Label>
            <Input
              id="company"
              placeholder="e.g., TechCorp Inc"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="apple-blur border-gray-200"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Industry
            </Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="apple-blur border-gray-200">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map(ind => (
                  <SelectItem key={ind} value={ind.toLowerCase()}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="jobDescription">Job Description</Label>
            {jobDescription && (
              <AppleButton
                variant="ghost"
                size="sm"
                onClick={clearForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </AppleButton>
            )}
          </div>
          <Textarea
            id="jobDescription"
            placeholder="Paste the complete job description here. Include requirements, responsibilities, and preferred qualifications for the most accurate analysis..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-32 apple-blur border-gray-200 resize-none"
            rows={8}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{jobDescription.length} characters</span>
            <span>Recommended: 500+ characters for best results</span>
          </div>
        </div>

        {/* Analysis Benefits */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <div className="font-medium text-blue-800 text-sm">Enhanced Analysis Includes:</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
            <div>• Job-specific keyword matching</div>
            <div>• ATS optimization for this role</div>
            <div>• Skills gap identification</div>
            <div>• Industry benchmarking</div>
            <div>• Tailored improvement suggestions</div>
            <div>• Competitive positioning</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <AppleButton
            onClick={handleSubmit}
            disabled={!jobDescription.trim() || isAnalyzing}
            className="flex-1"
            size="lg"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Resume for This Job'}
          </AppleButton>
          
          <AppleButton
            variant="outline"
            onClick={() => onAnalyze('', '', '', '')}
            disabled={isAnalyzing}
            size="lg"
          >
            General Analysis
          </AppleButton>
        </div>
      </AppleCardContent>
    </AppleCard>
  );
};
