import { supabase } from "@/integrations/supabase/client";

export interface ParsedResume {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
}

/**
 * Parse a resume file using AI
 * Extracts structured data from PDF, DOCX, DOC, or TXT files
 */
export const parseResumeFile = async (file: File): Promise<ParsedResume> => {
  try {
    console.log('🚀 Starting resume parsing for:', file.name, 'Type:', file.type, 'Size:', file.size);
    
    // Extract text from the file first
    let extractedText = '';
    
    // Check file extension as fallback
    const fileName = file.name.toLowerCase();
    const isPDF = file.type.includes('pdf') || fileName.endsWith('.pdf');
    const isDOCX = file.type.includes('word') || 
                   file.type.includes('document') || 
                   file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                   file.type === 'application/msword' ||
                   fileName.endsWith('.docx') || 
                   fileName.endsWith('.doc');
    
    if (isPDF) {
      // For PDF files, use pdfjs-dist
      console.log('📄 Processing PDF file...');
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        
        const arrayBuffer = await file.arrayBuffer();
        console.log('📄 PDF ArrayBuffer size:', arrayBuffer.byteLength);
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        console.log('📄 PDF loaded, pages:', pdf.numPages);
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
          console.log(`📄 Page ${i} extracted, length: ${pageText.length}`);
        }
        extractedText = fullText;
        console.log('✅ PDF extraction complete, total length:', extractedText.length);
      } catch (pdfError) {
        console.error('❌ PDF extraction failed:', pdfError);
        throw new Error(`Failed to extract text from PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
      }
    } else if (isDOCX) {
      // For DOCX files
      console.log('📝 Processing DOCX file with multiple extraction attempts...');
      try {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        console.log('📝 DOCX ArrayBuffer size:', arrayBuffer.byteLength);
        
        // Try extractRawText first
        console.log('📝 Attempting mammoth.extractRawText...');
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
        console.log('✅ DOCX extraction complete, length:', extractedText.length);
        
        // If extraction yielded very little, log warning
        if (extractedText.length < 10) {
          console.warn('⚠️ DOCX extraction yielded very little text:', extractedText);
          
          // Try convertToHtml as fallback
          console.log('📝 Attempting mammoth.convertToHtml as fallback...');
          const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
          console.log('📝 HTML conversion result length:', htmlResult.value.length);
          
          // Strip HTML tags to get text
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlResult.value;
          const textFromHtml = tempDiv.textContent || tempDiv.innerText || '';
          console.log('📝 Text from HTML length:', textFromHtml.length);
          
          if (textFromHtml.length > extractedText.length) {
            extractedText = textFromHtml;
            console.log('✅ Using HTML-extracted text instead');
          }
        }
      } catch (docxError) {
        console.error('❌ DOCX extraction failed:', docxError);
        throw new Error(`Failed to extract text from DOCX: ${docxError instanceof Error ? docxError.message : 'Unknown error'}`);
      }
    } else if (file.type === 'text/plain') {
      // For text files
      console.log('📝 Processing text file...');
      extractedText = await file.text();
      console.log('✅ Text file read, length:', extractedText.length);
    } else {
      console.warn('⚠️ Unsupported file type:', file.type);
      throw new Error(`Unsupported file type: ${file.type}. Please upload PDF, DOCX, or TXT files.`);
    }

    console.log('📋 Extracted text length:', extractedText.length);
    console.log('📋 First 200 chars:', extractedText.substring(0, 200));

    // Call the AI resume parser edge function with extracted text
    const { data, error } = await supabase.functions.invoke('ai-resume-parser', {
      body: {
        extractedText: extractedText,
        fileName: file.name
      }
    });

    if (error) {
      console.error('Resume parsing error:', error);
      throw new Error(error.message || 'Failed to parse resume');
    }

    if (!data.success) {
      throw new Error(data.error || 'Parsing failed');
    }

    console.log('✅ AI parsing completed successfully');
    console.log('📊 Parsed resume data:', data.data);

    // Transform the AI response to match the expected ParsedResume format
    const aiResume = data.data?.structured_resume;
    
    if (!aiResume) {
      throw new Error('No structured resume data returned from AI');
    }

    // Map AI response to ParsedResume interface
    const parsedResume: ParsedResume = {
      personalInfo: {
        fullName: aiResume.name || '',
        email: aiResume.email || '',
        phone: aiResume.phone || '',
        location: aiResume.location || '',
        linkedin: aiResume.linkedin,
        website: aiResume.portfolio || aiResume.github
      },
      summary: aiResume.summary,
      experience: (aiResume.work_experience || []).map((exp: any, index: number) => ({
        id: `exp-${index}`,
        title: exp.title || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.duration?.split('-')[0]?.trim() || '',
        endDate: exp.duration?.split('-')[1]?.trim() || 'Present',
        current: exp.duration?.toLowerCase().includes('present') || false,
        description: exp.description || '',
        achievements: exp.achievements || []
      })),
      education: (aiResume.education || []).map((edu: any, index: number) => ({
        id: `edu-${index}`,
        degree: edu.degree || '',
        school: edu.institution || '',
        location: edu.location || '',
        startDate: edu.duration?.split('-')[0]?.trim() || '',
        endDate: edu.duration?.split('-')[1]?.trim() || '',
        gpa: edu.gpa
      })),
      skills: {
        technical: Array.isArray(aiResume.skills?.technical) 
          ? aiResume.skills.technical 
          : Object.values(aiResume.skills || {}).flat(),
        soft: aiResume.skills?.soft || [],
        languages: (aiResume.languages || []).map((lang: any) => 
          typeof lang === 'string' ? lang : lang.language
        )
      },
      certifications: aiResume.certifications || [],
      projects: aiResume.projects || []
    };

    console.log('✅ Resume transformation complete:', parsedResume);
    return parsedResume;

  } catch (error) {
    console.error('Error parsing resume:', error);
    
    // Return empty structure as fallback
    return {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: ''
      },
      experience: [],
      education: [],
      skills: {
        technical: [],
        soft: [],
        languages: []
      }
    };
  }
};

/**
 * Extract text from a file for AI processing
 */
export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type;

  // For text files, read directly
  if (fileType === 'text/plain') {
    return await file.text();
  }

  // For PDF and DOCX, we'll need the edge function to handle extraction
  // Return empty string here and let the edge function handle it
  return '';
};

/**
 * Validate parsed resume data
 */
export const validateParsedResume = (data: ParsedResume): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields
  if (!data.personalInfo?.fullName) {
    errors.push('Full name is required');
  }
  if (!data.personalInfo?.email) {
    warnings.push('Email is missing - highly recommended');
  }
  if (!data.personalInfo?.phone) {
    warnings.push('Phone number is missing');
  }

  // Check for content
  if (data.experience.length === 0) {
    warnings.push('No work experience found');
  }
  if (data.education.length === 0) {
    warnings.push('No education found');
  }
  if (data.skills.technical.length === 0 && data.skills.soft.length === 0) {
    warnings.push('No skills found');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};
