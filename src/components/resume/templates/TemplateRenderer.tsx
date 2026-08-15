import React from 'react';
import { cn } from '@/lib/utils';

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
}

interface Template {
  id: string;
  name: string;
  design_config?: {
    colors?: {
      primary: string;
      text: string;
    };
    fonts?: {
      header: string;
      body: string;
    };
  };
}

interface TemplateRendererProps {
  resumeData: any;
  templateId?: string;
  template?: Template | string;
  className?: string;
  customization?: any;
  sectionOrder?: string[];
}

export function formatDateRange(startDate?: string, endDate?: string): string {
  let start = (startDate || '').trim();
  let end = (endDate || '').trim();

  // Handle full date range strings embedded inside start/end
  if (start.includes('–') || start.includes('-') || start.includes(' to ')) {
    const parts = start.split(/\s*[-–—]\s*|\s+to\s+/i);
    start = parts[0]?.trim() || '';
    if (!end && parts[1]) end = parts[1]?.trim() || '';
  }

  if (end.includes('–') || end.includes('-') || end.includes(' to ')) {
    const parts = end.split(/\s*[-–—]\s*|\s+to\s+/i);
    if (!start) start = parts[0]?.trim() || '';
    end = parts[1]?.trim() || parts[0]?.trim() || '';
  }

  if (start && end && start.toLowerCase() === end.toLowerCase()) {
    return start;
  }
  if (start && end) {
    return `${start} – ${end}`;
  }
  if (start) return start;
  if (end && !/^(present|current|ongoing)$/i.test(end)) return end;
  if (end && /^(present|current|ongoing)$/i.test(end)) return 'Present';
  return '';
}

export function getValidCertifications(certs?: any[]): string[] {
  if (!certs || !Array.isArray(certs) || certs.length === 0) return [];
  return certs
    .map(c => typeof c === 'string' ? c : c?.name || c?.certification || c?.title || '')
    .filter(name => {
      if (!name || typeof name !== 'string') return false;
      const clean = name.trim();
      if (clean.length === 0 || clean.length > 70) return false;
      if (/^(ability to|upgraded|automated|developed|created|managed|provided|conducted|maintained|customized)/i.test(clean)) return false;
      return true;
    });
}

export function sanitizeExperienceEntry(exp: any): { title: string; company: string; dateRange: string } {
  let title = (exp?.title || '').trim();
  let company = (exp?.company || '').trim();

  const isDatePattern = (str: string) =>
    /^(january|february|march|april|may|june|july|august|september|october|november|december|\d{4}|\s|–|-|present|current)+$/i.test(str.trim());

  if (isDatePattern(company) || company.toUpperCase() === 'PRESENT' || company.toUpperCase() === 'CURRENT') {
    company = '';
  }

  if (isDatePattern(title)) {
    title = company ? `Role at ${company}` : 'Professional Experience Entry';
  }

  if (!title || title.trim().length === 0) {
    title = company ? `Role at ${company}` : 'Professional Experience Entry';
  }

  const dateRange = formatDateRange(exp?.startDate, exp?.endDate);

  return { title, company, dateRange };
}

const TEMPLATE_CONFIGS: Record<string, { family: string; primary: string; font: string; layout: string }> = {
  // ATS SAFE (6)
  'ats-classic': { family: 'ats', primary: '#1f2937', font: 'Georgia, serif', layout: 'classic' },
  'ats-professional': { family: 'ats', primary: '#374151', font: 'Georgia, serif', layout: 'professional' },
  'ats-compact': { family: 'ats', primary: '#1e40af', font: 'Inter, sans-serif', layout: 'compact' },
  'ats-executive-classic': { family: 'ats', primary: '#1d4ed8', font: 'Georgia, serif', layout: 'executive' },
  'ats-minimal': { family: 'ats', primary: '#111827', font: 'Inter, sans-serif', layout: 'minimal' },
  'ats-two-column': { family: 'ats', primary: '#0f172a', font: 'Inter, sans-serif', layout: 'two-column' },

  // MODERN PROFESSIONAL (6)
  'modern-blue': { family: 'modern', primary: '#2563eb', font: 'Inter, sans-serif', layout: 'banner' },
  'modern-gray': { family: 'modern', primary: '#475569', font: 'Inter, sans-serif', layout: 'slate' },
  'modern-split': { family: 'modern', primary: '#7c3aed', font: 'Inter, sans-serif', layout: 'split' },
  'modern-clean': { family: 'modern', primary: '#059669', font: 'Inter, sans-serif', layout: 'clean' },
  'modern-professional': { family: 'modern', primary: '#0891b2', font: 'Inter, sans-serif', layout: 'professional' },
  'modern-corporate': { family: 'modern', primary: '#1e3a5f', font: 'Inter, sans-serif', layout: 'corporate' },

  // EXECUTIVE (6)
  'executive-leadership': { family: 'executive', primary: '#1c1917', font: 'Inter, sans-serif', layout: 'leadership' },
  'executive-board': { family: 'executive', primary: '#292524', font: 'Georgia, serif', layout: 'board' },
  'executive-strategy': { family: 'executive', primary: '#1e1b4b', font: 'Inter, sans-serif', layout: 'strategy' },
  'executive-pl': { family: 'executive', primary: '#14532d', font: 'Inter, sans-serif', layout: 'pl' },
  'executive-international': { family: 'executive', primary: '#1e3a5f', font: 'Inter, sans-serif', layout: 'international' },
  'executive-minimal': { family: 'executive', primary: '#0c0a09', font: 'Georgia, serif', layout: 'minimal' },

  // TECHNICAL (6)
  'tech-developer': { family: 'technical', primary: '#1d4ed8', font: 'Inter, sans-serif', layout: 'developer' },
  'tech-fullstack': { family: 'technical', primary: '#7c3aed', font: 'Inter, sans-serif', layout: 'fullstack' },
  'tech-engmanager': { family: 'technical', primary: '#0369a1', font: 'Inter, sans-serif', layout: 'engmanager' },
  'tech-data': { family: 'technical', primary: '#b45309', font: 'Inter, sans-serif', layout: 'data' },
  'tech-devops': { family: 'technical', primary: '#0f766e', font: 'Inter, sans-serif', layout: 'devops' },
  'tech-product': { family: 'technical', primary: '#7e22ce', font: 'Inter, sans-serif', layout: 'product' },

  // FRESH GRADUATE (4)
  'grad-classic': { family: 'graduate', primary: '#1d4ed8', font: 'Inter, sans-serif', layout: 'classic' },
  'grad-modern': { family: 'graduate', primary: '#7c3aed', font: 'Inter, sans-serif', layout: 'modern' },
  'grad-projects': { family: 'graduate', primary: '#059669', font: 'Inter, sans-serif', layout: 'projects' },
  'grad-academic': { family: 'graduate', primary: '#0f172a', font: 'Georgia, serif', layout: 'academic' },

  // SALES & BUSINESS (4)
  'sales-enterprise': { family: 'sales', primary: '#b91c1c', font: 'Inter, sans-serif', layout: 'enterprise' },
  'sales-leadership': { family: 'sales', primary: '#991b1b', font: 'Inter, sans-serif', layout: 'leadership' },
  'sales-bizdev': { family: 'sales', primary: '#92400e', font: 'Inter, sans-serif', layout: 'bizdev' },
  'sales-consulting': { family: 'sales', primary: '#1e3a5f', font: 'Inter, sans-serif', layout: 'consulting' },

  // FINANCE & OPS (4)
  'finance-professional': { family: 'finance', primary: '#065f46', font: 'Georgia, serif', layout: 'professional' },
  'finance-controller': { family: 'finance', primary: '#0f4c2a', font: 'Georgia, serif', layout: 'controller' },
  'ops-leader': { family: 'finance', primary: '#7c2d12', font: 'Inter, sans-serif', layout: 'ops' },
  'hr-people': { family: 'finance', primary: '#701a75', font: 'Inter, sans-serif', layout: 'hr' }
};

// ==========================================
// 1. ATS SAFE FAMILY RENDERER (6 TEMPLATES)
// ==========================================
const ATSSafeFamilyRenderer: React.FC<{ resumeData: ResumeData; primaryColor: string; fontFamily: string; isCompact?: boolean; isTwoColumn?: boolean }> = ({
  resumeData,
  primaryColor,
  fontFamily,
  isCompact = false,
  isTwoColumn = false
}) => {
  if (isTwoColumn) {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto shadow-md grid grid-cols-1 md:grid-cols-3 gap-6" style={{ fontFamily }}>
        {/* Left ATS Sidebar */}
        <div className="space-y-4 border-r pr-4" style={{ borderColor: '#e5e7eb' }}>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{resumeData.personalInfo.fullName}</h1>
            <div className="text-[11px] text-gray-600 space-y-0.5 mt-1">
              {resumeData.personalInfo.email && <div>{resumeData.personalInfo.email}</div>}
              {resumeData.personalInfo.phone && <div>{resumeData.personalInfo.phone}</div>}
              {resumeData.personalInfo.location && <div>{resumeData.personalInfo.location}</div>}
            </div>
          </div>
          {resumeData.skills?.length > 0 && (
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>Skills</h2>
              <div className="text-xs text-gray-700 leading-relaxed">{resumeData.skills.join(' • ')}</div>
            </div>
          )}
          {resumeData.education?.length > 0 && (
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>Education</h2>
              {resumeData.education.map((e, i) => (
                <div key={i} className="text-xs mb-1">
                  <div className="font-bold">{e.degree}</div>
                  <div className="text-gray-600">{e.institution}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Main Content */}
        <div className="md:col-span-2 space-y-4">
          {resumeData.personalInfo.summary && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>Professional Summary</h2>
              <p className="text-xs leading-relaxed text-gray-700">{resumeData.personalInfo.summary}</p>
            </div>
          )}
          {resumeData.experience?.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>Professional Experience</h2>
              {resumeData.experience.map((exp, i) => {
                const { title, company, dateRange } = sanitizeExperienceEntry(exp);
                return (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-xs text-gray-900">{title}</h3>
                      {dateRange && <span className="text-[11px] text-gray-600">{dateRange}</span>}
                    </div>
                    {company && <div className="italic text-xs text-gray-700 mb-1">{company}</div>}
                    {exp.description && <p className="text-xs text-gray-700 mb-1">{exp.description}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto shadow-md" style={{ fontFamily }}>
      {/* Header */}
      <div className="text-center mb-6 border-b pb-4" style={{ borderColor: primaryColor }}>
        <h1 className="text-3xl font-bold uppercase tracking-wider mb-2" style={{ color: '#111827' }}>
          {resumeData.personalInfo.fullName}
        </h1>
        <div className="text-xs text-gray-600 space-x-2">
          {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
          {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
          {resumeData.personalInfo.location && <span>• {resumeData.personalInfo.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {resumeData.personalInfo.summary && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-xs leading-relaxed text-gray-700">
            {resumeData.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {resumeData.experience?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-3" style={{ color: primaryColor, borderColor: primaryColor }}>
            PROFESSIONAL EXPERIENCE
          </h2>
          {resumeData.experience.map((exp, index) => {
            const { title, company, dateRange } = sanitizeExperienceEntry(exp);
            return (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-baseline mb-0.5">
                  <h3 className="font-bold text-xs text-gray-900">{title}</h3>
                  {dateRange && <span className="text-[11px] font-semibold text-gray-600">{dateRange}</span>}
                </div>
                {company && (
                  <div className="flex justify-between items-baseline mb-1">
                    <p className="italic text-xs text-gray-700">{company}</p>
                    {exp.location && <span className="text-[11px] text-gray-500">{exp.location}</span>}
                  </div>
                )}
                {exp.description && <p className="text-xs text-gray-700 mb-1">{exp.description}</p>}
                {exp.achievements?.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5 ml-2">
                    {exp.achievements.map((ach, i) => (
                      <li key={i}>{ach}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Education */}
      {resumeData.education?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>
            EDUCATION
          </h2>
          {resumeData.education.map((edu, index) => (
            <div key={index} className="mb-2 flex justify-between items-baseline text-xs">
              <div>
                <span className="font-bold text-gray-900">{edu.degree}</span>
                <span className="italic text-gray-700"> — {edu.institution}</span>
              </div>
              <span className="text-[11px] text-gray-600">{formatDateRange(edu.startDate, edu.endDate)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {resumeData.skills?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>
            TECHNICAL SKILLS
          </h2>
          <p className="text-xs text-gray-700 leading-relaxed">
            {resumeData.skills.join(' • ')}
          </p>
        </div>
      )}

      {/* Projects */}
      {resumeData.projects?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>
            PROJECTS
          </h2>
          {resumeData.projects.map((proj, index) => (
            <div key={index} className="mb-2 text-xs">
              <span className="font-bold text-gray-900">{proj.name}: </span>
              <span className="text-gray-700">{proj.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. MODERN FAMILY RENDERER (6 TEMPLATES)
// ==========================================
const ModernFamilyRenderer: React.FC<{ resumeData: ResumeData; primaryColor: string; fontFamily: string; isSplit?: boolean }> = ({
  resumeData,
  primaryColor,
  fontFamily,
  isSplit = false
}) => {
  if (isSplit) {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6" style={{ fontFamily }}>
        {/* Left Sidebar */}
        <div className="p-4 rounded-xl space-y-6" style={{ backgroundColor: `${primaryColor}10` }}>
          <div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: primaryColor }}>{resumeData.personalInfo.fullName}</h1>
            <div className="text-xs space-y-1 text-gray-600">
              {resumeData.personalInfo.email && <div>{resumeData.personalInfo.email}</div>}
              {resumeData.personalInfo.phone && <div>{resumeData.personalInfo.phone}</div>}
              {resumeData.personalInfo.location && <div>{resumeData.personalInfo.location}</div>}
            </div>
          </div>

          {resumeData.skills?.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: primaryColor }}>Skills</h2>
              <div className="flex flex-wrap gap-1">
                {resumeData.skills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 text-[11px] rounded text-white font-medium" style={{ backgroundColor: primaryColor }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {resumeData.education?.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: primaryColor }}>Education</h2>
              {resumeData.education.map((e, i) => (
                <div key={i} className="mb-2 text-xs">
                  <div className="font-bold text-gray-900">{e.degree}</div>
                  <div className="text-gray-600">{e.institution}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {resumeData.personalInfo.summary && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>Summary</h2>
              <p className="text-xs leading-relaxed text-gray-700">{resumeData.personalInfo.summary}</p>
            </div>
          )}

          {resumeData.experience?.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-3" style={{ color: primaryColor, borderColor: primaryColor }}>Experience</h2>
              {resumeData.experience.map((exp, i) => {
                const { title, company, dateRange } = sanitizeExperienceEntry(exp);
                return (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-xs text-gray-900">{title}</h3>
                      {dateRange && <span className="text-[11px] text-gray-500">{dateRange}</span>}
                    </div>
                    {company && <div className="text-xs font-medium mb-1" style={{ color: primaryColor }}>{company}</div>}
                    {exp.description && <p className="text-xs text-gray-700 mb-1">{exp.description}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg" style={{ fontFamily }}>
      {/* Top Banner Header */}
      <div className="p-6 rounded-xl text-white mb-6 flex flex-col md:flex-row justify-between items-start md:items-center" style={{ backgroundColor: primaryColor }}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{resumeData.personalInfo.fullName}</h1>
        </div>
        <div className="text-xs opacity-90 space-y-0.5 mt-2 md:mt-0 text-right">
          {resumeData.personalInfo.email && <div>{resumeData.personalInfo.email}</div>}
          {resumeData.personalInfo.phone && <div>{resumeData.personalInfo.phone}</div>}
          {resumeData.personalInfo.location && <div>{resumeData.personalInfo.location}</div>}
        </div>
      </div>

      {resumeData.personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b-2 pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>Professional Summary</h2>
          <p className="text-xs leading-relaxed text-gray-700">{resumeData.personalInfo.summary}</p>
        </div>
      )}

      {resumeData.experience?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b-2 pb-1 mb-3" style={{ color: primaryColor, borderColor: primaryColor }}>Work Experience</h2>
          {resumeData.experience.map((exp, index) => {
            const { title, company, dateRange } = sanitizeExperienceEntry(exp);
            return (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-xs text-gray-900">{title}</h3>
                  {dateRange && <span className="text-[11px] font-semibold text-gray-500">{dateRange}</span>}
                </div>
                {company && <div className="text-xs font-semibold mb-1" style={{ color: primaryColor }}>{company}</div>}
                {exp.description && <p className="text-xs text-gray-700 mb-1">{exp.description}</p>}
                {exp.achievements?.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5 ml-2">
                    {exp.achievements.map((ach, i) => (
                      <li key={i}>{ach}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {resumeData.education?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b-2 pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>Education</h2>
          {resumeData.education.map((edu, index) => (
            <div key={index} className="mb-2 flex justify-between text-xs">
              <div>
                <span className="font-bold text-gray-900">{edu.degree}</span>
                <span className="text-gray-600"> — {edu.institution}</span>
              </div>
              <span className="text-gray-500">{formatDateRange(edu.startDate, edu.endDate)}</span>
            </div>
          ))}
        </div>
      )}

      {resumeData.skills?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b-2 pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>Skills Intelligence</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {resumeData.skills.map((s, i) => (
              <div key={i} className="p-2 rounded bg-gray-50 border-l-2 text-xs text-gray-800" style={{ borderColor: primaryColor }}>{s}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. EXECUTIVE FAMILY RENDERER (6 TEMPLATES)
// ==========================================
const ExecutiveFamilyRenderer: React.FC<{ resumeData: ResumeData; primaryColor: string; fontFamily: string }> = ({
  resumeData,
  primaryColor,
  fontFamily
}) => (
  <div className="bg-white p-8 max-w-4xl mx-auto shadow-xl border-t-8" style={{ fontFamily, borderColor: primaryColor }}>
    {/* Executive Header */}
    <div className="mb-6 border-b pb-4">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-1">{resumeData.personalInfo.fullName}</h1>
      <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-600">
        {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
        {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
        {resumeData.personalInfo.location && <span>• {resumeData.personalInfo.location}</span>}
      </div>
    </div>

    {/* Executive Summary Highlight Box */}
    {resumeData.personalInfo.summary && (
      <div className="p-4 rounded-lg mb-6 border-l-4 bg-gray-50" style={{ borderColor: primaryColor }}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-1">Executive Positioning Statement</h2>
        <p className="text-xs leading-relaxed text-gray-800 font-medium">{resumeData.personalInfo.summary}</p>
      </div>
    )}

    {/* Experience */}
    {resumeData.experience?.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-4" style={{ color: primaryColor, borderColor: primaryColor }}>Executive Leadership History</h2>
        {resumeData.experience.map((exp, index) => {
          const { title, company, dateRange } = sanitizeExperienceEntry(exp);
          return (
            <div key={index} className="mb-5">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-sm text-gray-900">{title}</h3>
                {dateRange && <span className="text-xs font-bold text-gray-600">{dateRange}</span>}
              </div>
              {company && <div className="text-xs font-semibold mb-2" style={{ color: primaryColor }}>{company}</div>}
              {exp.description && <p className="text-xs text-gray-700 mb-2 leading-relaxed">{exp.description}</p>}
              {exp.achievements?.length > 0 && (
                <ul className="space-y-1 ml-2 text-xs text-gray-700">
                  {exp.achievements.map((ach, i) => (
                    <li key={i} className="relative pl-3">
                      <span className="absolute left-0 font-bold" style={{ color: primaryColor }}>▪</span>
                      {ach}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    )}

    {/* Board & Education */}
    {resumeData.education?.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-widest border-b pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>Education & Credentials</h2>
        {resumeData.education.map((edu, index) => (
          <div key={index} className="mb-2 flex justify-between text-xs">
            <div>
              <span className="font-bold text-gray-900">{edu.degree}</span>
              <span className="text-gray-700"> — {edu.institution}</span>
            </div>
            <span className="text-gray-600">{formatDateRange(edu.startDate, edu.endDate)}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ==========================================
// 4. TECHNICAL FAMILY RENDERER (6 TEMPLATES)
// ==========================================
const TechnicalFamilyRenderer: React.FC<{ resumeData: ResumeData; primaryColor: string; fontFamily: string }> = ({
  resumeData,
  primaryColor,
  fontFamily
}) => (
  <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg" style={{ fontFamily }}>
    {/* Tech Header */}
    <div className="mb-6 border-b-2 pb-4" style={{ borderColor: primaryColor }}>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">{resumeData.personalInfo.fullName}</h1>
      <div className="flex flex-wrap gap-3 text-xs font-mono text-gray-600">
        {resumeData.personalInfo.email && <span>email: {resumeData.personalInfo.email}</span>}
        {resumeData.personalInfo.phone && <span>phone: {resumeData.personalInfo.phone}</span>}
        {resumeData.personalInfo.location && <span>location: {resumeData.personalInfo.location}</span>}
      </div>
    </div>

    {/* Tech Stack Matrix First */}
    {resumeData.skills?.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider mb-2 font-mono" style={{ color: primaryColor }}>Tech Stack Matrix</h2>
        <div className="flex flex-wrap gap-1.5">
          {resumeData.skills.map((s, i) => (
            <span key={i} className="px-2.5 py-1 text-xs font-mono rounded bg-slate-100 text-slate-800 border border-slate-300 font-semibold">{s}</span>
          ))}
        </div>
      </div>
    )}

    {/* Technical Experience */}
    {resumeData.experience?.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-3 font-mono" style={{ color: primaryColor, borderColor: primaryColor }}>Engineering History</h2>
        {resumeData.experience.map((exp, index) => {
          const { title, company, dateRange } = sanitizeExperienceEntry(exp);
          return (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-xs text-gray-900">{title}</h3>
                {dateRange && <span className="text-[11px] font-mono text-gray-500">{dateRange}</span>}
              </div>
              {company && <div className="text-xs font-semibold mb-1" style={{ color: primaryColor }}>{company}</div>}
              {exp.description && <p className="text-xs text-gray-700 mb-1 leading-relaxed">{exp.description}</p>}
              {exp.achievements?.length > 0 && (
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5 ml-2">
                  {exp.achievements.map((ach, i) => (
                    <li key={i}>{ach}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    )}

    {/* Projects */}
    {resumeData.projects?.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2 font-mono" style={{ color: primaryColor, borderColor: primaryColor }}>Key Systems & Projects</h2>
        {resumeData.projects.map((proj, index) => (
          <div key={index} className="mb-3 text-xs p-3 rounded bg-slate-50 border border-slate-200">
            <div className="font-bold text-gray-900 mb-0.5">{proj.name}</div>
            <div className="text-gray-700 mb-1">{proj.description}</div>
            {proj.technologies?.length > 0 && (
              <div className="text-[11px] font-mono text-gray-500">Tech: {proj.technologies.join(', ')}</div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

// ==========================================
// 5. FRESH GRADUATE FAMILY RENDERER (4 TEMPLATES)
// ==========================================
const GraduateFamilyRenderer: React.FC<{ resumeData: ResumeData; primaryColor: string; fontFamily: string }> = ({
  resumeData,
  primaryColor,
  fontFamily
}) => (
  <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg" style={{ fontFamily }}>
    {/* Header */}
    <div className="text-center mb-6 border-b-2 pb-4" style={{ borderColor: primaryColor }}>
      <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: primaryColor }}>{resumeData.personalInfo.fullName}</h1>
      <div className="text-xs text-gray-600 space-x-2">
        {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
        {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
        {resumeData.personalInfo.location && <span>• {resumeData.personalInfo.location}</span>}
      </div>
    </div>

    {/* Education FIRST for Graduates */}
    {resumeData.education?.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-3" style={{ color: primaryColor, borderColor: primaryColor }}>Education & Academic Qualifications</h2>
        {resumeData.education.map((edu, index) => (
          <div key={index} className="mb-3 p-3 rounded bg-gray-50 border-l-4" style={{ borderColor: primaryColor }}>
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-bold text-xs text-gray-900">{edu.degree}</h3>
              <span className="text-[11px] font-semibold text-gray-600">{formatDateRange(edu.startDate, edu.endDate)}</span>
            </div>
            <div className="text-xs text-gray-700">{edu.institution}</div>
          </div>
        ))}
      </div>
    )}

    {/* Projects SECOND for Graduates */}
    {resumeData.projects?.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-3" style={{ color: primaryColor, borderColor: primaryColor }}>Capstone Projects & Portfolio</h2>
        {resumeData.projects.map((proj, index) => (
          <div key={index} className="mb-3 text-xs">
            <h3 className="font-bold text-gray-900">{proj.name}</h3>
            <p className="text-gray-700 mb-1">{proj.description}</p>
          </div>
        ))}
      </div>
    )}

    {/* Experience */}
    {resumeData.experience?.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-3" style={{ color: primaryColor, borderColor: primaryColor }}>Internships & Work Experience</h2>
        {resumeData.experience.map((exp, index) => {
          const { title, company, dateRange } = sanitizeExperienceEntry(exp);
          return (
            <div key={index} className="mb-3 text-xs">
              <div className="flex justify-between items-baseline mb-0.5">
                <h3 className="font-bold text-gray-900">{title}</h3>
                {dateRange && <span className="text-[11px] text-gray-500">{dateRange}</span>}
              </div>
              {company && <div className="text-gray-700 italic mb-1">{company}</div>}
              {exp.description && <p className="text-gray-700">{exp.description}</p>}
            </div>
          );
        })}
      </div>
    )}
  </div>
);

// ==========================================
// 6. SALES & BUSINESS FAMILY RENDERER (4 TEMPLATES)
// ==========================================
const SalesFamilyRenderer: React.FC<{ resumeData: ResumeData; primaryColor: string; fontFamily: string }> = ({
  resumeData,
  primaryColor,
  fontFamily
}) => (
  <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg border-l-8" style={{ fontFamily, borderColor: primaryColor }}>
    {/* Sales Header */}
    <div className="mb-6 border-b pb-4">
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-1">{resumeData.personalInfo.fullName}</h1>
      <div className="flex flex-wrap gap-3 text-xs font-semibold text-gray-600">
        {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
        {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
        {resumeData.personalInfo.location && <span>• {resumeData.personalInfo.location}</span>}
      </div>
    </div>

    {/* Quota & Revenue Performance Banner */}
    <div className="p-3 rounded-lg mb-6 text-white flex justify-between items-center text-xs font-bold" style={{ backgroundColor: primaryColor }}>
      <span>REVENUE & QUOTA PERFORMANCE RECORD</span>
      <span>ENTERPRISE COMMERCIAL TRACK RECORD</span>
    </div>

    {/* Summary */}
    {resumeData.personalInfo.summary && (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>Commercial Positioning Summary</h2>
        <p className="text-xs leading-relaxed text-gray-800">{resumeData.personalInfo.summary}</p>
      </div>
    )}

    {/* Experience */}
    {resumeData.experience?.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-3" style={{ color: primaryColor, borderColor: primaryColor }}>Sales & Business Experience</h2>
        {resumeData.experience.map((exp, index) => {
          const { title, company, dateRange } = sanitizeExperienceEntry(exp);
          return (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-xs text-gray-900">{title}</h3>
                {dateRange && <span className="text-[11px] font-semibold text-gray-600">{dateRange}</span>}
              </div>
              {company && <div className="text-xs font-semibold mb-1" style={{ color: primaryColor }}>{company}</div>}
              {exp.description && <p className="text-xs text-gray-700 mb-1">{exp.description}</p>}
              {exp.achievements?.length > 0 && (
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5 ml-2">
                  {exp.achievements.map((ach, i) => (
                    <li key={i}>{ach}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    )}

    {/* Education */}
    {resumeData.education?.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>Education & Training</h2>
        {resumeData.education.map((edu, index) => (
          <div key={index} className="mb-2 flex justify-between text-xs">
            <div>
              <span className="font-bold text-gray-900">{edu.degree}</span>
              <span className="text-gray-600"> — {edu.institution}</span>
            </div>
            <span className="text-gray-500">{formatDateRange(edu.startDate, edu.endDate)}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ==========================================
// 7. FINANCE & OPS FAMILY RENDERER (4 TEMPLATES)
// ==========================================
const FinanceFamilyRenderer: React.FC<{ resumeData: ResumeData; primaryColor: string; fontFamily: string }> = ({
  resumeData,
  primaryColor,
  fontFamily
}) => (
  <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg" style={{ fontFamily }}>
    {/* Finance Header */}
    <div className="text-center mb-6 border-b-2 pb-4" style={{ borderColor: primaryColor }}>
      <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-900 mb-1">{resumeData.personalInfo.fullName}</h1>
      <div className="text-xs text-gray-600 space-x-2">
        {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
        {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
        {resumeData.personalInfo.location && <span>• {resumeData.personalInfo.location}</span>}
      </div>
    </div>

    {/* Certifications & Governance Block */}
    {getValidCertifications(resumeData.certifications).length > 0 && (
      <div className="p-3 rounded mb-6 border bg-slate-50 text-xs" style={{ borderColor: primaryColor }}>
        <span className="font-bold uppercase tracking-wider mr-2" style={{ color: primaryColor }}>Credentials & Compliance:</span>
        <span className="text-gray-800">{getValidCertifications(resumeData.certifications).join(' • ')}</span>
      </div>
    )}

    {/* Summary */}
    {resumeData.personalInfo.summary && (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>Financial & Operational Overview</h2>
        <p className="text-xs leading-relaxed text-gray-800">{resumeData.personalInfo.summary}</p>
      </div>
    )}

    {/* Experience */}
    {resumeData.experience?.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-3" style={{ color: primaryColor, borderColor: primaryColor }}>Career History</h2>
        {resumeData.experience.map((exp, index) => {
          const { title, company, dateRange } = sanitizeExperienceEntry(exp);
          return (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-xs text-gray-900">{title}</h3>
                {dateRange && <span className="text-[11px] font-semibold text-gray-600">{dateRange}</span>}
              </div>
              {company && <div className="text-xs font-semibold mb-1" style={{ color: primaryColor }}>{company}</div>}
              {exp.description && <p className="text-xs text-gray-700 mb-1">{exp.description}</p>}
              {exp.achievements?.length > 0 && (
                <ul className="list-disc list-inside text-xs text-gray-700 space-y-0.5 ml-2">
                  {exp.achievements.map((ach, i) => (
                    <li key={i}>{ach}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    )}

    {/* Education */}
    {resumeData.education?.length > 0 && (
      <div className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider border-b pb-1 mb-2" style={{ color: primaryColor, borderColor: primaryColor }}>Education & Academic Qualifications</h2>
        {resumeData.education.map((edu, index) => (
          <div key={index} className="mb-2 flex justify-between text-xs">
            <div>
              <span className="font-bold text-gray-900">{edu.degree}</span>
              <span className="text-gray-600"> — {edu.institution}</span>
            </div>
            <span className="text-gray-500">{formatDateRange(edu.startDate, edu.endDate)}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const convertSkills = (skills: any): string[] => {
  if (!skills || skills.length === 0) return [];
  if (typeof skills[0] === 'string') return skills;
  return skills.map((s: any) => s.name || s.skill || String(s));
};

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  resumeData,
  template,
  templateId,
  className
}) => {
  const templateObj = typeof template === 'string' 
    ? { id: template, name: template, design_config: undefined }
    : template;
    
  const prepareSourceFidelityData = (data: any) => {
    if (!data) return data;
    return {
      ...data,
      skills: convertSkills(data.skills)
    };
  };

  const formattedData = prepareSourceFidelityData(resumeData);

  const tid = (templateId || templateObj?.id || 'modern-blue').toLowerCase();
  const config = TEMPLATE_CONFIGS[tid] || { family: 'modern', primary: '#2563eb', font: 'Inter, sans-serif', layout: 'banner' };

  const renderFamily = () => {
    switch (config.family) {
      case 'ats':
        return <ATSSafeFamilyRenderer resumeData={formattedData} primaryColor={config.primary} fontFamily={config.font} isCompact={config.layout === 'compact'} isTwoColumn={config.layout === 'two-column'} />;
      case 'executive':
        return <ExecutiveFamilyRenderer resumeData={formattedData} primaryColor={config.primary} fontFamily={config.font} />;
      case 'technical':
        return <TechnicalFamilyRenderer resumeData={formattedData} primaryColor={config.primary} fontFamily={config.font} />;
      case 'graduate':
        return <GraduateFamilyRenderer resumeData={formattedData} primaryColor={config.primary} fontFamily={config.font} />;
      case 'sales':
        return <SalesFamilyRenderer resumeData={formattedData} primaryColor={config.primary} fontFamily={config.font} />;
      case 'finance':
        return <FinanceFamilyRenderer resumeData={formattedData} primaryColor={config.primary} fontFamily={config.font} />;
      case 'modern':
      default:
        return <ModernFamilyRenderer resumeData={formattedData} primaryColor={config.primary} fontFamily={config.font} isSplit={config.layout === 'split'} />;
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {renderFamily()}
    </div>
  );
};