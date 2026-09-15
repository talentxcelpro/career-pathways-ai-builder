// src/lib/seo/distribution/programmaticUtilityEngine.ts
// Programmatic Utility & Calculation Engine (Wise, Zapier, Canva Models)
// Generates calculated data, entity intersections, and actionable tool entrypoints

import { ProgrammaticUtilityEntity } from './types.js';

export interface SalaryCalculationInput {
  role: string;
  location: string;
  experienceYears: number;
  skills?: string[];
}

export function computeCalculatedSalaryIntelligence(input: SalaryCalculationInput): ProgrammaticUtilityEntity {
  const baseSalaryMap: Record<string, number> = {
    'software engineer': 950000,
    'senior software engineer': 1850000,
    'full stack developer': 1100000,
    'data scientist': 1300000,
    'product manager': 1650000,
    'marketing executive': 550000,
    'content writer': 420000,
    'devops engineer': 1400000,
    'ai engineer': 1750000,
    'safety officer': 600000,
    'credit analyst': 780000
  };

  const cityMultiplierMap: Record<string, number> = {
    'bangalore': 1.25,
    'bengaluru': 1.25,
    'mumbai': 1.20,
    'delhi': 1.15,
    'noida': 1.10,
    'gurgaon': 1.20,
    'hyderabad': 1.15,
    'pune': 1.10,
    'chennai': 1.05,
    'kolkata': 0.90,
    'india': 1.00
  };

  const normalizedRole = input.role.toLowerCase().trim();
  const normalizedCity = input.location.toLowerCase().trim();

  let base = baseSalaryMap[normalizedRole] || 800000;
  const multiplier = cityMultiplierMap[normalizedCity] || 1.0;
  const expMultiplier = 1 + (input.experienceYears * 0.12);

  const median = Math.round(base * multiplier * expMultiplier);
  const p25 = Math.round(median * 0.78);
  const p75 = Math.round(median * 1.28);
  const p90 = Math.round(median * 1.55);

  // Simplified Indian New Tax Regime monthly in-hand estimation
  const grossMonthly = Math.round(median / 12);
  let taxRate = 0.10;
  if (median > 1500000) taxRate = 0.20;
  else if (median > 1000000) taxRate = 0.15;
  else if (median <= 700000) taxRate = 0.0;

  const monthlyTax = Math.round(grossMonthly * taxRate);
  const inHandMonthly = grossMonthly - monthlyTax;

  const primaryKey = `sal_${normalizedRole.replace(/\s+/g, '_')}_${normalizedCity.replace(/\s+/g, '_')}_${input.experienceYears}y`;

  return {
    entityType: 'SALARY_INTELLIGENCE',
    primaryKey,
    role: input.role,
    location: input.location,
    experienceYears: input.experienceYears,
    calculatedData: {
      medianSalaryInr: median,
      salaryPercentiles: { p25, p50: median, p75, p90 },
      inHandMonthlyInr: inHandMonthly,
      taxDeductionInr: monthlyTax,
      topHiringCompanies: ['Tata Consultancy Services', 'Infosys', 'Wipro', 'Accenture', 'Microsoft India', 'Google India', 'Flipkart'],
      relatedSkills: ['Python', 'SQL', 'TypeScript', 'System Design', 'React', 'AWS', 'Data Structures'],
      nextCareerSteps: [`Senior ${input.role}`, `Lead ${input.role}`, `Principal ${input.role}`, 'Engineering Manager'],
      activeJobCount: Math.max(12, Math.round(median / 35000))
    },
    schemaGraph: {
      '@context': 'https://schema.org',
      '@type': 'Occupation',
      name: input.role,
      estimatedSalary: [
        {
          '@type': 'MonetaryAmountDistribution',
          name: 'Annual Base Salary',
          currency: 'INR',
          median: median,
          percentile10: Math.round(median * 0.65),
          percentile25: p25,
          percentile75: p75,
          percentile90: p90,
          duration: 'P1Y'
        }
      ],
      occupationLocation: [{ '@type': 'City', name: input.location }]
    }
  };
}

export function generateZapierEntityIntersection(params: {
  role: string;
  skill: string;
  location: string;
  company?: string;
}): ProgrammaticUtilityEntity {
  const primaryKey = `int_${params.role.toLowerCase()}_${params.skill.toLowerCase()}_${params.location.toLowerCase()}`.replace(/\s+/g, '_');

  return {
    entityType: 'INTEGRATION_MATRIX',
    primaryKey,
    role: params.role,
    skill: params.skill,
    location: params.location,
    company: params.company,
    calculatedData: {
      medianSalaryInr: 1250000,
      activeJobCount: 38,
      atsKeywordRecommendations: [params.skill, `${params.skill} frameworks`, 'CI/CD', 'API Architecture', 'Git', 'Agile'],
      relatedSkills: [params.skill, 'Problem Solving', 'System Design', 'Cloud Architecture']
    },
    schemaGraph: {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: `${params.role} (${params.skill}) in ${params.location}`,
      description: `Explore live ${params.role} opportunities specializing in ${params.skill} in ${params.location}. Compare real-time salary benchmarks, required tech stack, and verified employers.`,
      hiringOrganization: {
        '@type': 'Organization',
        name: params.company || 'TalentXcel Verified Employers'
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: params.location,
          addressCountry: 'IN'
        }
      }
    }
  };
}
