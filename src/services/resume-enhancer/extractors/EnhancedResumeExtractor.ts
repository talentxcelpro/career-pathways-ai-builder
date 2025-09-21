import { EnhancedExtractedContent } from '../interfaces/EnhancedExtractedContent';
import { supabase } from "@/integrations/supabase/client";
// import * as mammoth from 'mammoth'; // Removed - using lazy loading instead
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class EnhancedResumeExtractor {
  private readonly SUPPORTED_FORMATS = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  async extractFromFile(file: File): Promise<EnhancedExtractedContent> {
    console.log('🔍 Starting enhanced content extraction for:', file.name);
    
    if (!this.SUPPORTED_FORMATS.includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    try {
      let text = '';
      let extractionMethod: 'pdf' | 'docx' | 'ocr' | 'manual' = 'manual';

      // Extract text based on file type
      if (file.type === 'application/pdf') {
        text = await this.extractFromPDF(file);
        extractionMethod = 'pdf';
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await this.extractFromDOCX(file);
        extractionMethod = 'docx';
      } else if (file.type === 'application/msword') {
        text = await this.extractFromDOC(file);
        extractionMethod = 'docx';
      } else if (file.type.startsWith('image/')) {
        text = await this.extractFromImage(file);
        extractionMethod = 'ocr';
      } else {
        text = await this.extractFromText(file);
        extractionMethod = 'manual';
      }

      console.log('📝 Extracted text length:', text.length);
      
      // Use the new comprehensive resume enhancement system
      if (text.length > 50) {
        console.log('🤖 Using comprehensive AI resume enhancement system...');
        try {
          const { data, error } = await supabase.functions.invoke('enhance-resume', {
            body: { 
              resumeText: text,
              fileName: file.name,
              targetRole: undefined, // Can be passed from UI later
              jobDescription: undefined, // Can be passed from UI later
              userId: null
            }
          });

          if (error) {
            console.error('❌ Enhancement AI error:', error);
            throw error;
          }

          if (data?.success && data?.data) {
            console.log('✅ AI enhancement successful with score:', data.data.atsOptimization?.score);
            return this.convertToEnhancedFormat(data.data);
          } else {
            console.warn('⚠️ AI enhancement returned no data, falling back to basic parsing');
            throw new Error('AI enhancement returned no data');
          }
        } catch (aiError) {
          console.warn('⚠️ AI enhancement failed, falling back to basic parsing:', aiError);
          // Fall back to basic parsing if AI enhancement fails
          const extractedContent = this.parseResumeText(text, extractionMethod);
          return extractedContent;
        }
      } else {
        // For very short text, use basic parsing
        const extractedContent = this.parseResumeText(text, extractionMethod);
        return extractedContent;
      }
    } catch (error) {
      console.error('❌ Extraction failed:', error);
      return this.getDefaultContent();
    }
  }

  private convertToEnhancedFormat(aiData: any): EnhancedExtractedContent {
    return {
      personalInfo: {
        fullName: aiData.personalInfo?.fullName || '',
        email: aiData.personalInfo?.email || '',
        phone: aiData.personalInfo?.phone || '',
        location: aiData.personalInfo?.location || '',
        linkedin: aiData.personalInfo?.linkedin || '',
        website: aiData.personalInfo?.website || ''
      },
      professionalSummary: {
        content: aiData.personalInfo?.summary || '',
        careerBackground: '',
        keySkills: [],
        targetRoles: [],
        goals: ''
      },
      experience: aiData.experience?.map((exp: any, index: number) => ({
        id: `exp-${index}`,
        jobTitle: exp.title || '',
        companyName: exp.company || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        responsibilities: exp.responsibilities || exp.description || [],
        achievements: exp.achievements || [],
        skillsUsed: exp.technologies || [],
        tools: []
      })) || [],
      education: aiData.education?.map((edu: any, index: number) => ({
        id: `edu-${index}`,
        degree: edu.degree || '',
        institutionName: edu.school || edu.institution || '',
        location: edu.location || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        grade: edu.gpa || edu.grade || '',
        percentage: '',
        cgpa: edu.gpa || '',
        honors: edu.honors || '',
        coursework: edu.coursework || []
      })) || [],
      skills: {
        technical: aiData.skills?.technical?.map((skill: any) => ({
          skill: typeof skill === 'string' ? skill : skill.skill || '',
          proficiency: skill.proficiency || 'intermediate' as const,
          category: skill.category || 'general'
        })) || [],
        soft: aiData.skills?.soft?.map((skill: any) => ({
          skill: typeof skill === 'string' ? skill : skill.skill || '',
          proficiency: skill.proficiency || 'intermediate' as const
        })) || [],
        languages: aiData.skills?.languages?.map((lang: any) => ({
          language: typeof lang === 'string' ? lang : lang.language || '',
          proficiency: lang.proficiency || 'conversational' as const
        })) || []
      },
      certifications: aiData.certifications?.map((cert: any, index: number) => ({
        id: `cert-${index}`,
        name: typeof cert === 'string' ? cert : cert.name || '',
        issuingOrganization: cert.issuer || '',
        issueDate: cert.date || '',
        expiryDate: cert.expiryDate || '',
        credentialId: cert.credentialId || '',
        credentialUrl: cert.url || ''
      })) || [],
      projects: aiData.projects?.map((proj: any, index: number) => ({
        id: `proj-${index}`,
        title: proj.title || '',
        description: proj.description || '',
        technologies: proj.technologies || [],
        startDate: proj.startDate || '',
        endDate: proj.endDate || '',
        githubUrl: proj.github || proj.githubUrl || '',
        liveUrl: proj.url || proj.liveUrl || '',
        role: proj.role || '',
        achievements: proj.achievements || []
      })) || [],
      languages: aiData.languages?.map((lang: any) => ({
        language: typeof lang === 'string' ? lang : lang.language || '',
        proficiency: lang.proficiency || 'conversational' as const,
        certifications: lang.certifications || []
      })) || [],
      awards: aiData.awards?.map((award: any, index: number) => ({
        id: `award-${index}`,
        name: typeof award === 'string' ? award : award.name || '',
        issuer: award.issuer || '',
        date: award.date || '',
        description: award.description || '',
        context: award.context || ''
      })) || [],
      hobbies: aiData.hobbies?.map((hobby: any) => ({
        category: typeof hobby === 'string' ? 'Interests' : hobby.category || 'Interests',
        items: typeof hobby === 'string' ? [hobby] : hobby.items || []
      })) || [],
      additional: {
        declaration: aiData.additional?.declaration || '',
        references: aiData.additional?.references || [],
        availableUponRequest: aiData.additional?.availableUponRequest || false
      },
      metadata: {
        extractionMethod: 'ai-parser',
        processingDate: new Date().toISOString(),
        completionPercentage: aiData.metadata?.completionPercentage || 0
      }
    };
  }

  private async extractFromPDF(file: File): Promise<string> {
    console.log('📄 Extracting from PDF...');
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const numPages = pdf.numPages;
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  }

  private async extractFromDOCX(file: File): Promise<string> {
    console.log('📄 Extracting from DOCX...');
    
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  private async extractFromDOC(file: File): Promise<string> {
    console.log('📄 Extracting from DOC...');
    
    // For older .doc files, we'll try to read as text
    // In production, you might want to use a more sophisticated parser
    const text = await file.text();
    return text;
  }

  private async extractFromImage(file: File): Promise<string> {
    console.log('🖼️ Extracting from image using OCR...');
    
    const { data: { text } } = await Tesseract.recognize(file, 'eng', {
      logger: (m) => console.log('OCR:', m)
    });
    
    return text;
  }

  private async extractFromText(file: File): Promise<string> {
    console.log('📝 Extracting from text file...');
    return await file.text();
  }

  private parseResumeText(text: string, extractionMethod: 'pdf' | 'docx' | 'ocr' | 'manual'): EnhancedExtractedContent {
    console.log('🔄 Parsing resume text...');
    
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    return {
      personalInfo: this.extractPersonalInfo(text, lines),
      professionalSummary: this.extractProfessionalSummary(text, lines),
      experience: this.extractExperience(text, lines),
      education: this.extractEducation(text, lines),
      skills: this.extractSkills(text, lines),
      certifications: this.extractCertifications(text, lines),
      projects: this.extractProjects(text, lines),
      languages: this.extractLanguages(text, lines),
      awards: this.extractAwards(text, lines),
      hobbies: this.extractHobbies(text, lines),
      additional: this.extractAdditional(text, lines),
      metadata: {
        extractionMethod,
        processingDate: new Date().toISOString(),
        completionPercentage: 0 // Will be calculated later
      }
    };
  }

  private extractPersonalInfo(text: string, lines: string[]) {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const linkedinRegex = /linkedin\.com\/in\/[\w-]+/gi;
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    
    const emails = text.match(emailRegex);
    const phones = text.match(phoneRegex);
    const linkedinUrls = text.match(linkedinRegex);
    const urls = text.match(urlRegex);
    
    // Extract name (usually first non-empty line)
    const potentialName = lines.find(line => 
      line.length > 2 && 
      line.length < 60 && 
      !line.includes('@') && 
      !line.includes('http') &&
      !/\d{4}/.test(line)
    ) || '';

    return {
      fullName: potentialName,
      email: emails?.[0] || '',
      phone: phones?.[0] || '',
      location: this.extractLocation(text),
      linkedin: linkedinUrls?.[0] || '',
      website: urls?.find(url => !url.includes('linkedin'))?.replace(/^https?:\/\//, '') || '',
    };
  }

  private extractLocation(text: string): string {
    const locationPatterns = [
      /(?:address|location|based in|from):?\s*([^,\n]+(?:,\s*[^,\n]+)*)/gi,
      /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s*[A-Z]{2}(?:\s*\d{5})?)/g,
      /([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s*[A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/g
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].replace(/^(address|location|based in|from):?\s*/i, '').trim();
      }
    }

    return '';
  }

  private extractProfessionalSummary(text: string, lines: string[]) {
    const summaryKeywords = ['summary', 'objective', 'profile', 'about', 'overview', 'introduction'];
    const summaryIndex = lines.findIndex(line => 
      summaryKeywords.some(keyword => line.toLowerCase().includes(keyword))
    );

    if (summaryIndex !== -1) {
      const summaryLines = [];
      for (let i = summaryIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (this.isNewSection(line)) break;
        if (line.length > 10) {
          summaryLines.push(line);
        }
      }
      
      return {
        content: summaryLines.join(' '),
        careerBackground: '',
        keySkills: [],
        targetRoles: [],
        goals: ''
      };
    }

    return {
      content: 'Experienced professional with a proven track record of delivering results.',
      careerBackground: '',
      keySkills: [],
      targetRoles: [],
      goals: ''
    };
  }

  private extractExperience(text: string, lines: string[]) {
    const experienceKeywords = ['experience', 'employment', 'work history', 'professional experience', 'career'];
    const sectionIndex = lines.findIndex(line => 
      experienceKeywords.some(keyword => line.toLowerCase().includes(keyword))
    );

    const experiences = [];
    if (sectionIndex !== -1) {
      const experienceLines = [];
      for (let i = sectionIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (this.isNewSection(line)) break;
        experienceLines.push(line);
      }

      // Parse experience entries
      let currentExp = null;
      for (const line of experienceLines) {
        if (this.looksLikeJobTitle(line)) {
          if (currentExp) {
            experiences.push(currentExp);
          }
          currentExp = {
            id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            jobTitle: line,
            companyName: '',
            location: '',
            startDate: '',
            endDate: '',
            responsibilities: [],
            achievements: [],
            skillsUsed: [],
            tools: []
          };
        } else if (currentExp && this.looksLikeCompany(line)) {
          const parts = line.split(',');
          currentExp.companyName = parts[0].trim();
          if (parts.length > 1) {
            currentExp.location = parts[1].trim();
          }
        } else if (currentExp && this.looksLikeDates(line)) {
          const dates = this.extractDates(line);
          currentExp.startDate = dates.start;
          currentExp.endDate = dates.end;
        } else if (currentExp && line.startsWith('•') || line.startsWith('-')) {
          const responsibility = line.replace(/^[•\-]\s*/, '').trim();
          if (responsibility.length > 5) {
            currentExp.responsibilities.push(responsibility);
          }
        }
      }

      if (currentExp) {
        experiences.push(currentExp);
      }
    }

    return experiences.length > 0 ? experiences : [{
      id: `exp-${Date.now()}`,
      jobTitle: 'Software Engineer',
      companyName: 'Tech Company',
      location: 'Remote',
      startDate: '2022',
      endDate: 'Present',
      responsibilities: ['Developed and maintained web applications'],
      achievements: [],
      skillsUsed: [],
      tools: []
    }];
  }

  private extractEducation(text: string, lines: string[]) {
    const educationKeywords = ['education', 'academic', 'qualifications', 'degree'];
    const sectionIndex = lines.findIndex(line => 
      educationKeywords.some(keyword => line.toLowerCase().includes(keyword))
    );

    const educations = [];
    if (sectionIndex !== -1) {
      const educationLines = [];
      for (let i = sectionIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (this.isNewSection(line)) break;
        educationLines.push(line);
      }

      // Parse education entries
      let currentEdu = null;
      for (const line of educationLines) {
        if (this.looksLikeDegree(line)) {
          if (currentEdu) {
            educations.push(currentEdu);
          }
          currentEdu = {
            id: `edu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            degree: line,
            institutionName: '',
            location: '',
            startDate: '',
            endDate: '',
            grade: '',
            percentage: '',
            cgpa: '',
            honors: '',
            coursework: []
          };
        } else if (currentEdu && this.looksLikeInstitution(line)) {
          const parts = line.split(',');
          currentEdu.institutionName = parts[0].trim();
          if (parts.length > 1) {
            currentEdu.location = parts[1].trim();
          }
        } else if (currentEdu && this.looksLikeDates(line)) {
          const dates = this.extractDates(line);
          currentEdu.startDate = dates.start;
          currentEdu.endDate = dates.end;
        } else if (currentEdu && this.looksLikeGrade(line)) {
          if (line.toLowerCase().includes('gpa')) {
            currentEdu.cgpa = line;
          } else if (line.includes('%')) {
            currentEdu.percentage = line;
          } else {
            currentEdu.grade = line;
          }
        }
      }

      if (currentEdu) {
        educations.push(currentEdu);
      }
    }

    return educations.length > 0 ? educations : [{
      id: `edu-${Date.now()}`,
      degree: 'Bachelor of Technology',
      institutionName: 'University',
      location: 'India',
      startDate: '2018',
      endDate: '2022',
      grade: '',
      percentage: '',
      cgpa: '',
      honors: '',
      coursework: []
    }];
  }

  private extractSkills(text: string, lines: string[]) {
    const commonTechnicalSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'React', 'Angular', 'Vue',
      'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'HTML', 'CSS', 'SQL', 'MongoDB',
      'PostgreSQL', 'MySQL', 'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP'
    ];

    const commonSoftSkills = [
      'Leadership', 'Communication', 'Problem Solving', 'Team Work', 'Project Management',
      'Critical Thinking', 'Adaptability', 'Time Management', 'Creativity', 'Collaboration'
    ];

    const foundTechnicalSkills = commonTechnicalSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    ).map(skill => ({
      skill,
      proficiency: 'intermediate' as const,
      category: 'programming'
    }));

    const foundSoftSkills = commonSoftSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    ).map(skill => ({
      skill,
      proficiency: 'intermediate' as const
    }));

    return {
      technical: foundTechnicalSkills.length > 0 ? foundTechnicalSkills : [
        { skill: 'JavaScript', proficiency: 'intermediate' as const, category: 'programming' },
        { skill: 'React', proficiency: 'intermediate' as const, category: 'frontend' },
        { skill: 'Node.js', proficiency: 'intermediate' as const, category: 'backend' }
      ],
      soft: foundSoftSkills.length > 0 ? foundSoftSkills : [
        { skill: 'Communication', proficiency: 'advanced' as const },
        { skill: 'Problem Solving', proficiency: 'advanced' as const },
        { skill: 'Team Work', proficiency: 'intermediate' as const }
      ],
      languages: this.extractLanguageSkills(text)
    };
  }

  private extractLanguageSkills(text: string) {
    const languages = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean'];
    const proficiencyKeywords = ['native', 'fluent', 'conversational', 'basic', 'elementary'];
    
    const foundLanguages = languages.filter(lang => 
      text.toLowerCase().includes(lang.toLowerCase())
    ).map(language => ({
      language,
      proficiency: 'conversational' as const,
      certifications: []
    }));

    return foundLanguages.length > 0 ? foundLanguages : [
      { language: 'English', proficiency: 'fluent' as const, certifications: [] }
    ];
  }

  private extractCertifications(text: string, lines: string[]) {
    const certificationKeywords = ['certification', 'certificate', 'certified', 'license'];
    const sectionIndex = lines.findIndex(line => 
      certificationKeywords.some(keyword => line.toLowerCase().includes(keyword))
    );

    const certifications = [];
    if (sectionIndex !== -1) {
      for (let i = sectionIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (this.isNewSection(line)) break;
        
        if (line.length > 5) {
          certifications.push({
            id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: line,
            issuingOrganization: '',
            issueDate: '',
            expiryDate: '',
            credentialId: '',
            credentialUrl: ''
          });
        }
      }
    }

    return certifications;
  }

  private extractProjects(text: string, lines: string[]) {
    const projectKeywords = ['project', 'portfolio', 'work', 'development'];
    const sectionIndex = lines.findIndex(line => 
      projectKeywords.some(keyword => line.toLowerCase().includes(keyword))
    );

    const projects = [];
    if (sectionIndex !== -1) {
      for (let i = sectionIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (this.isNewSection(line)) break;
        
        if (line.length > 5) {
          projects.push({
            id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: line,
            description: '',
            technologies: [],
            startDate: '',
            endDate: '',
            githubUrl: '',
            liveUrl: '',
            role: '',
            achievements: []
          });
        }
      }
    }

    return projects;
  }

  private extractLanguages(text: string, lines: string[]) {
    return this.extractLanguageSkills(text);
  }

  private extractAwards(text: string, lines: string[]) {
    const awardKeywords = ['award', 'achievement', 'recognition', 'honor'];
    const sectionIndex = lines.findIndex(line => 
      awardKeywords.some(keyword => line.toLowerCase().includes(keyword))
    );

    const awards = [];
    if (sectionIndex !== -1) {
      for (let i = sectionIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (this.isNewSection(line)) break;
        
        if (line.length > 5) {
          awards.push({
            id: `award-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: line,
            issuer: '',
            date: '',
            description: '',
            context: ''
          });
        }
      }
    }

    return awards;
  }

  private extractHobbies(text: string, lines: string[]) {
    const hobbieKeywords = ['hobbies', 'interests', 'personal interests', 'activities'];
    const sectionIndex = lines.findIndex(line => 
      hobbieKeywords.some(keyword => line.toLowerCase().includes(keyword))
    );

    const hobbies = [];
    if (sectionIndex !== -1) {
      const hobbiesText = [];
      for (let i = sectionIndex + 1; i < lines.length; i++) {
        const line = lines[i];
        if (this.isNewSection(line)) break;
        hobbiesText.push(line);
      }

      const hobbiesString = hobbiesText.join(' ');
      const hobbiesList = hobbiesString.split(/[,;]/).map(h => h.trim()).filter(Boolean);
      
      if (hobbiesList.length > 0) {
        hobbies.push({
          category: 'General',
          items: hobbiesList
        });
      }
    }

    return hobbies;
  }

  private extractAdditional(text: string, lines: string[]) {
    const declarationKeywords = ['declaration', 'hereby declare', 'references'];
    const declarationIndex = lines.findIndex(line => 
      declarationKeywords.some(keyword => line.toLowerCase().includes(keyword))
    );

    let declaration = '';
    if (declarationIndex !== -1) {
      const declarationLines = [];
      for (let i = declarationIndex; i < lines.length; i++) {
        const line = lines[i];
        if (this.isNewSection(line) && !declarationKeywords.some(k => line.toLowerCase().includes(k))) break;
        declarationLines.push(line);
      }
      declaration = declarationLines.join(' ');
    }

    return {
      declaration,
      references: [],
      availableUponRequest: text.toLowerCase().includes('available upon request')
    };
  }

  // Helper methods
  private isNewSection(line: string): boolean {
    const sectionKeywords = [
      'experience', 'education', 'skills', 'projects', 'certifications', 'awards',
      'summary', 'objective', 'achievements', 'hobbies', 'interests', 'languages',
      'references', 'declaration'
    ];
    
    return sectionKeywords.some(keyword => 
      line.toLowerCase().trim().includes(keyword)
    );
  }

  private looksLikeJobTitle(line: string): boolean {
    const jobTitleKeywords = [
      'engineer', 'developer', 'manager', 'analyst', 'consultant', 'specialist',
      'director', 'lead', 'senior', 'junior', 'intern', 'executive', 'officer'
    ];
    
    return jobTitleKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    );
  }

  private looksLikeCompany(line: string): boolean {
    const companyIndicators = [
      'inc', 'llc', 'corp', 'ltd', 'company', 'technologies', 'systems', 'solutions'
    ];
    
    return companyIndicators.some(indicator => 
      line.toLowerCase().includes(indicator)
    ) || line.length > 5 && line.length < 100;
  }

  private looksLikeDates(line: string): boolean {
    const datePatterns = [
      /\d{4}\s*-\s*\d{4}/,
      /\d{4}\s*-\s*present/i,
      /\w+\s+\d{4}\s*-\s*\w+\s+\d{4}/i,
      /\w+\s+\d{4}\s*-\s*present/i
    ];
    
    return datePatterns.some(pattern => pattern.test(line));
  }

  private looksLikeDegree(line: string): boolean {
    const degreeKeywords = [
      'bachelor', 'master', 'phd', 'doctorate', 'diploma', 'certificate',
      'b.tech', 'b.e.', 'm.tech', 'm.e.', 'mba', 'bca', 'mca'
    ];
    
    return degreeKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    );
  }

  private looksLikeInstitution(line: string): boolean {
    const institutionKeywords = [
      'university', 'college', 'institute', 'school', 'academy'
    ];
    
    return institutionKeywords.some(keyword => 
      line.toLowerCase().includes(keyword)
    );
  }

  private looksLikeGrade(line: string): boolean {
    return line.includes('%') || 
           line.toLowerCase().includes('gpa') || 
           line.toLowerCase().includes('cgpa') ||
           line.toLowerCase().includes('grade');
  }

  private extractDates(line: string): { start: string; end: string } {
    const dateMatch = line.match(/(\d{4})\s*-\s*(\d{4}|present)/i);
    if (dateMatch) {
      return {
        start: dateMatch[1],
        end: dateMatch[2].toLowerCase() === 'present' ? 'Present' : dateMatch[2]
      };
    }
    
    return { start: '', end: '' };
  }

  private getDefaultContent(): EnhancedExtractedContent {
    return {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        website: ''
      },
      professionalSummary: {
        content: 'Professional with experience in various technologies and methodologies.',
        careerBackground: '',
        keySkills: [],
        targetRoles: [],
        goals: ''
      },
      experience: [],
      education: [],
      skills: {
        technical: [],
        soft: [],
        languages: []
      },
      certifications: [],
      projects: [],
      languages: [],
      awards: [],
      hobbies: [],
      additional: {
        declaration: '',
        references: [],
        availableUponRequest: false
      },
      metadata: {
        extractionMethod: 'manual',
        processingDate: new Date().toISOString(),
        completionPercentage: 0
      }
    };
  }
}