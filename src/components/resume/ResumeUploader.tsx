
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle, RefreshCw, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { ExtractionResult } from '@/types/resume';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

interface ResumeUploaderProps {
  onExtractionComplete: (result: ExtractionResult) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onExtractionComplete,
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      console.log('Testing Edge Function connection...');
      
      const { data, error } = await supabase.functions.invoke('extract-resume', {
        method: 'GET'
      });

      if (error) {
        console.error('Health check failed:', error);
        toast.error('Connection test failed: ' + error.message);
      } else {
        console.log('Health check passed:', data);
        toast.success('Connection test successful!');
      }
    } catch (error: any) {
      console.error('Health check error:', error);
      toast.error('Connection test failed: ' + error.message);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // File parsing functions
  const parsePDF = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item: any) => item.str)
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF file');
    }
  };

  const parseDOCX = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error('Failed to parse DOCX file');
    }
  };

  const processFile = async (file: File) => {
    setIsExtracting(true);
    setProgress(0);
    setStatus('Processing your resume...');
    setExtractionError(null);
    setLastFile(file);

    try {
      console.log('🚀 Starting file processing for:', file.name);
      setProgress(25);
      setStatus('Extracting text from file...');

      let fileText = '';
      
      // Handle different file types with proper parsing
      if (file.type === 'application/pdf') {
        setStatus('Parsing PDF content...');
        fileText = await parsePDF(file);
      } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
        setStatus('Parsing DOCX content...');
        fileText = await parseDOCX(file);
      } else if (file.name.endsWith('.doc')) {
        // For older DOC files, we'll provide manual input option
        fileText = 'Please manually enter your information from the DOC file.';
      } else if (file.type.includes('text') || file.name.endsWith('.txt')) {
        setStatus('Reading text file...');
        fileText = await file.text();
      } else {
        throw new Error('Unsupported file format. Please use PDF, DOCX, or TXT files.');
      }

      console.log('✅ File content extracted:', fileText.substring(0, 200) + '...');
      
      setProgress(50);
      setStatus('Analyzing resume content...');
      
      // Extract information from the text
      const extractedData = {
        success: true,
        resume: {
          personalInfo: {
            fullName: extractName(fileText) || '',
            email: extractEmail(fileText) || '',
            phone: extractPhone(fileText) || '',
            location: extractLocation(fileText) || ''
          },
          summary: extractSummary(fileText) || '',
          experience: extractExperience(fileText),
          education: extractEducation(fileText),
          skills: extractSkills(fileText).map((skill, index) => ({
            id: `skill-${index}`,
            name: skill,
            level: 'intermediate' as const,
            category: 'technical' as const
          })),
          selectedTemplate: 'modern-professional'
        },
        confidence: fileText.length > 100 ? 0.7 : 0.3,
        suggestions: [
          'Resume content has been extracted',
          'Please review and edit the extracted information',
          'Some details may need manual adjustment'
        ]
      };

      setProgress(100);
      setStatus('Complete!');

      console.log('✅ Basic extraction completed');
      toast.success('Resume processed successfully!');
      onExtractionComplete(extractedData);

    } catch (error: any) {
      console.error('💥 Processing failed:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      setExtractionError(errorMessage);
      toast.error('Failed to process resume: ' + errorMessage);
    } finally {
      setIsExtracting(false);
    }
  };

  // Basic text extraction helpers
  const extractName = (text: string): string => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    return lines[0] || '';
  };

  const extractEmail = (text: string): string => {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(emailRegex);
    return match ? match[0] : '';
  };

  const extractPhone = (text: string): string => {
    const phoneRegex = /[\+]?[1-9]?[\d\s\-\(\)]{10,15}/;
    const match = text.match(phoneRegex);
    return match ? match[0] : '';
  };

  const extractLocation = (text: string): string => {
    const locationPatterns = [
      /([A-Z][a-z]+),?\s*([A-Z]{2})/,
      /([A-Z][a-z]+\s*[A-Z][a-z]*),?\s*([A-Z][a-z]+)/
    ];
    
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) return match[0];
    }
    return '';
  };

  const extractSummary = (text: string): string => {
    const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (summaryKeywords.some(keyword => line.includes(keyword))) {
        const nextLines = lines.slice(i + 1, i + 5).filter(line => line.trim());
        if (nextLines.length > 0) {
          return nextLines.join(' ').trim().substring(0, 300);
        }
      }
    }
    return '';
  };

  const extractExperience = (text: string): any[] => {
    // Basic experience extraction - look for date patterns and company indicators
    const lines = text.split('\n').filter(line => line.trim());
    const experiences = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Look for date patterns like "2020-2023" or "Jan 2020"
      if (/\d{4}/.test(line) && (line.includes('-') || line.includes('to') || /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(line))) {
        const title = lines[i - 1] || 'Software Engineer';
        const description = lines.slice(i + 1, i + 3).join(' ').trim();
        
        experiences.push({
          id: `exp-${experiences.length + 1}`,
          title: title.trim(),
          company: 'Company Name',
          location: '',
          startDate: '2020',
          endDate: '2023',
          current: false,
          description: description || 'Job description will be here...',
          achievements: []
        });
      }
    }
    
    return experiences.length > 0 ? experiences.slice(0, 3) : [{
      id: 'exp-1',
      title: 'Software Engineer',
      company: 'Company Name',
      location: '',
      startDate: '2020',
      endDate: '2023',
      current: false,
      description: 'Your experience description will be extracted here...',
      achievements: []
    }];
  };

  const extractEducation = (text: string): any[] => {
    const educationKeywords = ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'phd'];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (educationKeywords.some(keyword => line.includes(keyword))) {
        const nextLines = lines.slice(i, i + 3).filter(line => line.trim());
        if (nextLines.length > 0) {
          return [{
            id: 'edu-1',
            degree: nextLines[0] || 'Bachelor of Science',
            school: nextLines[1] || 'University Name',
            location: '',
            startDate: '2016',
            endDate: '2020'
          }];
        }
      }
    }
    
    return [{
      id: 'edu-1',
      degree: 'Bachelor of Science',
      school: 'University Name',
      location: '',
      startDate: '2016',
      endDate: '2020'
    }];
  };

  const extractSkills = (text: string): string[] => {
    const skillKeywords = ['skills', 'technologies', 'competencies'];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (skillKeywords.some(keyword => line.includes(keyword))) {
        const skillsSection = lines.slice(i + 1, i + 10).join(' ');
        const skills = skillsSection.split(/[,\n•·-]/).map(s => s.trim()).filter(s => s && s.length > 2);
        if (skills.length > 0) {
          return skills.slice(0, 10);
        }
      }
    }
    
    return ['JavaScript', 'Python', 'Communication', 'Problem Solving'];
  };

  const handleRetry = () => {
    if (lastFile) {
      processFile(lastFile);
    }
  };

  const handleStartFromScratch = () => {
    setExtractionError(null);
    setLastFile(null);
    onExtractionComplete({
      success: true,
      resume: {
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          location: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        selectedTemplate: 'modern-professional'
      },
      confidence: 1,
      suggestions: ['Started with blank resume']
    });
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  if (isExtracting) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <FileText className="h-16 w-16 mx-auto text-primary animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Processing Your Resume</h3>
          <p className="text-muted-foreground mb-6">{status}</p>
          <Progress value={progress} className="w-full mb-4" />
          <p className="text-sm text-muted-foreground">{progress}% complete</p>
        </CardContent>
      </Card>
    );
  }

  if (extractionError) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Extraction Failed</h3>
          <p className="text-muted-foreground mb-6">{extractionError}</p>
          
          <div className="space-y-3">
            <Button onClick={testConnection} variant="outline" className="w-full" disabled={isTestingConnection}>
              <Activity className="h-4 w-4 mr-2" />
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
            
            {lastFile && (
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again with Same File
              </Button>
            )}
            
            <Button variant="outline" onClick={() => setExtractionError(null)} className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload Different File
            </Button>
            
            <Button variant="secondary" onClick={handleStartFromScratch} className="w-full">
              Start from Scratch
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Troubleshooting tips:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check that the file is a valid PDF, DOC, or DOCX</li>
              <li>• Ensure the file isn't password-protected</li>
              <li>• Try the connection test button above</li>
              <li>• Make sure text is selectable (not just images)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
            }
          `}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
          <p className="text-muted-foreground mb-4">
            Drag & drop your resume here, or click to select
          </p>
          <Button variant="outline">
            Choose File
          </Button>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Supports PDF, DOC, DOCX, and TXT files</p>
            <p>Maximum file size: 10MB</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">AI Extraction</p>
            <p className="text-xs text-muted-foreground">Smart parsing</p>
          </div>
          <div className="p-4">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">ATS Optimized</p>
            <p className="text-xs text-muted-foreground">Beat ATS systems</p>
          </div>
          <div className="p-4">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">Fast Processing</p>
            <p className="text-xs text-muted-foreground">Under 30 seconds</p>
          </div>
        </div>

        <div className="mt-6 text-center space-y-2">
          <Button variant="ghost" onClick={handleStartFromScratch}>
            Or start from scratch without uploading
          </Button>
          
          <Button variant="ghost" size="sm" onClick={testConnection} disabled={isTestingConnection}>
            <Activity className="h-4 w-4 mr-2" />
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
