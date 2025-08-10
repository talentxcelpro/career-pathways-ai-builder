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
  const lines = plain.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const text = lines.join('\n');
  const email = extractEmails(text);
  const phone = extractPhone(text);
  const name = lines[0]?.length < 120 ? lines[0] : undefined;

  // Very naive section splits
  const sections = text.split(/\n(?=experience|work experience|education|skills|summary)/i);
  const res: ResumeJSON = { ...emptyResume, profile: { name, email, phone } };

  for (const sec of sections) {
    const lower = sec.toLowerCase();
    if (lower.startsWith('summary')) {
      res.summary = sec.replace(/summary[:\s]*/i, '').trim();
    } else if (lower.startsWith('skills')) {
      const list = sec.replace(/skills[:\s]*/i, '')
        .split(/[,•\n]/)
        .map(s => s.trim())
        .filter(Boolean);
      res.skills = Array.from(new Set(list)).slice(0, 50);
    } else if (lower.startsWith('education')) {
      const items = sec.split('\n').slice(1).filter(Boolean).slice(0, 6);
      res.education = items.map(i => ({ school: i, degree: undefined, year: i.match(/\b(20\d{2}|19\d{2})\b/)?.[0] }));
    } else if (lower.startsWith('experience') || lower.startsWith('work experience')) {
      const items = sec.split('\n').slice(1).filter(Boolean);
      const exps: ResumeJSON['experience'] = [];
      let current: ResumeJSON['experience'][number] | null = null;
      for (const line of items) {
        if (/\b(\d{4}|present)\b/i.test(line) || / at | @ /.test(line)) {
          if (current) exps.push(current);
          current = { title: line, company: undefined, startDate: undefined, endDate: undefined, bullets: [] };
        } else {
          current?.bullets.push(line);
        }
      }
      if (current) exps.push(current);
      res.experience = exps.slice(0, 8);
    }
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
