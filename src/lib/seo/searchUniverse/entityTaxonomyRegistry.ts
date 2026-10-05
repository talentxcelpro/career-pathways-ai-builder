// src/lib/seo/searchUniverse/entityTaxonomyRegistry.ts
/**
 * TalentXcel Machine-Readable 22 Entity Dimensions Registry
 *
 * Defines canonical entity types, slugs, allowed parent/child relationships,
 * evidence requirements, and schema mappings across the global career ecosystem.
 */

export type EntityTypeId =
  | 'ROLE'
  | 'SKILL'
  | 'COMPANY'
  | 'LOCATION'
  | 'COUNTRY'
  | 'STATE'
  | 'CITY'
  | 'METRO'
  | 'DISTRICT'
  | 'INDUSTRY'
  | 'EXPERIENCE'
  | 'CAREER_STAGE'
  | 'DEGREE'
  | 'COLLEGE'
  | 'COURSE'
  | 'CERTIFICATION'
  | 'SALARY'
  | 'JOB_TYPE'
  | 'WORK_MODE'
  | 'GOVERNMENT_BODY'
  | 'EXAM'
  | 'CAREER_PATHWAY';

export interface EntityDimensionDefinition {
  id: EntityTypeId;
  name: string;
  description: string;
  canonicalTable: string;
  slugPattern: RegExp;
  schemaType: string;
  allowedParents: EntityTypeId[];
  allowedChildren: EntityTypeId[];
  orthogonalIntents: string[];
  evidenceVerificationSource: string;
}

export const ENTITY_TAXONOMY_REGISTRY: Record<EntityTypeId, EntityDimensionDefinition> = {
  ROLE: {
    id: 'ROLE',
    name: 'Job Role / Designation',
    description: 'Professional occupation and job function taxonomy',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'Occupation',
    allowedParents: ['INDUSTRY', 'CAREER_PATHWAY'],
    allowedChildren: ['SKILL', 'EXPERIENCE'],
    orthogonalIntents: ['JOBS', 'SALARY', 'RESUME', 'ATS_CHECKER', 'INTERVIEWS', 'SKILLS', 'CAREER_PATHWAY'],
    evidenceVerificationSource: 'VERIFIED_ROLES_TAXONOMY',
  },
  SKILL: {
    id: 'SKILL',
    name: 'Technical / Domain Skill',
    description: 'Specific competency, tool, programming language, or domain skill',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'DefinedTerm',
    allowedParents: ['ROLE', 'COURSE', 'CERTIFICATION'],
    allowedChildren: [],
    orthogonalIntents: ['JOBS', 'COURSES', 'CERTIFICATIONS', 'SALARY', 'INTERVIEWS'],
    evidenceVerificationSource: 'VERIFIED_SKILLS_TAXONOMY',
  },
  COMPANY: {
    id: 'COMPANY',
    name: 'Corporate Employer / Organization',
    description: 'Hiring corporate organization, enterprise, startup, or GCC entity',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'Organization',
    allowedParents: ['INDUSTRY', 'CITY', 'COUNTRY'],
    allowedChildren: ['ROLE'],
    orthogonalIntents: ['JOBS', 'SALARY', 'INTERVIEWS', 'PLACEMENTS', 'HIRING'],
    evidenceVerificationSource: 'VERIFIED_EMPLOYER_PROFILES',
  },
  LOCATION: {
    id: 'LOCATION',
    name: 'Generic Location',
    description: 'Base geographic location node in the world hierarchy',
    canonicalTable: 'location_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'Place',
    allowedParents: [],
    allowedChildren: ['COUNTRY', 'STATE', 'CITY', 'METRO'],
    orthogonalIntents: ['JOBS', 'SALARY', 'COLLEGES', 'COMPANIES'],
    evidenceVerificationSource: 'GLOBAL_LOCATION_CATALOG',
  },
  COUNTRY: {
    id: 'COUNTRY',
    name: 'Sovereign Country / Nation',
    description: 'ISO-3166 sovereign state with legal, currency, and regulatory context',
    canonicalTable: 'location_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'Country',
    allowedParents: ['LOCATION'],
    allowedChildren: ['STATE', 'METRO', 'CITY'],
    orthogonalIntents: ['JOBS', 'GOVT_JOBS', 'SALARY', 'COLLEGES', 'REMOTE'],
    evidenceVerificationSource: 'ISO_3166_OFFICIAL',
  },
  STATE: {
    id: 'STATE',
    name: 'State / Province / Region',
    description: 'Primary sub-national administrative region (e.g. Karnataka, California)',
    canonicalTable: 'location_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'AdministrativeArea',
    allowedParents: ['COUNTRY'],
    allowedChildren: ['METRO', 'CITY', 'DISTRICT'],
    orthogonalIntents: ['JOBS', 'GOVT_JOBS', 'COLLEGES', 'SALARY'],
    evidenceVerificationSource: 'NATIONAL_ADMIN_REGISTRIES',
  },
  CITY: {
    id: 'CITY',
    name: 'City / Municipality',
    description: 'Urban center or municipal city with localized hiring ecosystem',
    canonicalTable: 'location_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'City',
    allowedParents: ['STATE', 'METRO', 'COUNTRY'],
    allowedChildren: ['DISTRICT'],
    orthogonalIntents: ['JOBS', 'SALARY', 'COLLEGES', 'COMPANIES'],
    evidenceVerificationSource: 'MUNICIPAL_CENSUS_CATALOGS',
  },
  METRO: {
    id: 'METRO',
    name: 'Metropolitan Urban Cluster',
    description: 'Economic agglomeration spanning multiple cities (e.g. Delhi NCR, Bay Area)',
    canonicalTable: 'location_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'Place',
    allowedParents: ['COUNTRY', 'STATE'],
    allowedChildren: ['CITY', 'DISTRICT'],
    orthogonalIntents: ['JOBS', 'SALARY', 'COMPANIES'],
    evidenceVerificationSource: 'METRO_PLANNING_AUTHORITIES',
  },
  DISTRICT: {
    id: 'DISTRICT',
    name: 'Borough / Sub-district / Tech Corridor',
    description: 'Intra-city technology or business corridor (e.g. Whitefield, Manhattan)',
    canonicalTable: 'location_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'Place',
    allowedParents: ['CITY', 'METRO'],
    allowedChildren: [],
    orthogonalIntents: ['JOBS'],
    evidenceVerificationSource: 'CORRIDOR_TRANSIT_REGISTRIES',
  },
  INDUSTRY: {
    id: 'INDUSTRY',
    name: 'Industry Sector / Vertical',
    description: 'Macro-economic industry classification (e.g. Fintech, Healthcare, SaaS)',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'Industry',
    allowedParents: [],
    allowedChildren: ['ROLE', 'COMPANY'],
    orthogonalIntents: ['JOBS', 'SALARY', 'HIRING', 'CAREER_PATHWAY'],
    evidenceVerificationSource: 'NAICS_INDUSTRY_CLASSIFICATION',
  },
  EXPERIENCE: {
    id: 'EXPERIENCE',
    name: 'Experience Level / Seniority',
    description: 'Professional tenure bracket (0-1 yrs, 2-5 yrs, 5-8 yrs, 10+ yrs)',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'DefinedTerm',
    allowedParents: ['ROLE'],
    allowedChildren: [],
    orthogonalIntents: ['JOBS', 'SALARY', 'RESUME', 'INTERVIEWS'],
    evidenceVerificationSource: 'STANDARDIZED_EXPERIENCE_TIERS',
  },
  CAREER_STAGE: {
    id: 'CAREER_STAGE',
    name: 'Candidate Career Life Stage',
    description: 'Demographic segment: Fresher, Student, Returnee, Career Switcher',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'DefinedTerm',
    allowedParents: [],
    allowedChildren: ['ROLE'],
    orthogonalIntents: ['FRESHER', 'INTERNSHIP', 'RESUME', 'CAREER_SWITCH', 'JOBS'],
    evidenceVerificationSource: 'TALENTXCEL_CAREER_ARCHETYPES',
  },
  DEGREE: {
    id: 'DEGREE',
    name: 'Academic Degree / Qualification',
    description: 'Formal educational credential (B.Tech, MBA, BCA, M.Sc, PhD)',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'EducationalOccupationalCredential',
    allowedParents: ['COLLEGE'],
    allowedChildren: ['ROLE'],
    orthogonalIntents: ['COLLEGES', 'ADMISSIONS', 'PLACEMENTS', 'JOBS', 'GOVT_JOBS'],
    evidenceVerificationSource: 'UGC_AICTE_DEGREE_FRAMEWORK',
  },
  COLLEGE: {
    id: 'COLLEGE',
    name: 'Higher Education Institution / University',
    description: 'Accredited university, institute of technology, or college campus',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'CollegeOrUniversity',
    allowedParents: ['CITY', 'STATE', 'COUNTRY'],
    allowedChildren: ['DEGREE', 'COURSE'],
    orthogonalIntents: ['COLLEGES', 'ADMISSIONS', 'PLACEMENTS', 'COURSES'],
    evidenceVerificationSource: 'NIRF_NAAC_OFFICIAL_REGISTRY',
  },
  COURSE: {
    id: 'COURSE',
    name: 'Learning Course / Program',
    description: 'Structured educational curriculum with defined learning outcomes',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'Course',
    allowedParents: ['COLLEGE', 'SKILL'],
    allowedChildren: ['SKILL'],
    orthogonalIntents: ['COURSES', 'CERTIFICATIONS', 'SKILLS'],
    evidenceVerificationSource: 'ACCREDITED_COURSE_PROVIDERS',
  },
  CERTIFICATION: {
    id: 'CERTIFICATION',
    name: 'Industry Certification / License',
    description: 'Formal credential issued by tech vendor or professional board (AWS, PMP)',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'EducationalOccupationalCredential',
    allowedParents: ['SKILL', 'ROLE'],
    allowedChildren: [],
    orthogonalIntents: ['CERTIFICATIONS', 'SALARY', 'JOBS', 'COURSES'],
    evidenceVerificationSource: 'OFFICIAL_VENDOR_CERT_REGISTRY',
  },
  SALARY: {
    id: 'SALARY',
    name: 'Compensation Benchmark Tier',
    description: 'Specific compensation level (e.g. 10 LPA, 25 LPA, $120k)',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'MonetaryAmountDistribution',
    allowedParents: ['ROLE', 'LOCATION'],
    allowedChildren: [],
    orthogonalIntents: ['SALARY', 'JOBS'],
    evidenceVerificationSource: 'AUDITED_SALARY_DATASETS',
  },
  JOB_TYPE: {
    id: 'JOB_TYPE',
    name: 'Employment Contract Type',
    description: 'Full-time, Contract, Part-time, Internship, Freelance',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'DefinedTerm',
    allowedParents: [],
    allowedChildren: ['ROLE'],
    orthogonalIntents: ['JOBS', 'INTERNSHIP', 'FRESHER'],
    evidenceVerificationSource: 'STANDARD_LABOR_DEFINITIONS',
  },
  WORK_MODE: {
    id: 'WORK_MODE',
    name: 'Work Arrangement / Flexibility',
    description: 'Remote, WFH, Hybrid, On-Site, Relocation with Visa',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'DefinedTerm',
    allowedParents: [],
    allowedChildren: ['ROLE'],
    orthogonalIntents: ['REMOTE', 'JOBS'],
    evidenceVerificationSource: 'TALENTXCEL_WORKPLACE_MODELS',
  },
  GOVERNMENT_BODY: {
    id: 'GOVERNMENT_BODY',
    name: 'Government Recruitment Authority',
    description: 'Public commission, recruitment board, or ministry (UPSC, SSC, RRB)',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'GovernmentOrganization',
    allowedParents: ['COUNTRY', 'STATE'],
    allowedChildren: ['EXAM'],
    orthogonalIntents: ['GOVT_JOBS', 'EXAMS', 'SALARY'],
    evidenceVerificationSource: 'OFFICIAL_GAZETTE_NOTIFICATIONS',
  },
  EXAM: {
    id: 'EXAM',
    name: 'Competitive Recruitment / Admission Exam',
    description: 'Official test or examination (UPSC CSE, SSC CGL, GATE, CAT)',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'Exam',
    allowedParents: ['GOVERNMENT_BODY', 'COLLEGE'],
    allowedChildren: [],
    orthogonalIntents: ['GOVT_JOBS', 'ADMISSIONS', 'COLLEGES'],
    evidenceVerificationSource: 'OFFICIAL_EXAM_COMMISSIONS',
  },
  CAREER_PATHWAY: {
    id: 'CAREER_PATHWAY',
    name: 'Longitudinal Career Trajectory',
    description: 'Milestone progression from entry role to executive leadership',
    canonicalTable: 'seo_entities',
    slugPattern: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    schemaType: 'Occupation',
    allowedParents: ['INDUSTRY'],
    allowedChildren: ['ROLE', 'SKILL'],
    orthogonalIntents: ['CAREER_PATHWAY', 'SKILLS', 'SALARY', 'COURSES'],
    evidenceVerificationSource: 'TALENTXCEL_CAREER_MAP_GRAPH',
  },
};

export class EntityTaxonomyRegistry {
  static getEntityDefinition(id: EntityTypeId): EntityDimensionDefinition | undefined {
    return ENTITY_TAXONOMY_REGISTRY[id];
  }

  static isValidRelationship(parentType: EntityTypeId, childType: EntityTypeId): boolean {
    const parentDef = ENTITY_TAXONOMY_REGISTRY[parentType];
    const childDef = ENTITY_TAXONOMY_REGISTRY[childType];
    if (!parentDef || !childDef) return false;
    return parentDef.allowedChildren.includes(childType) || childDef.allowedParents.includes(parentType);
  }

  static getAllDimensions(): EntityDimensionDefinition[] {
    return Object.values(ENTITY_TAXONOMY_REGISTRY);
  }
}
