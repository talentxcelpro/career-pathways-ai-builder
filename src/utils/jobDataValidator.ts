import { supabase } from "@/integrations/supabase/client";

export interface JobValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  correctedData?: Partial<any>;
}

export class JobDataValidator {
  
  // Salary limits by experience level (INR annually)
  private static readonly SALARY_LIMITS = {
    'internship': { max: 500000, maxFreelance: 200000 },
    'fresher': { max: 1200000, maxFreelance: 800000 },
    'mid-level': { max: 3500000, maxFreelance: 2000000 },
    'senior-level': { max: 8000000, maxFreelance: 5000000 },
    'executive': { max: 15000000, maxFreelance: 10000000 }
  };

  // Role-based skill mappings for validation
  private static readonly ROLE_SKILL_MAPPING = {
    'developer': ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git'],
    'designer': ['Figma', 'Adobe', 'Sketch', 'UI/UX', 'Prototyping'],
    'sales': ['CRM', 'Negotiation', 'Lead Generation', 'Communication'],
    'marketing': ['SEO', 'SEM', 'Analytics', 'Content Marketing', 'Social Media'],
    'hr': ['Talent Acquisition', 'ATS', 'HR Policies', 'Recruitment'],
    'manager': ['Leadership', 'Project Management', 'Team Management', 'Strategy']
  };

  static validateJobData(jobData: any): JobValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const correctedData: any = {};

    // 1. Required Fields Validation
    const requiredFields = ['title', 'location', 'employment_type', 'experience_level'];
    
    requiredFields.forEach(field => {
      if (!jobData[field] || (typeof jobData[field] === 'string' && jobData[field].trim() === '')) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // 2. Company Information Validation
    if (!jobData.company_name || jobData.company_name.trim() === '') {
      errors.push('Company name is required');
      suggestions.push('Add company name or use "Confidential Employer"');
    }

    // 3. Salary Validation
    const salaryValidation = this.validateSalary(jobData);
    if (salaryValidation.errors.length > 0) {
      errors.push(...salaryValidation.errors);
      if (salaryValidation.correctedSalary) {
        correctedData.salary_min = salaryValidation.correctedSalary.min;
        correctedData.salary_max = salaryValidation.correctedSalary.max;
        suggestions.push(`Suggested salary range: ₹${(salaryValidation.correctedSalary.min/100000).toFixed(1)}L - ₹${(salaryValidation.correctedSalary.max/100000).toFixed(1)}L`);
      }
    }

    // 4. Skills Validation
    const skillsValidation = this.validateSkills(jobData);
    if (skillsValidation.warnings.length > 0) {
      warnings.push(...skillsValidation.warnings);
    }
    if (skillsValidation.suggestedSkills) {
      correctedData.skills_required = skillsValidation.suggestedSkills;
      suggestions.push(`Suggested skills: ${skillsValidation.suggestedSkills.join(', ')}`);
    }

    // 5. Location Validation
    if (jobData.location && !this.isValidLocation(jobData.location)) {
      warnings.push('Location may not be recognized');
      suggestions.push('Use standard city names or "Remote"');
    }

    // 6. Description Quality Check
    if (!jobData.description || jobData.description.length < 100) {
      warnings.push('Job description is too short or missing');
      suggestions.push('Add detailed job description (minimum 100 characters)');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      correctedData: Object.keys(correctedData).length > 0 ? correctedData : undefined
    };
  }

  private static validateSalary(jobData: any) {
    const errors: string[] = [];
    let correctedSalary: { min: number; max: number } | undefined;

    const { salary_min, salary_max, employment_type, experience_level } = jobData;

    if (!salary_min && !salary_max) {
      errors.push('Salary information is required');
      return { errors, correctedSalary };
    }

    const limits = this.SALARY_LIMITS[experience_level as keyof typeof this.SALARY_LIMITS] || this.SALARY_LIMITS['mid-level'];
    const maxAllowed = employment_type === 'freelance' ? limits.maxFreelance : limits.max;

    // Check if salary exceeds realistic limits
    if (salary_max && salary_max > maxAllowed) {
      errors.push(`Salary ₹${(salary_max/100000).toFixed(1)}L exceeds realistic limit for ${experience_level} ${employment_type}`);
      
      // Generate corrected salary
      correctedSalary = {
        min: Math.round(maxAllowed * 0.7),
        max: Math.round(maxAllowed * 0.9)
      };
    }

    // Check for obviously wrong salaries (> 5 Cr)
    if (salary_max && salary_max > 50000000) {
      errors.push('Salary exceeds realistic CEO-level compensation');
      correctedSalary = {
        min: Math.round(limits.max * 0.6),
        max: Math.round(limits.max * 0.8)
      };
    }

    // Check min > max
    if (salary_min && salary_max && salary_min > salary_max) {
      errors.push('Minimum salary cannot be higher than maximum salary');
    }

    return { errors, correctedSalary };
  }

  private static validateSkills(jobData: any) {
    const warnings: string[] = [];
    let suggestedSkills: string[] | undefined;

    const { title, skills_required } = jobData;

    if (!skills_required || skills_required.length === 0) {
      warnings.push('No skills specified for the role');
      suggestedSkills = this.suggestSkillsForRole(title);
      return { warnings, suggestedSkills };
    }

    // Check for skill-role mismatch
    const roleType = this.detectRoleType(title);
    if (roleType) {
      const expectedSkills = this.ROLE_SKILL_MAPPING[roleType];
      const hasRelevantSkills = skills_required.some((skill: string) => 
        expectedSkills.some(expectedSkill => 
          skill.toLowerCase().includes(expectedSkill.toLowerCase()) ||
          expectedSkill.toLowerCase().includes(skill.toLowerCase())
        )
      );

      if (!hasRelevantSkills) {
        warnings.push(`Skills don't match the role type (${roleType})`);
        suggestedSkills = expectedSkills.slice(0, 6); // Top 6 relevant skills
      }
    }

    return { warnings, suggestedSkills };
  }

  private static detectRoleType(title: string): keyof typeof JobDataValidator.ROLE_SKILL_MAPPING | null {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('developer') || titleLower.includes('engineer') || titleLower.includes('programmer')) {
      return 'developer';
    }
    if (titleLower.includes('designer') || titleLower.includes('ui') || titleLower.includes('ux')) {
      return 'designer';
    }
    if (titleLower.includes('sales') || titleLower.includes('business development')) {
      return 'sales';
    }
    if (titleLower.includes('marketing') || titleLower.includes('digital marketing')) {
      return 'marketing';
    }
    if (titleLower.includes('hr') || titleLower.includes('recruitment') || titleLower.includes('talent')) {
      return 'hr';
    }
    if (titleLower.includes('manager') || titleLower.includes('lead') || titleLower.includes('director')) {
      return 'manager';
    }
    
    return null;
  }

  private static suggestSkillsForRole(title: string): string[] {
    const roleType = this.detectRoleType(title);
    return roleType ? this.ROLE_SKILL_MAPPING[roleType].slice(0, 5) : [];
  }

  private static isValidLocation(location: string): boolean {
    const validLocations = [
      'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'pune', 'hyderabad',
      'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore',
      'remote', 'work from home', 'wfh', 'hybrid'
    ];
    
    return validLocations.some(valid => 
      location.toLowerCase().includes(valid) || valid.includes(location.toLowerCase())
    );
  }

  // Auto-fix function that applies corrections
  static autoFixJobData(jobData: any): any {
    const validation = this.validateJobData(jobData);
    
    if (!validation.correctedData) {
      return jobData;
    }

    return {
      ...jobData,
      ...validation.correctedData,
      // Add metadata about the fixes
      _auto_fixed: true,
      _fixes_applied: Object.keys(validation.correctedData),
      _validation_warnings: validation.warnings,
      _validation_suggestions: validation.suggestions
    };
  }

  // Batch validation for multiple jobs
  static async validateJobsBatch(jobs: any[]): Promise<{
    validJobs: any[];
    invalidJobs: any[];
    fixedJobs: any[];
    summary: {
      total: number;
      valid: number;
      invalid: number;
      fixed: number;
    };
  }> {
    const validJobs: any[] = [];
    const invalidJobs: any[] = [];
    const fixedJobs: any[] = [];

    for (const job of jobs) {
      const validation = this.validateJobData(job);
      
      if (validation.isValid) {
        validJobs.push(job);
      } else if (validation.correctedData) {
        const fixedJob = this.autoFixJobData(job);
        fixedJobs.push(fixedJob);
      } else {
        invalidJobs.push({ ...job, _validation_errors: validation.errors });
      }
    }

    return {
      validJobs,
      invalidJobs,
      fixedJobs,
      summary: {
        total: jobs.length,
        valid: validJobs.length,
        invalid: invalidJobs.length,
        fixed: fixedJobs.length
      }
    };
  }
}

// Helper function for real-time validation during form input
export const validateJobField = (fieldName: string, value: any, jobData: any) => {
  const tempJobData = { ...jobData, [fieldName]: value };
  const validation = JobDataValidator.validateJobData(tempJobData);
  
  const fieldErrors = validation.errors.filter(error => 
    error.toLowerCase().includes(fieldName.toLowerCase())
  );
  const fieldWarnings = validation.warnings.filter(warning => 
    warning.toLowerCase().includes(fieldName.toLowerCase())
  );

  return {
    isValid: fieldErrors.length === 0,
    errors: fieldErrors,
    warnings: fieldWarnings,
    suggestions: validation.suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(fieldName.toLowerCase())
    )
  };
};