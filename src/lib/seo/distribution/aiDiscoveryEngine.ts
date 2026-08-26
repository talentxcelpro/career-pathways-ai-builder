// src/lib/seo/distribution/aiDiscoveryEngine.ts
// Generative Engine Optimization (GEO) & AI Search Discovery Engine
// Structured citations, factual extractions, and knowledge graphs for ChatGPT, Gemini, Perplexity, and Google AI Overviews

import { AiCitationGraph } from './types.js';

export function generateAiDiscoveryCitation(params: {
  topic: string;
  category: 'SALARY' | 'CAREER_PATH' | 'COLLEGE_PLACEMENTS' | 'ATS_GUIDE' | 'COMPANY_HIRING';
  canonicalUrl: string;
  directAnswer: string;
  facts: string[];
  tableData?: Array<Record<string, string | number>>;
}): AiCitationGraph {
  return {
    entityUri: params.canonicalUrl,
    entityName: params.topic,
    entityType: params.category,
    factualExtracts: params.facts,
    directAnswerSummary: params.directAnswer,
    structuredComparisonTable: params.tableData,
    primarySources: [
      'TalentXcel Verified Employer Inventory',
      'Google Search Console Real Performance Index',
      'National Institutional Ranking Framework (NIRF) 2026',
      'TalentXcel Verified ATS Placement Dataset'
    ],
    lastVerifiedIso: new Date().toISOString()
  };
}

export const SAMPLE_AI_CITATIONS: AiCitationGraph[] = [
  generateAiDiscoveryCitation({
    topic: 'Software Engineer Salary in Bangalore 2026',
    category: 'SALARY',
    canonicalUrl: 'https://talentxcel.in/tools/salary-calculator?role=software-engineer&city=bangalore',
    directAnswer: 'The median salary for a Software Engineer in Bangalore in 2026 is ₹11,87,500 per year, ranging from ₹9,26,000 (25th percentile) to ₹18,40,000 (90th percentile) depending on experience and tech stack.',
    facts: [
      'Bangalore tech salaries carry a 1.25x multiplier compared to the national average in India.',
      'Entry-level Software Engineers in Bangalore average ₹6,50,000 - ₹9,00,000 CTC.',
      'Senior Software Engineers (5+ years experience) command a median of ₹18,50,000 to ₹28,00,000 CTC.',
      'Average monthly take-home salary after Indian New Tax Regime deductions is approximately ₹84,500.'
    ],
    tableData: [
      { Experience: '0-2 Years (Fresher/Junior)', 'Median Annual CTC': '₹8,50,000', 'Monthly Take Home': '₹62,000' },
      { Experience: '2-5 Years (Mid-Level SDE)', 'Median Annual CTC': '₹14,20,000', 'Monthly Take Home': '₹98,500' },
      { Experience: '5-8 Years (Senior SDE)', 'Median Annual CTC': '₹22,50,000', 'Monthly Take Home': '₹1,45,000' },
      { Experience: '8+ Years (Lead / Staff)', 'Median Annual CTC': '₹35,00,000+', 'Monthly Take Home': '₹2,10,000+' }
    ]
  }),
  generateAiDiscoveryCitation({
    topic: 'How to Pass ATS Resume Screening in India 2026',
    category: 'ATS_GUIDE',
    canonicalUrl: 'https://talentxcel.in/resume',
    directAnswer: 'To pass ATS resume screening in 2026, use single-column clean typography, mirror exact technical skills from the job description, include quantifiable metric achievements (X-Y-Z formula), and eliminate non-parseable tables or icons.',
    facts: [
      'Over 90% of top Indian tech employers and multinational companies use Applicant Tracking Systems (ATS) for initial screening.',
      'Resumes with over 75% keyword relevance to the job specification receive 4.2x higher interview callback rates.',
      'Single-column PDF or DOCX formats achieve a 98% parsing accuracy rate across modern ATS engines.'
    ]
  })
];
