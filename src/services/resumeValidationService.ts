/**
 * Resume data validation and quality assurance service
 * Ensures extracted resume data meets quality standards
 */

export interface ValidationResult {
  isValid: boolean;
  score: number;
  issues: ValidationIssue[];
  recommendations: string[];
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  suggestion?: string;
}

export class ResumeValidationService {
  /**
   * Validate complete resume data structure
   */
  validateResumeData(data: any): ValidationResult {
    const issues: ValidationIssue[] = [];
    let score = 100;

    // Validate personal information
    const personalValidation = this.validatePersonalInfo(data.personalInfo);
    issues.push(...personalValidation.issues);
    score -= personalValidation.penalty;

    // Validate experience section
    const experienceValidation = this.validateExperience(data.experience);
    issues.push(...experienceValidation.issues);
    score -= experienceValidation.penalty;

    // Validate education section
    const educationValidation = this.validateEducation(data.education);
    issues.push(...educationValidation.issues);
    score -= educationValidation.penalty;

    // Validate skills section
    const skillsValidation = this.validateSkills(data.skills);
    issues.push(...skillsValidation.issues);
    score -= skillsValidation.penalty;

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues);

    return {
      isValid: score >= 60 && !issues.some(i => i.severity === 'error'),
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  private validatePersonalInfo(personalInfo: any) {
    const issues: ValidationIssue[] = [];
    let penalty = 0;

    if (!personalInfo?.fullName?.trim()) {
      issues.push({
        severity: 'error',
        field: 'personalInfo.fullName',
        message: 'Full name is required',
        suggestion: 'Extract name from document or use filename as fallback'
      });
      penalty += 15;
    }

    if (!personalInfo?.email?.includes('@')) {
      issues.push({
        severity: 'warning',
        field: 'personalInfo.email',
        message: 'Valid email address not found',
        suggestion: 'Look for email patterns in the document'
      });
      penalty += 10;
    }

    if (!personalInfo?.phone?.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) {
      issues.push({
        severity: 'warning',
        field: 'personalInfo.phone',
        message: 'Valid phone number not found',
        suggestion: 'Search for phone number patterns'
      });
      penalty += 5;
    }

    if (!personalInfo?.summary?.trim() || personalInfo.summary.length < 50) {
      issues.push({
        severity: 'info',
        field: 'personalInfo.summary',
        message: 'Professional summary is missing or too short',
        suggestion: 'Generate a professional summary based on experience'
      });
      penalty += 5;
    }

    return { issues, penalty };
  }

  private validateExperience(experience: any[]) {
    const issues: ValidationIssue[] = [];
    let penalty = 0;

    if (!Array.isArray(experience) || experience.length === 0) {
      issues.push({
        severity: 'error',
        field: 'experience',
        message: 'No work experience found',
        suggestion: 'Extract work history or generate based on skill level'
      });
      penalty += 20;
    } else {
      experience.forEach((exp, index) => {
        if (!exp.title?.trim()) {
          issues.push({
            severity: 'warning',
            field: `experience[${index}].title`,
            message: 'Job title missing',
            suggestion: 'Extract or infer job title from description'
          });
          penalty += 3;
        }

        if (!exp.company?.trim()) {
          issues.push({
            severity: 'warning',
            field: `experience[${index}].company`,
            message: 'Company name missing',
            suggestion: 'Extract company name from context'
          });
          penalty += 3;
        }

        if (!exp.description?.trim() || exp.description.length < 50) {
          issues.push({
            severity: 'info',
            field: `experience[${index}].description`,
            message: 'Job description is too short or missing',
            suggestion: 'Expand description with achievements and responsibilities'
          });
          penalty += 2;
        }
      });
    }

    return { issues, penalty };
  }

  private validateEducation(education: any[]) {
    const issues: ValidationIssue[] = [];
    let penalty = 0;

    if (!Array.isArray(education) || education.length === 0) {
      issues.push({
        severity: 'warning',
        field: 'education',
        message: 'No education information found',
        suggestion: 'Extract education details or generate appropriate background'
      });
      penalty += 10;
    } else {
      education.forEach((edu, index) => {
        if (!edu.degree?.trim()) {
          issues.push({
            severity: 'info',
            field: `education[${index}].degree`,
            message: 'Degree information missing',
            suggestion: 'Extract or infer degree from context'
          });
          penalty += 2;
        }

        if (!edu.school?.trim()) {
          issues.push({
            severity: 'info',
            field: `education[${index}].school`,
            message: 'Institution name missing',
            suggestion: 'Extract school/university name'
          });
          penalty += 2;
        }
      });
    }

    return { issues, penalty };
  }

  private validateSkills(skills: any) {
    const issues: ValidationIssue[] = [];
    let penalty = 0;

    const totalSkills = this.countTotalSkills(skills);

    if (totalSkills === 0) {
      issues.push({
        severity: 'error',
        field: 'skills',
        message: 'No skills information found',
        suggestion: 'Extract technical and soft skills from experience and education'
      });
      penalty += 15;
    } else if (totalSkills < 5) {
      issues.push({
        severity: 'warning',
        field: 'skills',
        message: 'Limited skills information',
        suggestion: 'Expand skills section with relevant technologies and competencies'
      });
      penalty += 8;
    }

    return { issues, penalty };
  }

  private countTotalSkills(skills: any): number {
    if (!skills) return 0;

    let count = 0;
    
    if (skills.technical) {
      Object.values(skills.technical).forEach((skillArray: any) => {
        if (Array.isArray(skillArray)) {
          count += skillArray.length;
        }
      });
    }

    if (Array.isArray(skills.soft)) {
      count += skills.soft.length;
    }

    if (Array.isArray(skills.languages)) {
      count += skills.languages.length;
    }

    return count;
  }

  private generateRecommendations(issues: ValidationIssue[]): string[] {
    const recommendations: string[] = [];

    // Count issues by category
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    if (errorCount > 0) {
      recommendations.push('Address critical missing information for a complete resume');
    }

    if (warningCount > 2) {
      recommendations.push('Consider manual review to improve data completeness');
    }

    // Specific recommendations based on common issues
    const fieldIssues = issues.map(i => i.field);
    
    if (fieldIssues.some(f => f.includes('personalInfo'))) {
      recommendations.push('Verify and complete contact information');
    }

    if (fieldIssues.some(f => f.includes('experience'))) {
      recommendations.push('Enhance work experience with specific achievements');
    }

    if (fieldIssues.some(f => f.includes('skills'))) {
      recommendations.push('Expand skills section with relevant technologies');
    }

    return recommendations;
  }

  /**
   * Check if resume data needs manual review
   */
  needsManualReview(validationResult: ValidationResult): boolean {
    return validationResult.score < 70 || 
           validationResult.issues.some(i => i.severity === 'error') ||
           validationResult.issues.filter(i => i.severity === 'warning').length > 3;
  }

  /**
   * Get extraction confidence score
   */
  getExtractionConfidence(data: any): number {
    const validation = this.validateResumeData(data);
    
    // Adjust confidence based on validation score and metadata
    let confidence = validation.score / 100;
    
    if (data.metadata?.extractionMethod?.includes('OCR')) {
      confidence *= 0.85; // OCR typically less reliable
    }
    
    if (data.confidenceMetrics?.overall) {
      confidence = (confidence + data.confidenceMetrics.overall) / 2;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }
}