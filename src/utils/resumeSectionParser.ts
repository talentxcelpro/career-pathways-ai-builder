/**
 * Advanced resume section parsing utilities
 * Extracts structured sections from raw resume text
 */

export interface ParsedSections {
  summary: string;
  experience: string;
  education: string;
  skills: string;
  projects?: string;
  certifications?: string;
  awards?: string;
  volunteer?: string;
}

export class ResumeSectionParser {
  /**
   * Parse resume text into structured sections
   */
  parseSections(text: string): ParsedSections {
    console.log('Parsing resume sections from text of length:', text.length);
    
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const content = lines.join('\n');
    
    // Enhanced section detection with multiple keywords
    const sectionKeywords = {
      summary: ['summary', 'profile', 'objective', 'about', 'overview'],
      experience: ['experience', 'employment', 'work history', 'professional experience', 'career'],
      education: ['education', 'academic', 'qualifications', 'degrees'],
      skills: ['skills', 'competencies', 'technical skills', 'core competencies', 'expertise'],
      projects: ['projects', 'portfolio', 'key projects'],
      certifications: ['certifications', 'certificates', 'licenses', 'credentials'],
      awards: ['awards', 'achievements', 'honors', 'recognition'],
      volunteer: ['volunteer', 'volunteering', 'community service', 'civic engagement']
    };

    const getSection = (sectionName: keyof typeof sectionKeywords): string => {
      const keywords = sectionKeywords[sectionName];
      
      for (const keyword of keywords) {
        const sectionContent = this.extractSectionByKeyword(content, keyword);
        if (sectionContent && sectionContent.length > 10) {
          console.log(`Found ${sectionName} section using keyword: ${keyword}`);
          return sectionContent;
        }
      }
      
      return '';
    };

    const sections: ParsedSections = {
      summary: getSection('summary'),
      experience: getSection('experience'),
      education: getSection('education'),
      skills: getSection('skills'),
      projects: getSection('projects'),
      certifications: getSection('certifications'),
      awards: getSection('awards'),
      volunteer: getSection('volunteer')
    };

    // Fallback: if no sections found, try to extract from structured text
    if (!sections.summary && !sections.experience && !sections.education && !sections.skills) {
      console.log('No sections found with keywords, trying positional parsing...');
      return this.parseByPosition(text);
    }

    console.log('Successfully parsed sections:', Object.keys(sections).filter(key => sections[key as keyof ParsedSections]));
    return sections;
  }

  /**
   * Extract section content by keyword
   */
  private extractSectionByKeyword(content: string, keyword: string): string {
    const lowerContent = content.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    
    // Find the keyword (as section header)
    const keywordIndex = lowerContent.indexOf(lowerKeyword);
    if (keywordIndex === -1) return '';
    
    // Find the start of content (after the keyword and any formatting)
    const contentStart = keywordIndex + keyword.length;
    let startIndex = contentStart;
    
    // Skip any colons, dashes, or formatting characters
    while (startIndex < content.length && /[:=\-\s]/.test(content[startIndex])) {
      startIndex++;
    }
    
    if (startIndex >= content.length) return '';
    
    // Find the end of this section (next major section or end of text)
    const restContent = content.slice(startIndex);
    const nextSectionPatterns = [
      /\n\s*[A-Z][A-Z\s]{3,}[:=\-]?\s*\n/g, // UPPERCASE HEADERS
      /\n\s*(SUMMARY|PROFILE|EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|AWARDS|VOLUNTEER)/gi,
      /\n\s*={3,}|\n\s*-{3,}/g // Separator lines
    ];
    
    let endIndex = restContent.length;
    
    for (const pattern of nextSectionPatterns) {
      pattern.lastIndex = 0; // Reset regex
      const match = pattern.exec(restContent);
      if (match && match.index > 50) { // Ensure we get some content
        endIndex = Math.min(endIndex, match.index);
      }
    }
    
    return restContent.slice(0, endIndex).trim();
  }

  /**
   * Parse by position when keyword-based parsing fails
   */
  private parseByPosition(text: string): ParsedSections {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const totalLines = lines.length;
    
    // Heuristic-based section division
    const summaryEnd = Math.min(Math.floor(totalLines * 0.15), 10);
    const experienceEnd = Math.min(Math.floor(totalLines * 0.65), totalLines - 10);
    const educationEnd = Math.min(Math.floor(totalLines * 0.85), totalLines - 5);
    
    return {
      summary: lines.slice(0, summaryEnd).join('\n').trim(),
      experience: lines.slice(summaryEnd, experienceEnd).join('\n').trim(),
      education: lines.slice(experienceEnd, educationEnd).join('\n').trim(),
      skills: lines.slice(educationEnd).join('\n').trim()
    };
  }

  /**
   * Clean and enhance section content
   */
  cleanSectionContent(content: string): string {
    if (!content) return '';
    
    return content
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove bullet point symbols for cleaner AI processing
      .replace(/^[•·\-\*\+]\s*/gm, '')
      // Clean up multiple line breaks
      .replace(/\n{3,}/g, '\n\n')
      // Remove common resume formatting artifacts
      .replace(/Page \d+ of \d+/gi, '')
      .replace(/\[Type here\]/gi, '')
      .trim();
  }

  /**
   * Extract contact information from text
   */
  extractContactInfo(text: string): {
    email?: string;
    phone?: string;
    linkedin?: string;
    website?: string;
    name?: string;
  } {
    const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const phoneMatch = text.match(/(\+?[\d\s\-\(\)]{10,})/);
    const linkedinMatch = text.match(/(linkedin\.com\/in\/[a-zA-Z0-9\-]+)/i);
    const websiteMatch = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/i);
    
    // Try to extract name (usually in the first few lines)
    const firstLines = text.split('\n').slice(0, 5);
    const nameMatch = firstLines.find(line => 
      line.length > 5 && 
      line.length < 50 && 
      /^[A-Za-z\s]+$/.test(line.trim()) &&
      !line.toLowerCase().includes('resume') &&
      !line.toLowerCase().includes('cv')
    );

    return {
      email: emailMatch?.[0],
      phone: phoneMatch?.[0],
      linkedin: linkedinMatch?.[0],
      website: websiteMatch?.[0],
      name: nameMatch?.trim()
    };
  }
}