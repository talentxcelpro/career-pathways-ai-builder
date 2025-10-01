import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  summary: string;
  work_experience: Array<{
    title: string;
    company: string;
    duration: string;
    location?: string;
    description?: string;
    achievements: string[];
    technologies_used?: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    duration: string;
    location?: string;
    gpa?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  skills: {
    technical: string[];
    tools: string[];
    soft: string[];
    languages: Array<{ language: string; proficiency: string }>;
  };
  confidence_score?: number;
  ats_score?: number;
}

export const useEnhancedParsing = () => {
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseStatus, setParseStatus] = useState<string>('');

  const parseResume = useCallback(async (file: File): Promise<ParsedResume | null> => {
    setIsParsing(true);
    setParseProgress(10);
    setParseStatus('Extracting text from document...');

    try {
      // Extract text based on file type
      let extractedText = '';
      
      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
      } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
        extractedText = await extractTextFromDOCX(file);
      } else if (file.type === 'text/plain') {
        extractedText = await file.text();
      } else {
        throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT files.');
      }

      setParseProgress(30);
      setParseStatus('AI parsing resume content...');

      // Call AI parser
      const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
        body: {
          extractedText,
          fileName: file.name
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Parsing failed');

      setParseProgress(80);
      setParseStatus('Validating and enhancing data...');

      // Enhanced validation and cleaning
      const parsedResume = data.data.structured_resume;
      const cleanedResume = cleanAndValidateResume(parsedResume, extractedText);

      setParseProgress(100);
      setParseStatus('Parsing complete!');

      toast.success(`Resume parsed successfully! Confidence: ${data.data.key_metrics.confidence_score}%`);

      return {
        ...cleanedResume,
        confidence_score: data.data.key_metrics.confidence_score,
        ats_score: data.data.ats_compatibility.score
      };

    } catch (error) {
      console.error('Enhanced parsing error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to parse resume');
      return null;
    } finally {
      setIsParsing(false);
      setTimeout(() => {
        setParseProgress(0);
        setParseStatus('');
      }, 2000);
    }
  }, []);

  return {
    parseResume,
    isParsing,
    parseProgress,
    parseStatus
  };
};

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

async function extractTextFromDOCX(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

function cleanAndValidateResume(resume: any, originalText: string): ParsedResume {
  // Clean name - aggressive name extraction
  let cleanedName = resume.name || '';
  
  // Remove job titles that might have been extracted as name
  const jobTitles = ['senior', 'junior', 'engineer', 'developer', 'manager', 'executive', 'analyst', 'specialist'];
  jobTitles.forEach(title => {
    cleanedName = cleanedName.replace(new RegExp(title, 'gi'), '');
  });
  
  // Handle spaced names (E M I N -> EMIN)
  if (cleanedName.match(/^[A-Z]\s+[A-Z]\s+[A-Z]/)) {
    cleanedName = cleanedName.replace(/\s+/g, '');
  }
  
  // If name is still invalid, extract from original text
  if (!cleanedName || cleanedName.length < 3 || cleanedName.length > 50) {
    const firstLine = originalText.split('\n')[0];
    const nameMatch = firstLine.match(/^([A-Z][a-z]+ [A-Z][a-z]+|[A-Z\s]+)/);
    if (nameMatch) {
      cleanedName = nameMatch[1].trim();
    }
  }

  // Clean email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = originalText.match(emailRegex);
  const cleanedEmail = resume.email || (emails && emails[0]) || '';

  // Clean phone
  const phoneRegex = /[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,6}/g;
  const phones = originalText.match(phoneRegex);
  const cleanedPhone = resume.phone || (phones && phones[0]) || '';

  // Clean skills - extract ALL skills
  const allSkills = extractAllSkills(originalText, resume.skills);

  // Clean experience achievements
  const cleanedExperience = (resume.work_experience || []).map((exp: any) => ({
    ...exp,
    achievements: (exp.achievements || [])
      .filter((a: string) => a && a.length > 10)
      .map((a: string) => a.trim())
  }));

  return {
    name: cleanedName.trim(),
    email: cleanedEmail.trim(),
    phone: cleanedPhone.trim(),
    location: (resume.location || '').trim(),
    linkedin: resume.linkedin || '',
    github: resume.github || '',
    portfolio: resume.portfolio || '',
    summary: (resume.summary || '').trim(),
    work_experience: cleanedExperience,
    education: resume.education || [],
    certifications: resume.certifications || [],
    skills: allSkills
  };
}

function extractAllSkills(text: string, existingSkills: any): ParsedResume['skills'] {
  const skillKeywords = {
    technical: ['React', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'SQL', 'MongoDB', 'AWS', 'Azure', 'GCP', 'AutoCAD', 'Revit', 'MATLAB'],
    tools: ['Git', 'Docker', 'Kubernetes', 'Jenkins', 'JIRA', 'Confluence', 'Slack', 'VS Code', 'IntelliJ', 'Excel', 'PowerPoint'],
    soft: ['Leadership', 'Communication', 'Problem-solving', 'Team collaboration', 'Project management', 'Analytical thinking'],
    languages: ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Hindi', 'Arabic']
  };

  const result: ParsedResume['skills'] = {
    technical: existingSkills?.technical || [],
    tools: existingSkills?.tools || [],
    soft: existingSkills?.soft || [],
    languages: existingSkills?.languages || []
  };

  // Extract additional skills from text
  Object.entries(skillKeywords).forEach(([category, keywords]) => {
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      if (regex.test(text)) {
        if (category === 'languages') {
          const existing = result.languages.find(l => l.language.toLowerCase() === keyword.toLowerCase());
          if (!existing) {
            result.languages.push({ language: keyword, proficiency: 'Proficient' });
          }
        } else {
          const arr = result[category as keyof typeof result];
          if (Array.isArray(arr) && !arr.some(s => s.toLowerCase() === keyword.toLowerCase())) {
            (arr as string[]).push(keyword);
          }
        }
      }
    });
  });

  return result;
}
