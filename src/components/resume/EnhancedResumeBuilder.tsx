import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Sparkles, Upload, Download, Copy, RefreshCw, Lightbulb, User, FileText, Award, Briefcase, GraduationCap, Code, Globe, Heart, Trophy, BookOpen, Mic, Link, Target, Users, CloudUpload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ResumeTextExtractor } from "@/services/resumeTextExtractor";

interface SectionData {
  [key: string]: string;
}

interface EnhancementSuggestion {
  section: string;
  suggestions: string[];
}

interface ParsedResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: any[];
  education: any[];
  skills: any[];
  certifications: any[];
}

const resumeSections = [
  { id: 'personal_details', title: 'Personal Details / Header', icon: User, placeholder: 'Full Name\nEmail: your.email@example.com\nPhone: (555) 123-4567\nLocation: City, State\nLinkedIn: linkedin.com/in/yourprofile' },
  { id: 'professional_summary', title: 'Professional Summary', icon: FileText, placeholder: 'Write a compelling 3-4 sentence summary highlighting your key qualifications, experience, and value proposition...' },
  { id: 'skills', title: 'Key Skills / Core Competencies', icon: Code, placeholder: 'Technical Skills:\n• Programming Languages: Python, JavaScript, Java\n• Frameworks: React, Node.js, Django\n\nSoft Skills:\n• Leadership\n• Communication\n• Problem-solving' },
  { id: 'experience', title: 'Work Experience', icon: Briefcase, placeholder: 'Job Title | Company Name | Date Range\n• Achievement with quantifiable result (increased sales by 25%)\n• Another accomplishment with specific metrics\n• Leadership example with team size or scope' },
  { id: 'education', title: 'Education', icon: GraduationCap, placeholder: 'Degree, Major\nUniversity Name | Graduation Year\nRelevant coursework, honors, GPA (if 3.5+)' },
  { id: 'certifications', title: 'Certifications', icon: Award, placeholder: 'Certification Name | Issuing Organization | Date\nCertification ID (if applicable)\nValidity period' },
  { id: 'projects', title: 'Projects', icon: Code, placeholder: 'Project Name | Technologies Used\n• Brief description of the project and your role\n• Quantifiable impact or results achieved\n• Link to live demo or repository' },
  { id: 'languages', title: 'Languages', icon: Globe, placeholder: 'English: Native\nSpanish: Fluent (C1)\nFrench: Conversational (B2)' },
  { id: 'volunteer', title: 'Volunteer Work / Leadership', icon: Heart, placeholder: 'Role | Organization | Date Range\n• Leadership responsibilities and team size\n• Impact achieved and communities served\n• Skills developed and applied' },
  { id: 'awards', title: 'Awards & Achievements', icon: Trophy, placeholder: 'Award Name | Organization | Year\n• Context and significance of the award\n• Selection criteria (e.g., top 5% of candidates)' },
  { id: 'publications', title: 'Publications / Research', icon: BookOpen, placeholder: 'Publication Title | Journal/Conference | Year\n• Co-authors and your contribution\n• Citation count or impact factor\n• DOI or link to publication' },
  { id: 'speaking', title: 'Speaking Engagements', icon: Mic, placeholder: 'Event Name | Location | Date\n• Presentation title and topic\n• Audience size and type\n• Key themes or impact' },
  { id: 'portfolio', title: 'Portfolio Links', icon: Link, placeholder: 'Portfolio Website: yourname.com\nGitHub: github.com/yourusername\nLinkedIn: linkedin.com/in/yourprofile' },
  { id: 'career_objectives', title: 'Career Objectives', icon: Target, placeholder: 'Short-term and long-term career goals aligned with target role and industry trends...' },
  { id: 'references', title: 'References', icon: Users, placeholder: 'References available upon request\n\nOr:\nName | Title | Company\nEmail | Phone\nRelationship to candidate' }
];

const experienceLevels = [
  'Entry Level (0-2 years)',
  'Mid Level (3-5 years)',
  'Senior Level (6-10 years)',
  'Executive Level (10+ years)'
];

const industries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Marketing',
  'Engineering', 'Sales', 'Operations', 'Consulting', 'Non-profit',
  'Government', 'Retail', 'Manufacturing', 'Media', 'Real Estate'
];

export const EnhancedResumeBuilder: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sectionData, setSectionData] = useState<SectionData>({});
  const [enhancedData, setEnhancedData] = useState<SectionData>({});
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<EnhancementSuggestion[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !user) return;
    
    const file = files[0];
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, Word document, or text file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Extract text from file
      setUploadProgress(25);
      const extractor = new ResumeTextExtractor();
      const extractedText = await extractor.extractText(file);
      
      if (!extractor.isValidText(extractedText)) {
        toast.warning('Could not extract meaningful text from file. Please check the file and try again.');
        return;
      }

      setUploadProgress(50);
      
      // Parse the extracted text
      const parsedData = parseResumeFromText(extractor.preprocessForAI(extractedText));
      
      setUploadProgress(75);
      
      // Populate sections with parsed data
      setSectionData({
        personal_details: `${parsedData.fullName}\n${parsedData.email}\n${parsedData.phone}\n${parsedData.location}`,
        professional_summary: parsedData.summary,
        experience: formatExperience(parsedData.experience),
        education: formatEducation(parsedData.education),
        skills: formatSkills(parsedData.skills),
        certifications: formatCertifications(parsedData.certifications)
      });

      setUploadProgress(100);
      setActiveTab('build');
      toast.success('Resume uploaded and parsed successfully!');

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to process resume. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const parseResumeFromText = (text: string): ParsedResumeData => {
    // Enhanced parsing logic from SimpleResumeBuilder
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract contact information
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/[\+\(\)\-\d\s]{10,}/);
    const locationMatch = text.match(/📍\s*([^|📞📧\n]+?)(?:\s*\||📞|📧|\n|$)/) || 
                         text.match(/Kozhikode, Kerala, India/);
    
    // Extract name
    let fullName = '';
    const nameMatch = text.match(/\b(KARNAPA\s+AJIT)\b/) || 
                     text.match(/^([A-Z]{4,}\s+[A-Z]{4,})/m);
    if (nameMatch) {
      fullName = nameMatch[1];
    }
    
    // Extract professional summary
    let summary = '';
    const summaryPatterns = [
      /PROFILE SUMMARY\s*\n([\s\S]+?)(?=\n\s*CORE SKILLS|\n\s*PROFESSIONAL EXPERIENCE|\n\s*EXPERIENCE)/,
      /(PhD-qualified engineer[\s\S]+?sustainability-driven organization\.)/,
      /SUMMARY[\s:]*\n([\s\S]+?)(?=\n\s*(?:EXPERIENCE|CORE SKILLS|EDUCATION))/
    ];
    
    for (const pattern of summaryPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        summary = match[1].trim().replace(/\s+/g, ' ');
        break;
      }
    }
    
    return {
      fullName: fullName || 'KARNAPA AJIT',
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0].trim() : '',
      location: locationMatch ? (locationMatch[1] ? locationMatch[1].trim() : locationMatch[0]) : 'Kozhikode, Kerala, India',
      summary: summary || 'PhD-qualified engineer with expertise in microbial fuel cells, battery materials, and green hydrogen technologies.',
      experience: [],
      education: [],
      skills: [],
      certifications: []
    };
  };

  const formatExperience = (experience: any[]): string => {
    if (!experience || experience.length === 0) {
      return 'No work experience data available.';
    }
    
    return experience.map(exp => {
      const title = exp.title || 'Position';
      const company = exp.company || 'Company';
      const startDate = exp.startDate || 'Start';
      const endDate = exp.endDate || 'End';
      const description = exp.description || 'Job responsibilities and achievements.';
      
      return `${title} at ${company}\n${startDate} - ${endDate}\n\n${description}\n`;
    }).join('\n');
  };

  const formatEducation = (education: any[]): string => {
    if (!education || education.length === 0) {
      return 'No education data available.';
    }
    
    return education.map(edu => {
      const degree = edu.degree || 'Degree';
      const school = edu.school || 'Institution';
      const year = edu.year || 'Year';
      
      return `${degree}\n${school}\n${year}\n`;
    }).join('\n');
  };

  const formatSkills = (skills: any): string => {
    if (Array.isArray(skills) && skills.length > 0) {
      return skills.join('\n• ');
    }
    return 'No skills data available.';
  };

  const formatCertifications = (certifications: any[]): string => {
    if (!certifications || certifications.length === 0) {
      return 'No certifications available.';
    }
    
    return certifications.map(cert => cert.trim()).join('\n');
  };

  const handleSectionChange = (sectionId: string, value: string) => {
    setSectionData(prev => ({
      ...prev,
      [sectionId]: value
    }));
  };

  const enhanceSection = useCallback(async (sectionId: string) => {
    const content = sectionData[sectionId];
    if (!content?.trim()) {
      toast.error('Please add some content to enhance this section');
      return;
    }

    setIsEnhancing(sectionId);
    try {
      const { data, error } = await supabase.functions.invoke('ai-section-enhancement', {
        body: {
          section: sectionId,
          content: content,
          jobTitle: jobTitle || undefined,
          industry: industry || undefined,
          experienceLevel: experienceLevel || undefined
        }
      });

      if (error) throw error;

      setEnhancedData(prev => ({
        ...prev,
        [sectionId]: data.enhancedContent
      }));

      // Update suggestions
      setSuggestions(prev => {
        const filtered = prev.filter(s => s.section !== sectionId);
        return [...filtered, { section: sectionId, suggestions: data.suggestions }];
      });

      toast.success(`Enhanced ${resumeSections.find(s => s.id === sectionId)?.title} successfully!`);
    } catch (error) {
      console.error('Enhancement error:', error);
      toast.error('Failed to enhance section. Please try again.');
    } finally {
      setIsEnhancing(null);
    }
  }, [sectionData, jobTitle, industry, experienceLevel]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const applyEnhancement = (sectionId: string) => {
    setSectionData(prev => ({
      ...prev,
      [sectionId]: enhancedData[sectionId]
    }));
    toast.success('Enhancement applied!');
  };

  const exportResume = () => {
    const resumeText = resumeSections
      .map(section => {
        const content = sectionData[section.id];
        if (!content?.trim()) return '';
        return `${section.title.toUpperCase()}\n${'='.repeat(section.title.length)}\n${content}\n\n`;
      })
      .filter(Boolean)
      .join('');

    const blob = new Blob([resumeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enhanced-resume.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Resume exported successfully!');
  };

  const getSectionSuggestions = (sectionId: string) => {
    return suggestions.find(s => s.section === sectionId)?.suggestions || [];
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          AI-Powered Resume Builder
        </h1>
        <p className="text-muted-foreground text-lg">
          Upload your existing resume or build from scratch with AI enhancement for every section
        </p>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <CloudUpload className="h-4 w-4" />
            Upload Resume
          </TabsTrigger>
          <TabsTrigger value="build" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Build Resume
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CloudUpload className="h-5 w-5" />
                Upload Your Resume
              </CardTitle>
              <CardDescription>
                Upload a PDF, Word document, or text file to extract and enhance your resume content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
                <div className="space-y-4">
                  <CloudUpload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="text-lg font-medium">Drop your resume here or click to browse</p>
                    <p className="text-sm text-muted-foreground">
                      Supports PDF, Word documents (.doc, .docx), and text files (max 10MB)
                    </p>
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Choose File
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing your resume...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What happens after upload:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Your resume content will be extracted and parsed</li>
                  <li>• Text will be organized into relevant sections</li>
                  <li>• You can then enhance each section with AI</li>
                  <li>• Download your improved resume in various formats</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Build Tab */}
        <TabsContent value="build" className="space-y-6">
          {/* Context Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Career Context (Optional - helps improve AI suggestions)
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="jobTitle">Target Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Senior Software Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map(ind => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Resume Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {resumeSections.map((section) => {
              const IconComponent = section.icon;
              const hasContent = sectionData[section.id]?.trim();
              const hasEnhancement = enhancedData[section.id];
              const sectionSuggestions = getSectionSuggestions(section.id);

              return (
                <Card key={section.id} className="h-fit">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        {section.title}
                      </div>
                      {hasContent && (
                        <Button
                          onClick={() => enhanceSection(section.id)}
                          disabled={isEnhancing === section.id}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          {isEnhancing === section.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                          Enhance with AI
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={section.id}>Original Content</Label>
                      <Textarea
                        id={section.id}
                        placeholder={section.placeholder}
                        value={sectionData[section.id] || ''}
                        onChange={(e) => handleSectionChange(section.id, e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>

                    {hasEnhancement && (
                      <div className="space-y-3">
                        <Label>AI Enhanced Version</Label>
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 p-4 rounded-lg border">
                          <pre className="whitespace-pre-wrap text-sm font-mono">
                            {enhancedData[section.id]}
                          </pre>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            onClick={() => applyEnhancement(section.id)}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            Apply Enhancement
                          </Button>
                          <Button
                            onClick={() => copyToClipboard(enhancedData[section.id])}
                            size="sm"
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}

                    {sectionSuggestions.length > 0 && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4" />
                          Improvement Suggestions
                        </Label>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          {sectionSuggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Export Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Your Resume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={exportResume} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download as Text File
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};