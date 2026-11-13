const fs = require('fs');

let content = fs.readFileSync('api/seo-render.ts', 'utf8');

// 1. Remove &is_active=eq.true from lookupJobInSupabase so it can inspect closed jobs
const targetLookup = "const url = `${SUPABASE_REST_URL}/jobs?select=id,title,company_name,location,description,is_active,seo_slug,posted_at,date_posted,expires_at,employment_type,salary_min,salary_max,salary_currency&${filter}&is_active=eq.true&limit=1`;";
const replacementLookup = "const url = `${SUPABASE_REST_URL}/jobs?select=id,title,company_name,location,description,is_active,seo_slug,posted_at,date_posted,expires_at,employment_type,salary_min,salary_max,salary_currency&${filter}&limit=1`;";
content = content.replace(targetLookup, replacementLookup);

// 2. Update job handler in seo-render
const targetJobHandler = `    // 5F: Single job posting lookup
    else {
      const job = await lookupJobInSupabase(secondary);
      if (!job) {
        return null; // Genuine 404 for non-existent job posting (Soft-404 eliminated!)
      }
      const jobTitle = job.title || formatTitle(secondary);
      const company = job.company_name || 'TalentXcel Services';
      const loc = job.location || 'India';
      title = \`\${jobTitle} at \${company} in \${loc} | TalentXcel Jobs\`;
      description = \`Apply for \${jobTitle} at \${company} in \${loc}. Verified job opening on TalentXcel.\`;
      canonical = \`https://talentxcel.in/jobs/\${job.seo_slug || job.id}\`;
      h1 = \`\${jobTitle} — \${company}\`;
      bodyContent = \`
        <article class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span class="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded">Verified Vacancy</span>
              <h2 class="text-xl font-bold text-white mt-2">\${escapeHtml(jobTitle)}</h2>
              <p class="text-slate-400 text-sm">\${escapeHtml(company)} &middot; \${escapeHtml(loc)}</p>
            </div>
          </div>
          <div class="text-slate-300 text-sm leading-relaxed space-y-4">
            <p>\${escapeHtml((job.description || '').substring(0, 500))}...</p>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View Details &amp; Apply &rarr;</a>
          </div>
        </article>
      \`;
      // SEO-006: Emit valid JobPosting schema omitting validThrough if not in data
      jsonLdSchema = {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": jobTitle,
        "description": job.description || \`\${jobTitle} at \${company}\`,
        "identifier": {
          "@type": "PropertyValue",
          "name": "TalentXcel",
          "value": job.id
        },
        "datePosted": (job.posted_at || job.date_posted || new Date().toISOString()).split('T')[0],
        ...(job.expires_at && !isNaN(new Date(job.expires_at).getTime()) && new Date(job.expires_at) > new Date()
          ? { "validThrough": new Date(job.expires_at).toISOString() }
          : {}),
        "employmentType": job.employment_type?.toUpperCase().replace('-', '_') || 'FULL_TIME',
        "hiringOrganization": {
          "@type": "Organization",
          "name": company,
          "sameAs": "https://talentxcel.in"
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": loc,
            "addressCountry": "IN"
          }
        }
      };
    }`;

const replacementJobHandler = `    // 5F: Single job posting lookup (Consistent expired behavior & zero date fabrication)
    else {
      const job = await lookupJobInSupabase(secondary);
      if (!job) {
        return null; // Genuine 404 for non-existent job posting (Soft-404 eliminated!)
      }
      const jobTitle = job.title || formatTitle(secondary);
      const company = job.company_name || 'TalentXcel Services';
      const loc = job.location || 'India';
      title = \`\${jobTitle} at \${company} in \${loc} | TalentXcel Jobs\`;
      description = \`Apply for \${jobTitle} at \${company} in \${loc}. Verified job opening on TalentXcel.\`;
      canonical = \`https://talentxcel.in/jobs/\${job.seo_slug || job.id}\`;
      h1 = \`\${jobTitle} — \${company}\`;

      const isClosed = !job.is_active || (job.expires_at && !isNaN(new Date(job.expires_at).getTime()) && new Date(job.expires_at).getTime() < Date.now());
      if (isClosed) {
        robotsDirective = 'noindex, follow';
        bodyContent = \`
          <article class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div class="p-4 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-300">
              <h2 class="text-base font-bold">This vacancy at \${escapeHtml(company)} has closed</h2>
              <p class="text-xs text-amber-200/80 mt-1">This job is no longer accepting applications. Browse current verified vacancies below.</p>
            </div>
            <div class="pt-4 flex flex-wrap gap-3">
              <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Browse All Live Jobs &rarr;</a>
            </div>
          </article>
        \`;
        jsonLdSchema = null;
      } else {
        robotsDirective = 'index, follow';
        bodyContent = \`
          <article class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span class="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded">Verified Vacancy</span>
                <h2 class="text-xl font-bold text-white mt-2">\${escapeHtml(jobTitle)}</h2>
                <p class="text-slate-400 text-sm">\${escapeHtml(company)} &middot; \${escapeHtml(loc)}</p>
              </div>
            </div>
            <div class="text-slate-300 text-sm leading-relaxed space-y-4">
              <p>\${escapeHtml((job.description || '').substring(0, 500))}...</p>
            </div>
            <div class="pt-4 flex flex-wrap gap-3">
              <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View Details &amp; Apply &rarr;</a>
            </div>
          </article>
        \`;

        // SEO-006 & Adjustment 5: Emit valid JobPosting schema, omitting datePosted if not in data
        const postedDate = job.posted_at || job.date_posted;
        jsonLdSchema = {
          "@context": "https://schema.org/",
          "@type": "JobPosting",
          "title": jobTitle,
          "description": job.description || \`\${jobTitle} at \${company}\`,
          "identifier": {
            "@type": "PropertyValue",
            "name": "TalentXcel",
            "value": job.id
          },
          ...(postedDate ? { "datePosted": new Date(postedDate).toISOString().split('T')[0] } : {}),
          ...(job.expires_at && !isNaN(new Date(job.expires_at).getTime()) && new Date(job.expires_at) > new Date()
            ? { "validThrough": new Date(job.expires_at).toISOString() }
            : {}),
          "employmentType": job.employment_type?.toUpperCase().replace('-', '_') || 'FULL_TIME',
          "hiringOrganization": {
            "@type": "Organization",
            "name": company,
            "sameAs": "https://talentxcel.in"
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": loc,
              "addressCountry": "IN"
            }
          }
        };
      }
    }`;

content = content.replace(targetJobHandler, replacementJobHandler);

fs.writeFileSync('api/seo-render.ts', content, 'utf8');
console.log('Successfully updated api/seo-render.ts with consistent expired jobs handling and authentic datePosted');
