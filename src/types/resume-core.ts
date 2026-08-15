// ============================================================================
// TALENTXCEL — 188-PARAMETER UNIVERSAL CAREER IDENTITY MODEL & CORE SCHEMA
// Single Source of Truth for Candidate Career Evidence & Intelligence
// Supports Freshers → 40+ Year Executives across All Global Industries
// ============================================================================

/** Category A: Identity & Contact (Parameters 1–12) */
export interface IdentityContactSection {
  fullName: string;                // P1
  preferredName?: string;          // P2
  professionalHeadline?: string;   // P3
  email: string;                   // P4
  phone: string;                   // P5
  country?: string;                // P6
  city?: string;                   // P7
  stateRegion?: string;            // P8
  postalCode?: string;             // P9
  currentLocation: string;         // P10
  preferredLocations?: string[];   // P11
  relocationPreference?: boolean;  // P12
}

/** Category B: Professional Positioning (Parameters 13–22) */
export interface ProfessionalPositioningSection {
  professionalSummary: string;     // P13
  careerObjective?: string;        // P14
  targetRole?: string;             // P15
  targetRoles?: string[];          // P16
  targetIndustry?: string;         // P17
  targetFunction?: string;         // P18
  seniorityLevel?: 'Fresher' | 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive' | 'Director' | 'C-Suite'; // P19
  careerStage?: 'Student' | 'Early' | 'Mid' | 'Senior' | 'Executive' | '40+ Veteran'; // P20
  careerDirection?: 'Growth' | 'Switch' | 'Specialist' | 'Leadership'; // P21
  valueProposition?: string;       // P22
}

/** Category C & D: Employment & Impact Metrics (Parameters 23–52) */
export interface UniversalEmploymentRecord {
  id: string;
  employerName: string;            // P23
  employerLegalName?: string;      // P24
  jobTitle: string;                // P25
  employmentType?: 'Full-time' | 'Contract' | 'Part-time' | 'Freelance' | 'Internship' | 'Consulting'; // P26
  department?: string;             // P27
  function?: string;               // P28
  location?: string;               // P29
  startDate: string;               // P30
  endDate: string;                 // P31
  currentRoleFlag: boolean;        // P32
  responsibilities: string[];      // P33
  achievements: string[];          // P34
  keyContributions?: string[];     // P35
  technologiesUsed?: string[];     // P36
  skillsUsed?: string[];           // P37
  teamSize?: number;               // P38
  reportingLevel?: string;         // P39
  promotionHistory?: string[];     // P40
  
  // Category D: Impact Metrics (P41–52)
  revenueManaged?: string;         // P41 ($40M P&L)
  revenueGenerated?: string;       // P42
  costSavings?: string;            // P43
  budgetManaged?: string;          // P44
  pnlResponsibility?: string;      // P45
  teamSizeManaged?: number;        // P46
  customersAccountsManaged?: string;// P47
  quotaAttainment?: string;        // P48 (145% Quota)
  productivityImprovement?: string;// P49
  efficiencyImprovement?: string;  // P50
  slaKpiPerformance?: string;      // P51 (99.99% SLA)
  otherQuantifiedAchievements?: string[]; // P52
}

/** Category E: First-Class Projects (Parameters 53–64) */
export interface UniversalProjectRecord {
  id: string;
  projectName: string;             // P53
  projectType?: 'Commercial' | 'Academic' | 'Open Source' | 'Personal' | 'Client'; // P54
  projectRole?: string;            // P55
  clientOrganization?: string;     // P56
  startDate?: string;              // P57
  endDate?: string;                // P58
  problemStatement?: string;       // P59
  solution?: string;               // P60
  responsibilities?: string[];     // P61
  technologiesTools?: string[];    // P62
  outcomes?: string[];             // P63
  projectMetricsImpact?: string;   // P64
}

/** Category F: Skills Intelligence (Parameters 65–78) */
export interface CanonicalSkillEntity {
  id: string;
  sourceSkill: string;             // Raw extracted (e.g. "NodeJS")
  canonicalSkill: string;          // Normalized (e.g. "Node.js")
  category: 'technical' | 'domain' | 'frameworks' | 'languages' | 'platforms' | 'cloud' | 'databases' | 'tools' | 'methodologies' | 'leadership' | 'soft' | 'industry'; // P65-P76
  synonyms?: string[];
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert'; // P77
  yearsExperience?: number;        // P78
  evidence?: string;
  confidence?: number;
}

export interface SkillsIntelligenceSection {
  technicalSkills: string[];       // P65
  domainSkills: string[];          // P66
  frameworks: string[];            // P67
  programmingLanguages: string[];  // P68
  platforms: string[];             // P69
  cloudTechnologies: string[];     // P70
  databases: string[];             // P71
  tools: string[];                 // P72
  methodologies: string[];         // P73
  leadershipSkills: string[];      // P74
  softSkills: string[];            // P75
  industrySkills: string[];        // P76
  skillEntities: CanonicalSkillEntity[]; // All 14 skill dimensions
}

/** Category G: Education (Parameters 79–88) */
export interface UniversalEducationRecord {
  id: string;
  degreeQualification: string;     // P79 (PhD, MBA, Master's, Bachelor's, Diploma, 12th, 10th, GCSE, Trade)
  specialization?: string;         // P80
  institution: string;             // P81
  universityBoard?: string;        // P82
  location?: string;               // P83
  startYear?: string;              // P84
  graduationYear: string;          // P85
  gradeCGPA?: string;              // P86
  academicHonors?: string[];       // P87
  coursework?: string[];           // P88
}

/** Category H: Certifications & Credentials (Parameters 89–98) */
export interface UniversalCertificationRecord {
  id: string;
  certificationName: string;       // P89
  issuingOrganization: string;     // P90
  credentialId?: string;           // P91
  issueDate?: string;              // P92
  expiryDate?: string;             // P93
  credentialUrl?: string;          // P94
  certificationLevel?: string;     // P95
  isLicense?: boolean;             // P96
  type: 'Certification' | 'License' | 'Training' | 'Course' | 'Workshop'; // P97-98 (Strict distinction!)
}

/** Category I: Achievements, Awards & Recognition (Parameters 99–106) */
export interface UniversalAwardRecord {
  id: string;
  title: string;                   // P99-P101 (Achievement, Award, Recognition)
  category?: 'Competition' | 'Publication' | 'Speaking' | 'Leadership' | 'Honor'; // P102-106
  issuer?: string;
  date?: string;
  description?: string;
  url?: string;
}

/** Category J: Languages & Communication (Parameters 107–112) */
export interface UniversalLanguageRecord {
  id: string;
  language: string;                // P107
  speakingProficiency?: string;    // P108
  writingProficiency?: string;     // P109
  readingProficiency?: string;     // P110
  isNative?: boolean;              // P111
  businessCommunicationLevel?: string; // P112
}

/** Category K: Professional Links & Portfolio (Parameters 113–120) */
export interface ProfessionalLinksSection {
  linkedinUrl?: string;            // P113
  githubUrl?: string;              // P114
  portfolioUrl?: string;           // P115
  personalWebsite?: string;        // P116
  behanceDribbbleUrl?: string;     // P117
  publicationsUrl?: string;        // P118
  researchProfileUrl?: string;     // P119
  otherProfessionalUrls?: string[];// P120
}

/** Category L: Professional Preferences (Parameters 121–130) */
export interface ProfessionalPreferencesSection {
  employmentPreference?: string;   // P121
  fullTimeContractPreference?: 'Full-Time' | 'Contract' | 'Both'; // P122
  remotePreference?: 'Remote' | 'On-site' | 'Hybrid' | 'Any'; // P123
  hybridPreference?: string;       // P124
  travelPreference?: string;       // P125
  relocationPreference?: boolean;  // P126
  preferredIndustry?: string;      // P127
  preferredCompanyType?: string;   // P128
  noticePeriod?: string;           // P129
  compensationExpectation?: string;// P130
}

/** Category M: Career Context & Transitions (Parameters 131–140) */
export interface CareerContextSection {
  careerBreaks?: string;           // P131
  careerTransitionNote?: string;   // P132
  returnToWorkStatus?: boolean;    // P133
  entrepreneurshipHistory?: string;// P134
  freelanceExperience?: string;    // P135
  consultingExperience?: string;   // P136
  partTimeExperience?: string;     // P137
  internshipExperience?: string;   // P138
  volunteerExperience?: string;    // P139
  militaryPublicService?: string;  // P140
}

/** Category N: Personal & Additional Information (Parameters 141–148) */
export interface PersonalAdditionalSection {
  nationality?: string;            // P141
  dateOfBirth?: string;            // P142
  gender?: string;                 // P143
  maritalStatus?: string;          // P144
  address?: string;                // P145
  governmentIdInfo?: string;       // P146
  interests?: string[];            // P147
  hobbies?: string[];              // P148
}

/** Category O: Derived Career Intelligence (Parameters 149–168) */
export interface DerivedCareerIntelligenceSection {
  totalCareerExperienceYears: number; // P149
  relevantExperienceYears: number;   // P150
  leadershipExperienceYears: number; // P151
  technicalExperienceYears: number;  // P152
  industryExperienceYears: number;   // P153
  managementExperienceYears: number; // P154
  currentSeniority: string;          // P155
  careerProgressionTrend: 'Accelerated' | 'Steady' | 'Transitioning'; // P156
  functionalStrengths: string[];     // P157
  transferableSkills: string[];      // P158
  skillGapsIdentified: string[];     // P159
  targetRoleFitScore: number;        // P160 (0-100)
  targetIndustryFitScore: number;    // P161 (0-100)
  careerMobilityIndex: number;       // P162
  careerStabilityIndex: number;      // P163
  evidenceCoverageScore: number;     // P164
  profileCompletenessScore: number;  // P165
  resumeReadinessScore: number;      // P166
  careerReadinessScore: number;      // P167
  networkingDiscoverabilityScore: number; // P168
}

/** Category P: Evidence Lineage (Parameters 169–178) */
export interface EvidenceLineageRecord {
  id: string;
  sourceDocument: string;          // P169
  sourcePage?: number;             // P170
  sourceSection: string;           // P171
  sourceText: string;              // P172
  extractedValue: string;          // P173
  canonicalValue: string;          // P174
  confidence: number;              // P175
  extractionMethod: 'AI' | 'Regex' | 'Heuristic' | 'User'; // P176
  candidateConfirmed: boolean;     // P177
  aiInferred: boolean;             // P178
}

/** Category Q: Universal Parsing Metadata (Parameters 179–188) */
export interface UniversalParsingMetadataSection {
  sourceFileType: string;          // P179
  pageCount: number;               // P180
  characterCount: number;          // P181
  ocrUsed: boolean;                // P182
  extractionConfidence: number;    // P183
  parsingWarnings: string[];       // P184
  truncated: boolean;              // P185
  sectionDetectionConfidence: number; // P186
  duplicateDetectionStatus: string;// P187
  fidelityStatus: 'PASS' | 'WARN' | 'FAIL'; // P188
}

// ============================================================================
// THE CANONICAL 188-PARAMETER MASTER CAREER IDENTITY
// ============================================================================
export interface CanonicalCareerIdentity {
  identityContact: IdentityContactSection;          // Params 1–12
  professionalPositioning: ProfessionalPositioningSection; // Params 13–22
  employment: UniversalEmploymentRecord[];           // Params 23–52
  projects: UniversalProjectRecord[];                // Params 53–64
  skillsIntelligence: SkillsIntelligenceSection;     // Params 65–78
  education: UniversalEducationRecord[];             // Params 79–88
  certifications: UniversalCertificationRecord[];   // Params 89–98
  awards: UniversalAwardRecord[];                    // Params 99–106
  languages: UniversalLanguageRecord[];              // Params 107–112
  links: ProfessionalLinksSection;                   // Params 113–120
  preferences: ProfessionalPreferencesSection;       // Params 121–130
  careerContext: CareerContextSection;               // Params 131–140
  personalAdditional: PersonalAdditionalSection;     // Params 141–148
  derivedIntelligence: DerivedCareerIntelligenceSection; // Params 149–168
  evidenceLineage: EvidenceLineageRecord[];          // Params 169–178
  parsingMetadata: UniversalParsingMetadataSection;  // Params 179–188
}

// Backward-compatible view aliases
export interface CorePersonalInfo {
  fullName: string;
  professionalTitle?: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary: string;
}

export interface CoreExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface CoreEducation {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  honors?: string;
  relevantCoursework?: string[];
  description?: string;
}

export interface CoreSkill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'technical' | 'soft' | 'language' | 'tool';
  years?: number;
}

export interface CoreProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  startDate?: string;
  endDate?: string;
  role?: string;
}

export interface CoreCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface CoreAward {
  id: string;
  name: string;
  issuer: string;
  date: string;
  description: string;
}

export interface CoreVolunteerWork {
  id: string;
  role: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface CoreReference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface CoreResumeSettings {
  templateId: string;
  colorScheme: string;
  fontFamily: string;
  fontSize: number;
  spacing: 'compact' | 'normal' | 'spacious';
  sectionOrder: string[];
}

export interface CoreResumeMetadata {
  id?: string;
  userId?: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  version: number;
  atsScore?: number;
  isPublic?: boolean;
}

export interface CoreResumeData {
  personalInfo: CorePersonalInfo;
  experience: CoreExperience[];
  education: CoreEducation[];
  skills: CoreSkill[];
  projects?: CoreProject[];
  certifications?: CoreCertification[];
  awards?: CoreAward[];
  volunteerWork?: CoreVolunteerWork[];
  references?: CoreReference[];
  interests?: string[];
  settings: CoreResumeSettings;
  metadata: CoreResumeMetadata;
  canonicalIdentity?: CanonicalCareerIdentity;
}

export type ResumeSectionType = 
  | 'personalInfo'
  | 'experience' 
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'awards'
  | 'volunteerWork'
  | 'references'
  | 'interests';

export interface SectionConfiguration {
  id: ResumeSectionType;
  title: string;
  enabled: boolean;
  required: boolean;
  order: number;
}

export function createEmptyResumeData(userId?: string): CoreResumeData {
  return {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    awards: [],
    volunteerWork: [],
    references: [],
    interests: [],
    settings: {
      templateId: 'modern',
      colorScheme: 'blue',
      fontFamily: 'Inter',
      fontSize: 14,
      spacing: 'normal',
      sectionOrder: ['personalInfo', 'experience', 'education', 'skills'],
    },
    metadata: {
      userId,
      title: 'Untitled Resume',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

export function validateResumeData(data: Partial<CoreResumeData>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.personalInfo?.fullName?.trim()) {
    errors.push('Full name is required');
  }
  
  if (!data.personalInfo?.email?.trim()) {
    errors.push('Email is required');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function generateResumeId(): string {
  return `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const DEFAULT_SECTIONS: SectionConfiguration[] = [
  { id: 'personalInfo', title: 'Personal Information', enabled: true, required: true, order: 1 },
  { id: 'experience', title: 'Work Experience', enabled: true, required: true, order: 2 },
  { id: 'education', title: 'Education', enabled: true, required: false, order: 3 },
  { id: 'skills', title: 'Skills', enabled: true, required: false, order: 4 },
  { id: 'projects', title: 'Projects', enabled: false, required: false, order: 5 },
  { id: 'certifications', title: 'Certifications', enabled: false, required: false, order: 6 },
  { id: 'awards', title: 'Awards', enabled: false, required: false, order: 7 },
  { id: 'volunteerWork', title: 'Volunteer Work', enabled: false, required: false, order: 8 },
  { id: 'references', title: 'References', enabled: false, required: false, order: 9 },
  { id: 'interests', title: 'Interests', enabled: false, required: false, order: 10 },
];