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
      // Step 1: Upload file to storage
      setUploadProgress(20);
      const fileName = `resume-${Date.now()}.${file.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Step 2: Extract text from file
      setUploadProgress(40);
      const text = await extractTextFromFile(file);
      
      // Step 3: Process with AI
      setUploadProgress(60);
      const { data: extractedData, error: extractionError } = await supabase.functions
        .invoke('ai-resume-extraction', {
          body: {
            text,
            fileName: file.name,
            fileType: file.type,
            extractionLevel: 'comprehensive'
          }
        });

      if (extractionError) throw extractionError;

      // Step 4: Calculate ATS score and suggestions
      setUploadProgress(80);
      const atsScore = calculateATSScore(extractedData);
      const suggestions = generateATSSuggestions(extractedData);

      // Step 5: Format data for editing
      const formattedData: ResumeData = {
        personalInfo: {
          fullName: extractedData.personalInfo?.fullName || '',
          email: extractedData.personalInfo?.email || '',
          phone: extractedData.personalInfo?.phone || '',
          location: extractedData.personalInfo?.location || '',
          summary: extractedData.personalInfo?.summary || ''
        },
        experience: formatExperience(extractedData.experience || []),
        education: formatEducation(extractedData.education || []),
        skills: formatSkills(extractedData.skills || {}),
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
    if (file.type === 'text/plain') {
      return await file.text();
    }
    
    // For PDF and Word files, we'll use a simple approach
    // In a real implementation, you'd use proper libraries
    const formData = new FormData();
    formData.append('file', file);
    
    // Simple text extraction - for demo purposes
    return `Sample text extracted from ${file.name}. In a real implementation, this would contain the actual file content.`;
  };

  const formatExperience = (experience: any[]): string => {
    return experience.map(exp => 
      `${exp.title || 'Position'} at ${exp.company || 'Company'}\n${exp.startDate || 'Start'} - ${exp.endDate || 'End'}\n${exp.description || 'Job description...'}\n`
    ).join('\n');
  };

  const formatEducation = (education: any[]): string => {
    return education.map(edu => 
      `${edu.degree || 'Degree'} from ${edu.school || 'School'}\n${edu.startDate || 'Start'} - ${edu.endDate || 'End'}\n`
    ).join('\n');
  };

  const formatSkills = (skills: any): string => {
    const technical = skills.technical ? Object.values(skills.technical).flat().join(', ') : '';
    const soft = skills.soft ? skills.soft.join(', ') : '';
    return `Technical Skills: ${technical}\nSoft Skills: ${soft}`;
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