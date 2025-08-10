import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { EditorResume, createEmptyEditorResume } from '@/types/editor-resume';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ResumeUploaderProps {
  onResumeExtracted: (extractedData: EditorResume) => void;
  onClose: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ 
  onResumeExtracted, 
  onClose 
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<EditorResume | null>(null);

  // Extract text from PDF
  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .filter((item: any) => 'str' in item)
        .map((item: any) => item.str)
        .join(' ');
      text += pageText + '\n';
    }
    
    return text;
  };

  // Extract text from DOCX
  const extractTextFromDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Extract text content based on file type
      let extractedText = '';
      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file);
      } else if (file.type.includes('word') || file.type.includes('doc')) {
        extractedText = await extractTextFromDOCX(file);
      }

      setUploadProgress(40);

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(`cv-uploads/temp/${fileName}`, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadProgress(60);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(uploadData.path);

      // Call cv-parser edge function with correct payload
      const { data: parsingResult, error: parsingError } = await supabase.functions.invoke('cv-parser', {
        body: {
          fileUrl: urlData.publicUrl,
          fileName: file.name,
          fileType: file.type,
          batchId: crypto.randomUUID(),
          extractedText: extractedText
        }
      });

      setUploadProgress(90);

      if (parsingError) {
        console.error('CV parsing error:', parsingError);
        throw new Error(`CV parsing failed: ${parsingError.message}`);
      }

      if (!parsingResult || !parsingResult.success) {
        console.error('CV parsing failed:', parsingResult);
        throw new Error('CV parsing failed: Invalid response from parser');
      }

      // Convert the parsed result to EditorResume format
      console.log('CV parsing result:', parsingResult);
      const parsedCV = parsingResult.parsedData || parsingResult.data;
      
      if (!parsedCV) {
        throw new Error('No parsed data received from CV parser');
      }
      
      const editorResume = convertParsedCVToEditor(parsedCV);
      
      setExtractedData(editorResume);
      setUploadProgress(100);
      toast.success('Resume parsed successfully!');

      // Clean up uploaded file
      await supabase.storage
        .from('documents')
        .remove([uploadData.path]);

    } catch (error: any) {
      console.error('Resume upload error:', error);
      toast.error(`Failed to parse resume: ${error.message || 'Please try again.'}`);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Convert parsed CV data to EditorResume format
  const convertParsedCVToEditor = (parsedCV: any): EditorResume => {
    const resume = createEmptyEditorResume();
    
    if (parsedCV?.personal_info) {
      resume.personalInfo = {
        fullName: parsedCV.personal_info.full_name || '',
        professionalTitle: parsedCV.personal_info.professional_title || '',
        email: parsedCV.personal_info.email || '',
        phone: parsedCV.personal_info.phone || '',
        location: parsedCV.personal_info.location || '',
        linkedin: parsedCV.personal_info.linkedin_url || '',
        github: parsedCV.personal_info.github_url || '',
        website: parsedCV.personal_info.portfolio_url || '',
        summary: parsedCV.professional_summary || '',
      };
    }

    if (parsedCV?.work_experience) {
      resume.experience = parsedCV.work_experience.map((exp: any, index: number) => ({
        id: `exp-${index}`,
        title: exp.position || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.start_date || '',
        endDate: exp.end_date === 'current' ? '' : (exp.end_date || ''),
        description: exp.responsibilities?.join('\n') || '',
        achievements: exp.key_achievements || [],
        technologies: [],
      }));
    }

    if (parsedCV?.education) {
      resume.education = parsedCV.education.map((edu: any, index: number) => ({
        id: `edu-${index}`,
        degree: edu.degree || '',
        institution: edu.institution || '',
        location: '',
        startDate: '',
        endDate: edu.graduation_date || '',
        description: edu.relevant_coursework?.join(', ') || '',
        achievements: edu.academic_projects || [],
      }));
    }

    if (parsedCV?.skills) {
      resume.skills = {
        technical: Array.isArray(parsedCV.skills) ? parsedCV.skills : [],
        soft: [],
        languages: parsedCV.languages || [],
        tools: [],
      };
    }

    if (parsedCV?.certifications) {
      resume.certifications = parsedCV.certifications.map((cert: string, index: number) => ({
        id: `cert-${index}`,
        name: cert,
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: '',
      }));
    }

    return resume;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const applyExtractedData = () => {
    if (extractedData) {
      onResumeExtracted(extractedData);
      toast.success('Resume data applied successfully!');
      onClose();
    }
  };

  const renderExtractedData = () => {
    if (!extractedData) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-5 w-5 mr-2" />
          <span className="font-medium">Resume parsed successfully!</span>
        </div>

        <div className="max-h-60 overflow-y-auto space-y-3">
          {/* Personal Info */}
          {extractedData.personalInfo && (
            <div>
              <h4 className="font-medium text-sm mb-2">Personal Information</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {extractedData.personalInfo.fullName && (
                  <p><strong>Name:</strong> {extractedData.personalInfo.fullName}</p>
                )}
                {extractedData.personalInfo.email && (
                  <p><strong>Email:</strong> {extractedData.personalInfo.email}</p>
                )}
                {extractedData.personalInfo.phone && (
                  <p><strong>Phone:</strong> {extractedData.personalInfo.phone}</p>
                )}
                {extractedData.personalInfo.location && (
                  <p><strong>Location:</strong> {extractedData.personalInfo.location}</p>
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          {extractedData.personalInfo.summary && (
            <div>
              <h4 className="font-medium text-sm mb-2">Summary</h4>
              <p className="text-sm text-muted-foreground">
                {extractedData.personalInfo.summary.length > 200 
                  ? `${extractedData.personalInfo.summary.substring(0, 200)}...`
                  : extractedData.personalInfo.summary
                }
              </p>
            </div>
          )}

          {/* Experience */}
          {extractedData.experience && extractedData.experience.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">
                Experience ({extractedData.experience.length} items)
              </h4>
              <div className="space-y-2">
                {extractedData.experience.slice(0, 2).map((exp: any, index: number) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    <p><strong>{exp.title}</strong> at {exp.company}</p>
                    <p>{exp.startDate} - {exp.endDate || 'Present'}</p>
                  </div>
                ))}
                {extractedData.experience.length > 2 && (
                  <p className="text-xs text-muted-foreground">
                    +{extractedData.experience.length - 2} more items
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {extractedData.skills && (
            <div>
              <h4 className="font-medium text-sm mb-2">
                Skills ({[...extractedData.skills.technical, ...extractedData.skills.soft, ...extractedData.skills.tools].length} items)
              </h4>
              <div className="flex flex-wrap gap-1">
                {[...extractedData.skills.technical, ...extractedData.skills.soft, ...extractedData.skills.tools].slice(0, 10).map((skill, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-muted text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
                {[...extractedData.skills.technical, ...extractedData.skills.soft, ...extractedData.skills.tools].length > 10 && (
                  <span className="px-2 py-1 bg-muted text-xs rounded">
                    +{[...extractedData.skills.technical, ...extractedData.skills.soft, ...extractedData.skills.tools].length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={applyExtractedData} className="flex-1">
            Apply to Resume
          </Button>
          <Button variant="outline" onClick={() => setExtractedData(null)}>
            Re-upload
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="h-5 w-5 mr-2" />
          Upload Existing Resume
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!extractedData ? (
          <>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive && "border-primary bg-primary/5",
                isUploading && "cursor-not-allowed opacity-50",
                !isDragActive && !isUploading && "border-muted-foreground/25 hover:border-primary"
              )}
            >
              <input {...getInputProps()} />
              
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                
                <div>
                  <p className="text-sm font-medium">
                    {isDragActive 
                      ? "Drop your resume here..." 
                      : "Drag & drop your resume, or click to browse"
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports PDF, DOC, and DOCX files (max 10MB)
                  </p>
                </div>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Processing resume...</span>
                  <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                <span>AI will extract and organize your resume data automatically</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                <span>Supports multiple file formats and layouts</span>
              </div>
            </div>
          </>
        ) : (
          renderExtractedData()
        )}
      </CardContent>
    </Card>
  );
};