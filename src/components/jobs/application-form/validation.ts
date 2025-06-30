
import { FormData } from './types';

export const validateStep = (step: number, formData: FormData): boolean => {
  switch (step) {
    case 1:
      return formData.resumeSource === 'existing' ? !!formData.selectedResumeId : !!formData.uploadedResume;
    case 2:
      return true;
    case 3:
      return !!(formData.fullName && 
               formData.email && 
               formData.phoneNumber && 
               formData.location && 
               formData.expectedCTC && 
               formData.noticePeriod && 
               formData.readyToRelocate && 
               formData.remoteWorkPreference && 
               formData.yearsOfExperience);
    case 4:
      return formData.informationConfirmed && formData.contactAuthorized;
    default:
      return false;
  }
};

export const validateFileUpload = (file: File, maxSize: number, allowedTypes: string[]): string | null => {
  if (file.size > maxSize) {
    return `File size must be less than ${maxSize / 1024 / 1024}MB`;
  }

  if (!allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
  }

  return null;
};
