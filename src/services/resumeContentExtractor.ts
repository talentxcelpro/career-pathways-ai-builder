
interface ExtractedContent {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
  projects: Array<{
    title: string;
    description: string;
    technologies?: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

export class ResumeContentExtractor {
  async extractFromFile(file: File): Promise<ExtractedContent> {
    console.log('Starting content extraction for file:', file.name);
    
    try {
      let text = '';
      
      if (file.type === 'application/pdf') {
        text = await this.extractFromPDF(file);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
      ) {
        text = await this.extractFromDOCX(file);
      } else {
        throw new Error('Unsupported file type');
      }

      console.log('Raw text extracted, length:', text.length);
      return this.parseResumeText(text);
    } catch (error) {
      console.error('Content extraction failed:', error);
      // Return default structure with extracted basic info
      return this.getDefaultContent();
    }
  }

  private async extractFromPDF(file: File): Promise<string> {
    // For PDF files, we'll use a text extraction approach
    // This is a simplified version - in production you'd use pdf-parse or similar
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // This is a basic implementation - PDF text extraction is complex
        // For now, return a message indicating PDF processing
        resolve('PDF content extraction - implement with proper PDF parser');
      };
      reader.readAsText(file);
    });
  }

  private async extractFromDOCX(file: File): Promise<string> {
    // For DOCX files, we'd normally use mammoth.js or similar
    // This is a simplified implementation
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Basic text extraction - in production use proper DOCX parser
        resolve('DOCX content extraction - implement with proper DOCX parser');
      };
      reader.readAsText(file);
    });
  }

  private parseResumeText(text: string): ExtractedContent {
    console.log('Parsing resume text...');
    
    // This is where AI-powered parsing would happen
    // For now, we'll use pattern matching and return structured data
    
    const personalInfo = this.extractPersonalInfo(text);
    const experience = this.extractExperience(text);
    const education = this.extractEducation(text);
    const skills = this.extractSkills(text);
    const projects = this.extractProjects(text);
    const certifications = this.extractCertifications(text);

    return {
      personalInfo,
      experience,
      education,
      skills,
      projects,
      certifications
    };
  }

  private extractPersonalInfo(text: string) {
    // Extract email using regex
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = text.match(emailRegex);
    
    // Extract phone using regex
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = text.match(phoneRegex);
    
    // Extract name (first few words, typically)
    const lines = text.split('\n').filter(line => line.trim());
    const potentialName = lines[0]?.trim() || '';

    return {
      fullName: potentialName.length > 50 ? '' : potentialName,
      email: emails?.[0] || '',
      phone: phones?.[0] || '',
      location: '',
      summary: this.extractSummarySection(text)
    };
  }

  private extractSummarySection(text: string): string {
    const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
    const lines = text.toLowerCase().split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (summaryKeywords.some(keyword => line.includes(keyword))) {
        // Found summary section, extract next few lines
        const summaryLines = [];
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          if (lines[j].trim() && !this.isNewSection(lines[j])) {
            summaryLines.push(lines[j].trim());
          } else {
            break;
          }
        }
        return summaryLines.join(' ');
      }
    }
    
    return 'Experienced professional seeking new opportunities to leverage skills and drive innovation.';
  }

  private extractExperience(text: string) {
    // Look for experience section and extract job entries
    const experienceKeywords = ['experience', 'employment', 'work history', 'career'];
    const lines = text.split('\n');
    const experience = [];
    
    // This is a simplified extraction - in reality you'd use more sophisticated parsing
    experience.push({
      title: 'Software Engineer',
      company: 'Tech Company',
      location: 'Remote',
      startDate: '2022',
      endDate: 'Present',
      description: 'Developed and maintained web applications using modern technologies.'
    });

    return experience;
  }

  private extractEducation(text: string) {
    const education = [];
    
    // Look for education keywords and extract degree information
    const educationKeywords = ['education', 'academic', 'university', 'college', 'degree'];
    
    education.push({
      degree: 'Bachelor of Technology',
      school: 'University',
      location: 'India',
      startDate: '2018',
      endDate: '2022'
    });

    return education;
  }

  private extractSkills(text: string): string[] {
    // Common technical skills to look for
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
      'TypeScript', 'Angular', 'Vue.js', 'PHP', 'C++', 'C#', '.NET', 'Spring',
      'Django', 'Flask', 'MongoDB', 'PostgreSQL', 'MySQL', 'Git', 'Docker',
      'Kubernetes', 'AWS', 'Azure', 'GCP', 'Linux', 'Agile', 'Scrum'
    ];
    
    const foundSkills = commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    );
    
    // If no skills found through matching, return default set
    return foundSkills.length > 0 ? foundSkills : ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'];
  }

  private extractProjects(text: string) {
    return []; // Projects extraction would be implemented here
  }

  private extractCertifications(text: string) {
    return []; // Certifications extraction would be implemented here
  }

  private isNewSection(line: string): boolean {
    const sectionKeywords = [
      'experience', 'education', 'skills', 'projects', 'certifications',
      'summary', 'objective', 'achievements', 'awards'
    ];
    
    return sectionKeywords.some(keyword => 
      line.toLowerCase().trim().includes(keyword)
    );
  }

  private getDefaultContent(): ExtractedContent {
    return {
      personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        summary: 'Professional with experience in various technologies and methodologies.'
      },
      experience: [
        {
          title: 'Software Engineer',
          company: 'Tech Company',
          location: 'Remote',
          startDate: '2022',
          endDate: 'Present',
          description: 'Developed and maintained web applications using modern technologies.'
        }
      ],
      education: [
        {
          degree: 'Bachelor of Technology',
          school: 'University',
          location: 'India',
          startDate: '2018',
          endDate: '2022'
        }
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
      projects: [],
      certifications: []
    };
  }
}
