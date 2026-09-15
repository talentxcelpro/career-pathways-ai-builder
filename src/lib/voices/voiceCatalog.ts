// 10-voice persona catalog. ElevenLabs voice IDs are the verified public defaults.
// Browser fallback uses heuristic name/lang matching from window.speechSynthesis.

export type VoiceGender = 'male' | 'female' | 'neutral';
export type VoiceCategory = 'male' | 'female' | 'specialty';

export interface VoicePersona {
  id: string;
  name: string;
  tagline: string;
  category: VoiceCategory;
  gender: VoiceGender;
  ageRange: string;
  // ElevenLabs voice id (premium)
  elevenLabsId: string;
  // Hints used to pick the closest browser-native voice as fallback
  browserHints: {
    lang?: string;
    nameIncludes?: string[];
    gender: VoiceGender;
    pitch?: number;
    rate?: number;
  };
}

export const VOICE_PERSONAS: VoicePersona[] = [
  // Male
  {
    id: 'liam-young',
    name: 'Liam',
    tagline: 'Young Male · Energetic',
    category: 'male',
    gender: 'male',
    ageRange: '18–25',
    elevenLabsId: 'TX3LPaxmHKxFdv7VOQHJ',
    browserHints: { gender: 'male', nameIncludes: ['Daniel', 'Alex', 'Mark'], pitch: 1.05, rate: 1.05 },
  },
  {
    id: 'george-pro',
    name: 'George',
    tagline: 'Professional Male · Corporate',
    category: 'male',
    gender: 'male',
    ageRange: '25–40',
    elevenLabsId: 'JBFqnCBsd6RMkjVDRZzb',
    browserHints: { gender: 'male', nameIncludes: ['George', 'David', 'Microsoft Mark'], pitch: 1, rate: 1 },
  },
  {
    id: 'brian-deep',
    name: 'Brian',
    tagline: 'Deep Male · Authoritative',
    category: 'male',
    gender: 'male',
    ageRange: '30–50',
    elevenLabsId: 'nPczCjzI2devNBz1zQrb',
    browserHints: { gender: 'male', nameIncludes: ['Brian', 'Fred'], pitch: 0.85, rate: 0.95 },
  },
  {
    id: 'bill-senior',
    name: 'Bill',
    tagline: 'Senior Male · Mentor',
    category: 'male',
    gender: 'male',
    ageRange: '50+',
    elevenLabsId: 'pqHfZKP75CvOlQylNhV4',
    browserHints: { gender: 'male', nameIncludes: ['Bill', 'Albert'], pitch: 0.9, rate: 0.92 },
  },
  // Female
  {
    id: 'lily-young',
    name: 'Lily',
    tagline: 'Young Female · Friendly',
    category: 'female',
    gender: 'female',
    ageRange: '18–25',
    elevenLabsId: 'pFZP5JQG7iQjIQuC4Bku',
    browserHints: { gender: 'female', nameIncludes: ['Samantha', 'Lily', 'Karen'], pitch: 1.1, rate: 1.05 },
  },
  {
    id: 'sarah-pro',
    name: 'Sarah',
    tagline: 'Professional Female · Confident',
    category: 'female',
    gender: 'female',
    ageRange: '25–40',
    elevenLabsId: 'EXAVITQu4vr4xnSDxMaL',
    browserHints: { gender: 'female', nameIncludes: ['Sarah', 'Zira', 'Victoria'], pitch: 1, rate: 1 },
  },
  {
    id: 'matilda-warm',
    name: 'Matilda',
    tagline: 'Warm Female · Supportive',
    category: 'female',
    gender: 'female',
    ageRange: '30–50',
    elevenLabsId: 'XrExE9yKIg1WjnnlVkGX',
    browserHints: { gender: 'female', nameIncludes: ['Matilda', 'Tessa', 'Moira'], pitch: 1.02, rate: 0.97 },
  },
  {
    id: 'alice-senior',
    name: 'Alice',
    tagline: 'Senior Female · Guiding',
    category: 'female',
    gender: 'female',
    ageRange: '50+',
    elevenLabsId: 'Xb7hH8MSUJpSbSDYk0k2',
    browserHints: { gender: 'female', nameIncludes: ['Alice', 'Fiona'], pitch: 0.98, rate: 0.92 },
  },
  // Specialty
  {
    id: 'coach-charlie',
    name: 'Coach Charlie',
    tagline: 'Interview Coach · Structured',
    category: 'specialty',
    gender: 'male',
    ageRange: 'Any',
    elevenLabsId: 'IKne3meq5aSn9XLyUdCD',
    browserHints: { gender: 'male', nameIncludes: ['Daniel', 'Alex'], pitch: 1, rate: 1.02 },
  },
  {
    id: 'mentor-laura',
    name: 'Mentor Laura',
    tagline: 'Motivational Mentor · Inspiring',
    category: 'specialty',
    gender: 'female',
    ageRange: 'Any',
    elevenLabsId: 'FGY2WhTYpPnrIDTdsKH5',
    browserHints: { gender: 'female', nameIncludes: ['Samantha', 'Karen'], pitch: 1.05, rate: 1.08 },
  },
];

export const DEFAULT_VOICE_ID = 'sarah-pro';

export function getPersona(id: string): VoicePersona {
  return VOICE_PERSONAS.find((v) => v.id === id) ?? VOICE_PERSONAS[5];
}

/**
 * Select the best matching SpeechSynthesisVoice for a persona.
 */
export function pickBrowserVoice(
  persona: VoicePersona,
  available: SpeechSynthesisVoice[],
  preferredLang = 'en',
): SpeechSynthesisVoice | null {
  if (!available.length) return null;
  const langPool = available.filter((v) => v.lang.toLowerCase().startsWith(preferredLang.toLowerCase()));
  const pool = langPool.length ? langPool : available;
  const hints = persona.browserHints.nameIncludes ?? [];
  for (const hint of hints) {
    const match = pool.find((v) => v.name.toLowerCase().includes(hint.toLowerCase()));
    if (match) return match;
  }
  // Heuristic: female names tend to contain known tokens
  const femaleTokens = ['female', 'samantha', 'karen', 'victoria', 'zira', 'lily', 'sarah', 'alice', 'fiona', 'tessa'];
  const maleTokens = ['male', 'daniel', 'alex', 'mark', 'fred', 'brian', 'bill', 'george', 'david'];
  const tokens = persona.gender === 'female' ? femaleTokens : maleTokens;
  const guess = pool.find((v) => tokens.some((t) => v.name.toLowerCase().includes(t)));
  return guess ?? pool[0];
}
