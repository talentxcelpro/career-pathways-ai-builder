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
import html2pdf from 'html2pdf.js';

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
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [coverLetterContent, setCoverLetterContent] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  
  const { enhanceResumeText, enhanceSingleSection } = useResumeEnhancement();
  const { invokeAITool, optimizeForATS, generateCoverLetter } = useAIService();

  // Calculate ATS score whenever resume data changes
  useEffect(() => {
    calculateATSScore();
  }, [resumeData]);

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
    modern: { name: 'Modern Professional', color: 'blue', description: 'Clean and contemporary design' },
    classic: { name: 'Classic Traditional', color: 'slate', description: 'Timeless and professional' },
    creative: { name: 'Creative Bold', color: 'purple', description: 'Stand out with unique design' },
    minimal: { name: 'Minimal Clean', color: 'gray', description: 'Simple and elegant' },
    executive: { name: 'Executive Premium', color: 'indigo', description: 'For senior positions' },
    tech: { name: 'Tech Innovation', color: 'cyan', description: 'Perfect for tech roles' },
    elegant: { name: 'Elegant Refined', color: 'rose', description: 'Sophisticated and polished' },
    corporate: { name: 'Corporate Professional', color: 'emerald', description: 'Business-focused design' },
    startup: { name: 'Startup Dynamic', color: 'orange', description: 'Energy and innovation' },
    academic: { name: 'Academic Scholar', color: 'green', description: 'For research and education' }
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
      
      toast.success('Resume content parsed and filled! Check the preview.');
    } catch (error) {
      toast.error('Failed to parse resume content');
    } finally {
      setIsEnhancing(false);
    }
  };

  const calculateATSScore = () => {
    // Enhanced ATS scoring algorithm
    let score = 0;
    const maxScore = 100;
    
    // Personal info completeness (25 points)
    if (resumeData.personalInfo.fullName) score += 6;
    if (resumeData.personalInfo.email) score += 6;
    if (resumeData.personalInfo.phone) score += 6;
    if (resumeData.personalInfo.location) score += 7;
    
    // Summary (20 points)
    if (resumeData.summary && resumeData.summary.length > 50) score += 15;
    if (resumeData.summary && resumeData.summary.length > 150) score += 5;
    
    // Experience (30 points)
    if (resumeData.experience.length > 0) score += 10;
    if (resumeData.experience.length >= 2) score += 5;
    if (resumeData.experience.some(exp => exp.description.length > 50)) score += 10;
    if (resumeData.experience.some(exp => exp.description.length > 200)) score += 5;
    
    // Education (10 points)
    if (resumeData.education.length > 0) score += 10;
    
    // Skills (10 points)
    if (resumeData.skills.length >= 3) score += 5;
    if (resumeData.skills.length >= 6) score += 5;
    
    // Additional sections (5 points)
    if (resumeData.projects.length > 0) score += 3;
    if (resumeData.certifications.length > 0) score += 2;
    
    setAtsScore(Math.min(score, maxScore));
  };

  const enhanceEntireResume = async () => {
    setIsEnhancing(true);
    setEnhancementProgress(0);
    
    try {
      const sections = ['summary'];
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
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      setEnhancementProgress(100);
      toast.success('Resume enhanced successfully!');
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

  const downloadPDF = async () => {
    if (!resumePreviewRef.current) {
      toast.error('Resume preview not available');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const element = resumePreviewRef.current;
      const opt = {
        margin: 0.5,
        filename: `${resumeData.personalInfo.fullName || 'resume'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const getATSScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Apple-inspired Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">TalentXcel Resume Builder</h1>
                <p className="text-sm text-gray-500">Create professional resumes with AI enhancement</p>
              </div>
            </div>
            
            {atsScore !== null && (
              <div className={`px-4 py-2 rounded-full ${getATSScoreColor(atsScore)} font-medium text-sm`}>
                ATS Score: {atsScore}%
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-7 gap-6">
          {/* Form + Tools Section - 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-black/5">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Edit className="h-5 w-5 text-blue-600" />
                    Resume Details
                  </CardTitle>
                  
                  <div className="flex items-center gap-3">
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Choose template" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(templates).map(([key, template]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full bg-${template.color}-500`}></div>
                              <span className="font-medium">{template.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Quick Paste Section */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <Label htmlFor="paste-resume" className="text-sm font-medium text-gray-700">Quick Start: Paste Resume</Label>
                  <div className="flex gap-3 mt-2">
                    <Textarea
                      id="paste-resume"
                      placeholder="Paste your existing resume content here and we'll automatically fill the form..."
                      className="flex-1 min-h-[60px] bg-white/80"
                      onChange={(e) => {
                        if (e.target.value.length > 50) {
                          parseAndFillResume(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button 
                      variant="outline" 
                      className="px-6"
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
              
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-6 bg-gray-50/80">
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
                            className="bg-white/80"
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
                            className="bg-white/80"
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
                            placeholder="+1 (555) 123-4567"
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={resumeData.personalInfo.location}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, location: e.target.value }
                            }))}
                            placeholder="New York, NY"
                            className="bg-white/80"
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
                            className="bg-white/80"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website/Portfolio</Label>
                          <Input
                            id="website"
                            value={resumeData.personalInfo.website}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, website: e.target.value }
                            }))}
                            placeholder="johndoe.com"
                            className="bg-white/80"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="summary" className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label htmlFor="summary">Professional Summary *</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => enhanceSection('summary', resumeData.summary)}
                            disabled={isEnhancing || !resumeData.summary}
                          >
                            {isEnhancing ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Zap className="h-4 w-4 mr-2" />
                            )}
                            Enhance
                          </Button>
                        </div>
                        <Textarea
                          id="summary"
                          value={resumeData.summary}
                          onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                          placeholder="Write a compelling professional summary that highlights your key achievements and career goals..."
                          className="min-h-[120px] bg-white/80"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {resumeData.summary.length}/500 characters
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="experience" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Work Experience</h3>
                        <Button onClick={addExperience} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Experience
                        </Button>
                      </div>
                      
                      <div className="space-y-6">
                        {resumeData.experience.map((exp, index) => (
                          <Card key={exp.id} className="p-4 bg-gray-50/50">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-medium">Experience {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItem('experience', exp.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Job Title *</Label>
                                <Input
                                  value={exp.title}
                                  onChange={(e) => updateItem('experience', exp.id, 'title', e.target.value)}
                                  placeholder="Software Engineer"
                                  className="bg-white/80"
                                />
                              </div>
                              <div>
                                <Label>Company *</Label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)}
                                  placeholder="TechCorp Inc."
                                  className="bg-white/80"
                                />
                              </div>
                              <div>
                                <Label>Location</Label>
                                <Input
                                  value={exp.location}
                                  onChange={(e) => updateItem('experience', exp.id, 'location', e.target.value)}
                                  placeholder="San Francisco, CA"
                                  className="bg-white/80"
                                />
                              </div>
                              <div>
                                <Label>Start Date</Label>
                                <Input
                                  value={exp.startDate}
                                  onChange={(e) => updateItem('experience', exp.id, 'startDate', e.target.value)}
                                  placeholder="January 2020"
                                  className="bg-white/80"
                                />
                              </div>
                              <div>
                                <Label>End Date</Label>
                                <Input
                                  value={exp.endDate}
                                  onChange={(e) => updateItem('experience', exp.id, 'endDate', e.target.value)}
                                  placeholder="Present"
                                  disabled={exp.current}
                                  className="bg-white/80"
                                />
                              </div>
                              <div className="flex items-center space-x-2 pt-6">
                                <input
                                  type="checkbox"
                                  id={`current-${exp.id}`}
                                  checked={exp.current}
                                  onChange={(e) => {
                                    updateItem('experience', exp.id, 'current', e.target.checked);
                                    if (e.target.checked) {
                                      updateItem('experience', exp.id, 'endDate', 'Present');
                                    }
                                  }}
                                />
                                <Label htmlFor={`current-${exp.id}`}>Currently working here</Label>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <Label>Job Description *</Label>
                              <Textarea
                                value={exp.description}
                                onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)}
                                placeholder="Describe your key responsibilities and achievements..."
                                className="min-h-[100px] bg-white/80"
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="education" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Education</h3>
                        <Button onClick={addEducation} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Education
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        {resumeData.education.map((edu, index) => (
                          <Card key={edu.id} className="p-4 bg-gray-50/50">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="font-medium">Education {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItem('education', edu.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Degree *</Label>
                                <Input
                                  value={edu.degree}
                                  onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)}
                                  placeholder="Bachelor of Science in Computer Science"
                                  className="bg-white/80"
                                />
                              </div>
                              <div>
                                <Label>Institution *</Label>
                                <Input
                                  value={edu.institution}
                                  onChange={(e) => updateItem('education', edu.id, 'institution', e.target.value)}
                                  placeholder="University of California"
                                  className="bg-white/80"
                                />
                              </div>
                              <div>
                                <Label>Location</Label>
                                <Input
                                  value={edu.location}
                                  onChange={(e) => updateItem('education', edu.id, 'location', e.target.value)}
                                  placeholder="Berkeley, CA"
                                  className="bg-white/80"
                                />
                              </div>
                              <div>
                                <Label>Graduation Date</Label>
                                <Input
                                  value={edu.graduationDate}
                                  onChange={(e) => updateItem('education', edu.id, 'graduationDate', e.target.value)}
                                  placeholder="May 2020"
                                  className="bg-white/80"
                                />
                              </div>
                              <div>
                                <Label>GPA (Optional)</Label>
                                <Input
                                  value={edu.gpa}
                                  onChange={(e) => updateItem('education', edu.id, 'gpa', e.target.value)}
                                  placeholder="3.8/4.0"
                                  className="bg-white/80"
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="skills" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Skills</h3>
                        <Button onClick={addSkill} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Skill
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {resumeData.skills.map((skill, index) => (
                          <Card key={skill.id} className="p-3 bg-gray-50/50">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-sm">Skill {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItem('skills', skill.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <Label className="text-xs">Skill Name</Label>
                                <Input
                                  value={skill.name}
                                  onChange={(e) => updateItem('skills', skill.id, 'name', e.target.value)}
                                  placeholder="JavaScript"
                                  className="bg-white/80"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Level</Label>
                                <Select
                                  value={skill.level}
                                  onValueChange={(value) => updateItem('skills', skill.id, 'level', value)}
                                >
                                  <SelectTrigger className="bg-white/80">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                    <SelectItem value="Expert">Expert</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="extras" className="space-y-6">
                      {/* Projects Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Projects</h3>
                          <Button onClick={addProject} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Project
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {resumeData.projects.map((project, index) => (
                            <Card key={project.id} className="p-4 bg-gray-50/50">
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="font-medium">Project {index + 1}</h4>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeItem('projects', project.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Project Name</Label>
                                  <Input
                                    value={project.name}
                                    onChange={(e) => updateItem('projects', project.id, 'name', e.target.value)}
                                    placeholder="E-commerce Platform"
                                    className="bg-white/80"
                                  />
                                </div>
                                <div>
                                  <Label>Technologies Used</Label>
                                  <Input
                                    value={project.technologies}
                                    onChange={(e) => updateItem('projects', project.id, 'technologies', e.target.value)}
                                    placeholder="React, Node.js, MongoDB"
                                    className="bg-white/80"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label>Description</Label>
                                  <Textarea
                                    value={project.description}
                                    onChange={(e) => updateItem('projects', project.id, 'description', e.target.value)}
                                    placeholder="Brief description of the project..."
                                    className="bg-white/80"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Label>Project Link (Optional)</Label>
                                  <Input
                                    value={project.link}
                                    onChange={(e) => updateItem('projects', project.id, 'link', e.target.value)}
                                    placeholder="https://github.com/username/project"
                                    className="bg-white/80"
                                  />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Certifications Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Certifications</h3>
                          <Button onClick={addCertification} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Certification
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          {resumeData.certifications.map((cert, index) => (
                            <Card key={cert.id} className="p-4 bg-gray-50/50">
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="font-medium">Certification {index + 1}</h4>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeItem('certifications', cert.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Certification Name</Label>
                                  <Input
                                    value={cert.name}
                                    onChange={(e) => updateItem('certifications', cert.id, 'name', e.target.value)}
                                    placeholder="AWS Certified Solutions Architect"
                                    className="bg-white/80"
                                  />
                                </div>
                                <div>
                                  <Label>Issuing Organization</Label>
                                  <Input
                                    value={cert.issuer}
                                    onChange={(e) => updateItem('certifications', cert.id, 'issuer', e.target.value)}
                                    placeholder="Amazon Web Services"
                                    className="bg-white/80"
                                  />
                                </div>
                                <div>
                                  <Label>Date Obtained</Label>
                                  <Input
                                    value={cert.date}
                                    onChange={(e) => updateItem('certifications', cert.id, 'date', e.target.value)}
                                    placeholder="March 2023"
                                    className="bg-white/80"
                                  />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </CardContent>
            </Card>

            {/* ATS Score Card */}
            {atsScore !== null && (
              <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-black/5">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span>ATS Compatibility</span>
                    </div>
                    <Badge 
                      className={`text-lg px-4 py-1 ${getATSScoreColor(atsScore)}`}
                    >
                      {atsScore}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={atsScore} className="h-2 mb-4" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Contact Info</span>
                        <Badge variant="outline">
                          {resumeData.personalInfo.fullName && resumeData.personalInfo.email ? '✓' : '○'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Summary</span>
                        <Badge variant="outline">
                          {resumeData.summary?.length > 50 ? '✓' : '○'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Experience</span>
                        <Badge variant="outline">
                          {resumeData.experience.length > 0 ? '✓' : '○'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Skills</span>
                        <Badge variant="outline">
                          {resumeData.skills.length >= 3 ? '✓' : '○'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhancement Tools */}
            <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-black/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  TalentXcel Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={enhanceEntireResume}
                  disabled={isEnhancing}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12"
                >
                  {isEnhancing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enhancing... {enhancementProgress.toFixed(0)}%
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Enhance Resume
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={createCoverLetter}
                  disabled={isEnhancing}
                  className="w-full h-12"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Cover Letter
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline"
                    onClick={downloadPDF}
                    disabled={isGeneratingPDF}
                    className="h-10"
                  >
                    {isGeneratingPDF ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-1" />
                    )}
                    PDF
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={copyResumeText}
                    className="h-10"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('https://talentxcel.net/', '_blank')}
                  className="w-full text-xs"
                >
                  Learn More • Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Live Preview Section - 4 columns */}
          <div className="lg:col-span-4">
            <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-black/5 h-[calc(100vh-200px)]">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <Eye className="h-6 w-6 text-blue-600" />
                    <span>Live Preview</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {templates[selectedTemplate as keyof typeof templates]?.name}
                    </Badge>
                    {atsScore !== null && (
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getATSScoreColor(atsScore)}`}>
                        ATS: {atsScore}%
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div 
                    ref={resumePreviewRef}
                    className="space-y-6 p-8 bg-white m-6 rounded-xl border-2 border-gray-100 shadow-lg text-base leading-relaxed"
                    style={{ minHeight: '11in', width: '8.5in', maxWidth: '100%', margin: '0 auto' }}
                  >
                    {/* Header */}
                    <div className="text-center border-b-2 border-gray-200 pb-6">
                      <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        {resumeData.personalInfo.fullName || 'Your Name'}
                      </h1>
                      <div className="flex flex-wrap justify-center gap-3 text-gray-600 mb-2">
                        {resumeData.personalInfo.email && (
                          <span className="font-medium">{resumeData.personalInfo.email}</span>
                        )}
                        {resumeData.personalInfo.phone && resumeData.personalInfo.email && (
                          <span className="text-gray-400">•</span>
                        )}
                        {resumeData.personalInfo.phone && (
                          <span className="font-medium">{resumeData.personalInfo.phone}</span>
                        )}
                        {resumeData.personalInfo.location && (resumeData.personalInfo.phone || resumeData.personalInfo.email) && (
                          <span className="text-gray-400">•</span>
                        )}
                        {resumeData.personalInfo.location && (
                          <span className="font-medium">{resumeData.personalInfo.location}</span>
                        )}
                      </div>
                      {(resumeData.personalInfo.linkedin || resumeData.personalInfo.website) && (
                        <div className="flex justify-center gap-4 text-blue-600 font-medium">
                          {resumeData.personalInfo.linkedin && (
                            <span>{resumeData.personalInfo.linkedin}</span>
                          )}
                          {resumeData.personalInfo.website && (
                            <span>{resumeData.personalInfo.website}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    {resumeData.summary && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                          Professional Summary
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-base">{resumeData.summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {resumeData.experience.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
                          Professional Experience
                        </h2>
                        <div className="space-y-5">
                          {resumeData.experience.map((exp) => (
                            <div key={exp.id} className="border-l-4 border-blue-500 pl-5">
                              <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
                              <p className="text-blue-600 font-semibold text-base">{exp.company}</p>
                              <p className="text-gray-600 mb-3">
                                {exp.location} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              </p>
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
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
                          Education
                        </h2>
                        <div className="space-y-4">
                          {resumeData.education.map((edu) => (
                            <div key={edu.id}>
                              <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                              <p className="text-blue-600 font-semibold">{edu.institution}</p>
                              <p className="text-gray-600">
                                {edu.location} • {edu.graduationDate}
                                {edu.gpa && ` • GPA: ${edu.gpa}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {resumeData.skills.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
                          Technical Skills
                        </h2>
                        <div className="flex flex-wrap gap-3">
                          {resumeData.skills.map((skill) => (
                            <Badge key={skill.id} variant="secondary" className="text-sm px-4 py-2 font-medium">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {resumeData.projects.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
                          Notable Projects
                        </h2>
                        <div className="space-y-4">
                          {resumeData.projects.map((project) => (
                            <div key={project.id}>
                              <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                              <p className="text-gray-700 mb-2">{project.description}</p>
                              {project.technologies && (
                                <p className="text-blue-600 font-medium">Technologies: {project.technologies}</p>
                              )}
                              {project.link && (
                                <a href={project.link} className="text-blue-600 hover:underline font-medium">
                                  {project.link}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {resumeData.certifications.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
                          Certifications
                        </h2>
                        <div className="space-y-3">
                          {resumeData.certifications.map((cert) => (
                            <div key={cert.id} className="flex justify-between items-center">
                              <div>
                                <span className="font-bold text-gray-900">{cert.name}</span>
                                <span className="text-gray-600"> - {cert.issuer}</span>
                              </div>
                              <span className="text-gray-600 font-medium">{cert.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Footer Branding */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                      <div className="text-sm text-gray-500">
                        <div className="font-semibold text-blue-600 mb-1">Created with TalentXcel Resume Builder</div>
                        <div>AI-Enhanced Professional Resume • Visit talentxcel.net</div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                
                {/* PDF Download Button */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium text-gray-900">Powered by TalentXcel</div>
                      <div>Professional Resume Builder with AI Enhancement</div>
                    </div>
                    <Button 
                      onClick={downloadPDF}
                      disabled={isGeneratingPDF}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-white font-medium"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span>ATS Compatibility</span>
                    </div>
                    <Badge 
                      className={`text-lg px-4 py-1 ${getATSScoreColor(atsScore)}`}
                    >
                      {atsScore}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={atsScore} className="h-2 mb-4" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Contact Info</span>
                        <Badge variant="outline">
                          {resumeData.personalInfo.fullName && resumeData.personalInfo.email ? '✓' : '○'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Summary</span>
                        <Badge variant="outline">
                          {resumeData.summary?.length > 50 ? '✓' : '○'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Experience</span>
                        <Badge variant="outline">
                          {resumeData.experience.length > 0 ? '✓' : '○'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Skills</span>
                        <Badge variant="outline">
                          {resumeData.skills.length >= 3 ? '✓' : '○'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhancement Tools */}
            <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-black/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  TalentXcel Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={enhanceEntireResume}
                  disabled={isEnhancing}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12"
                >
                  {isEnhancing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Enhancing... {enhancementProgress.toFixed(0)}%
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Enhance Resume
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={createCoverLetter}
                  disabled={isEnhancing}
                  className="w-full h-12"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Cover Letter
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('https://talentxcel.net/', '_blank')}
                  className="w-full text-xs"
                >
                  Learn More • Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Live Preview Section - 4 columns */}
          <div className="lg:col-span-4">
            <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-black/5 h-[calc(100vh-200px)]">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <Eye className="h-6 w-6 text-blue-600" />
                    <span>Live Preview</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                      {templates[selectedTemplate as keyof typeof templates]?.name}
                    </Badge>
                    {atsScore !== null && (
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getATSScoreColor(atsScore)}`}>
                        ATS: {atsScore}%
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-full">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  <div 
                    ref={resumePreviewRef}
                    className="space-y-6 p-8 bg-white m-6 rounded-xl border-2 border-gray-100 shadow-lg text-base leading-relaxed"
                    style={{ minHeight: '11in', width: '8.5in', maxWidth: '100%', margin: '0 auto' }}
                  >
                    disabled={isGeneratingPDF}
                    className="h-10"
                  >
                    {isGeneratingPDF ? (
                      <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-1" />
                    )}
                    PDF
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={copyResumeText}
                    className="h-10"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open('https://talentxcel.net/', '_blank')}
                  className="w-full text-xs"
                >
                  Learn More • Upgrade to Pro
                </Button>
              </CardContent>
            </Card>

            {/* Resume Preview */}
            <Card className="bg-white/70 backdrop-blur-sm border border-gray-200/50 shadow-xl shadow-black/5">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Live Preview
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {templates[selectedTemplate as keyof typeof templates]?.name}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div 
                    ref={resumePreviewRef}
                    className="space-y-4 p-6 bg-white rounded-lg border text-sm"
                  >
                    {/* Header */}
                    <div className="text-center border-b pb-4">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {resumeData.personalInfo.fullName || 'Your Name'}
                      </h1>
                      <div className="flex flex-wrap justify-center gap-2 mt-2 text-sm text-gray-600">
                        {resumeData.personalInfo.email && (
                          <span>{resumeData.personalInfo.email}</span>
                        )}
                        {resumeData.personalInfo.phone && resumeData.personalInfo.email && (
                          <span>•</span>
                        )}
                        {resumeData.personalInfo.phone && (
                          <span>{resumeData.personalInfo.phone}</span>
                        )}
                        {resumeData.personalInfo.location && (resumeData.personalInfo.phone || resumeData.personalInfo.email) && (
                          <span>•</span>
                        )}
                        {resumeData.personalInfo.location && (
                          <span>{resumeData.personalInfo.location}</span>
                        )}
                      </div>
                      {(resumeData.personalInfo.linkedin || resumeData.personalInfo.website) && (
                        <div className="flex justify-center gap-3 mt-1 text-sm text-blue-600">
                          {resumeData.personalInfo.linkedin && (
                            <span>{resumeData.personalInfo.linkedin}</span>
                          )}
                          {resumeData.personalInfo.website && (
                            <span>{resumeData.personalInfo.website}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    {resumeData.summary && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Professional Summary</h2>
                        <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {resumeData.experience.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Experience</h2>
                        <div className="space-y-4">
                          {resumeData.experience.map((exp) => (
                            <div key={exp.id} className="border-l-3 border-blue-500 pl-4">
                              <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                              <p className="text-blue-600 font-medium">{exp.company}</p>
                              <p className="text-sm text-gray-500">
                                {exp.location} • {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              </p>
                              {exp.description && (
                                <p className="text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {resumeData.education.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Education</h2>
                        <div className="space-y-3">
                          {resumeData.education.map((edu) => (
                            <div key={edu.id}>
                              <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                              <p className="text-blue-600">{edu.institution}</p>
                              <p className="text-sm text-gray-500">
                                {edu.location} • {edu.graduationDate}
                                {edu.gpa && ` • GPA: ${edu.gpa}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {resumeData.skills.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {resumeData.skills.map((skill) => (
                            <Badge key={skill.id} variant="secondary" className="text-xs px-3 py-1">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {resumeData.projects.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Projects</h2>
                        <div className="space-y-3">
                          {resumeData.projects.map((project) => (
                            <div key={project.id}>
                              <h3 className="font-semibold text-gray-900">{project.name}</h3>
                              <p className="text-gray-700">{project.description}</p>
                              {project.technologies && (
                                <p className="text-sm text-blue-600">Technologies: {project.technologies}</p>
                              )}
                              {project.link && (
                                <a href={project.link} className="text-sm text-blue-600 hover:underline">
                                  {project.link}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {resumeData.certifications.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h2>
                        <div className="space-y-2">
                          {resumeData.certifications.map((cert) => (
                            <div key={cert.id} className="flex justify-between items-center">
                              <div>
                                <span className="font-medium text-gray-900">{cert.name}</span>
                                <span className="text-gray-600"> - {cert.issuer}</span>
                              </div>
                              <span className="text-sm text-gray-500">{cert.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                
                {/* PDF Download Button */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium text-gray-900">Powered by TalentXcel</div>
                      <div>Professional Resume Builder with AI Enhancement</div>
                    </div>
                    <Button 
                      onClick={downloadPDF}
                      disabled={isGeneratingPDF}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-white font-medium"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cover Letter Modal */}
      {showCoverLetter && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[80vh] bg-white shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Cover Letter
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCoverLetter(false)}
                  className="text-white hover:bg-white/20"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ScrollArea className="h-[50vh]">
                <Textarea
                  value={coverLetterContent}
                  onChange={(e) => setCoverLetterContent(e.target.value)}
                  className="min-h-[400px] text-sm resize-none"
                  placeholder="Your cover letter will appear here..."
                />
              </ScrollArea>
              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(coverLetterContent);
                    toast.success('Cover letter copied!');
                  }}
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Cover Letter
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowCoverLetter(false)}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ConversationalResumeBuilder;