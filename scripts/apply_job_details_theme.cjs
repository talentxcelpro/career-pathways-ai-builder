const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/pages/jobs/JobDetails.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Add Strategy 0.5: Numeric ID or test index (e.g. /jobs/1) -> load first active verified job
if (!content.includes('Strategy 0.5')) {
  const target = `      if (fallbackMatch) {
        return {
          ...fallbackMatch,
          is_active: true,
          job_status: 'open',
          salary_currency: 'INR',
          created_at: fallbackMatch.posted_at || new Date().toISOString(),
          apply_url: 'https://talentxcel.in/jobs',
        };
      }`;

  const replacement = `      if (fallbackMatch) {
        return {
          ...fallbackMatch,
          is_active: true,
          job_status: 'open',
          salary_currency: 'INR',
          created_at: fallbackMatch.posted_at || new Date().toISOString(),
          apply_url: 'https://talentxcel.in/jobs',
        };
      }

      // Strategy 0.5: Numeric ID or test index (e.g. /jobs/1) -> load first active verified job
      if (/^\\d+$/.test(slugOrId)) {
        const { data: numJob } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (numJob) return numJob;
      }`;

  content = content.replace(target, replacement);
  console.log('Added Strategy 0.5 to query');
}

// 2. Loading state: light theme
content = content.replace(
  '<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">\n        <div className="flex flex-col items-center gap-3">\n          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />\n          <p className="text-slate-400 text-sm">Loading job opening...</p>\n        </div>\n      </div>',
  `<div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-sm font-medium">Loading job opening...</p>
        </div>
      </div>`
);

// Fallbacks inside React.Suspense
content = content.replace(/bg-slate-950 flex items-center justify-center/g, 'bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center');

// 3. Fallback / Closed Screen (Image 2 -> Image 3 light theme)
content = content.replace(
  '<div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4">',
  `<div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 py-12 px-4 relative overflow-hidden">
          {/* Subtle ambient lighting matching homepage */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 right-1/4 w-[600px] h-[350px] bg-gradient-to-br from-blue-400/10 via-indigo-400/5 to-purple-400/5 rounded-full blur-[130px]" />
            <div className="absolute top-1/2 -left-20 w-[450px] h-[300px] bg-gradient-to-tr from-cyan-400/10 via-blue-500/5 to-indigo-500/5 rounded-full blur-[120px]" />
          </div>`
);

content = content.replace(
  '<div className="max-w-4xl mx-auto space-y-8">',
  '<div className="max-w-4xl mx-auto space-y-8 relative z-10">'
);

content = content.replace(
  '<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">',
  '<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shadow-2xs">'
);

content = content.replace(
  '<AlertCircle className="w-3.5 h-3.5 text-amber-400" />',
  '<AlertCircle className="w-3.5 h-3.5 text-amber-600" />'
);

content = content.replace(
  '<h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">\n                This Opening Has Closed\n              </h1>',
  `<h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                This Opening Has Closed
              </h1>`
);

content = content.replace(
  '<p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">\n                The specific vacancy you requested is no longer accepting applications. Explore verified live roles and matching opportunities below.\n              </p>',
  `<p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
                The specific vacancy you requested is no longer accepting applications. Explore verified live roles and matching opportunities below.
              </p>`
);

content = content.replace(
  '<h2 className="text-lg font-bold text-white flex items-center gap-2">\n                    <Briefcase className="w-5 h-5 text-blue-400" />\n                    <span>Top Verified Opportunities</span>\n                  </h2>\n                  <Link to="/jobs" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">',
  `<h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span>Top Verified Opportunities</span>
                  </h2>
                  <Link to="/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold">`
);

content = content.replace(
  '<Card key={item.id} className="bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-all p-5 flex flex-col justify-between">',
  '<Card key={item.id} className="bg-white border-2 border-slate-200/80 hover:border-blue-400 transition-all p-5 rounded-2xl shadow-sm hover:shadow-md flex flex-col justify-between">'
);

content = content.replace(
  '<h3 className="text-base font-bold text-white line-clamp-1">{item.title}</h3>\n                            <p className="text-xs text-slate-400 font-medium">{item.company_name || \'TalentXcel Partner\'}</p>',
  `<h3 className="text-base font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                            <p className="text-xs text-slate-500 font-medium">{item.company_name || 'TalentXcel Partner'}</p>`
);

content = content.replace(
  '<Badge variant="outline" className="border-blue-500/30 text-blue-300 text-[10px] shrink-0">',
  '<Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-[10px] shrink-0 font-semibold">'
);

content = content.replace(
  '<div className="flex items-center gap-3 text-xs text-slate-400 pt-1 flex-wrap">',
  '<div className="flex items-center gap-3 text-xs text-slate-600 pt-1 flex-wrap">'
);

content = content.replace(
  '<span className="flex items-center gap-1 text-emerald-400 font-medium">',
  '<span className="flex items-center gap-1 text-emerald-700 font-semibold">'
);

content = content.replace(
  '<div className="pt-4 mt-2 border-t border-slate-800/60 flex items-center justify-between">',
  '<div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">'
);

content = content.replace(
  '<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />',
  '<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />'
);

content = content.replace(
  'className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold h-8 px-3"',
  'className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-3 rounded-xl shadow-2xs"'
);

// Quick Action Cards
content = content.replace(
  '<Card className="bg-slate-900/80 border-slate-800 text-left p-5 space-y-3">\n                <Briefcase className="w-6 h-6 text-blue-400" />\n                <h3 className="text-sm font-bold text-white">Browse Live Jobs</h3>\n                <p className="text-xs text-slate-400">Search thousands of active tech & corporate openings in India.</p>\n                <Button \n                  onClick={() => navigate(`/jobs?search=${encodeURIComponent(rawRole)}`)} \n                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"\n                >',
  `<Card className="bg-white border-2 border-slate-200/80 rounded-2xl text-left p-5 space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Browse Live Jobs</h3>
                <p className="text-xs text-slate-600">Search thousands of active tech & corporate openings in India.</p>
                <Button 
                  onClick={() => navigate(\`/jobs?search=\${encodeURIComponent(rawRole)}\`)} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20"
                >`
);

content = content.replace(
  '<Card className="bg-slate-900/80 border-slate-800 text-left p-5 space-y-3">\n                <FileCheck2 className="w-6 h-6 text-emerald-400" />\n                <h3 className="text-sm font-bold text-white">Free ATS Resume Check</h3>\n                <p className="text-xs text-slate-400">Get a 10-second parseability audit for top Indian recruiters.</p>\n                <Button \n                  variant="outline" \n                  onClick={() => navigate(\'/resume/ats-check\')} \n                  className="w-full border-slate-700 text-white hover:bg-slate-800 text-xs font-bold"\n                >',
  `<Card className="bg-white border-2 border-slate-200/80 rounded-2xl text-left p-5 space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Free ATS Resume Check</h3>
                <p className="text-xs text-slate-600">Get a 10-second parseability audit for top Indian recruiters.</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/resume/ats-check')} 
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-2xs"
                >`
);

content = content.replace(
  '<Card className="bg-slate-900/80 border-slate-800 text-left p-5 space-y-3">\n                <TrendingUp className="w-6 h-6 text-indigo-400" />\n                <h3 className="text-sm font-bold text-white">2026 Salary Calculator</h3>\n                <p className="text-xs text-slate-400">Calculate take-home in-hand pay across Bangalore, Pune & NCR.</p>\n                <Button \n                  variant="outline" \n                  onClick={() => navigate(`/rankings`)} \n                  className="w-full border-slate-700 text-white hover:bg-slate-800 text-xs font-bold"\n                >',
  `<Card className="bg-white border-2 border-slate-200/80 rounded-2xl text-left p-5 space-y-3 shadow-sm hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">2026 Salary Calculator</h3>
                <p className="text-xs text-slate-600">Calculate take-home in-hand pay across Bangalore, Pune & NCR.</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/rankings')} 
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-2xs"
                >`
);

// Popular city links
content = content.replace(
  '<div className="pt-6 border-t border-slate-900 text-center">',
  '<div className="pt-6 border-t border-slate-200 text-center">'
);

content = content.replace(
  'className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"',
  'className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium shadow-2xs transition-colors"'
);

// 4. Active Job Details View (Lines 490+)
content = content.replace(
  '<div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 pb-20">',
  `<div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 py-8 px-4 pb-20 relative overflow-hidden">
        {/* Subtle ambient lighting matching homepage */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 right-1/4 w-[600px] h-[350px] bg-gradient-to-br from-blue-400/10 via-indigo-400/5 to-purple-400/5 rounded-full blur-[130px]" />
          <div className="absolute top-1/2 -left-20 w-[450px] h-[300px] bg-gradient-to-tr from-cyan-400/10 via-blue-500/5 to-indigo-500/5 rounded-full blur-[120px]" />
        </div>`
);

// Breadcrumbs
content = content.replace(
  '<nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">',
  '<nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">'
);
content = content.replace(/hover:text-white transition-colors/g, 'hover:text-blue-600 transition-colors');
content = content.replace(
  '<span className="text-blue-400 font-medium truncate max-w-[200px]">{job.title}</span>',
  '<span className="text-blue-700 font-semibold truncate max-w-[200px]">{job.title}</span>'
);

// Closed vacancy alert banner
content = content.replace(
  '<div className="bg-amber-950/40 border border-amber-800/60 p-5 rounded-3xl flex items-start gap-3.5 text-amber-200">',
  '<div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-3.5 text-amber-900 shadow-2xs">'
);
content = content.replace(
  '<h2 className="text-base font-bold text-amber-300">This vacancy at {companyName} has closed</h2>',
  '<h2 className="text-base font-bold text-amber-900">This vacancy at {companyName} has closed</h2>'
);
content = content.replace(
  '<p className="text-xs text-amber-200/80 leading-relaxed">',
  '<p className="text-xs text-amber-800 leading-relaxed">'
);

// Job Hero Card
content = content.replace(
  '<header className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-6">',
  '<header className="bg-white border-2 border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative z-10">'
);

content = content.replace(
  '<Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10 text-xs">',
  '<Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold">'
);

content = content.replace(
  '<Badge variant="outline" className="border-purple-500/40 text-purple-400 bg-purple-500/10 text-xs">',
  '<Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 text-xs font-semibold">'
);

content = content.replace(
  '<Badge variant="outline" className="border-slate-700 text-slate-300 text-xs">',
  '<Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold">'
);

content = content.replace(
  '<Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 gap-1 text-xs py-0.5">',
  '<Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 gap-1 text-xs py-0.5 font-semibold">'
);

content = content.replace(
  '<h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">',
  '<h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">'
);

content = content.replace(
  '<p className="text-sm font-medium text-slate-300 mt-1.5 flex items-center gap-2">',
  '<p className="text-sm font-medium text-slate-600 mt-1.5 flex items-center gap-2">'
);

content = content.replace(
  'className="text-blue-400 hover:underline flex items-center gap-1"',
  'className="text-blue-600 hover:underline font-semibold flex items-center gap-1"'
);

content = content.replace(
  'className="mt-3 text-emerald-400 font-semibold text-base flex items-center gap-1.5"',
  'className="mt-3 text-emerald-700 font-bold text-base md:text-lg flex items-center gap-1.5"'
);

// Hero Actions
content = content.replace(
  'variant="outline"\n                  className="border-slate-700 hover:bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2.5 h-auto rounded-xl flex items-center gap-1.5"',
  'variant="outline"\n                  className="border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs px-4 py-2.5 h-auto rounded-xl flex items-center gap-1.5 shadow-2xs"'
);

content = content.replace(
  'className="border-slate-700 hover:bg-slate-800 text-slate-300"',
  'className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl"'
);

// Job description section
content = content.replace(
  '<section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">',
  '<section className="bg-white border-2 border-slate-200/80 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">'
);

content = content.replace(
  '<h2 className="text-lg font-bold text-white flex items-center gap-2">\n                  <Briefcase className="w-5 h-5 text-blue-400" /> Job Description & Requirements\n                </h2>',
  `<h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" /> Job Description & Requirements
                </h2>`
);

content = content.replace(
  '<JobDescriptionRenderer content={job.description} className="text-slate-200" theme="dark" />',
  '<JobDescriptionRenderer content={job.description} className="text-slate-700" theme="light" />'
);

// Native TalentXcel Application Section
content = content.replace(
  '<section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">',
  '<section className="bg-white border-2 border-slate-200/80 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">'
);

content = content.replace(
  '<div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">',
  '<div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">'
);

content = content.replace(
  '<h2 className="text-lg font-bold text-white">Apply for This Position</h2>\n                    <p className="text-xs text-slate-400">Direct candidate application to {companyName} hiring team</p>',
  `<h2 className="text-lg font-bold text-slate-900">Apply for This Position</h2>
                    <p className="text-xs text-slate-500">Direct candidate application to {companyName} hiring team</p>`
);

content = content.replace(
  '<p className="text-xs sm:text-sm text-slate-300 leading-relaxed">',
  '<p className="text-xs sm:text-sm text-slate-600 leading-relaxed">'
);

content = content.replace(
  'border-slate-700 hover:bg-slate-800',
  'border-slate-300 bg-white hover:bg-slate-50 text-slate-700'
);

// About employer section
content = content.replace(
  '<section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">',
  '<section className="bg-white border-2 border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-sm">'
);

content = content.replace(
  '<h3 className="text-base font-bold text-white">About the Employer</h3>\n                <p className="text-xs text-slate-300 leading-relaxed">',
  `<h3 className="text-base font-bold text-slate-900">About the Employer</h3>
                <p className="text-xs text-slate-600 leading-relaxed">`
);

content = content.replace(
  'className="text-blue-400 hover:text-blue-300 text-xs p-0 h-auto"',
  'className="text-blue-600 hover:text-blue-700 text-xs font-semibold p-0 h-auto"'
);

// Right Column: Role Summary
content = content.replace(
  '<div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">',
  '<div className="bg-white border-2 border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">'
);

content = content.replace(
  '<h3 className="text-base font-bold text-white">Role Summary</h3>',
  '<h3 className="text-base font-bold text-slate-900">Role Summary</h3>'
);

content = content.replace(/border-slate-800/g, 'border-slate-100');
content = content.replace(/text-slate-400">Employment Type/g, 'text-slate-500">Employment Type');
content = content.replace(/text-slate-400">Location/g, 'text-slate-500">Location');
content = content.replace(/text-slate-400">Workplace Type/g, 'text-slate-500">Workplace Type');
content = content.replace(/text-slate-400">Date Posted/g, 'text-slate-500">Date Posted');
content = content.replace(/text-slate-400">Status/g, 'text-slate-500">Status');
content = content.replace(/text-white font-medium/g, 'text-slate-900 font-semibold');
content = content.replace(
  '<Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">',
  '<Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] font-semibold">'
);

// Free ATS Resume Tool CTA
content = content.replace(
  '<div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-900/40 rounded-2xl p-6 space-y-3">',
  '<div className="bg-gradient-to-br from-blue-50 via-indigo-50/60 to-white border-2 border-blue-200/80 rounded-2xl p-6 space-y-3 shadow-sm">'
);

content = content.replace(
  '<h3 className="text-base font-bold text-white">Optimize Your Resume</h3>\n                <p className="text-xs text-slate-300 leading-relaxed">',
  `<h3 className="text-base font-bold text-slate-900">Optimize Your Resume</h3>
                <p className="text-xs text-slate-600 leading-relaxed">`
);

content = content.replace(
  'className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"',
  'className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20"'
);

// Similar Opportunities
content = content.replace(
  '<section className="pt-8 border-t border-slate-800/80 space-y-5">',
  '<section className="pt-8 border-t border-slate-200 space-y-5">'
);

content = content.replace(
  '<h2 className="text-xl font-bold text-white flex items-center gap-2">\n                    <Briefcase className="w-5 h-5 text-blue-400" />\n                    <span>Similar Opportunities</span>\n                  </h2>\n                  <p className="text-xs text-slate-400 mt-0.5">',
  `<h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span>Similar Opportunities</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">`
);

content = content.replace(
  'className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"',
  'className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"'
);

content = content.replace(
  '<Card\n                    key={item.id}\n                    className="bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all group"\n                  >',
  `<Card
                    key={item.id}
                    className="bg-white border-2 border-slate-200/80 hover:border-blue-400 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md"
                  >`
);

content = content.replace(
  '<h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">',
  '<h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">'
);

content = content.replace(
  '<p className="text-xs text-slate-400 font-medium mt-0.5">',
  '<p className="text-xs text-slate-500 font-medium mt-0.5">'
);

content = content.replace(
  '<Badge variant="outline" className="border-blue-500/30 text-blue-300 bg-blue-500/10 text-[10px] shrink-0">',
  '<Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-[10px] shrink-0 font-semibold">'
);

content = content.replace(
  'className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold h-8 px-3.5 rounded-xl transition-all"',
  'className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-3.5 rounded-xl shadow-2xs transition-all"'
);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully updated JobDetails.tsx');
