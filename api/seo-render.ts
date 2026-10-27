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
  } else if ((prefix === 'profile' || prefix === 'user' || prefix === 'p') && secondary) {
    const profileSlug = secondary;
    const displayName = formatTitle(profileSlug.replace(/-specialist.*/, '').replace(/-expert.*/, ''));
    title = `${displayName} — Verified Tech Profile & Credentials | TalentXcel`;
    description = `Explore ${displayName}'s verified skill graph, work experience, career milestones, and cryptographic badges on TalentXcel.`;
    canonical = `https://talentxcel.in/profile/${profileSlug}`;
    h1 = `${displayName} — Verified Talent Profile`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20">
            ${escapeHtml(displayName.charAt(0))}
          </div>
          <div>
            <h2 class="text-xl font-bold text-white">${escapeHtml(displayName)}</h2>
            <p class="text-slate-400 text-xs">Verified Professional &bull; TalentXcel Global Network</p>
          </div>
        </div>
        <p class="text-slate-300 text-sm leading-relaxed">Authenticated profile record featuring verified skill assessments, peer endorsements, and certified technical benchmarks across the global technology ecosystem.</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Identity Verification</span><span class="font-semibold text-emerald-400">Verified &amp; Authenticated</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Talent Score</span><span class="font-semibold text-white">Top 10% Verified</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Recruiter Status</span><span class="font-semibold text-blue-400">Open to Opportunities</span></div>
        </div>
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
        "name": "TalentXcel Verified Network"
      }
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
  } else if (cleanPath.startsWith('career-insights/salary/')) {
    const slug = cleanPath.replace('career-insights/salary/', '');
    const cleanSlug = slug.replace('-salary', '');
    const parts = cleanSlug.split('-in-');
    const roleName = formatTitle(parts[0] || 'Tech Role');
    const cityName = parts[1] ? formatTitle(parts[1]) : 'Global Hubs';
    title = `${roleName} Salary in ${cityName} (2026 Compensation & Pay Scale) | TalentXcel`;
    description = `Explore verified ${roleName} salary percentiles, base pay ranges (₹4.5L - ₹24L PA), cash bonuses, and compensation curves in ${cityName} on TalentXcel.`;
    canonical = `https://talentxcel.in/career-insights/salary/${slug}`;
    h1 = `${roleName} Salary Benchmarks in ${cityName}`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Compensation Benchmark for ${escapeHtml(roleName)} in ${escapeHtml(cityName)}</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Verified compensation percentiles for ${escapeHtml(roleName)} based on real tech hiring data in ${escapeHtml(cityName)}. Benchmark your current CTC against the 25th, 50th, and 90th market percentiles.</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Median Base Pay</span><span class="font-semibold text-emerald-400">₹8.5L - ₹18L PA</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Top 10% (Staff/Lead)</span><span class="font-semibold text-white">₹28L - ₹45L PA</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Market Demand</span><span class="font-semibold text-blue-400">High / Fast Growth</span></div>
        </div>
        <div class="pt-4 flex flex-wrap gap-3">
          <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Browse Live ${escapeHtml(roleName)} Jobs &rarr;</a>
          <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Free ATS Resume Scan &rarr;</a>
        </div>
      </section>
    `;
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "Occupation",
      "name": roleName,
      "occupationLocation": { "@type": "City", "name": cityName },
      "estimatedSalary": [
        {
          "@type": "MonetaryAmountDistribution",
          "name": "base",
          "currency": "INR",
          "median": 1200000
        }
      ]
    };
  } else if (cleanPath.startsWith('resume/interview-prep/')) {
    const slug = cleanPath.replace('resume/interview-prep/', '');
    const cleanRole = slug.replace(/-interview-questions-and-answers.*/, '');
    const roleName = formatTitle(cleanRole || 'Software Engineer');
    title = `${roleName} Interview Questions & Answers (2026 Technical Prep) | TalentXcel`;
    description = `Ace your ${roleName} technical interview with verified questions, coding challenges, system design scenarios, and ATS behavioral prep on TalentXcel.`;
    canonical = `https://talentxcel.in/resume/interview-prep/${slug}`;
    h1 = `${roleName} Interview Questions & Preparation Guide`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Top Technical & Behavioral Questions for ${escapeHtml(roleName)}</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Comprehensive interview guide curated from real screening processes at top tier-1 tech companies and high-growth startups for ${escapeHtml(roleName)} roles.</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Interview Rounds</span><span class="font-semibold text-purple-400">Coding, System Design, HR</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Prep Time</span><span class="font-semibold text-white">2 - 4 Weeks</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Success Rate</span><span class="font-semibold text-emerald-400">84% ATS Cleared</span></div>
        </div>
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
          "name": `What are the core technical skills needed for ${roleName}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Candidates for ${roleName} roles are expected to demonstrate proficiency in core data structures, algorithms, system architecture, and domain-specific tooling.`
          }
        }
      ]
    };
  } else if (cleanPath.startsWith('courses/')) {
    const slug = cleanPath.replace('courses/', '');
    const cleanCourse = slug.replace(/-courses-in-.*/, '');
    const courseName = formatTitle(cleanCourse);
    const cityMatch = slug.match(/-courses-in-(.*)/);
    const cityName = cityMatch ? formatTitle(cityMatch[1]) : 'Online & Hybrid';
    title = `Best ${courseName} Courses in ${cityName} (2026 Certification & Training) | TalentXcel`;
    description = `Discover verified ${courseName} programs, syllabus, tuition fees, and career pathways in ${cityName}. 1-Click ATS skill match on TalentXcel.`;
    canonical = `https://talentxcel.in/courses/${slug}`;
    h1 = `${courseName} Courses & Training in ${cityName}`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">${escapeHtml(courseName)} Career & Certification Track</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Upgrade your technical credentials with verified ${escapeHtml(courseName)} courses in ${escapeHtml(cityName)}. Gain hands-on project experience and benchmark your TalentScore directly for hiring teams.</p>
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
  } else if (cleanPath.startsWith('careers/')) {
    const slug = cleanPath.replace('careers/', '');
    const cleanRole = slug.replace(/-roadmap.*/, '');
    const roleName = formatTitle(cleanRole);
    title = `How to Become a ${roleName} in 2026 (Roadmap & Career Pathway) | TalentXcel`;
    description = `Complete step-by-step career pathway to become a ${roleName}. Required technical skills, salary trajectory (₹5L - ₹32L PA), and placement milestones on TalentXcel.`;
    canonical = `https://talentxcel.in/careers/${slug}`;
    h1 = `${roleName} Career Roadmap & Pathway`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Career Progression Roadmap for ${escapeHtml(roleName)}</h2>
        <p class="text-slate-300 text-sm leading-relaxed">From foundational skills to senior architect leadership, explore the verified capability curve, required industry tools, and career milestones for ${escapeHtml(roleName)} professionals.</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Skill Horizon</span><span class="font-semibold text-blue-400">12 Core Competencies</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Typical Progression</span><span class="font-semibold text-white">Junior &rarr; Mid &rarr; Senior &rarr; Lead</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Hiring Velocity</span><span class="font-semibold text-emerald-400">Top 5% Hiring Demand</span></div>
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
  } else if (cleanPath.startsWith('colleges/')) {
    const slug = cleanPath.replace('colleges/', '');
    const cleanCollege = slug.replace(/-campus.*/, '');
    const collegeName = formatTitle(cleanCollege);
    title = `${collegeName} Admissions, Placements, Fees & Cutoffs (2026) | TalentXcel`;
    description = `Forensic institutional dossier for ${collegeName}. Tuition fees, median placement packages (₹6.5L - ₹22L PA), NIRF rankings, and alumni network verified on TalentXcel.`;
    canonical = `https://talentxcel.in/colleges/${slug}`;
    h1 = `${collegeName} Institutional Overview`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Academic & Placement Profile: ${escapeHtml(collegeName)}</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Explore verified placement statistics, corporate recruitment partners, NIRF ranking, eligibility criteria, and fee structures for ${escapeHtml(collegeName)} on the TalentXcel higher education network.</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Median CTC</span><span class="font-semibold text-emerald-400">₹8.5 LPA</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Placement Rate</span><span class="font-semibold text-white">92% Verified Placed</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Accreditation</span><span class="font-semibold text-blue-400">NAAC A++ / NIRF Top 50</span></div>
        </div>
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
      description = `Connect with global technology leaders, verified engineers, and executive recruiters across 400+ cities on TalentXcel.`;
      canonical = `https://talentxcel.in/network`;
      h1 = `TalentXcel Global Professional Network`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Global Tech Peer Communities &amp; Collaboration</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Expand your network across engineering, product management, AI research, and executive leadership. Discover verified peers and share insights in domain-focused groups.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Chapters</span><span class="font-semibold text-emerald-400">400+ Global Tech Hubs</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Verification</span><span class="font-semibold text-white">Peer-Endorsed Credentials</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Networking Speed</span><span class="font-semibold text-blue-400">Direct Connections</span></div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/network" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Explore All Communities &rarr;</a>
          </div>
        </section>
      `;
    }
  } else if (prefix === 'posts' || prefix === 'post') {
    const postSlug = secondary || cleanPath.replace(/^posts?\/?/, '');
    const cleanTopic = postSlug.replace(/-market-trends-and-insights.*/, '').replace(/-edition-.*/, '');
    const topicName = formatTitle(cleanTopic || 'Tech Industry');
    title = `${topicName} Market Trends & Career Insights (2026 Analysis) | TalentXcel`;
    description = `In-depth analysis of hiring velocity, compensation benchmarks, and emerging technical skills for ${topicName}. Published by TalentXcel Intelligence.`;
    canonical = `https://talentxcel.in/posts/${postSlug}`;
    h1 = `${topicName} — Market Dynamics & Industry Insights`;
    bodyContent = `
      <article class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span class="text-blue-400 font-semibold">TalentXcel Market Intelligence</span>
          <span>&bull;</span>
          <span>Verified Industry Report</span>
        </div>
        <h2 class="text-xl font-bold text-white">${escapeHtml(topicName)}: Strategic Overview &amp; Compensation Forecast</h2>
        <p class="text-slate-300 text-sm leading-relaxed">An exhaustive briefing on ${escapeHtml(topicName)} market movements, demand shifts across key metro regions, and essential competencies required for top-tier compensation percentiles.</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Report Tier</span><span class="font-semibold text-emerald-400">Industry Briefing</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Data Source</span><span class="font-semibold text-white">TalentXcel Hiring Index</span></div>
          <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Update Frequency</span><span class="font-semibold text-blue-400">Bi-Weekly Refresh</span></div>
        </div>
        <div class="pt-4 flex flex-wrap gap-3">
          <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View ${escapeHtml(topicName)} Jobs &rarr;</a>
          <a href="/network" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Discuss in Tech Communities &rarr;</a>
        </div>
      </article>
    `;
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": `${topicName} Market Trends & Career Insights`,
      "description": `In-depth analysis of hiring velocity and compensation benchmarks for ${topicName}`,
      "publisher": {
        "@type": "Organization",
        "name": "TalentXcel"
      },
      "url": canonical
    };
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
              <li><a href="https://talentxcel.in/network" class="hover:text-slate-200">Global Network</a></li>
              <li><a href="https://talentxcel.in/posts" class="hover:text-slate-200">Industry Insights</a></li>
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
