const KNOWN_FEATURED_JOBS = [
  { match: /ui\s*architect|eds\s*architect/i, id: '93a378a5-f004-4aa9-894d-189e304ddec4', title: 'UI/EDS Architect' },
  { match: /backend.*travel|travel.*backend|golang|gin/i, id: 'a740badf-8693-4189-84c9-8985351a2d80', title: 'Senior Software Engineer – Backend (Travel)' },
  { match: /program\s*manager.*expansion|global\s*expansion/i, id: '8af9e8ed-f745-41e5-b0f7-c1ac874b53b7', title: 'Program Manager - Global Expansion' },
  { match: /product\s*manager.*travel|pm\s*2.*travel/i, id: '71d6c218-a604-41e6-9838-011556d4a6ed', title: 'Product Manager II - Travel' },
  { match: /it\s*recruit|talent\s*acquisition/i, id: 'b0158cf7-388a-48fa-9191-80c12bb7baa5', title: 'Talent Acquisition Specialist - IT Recruitment' },
  { match: /graphic\s*designer/i, id: 'dd7de131-910e-4330-8163-a875725a4202', title: 'Graphic Designer' },
  { match: /hr\s*business\s*partner/i, id: '6b14a443-5a4c-43fe-b0c7-b57057ae610d', title: 'HR Business Partner - Noida' }
];

function buildAttributedUrl(basePath, params) {
  const { source, medium, campaign, content, term } = params;
  const baseUrl = `https://talentxcel.in${basePath}`;
  const url = new URL(baseUrl);

  if (source) url.searchParams.set('utm_source', source);
  if (medium) url.searchParams.set('utm_medium', medium);
  if (campaign) url.searchParams.set('utm_campaign', campaign);
  if (content) url.searchParams.set('utm_content', content);
  if (term) url.searchParams.set('utm_term', term);

  return url.toString();
}

function routeDestination(query, clusterName, channelContext = {}) {
  // 1. Check for specific live job match
  for (const job of KNOWN_FEATURED_JOBS) {
    if (job.match.test(query)) {
      return {
        path: `/jobs/${job.id}`,
        title: job.title,
        isSpecificJob: true
      };
    }
  }

  // 2. Location routing
  const varanasiMatch = /varanasi/i.test(query);
  if (varanasiMatch) return { path: '/jobs?location=Varanasi', title: 'Varanasi Verified Jobs', isSpecificJob: false };

  const patialaMatch = /patiala/i.test(query);
  if (patialaMatch) return { path: '/jobs?location=Patiala', title: 'Patiala Verified Jobs', isSpecificJob: false };

  const salemMatch = /salem|elcot/i.test(query);
  if (salemMatch) return { path: '/jobs?location=Salem', title: 'Salem & ELCOT IT Park Jobs', isSpecificJob: false };

  // 3. Cluster-based tool routing
  if (clusterName === 'Resume Writing & ATS Optimization') {
    return { path: '/ats-checker', title: 'Free Instant ATS Resume Scanner', isSpecificJob: false };
  }
  if (clusterName === 'Salary, Benchmarking & CTC') {
    return { path: '/benchmarks/india-tech-salary-report-2026', title: 'India Tech Salary Report 2026', isSpecificJob: false };
  }
  if (clusterName === 'Tier 2/3 Regional Hubs' && /index|growth|trend/i.test(query)) {
    return { path: '/benchmarks/tier-2-city-jobs-index-2026', title: 'Tier-2 City Jobs Index 2026', isSpecificJob: false };
  }
  if (clusterName === 'Interview Prep & Career Copilot') {
    return { path: '/career-copilot', title: 'AI Career Copilot & Interview Prep', isSpecificJob: false };
  }
  if (clusterName === 'Colleges & Higher Education') {
    return { path: '/colleges', title: 'Colleges & Higher Education Directory', isSpecificJob: false };
  }
  if (clusterName === 'Freshers, Entry-Level & Campus') {
    return { path: '/jobs?experience=entry-level', title: 'Verified Entry-Level & Fresher Jobs', isSpecificJob: false };
  }

  return { path: '/jobs', title: 'Verified Global Job Catalog', isSpecificJob: false };
}

module.exports = { routeDestination, buildAttributedUrl, KNOWN_FEATURED_JOBS };
