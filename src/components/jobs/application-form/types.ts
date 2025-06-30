
export interface FormData {
  // Step 1: Resume Selection
  resumeSource: 'existing' | 'upload';
  selectedResumeId: string;
  uploadedResume: File | null;
  
  // Step 2: Job Role (pre-filled)
  
  // Step 3: Personal & Professional Details
  fullName: string;
  email: string;
  phoneNumber: string;
  preferredCallTime: string;
  location: string;
  currentCTC: string;
  expectedCTC: string;
  noticePeriod: string;
  readyToRelocate: string;
  remoteWorkPreference: string;
  yearsOfExperience: string;
  linkedinProfile: string;
  portfolioWebsite: string;
  coverLetter: File | null;
  
  // Step 4: Declaration
  informationConfirmed: boolean;
  contactAuthorized: boolean;
}

export interface JobInfo {
  id: string;
  title: string;
  companies?: {
    name: string;
    logo_url?: string;
  } | null;
  skills_required?: string[];
}

export interface Resume {
  id: string;
  title: string;
  is_primary: boolean;
  file_url?: string;
  is_active?: boolean;
}
