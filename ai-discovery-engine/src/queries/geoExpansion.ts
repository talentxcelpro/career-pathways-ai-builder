/**
 * ai-discovery-engine/src/queries/geoExpansion.ts
 * Multi-Country, Multi-Language & Multi-Industry Query Expansion Engine.
 * Dynamically expands the 8 core product queries across 21 initial global markets
 * respecting localized career terminology (Resume vs. CV, Fresher vs. Graduate).
 */

import { CountryMarketDefinition, ExpandedAiQuery } from '../types';
import { CORE_QUERY_DEFINITIONS } from './universe';
import { CANONICAL_PRODUCT_ENTITIES } from '../entities/registry';

export const INITIAL_21_MARKETS: CountryMarketDefinition[] = [
  // 1. United States
  {
    code: 'US',
    name: 'United States',
    primaryLanguage: 'en',
    localSpellingVariant: 'US_ENGLISH',
    careerTerminology: { resumeOrCv: 'resume', fresherOrGraduate: 'entry-level' },
    keyTechHubs: ['San Francisco', 'New York', 'Seattle', 'Austin', 'Boston']
  },
  // 2. United Kingdom
  {
    code: 'GB',
    name: 'United Kingdom',
    primaryLanguage: 'en',
    localSpellingVariant: 'UK_ENGLISH',
    careerTerminology: { resumeOrCv: 'cv', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['London', 'Manchester', 'Cambridge', 'Edinburgh']
  },
  // 3. Canada
  {
    code: 'CA',
    name: 'Canada',
    primaryLanguage: 'en',
    localSpellingVariant: 'CANADIAN_ENGLISH',
    careerTerminology: { resumeOrCv: 'resume', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Toronto', 'Vancouver', 'Montreal', 'Waterloo']
  },
  // 4. Australia
  {
    code: 'AU',
    name: 'Australia',
    primaryLanguage: 'en',
    localSpellingVariant: 'AUSTRALIAN_ENGLISH',
    careerTerminology: { resumeOrCv: 'resume', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Sydney', 'Melbourne', 'Brisbane']
  },
  // 5. India
  {
    code: 'IN',
    name: 'India',
    primaryLanguage: 'en',
    localSpellingVariant: 'INTERNATIONAL_ENGLISH',
    careerTerminology: { resumeOrCv: 'resume', fresherOrGraduate: 'fresher' },
    keyTechHubs: ['Bangalore', 'Hyderabad', 'Pune', 'Noida', 'Gurgaon', 'Mumbai', 'Chennai']
  },
  // 6. Germany
  {
    code: 'DE',
    name: 'Germany',
    primaryLanguage: 'de',
    localSpellingVariant: 'LOCALIZED',
    careerTerminology: { resumeOrCv: 'cv', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg']
  },
  // 7. France
  {
    code: 'FR',
    name: 'France',
    primaryLanguage: 'fr',
    localSpellingVariant: 'LOCALIZED',
    careerTerminology: { resumeOrCv: 'cv', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Paris', 'Lyon', 'Toulouse']
  },
  // 8. Netherlands
  {
    code: 'NL',
    name: 'Netherlands',
    primaryLanguage: 'nl',
    localSpellingVariant: 'LOCALIZED',
    careerTerminology: { resumeOrCv: 'cv', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Amsterdam', 'Rotterdam', 'Utrecht', 'Eindhoven']
  },
  // 9. Singapore
  {
    code: 'SG',
    name: 'Singapore',
    primaryLanguage: 'en',
    localSpellingVariant: 'INTERNATIONAL_ENGLISH',
    careerTerminology: { resumeOrCv: 'resume', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Singapore']
  },
  // 10. United Arab Emirates
  {
    code: 'AE',
    name: 'United Arab Emirates',
    primaryLanguage: 'en',
    localSpellingVariant: 'INTERNATIONAL_ENGLISH',
    careerTerminology: { resumeOrCv: 'cv', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Dubai', 'Abu Dhabi']
  },
  // 11. Saudi Arabia
  {
    code: 'SA',
    name: 'Saudi Arabia',
    primaryLanguage: 'ar',
    localSpellingVariant: 'LOCALIZED',
    careerTerminology: { resumeOrCv: 'cv', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Riyadh', 'Jeddah']
  },
  // 12. Japan
  {
    code: 'JP',
    name: 'Japan',
    primaryLanguage: 'ja',
    localSpellingVariant: 'LOCALIZED',
    careerTerminology: { resumeOrCv: 'resume', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Tokyo', 'Osaka', 'Fukuoka']
  },
  // 13. South Korea
  {
    code: 'KR',
    name: 'South Korea',
    primaryLanguage: 'ko',
    localSpellingVariant: 'LOCALIZED',
    careerTerminology: { resumeOrCv: 'resume', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Seoul', 'Pangyo', 'Busan']
  },
  // 14. Brazil
  {
    code: 'BR',
    name: 'Brazil',
    primaryLanguage: 'pt',
    localSpellingVariant: 'LOCALIZED',
    careerTerminology: { resumeOrCv: 'cv', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Sao Paulo', 'Rio de Janeiro', 'Florianopolis']
  },
  // 15. South Africa
  {
    code: 'ZA',
    name: 'South Africa',
    primaryLanguage: 'en',
    localSpellingVariant: 'UK_ENGLISH',
    careerTerminology: { resumeOrCv: 'cv', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Johannesburg', 'Cape Town']
  },
  // 16. Ireland
  {
    code: 'IE',
    name: 'Ireland',
    primaryLanguage: 'en',
    localSpellingVariant: 'UK_ENGLISH',
    careerTerminology: { resumeOrCv: 'cv', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Dublin', 'Cork', 'Galway']
  },
  // 17. New Zealand
  {
    code: 'NZ',
    name: 'New Zealand',
    primaryLanguage: 'en',
    localSpellingVariant: 'AUSTRALIAN_ENGLISH',
    careerTerminology: { resumeOrCv: 'cv', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Auckland', 'Wellington']
  },
  // 18. Spain
  {
    code: 'ES',
    name: 'Spain',
    primaryLanguage: 'es',
    localSpellingVariant: 'LOCALIZED',
    careerTerminology: { resumeOrCv: 'cv', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Madrid', 'Barcelona', 'Valencia']
  },
  // 19. Italy
  {
    code: 'IT',
    name: 'Italy',
    primaryLanguage: 'it',
    localSpellingVariant: 'LOCALIZED',
    careerTerminology: { resumeOrCv: 'cv', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Milan', 'Rome', 'Turin']
  },
  // 20. Sweden
  {
    code: 'SE',
    name: 'Sweden',
    primaryLanguage: 'sv',
    localSpellingVariant: 'LOCALIZED',
    careerTerminology: { resumeOrCv: 'cv', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Stockholm', 'Gothenburg', 'Malmo']
  },
  // 21. Switzerland
  {
    code: 'CH',
    name: 'Switzerland',
    primaryLanguage: 'de',
    localSpellingVariant: 'LOCALIZED',
    careerTerminology: { resumeOrCv: 'cv', fresherOrGraduate: 'graduate' },
    keyTechHubs: ['Zurich', 'Geneva', 'Basel', 'Lausanne']
  }
];

/**
 * Generates the expanded multi-country AI query universe without superficial mass thin-content.
 * Tailors query terminology according to localized career norms.
 */
export function generateExpandedQueryUniverse(): ExpandedAiQuery[] {
  const expanded: ExpandedAiQuery[] = [];
  const entityMap = new Map(CANONICAL_PRODUCT_ENTITIES.map((e) => [e.id, e]));

  for (const core of CORE_QUERY_DEFINITIONS) {
    const entity = entityMap.get(core.product);
    if (!entity) continue;

    for (const market of INITIAL_21_MARKETS) {
      let localizedQuery = core.baseQuery;

      // Localize resume vs CV
      if (market.careerTerminology.resumeOrCv === 'cv') {
        localizedQuery = localizedQuery.replace(/\bresume\b/gi, 'CV').replace(/\bresumes\b/gi, 'CVs');
      }

      // Localize fresher vs graduate vs entry-level
      if (market.careerTerminology.fresherOrGraduate === 'graduate') {
        localizedQuery = localizedQuery.replace(/\bfresher\b/gi, 'graduate').replace(/\bfreshers\b/gi, 'graduates');
      } else if (market.careerTerminology.fresherOrGraduate === 'entry-level') {
        localizedQuery = localizedQuery.replace(/\bfresher\b/gi, 'entry-level').replace(/\bfreshers\b/gi, 'entry-level job seekers');
      }

      // Add national and tech-hub intent variants where relevant
      const primaryCity = market.keyTechHubs[0];
      const queryWithGeo = `${localizedQuery} in ${market.name}`;

      expanded.push({
        id: `${core.id}-${market.code}`,
        product: core.product,
        country: market.name,
        language: market.primaryLanguage,
        queryText: queryWithGeo,
        intentCategory: core.intentCategory,
        canonicalDestination: entity.canonicalUrl,
        expectedEntityMatch: entity.name,
        aeoAnswerSnippet: core.targetAeoAnswer
      });
    }
  }

  return expanded;
}
