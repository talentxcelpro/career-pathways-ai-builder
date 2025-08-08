// ATS JSON normalizer for resume data
// Ensures: no invented info, trims/cleans text, de-duplicates skills,
// converts multiple input shapes to strict ATS schema used by Preview.

export interface ATSExperience {
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

export interface ATSEducation {
  degree: string;
  institution: string;
  year: string;
}

export interface ATSProfile {
  fullName: string;
  phone: string;
  email: string;
  location: string;
}

export interface ATSResume {
  profile: ATSProfile;
  summary: string;
  skills: string[];
  experience: ATSExperience[];
  education: ATSEducation[];
}

const cleanText = (s?: string) =>
  (s || '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:])/g, '$1')
    .trim();

const sentenceCase = (s?: string) => {
  const t = cleanText(s);
  if (!t) return '';
  const capped = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?]$/.test(capped) ? capped : capped + '.';
};

const toArray = (val: any): any[] =>
  Array.isArray(val) ? val : val ? [val] : [];

const dedupe = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

const normalizeDate = (d: any): string => cleanText(d) || '';

export function normalizeResumeATS(parsedData: any, targetRole?: string): ATSResume {
  const profileSrc = parsedData?.profile || parsedData?.personalInfo || parsedData || {};

  const profile: ATSProfile = {
    fullName: cleanText(profileSrc.fullName || profileSrc.name),
    phone: cleanText(profileSrc.phone),
    email: cleanText(profileSrc.email),
    location: cleanText(profileSrc.location),
  };

  // Summary: keep factual; lightly clean and optionally prefix role
  const rawSummary = parsedData?.summary || profileSrc?.summary || '';
  const summary = rawSummary
    ? sentenceCase(targetRole ? `Experienced ${targetRole} — ${rawSummary}` : rawSummary)
    : '';

  // Skills: accept strings or objects, dedupe, keep concise
  const skillsRaw = parsedData?.skills || profileSrc?.skills || [];
  const extractSkill = (s: any): string => {
    if (!s) return '';
    if (typeof s === 'string') return cleanText(s);
    if (typeof s === 'object') {
      const v = s.name || s.skill || s.title || s.value || '';
      return cleanText(String(v));
    }
    return cleanText(String(s));
  };
  const skills = dedupe(toArray(skillsRaw).flat().map(extractSkill)).slice(0, 50);

  // Experience: map common shapes; never fabricate entries
  const expSrc: any[] = toArray(parsedData?.experience || parsedData?.work || []);
  const experience: ATSExperience[] = expSrc.map((e) => {
    const bullets = toArray(e?.responsibilities || e?.achievements || e?.bullets || [])
      .flatMap((b) =>
        typeof b === 'string'
          ? cleanText(b).split(/\n|•|\-/).map((x) => cleanText(x))
          : []
      )
      .filter(Boolean);

    // If description is a long paragraph, split into concise points
    if (!bullets.length && typeof e?.description === 'string') {
      const parts = e.description.split(/\.|\\n|•|\-/).map((x: string) => cleanText(x));
      parts.forEach((p) => p && bullets.push(p));
    }

    return {
      jobTitle: cleanText(e?.jobTitle || e?.title || e?.position),
      company: cleanText(e?.company),
      location: cleanText(e?.location),
      startDate: normalizeDate(e?.startDate || e?.start || e?.from),
      endDate: normalizeDate(e?.endDate || e?.end || e?.to),
      responsibilities: dedupe(bullets).slice(0, 12),
    };
  }).filter((e) => e.jobTitle || e.company || e.startDate || e.endDate);

  // Education
  const eduSrc: any[] = toArray(parsedData?.education || []);
  const education: ATSEducation[] = eduSrc.map((ed) => ({
    degree: cleanText(ed?.degree),
    institution: cleanText(ed?.institution || ed?.school),
    year: cleanText(ed?.year || ed?.endDate || ed?.graduationDate),
  })).filter((ed) => ed.degree || ed.institution || ed.year);

  return {
    profile,
    summary,
    skills,
    experience,
    education,
  };
}
