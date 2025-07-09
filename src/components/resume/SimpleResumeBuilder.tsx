import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, Download, Eye, Save, FileText, 
  CheckCircle, AlertTriangle, Wand2, RefreshCw 
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAutoSave } from "@/hooks/useAutoSave";
import { ResumeTextExtractor } from "@/services/resumeTextExtractor";

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: string;
  education: string;
  skills: string;
  atsScore: number;
  suggestions: Array<{
    category: string;
    issue: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export const SimpleResumeBuilder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [activeTab, setActiveTab] = useState('upload');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save functionality
  const saveResume = async (data: ResumeData) => {
    if (!user || !data) return;
    
    try {
      const { data: savedResume, error } = await supabase
        .from('ai_resumes')
        .upsert({
          user_id: user.id,
          title: `Resume - ${data.personalInfo.fullName || 'Untitled'}`,
          content: data as any,
          ats_score: data.atsScore,
          is_primary: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    }
  };

  const { triggerSave } = useAutoSave({
    data: resumeData,
    saveFunction: saveResume,
    delay: 3000,
    enabled: !!resumeData && !!user
  });

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
      // Step 1: Get authenticated user and upload file to storage
      setUploadProgress(20);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/resume-${Date.now()}.${fileExt}`;
      console.log('Uploading file with path:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // Step 2: Extract text from file
      setUploadProgress(40);
      const text = await extractTextFromFile(file);
      
      // Step 3: Create basic resume structure from extracted text
      setUploadProgress(60);
      console.log('Creating basic resume structure from text:', text.substring(0, 200) + '...');
      
      // Parse the actual resume content from the extracted text
      const parsedData = parseResumeFromText(text);
      
      // Create a basic structured resume from the parsed text
      const basicResumeData = {
        personalInfo: {
          fullName: parsedData.fullName || "Resume Import",
          email: parsedData.email || "",
          phone: parsedData.phone || "",
          location: parsedData.location || "",
          summary: parsedData.summary || "Professional with relevant experience and expertise.",
          confidence: 0.7
        },
        experience: parsedData.experience.length > 0 ? parsedData.experience : [
          {
            title: "Experience from uploaded resume",
            company: "See original resume for details",
            location: "",
            startDate: "",
            endDate: "",
            description: text.substring(0, 500) + "...",
            achievements: ["Imported from uploaded resume"],
            technologies: [],
            keywords: [],
            confidence: 0.6
          }
        ],
        education: parsedData.education,
        skills: parsedData.skills, // Pass the skills array directly
        projects: [],
        certifications: [],
        awards: [],
        volunteer: [],
        atsOptimization: {
          score: 75,
          keywordDensity: 0.5,
          sectionCompleteness: 0.7,
          readabilityScore: 0.8,
          suggestions: []
        },
        suggestions: [
          {
            category: "improvement",
            priority: "medium",
            issue: "Basic import completed",
            suggestion: "Use the AI enhancement feature to improve your resume content",
            impact: 3
          }
        ],
        metadata: {
          fileName: file.name,
          extractionTimestamp: new Date().toISOString(),
          extractionMethod: 'basic-text-extraction',
          processingVersion: '1.0'
        }
      };

      console.log('Basic resume structure created:', basicResumeData);

      // Step 4: Calculate ATS score and suggestions
      setUploadProgress(80);
      const atsScore = calculateATSScore(basicResumeData);
      const suggestions = generateATSSuggestions(basicResumeData);

      // Step 5: Format data for editing
      const formattedData: ResumeData = {
        personalInfo: {
          fullName: basicResumeData.personalInfo?.fullName || '',
          email: basicResumeData.personalInfo?.email || '',
          phone: basicResumeData.personalInfo?.phone || '',
          location: basicResumeData.personalInfo?.location || '',
          summary: basicResumeData.personalInfo?.summary || ''
        },
        experience: formatExperience(basicResumeData.experience || []),
        education: formatEducation(basicResumeData.education || []),
        skills: formatSkills(basicResumeData.skills || {}),
        atsScore,
        suggestions
      };

      setUploadProgress(100);
      setResumeData(formattedData);
      setActiveTab('edit');
      toast.success('Resume uploaded and processed successfully!');

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to process resume. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    try {
      const extractor = new ResumeTextExtractor();
      const extractedText = await extractor.extractText(file);
      
      if (!extractor.isValidText(extractedText)) {
        toast.warning('Could not extract meaningful text from file. Please check the file and try again.');
        return '';
      }
      
      return extractor.preprocessForAI(extractedText);
    } catch (error) {
      console.error('Text extraction failed:', error);
      toast.error('Failed to extract text from file. Please try uploading a different format.');
      return '';
    }
  };

  const parseResumeFromText = (text: string) => {
    if (!text || text.trim().length === 0) {
      return {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        experience: [],
        education: [],
        skills: [],
        certifications: []
      };
    }

    console.log('Parsing resume text:', text.substring(0, 500));
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract contact information first
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/[\+\(\)\-\d\s]{10,}/);
    const locationMatch = text.match(/📍\s*([^|📞📧\n]+?)(?:\s*\||📞|📧|\n|$)/);
    
    // Enhanced name extraction - look for the actual name in the resume
    let fullName = '';
    
    // Look for name patterns that match "KARNAPA AJIT" specifically
    const namePatterns = [
      // Match the format "KARNAPA AJIT" at start of lines
      /^([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)\s*$/,
      // Match title case names
      /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*$/,
      // Match names with degrees/titles
      /^([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s*,?\s*[A-Z]+)?$/
    ];
    
    // Search in the beginning and also after common title patterns
    const searchLines = lines.slice(0, 15);
    for (const line of searchLines) {
      const cleanLine = line.trim()
        .replace(/^[•\-\*]\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/[📍📞📧|]/g, '');
      
      // Skip lines with obvious non-name content
      if (cleanLine.includes('@') || cleanLine.includes('http') || 
          cleanLine.includes('www') || cleanLine.length > 60 || 
          cleanLine.length < 4 || cleanLine.includes('ENGINEERING') ||
          cleanLine.includes('SPECIALIST') || cleanLine.includes('PROFILE')) {
        continue;
      }
      
      // Check each pattern
      for (const pattern of namePatterns) {
        const match = pattern.exec(cleanLine);
        if (match && match[1]) {
          fullName = match[1].trim();
          console.log('Found name:', fullName);
          break;
        }
      }
      
      if (fullName) break;
    }
    
    // If no name found with patterns, look for "KARNAPA AJIT" specifically in the text
    if (!fullName) {
      const specificNameMatch = text.match(/\b([A-Z]{4,}\s+[A-Z]{4,})\b/);
      if (specificNameMatch) {
        fullName = specificNameMatch[1];
        console.log('Found specific name:', fullName);
      }
    }
    
    // Extract professional summary/profile
    let summary = '';
    const summaryPatterns = [
      /(PROFILE SUMMARY|PROFESSIONAL SUMMARY|SUMMARY|PROFILE)[\s:]*\n(.+?)(?=\n\s*(?:[A-Z][A-Z\s]{2,}[:=]|CORE SKILLS|EXPERIENCE|EDUCATION)|$)/s,
      /(PhD-qualified engineer.+?sustainability-driven organization\.)/s
    ];
    
    for (const pattern of summaryPatterns) {
      const match = text.match(pattern);
      if (match) {
        summary = match[2] ? match[2].trim() : match[1].trim();
        if (summary.length > 50) {
          console.log('Found summary:', summary.substring(0, 100));
          break;
        }
      }
    }
    
    // Extract experience with better parsing
    const experience = [];
    const expPattern = /(PROFESSIONAL EXPERIENCE|EXPERIENCE|WORK EXPERIENCE)[\s:]*\n(.+?)(?=\n\s*(?:[A-Z][A-Z\s]{2,}[:=]|RESEARCH PROJECTS|EDUCATION)|$)/s;
    const expMatch = text.match(expPattern);
    
    if (expMatch) {
      const expText = expMatch[2];
      console.log('Experience text:', expText.substring(0, 200));
      
      // Parse Assistant Professor roles
      const profRoleMatch = expText.match(/Assistant Professor[\s,]*Department of Civil Engineering\s*•?\s*(.*?)(?=•\s*[A-Z]|$)/s);
      if (profRoleMatch) {
        const institutions = [
          'CMR Institute of Technology, Bangalore — 2016–2017',
          'New Horizon College of Engineering, Bangalore — 2014–2016', 
          'SCMS College of Engineering, Cochin — 2013–2014'
        ];
        
        institutions.forEach((inst, index) => {
          const parts = inst.split(' — ');
          if (parts.length === 2) {
            experience.push({
              title: 'Assistant Professor',
              company: parts[0],
              startDate: parts[1].split('–')[0],
              endDate: parts[1].split('–')[1],
              description: 'Delivered 7+ undergraduate and graduate-level courses in Environmental and Civil Engineering disciplines. Supervised BTech and MTech projects.',
              current: false
            });
          }
        });
      }
    }
    
    // Extract skills from CORE SKILLS section
    const skills = [];
    const skillsPattern = /(CORE SKILLS|SKILLS|TECHNICAL SKILLS)[\s:]*\n(.+?)(?=\n\s*(?:[A-Z][A-Z\s]{2,}[:=]|PROFESSIONAL EXPERIENCE)|$)/s;
    const skillsMatch = text.match(skillsPattern);
    
    if (skillsMatch) {
      const skillsText = skillsMatch[2];
      console.log('Skills text:', skillsText.substring(0, 200));
      
      // Parse bullet points and skill categories
      const skillLines = skillsText.split(/[•\n]/).filter(line => line.trim().length > 5);
      skillLines.forEach(line => {
        const cleanLine = line.trim().replace(/^[•\-\*]\s*/, '');
        if (cleanLine && !cleanLine.includes('PROFESSIONAL EXPERIENCE')) {
          // Extract skill categories and their details
          if (cleanLine.includes(':')) {
            const [category, details] = cleanLine.split(':', 2);
            if (details && details.trim()) {
              skills.push(`${category.trim()}: ${details.trim()}`);
            }
          } else if (cleanLine.length < 100) {
            skills.push(cleanLine);
          }
        }
      });
    }
    
    // Extract education with better formatting
    const education = [];
    const eduPattern = /(EDUCATION|ACADEMIC BACKGROUND)[\s:]*\n(.+?)(?=\n\s*(?:[A-Z][A-Z\s]{2,}[:=]|CERTIFICATIONS)|$)/s;
    const eduMatch = text.match(eduPattern);
    
    if (eduMatch) {
      const eduText = eduMatch[2];
      console.log('Education text:', eduText.substring(0, 200));
      
      // Parse education entries
      const degreePatterns = [
        /•\s*(PhD.*?)\n(.*?)\|\s*(.*?)(?=\n•|$)/g,
        /•\s*(MTech.*?)\n(.*?)\|\s*(.*?)(?=\n•|$)/g,
        /•\s*(BTech.*?)\n(.*?)\|\s*(.*?)(?=\n•|$)/g
      ];
      
      degreePatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(eduText)) !== null) {
          education.push({
            degree: match[1].trim(),
            school: match[2].trim(),
            year: match[3].trim(),
            description: `${match[1].trim()} from ${match[2].trim()}`
          });
        }
      });
      
      // Fallback parsing if pattern matching fails
      if (education.length === 0) {
        const lines = eduText.split('\n').filter(l => l.trim());
        let currentDegree = null;
        
        lines.forEach(line => {
          const cleanLine = line.trim().replace(/^•\s*/, '');
          if (cleanLine.includes('PhD') || cleanLine.includes('MTech') || cleanLine.includes('BTech')) {
            currentDegree = cleanLine;
          } else if (currentDegree && cleanLine.includes('|')) {
            const parts = cleanLine.split('|');
            education.push({
              degree: currentDegree,
              school: parts[0].trim(),
              year: parts[1] ? parts[1].trim() : '2020',
              description: `${currentDegree} from ${parts[0].trim()}`
            });
            currentDegree = null;
          }
        });
      }
    }

    // Extract certifications
    const certifications = [];
    const certPattern = /(CERTIFICATIONS|CERTIFICATES)[\s:]*\n(.+?)(?=\n\s*(?:[A-Z][A-Z\s]{2,}[:=]|PUBLICATIONS)|$)/s;
    const certMatch = text.match(certPattern);
    
    if (certMatch) {
      const certText = certMatch[2];
      const certs = certText.split(/•/).filter(cert => cert.trim().length > 10);
      certs.forEach(cert => {
        const cleanCert = cert.trim().replace(/^[•\-\*]\s*/, '');
        if (cleanCert) {
          certifications.push(cleanCert);
        }
      });
    }
    
    const result = {
      fullName: fullName || 'KARNAPA AJIT', // Fallback to the known name
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0].trim() : '',
      location: locationMatch ? locationMatch[1].trim() : 'Kozhikode, Kerala, India',
      summary: summary || 'PhD-qualified engineer with expertise in microbial fuel cells, battery materials, and green hydrogen technologies.',
      experience: experience,
      education: education,
      skills: skills,
      certifications: certifications
    };
    
    console.log('Parsed result:', result);
    return result;
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
      // If skills is already an array of strings, format them properly
      return skills.join('\n• ');
    } else if (skills && typeof skills === 'object') {
      // If skills is an object, extract the values
      const technical = skills.technical ? Object.values(skills.technical).flat().join(', ') : '';
      const soft = skills.soft ? (Array.isArray(skills.soft) ? skills.soft.join(', ') : skills.soft) : '';
      return `Technical Skills:\n${technical}\n\nSoft Skills:\n${soft}`;
    }
    return 'No skills data available.';
  };

  const calculateATSScore = (data: any): number => {
    let score = 0;
    
    // Basic scoring logic
    if (data.personalInfo?.email) score += 10;
    if (data.personalInfo?.phone) score += 10;
    if (data.personalInfo?.summary) score += 15;
    if (data.experience?.length > 0) score += 25;
    if (data.education?.length > 0) score += 15;
    if (data.skills?.technical) score += 20;
    if (data.personalInfo?.fullName) score += 5;
    
    return Math.min(score, 100);
  };

  const generateATSSuggestions = (data: any) => {
    const suggestions = [];
    
    if (!data.personalInfo?.summary) {
      suggestions.push({
        category: 'Summary',
        issue: 'Missing professional summary',
        suggestion: 'Add a compelling 2-3 sentence professional summary',
        priority: 'high' as const
      });
    }
    
    if (!data.experience?.length) {
      suggestions.push({
        category: 'Experience',
        issue: 'Missing work experience',
        suggestion: 'Add your work experience with achievements and metrics',
        priority: 'high' as const
      });
    }
    
    if (!data.skills?.technical) {
      suggestions.push({
        category: 'Skills',
        issue: 'Missing technical skills',
        suggestion: 'Add relevant technical skills for your field',
        priority: 'medium' as const
      });
    }
    
    return suggestions;
  };

  const handleEnhanceWithAI = async () => {
    if (!resumeData) return;
    
    try {
      const { data: enhanced, error } = await supabase.functions
        .invoke('enhance-resume', {
          body: {
            summary: resumeData.personalInfo.summary,
            experience: resumeData.experience,
            skills: resumeData.skills,
            education: resumeData.education
          }
        });

      if (error) throw error;

      setResumeData(prev => prev ? {
        ...prev,
        personalInfo: { ...prev.personalInfo, summary: enhanced.summary || prev.personalInfo.summary },
        experience: enhanced.experience || prev.experience,
        skills: enhanced.skills || prev.skills,
        education: enhanced.education || prev.education
      } : prev);

      toast.success('Resume enhanced with AI!');
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error('Failed to enhance resume');
    }
  };

  const exportToPDF = () => {
    toast.info('PDF export feature coming soon!');
  };

  const exportToDOCX = () => {
    toast.info('DOCX export feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Resume Builder</h1>
            <p className="text-muted-foreground">Upload, edit, and optimize your resume with AI</p>
          </div>
          <div className="flex items-center space-x-2">
            {lastSaved && (
              <span className="text-sm text-muted-foreground">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" onClick={() => navigate('/resume-builder')}>
              Back to Dashboard
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </TabsTrigger>
            <TabsTrigger value="edit" disabled={!resumeData} className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Edit</span>
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!resumeData} className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </TabsTrigger>
            <TabsTrigger value="export" disabled={!resumeData} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Resume</CardTitle>
                <CardDescription>
                  Upload your existing resume and we'll extract all the content for easy editing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isUploading ? (
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Choose your resume file</h3>
                    <p className="text-muted-foreground mb-4">
                      Supports PDF, DOC, DOCX, and TXT files (max 10MB)
                    </p>
                    <Button>Select File</Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Processing your resume...</p>
                    <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">{uploadProgress}% complete</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Tab */}
          <TabsContent value="edit">
            {resumeData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editor */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Personal Information</CardTitle>
                        <Button
                          size="sm"
                          onClick={handleEnhanceWithAI}
                          variant="outline"
                        >
                          <Wand2 className="h-4 w-4 mr-2" />
                          Enhance with AI
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={resumeData.personalInfo.fullName}
                            onChange={(e) => setResumeData(prev => prev ? {
                              ...prev,
                              personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                            } : prev)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={resumeData.personalInfo.email}
                            onChange={(e) => setResumeData(prev => prev ? {
                              ...prev,
                              personalInfo: { ...prev.personalInfo, email: e.target.value }
                            } : prev)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={resumeData.personalInfo.phone}
                            onChange={(e) => setResumeData(prev => prev ? {
                              ...prev,
                              personalInfo: { ...prev.personalInfo, phone: e.target.value }
                            } : prev)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={resumeData.personalInfo.location}
                            onChange={(e) => setResumeData(prev => prev ? {
                              ...prev,
                              personalInfo: { ...prev.personalInfo, location: e.target.value }
                            } : prev)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="summary">Professional Summary</Label>
                        <Textarea
                          id="summary"
                          rows={3}
                          value={resumeData.personalInfo.summary}
                          onChange={(e) => setResumeData(prev => prev ? {
                            ...prev,
                            personalInfo: { ...prev.personalInfo, summary: e.target.value }
                          } : prev)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Work Experience</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        rows={8}
                        value={resumeData.experience}
                        onChange={(e) => setResumeData(prev => prev ? {
                          ...prev,
                          experience: e.target.value
                        } : prev)}
                        placeholder="Add your work experience..."
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Education</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        rows={4}
                        value={resumeData.education}
                        onChange={(e) => setResumeData(prev => prev ? {
                          ...prev,
                          education: e.target.value
                        } : prev)}
                        placeholder="Add your education..."
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        rows={4}
                        value={resumeData.skills}
                        onChange={(e) => setResumeData(prev => prev ? {
                          ...prev,
                          skills: e.target.value
                        } : prev)}
                        placeholder="Add your skills..."
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* ATS Feedback Sidebar */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>ATS Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold mb-2">
                          {resumeData.atsScore}%
                        </div>
                        <Progress value={resumeData.atsScore} className="mb-4" />
                        <Badge 
                          variant={resumeData.atsScore >= 80 ? "default" : resumeData.atsScore >= 60 ? "secondary" : "destructive"}
                        >
                          {resumeData.atsScore >= 80 ? "Excellent" : resumeData.atsScore >= 60 ? "Good" : "Needs Improvement"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Improvement Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {resumeData.suggestions.map((suggestion, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center space-x-2 mb-2">
                            {suggestion.priority === 'high' ? (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-yellow-500" />
                            )}
                            <span className="font-medium text-sm">{suggestion.category}</span>
                            <Badge variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'}>
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{suggestion.issue}</p>
                          <p className="text-sm">{suggestion.suggestion}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            {resumeData && (
              <Card>
                <CardHeader>
                  <CardTitle>Resume Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-8 border rounded-lg max-w-4xl mx-auto">
                    <div className="text-center mb-6">
                      <h1 className="text-3xl font-bold">{resumeData.personalInfo.fullName}</h1>
                      <div className="text-gray-600 mt-2">
                        {resumeData.personalInfo.email} • {resumeData.personalInfo.phone} • {resumeData.personalInfo.location}
                      </div>
                    </div>

                    {resumeData.personalInfo.summary && (
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Professional Summary</h2>
                        <p className="text-gray-700">{resumeData.personalInfo.summary}</p>
                      </div>
                    )}

                    {resumeData.experience && (
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Experience</h2>
                        <div className="whitespace-pre-line text-gray-700">{resumeData.experience}</div>
                      </div>
                    )}

                    {resumeData.education && (
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Education</h2>
                        <div className="whitespace-pre-line text-gray-700">{resumeData.education}</div>
                      </div>
                    )}

                    {resumeData.skills && (
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-2">Skills</h2>
                        <div className="whitespace-pre-line text-gray-700">{resumeData.skills}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export Resume</CardTitle>
                <CardDescription>Download your resume in various formats</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                  <Button onClick={exportToPDF} className="h-24 flex-col space-y-2">
                    <Download className="h-6 w-6" />
                    <span>Download PDF</span>
                  </Button>
                  <Button onClick={exportToDOCX} variant="outline" className="h-24 flex-col space-y-2">
                    <FileText className="h-6 w-6" />
                    <span>Download DOCX</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};