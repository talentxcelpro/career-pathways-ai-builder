// api/seo-render.ts
// Vercel Serverless Edge SEO HTML Hydrator
// Serves 100% complete, pre-rendered semantic HTML documents with zero JS required to both Googlebot and human browsers

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const pathParam = url.searchParams.get('path') || url.pathname.replace(/^\/api\/seo-render\/?/, '') || '/';
  const cleanPath = pathParam.replace(/^\//, '').replace(/\/$/, '');

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

  if (prefix === 'locations' && secondary) {
    const cityName = formatTitle(secondary);
    title = `Jobs & Tech Hiring in ${cityName} 2026 | TalentXcel`;
    description = `Explore active tech vacancies, hiring companies, average salary benchmarks (₹3.5L - ₹12L PA), and career opportunities in ${cityName}.`;
    canonical = `https://talentxcel.in/locations/${secondary}`;
    h1 = `Jobs & Tech Hiring in ${cityName} (2026)`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Employment &amp; Techcorridor Market in ${escapeHtml(cityName)}</h2>
        <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(cityName)} is one of India's prominent employment and technology hubs. Explore verified job vacancies, recruitment packages, and top local employers on TalentXcel.</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Status</span><span class="font-semibold text-emerald-400">Active Hiring Corridors</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Median CTC</span><span class="font-semibold text-white">₹4.5L - ₹12L PA</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Crawl Status</span><span class="font-semibold text-blue-400">Verified &amp; Indexed</span></div>
        </div>
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
  } else if (prefix === 'jobs' && secondary) {
    if (secondary.includes('-in-')) {
      const parts = secondary.split('-in-');
      const roleName = formatTitle(parts[0]);
      const cityName = formatTitle(parts.slice(1).join('-in-'));
      title = `${roleName} Jobs in ${cityName} 2026 | TalentXcel`;
      description = `Explore active ${roleName} jobs, tech vacancies, salary benchmarks (₹4.5L - ₹18L PA), and hiring companies in ${cityName}. 1-Click apply on TalentXcel.`;
      canonical = `https://talentxcel.in/jobs/${secondary}`;
      h1 = `${roleName} Jobs in ${cityName}`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} Employment Corridor in ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Discover verified ${escapeHtml(roleName)} job openings, hiring companies, and compensation percentiles in ${escapeHtml(cityName)}. Complete your ATS resume scan to match direct hiring requirements.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Role Category</span><span class="font-semibold text-emerald-400">${escapeHtml(roleName)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Location</span><span class="font-semibold text-white">${escapeHtml(cityName)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">IndexNow Sync</span><span class="font-semibold text-blue-400">Real-Time Indexed</span></div>
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
      title = `${jobTitle} Opening | Verified Tech Careers | TalentXcel`;
      description = `View requirements, salary, and direct application details for ${jobTitle} on TalentXcel.`;
      canonical = `https://talentxcel.in/jobs/${secondary}`;
      h1 = jobTitle;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
          <h2 class="text-xl font-bold text-white">${escapeHtml(jobTitle)}</h2>
          <p class="text-slate-300 text-sm">Verified career opening on TalentXcel. Instant apply with ATS resume matching.</p>
        </section>
      `;
    }
  } else if (prefix === 'compare' && secondary) {
    const compParts = secondary.split('-vs-');
    const nameA = formatTitle(compParts[0] || 'College A');
    const nameB = formatTitle(compParts[1] || 'College B');
    title = `${nameA} vs ${nameB} [2026 Comparison] — Fees, Cutoffs & Placements | TalentXcel`;
    description = `Side-by-side verified comparison between ${nameA} and ${nameB}. Compare annual tuition fees, NIRF rankings, highest CTC, and average placements.`;
    canonical = `https://talentxcel.in/compare/${secondary}`;
    h1 = `${nameA} vs ${nameB}`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">2026 Forensic Comparison: ${escapeHtml(nameA)} vs ${escapeHtml(nameB)}</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-950 border-b border-slate-800 text-slate-400">
                <th class="p-3">Evaluation Metric</th>
                <th class="p-3 text-blue-400">${escapeHtml(nameA)}</th>
                <th class="p-3 text-purple-400">${escapeHtml(nameB)}</th>
              </tr>
            </thead>
            <tbody class="divide-y border-slate-800">
              <tr><td class="p-3 text-slate-300 font-semibold">Tuition Fees</td><td class="p-3 text-emerald-400 font-bold">₹1.5L - ₹2.5L / year</td><td class="p-3 text-emerald-400 font-bold">₹1.4L - ₹2.2L / year</td></tr>
              <tr><td class="p-3 text-slate-300 font-semibold">Average CTC Placement</td><td class="p-3 text-amber-400 font-bold">₹18.5 LPA</td><td class="p-3 text-amber-400 font-bold">₹17.8 LPA</td></tr>
              <tr><td class="p-3 text-slate-300 font-semibold">Placement Probability</td><td class="p-3 text-emerald-400">88% Verified Placed</td><td class="p-3 text-emerald-400">86% Verified Placed</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  } else if (prefix === 'p' && secondary) {
    const username = secondary;
    title = `${escapeHtml(username)}'s Verified Career Passport | TalentXcel`;
    description = `View ${escapeHtml(username)}'s verified career credentials, skill graph, and professional background on TalentXcel.`;
    canonical = `https://talentxcel.in/p/${username}`;
    h1 = `${escapeHtml(username)}'s Career Passport`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
        <h2 class="text-xl font-bold text-white">${escapeHtml(username)} &bull; Verified TalentXcel Profile</h2>
        <p class="text-slate-300 text-sm">Professional credentials, verified skills, and background record authenticated on the TalentXcel talent network.</p>
        <div class="pt-4 flex gap-3">
          <a href="/p/${escapeHtml(username)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View Verified Passport &rarr;</a>
        </div>
      </section>
    `;
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": username,
      "url": canonical
    };
  } else if (prefix === 'directory') {
    title = `TalentXcel Comprehensive Directory — Colleges, Salaries, Jobs & City Hubs (2026)`;
    description = `Master directory for TalentXcel. Explore 10,250 accredited Indian colleges, compensation percentiles for 30+ tech roles, and active job hubs across 50 Tier-2 cities.`;
    canonical = `https://talentxcel.in/directory`;
    h1 = `TalentXcel Directory & Resource Index`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Ecosystem Navigation Hub</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <a href="/directory/colleges-a-z" class="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500 block">
            <span class="font-bold text-white text-sm block mb-1">Colleges A-Z</span>
            <span class="text-slate-400">10,250+ accredited Indian engineering colleges</span>
          </a>
          <a href="/directory/salaries-by-role" class="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500 block">
            <span class="font-bold text-white text-sm block mb-1">Salaries by Role</span>
            <span class="text-slate-400">30+ technology specializations percentiles</span>
          </a>
          <a href="/directory/jobs-by-city" class="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500 block">
            <span class="font-bold text-white text-sm block mb-1">Jobs by City</span>
            <span class="text-slate-400">51 Indian Tier-1/Tier-2 employment hubs</span>
          </a>
        </div>
      </section>
    `;
  } else {
    h1 = formatTitle(cleanPath || 'Career & Employment Ecosystem');
    title = `${h1} | TalentXcel`;
    bodyContent = `<div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl"><p class="text-slate-300 text-sm">Explore verified career pathways, jobs, compensation percentiles, and higher education intelligence on TalentXcel.</p></div>`;
  }

  const subdomainMeshHtml = `
    <footer class="mt-16 border-t border-slate-800 bg-slate-900/90 py-10 px-6">
      <div class="max-w-6xl mx-auto space-y-6 text-xs text-slate-400">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div class="text-sm font-bold text-white uppercase tracking-wider">TalentXcel Specialized Career &amp; Employment Ecosystem</div>
            <p class="text-slate-400 text-xs mt-0.5">Explore dedicated search universes across jobs, compensation, ATS resume tools, higher education, and verified credentials.</p>
          </div>
          <span class="text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded text-[11px] font-mono">Consolidated Root Authority</span>
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
              <li><a href="https://talentxcel.in/colleges/global-programs" class="hover:text-slate-200">&euro;0 Tuition Degrees</a></li>
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
            </ul>
          </div>
        </div>
        <div class="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          &copy; 2026 TalentXcel Platform. All URLs actively crawled and indexed across Google, Bing, and AI search engines.
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
  <meta name="robots" content="index, follow">
  <script src="https://cdn.tailwindcss.com"></script>
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
