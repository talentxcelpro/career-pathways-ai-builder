const fs = require('fs');

let content = fs.readFileSync('src/pages/jobs/JobDetails.tsx', 'utf8');

// 1. Add isExpired calculation before return
const targetCalc = `  const companyName = job.company_name || 'TalentXcel Services';
  const companySlug = 'talentxcel';

  return (
    <>
      <ReactJobStructuredData job={job} />
      <SocialMetaHead
        title={\`\${job.title} at \${companyName} (\${job.location || 'India'}) | TalentXcel\`}
        description={job.description ? job.description.slice(0, 160) : \`Apply for \${job.title} at \${companyName}. Verified compensation and fast direct application on TalentXcel.\`}
        category="jobs"
        ogType="article"
        canonicalUrl={getPublicJobUrl(job.seo_slug || slugOrId)}
      />`;

const replacementCalc = `  const companyName = job.company_name || 'TalentXcel Services';
  const companySlug = 'talentxcel';

  const isExpired = Boolean(
    job.is_active === false ||
    job.job_status === 'closed' ||
    job.job_status === 'expired' ||
    (job.expires_at && new Date(job.expires_at).getTime() < Date.now()) ||
    (job.application_deadline && new Date(job.application_deadline).getTime() < Date.now())
  );

  return (
    <>
      {!isExpired && <ReactJobStructuredData job={job} />}
      <SocialMetaHead
        title={\`\${job.title} at \${companyName} (\${job.location || 'India'}) | TalentXcel\`}
        description={job.description ? job.description.slice(0, 160) : \`Apply for \${job.title} at \${companyName}. Verified compensation and fast direct application on TalentXcel.\`}
        category="jobs"
        ogType="article"
        canonicalUrl={getPublicJobUrl(job.seo_slug || slugOrId)}
        noindex={isExpired}
        robotsDirective={isExpired ? 'noindex, follow' : 'index, follow'}
      />`;

content = content.replace(targetCalc, replacementCalc);

// 2. Add alert banner before <header>
const targetHeader = `          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/jobs" className="hover:text-white transition-colors">Jobs</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={\`/company/\${companySlug}\`} className="hover:text-white transition-colors">{companyName}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-400 font-medium truncate max-w-[200px]">{job.title}</span>
          </nav>

          {/* Job Hero Card */}`;

const replacementHeader = `          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/jobs" className="hover:text-white transition-colors">Jobs</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={\`/company/\${companySlug}\`} className="hover:text-white transition-colors">{companyName}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-400 font-medium truncate max-w-[200px]">{job.title}</span>
          </nav>

          {/* Closed Vacancy Alert Banner (Adjustment 4) */}
          {isExpired && (
            <div className="bg-amber-950/40 border border-amber-800/60 p-5 rounded-3xl flex items-start gap-3.5 text-amber-200">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h2 className="text-base font-bold text-amber-300">This vacancy at {companyName} has closed</h2>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  This opportunity is no longer accepting new applications. You can review similar active openings below.
                </p>
                <div className="pt-2">
                  <Link to="/jobs" className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors">
                    <span>Browse All Active Jobs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Job Hero Card */}`;

content = content.replace(targetHeader, replacementHeader);

fs.writeFileSync('src/pages/jobs/JobDetails.tsx', content, 'utf8');
console.log('Successfully updated JobDetails.tsx with consistent expired jobs handling');
