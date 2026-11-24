function generatePlatformContent(signal, audience, community, destinationUrl) {
  const { query, cluster } = signal;
  const { platform, format } = community;
  const { targetCountry } = audience;

  let title = '';
  let copy = '';
  let cta = '';

  if (platform === 'telegram') {
    title = `🚨 VERIFIED OPENINGS: ${query.toUpperCase()} 🚨`;
    copy = `Looking for verified roles in ${query} without paying consultant fees?\n\n• Verified openings open now\n• 1-Click Guest Application\n• Direct employer review`;
    cta = `Apply directly here:\n🔗 ${destinationUrl}`;
  } else if (platform === 'reddit') {
    title = `Analysis of 100+ hiring requirements for "${query}" [Data & Benchmarks]`;
    copy = `If you're applying for ${query} this quarter, here is what hiring managers are filtering for before the first call.\n\n1. Verifiable business impact over task descriptions.\n2. Clean ATS single-column formatting.\n3. Skill demonstration over buzzwords.`;
    cta = `We mapped verified openings and free tools here: ${destinationUrl}`;
  } else if (platform === 'linkedin') {
    title = `The Reality of "${query}" in Late 2026`;
    copy = `Hiring demand for ${query} has surged, but the criteria have shifted.\n\nHere is what separates candidates who get interviews from the 90% who get auto-rejected by ATS:\n• Quantified metrics in bullet 1\n• Role-specific technical depth\n• Direct application without third-party recruitment brokers`;
    cta = `Explore verified live opportunities and apply in 1-click:\n👉 ${destinationUrl}`;
  } else if (platform === 'youtube') {
    title = `Before You Apply for "${query}" — Watch This`;
    copy = `[0-3s Hook] Stop sending your resume for ${query} until you check this one thing.\n[4-20s Value] 80% of applicants get filtered out by simple parser errors. Here is how to format your bullets for 100% pass rates.\n[21-30s CTA] Check the verified openings link in bio!`;
    cta = `Link in bio / pinned comment: ${destinationUrl}`;
  } else {
    title = `Verified Opportunity: ${query}`;
    copy = `Explore active roles and benchmarks for ${query}.`;
    cta = `Direct link: ${destinationUrl}`;
  }

  return {
    platform,
    format,
    title,
    copy,
    cta,
    destinationUrl
  };
}

module.exports = { generatePlatformContent };
