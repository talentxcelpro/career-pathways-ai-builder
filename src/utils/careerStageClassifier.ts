/**
 * Authoritative Canonical Career Stage Classifier
 * Single source of truth for candidate career tiering across TalentXcel.
 */

export type CanonicalCareerStage = 
  | 'Student'
  | 'Fresh Graduate'
  | 'Early Career (1-3 Yrs)'
  | 'Mid Career (4-8 Yrs)'
  | 'Senior Professional (9-15 Yrs)'
  | 'Executive (15+ Yrs)'
  | '40+ Year Professional'
  | 'Career Switcher';

export interface CareerStageAnalysis {
  stage: CanonicalCareerStage;
  tenureYears: number;
  roleCount: number;
  hasExecutiveTitles: boolean;
  explanation: string;
}

export function deriveCanonicalCareerStage(resumeData: any): CareerStageAnalysis {
  const experiences = resumeData?.experience || [];
  const education = resumeData?.education || [];
  const summary = (resumeData?.personalInfo?.summary || '').toLowerCase();
  const headline = (resumeData?.personalInfo?.professionalTitle || '').toLowerCase();

  // 1. Calculate tenure years from experience entries
  let minYear = Infinity;
  let maxYear = -Infinity;
  let hasValidYears = false;

  const currentYear = new Date().getFullYear();

  experiences.forEach((exp: any) => {
    // Search all potential date string fields for 4-digit years
    const combinedText = `${exp.startDate || ''} ${exp.endDate || ''} ${exp.period || ''} ${exp.dates || ''} ${exp.year || ''}`;
    const matches = combinedText.match(/\b(19\d\d|20\d\d)\b/g);

    if (matches && matches.length > 0) {
      matches.forEach(yStr => {
        const y = parseInt(yStr, 10);
        if (y >= 1970 && y <= currentYear + 1) {
          minYear = Math.min(minYear, y);
          maxYear = Math.max(maxYear, y);
          hasValidYears = true;
        }
      });
    }
  });

  let tenureYears = 0;
  if (hasValidYears && minYear !== Infinity && maxYear !== -Infinity) {
    tenureYears = Math.max(1, maxYear - minYear);
  } else if (experiences.length > 0) {
    // Fallback: estimate tenure based on role count if date strings lack 4-digit years
    tenureYears = Math.max(1, Math.round(experiences.length * 2.5));
  }

  // 2. Check for executive / leadership titles
  const executiveKeywords = [
    'director', 'vice president', 'vp', 'chief', 'head of', 'lead', 
    'founder', 'c-level', 'partner', 'principal', 'cluster coordination',
    'program manager', 'senior manager', 'country director'
  ];

  const hasExecutiveTitles = experiences.some((exp: any) => {
    const title = (exp.title || '').toLowerCase();
    return executiveKeywords.some(kw => title.includes(kw));
  }) || executiveKeywords.some(kw => headline.includes(kw));

  // 3. Check for student / fresh grad signals
  const isStudent = education.some((edu: any) => {
    const end = (edu.endDate || '').toLowerCase();
    return end.includes('present') || end.includes('expected') || parseInt(end, 10) > currentYear;
  });

  // 4. Derive canonical stage
  let stage: CanonicalCareerStage = 'Fresh Graduate';
  let explanation = '';

  if (tenureYears >= 40) {
    stage = '40+ Year Professional';
    explanation = '40+ years of distinguished professional career history';
  } else if (tenureYears >= 16 || (tenureYears >= 10 && hasExecutiveTitles)) {
    stage = 'Executive (15+ Yrs)';
    explanation = `${tenureYears} years experience with executive/leadership mandates`;
  } else if (tenureYears >= 9) {
    stage = 'Senior Professional (9-15 Yrs)';
    explanation = `${tenureYears} years of verified senior industry experience`;
  } else if (tenureYears >= 4) {
    stage = 'Mid Career (4-8 Yrs)';
    explanation = `${tenureYears} years of mid-level domain experience`;
  } else if (tenureYears >= 1) {
    stage = 'Early Career (1-3 Yrs)';
    explanation = `${tenureYears} years of operational work experience`;
  } else if (isStudent) {
    stage = 'Student';
    explanation = 'Academic degree currently in progress';
  } else {
    stage = 'Fresh Graduate';
    explanation = 'Entry-level candidate starting career trajectory';
  }

  return {
    stage,
    tenureYears,
    roleCount: experiences.length,
    hasExecutiveTitles,
    explanation
  };
}
