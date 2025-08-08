// Formatter to produce the strict ATS JSON requested by product
// It fills missing fields conservatively (''), avoids fabricating data,
// and normalizes multiple input shapes (profile/personalInfo, experience/work, etc.)

export interface ATSOutputProfile {
  fullName: string;
  phone: string;
  email: string;
  location: string;
  linkedin: string;
  portfolio: string;
}

export interface ATSOutputExperience {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ATSOutputEducation {
  degree: string;
  fieldOfStudy: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface ATSOutputProject {
  title: string;
  description: string;
  technologies: string[];
}

export interface ATSOutputSchema {
  ats: {
    profile: ATSOutputProfile;
    summary: string;
    experience: ATSOutputExperience[];
    education: ATSOutputEducation[];
    skills: string[];
    certifications: string[];
    languages: string[];
    projects: ATSOutputProject[];
  };
}

const clean = (v: any): string => (typeof v === 'string' ? v : v == null ? '' : String(v))
  .replace(/\s+/g, ' ')
  .trim();

const toArray = <T = any>(val: any): T[] => Array.isArray(val) ? val : val ? [val] as T[] : [] as T[];

const pick = (obj: any, keys: string[]): string => {
  for (const k of keys) {
    const val = obj?.[k];
    if (val != null && val !== '') return clean(val);
  }
  return '';
};

export function toATSJson(input: any, targetRole?: string): ATSOutputSchema {
  const profileSrc = input?.profile || input?.personalInfo || input || {};

  const profile: ATSOutputProfile = {
    fullName: pick(profileSrc, ['fullName', 'name']),
    phone: pick(profileSrc, ['phone']),
    email: pick(profileSrc, ['email']),
    location: pick(profileSrc, ['location', 'city']),
    linkedin: pick(profileSrc, ['linkedin', 'linkedIn', 'linkedinUrl']),
    portfolio: pick(profileSrc, ['portfolio', 'website', 'github', 'portfolioUrl', 'site']),
  };

  const summaryRaw = pick(input, ['summary']) || pick(profileSrc, ['summary']);
  const summary = summaryRaw ? summaryRaw : '';

  const expSrc: any[] = toArray(input?.experience || input?.workExperience || input?.work || input?.experiences);
  const experience: ATSOutputExperience[] = expSrc.map((e) => ({
    jobTitle: pick(e, ['jobTitle', 'title', 'position', 'role']),
    company: pick(e, ['company', 'organization', 'employer']),
    location: pick(e, ['location', 'city']),
    startDate: pick(e, ['startDate', 'start', 'from']),
    endDate: pick(e, ['endDate', 'end', 'to']),
    description: pick(e, ['description', 'summary', 'details'])
  })).filter((e) => e.jobTitle || e.company || e.description);

  const eduSrc: any[] = toArray(input?.education);
  const education: ATSOutputEducation[] = eduSrc.map((ed) => ({
    degree: pick(ed, ['degree']),
    fieldOfStudy: pick(ed, ['fieldOfStudy', 'field', 'major']),
    institution: pick(ed, ['institution', 'school', 'university', 'college']),
    location: pick(ed, ['location', 'city']),
    startDate: pick(ed, ['startDate', 'start', 'from']),
    endDate: pick(ed, ['endDate', 'end', 'to', 'graduationDate'])
  })).filter((ed) => ed.degree || ed.institution || ed.endDate);

  const skillsRaw = toArray(input?.skills);
  const skills = skillsRaw.map((s: any) => typeof s === 'string' ? clean(s) : clean(s?.name || s?.skill || s?.title || s?.value))
    .filter(Boolean);

  const certs = toArray(input?.certifications).map(clean).filter(Boolean);
  const languages = toArray(input?.languages).map(clean).filter(Boolean);

  const projectsSrc: any[] = toArray(input?.projects);
  const projects: ATSOutputProject[] = projectsSrc.map((p) => ({
    title: pick(p, ['title', 'name']),
    description: pick(p, ['description', 'summary', 'details']),
    technologies: toArray(p?.technologies).map(clean).filter(Boolean)
  })).filter((p) => p.title || p.description);

  return {
    ats: {
      profile,
      summary,
      experience,
      education,
      skills,
      certifications: certs,
      languages,
      projects,
    }
  };
}
