// Formatter to produce the strict, section-wise ATS JSON used across TalentXcel
// - Accepts multiple input shapes (profile/personalInfo, work/experience, etc.)
// - Picks the first non-empty value from common synonyms
// - Never fabricates content; falls back to "" or []
// - Matches EXACT keys/casing from product schema

export type ATSStrict = {
  ats: {
    profile: {
      fullName: string;
      phone: string;
      email: string;
      location: string;
      linkedin: string;
      portfolio: string;
      github: string;
      dob: string;
    };
    summary: string;
    experience: Array<{
      jobTitle: string;
      companyName: string;
      location: string;
      startDate: string;
      endDate: string;
      currentlyWorking: boolean;
      description: string;
    }>;
    education: Array<{
      degree: string;
      fieldOfStudy: string;
      institution: string;
      location: string;
      startDate: string;
      endDate: string;
      description: string;
    }>;
    skills: Array<{
      name: string;
      proficiency: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      issueDate: string;
      expiryDate: string;
    }>;
    projects: Array<{
      title: string;
      description: string;
      technologies: string[];
      link: string;
    }>;
    awards: Array<{
      title: string;
      issuer: string;
      date: string;
      description: string;
    }>;
    languages: Array<{
      name: string;
      proficiency: string;
    }>;
    interests: string[];
  };
};

const clean = (v: any): string =>
  (typeof v === 'string' ? v : v == null ? '' : String(v))
    .replace(/\s+/g, ' ')
    .trim();

const nonEmpty = (v: any) => v !== undefined && v !== null && clean(v) !== '';

const pick = (obj: any, keys: string[]): string => {
  for (const k of keys) {
    if (nonEmpty(obj?.[k])) return clean(obj?.[k]);
  }
  return '';
};

const toArray = <T = any>(val: any): T[] => (Array.isArray(val) ? val : val ? [val] : []);

const isPresent = (s: string) => /present|current|now/i.test(s);

export function toATSJson(raw: any): ATSStrict {
  const profileSrc = raw?.profile || raw?.personalInfo || raw || {};

  const profile = {
    fullName: pick(profileSrc, ['fullName', 'name', 'full_name']),
    phone: pick(profileSrc, ['phone', 'mobile']),
    email: pick(profileSrc, ['email']),
    location: pick(profileSrc, ['location', 'city']),
    linkedin: pick(profileSrc, ['linkedin', 'linkedIn', 'linkedinUrl']),
    portfolio: pick(profileSrc, ['portfolio', 'website', 'site', 'portfolioUrl']),
    github: pick(profileSrc, ['github', 'gitHub', 'githubUrl']),
    dob: pick(profileSrc, ['dob', 'dateOfBirth', 'birthDate'])
  } as ATSStrict['ats']['profile'];

  const summary = pick(raw, ['summary']) || pick(profileSrc, ['summary']);

  // Experience
  const expSrc: any[] = toArray(raw?.experience || raw?.workExperience || raw?.work || raw?.experiences);
  const experience: ATSStrict['ats']['experience'] = expSrc.map((e) => {
    const start = pick(e, ['startDate', 'start', 'from']);
    const end = pick(e, ['endDate', 'end', 'to']);
    const currentlyWorking = !nonEmpty(end) || isPresent(end);
    return {
      jobTitle: pick(e, ['jobTitle', 'title', 'position', 'role']),
      companyName: pick(e, ['companyName', 'company', 'organization', 'employer']),
      location: pick(e, ['location', 'city']),
      startDate: start,
      endDate: end,
      currentlyWorking,
      description: pick(e, ['description', 'summary', 'details'])
    };
  }).filter((e) => e.jobTitle || e.companyName || e.description || e.startDate || e.endDate);

  // Education
  const eduSrc: any[] = toArray(raw?.education);
  const education: ATSStrict['ats']['education'] = eduSrc.map((ed) => ({
    degree: pick(ed, ['degree']),
    fieldOfStudy: pick(ed, ['fieldOfStudy', 'field', 'major']),
    institution: pick(ed, ['institution', 'school', 'university', 'college']),
    location: pick(ed, ['location', 'city']),
    startDate: pick(ed, ['startDate', 'start', 'from']),
    endDate: pick(ed, ['endDate', 'end', 'to', 'graduationDate', 'year']),
    description: pick(ed, ['description', 'details'])
  })).filter((ed) => ed.degree || ed.institution || ed.endDate);

  // Skills (supports strings or objects)
  const skillsRaw = toArray(raw?.skills);
  const skills: ATSStrict['ats']['skills'] = skillsRaw.map((s) => ({
    name: clean(typeof s === 'string' ? s : s?.name || s?.skill || s?.title || s?.value || ''),
    proficiency: clean(typeof s === 'object' ? s?.proficiency || s?.level : '')
  })).filter((s) => s.name);

  const certifications: ATSStrict['ats']['certifications'] = toArray(raw?.certifications).map((c) => ({
    name: pick(c, ['name', 'title']),
    issuer: pick(c, ['issuer', 'authority']),
    issueDate: pick(c, ['issueDate', 'issued', 'date']),
    expiryDate: pick(c, ['expiryDate', 'expires'])
  })).filter((c) => c.name || c.issuer);

  const projects: ATSStrict['ats']['projects'] = toArray(raw?.projects).map((p) => ({
    title: pick(p, ['title', 'name']),
    description: pick(p, ['description', 'summary', 'details']),
    technologies: toArray(p?.technologies).map((t) => clean(t)).filter(Boolean),
    link: pick(p, ['link', 'url'])
  })).filter((p) => p.title || p.description);

  const awards: ATSStrict['ats']['awards'] = toArray(raw?.awards).map((a) => ({
    title: pick(a, ['title', 'name']),
    issuer: pick(a, ['issuer', 'authority']),
    date: pick(a, ['date', 'issueDate', 'year']),
    description: pick(a, ['description', 'details'])
  })).filter((a) => a.title || a.issuer);

  const languages: ATSStrict['ats']['languages'] = toArray(raw?.languages).map((l) => ({
    name: pick(l, ['name', 'language']),
    proficiency: pick(l, ['proficiency', 'level'])
  })).filter((l) => l.name);

  const interests: ATSStrict['ats']['interests'] = toArray(raw?.interests).map((i) => clean(i)).filter(Boolean);

  return {
    ats: {
      profile,
      summary: clean(summary),
      experience,
      education,
      skills,
      certifications,
      projects,
      awards,
      languages,
      interests
    }
  };
}
