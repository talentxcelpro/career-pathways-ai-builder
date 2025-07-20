
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, FileText, Sparkles, Download, Copy, RefreshCw, Target, Award, Brain, Zap, User, Briefcase, GraduationCap, Plus, Trash2, Edit, Upload, Eye, Palette } from "lucide-react";
import { useResumeEnhancement } from "@/hooks/useResumeEnhancement";
import { useAIService } from "@/hooks/useAIService";
import { toast } from "sonner";

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    graduationDate: string;
    gpa: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string;
    link: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
  }>;
}

const ConversationalResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  });
  const [activeTab, setActiveTab] = useState('personal');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementProgress, setEnhancementProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [coverLetterContent, setCoverLetterContent] = useState('');
  const [fullResumePreview, setFullResumePreview] = useState(false);
  const { enhanceResumeText, enhanceSingleSection } = useResumeEnhancement();
  const { invokeAITool, optimizeForATS, generateCoverLetter } = useAIService();

  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      location: '',
      graduationDate: '',
      gpa: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const addSkill = () => {
    const newSkill = {
      id: Date.now().toString(),
      name: '',
      level: 'Intermediate'
    };
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: '',
      link: ''
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const addCertification = () => {
    const newCertification = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: ''
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
  };

  const removeItem = (section: keyof ResumeData, id: string) => {
    if (Array.isArray(resumeData[section])) {
      setResumeData(prev => ({
        ...prev,
        [section]: (prev[section] as any[]).filter(item => item.id !== id)
      }));
    }
  };

  const updateItem = (section: keyof ResumeData, id: string, field: string, value: any) => {
    if (Array.isArray(resumeData[section])) {
      setResumeData(prev => ({
        ...prev,
        [section]: (prev[section] as any[]).map(item => 
          item.id === id ? { ...item, [field]: value } : item
        )
      }));
    }
  };

  const enhanceSection = async (section: string, content: string) => {
    setIsEnhancing(true);
    setEnhancementProgress(0);
    
    try {
      setEnhancementProgress(50);
      const enhanced = await enhanceSingleSection(content, section as any);
      
      if (enhanced) {
        if (section === 'summary') {
          setResumeData(prev => ({ ...prev, summary: enhanced }));
        }
        setEnhancementProgress(100);
        toast.success(`${section} enhanced successfully!`);
      }
    } catch (error) {
      toast.error('Enhancement failed. Please try again.');
    } finally {
      setIsEnhancing(false);
      setEnhancementProgress(0);
    }
  };

  const templates = {
    modern: { name: 'Modern Professional', color: 'purple', description: 'Clean and contemporary design' },
    classic: { name: 'Classic Traditional', color: 'blue', description: 'Timeless and professional' },
    creative: { name: 'Creative Bold', color: 'green', description: 'Stand out with unique design' },
    minimal: { name: 'Minimal Clean', color: 'gray', description: 'Simple and elegant' },
    executive: { name: 'Executive Premium', color: 'indigo', description: 'For senior positions' },
    tech: { name: 'Tech Innovation', color: 'cyan', description: 'Perfect for tech roles' },
    elegant: { name: 'Elegant Refined', color: 'rose', description: 'Sophisticated and polished' },
    corporate: { name: 'Corporate Professional', color: 'slate', description: 'Business-focused design' },
    startup: { name: 'Startup Dynamic', color: 'orange', description: 'Energy and innovation' },
    academic: { name: 'Academic Scholar', color: 'emerald', description: 'For research and education' }
  };

  const parseAndFillResume = async (text: string) => {
    setIsEnhancing(true);
    try {
      // Enhanced parsing logic with better section extraction
      const lines = text.split('\n').filter(line => line.trim());
      
      // Extract name (usually first line or line with name pattern)
      let name = lines[0] || '';
      
      // Extract contact information
      const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      const phoneMatch = text.match(/(\+?1?[-.\s]?)?(\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/);
      const linkedinMatch = text.match(/(linkedin\.com\/in\/[^\s]+)/i);
      const websiteMatch = text.match(/(https?:\/\/[^\s]+)/);
      
      // Extract location
      const locationMatch = text.match(/([A-Za-z\s]+,\s*[A-Z]{2})|([A-Za-z\s]+,\s*[A-Za-z\s]+)/);
      
      // Extract sections with better parsing
      const textLower = text.toLowerCase();
      
      // Extract summary/objective
      let summary = '';
      const summaryPatterns = ['summary', 'objective', 'profile', 'about'];
      for (const pattern of summaryPatterns) {
        const start = textLower.indexOf(pattern);
        if (start !== -1) {
          const nextSectionPatterns = ['experience', 'education', 'skills', 'work'];
          let end = text.length;
          for (const nextPattern of nextSectionPatterns) {
            const nextStart = textLower.indexOf(nextPattern, start + pattern.length);
            if (nextStart !== -1 && nextStart < end) {
              end = nextStart;
            }
          }
          summary = text.substring(start, end)
            .replace(new RegExp(pattern, 'i'), '')
            .trim()
            .split('\n')
            .filter(line => line.trim() && !line.match(/^[A-Z\s]+$/))
            .join(' ')
            .substring(0, 500);
          break;
        }
      }
      
      // Extract experience section
      const experienceStart = textLower.indexOf('experience') || textLower.indexOf('work history');
      let experienceEntries: any[] = [];
      if (experienceStart !== -1) {
        const educationStart = textLower.indexOf('education', experienceStart);
        const experienceEnd = educationStart !== -1 ? educationStart : text.length;
        const experienceText = text.substring(experienceStart, experienceEnd);
        
        // Basic experience parsing (could be enhanced with AI)
        const jobMatches = experienceText.match(/(\d{4}[\s\-–]+\d{4}|\d{4}[\s\-–]+present|present)/gi);
        if (jobMatches && jobMatches.length > 0) {
          // Add first experience entry as example
          experienceEntries.push({
            id: Date.now().toString(),
            title: 'Position Title',
            company: 'Company Name',
            location: '',
            startDate: '2020',
            endDate: '2023',
            current: false,
            description: 'Add your job description here...'
          });
        }
      }
      
      // Extract skills
      let skillsEntries: any[] = [];
      const skillsStart = textLower.indexOf('skills');
      if (skillsStart !== -1) {
        const skillsSection = text.substring(skillsStart, skillsStart + 500);
        const commonSkills = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'aws', 'docker'];
        commonSkills.forEach(skill => {
          if (skillsSection.toLowerCase().includes(skill)) {
            skillsEntries.push({
              id: `${Date.now()}-${skill}`,
              name: skill.charAt(0).toUpperCase() + skill.slice(1),
              level: 'Intermediate'
            });
          }
        });
      }
      
      setResumeData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          fullName: name,
          email: emailMatch ? emailMatch[0] : '',
          phone: phoneMatch ? phoneMatch[0] : '',
          location: locationMatch ? locationMatch[0] : '',
          linkedin: linkedinMatch ? linkedinMatch[0] : '',
          website: websiteMatch ? websiteMatch[0] : ''
        },
        summary: summary,
        experience: experienceEntries.length > 0 ? experienceEntries : prev.experience,
        skills: skillsEntries.length > 0 ? skillsEntries : prev.skills
      }));
      
      // Enable full preview mode and calculate ATS score
      setFullResumePreview(true);
      calculateATSScore();
      
      toast.success('Resume content parsed and filled! Check the preview.');
    } catch (error) {
      toast.error('Failed to parse resume content');
    } finally {
      setIsEnhancing(false);
    }
  };

  const calculateATSScore = () => {
    // Simple ATS scoring algorithm
    let score = 0;
    const maxScore = 100;
    
    // Personal info completeness (20 points)
    if (resumeData.personalInfo.fullName) score += 5;
    if (resumeData.personalInfo.email) score += 5;
    if (resumeData.personalInfo.phone) score += 5;
    if (resumeData.personalInfo.location) score += 5;
    
    // Summary (15 points)
    if (resumeData.summary && resumeData.summary.length > 50) score += 15;
    
    // Experience (30 points)
    if (resumeData.experience.length > 0) score += 15;
    if (resumeData.experience.some(exp => exp.description.length > 50)) score += 15;
    
    // Education (15 points)
    if (resumeData.education.length > 0) score += 15;
    
    // Skills (10 points)
    if (resumeData.skills.length >= 3) score += 10;
    
    // Additional sections (10 points)
    if (resumeData.projects.length > 0) score += 5;
    if (resumeData.certifications.length > 0) score += 5;
    
    setAtsScore(Math.min(score, maxScore));
  };

  const enhanceEntireResume = async () => {
    setIsEnhancing(true);
    setEnhancementProgress(0);
    
    try {
      const sections = ['summary', 'experience', 'skills', 'education'];
      const totalSections = sections.length;
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        setEnhancementProgress((i / totalSections) * 100);
        
        if (section === 'summary' && resumeData.summary) {
          const enhanced = await enhanceSingleSection(resumeData.summary, 'summary');
          if (enhanced) {
            setResumeData(prev => ({ ...prev, summary: enhanced }));
          }
        }
        // Add other section enhancements as needed
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setEnhancementProgress(100);
      calculateATSScore();
      toast.success('Entire resume enhanced successfully!');
    } catch (error) {
      toast.error('Enhancement failed. Please try again.');
    } finally {
      setIsEnhancing(false);
      setEnhancementProgress(0);
    }
  };

  const createCoverLetter = async () => {
    try {
      setIsEnhancing(true);
      const resumeText = formatResumeForDownload();
      
      // Simple cover letter template
      const coverLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the position at your company. With my background and experience outlined in my attached resume, I am confident that I would be a valuable addition to your team.

${resumeData.summary ? `As highlighted in my professional summary: ${resumeData.summary}` : ''}

${resumeData.experience.length > 0 ? `My experience includes ${resumeData.experience.map(exp => `${exp.title} at ${exp.company}`).join(', ')}, where I have developed strong skills in ${resumeData.skills.slice(0, 3).map(s => s.name).join(', ')}.` : ''}

I am excited about the opportunity to contribute to your organization and would welcome the chance to discuss how my skills and experience align with your needs.

Thank you for your consideration.

Sincerely,
${resumeData.personalInfo.fullName || '[Your Name]'}`;
      
      setCoverLetterContent(coverLetter);
      setShowCoverLetter(true);
      toast.success('Cover letter generated!');
    } catch (error) {
      toast.error('Failed to generate cover letter');
    } finally {
      setIsEnhancing(false);
    }
  };

  const formatResumeForDownload = () => {
    return `
${resumeData.personalInfo.fullName}
${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone}
${resumeData.personalInfo.location}
${resumeData.personalInfo.linkedin ? `LinkedIn: ${resumeData.personalInfo.linkedin}` : ''}
${resumeData.personalInfo.website ? `Website: ${resumeData.personalInfo.website}` : ''}

PROFESSIONAL SUMMARY
${resumeData.summary}

EXPERIENCE
${resumeData.experience.map(exp => `
${exp.title} at ${exp.company}
${exp.location} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}
${exp.description}
`).join('\n')}

EDUCATION
${resumeData.education.map(edu => `
${edu.degree}
${edu.institution}, ${edu.location}
${edu.graduationDate}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
`).join('\n')}

SKILLS
${resumeData.skills.map(skill => `• ${skill.name} (${skill.level})`).join('\n')}

${resumeData.projects.length > 0 ? `PROJECTS
${resumeData.projects.map(project => `
${project.name}
${project.description}
Technologies: ${project.technologies}
${project.link ? `Link: ${project.link}` : ''}
`).join('\n')}` : ''}

${resumeData.certifications.length > 0 ? `CERTIFICATIONS
${resumeData.certifications.map(cert => `• ${cert.name} - ${cert.issuer} (${cert.date})`).join('\n')}` : ''}
    `.trim();
  };

  const copyResumeText = () => {
    const content = formatResumeForDownload();
    navigator.clipboard.writeText(content);
    toast.success('Resume copied to clipboard!');
  };

  const downloadResume = () => {
    const content = formatResumeForDownload();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              TalentXcel Resume Builder
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create professional resumes with TalentXcel enhancement
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>ATS Optimized</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Achievement Focused</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span>TalentXcel Enhanced</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Resume Builder Form */}
          <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-purple-600" />
                  Resume Builder
                </CardTitle>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="template-select" className="text-sm font-medium">Template:</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Choose template" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(templates).map(([key, template]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full bg-${template.color}-500`}></div>
                              <div>
                                <div className="font-medium">{template.name}</div>
                                <div className="text-xs text-gray-500">{template.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyResumeText}
                    className="shadow-sm"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </div>
              
              {/* Quick Paste Section */}
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                <Label htmlFor="paste-resume" className="text-sm font-medium">Quick Start: Paste Resume</Label>
                <div className="flex gap-2 mt-2">
                  <Textarea
                    id="paste-resume"
                    placeholder="Paste your existing resume content here and we'll automatically fill the form..."
                    className="flex-1 min-h-[60px]"
                    onChange={(e) => {
                      if (e.target.value.length > 50) {
                        parseAndFillResume(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const textarea = document.getElementById('paste-resume') as HTMLTextAreaElement;
                      if (textarea?.value) {
                        parseAndFillResume(textarea.value);
                        textarea.value = '';
                      }
                    }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Parse
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                  <TabsTrigger value="personal" className="text-xs">Personal</TabsTrigger>
                  <TabsTrigger value="summary" className="text-xs">Summary</TabsTrigger>
                  <TabsTrigger value="experience" className="text-xs">Experience</TabsTrigger>
                  <TabsTrigger value="education" className="text-xs">Education</TabsTrigger>
                  <TabsTrigger value="skills" className="text-xs">Skills</TabsTrigger>
                  <TabsTrigger value="extras" className="text-xs">Extras</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[600px]">
                  <TabsContent value="personal" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={resumeData.personalInfo.fullName}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                          }))}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, email: e.target.value }
                          }))}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          value={resumeData.personalInfo.phone}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, phone: e.target.value }
                          }))}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          value={resumeData.personalInfo.location}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, location: e.target.value }
                          }))}
                          placeholder="City, State"
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={resumeData.personalInfo.linkedin}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                          }))}
                          placeholder="linkedin.com/in/johndoe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={resumeData.personalInfo.website}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, website: e.target.value }
                          }))}
                          placeholder="johndoe.com"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="summary" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => enhanceSection('summary', resumeData.summary)}
                        disabled={isEnhancing || !resumeData.summary}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:from-purple-700 hover:to-blue-700"
                      >
                        {isEnhancing ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-1" />
                        )}
                        TalentXcel Enhance
                      </Button>
                    </div>
                    <Textarea
                      id="summary"
                      value={resumeData.summary}
                      onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                      placeholder="Write a compelling professional summary that highlights your key skills, experience, and career goals..."
                      className="min-h-[150px]"
                    />
                    {isEnhancing && (
                      <div className="space-y-2">
                        <Progress value={enhancementProgress} />
                        <p className="text-sm text-gray-600">TalentXcel is enhancing your summary...</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Work Experience</Label>
                      <Button size="sm" onClick={addExperience} variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Experience
                      </Button>
                    </div>
                    {resumeData.experience.map((exp, index) => (
                      <Card key={exp.id} className="border border-gray-200">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">Experience #{index + 1}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItem('experience', exp.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Job Title"
                              value={exp.title}
                              onChange={(e) => updateItem('experience', exp.id, 'title', e.target.value)}
                            />
                            <Input
                              placeholder="Company Name"
                              value={exp.company}
                              onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)}
                            />
                            <Input
                              placeholder="Location"
                              value={exp.location}
                              onChange={(e) => updateItem('experience', exp.id, 'location', e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Input
                                placeholder="Start Date"
                                value={exp.startDate}
                                onChange={(e) => updateItem('experience', exp.id, 'startDate', e.target.value)}
                              />
                              <Input
                                placeholder="End Date"
                                value={exp.endDate}
                                onChange={(e) => updateItem('experience', exp.id, 'endDate', e.target.value)}
                                disabled={exp.current}
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`current-${exp.id}`}
                              checked={exp.current}
                              onChange={(e) => updateItem('experience', exp.id, 'current', e.target.checked)}
                            />
                            <Label htmlFor={`current-${exp.id}`}>Currently working here</Label>
                          </div>
                          <Textarea
                            placeholder="Describe your achievements and responsibilities..."
                            value={exp.description}
                            onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)}
                            className="min-h-[100px]"
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="education" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Education</Label>
                      <Button size="sm" onClick={addEducation} variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Education
                      </Button>
                    </div>
                    {resumeData.education.map((edu, index) => (
                      <Card key={edu.id} className="border border-gray-200">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">Education #{index + 1}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeItem('education', edu.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Degree"
                              value={edu.degree}
                              onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)}
                            />
                            <Input
                              placeholder="Institution"
                              value={edu.institution}
                              onChange={(e) => updateItem('education', edu.id, 'institution', e.target.value)}
                            />
                            <Input
                              placeholder="Location"
                              value={edu.location}
                              onChange={(e) => updateItem('education', edu.id, 'location', e.target.value)}
                            />
                            <Input
                              placeholder="Graduation Date"
                              value={edu.graduationDate}
                              onChange={(e) => updateItem('education', edu.id, 'graduationDate', e.target.value)}
                            />
                            <Input
                              placeholder="GPA (optional)"
                              value={edu.gpa}
                              onChange={(e) => updateItem('education', edu.id, 'gpa', e.target.value)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Skills</Label>
                      <Button size="sm" onClick={addSkill} variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Skill
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      {resumeData.skills.map((skill, index) => (
                        <div key={skill.id} className="flex items-center gap-3">
                          <Input
                            placeholder="Skill name"
                            value={skill.name}
                            onChange={(e) => updateItem('skills', skill.id, 'name', e.target.value)}
                            className="flex-1"
                          />
                          <select
                            value={skill.level}
                            onChange={(e) => updateItem('skills', skill.id, 'level', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem('skills', skill.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="extras" className="space-y-6">
                    {/* Projects */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Projects</Label>
                        <Button size="sm" onClick={addProject} variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Project
                        </Button>
                      </div>
                      {resumeData.projects.map((project, index) => (
                        <Card key={project.id} className="border border-gray-200">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">Project #{index + 1}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItem('projects', project.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Project Name"
                              value={project.name}
                              onChange={(e) => updateItem('projects', project.id, 'name', e.target.value)}
                            />
                            <Textarea
                              placeholder="Project Description"
                              value={project.description}
                              onChange={(e) => updateItem('projects', project.id, 'description', e.target.value)}
                            />
                            <Input
                              placeholder="Technologies Used"
                              value={project.technologies}
                              onChange={(e) => updateItem('projects', project.id, 'technologies', e.target.value)}
                            />
                            <Input
                              placeholder="Project Link (optional)"
                              value={project.link}
                              onChange={(e) => updateItem('projects', project.id, 'link', e.target.value)}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Certifications */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Certifications</Label>
                        <Button size="sm" onClick={addCertification} variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Certification
                        </Button>
                      </div>
                      {resumeData.certifications.map((cert, index) => (
                        <Card key={cert.id} className="border border-gray-200">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">Certification #{index + 1}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItem('certifications', cert.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              <Input
                                placeholder="Certification Name"
                                value={cert.name}
                                onChange={(e) => updateItem('certifications', cert.id, 'name', e.target.value)}
                              />
                              <Input
                                placeholder="Issuing Organization"
                                value={cert.issuer}
                                onChange={(e) => updateItem('certifications', cert.id, 'issuer', e.target.value)}
                              />
                              <Input
                                placeholder="Date Obtained"
                                value={cert.date}
                                onChange={(e) => updateItem('certifications', cert.id, 'date', e.target.value)}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>

          {/* Resume Preview */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Resume Preview
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadResume}
                    className="shadow-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[700px] p-6 bg-white rounded-lg border">
                <div className="space-y-6 text-sm max-w-2xl mx-auto">
                  {/* Header */}
                  <div className="text-center border-b pb-6">
                    <h1 className={`text-3xl font-bold mb-4 ${
                      selectedTemplate === 'modern' ? 'text-purple-600' :
                      selectedTemplate === 'classic' ? 'text-blue-600' :
                      selectedTemplate === 'creative' ? 'text-green-600' :
                      selectedTemplate === 'tech' ? 'text-cyan-600' :
                      selectedTemplate === 'executive' ? 'text-indigo-600' :
                      'text-gray-900'
                    }`}>
                      {resumeData.personalInfo.fullName || "Your Name"}
                    </h1>
                    <div className="text-gray-600 mt-2 space-y-1">
                      {resumeData.personalInfo.email && <div>{resumeData.personalInfo.email}</div>}
                      {resumeData.personalInfo.phone && <div>{resumeData.personalInfo.phone}</div>}
                      {resumeData.personalInfo.location && <div>{resumeData.personalInfo.location}</div>}
                      {resumeData.personalInfo.linkedin && <div>{resumeData.personalInfo.linkedin}</div>}
                      {resumeData.personalInfo.website && <div>{resumeData.personalInfo.website}</div>}
                    </div>
                  </div>

                  {/* Summary */}
                  {resumeData.summary && (
                    <div>
                      <h2 className={`text-xl font-bold mb-4 border-b-2 pb-2 ${
                        selectedTemplate === 'modern' ? 'text-purple-600 border-purple-200' :
                        selectedTemplate === 'classic' ? 'text-blue-600 border-blue-200' :
                        selectedTemplate === 'creative' ? 'text-green-600 border-green-200' :
                        'text-gray-900 border-gray-200'
                      }`}>PROFESSIONAL SUMMARY</h2>
                      <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
                    </div>
                  )}

                  {/* Experience */}
                  {resumeData.experience.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-3 border-b">EXPERIENCE</h2>
                      <div className="space-y-4">
                        {resumeData.experience.map((exp) => (
                          <div key={exp.id}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                                <p className="text-gray-700">{exp.company}</p>
                              </div>
                              <div className="text-right text-gray-600">
                                <p>{exp.location}</p>
                                <p>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</p>
                              </div>
                            </div>
                            {exp.description && (
                              <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {resumeData.education.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-3 border-b">EDUCATION</h2>
                      <div className="space-y-3">
                        {resumeData.education.map((edu) => (
                          <div key={edu.id}>
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                                <p className="text-gray-700">{edu.institution}</p>
                              </div>
                              <div className="text-right text-gray-600">
                                <p>{edu.location}</p>
                                <p>{edu.graduationDate}</p>
                                {edu.gpa && <p>GPA: {edu.gpa}</p>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {resumeData.skills.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-3 border-b">SKILLS</h2>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill) => (
                          <Badge key={skill.id} variant="secondary" className="bg-purple-100 text-purple-800">
                            {skill.name} ({skill.level})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects */}
                  {resumeData.projects.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-3 border-b">PROJECTS</h2>
                      <div className="space-y-3">
                        {resumeData.projects.map((project) => (
                          <div key={project.id}>
                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                            <p className="text-gray-700">{project.description}</p>
                            {project.technologies && (
                              <p className="text-gray-600">Technologies: {project.technologies}</p>
                            )}
                            {project.link && (
                              <p className="text-purple-600">{project.link}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {resumeData.certifications.length > 0 && (
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-3 border-b">CERTIFICATIONS</h2>
                      <div className="space-y-2">
                        {resumeData.certifications.map((cert) => (
                          <div key={cert.id} className="flex justify-between">
                            <span className="font-medium text-gray-900">{cert.name}</span>
                            <span className="text-gray-600">{cert.issuer} ({cert.date})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-purple-100 via-blue-100 to-indigo-100 border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Unlock Premium Features
                </h3>
              </div>
              <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                Get access to advanced AI tools, premium templates, LinkedIn optimization, 
                interview preparation, and personalized career coaching insights.
              </p>
              <div className="flex justify-center gap-4 mt-6">
                <Button 
                  variant="outline" 
                  className="border-2 border-purple-200 hover:border-purple-300 text-purple-700 hover:bg-purple-50"
                  size="lg"
                  onClick={() => window.open('https://talentxcel.net/', '_blank')}
                >
                  Learn More
                </Button>
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg" 
                  size="lg"
                  onClick={() => window.open('https://talentxcel.net/', '_blank')}
                >
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConversationalResumeBuilder;
