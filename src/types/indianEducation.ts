export type InstitutionCategory = 'university' | 'college' | 'institute' | 'school';

export type InstitutionType =
  | 'central_govt'
  | 'state_govt'
  | 'private'
  | 'deemed'
  | 'autonomous'
  | 'international'
  | 'government'
  | 'trust'
  | 'cbse'
  | 'icse'
  | 'ib';

export type VerificationStatus =
  | 'verified'
  | 'partially_verified'
  | 'source_found'
  | 'needs_review'
  | 'unverified';

export interface InstitutionLocation {
  city: string;
  district?: string;
  state: string;
  stateCode: string;
  unionTerritory?: boolean;
  pincode?: string;
}

export interface InstitutionIdentity {
  establishedYear?: number;
  officialWebsite: string;
  logoUrl?: string;
  campusAreaAcres?: number;
  affiliatedTo?: string;
}

export interface InstitutionAccreditation {
  nirfRank?: number;
  nirfCategory?: string;
  nirfYear?: number;
  naacGrade?: string;
  isInstituteOfEminence?: boolean;
  recognizedBy?: string[];
}

export interface InstitutionAcademics {
  programsCount?: number;
  flagshipPrograms: string[];
  disciplines: string[];
  entranceExams?: string[];
  degreesOffered?: string[];
  curriculum?: string;
}

export interface InstitutionCosts {
  annualTuition?: number;
  hostelAnnual?: number;
  examinationFees?: number;
  otherMandatoryFees?: number;
  feePeriod?: 'annual' | 'semester' | 'total';
  scholarshipsAvailable?: boolean;
  feeNotes?: string;
}

export interface InstitutionOutcomes {
  placementRate?: number;
  medianPackageLpa?: number;
  highestPackageLpa?: number;
  placementVerified: boolean;
  topRecruiters?: string[];
  placementReportUrl?: string;
}

export interface InstitutionVerification {
  status: VerificationStatus;
  confidenceScore: number;
  lastVerifiedAt: string;
  sourceCount: number;
  dataPoints: {
    fees: boolean;
    programs: boolean;
    location: boolean;
    admission: boolean;
    placements: 'verified' | 'partial' | 'unverified';
  };
  officialSourceUrl?: string;
}

export interface IndianInstitution {
  id: string;
  name: string;
  slug: string;
  category: InstitutionCategory;
  institutionType: InstitutionType;
  location: InstitutionLocation;
  identity: InstitutionIdentity;
  accreditation: InstitutionAccreditation;
  academics: InstitutionAcademics;
  costs: InstitutionCosts;
  outcomes: InstitutionOutcomes;
  verification: InstitutionVerification;
}

export interface IndianEducationFilters {
  search?: string;
  category?: InstitutionCategory | 'all';
  state?: string;
  institutionType?: string;
  discipline?: string;
  entranceExam?: string;
  maxAnnualFee?: number;
  minNirfRank?: number;
  placementVerifiedOnly?: boolean;
  sortBy?: 'nirf' | 'fees_asc' | 'fees_desc' | 'placement' | 'name';
  page?: number;
  pageSize?: number;
}

export interface ParsedEducationQuery {
  rawQuery: string;
  category?: InstitutionCategory;
  discipline?: string;
  state?: string;
  city?: string;
  maxAnnualFee?: number;
  entranceExam?: string;
  intent?: string;
}

export interface IndianGraphTelemetry {
  totalInstitutions: number;
  totalStatesAndUTs: number;
  totalProgramsEstimate: number;
  sourceCoveragePercentage: number;
  verifiedTodayCount: number;
  recentChangesCount: number;
  underReviewCount: number;
  categoryCounts: {
    universities: number;
    colleges: number;
    institutes: number;
    schools: number;
  };
}
