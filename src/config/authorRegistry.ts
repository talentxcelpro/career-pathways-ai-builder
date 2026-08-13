/**
 * TalentXcel — E-E-A-T Author & Publisher Registry
 *
 * Provides verified E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
 * author profiles and publisher metadata for all editorial resources.
 */

export interface AuthorProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl?: string;
  sameAs: string[];
  jobTitle: string;
  worksFor: string;
}

export const AUTHOR_REGISTRY: Record<string, AuthorProfile> = {
  'sanobar-jahan': {
    id: 'sanobar-jahan',
    name: 'Sanobar Jahan',
    role: 'Founder & Managing Director',
    jobTitle: 'Founder & Managing Director',
    worksFor: 'TalentXcel',
    bio: 'Sanobar Jahan is the Founder and Managing Director of TalentXcel. She leads platform vision, HR technology innovation, and AI-driven career passport ecosystems.',
    sameAs: [
      'https://talentxcel.in/about',
      'https://talentxcel.in/authors/talentxcel-editorial',
    ],
  },
  'talentxcel-editorial': {
    id: 'talentxcel-editorial',
    name: 'TalentXcel Editorial Board',
    role: 'Career Research & Intelligence Group',
    jobTitle: 'Career Research Group',
    worksFor: 'TalentXcel',
    bio: 'The TalentXcel Editorial Board conducts original career research, ATS optimization benchmarking, and workforce market analysis.',
    sameAs: [
      'https://talentxcel.in/about',
    ],
  },
};

export function getAuthorProfile(authorId?: string): AuthorProfile {
  if (authorId && AUTHOR_REGISTRY[authorId]) {
    return AUTHOR_REGISTRY[authorId];
  }
  return AUTHOR_REGISTRY['sanobar-jahan'];
}
