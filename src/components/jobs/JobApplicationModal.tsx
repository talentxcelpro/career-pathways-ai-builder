
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, FileText, Star, Sparkles, User, Mail, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { incrementJobApplications } from "@/utils/supabaseHelpers";

interface JobApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: {
    id: string;
    title: string;
    companies?: {
      name: string;
      logo_url?: string;
    } | null;
    skills_required?: string[];
  };
}

interface Resume {
  id: string;
  title: string;
  file_url?: string;
  is_primary: boolean;
  content: any;
}

interface ApplicationData {
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  experience_years: number;
  linkedin: string;
  portfolio: string;
  cover_letter: string;
  skills: string[];
  expected_salary: number;
  availability_date: string;
  employment_type: string;
  relocate: boolean;
  motivation: string;
}

export default function JobApplicationModal({ open, onOpenChange, job }: JobApplicationModalProps) {
  const [activeTab, setActiveTab] = useState('existing');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);

  const [formData, setFormData] = useState<ApplicationData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    experience_years: 0,
    linkedin: '',
    portfolio: '',
    cover_letter: '',
    skills: [],
    expected_salary: 0,
    availability_date: '',
    employment_type: '',
    relocate: false,
    motivation: ''
  });

  // Fetch user's resumes and profile data
  useEffect(() => {
    if (open) {
      fetchUserData();
    }
  }, [open]);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch resumes
      const { data: resumesData } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('is_primary', { ascending: false });

      if (resumesData) {
        setResumes(resumesData);
        const primaryResume = resumesData.find(r => r.is_primary);
        if (primaryResume) setSelectedResumeId(primaryResume.id);
      }

      // Fetch user profile for auto-fill
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFormData(prev => ({
          ...prev,
          name: profile.full_name || '',
          email: profile.email || user.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
          title: profile.title || '',
          linkedin: profile.linkedin_url || '',
          portfolio: profile.portfolio_url || '',
          skills: profile.skills || []
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    setUploadedFile(file);
    
    // Simulate AI processing
    setAiProcessing(true);
    setTimeout(() => {
      // Mock AI extraction
      const mockExtractedData = {
        name: formData.name || 'John Doe',
        title: 'Software Engineer',
        experience_years: 3,
        skills: ['React', 'TypeScript', 'Node.js', 'Python'],
        phone: formData.phone || '+91 9876543210',
        location: formData.location || 'Bangalore, India'
      };

      setFormData(prev => ({
        ...prev,
        ...mockExtractedData
      }));

      // Calculate mock match score
      const jobSkills = job.skills_required || [];
      const matchingSkills = mockExtractedData.skills.filter(skill => 
        jobSkills.some(jobSkill => jobSkill.toLowerCase().includes(skill.toLowerCase()))
      );
      const score = Math.round((matchingSkills.length / Math.max(jobSkills.length, 1)) * 100);
      setMatchScore(Math.min(score + Math.floor(Math.random() * 20), 95));

      setAiProcessing(false);
      toast.success('Resume analyzed and form auto-filled!');
    }, 2000);
  };

  const handleExistingResumeSelect = (resumeId: string) => {
    setSelectedResumeId(resumeId);
    const selectedResume = resumes.find(r => r.id === resumeId);
    if (selectedResume?.content) {
      // Auto-fill from existing resume data
      const content = selectedResume.content;
      setFormData(prev => ({
        ...prev,
        title: content.title || prev.title,
        experience_years: content.experience_years || prev.experience_years,
        skills: content.skills || prev.skills,
        location: content.location || prev.location
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let resumeUrl = '';

      // Upload new resume if provided
      if (uploadedFile && activeTab === 'upload') {
        const fileName = `${user.id}/${job.id}/${Date.now()}_${uploadedFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, uploadedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('resumes')
          .getPublicUrl(fileName);
        
        resumeUrl = publicUrl;
      } else if (selectedResumeId && activeTab === 'existing') {
        const selectedResume = resumes.find(r => r.id === selectedResumeId);
        resumeUrl = selectedResume?.file_url || '';
      }

      // Submit application
      const { error } = await supabase
        .from('job_applications')
        .insert({
          user_id: user.id,
          job_id: job.id,
          resume_url: resumeUrl,
          ai_match_score: matchScore,
          ...formData
        });

      if (error) throw error;

      // Update job application count
      await incrementJobApplications(job.id);

      toast.success('Application submitted successfully!');
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        title: '',
        experience_years: 0,
        linkedin: '',
        portfolio: '',
        cover_letter: '',
        skills: [],
        expected_salary: 0,
        availability_date: '',
        employment_type: '',
        relocate: false,
        motivation: ''
      });
      setUploadedFile(null);
      setMatchScore(null);
    } catch (error: any) {
      console.error('Application submission error:', error);
      if (error.message?.includes('duplicate key')) {
        toast.error('You have already applied to this job');
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {job.companies?.logo_url && (
              <img 
                src={job.companies.logo_url} 
                alt={job.companies.name}
                className="w-8 h-8 rounded"
              />
            )}
            <div>
              <span>Apply for {job.title}</span>
              {job.companies?.name && (
                <p className="text-sm text-gray-600 font-normal">at {job.companies.name}</p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resume Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resume Selection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing">Use Existing Resume</TabsTrigger>
                  <TabsTrigger value="upload">Upload New Resume</TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="space-y-4">
                  {resumes.length > 0 ? (
                    <div className="space-y-3">
                      {resumes.map((resume) => (
                        <div 
                          key={resume.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedResumeId === resume.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleExistingResumeSelect(resume.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{resume.title}</span>
                              {resume.is_primary && (
                                <Badge variant="secondary" className="text-xs">Primary</Badge>
                              )}
                            </div>
                            <input
                              type="radio"
                              checked={selectedResumeId === resume.id}
                              onChange={() => handleExistingResumeSelect(resume.id)}
                              className="h-4 w-4"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No resumes found. Upload a new one to get started.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        {uploadedFile ? uploadedFile.name : 'Click to upload your resume'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF or Word document (max 5MB)
                      </p>
                    </label>
                  </div>

                  {aiProcessing && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <Sparkles className="h-5 w-5 text-blue-600 animate-pulse" />
                          <span className="text-blue-800">AI is analyzing your resume...</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {matchScore !== null && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <Star className="h-5 w-5 text-green-600" />
                          <span className="text-green-800">
                            Resume Match Score: <strong>{matchScore}%</strong>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Application Form */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Current Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/in/yourname"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio/Website</Label>
                  <Input
                    id="portfolio"
                    value={formData.portfolio}
                    onChange={(e) => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Expected Salary (₹)</Label>
                  <Input
                    id="salary"
                    type="number"
                    min="0"
                    value={formData.expected_salary}
                    onChange={(e) => setFormData(prev => ({ ...prev, expected_salary: parseInt(e.target.value) || 0 }))}
                    placeholder="500000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Available From</Label>
                  <Input
                    id="availability"
                    type="date"
                    value={formData.availability_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, availability_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employment-type">Employment Type Preference</Label>
                  <Select 
                    value={formData.employment_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, employment_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  value={formData.skills.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  placeholder="React, TypeScript, Node.js, Python"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover-letter">Cover Letter / Statement of Purpose</Label>
                <Textarea
                  id="cover-letter"
                  value={formData.cover_letter}
                  onChange={(e) => setFormData(prev => ({ ...prev, cover_letter: e.target.value }))}
                  rows={4}
                  placeholder="Tell us why you're interested in this position..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivation">Why do you want this job?</Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => setFormData(prev => ({ ...prev, motivation: e.target.value }))}
                  rows={3}
                  placeholder="What motivates you to apply for this role?"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="relocate"
                  checked={formData.relocate}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, relocate: !!checked }))}
                />
                <Label htmlFor="relocate">I am willing to relocate for this position</Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.email}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
