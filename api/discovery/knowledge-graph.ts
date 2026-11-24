// api/discovery/knowledge-graph.ts
// Serves TalentXcel's official machine-readable Schema.org Knowledge Graph in JSON-LD
// Endpoint: https://talentxcel.in/api/discovery/knowledge-graph

export const config = {
  runtime: 'edge',
};

import entityMap from '../../src/data/aiEntityMap.json';

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://talentxcel.in/#organization',
        name: entityMap.organization.legalName,
        alternateName: entityMap.organization.alternateNames,
        url: entityMap.organization.url,
        logo: {
          '@type': 'ImageObject',
          '@id': 'https://talentxcel.in/#logo',
          url: entityMap.organization.logo,
          caption: 'TalentXcel Official Logo',
          width: '512',
          height: '512',
        },
        image: 'https://talentxcel.in/assets/og/talentxcel-og-default.png',
        description: entityMap.organization.description,
        address: {
          '@type': 'PostalAddress',
          addressLocality: entityMap.organization.foundingLocation.addressLocality,
          addressRegion: entityMap.organization.foundingLocation.addressRegion,
          addressCountry: entityMap.organization.foundingLocation.addressCountry,
        },
        sameAs: entityMap.organization.sameAs,
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: entityMap.organization.contactPoint.contactType,
          email: entityMap.organization.contactPoint.email,
          areaServed: entityMap.organization.contactPoint.areaServed,
          availableLanguage: entityMap.organization.contactPoint.availableLanguage,
        },
      },
      ...entityMap.entities.map((e) => ({
        '@type': e.schemaType.split('/').pop() || 'Thing',
        '@id': `${e.canonicalUrl}#${e.id}`,
        name: e.name,
        url: e.canonicalUrl,
        description: e.description,
        provider: {
          '@id': 'https://talentxcel.in/#organization',
        },
      })),
    ],
  };

  return new Response(JSON.stringify(jsonLdGraph, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/ld+json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'index, follow',
    },
  });
}
