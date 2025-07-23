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
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Apple-inspired Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png" 
                alt="TalentXcel" 
                className="h-12 w-12 rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">TalentXcel AI Resume Builder</h1>
                <p className="text-sm text-gray-500 mt-0.5">AI-powered resume creation that lands you interviews – Powered by TalentXcel AI</p>
              </div>
            </div>
            
            {atsScore !== null && (
              <div className={`px-4 py-2 rounded-xl border font-medium text-sm ${getATSScoreColor(atsScore)}`}>
                ATS Score: {atsScore}%
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid lg:grid-cols-7 gap-8">
          {/* Left Sidebar - Form + Tools */}
          <div className="lg:col-span-3 space-y-8">
            {/* Resume Builder Form */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg shadow-black/5 rounded-2xl">
              <CardHeader className="border-b border-gray-100 p-8">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <Edit className="h-6 w-6 text-blue-600" />
                    Resume Details
                  </CardTitle>
                  
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="w-56 rounded-xl border-gray-200">
                      <SelectValue placeholder="Choose template" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {Object.entries(templates).map(([key, template]) => (
                        <SelectItem key={key} value={key} className="rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full bg-${template.color}-500`}></div>
                            <span className="font-medium">{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Quick Paste Section */}
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                  <Label htmlFor="paste-resume" className="text-sm font-semibold text-gray-700 mb-3 block">
                    Quick Start: Paste Resume
                  </Label>
                  <div className="flex gap-4">
                    <Textarea
                      id="paste-resume"
                      placeholder="Paste your existing resume content here and we'll automatically fill the form..."
                      className="flex-1 min-h-[80px] bg-white/90 rounded-xl border-gray-200 resize-none"
                      onChange={(e) => {
                        if (e.target.value.length > 50) {
                          parseAndFillResume(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button 
                      variant="outline" 
                      className="px-6 rounded-xl border-gray-200"
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
              
              <CardContent className="p-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                  <TabsList className="grid w-full grid-cols-6 bg-gray-50 rounded-xl p-1">
                    <TabsTrigger value="personal" className="text-xs font-medium rounded-lg">Personal</TabsTrigger>
                    <TabsTrigger value="summary" className="text-xs font-medium rounded-lg">Summary</TabsTrigger>
                    <TabsTrigger value="experience" className="text-xs font-medium rounded-lg">Experience</TabsTrigger>
                    <TabsTrigger value="education" className="text-xs font-medium rounded-lg">Education</TabsTrigger>
                    <TabsTrigger value="skills" className="text-xs font-medium rounded-lg">Skills</TabsTrigger>
                    <TabsTrigger value="extras" className="text-xs font-medium rounded-lg">Extras</TabsTrigger>
                  </TabsList>

                  <ScrollArea className="h-[600px] pr-4">
                    <TabsContent value="personal" className="space-y-6 mt-0">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={resumeData.personalInfo.fullName}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                            }))}
                            placeholder="John Doe"
                            className="rounded-xl border-gray-200 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={resumeData.personalInfo.email}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, email: e.target.value }
                            }))}
                            placeholder="john@example.com"
                            className="rounded-xl border-gray-200 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone *</Label>
                          <Input
                            id="phone"
                            value={resumeData.personalInfo.phone}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, phone: e.target.value }
                            }))}
                            placeholder="+1 (555) 123-4567"
                            className="rounded-xl border-gray-200 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                          <Input
                            id="location"
                            value={resumeData.personalInfo.location}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, location: e.target.value }
                            }))}
                            placeholder="New York, NY"
                            className="rounded-xl border-gray-200 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin" className="text-sm font-medium text-gray-700">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            value={resumeData.personalInfo.linkedin}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                            }))}
                            placeholder="linkedin.com/in/johndoe"
                            className="rounded-xl border-gray-200 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website/Portfolio</Label>
                          <Input
                            id="website"
                            value={resumeData.personalInfo.website}
                            onChange={(e) => setResumeData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, website: e.target.value }
                            }))}
                            placeholder="johndoe.com"
                            className="rounded-xl border-gray-200 h-12"
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="summary" className="space-y-6 mt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="summary" className="text-sm font-medium text-gray-700">Professional Summary *</Label>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => enhanceSection('summary', resumeData.summary)}
                            disabled={isEnhancing || !resumeData.summary}
                            className="rounded-xl"
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
                          className="min-h-[140px] rounded-xl border-gray-200 resize-none"
                        />
                        <p className="text-xs text-gray-500">
                          {resumeData.summary.length}/500 characters
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="experience" className="space-y-6 mt-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                        <Button onClick={addExperience} size="sm" className="rounded-xl">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Experience
                        </Button>
                      </div>
                      
                      <div className="space-y-8">
                        {resumeData.experience.map((exp, index) => (
                          <Card key={exp.id} className="p-6 bg-gray-50/80 rounded-2xl border-gray-200">
                            <div className="flex justify-between items-start mb-6">
                              <h4 className="font-semibold text-gray-900">Experience {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItem('experience', exp.id)}
                                className="text-gray-500 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Job Title *</Label>
                                <Input
                                  value={exp.title}
                                  onChange={(e) => updateItem('experience', exp.id, 'title', e.target.value)}
                                  placeholder="Software Engineer"
                                  className="rounded-xl border-gray-200 h-11"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Company *</Label>
                                <Input
                                  value={exp.company}
                                  onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)}
                                  placeholder="TechCorp Inc."
                                  className="rounded-xl border-gray-200 h-11"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Location</Label>
                                <Input
                                  value={exp.location}
                                  onChange={(e) => updateItem('experience', exp.id, 'location', e.target.value)}
                                  placeholder="San Francisco, CA"
                                  className="rounded-xl border-gray-200 h-11"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                                <Input
                                  value={exp.startDate}
                                  onChange={(e) => updateItem('experience', exp.id, 'startDate', e.target.value)}
                                  placeholder="January 2020"
                                  className="rounded-xl border-gray-200 h-11"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">End Date</Label>
                                <Input
                                  value={exp.endDate}
                                  onChange={(e) => updateItem('experience', exp.id, 'endDate', e.target.value)}
                                  placeholder="Present"
                                  disabled={exp.current}
                                  className="rounded-xl border-gray-200 h-11"
                                />
                              </div>
                              <div className="flex items-center space-x-3 pt-7">
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
                                  className="rounded"
                                />
                                <Label htmlFor={`current-${exp.id}`} className="text-sm text-gray-700">Currently working here</Label>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Job Description *</Label>
                              <Textarea
                                value={exp.description}
                                onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)}
                                placeholder="Describe your key responsibilities and achievements..."
                                className="min-h-[120px] rounded-xl border-gray-200 resize-none"
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="education" className="space-y-6 mt-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                        <Button onClick={addEducation} size="sm" className="rounded-xl">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Education
                        </Button>
                      </div>
                      
                      <div className="space-y-6">
                        {resumeData.education.map((edu, index) => (
                          <Card key={edu.id} className="p-6 bg-gray-50/80 rounded-2xl border-gray-200">
                            <div className="flex justify-between items-start mb-6">
                              <h4 className="font-semibold text-gray-900">Education {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItem('education', edu.id)}
                                className="text-gray-500 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Degree *</Label>
                                <Input
                                  value={edu.degree}
                                  onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)}
                                  placeholder="Bachelor of Science in Computer Science"
                                  className="rounded-xl border-gray-200 h-11"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Institution *</Label>
                                <Input
                                  value={edu.institution}
                                  onChange={(e) => updateItem('education', edu.id, 'institution', e.target.value)}
                                  placeholder="University of California"
                                  className="rounded-xl border-gray-200 h-11"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Location</Label>
                                <Input
                                  value={edu.location}
                                  onChange={(e) => updateItem('education', edu.id, 'location', e.target.value)}
                                  placeholder="Berkeley, CA"
                                  className="rounded-xl border-gray-200 h-11"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">Graduation Date</Label>
                                <Input
                                  value={edu.graduationDate}
                                  onChange={(e) => updateItem('education', edu.id, 'graduationDate', e.target.value)}
                                  placeholder="May 2020"
                                  className="rounded-xl border-gray-200 h-11"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">GPA (Optional)</Label>
                                <Input
                                  value={edu.gpa}
                                  onChange={(e) => updateItem('education', edu.id, 'gpa', e.target.value)}
                                  placeholder="3.8/4.0"
                                  className="rounded-xl border-gray-200 h-11"
                                />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="skills" className="space-y-6 mt-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                        <Button onClick={addSkill} size="sm" className="rounded-xl">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Skill
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {resumeData.skills.map((skill, index) => (
                          <Card key={skill.id} className="p-4 bg-gray-50/80 rounded-2xl border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-sm text-gray-900">Skill {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeItem('skills', skill.id)}
                                className="text-gray-500 hover:text-red-500 h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-gray-700">Skill Name</Label>
                                <Input
                                  value={skill.name}
                                  onChange={(e) => updateItem('skills', skill.id, 'name', e.target.value)}
                                  placeholder="JavaScript"
                                  className="rounded-lg border-gray-200 h-9"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-gray-700">Level</Label>
                                <Select
                                  value={skill.level}
                                  onValueChange={(value) => updateItem('skills', skill.id, 'level', value)}
                                >
                                  <SelectTrigger className="rounded-lg border-gray-200 h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-lg">
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

                    <TabsContent value="extras" className="space-y-8 mt-0">
                      {/* Projects Section */}
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
                          <Button onClick={addProject} size="sm" className="rounded-xl">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Project
                          </Button>
                        </div>
                        
                        <div className="space-y-6">
                          {resumeData.projects.map((project, index) => (
                            <Card key={project.id} className="p-6 bg-gray-50/80 rounded-2xl border-gray-200">
                              <div className="flex justify-between items-start mb-6">
                                <h4 className="font-semibold text-gray-900">Project {index + 1}</h4>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeItem('projects', project.id)}
                                  className="text-gray-500 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Project Name</Label>
                                  <Input
                                    value={project.name}
                                    onChange={(e) => updateItem('projects', project.id, 'name', e.target.value)}
                                    placeholder="E-commerce Platform"
                                    className="rounded-xl border-gray-200 h-11"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Technologies Used</Label>
                                  <Input
                                    value={project.technologies}
                                    onChange={(e) => updateItem('projects', project.id, 'technologies', e.target.value)}
                                    placeholder="React, Node.js, MongoDB"
                                    className="rounded-xl border-gray-200 h-11"
                                  />
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                                  <Textarea
                                    value={project.description}
                                    onChange={(e) => updateItem('projects', project.id, 'description', e.target.value)}
                                    placeholder="Brief description of the project..."
                                    className="rounded-xl border-gray-200 resize-none"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Project Link (Optional)</Label>
                                  <Input
                                    value={project.link}
                                    onChange={(e) => updateItem('projects', project.id, 'link', e.target.value)}
                                    placeholder="https://github.com/username/project"
                                    className="rounded-xl border-gray-200 h-11"
                                  />
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Certifications Section */}
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
                          <Button onClick={addCertification} size="sm" className="rounded-xl">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Certification
                          </Button>
                        </div>
                        
                        <div className="space-y-6">
                          {resumeData.certifications.map((cert, index) => (
                            <Card key={cert.id} className="p-6 bg-gray-50/80 rounded-2xl border-gray-200">
                              <div className="flex justify-between items-start mb-6">
                                <h4 className="font-semibold text-gray-900">Certification {index + 1}</h4>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeItem('certifications', cert.id)}
                                  className="text-gray-500 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Certification Name</Label>
                                  <Input
                                    value={cert.name}
                                    onChange={(e) => updateItem('certifications', cert.id, 'name', e.target.value)}
                                    placeholder="AWS Certified Solutions Architect"
                                    className="rounded-xl border-gray-200 h-11"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Issuing Organization</Label>
                                  <Input
                                    value={cert.issuer}
                                    onChange={(e) => updateItem('certifications', cert.id, 'issuer', e.target.value)}
                                    placeholder="Amazon Web Services"
                                    className="rounded-xl border-gray-200 h-11"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-sm font-medium text-gray-700">Date Obtained</Label>
                                  <Input
                                    value={cert.date}
                                    onChange={(e) => updateItem('certifications', cert.id, 'date', e.target.value)}
                                    placeholder="March 2023"
                                    className="rounded-xl border-gray-200 h-11"
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
              <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg shadow-black/5 rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-green-600" />
                      <span>ATS Compatibility</span>
                    </div>
                    <Badge 
                      className={`text-lg px-4 py-2 border rounded-xl font-semibold ${getATSScoreColor(atsScore)}`}
                    >
                      {atsScore}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={atsScore} className="h-3 rounded-full" />
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Contact Info</span>
                        <Badge variant="outline" className="rounded-full">
                          {resumeData.personalInfo.fullName && resumeData.personalInfo.email ? '✓' : '○'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Summary</span>
                        <Badge variant="outline" className="rounded-full">
                          {resumeData.summary?.length > 50 ? '✓' : '○'}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Experience</span>
                        <Badge variant="outline" className="rounded-full">
                          {resumeData.experience.length > 0 ? '✓' : '○'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Skills</span>
                        <Badge variant="outline" className="rounded-full">
                          {resumeData.skills.length >= 3 ? '✓' : '○'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhancement Tools */}
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg shadow-black/5 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  TalentXcel AI Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={enhanceEntireResume}
                  disabled={isEnhancing}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-14 rounded-xl font-medium"
                >
                  {isEnhancing ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                      Enhancing... {enhancementProgress.toFixed(0)}%
                    </>
                  ) : (
                    <>
                      <Brain className="h-5 w-5 mr-3" />
                      Enhance Resume
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={createCoverLetter}
                  disabled={isEnhancing}
                  className="w-full h-14 rounded-xl border-gray-200 font-medium"
                >
                  <FileText className="h-5 w-5 mr-3" />
                  Generate Cover Letter
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toast.info('More templates coming soon!')}
                  className="w-full text-sm rounded-xl border-gray-200"
                >
                  More Templates
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Live Preview */}
          <div className="lg:col-span-4">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg shadow-black/5 rounded-2xl h-[calc(100vh-140px)]">
              <CardHeader className="border-b border-gray-100 p-6">
                <CardTitle className="flex items-center justify-between text-xl">
                  <div className="flex items-center gap-3">
                    <Eye className="h-6 w-6 text-blue-600" />
                    <span className="font-semibold">Live Preview</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-sm px-4 py-2 rounded-xl font-medium">
                      {templates[selectedTemplate as keyof typeof templates]?.name}
                    </Badge>
                    {atsScore !== null && (
                      <div className={`px-3 py-1 rounded-xl text-sm font-medium border ${getATSScoreColor(atsScore)}`}>
                        ATS: {atsScore}%
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-0 h-full">
                <ScrollArea className="h-[calc(100vh-280px)]">
                  <div 
                    ref={resumePreviewRef}
                    className="space-y-8 p-10 bg-white m-8 rounded-2xl border-2 border-gray-100 shadow-sm text-base leading-relaxed"
                    style={{ minHeight: '11in', width: '8.5in', maxWidth: '100%', margin: '0 auto' }}
                  >
                    {/* Header */}
                    <div className="text-center border-b-2 border-gray-200 pb-8">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                        {resumeData.personalInfo.fullName || 'Your Name'}
                      </h1>
                      <div className="flex flex-wrap justify-center gap-4 text-gray-600 mb-3 text-lg">
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
                        <div className="flex justify-center gap-6 text-blue-600 font-medium text-lg">
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                          Professional Summary
                        </h2>
                        <p className="text-gray-700 leading-relaxed text-lg">{resumeData.summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {resumeData.experience.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-300 pb-2">
                          Professional Experience
                        </h2>
                        <div className="space-y-6">
                          {resumeData.experience.map((exp) => (
                            <div key={exp.id} className="border-l-4 border-blue-500 pl-6">
                              <h3 className="text-xl font-bold text-gray-900">{exp.title}</h3>
                              <p className="text-blue-600 font-semibold text-lg">{exp.company}</p>
                              <p className="text-gray-600 mb-4">
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-300 pb-2">
                          Education
                        </h2>
                        <div className="space-y-5">
                          {resumeData.education.map((edu) => (
                            <div key={edu.id}>
                              <h3 className="text-xl font-bold text-gray-900">{edu.degree}</h3>
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-300 pb-2">
                          Technical Skills
                        </h2>
                        <div className="flex flex-wrap gap-3">
                          {resumeData.skills.map((skill) => (
                            <Badge key={skill.id} variant="secondary" className="text-base px-4 py-2 font-medium rounded-lg">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {resumeData.projects.length > 0 && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-300 pb-2">
                          Notable Projects
                        </h2>
                        <div className="space-y-5">
                          {resumeData.projects.map((project) => (
                            <div key={project.id}>
                              <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                              <p className="text-gray-700 mb-3 leading-relaxed">{project.description}</p>
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
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-300 pb-2">
                          Certifications
                        </h2>
                        <div className="space-y-4">
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

                  </div>
                </ScrollArea>
                
                {/* PDF Download Section */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <div className="font-semibold text-gray-900 text-base">Professional Resume</div>
                      <div>Ready to download</div>
                    </div>
                    <Button 
                      onClick={downloadPDF}
                      disabled={isGeneratingPDF}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-4 text-white font-medium text-lg rounded-xl shadow-lg"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5 mr-3" />
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
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-6">
          <Card className="w-full max-w-5xl max-h-[85vh] bg-white shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
              <CardTitle className="flex items-center justify-between text-xl">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6" />
                  Generated Cover Letter
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowCoverLetter(false)}
                  className="text-white hover:bg-white/20 rounded-xl"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ScrollArea className="h-[50vh]">
                <Textarea
                  value={coverLetterContent}
                  onChange={(e) => setCoverLetterContent(e.target.value)}
                  className="min-h-[400px] text-base resize-none rounded-xl border-gray-200"
                  placeholder="Your cover letter will appear here..."
                />
              </ScrollArea>
              <div className="flex gap-4 mt-8">
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(coverLetterContent);
                    toast.success('Cover letter copied!');
                  }}
                  className="flex-1 h-12 rounded-xl"
                >
                  <Copy className="h-5 w-5 mr-3" />
                  Copy Cover Letter
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowCoverLetter(false)}
                  className="flex-1 h-12 rounded-xl border-gray-200"
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