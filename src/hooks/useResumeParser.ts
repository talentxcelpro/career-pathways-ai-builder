import { useCallback } from 'react';
import mammoth from 'mammoth';
// pdfjs-dist ESM build
// @ts-ignore - pdfjs typing path
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ResumeJSON {
  profile: { name?: string; email?: string; phone?: string; location?: string };
  summary?: string;
  experience: Array<{ title?: string; company?: string; startDate?: string; endDate?: string; bullets: string[] }>;
  education: Array<{ school?: string; degree?: string; year?: string }>;
  skills: string[];
}

const emptyResume: ResumeJSON = {
  profile: {},
  summary: '',
  experience: [],
  education: [],
  skills: []
};

const extractEmails = (text: string): string | undefined => {
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m?.[0];
};

const extractPhone = (text: string): string | undefined => {
  const m = text.match(/\+?\d[\d\s().-]{8,}/);
  return m?.[0]?.trim();
};

const naiveParse = (plain: string): ResumeJSON => {
  // Normalize whitespace and split into lines
  const raw = (plain || '').replace(/\u00A0/g, ' ').replace(/\t+/g, ' ').replace(/ +/g, ' ');
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const fullText = lines.join('\n');

  // Basic contact info
  const email = extractEmails(fullText);
  const phone = extractPhone(fullText);
  const linkedin = fullText.match(/(linkedin\.com\/[A-Za-z0-9\-_/]+)/i)?.[1];
  const website = fullText.match(/https?:\/\/[^\s]+/i)?.[0];

  // Heuristic header parsing (name/title/location)
  const top = lines.slice(0, 6);
  const nameCandidate = top.find(l => /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(l) && l.length < 100) || lines[0];
  const titleCandidate = top.find(l => /architect|engineer|developer|manager|consultant|analyst|designer|lead|director|scientist|expert|specialist/i.test(l) && l !== nameCandidate);
  const locationCandidate = fullText.match(/\b([A-Z][a-zA-Z]+(?:[,\s]+[A-Z][a-zA-Z]+)*)\b\s*(?:\(|,)?\s*(Netherlands|India|USA|United\s+States|UK|United\s+Kingdom|Canada|Germany|France|Netherlands|Amsterdam|Bengaluru|Bangalore|London|New\s+York|Delhi|Hyderabad|Chennai)?/i)?.[0];

  const res: ResumeJSON = {
    ...emptyResume,
    profile: {
      name: nameCandidate && nameCandidate.length < 120 ? nameCandidate : undefined,
      email,
      phone,
      location: locationCandidate?.slice(0, 80),
    },
  };

  // Section-aware parsing
  const sectionSplit = fullText.split(/\n(?=\s*(profile|summary|professional summary|experience|work experience|education|skills|projects|certifications|awards)\b)/i);

  const pushExperience = (block: string) => {
    const expLines = block.split(/\n/).slice(1).map(l => l.trim()).filter(Boolean);
    const exps: ResumeJSON['experience'] = [];
    let current: ResumeJSON['experience'][number] | null = null;

    const dateLine = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\b)\s*[-–]\s*(\b(?:Present|Current|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})\b)/i;

    for (const l of expLines) {
      if (dateLine.test(l) || / at | @ /i.test(l) || /\s+-\s+/.test(l)) {
        // Start of a new role
        if (current) exps.push(current);
        // Try to split role/company
        const parts = l.split(/\s+[-@]|\sat\s|\s@\s/i).map(p => p.trim()).filter(Boolean);
        const title = parts[0] || l;
        const company = parts.slice(1).join(' - ') || undefined;
        const dates = l.match(dateLine);
        current = {
          title,
          company,
          startDate: dates?.[1],
          endDate: dates?.[2],
          bullets: [],
        } as any;
      } else if (/^[•\-\u2022\u25CF\u00B7]/.test(l)) {
        current?.bullets.push(l.replace(/^[•\-\u2022\u25CF\u00B7]\s*/, ''));
      } else if (l.length > 0) {
        // Treat as continuation bullet if we have a current item
        current?.bullets.push(l);
      }
    }
    if (current) exps.push(current);
    res.experience = exps.slice(0, 12);
  };

  for (const block of sectionSplit) {
    const lower = block.toLowerCase();
    if (/^(profile|summary|professional summary)/i.test(block)) {
      const text = block.replace(/^(profile|summary|professional summary)[:\s]*/i, '').trim();
      res.summary = text;
      // If we found a title earlier, attach to profile
      if (titleCandidate) {
        (res.profile as any).title = titleCandidate;
      }
      if (linkedin && !(res.profile as any).linkedin) (res.profile as any).linkedin = linkedin;
      if (website && !(res.profile as any).website) (res.profile as any).website = website;
    } else if (/^(skills)\b/i.test(block)) {
      const list = block.replace(/^skills[:\s]*/i, '')
        .split(/[,•\n;\|]/)
        .map(s => s.trim())
        .filter(Boolean);
      res.skills = Array.from(new Set(list)).slice(0, 100);
    } else if (/^(education)\b/i.test(block)) {
      const items = block.split(/\n/).slice(1).filter(Boolean).slice(0, 8);
      res.education = items.map(i => ({
        school: i,
        degree: undefined,
        year: i.match(/\b(20\d{2}|19\d{2})\b/)?.[0]
      }));
    } else if (/^(experience|work experience)\b/i.test(block)) {
      pushExperience(block);
    }
  }

  // Fallbacks if sections were not identified
  if (!res.summary && lines.length > 1) {
    const firstParas = lines.slice(1, 15);
    res.summary = firstParas.join(' ').slice(0, 800);
  }

  return res;
};

export const useResumeParser = () => {
  const parseDocx = useCallback(async (file: File): Promise<ResumeJSON> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return naiveParse(result.value || '');
  }, []);

  const parsePdf = useCallback(async (file: File): Promise<ResumeJSON> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await (pdfjsLib as any).getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((it: any) => it.str);
      fullText += strings.join(' ') + '\n';
    }
    return naiveParse(fullText);
  }, []);

  const parseFile = useCallback(async (file: File): Promise<ResumeJSON> => {
    const ext = file.name.toLowerCase();
    if (ext.endsWith('.docx')) return parseDocx(file);
    if (ext.endsWith('.pdf')) return parsePdf(file);
    // fallback: try docx by default
    try { return await parseDocx(file); } catch { return emptyResume; }
  }, [parseDocx, parsePdf]);

  return { parseFile };
};
