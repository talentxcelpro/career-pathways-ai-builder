// distribution-engine/src/discovery/queryGenerator.cjs
// 8-Dimensional Combinatorial Query Generator for Long-Tail Platform Discovery
// Generates search dorks across Platform Type x Niche x Geography x 5 Intent Dimensions.

const config = require('../../config.cjs');

class QueryGenerator {
  constructor() {
    this.intentPhrases = {
      submission: [
        'submit startup news',
        'submit your startup free',
        'free startup directory',
        'startup showcase submission',
        'submit tool free',
        'free business listing',
        'startup directory submit',
        'SaaS directory free listing',
        'career resource submission',
        'submit company profile free'
      ],
      publishing: [
        'guest article submission',
        'guest post guidelines',
        'accepting guest contributions',
        'submit guest article',
        'contribute an article',
        'editorial submission guidelines',
        'submit thought leadership',
        'publish insights'
      ],
      contributor: [
        'write for us career',
        'career blog guest post',
        'resume tips guest article',
        'job search blog contributor',
        'recruitment guest article',
        'HR technology blog submission',
        'employment blog contributor',
        'remote work blog contributor',
        'write for our community',
        'become a regular contributor'
      ],
      startup: [
        'startup founder story submission',
        'startup news contributor',
        'small business news submission',
        'entrepreneur community submission',
        'technology startup submission',
        'startup spotlight submission',
        'early stage founder stories',
        'regional startup news submission',
        'free technology blog submission'
      ],
      community: [
        'student career community',
        'job board directory',
        'founder community forum',
        'career advice forum share',
        'tech talent community discussions',
        'freelance & remote workers community',
        'open community blog submit'
      ]
    };

    this.niches = [
      'career development',
      'resume building',
      'ATS resume advice',
      'job search tips',
      'interview preparation',
      'human resources',
      'recruitment technology',
      'remote work',
      'startup ecosystem',
      'early stage founders',
      'saas tools',
      'software developer jobs',
      'college placement & campus hiring',
      'skills & upskilling'
    ];

    this.operators = [
      '', // Natural language query
      'inurl:write-for-us',
      'inurl:submit',
      'inurl:contribute',
      'intitle:"write for us"',
      'intitle:"submit your startup"',
      'inurl:directory',
      'inurl:guest-post-guidelines'
    ];
  }

  /**
   * Generates a comprehensive matrix of targeted discovery queries
   * @param {Object} options - filters for geo, intent, and niche
   * @returns {Array<Object>} List of structured queries
   */
  generateQueries(options = {}) {
    const queries = [];
    const targetGeos = options.geos || Object.keys(config.GEOGRAPHIES);

    for (const geoKey of targetGeos) {
      const geo = config.GEOGRAPHIES[geoKey];
      const locations = [geo.country, ...(geo.majorCities || [])];

      for (const loc of locations) {
        // 1. Core intent queries localized
        for (const [intentType, intentList] of Object.entries(this.intentPhrases)) {
          for (const phrase of intentList) {
            queries.push({
              query: `${phrase} ${loc}`,
              intent: intentType,
              country: geo.country,
              region: geo.region,
              location: loc,
              operator: 'natural',
              targetNiche: 'broad'
            });

            // Add targeted operator variants
            if (options.includeOperators) {
              const dork = `"${phrase}" "${loc}" inurl:submit`;
              queries.push({
                query: dork,
                intent: intentType,
                country: geo.country,
                region: geo.region,
                location: loc,
                operator: 'inurl:submit',
                targetNiche: 'broad'
              });
            }
          }
        }

        // 2. Niche + Contributor Intent Combinations
        for (const niche of this.niches) {
          queries.push({
            query: `"write for us" "${niche}" "${loc}"`,
            intent: 'contributor',
            country: geo.country,
            region: geo.region,
            location: loc,
            operator: 'inurl:write-for-us',
            targetNiche: niche
          });

          queries.push({
            query: `"${niche}" "submit startup" "${loc}"`,
            intent: 'startup',
            country: geo.country,
            region: geo.region,
            location: loc,
            operator: 'inurl:submit',
            targetNiche: niche
          });
        }
      }
    }

    return queries;
  }

  /**
   * Returns a sampled representative list of queries for display or test execution
   */
  getSampleQueries(count = 25) {
    const all = this.generateQueries();
    const step = Math.max(1, Math.floor(all.length / count));
    const sample = [];
    for (let i = 0; i < all.length && sample.length < count; i += step) {
      sample.push(all[i]);
    }
    return sample;
  }
}

module.exports = { QueryGenerator };
