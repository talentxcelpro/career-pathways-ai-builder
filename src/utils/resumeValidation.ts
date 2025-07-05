export interface ValidationError {
  field: string;
  message: string;
  section?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export const validateResumeData = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Personal Info Validation
  if (!data.personalInfo?.fullName?.trim()) {
    errors.push({ field: 'fullName', message: 'Full name is required', section: 'personalInfo' });
  }

  if (!data.personalInfo?.email?.trim()) {
    errors.push({ field: 'email', message: 'Email is required', section: 'personalInfo' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personalInfo.email)) {
    errors.push({ field: 'email', message: 'Invalid email format', section: 'personalInfo' });
  }

  if (!data.personalInfo?.phone?.trim()) {
    warnings.push({ field: 'phone', message: 'Phone number is recommended', section: 'personalInfo' });
  }

  if (!data.personalInfo?.summary?.trim()) {
    warnings.push({ field: 'summary', message: 'Professional summary is highly recommended', section: 'personalInfo' });
  } else if (data.personalInfo.summary.length < 50) {
    warnings.push({ field: 'summary', message: 'Professional summary should be at least 50 characters', section: 'personalInfo' });
  }

  // Experience Validation
  if (!data.experience || data.experience.length === 0) {
    warnings.push({ field: 'experience', message: 'Work experience is highly recommended', section: 'experience' });
  } else {
    data.experience.forEach((exp: any, index: number) => {
      if (!exp.title?.trim()) {
        errors.push({ field: `experience[${index}].title`, message: 'Job title is required', section: 'experience' });
      }
      if (!exp.company?.trim()) {
        errors.push({ field: `experience[${index}].company`, message: 'Company name is required', section: 'experience' });
      }
      if (!exp.startDate?.trim()) {
        errors.push({ field: `experience[${index}].startDate`, message: 'Start date is required', section: 'experience' });
      }
      if (!exp.description?.trim()) {
        warnings.push({ field: `experience[${index}].description`, message: 'Job description is recommended', section: 'experience' });
      }
    });
  }

  // Skills Validation
  if (!data.skills || data.skills.length === 0) {
    warnings.push({ field: 'skills', message: 'Skills section is highly recommended', section: 'skills' });
  } else if (data.skills.length < 3) {
    warnings.push({ field: 'skills', message: 'Consider adding more skills (minimum 5 recommended)', section: 'skills' });
  }

  // Education Validation
  if (!data.education || data.education.length === 0) {
    warnings.push({ field: 'education', message: 'Education section is recommended', section: 'education' });
  } else {
    data.education.forEach((edu: any, index: number) => {
      if (!edu.degree?.trim()) {
        errors.push({ field: `education[${index}].degree`, message: 'Degree is required', section: 'education' });
      }
      if (!edu.school?.trim()) {
        errors.push({ field: `education[${index}].school`, message: 'School name is required', section: 'education' });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const getFieldError = (errors: ValidationError[], field: string, section?: string): string | undefined => {
  const error = errors.find(e => e.field === field && (!section || e.section === section));
  return error?.message;
};

export const getSectionErrors = (errors: ValidationError[], section: string): ValidationError[] => {
  return errors.filter(e => e.section === section);
};