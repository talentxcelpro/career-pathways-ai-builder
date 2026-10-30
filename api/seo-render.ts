// api/seo-render.ts
// Vercel Serverless Edge SEO HTML Hydrator
// Serves 100% complete, pre-rendered semantic HTML documents with zero JS required to both Googlebot and human browsers

export const config = {
  runtime: 'edge',
};

const PRIVATE_ROUTE_PREFIXES = [
  '/auth', '/admin', '/company-os', '/dashboard', '/settings', '/onboarding', '/my-applications',
  '/jobs/apply', '/jobs/dashboard', '/jobs/my-applications', '/companies/admin', '/companies/settings',
  '/network/messages', '/network/notifications', '/network/settings', '/resume/user', '/resume/private',
  '/resume/edit', '/resume/build', '/resume-builder', '/resume/builder', '/resume/portfolio', '/resume/upload',
  '/build', '/upload', '/resume/my-resumes', '/resume/dashboard', '/profile/edit', '/profile/settings',
  '/tools/internal', '/tools/private', '/learning/my-courses', '/learning/my-progress', '/learning/progress',
  '/learning/dashboard', '/colleges/admin', '/colleges/private', '/careermap/private', '/careermap/user',
  '/careerpassport/user', '/careerpassport/private', '/employer/settings', '/employer/dashboard',
  '/employer/private', '/marketplace/orders', '/marketplace/private', '/events/settings', '/events/private',
  '/career-dashboard', '/provider/dashboard', '/checkout', '/subscription', '/billing', '/account',
  '/diagnostics', '/debug', '/testing', '/launch', '/access-control-test', '/realtime-demo', '/mobile-demo',
];

function isPrivateRoute(path: string): boolean {
  const normalized = `/${path.split('/').filter(Boolean).join('/').toLowerCase()}`;
  return PRIVATE_ROUTE_PREFIXES.some((prefix) =>
    normalized === prefix || normalized.startsWith(prefix.endsWith('-') ? prefix : `${prefix}/`)
  );
}

function privateRouteResponse(): Response {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>TalentXcel Account</title>
<meta name="description" content="This restricted TalentXcel page is unavailable in search results."></head>
<body><main><h1>TalentXcel</h1><p>This page is restricted and is not available in search results.</p></main></body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Render-Engine': 'TalentXcel-Private-Route-Guard',
    },
  });
}

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const pathParam = url.searchParams.get('path') || url.pathname.replace(/^\/api\/seo-render\/?/, '') || '/';
  const cleanPath = pathParam.replace(/^\//, '').replace(/\/$/, '');

  if (isPrivateRoute(cleanPath)) return privateRouteResponse();

  if (cleanPath.endsWith('.xml') || cleanPath.includes('sitemap') || cleanPath.includes('feed')) {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><error>XML route - not HTML</error>', {
      status: 404,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }

  const html = generateDynamicSeoHtml(cleanPath);

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      'X-Render-Engine': 'TalentXcel-Edge-SSR-Hydrator',
    },
  });
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function generateDynamicSeoHtml(cleanPath: string): string {
  const parts = cleanPath.split('/');
  const prefix = parts[0] || '';
  const secondary = parts[1] || '';

  const formatTitle = (s: string) => s.split(/[-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  let title = 'TalentXcel — The Global Professional Talent Network';
  let description = 'Connect with Tech & Leadership Professionals Worldwide across UAE, Europe, Americas, and Asia. Verify skills and explore career opportunities.';
  // Apex canonical consolidation - all catalog equity concentrates onto talentxcel.in
  let canonical = `https://talentxcel.in/${cleanPath}`;
  let h1 = 'TalentXcel Career Universe';
  let bodyContent = '';
  let jsonLdSchema: any = null;
  let robotsDirective = 'index, follow';

  if (prefix === 'locations' && secondary) {
    const cityName = formatTitle(secondary);
    title = `Jobs & Tech Hiring in ${cityName} 2026 | TalentXcel`;
    description = `Explore technology job listings, hiring information, and career opportunities in ${cityName}.`;
    canonical = `https://talentxcel.in/locations/${secondary}`;
    h1 = `Jobs & Tech Hiring in ${cityName} (2026)`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Employment &amp; Techcorridor Market in ${escapeHtml(cityName)}</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Browse job listings and career information for ${escapeHtml(cityName)} on TalentXcel. Review each listing for current requirements and compensation details.</p>
        <div class="pt-4 flex flex-wrap gap-3">
          <a href="/locations/${escapeHtml(secondary)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Browse All ${escapeHtml(cityName)} Jobs &rarr;</a>
          <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Free ATS Score Scan &rarr;</a>
        </div>
      </section>
    `;
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "Place",
      "name": cityName,
      "description": `Job vacancies and tech hiring in ${cityName}`
    };
  } else if (cleanPath === 'jobs' || (prefix === 'jobs' && !secondary)) {
    title = 'Technology & Engineering Jobs | TalentXcel';
    description = 'Browse technology and engineering job listings on TalentXcel. Review each listing for current requirements and application details.';
    canonical = 'https://talentxcel.in/jobs';
    h1 = 'Explore Technology & Engineering Jobs';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Active Technology Corridors &amp; Openings</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Browse engineering, data, and product jobs across technology roles and locations in India. Open a listing to review its current requirements and application details.</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
          <a href="/jobs/software-engineer-in-bangalore" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Software Engineer in Bangalore</a>
          <a href="/jobs/full-stack-developer-in-hyderabad" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Full Stack Developer in Hyderabad</a>
          <a href="/jobs/data-scientist-in-pune" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Data Scientist in Pune</a>
          <a href="/jobs/devops-engineer-in-mumbai" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">DevOps Engineer in Mumbai</a>
        </div>
      </section>
    `;
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Technology & Engineering Jobs",
      "url": canonical
    };
  } else if (prefix === 'jobs' && secondary) {
    if (parts.length >= 4) {
      const roleSlug = parts[1];
      const expSlug = parts[2];
      const citySlug = parts[parts.length - 1];
      const roleName = formatTitle(roleSlug);
      const expName = formatTitle(expSlug);
      const cityName = formatTitle(citySlug);
      title = `${roleName} Jobs (${expName}) in ${cityName} 2026 | TalentXcel`;
      description = `Explore ${roleName} job listings for ${expName} professionals in ${cityName}. Review each listing for current requirements and application details.`;
      canonical = `https://talentxcel.in/${cleanPath}`;
      h1 = `${roleName} Jobs (${expName}) in ${cityName}`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} (${escapeHtml(expName)}) Employment Hub in ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Browse ${escapeHtml(roleName)} listings for ${escapeHtml(expName)} professionals in ${escapeHtml(cityName)}. Check each listing for its current requirements and compensation information.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Role Category</span><span class="font-semibold text-emerald-400">${escapeHtml(roleName)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Experience Tier</span><span class="font-semibold text-purple-400">${escapeHtml(expName)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Location</span><span class="font-semibold text-white">${escapeHtml(cityName)}</span></div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View ${escapeHtml(roleName)} Openings &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Scan ATS Resume &rarr;</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "Occupation",
        "name": roleName,
        "occupationLocation": {
          "@type": "City",
          "name": cityName
        },
        "description": `${roleName} (${expName}) employment opportunities in ${cityName}`
      };
    } else if (parts.length === 3) {
      const roleSlug = parts[1];
      const citySlug = parts[2];
      const roleName = formatTitle(roleSlug);
      const cityName = formatTitle(citySlug);
      title = `${roleName} Jobs in ${cityName} 2026 | TalentXcel`;
      description = `Explore ${roleName} job listings and career opportunities in ${cityName}. Review each listing for current requirements and compensation information.`;
      canonical = `https://talentxcel.in/jobs/${roleSlug}/${citySlug}`;
      h1 = `${roleName} Jobs in ${cityName}`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} Employment Corridor in ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Browse ${escapeHtml(roleName)} listings in ${escapeHtml(cityName)}. Check each listing for current requirements and details supplied by the employer.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Role Category</span><span class="font-semibold text-emerald-400">${escapeHtml(roleName)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Location</span><span class="font-semibold text-white">${escapeHtml(cityName)}</span></div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs/${escapeHtml(roleSlug)}-in-${escapeHtml(citySlug)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View ${escapeHtml(roleName)} Openings &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Scan ATS Resume &rarr;</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "Occupation",
        "name": roleName,
        "occupationLocation": {
          "@type": "City",
          "name": cityName
        },
        "description": `${roleName} employment opportunities in ${cityName}`
      };
    } else if (secondary === 'freshers' || secondary === 'fresher') {
      title = 'Fresher Jobs in India 2026 — Entry Level Hiring, Trainee & Graduate Openings | TalentXcel';
      description = 'Explore entry-level career resources and job listings for graduates across Bangalore, Hyderabad, Pune, Mumbai, and remote locations in India.';
      canonical = 'https://talentxcel.in/jobs/freshers';
      h1 = 'Fresher Jobs & Entry Level Career Opportunities (2026)';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Entry-Level Trainee &amp; Fresher Recruitment Drive</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Browse graduate career resources and review current entry-level vacancies on TalentXcel.</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
            <a href="/jobs/software-engineer-in-bangalore" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Junior Software Engineer</a>
            <a href="/jobs/data-analyst-in-hyderabad" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Graduate Data Analyst</a>
            <a href="/jobs/qa-engineer-in-pune" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">QA Automation Trainee</a>
            <a href="/resume/build" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Build Fresher Resume</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Fresher Jobs & Graduate Careers",
        "url": canonical
      };
    } else if (secondary.includes('-in-')) {
      const parts = secondary.split('-in-');
      const roleName = formatTitle(parts[0]);
      const cityName = formatTitle(parts.slice(1).join('-in-'));
      title = `${roleName} Jobs in ${cityName} 2026 | TalentXcel`;
      description = `Explore ${roleName} job listings and career opportunities in ${cityName}. Review each listing for current requirements and compensation information.`;
      canonical = `https://talentxcel.in/jobs/${secondary}`;
      h1 = `${roleName} Jobs in ${cityName}`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} Employment Corridor in ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Browse ${escapeHtml(roleName)} listings in ${escapeHtml(cityName)}. Check each listing for current requirements and details supplied by the employer.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Role Category</span><span class="font-semibold text-emerald-400">${escapeHtml(roleName)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Location</span><span class="font-semibold text-white">${escapeHtml(cityName)}</span></div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs/${escapeHtml(secondary)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View ${escapeHtml(roleName)} Openings &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Scan ATS Resume &rarr;</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "Occupation",
        "name": roleName,
        "occupationLocation": {
          "@type": "City",
          "name": cityName
        },
        "description": `${roleName} employment opportunities in ${cityName}`
      };
    } else {
      const jobTitle = formatTitle(secondary);
      title = `${jobTitle} Jobs & Career Opportunities | TalentXcel`;
      description = `Explore ${jobTitle} opportunities on TalentXcel. Review available listings for current requirements and application details.`;
      canonical = `https://talentxcel.in/jobs/${secondary}`;
      h1 = jobTitle;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
          <h2 class="text-xl font-bold text-white">${escapeHtml(jobTitle)}</h2>
          <p class="text-slate-300 text-sm">Browse current listings and review the role requirements and application information provided on each job page.</p>
        </section>
      `;
    }
  } else if ((prefix === 'industries' || prefix === 'industry') && secondary) {
    const indName = formatTitle(secondary);
    title = `${indName} Jobs & Career Opportunities 2026 | TalentXcel`;
    description = `Explore career paths, skills, and job listings in the ${indName} industry on TalentXcel.`;
    canonical = `https://talentxcel.in/industries/${secondary}`;
    h1 = `${indName} Industry Careers & Job Openings (2026)`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">${escapeHtml(indName)} Employment Hub &amp; Industry Trends</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Browse career information and job listings related to ${escapeHtml(indName)}.</p>
        <div class="pt-4 flex flex-wrap gap-3">
          <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View ${escapeHtml(indName)} Jobs &rarr;</a>
          <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Scan ATS Resume &rarr;</a>
        </div>
      </section>
    `;
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${indName} Industry Careers`,
      "url": canonical
    };
  } else if (prefix === 'compare' && secondary) {
    const compParts = secondary.split('-vs-');
    const nameA = formatTitle(compParts[0] || 'College A');
    const nameB = formatTitle(compParts[1] || 'College B');
    title = `${nameA} vs ${nameB} [2026 Comparison] — Fees, Cutoffs & Placements | TalentXcel`;
    description = `Review available institution information for ${nameA} and ${nameB} on TalentXcel.`;
    canonical = `https://talentxcel.in/compare/${secondary}`;
    h1 = `${nameA} vs ${nameB}`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">${escapeHtml(nameA)} vs ${escapeHtml(nameB)}</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Review current fees, rankings, admissions, and placement information on each institution profile before comparing the available details.</p>
      </section>
    `;
  } else if ((prefix === 'profile' || prefix === 'user' || prefix === 'p') && secondary) {
    const profileSlug = secondary;
    const displayName = formatTitle(profileSlug.replace(/-specialist.*/, '').replace(/-expert.*/, ''));
    title = `${displayName} Professional Profile | TalentXcel`;
    description = `Explore profile information shared by ${displayName} on TalentXcel.`;
    canonical = `https://talentxcel.in/profile/${profileSlug}`;
    h1 = `${displayName} Professional Profile`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
            ${escapeHtml(displayName.charAt(0))}
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">${escapeHtml(displayName)}</h2>
            <p class="text-slate-400 text-xs">TalentXcel member profile</p>
          </div>
        </div>
        <p class="text-slate-300 text-sm leading-relaxed">Visit this member profile to view information shared by its owner.</p>
        <div class="pt-4 flex flex-wrap gap-3">
          <a href="/profile/${escapeHtml(profileSlug)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View Full Talent Profile &rarr;</a>
          <a href="/passport" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Verify Your Career Passport &rarr;</a>
        </div>
      </section>
    `;
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": displayName,
      "url": canonical,
      "jobTitle": displayName,
      "worksFor": {
        "@type": "Organization",
        "name": "TalentXcel Professional Network"
      }
    };
  } else if (prefix === 'directory') {
    title = `TalentXcel Comprehensive Directory — Colleges, Salaries, Jobs & City Hubs (2026)`;
    description = `Browse TalentXcel directories for higher education, salary guides, jobs by city, and career resources.`;
    canonical = `https://talentxcel.in/directory`;
    h1 = `TalentXcel Directory & Resource Index`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Ecosystem Navigation Hub</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <a href="/directory/colleges-a-z" class="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500 block">
            <span class="font-bold text-white text-sm block mb-1">Colleges A-Z</span>
            <span class="text-slate-400">Browse institution profiles</span>
          </a>
          <a href="/directory/salaries-by-role" class="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500 block">
            <span class="font-bold text-white text-sm block mb-1">Salaries by Role</span>
            <span class="text-slate-400">Explore salary guides by role</span>
          </a>
          <a href="/directory/jobs-by-city" class="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500 block">
            <span class="font-bold text-white text-sm block mb-1">Jobs by City</span>
            <span class="text-slate-400">Find jobs by location</span>
          </a>
        </div>
      </section>
    `;
  } else if (cleanPath === 'salary' || cleanPath === 'salaries' || cleanPath.startsWith('salary/') || cleanPath.startsWith('career-insights/salary/')) {
    if (cleanPath === 'salary' || cleanPath === 'salaries') {
      title = 'Technology Salary Guides | TalentXcel';
      description = 'Explore TalentXcel salary tools and review compensation information provided with current job listings.';
      canonical = 'https://talentxcel.in/salary';
      h1 = 'Technology Salary Guides';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Salary Guides by Role and Location</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Role and location guides are published only when source-backed compensation data is available. Use the salary tool or review employer-provided details in current job listings.</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
            <a href="/tools/salary-analyzer" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Salary Analyzer</a>
            <a href="/jobs" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Current Job Listings</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "TalentXcel Salary Tools and Information",
        "url": canonical
      };
    } else {
      const slug = cleanPath.replace(/^(career-insights\/salary\/|salary\/)/, '');
      const cleanSlug = slug.replace('-salary', '');
      const parts = cleanSlug.split('-in-');
      const roleName = formatTitle(parts[0] || 'Tech Role');
      const cityName = parts[1] ? formatTitle(parts[1]) : 'Global Hubs';
      title = `${roleName} Salary Information in ${cityName} | TalentXcel`;
      description = `Source-backed salary information for ${roleName} in ${cityName} will be published when available.`;
      canonical = `https://talentxcel.in/${cleanPath}`;
      h1 = `${roleName} Salary Guide in ${cityName}`;
      robotsDirective = 'noindex, follow';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} compensation in ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">TalentXcel does not currently have a source-backed salary distribution to publish for this role and location. Review current job listings for compensation details supplied by employers.</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Browse Live ${escapeHtml(roleName)} Jobs &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Free ATS Resume Scan &rarr;</a>
          </div>
        </section>
      `;
      jsonLdSchema = null;
    }
  } else if (cleanPath === 'talent') {
    title = 'Talent Directory | TalentXcel';
    description = 'Search member profiles that are marked public on TalentXcel.';
    canonical = 'https://talentxcel.in/talent';
    h1 = 'Public Talent Directory';
    robotsDirective = 'noindex, follow';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
        <h2 class="text-xl font-bold text-white">Search Public Member Profiles</h2>
        <p class="text-slate-300 text-sm leading-relaxed">The directory displays profile information members have marked public. Profile details and availability are supplied by members.</p>
        <a href="/hire" class="inline-block px-5 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl">Explore employer tools &rarr;</a>
      </section>
    `;
  } else if (cleanPath === 'resume' || cleanPath.startsWith('resume/')) {
    if (cleanPath === 'resume' || !cleanPath.startsWith('resume/interview-prep/')) {
      title = 'Free ATS Resume Scanner, AI Resume Builder & Templates 2026 | TalentXcel';
      description = 'Scan your resume against ATS algorithms for free. Real-time ATS match score, keyword gap detection, and expert interview prep guides on TalentXcel.';
      canonical = 'https://talentxcel.in/resume';
      h1 = 'AI Resume Builder & Free ATS Scanner (2026)';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">ATS Optimization &amp; Interview Preparation</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Optimize your resume for modern applicant tracking systems (Taleo, Workday, Greenhouse) and prepare for technical interviews with company-specific questions.</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
            <a href="/resume/ats-check" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Free ATS Scanner</a>
            <a href="/resume/build" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">AI Resume Builder</a>
            <a href="/resume/interview-prep/software-engineer-interview-questions-and-answers" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Software Engineer Prep</a>
            <a href="/resume/interview-prep/react-developer-interview-questions-and-answers" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">React Interview Prep</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "ATS Resume Builder & Tools",
        "url": canonical
      };
    } else {
      const slug = cleanPath.replace('resume/interview-prep/', '');
      const cleanRole = slug.replace(/-interview-questions-and-answers.*/, '');
      const roleName = formatTitle(cleanRole || 'Software Engineer');
      title = `${roleName} Interview Questions & Answers (2026 Technical Prep) | TalentXcel`;
      description = `Review interview preparation resources for ${roleName} roles on TalentXcel.`;
      canonical = `https://talentxcel.in/resume/interview-prep/${slug}`;
      h1 = `${roleName} Interview Questions & Preparation Guide`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Interview preparation for ${escapeHtml(roleName)}</h2>
          <h3 class="text-base font-semibold text-white">What should I prepare for a ${escapeHtml(roleName)} interview?</h3>
          <p class="text-slate-300 text-sm leading-relaxed">Review the skills and tools in the job description, practice relevant problem-solving exercises, and prepare examples of your work. Specific interview topics vary by employer.</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/resume/interview-prep" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Start Interactive Mock Interview &rarr;</a>
            <a href="/resume/build" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Build Matching ATS Resume &rarr;</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `What should I prepare for a ${roleName} interview?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Review the skills and tools in the job description, practice relevant problem-solving exercises, and prepare examples of your work. Specific interview topics vary by employer.`
            }
          }
        ]
      };
    }
  } else if (cleanPath === 'learning' || cleanPath.startsWith('courses/')) {
    if (cleanPath === 'learning') {
      title = 'Tech Courses, Skill Certifications & Career Tracks 2026 | TalentXcel Academy';
      description = 'Explore technology courses and learning resources in Python, React, Cloud, DevOps, AI, and Machine Learning.';
      canonical = 'https://talentxcel.in/learning';
      h1 = 'Tech Skill Certifications & Career Tracks (2026)';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Technology Courses and Learning Resources</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Browse course and learning options by subject and location.</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
            <a href="/courses/python-courses-in-hyderabad" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Python in Hyderabad</a>
            <a href="/courses/react-courses-in-bangalore" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">React in Bangalore</a>
            <a href="/courses/aws-courses-in-pune" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">AWS Cloud in Pune</a>
            <a href="/courses/machine-learning-courses-in-delhi-ncr" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">ML in Delhi-NCR</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Tech Courses & Certifications",
        "url": canonical
      };
    } else {
      const slug = cleanPath.replace('courses/', '');
      const cleanCourse = slug.replace(/-courses-in-.*/, '');
      const courseName = formatTitle(cleanCourse);
      const cityMatch = slug.match(/-courses-in-(.*)/);
      const cityName = cityMatch ? formatTitle(cityMatch[1]) : 'Online & Hybrid';
      title = `Best ${courseName} Courses in ${cityName} (2026 Certification & Training) | TalentXcel`;
      description = `Browse ${courseName} course and career information for ${cityName} on TalentXcel.`;
      canonical = `https://talentxcel.in/courses/${slug}`;
      h1 = `${courseName} Courses & Training in ${cityName}`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(courseName)} Career & Certification Track</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Review the available ${escapeHtml(courseName)} learning options and related career information for ${escapeHtml(cityName)}.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Learning Format</span><span class="font-semibold text-emerald-400">Self-Paced / Mentor-Led</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Credential</span><span class="font-semibold text-white">Verified Career Passport</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Placement Support</span><span class="font-semibold text-blue-400">Direct Recruiter Matching</span></div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/learning" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Explore Course Catalog &rarr;</a>
            <a href="/passport" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Unlock Career Passport &rarr;</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": courseName,
        "description": `Professional certification and training in ${courseName}`,
        "provider": {
          "@type": "Organization",
          "name": "TalentXcel Academy"
        }
      };
    }
  } else if (cleanPath.startsWith('careers/')) {
    const slug = cleanPath.replace('careers/', '');
    const cleanRole = slug.replace(/-roadmap.*/, '');
    const roleName = formatTitle(cleanRole);
    title = `How to Become a ${roleName} in 2026 (Roadmap & Career Pathway) | TalentXcel`;
    description = `Explore a career pathway for ${roleName}, including relevant skills, progression stages, and learning resources on TalentXcel.`;
    canonical = `https://talentxcel.in/careers/${slug}`;
    h1 = `${roleName} Career Roadmap & Pathway`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Career Progression Roadmap for ${escapeHtml(roleName)}</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Explore skills, progression stages, and learning resources for a career in ${escapeHtml(roleName)}.</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Skill Focus</span><span class="font-semibold text-blue-400">Role-related skills</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Typical Progression</span><span class="font-semibold text-white">Junior &rarr; Mid &rarr; Senior &rarr; Lead</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Related Resource</span><span class="font-semibold text-emerald-400">Current job listings</span></div>
        </div>
        <div class="pt-4 flex flex-wrap gap-3">
          <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View ${escapeHtml(roleName)} Jobs &rarr;</a>
          <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Scan ATS Resume &rarr;</a>
        </div>
      </section>
    `;
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "Occupation",
      "name": roleName,
      "description": `Career pathway and progression roadmap for ${roleName}`
    };
  } else if (cleanPath === 'colleges' || cleanPath.startsWith('colleges/')) {
    if (cleanPath === 'colleges') {
      title = 'Top Colleges in India 2026 — NIRF Rankings, Cutoffs, Fees & Placements | TalentXcel';
      description = 'Browse Indian higher education profiles and review available information about admissions, fees, rankings, and placements on TalentXcel.';
      canonical = 'https://talentxcel.in/colleges';
      h1 = 'Accredited Higher Education & Engineering Colleges (2026)';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Higher Education Directories &amp; Institutional Profiles</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Browse institution profiles and review the information available for each college.</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
            <a href="/colleges/delhi-institute-of-technology" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Delhi Institute of Technology</a>
            <a href="/compare/indian-institute-of-technology-bombay-vs-indian-institute-of-technology-delhi" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">IIT Bombay vs IIT Delhi</a>
            <a href="/directory/colleges-a-z" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Colleges A-Z Index</a>
            <a href="/resume/build" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Campus Placement Resume</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Accredited Colleges & Higher Education",
        "url": canonical
      };
    } else {
      const slug = cleanPath.replace('colleges/', '');
      const cleanCollege = slug.replace(/-campus.*/, '');
      const collegeName = formatTitle(cleanCollege);
      title = `${collegeName} Admissions, Placements, Fees & Cutoffs (2026) | TalentXcel`;
      description = `Browse available admissions, fee, ranking, and placement information for ${collegeName} on TalentXcel.`;
      canonical = `https://talentxcel.in/colleges/${slug}`;
      h1 = `${collegeName} Institutional Overview`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Academic & Placement Profile: ${escapeHtml(collegeName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Review the institution information available on TalentXcel, and confirm admissions, fees, rankings, and placements with the college before making decisions.</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/colleges" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Compare With Other Colleges &rarr;</a>
            <a href="/resume/build" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Build Campus Placement Resume &rarr;</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": collegeName,
        "description": `Higher education programs and placement data for ${collegeName}`
      };
    }
  } else if (prefix === 'passport') {
    if (cleanPath.startsWith('passport/proof/')) {
      const proofId = cleanPath.replace('passport/proof/', '');
      const roleMatch = proofId.replace(/^txc-verify-/, '').replace(/-\d+$/, '');
      const roleName = formatTitle(roleMatch || 'Professional Skill');
      title = `${roleName} Verified Proof & Career Credential (${escapeHtml(proofId)}) | TalentXcel Passport`;
      description = `Cryptographically authenticated career proof for ${roleName}. Verified skills, assessment benchmarks, and tamper-proof credential record on TalentXcel.`;
      canonical = `https://talentxcel.in/passport/proof/${proofId}`;
      h1 = `${roleName} Verified Credential Proof`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span class="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded">Cryptographically Authenticated</span>
              <h2 class="text-xl font-bold text-white mt-2">${escapeHtml(roleName)} Capability Proof</h2>
            </div>
            <span class="text-xs font-mono text-slate-400">ID: ${escapeHtml(proofId)}</span>
          </div>
          <p class="text-slate-300 text-sm leading-relaxed">This career credential has been verified through TalentXcel's skill assessment protocol and tamper-proof verification ledger, validating real-world domain mastery and industry readiness.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Verification Standard</span><span class="font-semibold text-emerald-400">TalentXcel Proof Protocol</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Credential Integrity</span><span class="font-semibold text-white">SHA-256 Validated</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Recruiter Access</span><span class="font-semibold text-blue-400">Directly Verifiable</span></div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/passport/proof/${escapeHtml(proofId)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Inspect Proof Ledger &rarr;</a>
            <a href="/passport" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Claim Your Career Passport &rarr;</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "EducationalOccupationalCredential",
        "name": `${roleName} Verified Skill Proof`,
        "credentialCategory": "Professional Certification",
        "recognizedBy": {
          "@type": "Organization",
          "name": "TalentXcel Global Credential Ledger"
        },
        "identifier": proofId
      };
    } else {
      title = `Career Passport & Portable Skills Verification Ledger | TalentXcel`;
      description = `Build, verify, and showcase your cryptographic career passport. Instant skill verification, tamper-proof proof-of-work, and direct recruiter discovery.`;
      canonical = `https://talentxcel.in/passport`;
      h1 = `TalentXcel Career Passport Platform`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Your Cryptographic Career Identity</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Turn your achievements, project code, and verified skills into a globally recognized portable credential. Recruiters verify credentials directly without third-party friction.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Standard</span><span class="font-semibold text-emerald-400">Verifiable Credentials</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Verification Speed</span><span class="font-semibold text-white">Instant / Cryptographic</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Global Portability</span><span class="font-semibold text-blue-400">Universal Access</span></div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/passport" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Launch Career Passport &rarr;</a>
          </div>
        </section>
      `;
    }
  } else if (prefix === 'network') {
    if (cleanPath.startsWith('network/communities/')) {
      const commSlug = cleanPath.replace('network/communities/', '');
      const parts = commSlug.split('-in-');
      const roleName = formatTitle(parts[0].replace(/-leaders$/, ''));
      const cityName = parts[1] ? formatTitle(parts[1]) : 'Global Hubs';
      title = `${roleName} Leaders & Tech Community in ${cityName} | TalentXcel Network`;
      description = `Connect with ${roleName} professionals and engineering leaders in ${cityName}. Join local tech community meetups, mentorship hubs, and exclusive career channels.`;
      canonical = `https://talentxcel.in/network/communities/${commSlug}`;
      h1 = `${roleName} Leadership Community in ${cityName}`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} Professional Hub in ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Collaborate with senior ${escapeHtml(roleName)} peers, participate in regional tech circles, share architecture designs, and unlock high-impact opportunities in ${escapeHtml(cityName)}.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Community Hub</span><span class="font-semibold text-purple-400">${escapeHtml(cityName)} Chapter</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Domain Focus</span><span class="font-semibold text-white">${escapeHtml(roleName)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Peer Network</span><span class="font-semibold text-emerald-400">Verified Leaders</span></div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/network/communities" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Join ${escapeHtml(roleName)} Community &rarr;</a>
            <a href="/network" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Explore Global Network &rarr;</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": `${roleName} Leadership Community (${cityName})`,
        "description": `Professional tech community for ${roleName} specialists in ${cityName}`,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": cityName
        }
      };
    } else {
      title = `TalentXcel Professional Network & Community Ecosystem`;
      description = 'Connect with technology professionals and explore domain-focused communities on TalentXcel.';
      canonical = `https://talentxcel.in/network`;
      h1 = `TalentXcel Global Professional Network`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Global Tech Peer Communities &amp; Collaboration</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Explore communities for engineering, product management, AI research, and executive leadership. Members can share insights in domain-focused groups.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Communities</span><span class="font-semibold text-emerald-400">Explore available groups</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Verification</span><span class="font-semibold text-white">Peer-Endorsed Credentials</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Networking Speed</span><span class="font-semibold text-blue-400">Direct Connections</span></div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/network" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Explore All Communities &rarr;</a>
          </div>
        </section>
      `;
    }
  } else if ((prefix === 'company' || prefix === 'companies') && secondary) {
    const compSlug = secondary;
    const compName = formatTitle(compSlug);
    title = `${compName} — Careers, Tech Stack & Hiring Openings | TalentXcel`;
    description = `Explore company information and available job listings for ${compName} on TalentXcel.`;
    canonical = `https://talentxcel.in/company/${compSlug}`;
    h1 = `${compName} — Corporate Profile & Hiring Hub`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">${escapeHtml(compName)} Overview &amp; Talent Ecosystem</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Review the company information and current job listings available on TalentXcel.</p>
        <div class="pt-4 flex flex-wrap gap-3">
          <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View Active Vacancies &rarr;</a>
          <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Scan Resume for Match &rarr;</a>
        </div>
      </section>
    `;
  } else if (prefix === 'posts' || prefix === 'post') {
    const postSlug = secondary || cleanPath.replace(/^posts?\/?/, '');
    const cleanTopic = postSlug.replace(/-market-trends-and-insights.*/, '').replace(/-edition-.*/, '');
    const topicName = formatTitle(cleanTopic || 'Tech Industry');
    title = `${topicName} Career Resources | TalentXcel`;
    description = `Browse TalentXcel resources about ${topicName} and related career topics.`;
    canonical = `https://talentxcel.in/posts/${postSlug}`;
    h1 = `${topicName} Career Resources`;
    bodyContent = `
      <article class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span class="text-blue-400 font-semibold">TalentXcel Resources</span>
        </div>
        <h2 class="text-xl font-bold text-white">Explore ${escapeHtml(topicName)}</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Browse related job listings and career resources on TalentXcel.</p>
        <div class="pt-4 flex flex-wrap gap-3">
          <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View ${escapeHtml(topicName)} Jobs &rarr;</a>
          <a href="/network" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Discuss in Tech Communities &rarr;</a>
        </div>
      </article>
    `;
  } else {
    robotsDirective = 'noindex, follow';
    h1 = formatTitle(cleanPath || 'Career & Employment Ecosystem');
    title = `${h1} | TalentXcel`;
    bodyContent = `<div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl"><p class="text-slate-300 text-sm">This page is not available on TalentXcel. Browse current jobs, salary guides, and institution profiles instead.</p></div>`;
  }

  const subdomainMeshHtml = `
    <footer class="mt-16 border-t border-slate-800 bg-slate-900/90 py-10 px-6">
      <div class="max-w-6xl mx-auto space-y-6 text-xs text-slate-400">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div class="text-sm font-bold text-white uppercase tracking-wider">TalentXcel Specialized Career &amp; Employment Ecosystem</div>
            <p class="text-slate-400 text-xs mt-0.5">Explore jobs, salary guides, ATS resume tools, higher education profiles, and career resources.</p>
          </div>
          <span class="text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded text-[11px] font-mono">TalentXcel</span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div>
            <a href="https://talentxcel.in/jobs" class="font-bold text-white hover:text-blue-400 block mb-2">Jobs Universe &rarr;</a>
            <ul class="space-y-1">
              <li><a href="https://talentxcel.in/jobs" class="hover:text-slate-200">Live Vacancies</a></li>
              <li><a href="https://talentxcel.in/locations/bangalore" class="hover:text-slate-200">Software Engineer Bangalore</a></li>
              <li><a href="https://talentxcel.in/jobs/freshers" class="hover:text-slate-200">Fresher Jobs India</a></li>
              <li><a href="https://talentxcel.in/locations/hyderabad" class="hover:text-slate-200">Data Analyst Hyderabad</a></li>
            </ul>
          </div>
          <div>
            <a href="https://talentxcel.in/salary" class="font-bold text-white hover:text-blue-400 block mb-2">Salary Intelligence &rarr;</a>
            <ul class="space-y-1">
              <li><a href="https://talentxcel.in/salary" class="hover:text-slate-200">Salary Guides &amp; Curves</a></li>
              <li><a href="https://talentxcel.in/salary/software-engineer/bangalore" class="hover:text-slate-200">Software Engineer Pay</a></li>
              <li><a href="https://talentxcel.in/salary/devops-engineer/pune" class="hover:text-slate-200">DevOps Engineer Pay</a></li>
              <li><a href="https://talentxcel.in/tools/salary-analyzer" class="hover:text-slate-200">Salary Benchmark Tool</a></li>
            </ul>
          </div>
          <div>
            <a href="https://talentxcel.in/colleges" class="font-bold text-white hover:text-blue-400 block mb-2">Higher Education &rarr;</a>
            <ul class="space-y-1">
              <li><a href="https://talentxcel.in/colleges" class="hover:text-slate-200">Top Indian Colleges</a></li>
              <li><a href="https://talentxcel.in/compare/indian-institute-of-technology-bombay-vs-indian-institute-of-technology-delhi" class="hover:text-slate-200">IIT Bombay vs IIT Delhi</a></li>
              <li><a href="https://talentxcel.in/colleges/coep-pune" class="hover:text-slate-200">COEP Pune Placements</a></li>
              <li><a href="https://talentxcel.in/colleges/global-programs" class="hover:text-slate-200">Global Programs</a></li>
            </ul>
          </div>
          <div>
            <a href="https://talentxcel.in/resume" class="font-bold text-white hover:text-blue-400 block mb-2">ATS Resume Tools &rarr;</a>
            <ul class="space-y-1">
              <li><a href="https://talentxcel.in/resume/ats-check" class="hover:text-slate-200">Free ATS Scanner</a></li>
              <li><a href="https://talentxcel.in/resume/builder" class="hover:text-slate-200">AI Resume Builder</a></li>
              <li><a href="https://talentxcel.in/resume/templates" class="hover:text-slate-200">Executive ATS Templates</a></li>
              <li><a href="https://talentxcel.in/resume/score" class="hover:text-slate-200">Benchmark ATS Score</a></li>
            </ul>
          </div>
          <div>
            <a href="https://talentxcel.in/directory" class="font-bold text-white hover:text-blue-400 block mb-2">Master Directory &rarr;</a>
            <ul class="space-y-1">
              <li><a href="https://talentxcel.in/directory/colleges-a-z" class="hover:text-slate-200">Colleges A-Z</a></li>
              <li><a href="https://talentxcel.in/directory/salaries-by-role" class="hover:text-slate-200">Salaries by Role</a></li>
              <li><a href="https://talentxcel.in/directory/jobs-by-city" class="hover:text-slate-200">Jobs by City</a></li>
              <li><a href="https://talentxcel.in/passport" class="hover:text-slate-200">Career Passport</a></li>
              <li><a href="https://talentxcel.in/network" class="hover:text-slate-200">Global Network</a></li>
              <li><a href="https://talentxcel.in/posts" class="hover:text-slate-200">Industry Insights</a></li>
            </ul>
          </div>
        </div>
        <div class="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          &copy; ${new Date().getFullYear()} TalentXcel Platform.
        </div>
      </div>
    </footer>
  `;

  const schemaTag = jsonLdSchema
    ? `<script type="application/ld+json">\n${JSON.stringify(jsonLdSchema, null, 2)}\n</script>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="robots" content="${robotsDirective}">
  <script src="https://cdn.tailwindcss.com" defer></script>
  ${schemaTag}
</head>
<body class="bg-slate-950 text-slate-100 antialiased font-sans">
  <div id="root">
    <div class="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans flex flex-col justify-between">
      <div>
        <header class="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
          <div class="max-w-7xl mx-auto flex items-center justify-between">
            <a href="https://talentxcel.in" class="text-xl font-bold text-white tracking-tight">Talent<span class="text-blue-500">Xcel</span></a>
            <nav class="hidden md:flex gap-6 text-sm font-medium text-slate-300">
              <a href="https://talentxcel.in/jobs" class="hover:text-white">Jobs</a>
              <a href="https://talentxcel.in/colleges" class="hover:text-white">Colleges</a>
              <a href="https://talentxcel.in/salary" class="hover:text-white">Salaries</a>
              <a href="https://talentxcel.in/resume" class="hover:text-white">Resume</a>
              <a href="https://talentxcel.in/directory" class="hover:text-white">Directory</a>
            </nav>
          </div>
        </header>
        <main class="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">${escapeHtml(h1)}</h1>
          ${bodyContent}
        </main>
      </div>
      ${subdomainMeshHtml}
    </div>
  </div>
</body>
</html>`;
}
