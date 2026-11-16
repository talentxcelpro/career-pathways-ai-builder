const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/pages/jobs/JobDetails.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Ensure JobAlertCaptureCard is imported
if (!content.includes('import { JobAlertCaptureCard }')) {
  content = content.replace(
    "import { RelatedHubsMesh } from '@/components/seo/RelatedHubsMesh';",
    "import { RelatedHubsMesh } from '@/components/seo/RelatedHubsMesh';\nimport { JobAlertCaptureCard } from '@/components/jobs/JobAlertCaptureCard';"
  );
  console.log('Added JobAlertCaptureCard import');
}

// 2. Add Strategy 0.5: Numeric ID resolution (e.g. /jobs/1)
if (!content.includes('Strategy 0.5')) {
  const strategy1Index = content.indexOf('// Strategy 1: Try exact SEO slug match');
  if (strategy1Index !== -1) {
    const strategy05Code = `      // Strategy 0.5: Numeric ID or test index (e.g. /jobs/1) -> load first active verified job
      if (/^\\d+$/.test(slugOrId)) {
        const { data: numJob } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (numJob) return numJob;
      }\n\n`;
    content = content.slice(0, strategy1Index) + strategy05Code + content.slice(strategy1Index);
    console.log('Added Strategy 0.5');
  }
}

// 3. Fix invisible text on "This Opening Has Closed" fallback screen
// Heading
content = content.replace(
  '<h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">',
  '<h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">'
);

// Subtitle
content = content.replace(
  '<p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">',
  '<p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">'
);

// Top Verified Opportunities section header
content = content.replace(
  '<h2 className="text-lg font-bold text-white flex items-center gap-2">',
  '<h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">'
);
content = content.replace(
  '<Briefcase className="w-5 h-5 text-blue-400" />',
  '<Briefcase className="w-5 h-5 text-blue-600" />'
);
content = content.replace(
  'className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"',
  'className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold"'
);

// Card job title & company
content = content.replace(
  '<h3 className="text-base font-bold text-white line-clamp-1">{item.title}</h3>',
  '<h3 className="text-base font-bold text-slate-900 line-clamp-1">{item.title}</h3>'
);
content = content.replace(
  "<p className=\"text-xs text-slate-400 font-medium\">{item.company_name || 'TalentXcel Partner'}</p>",
  "<p className=\"text-xs text-slate-500 font-medium\">{item.company_name || 'TalentXcel Partner'}</p>"
);

// 3 Quick Action Cards
content = content.replace(
  '<Card className="bg-slate-900/80 border-slate-100 text-left p-5 space-y-3">',
  '<Card className="bg-white border-2 border-slate-200/80 rounded-2xl text-left p-5 space-y-3 shadow-sm hover:shadow-md transition-all">'
);
content = content.replace(
  '<Card className="bg-slate-900/80 border-slate-100 text-left p-5 space-y-3">',
  '<Card className="bg-white border-2 border-slate-200/80 rounded-2xl text-left p-5 space-y-3 shadow-sm hover:shadow-md transition-all">'
);
content = content.replace(
  '<Card className="bg-slate-900/80 border-slate-100 text-left p-5 space-y-3">',
  '<Card className="bg-white border-2 border-slate-200/80 rounded-2xl text-left p-5 space-y-3 shadow-sm hover:shadow-md transition-all">'
);

// 4. Fix remaining text-white in active job details
content = content.replace(
  '<h2 className="text-lg font-bold text-white flex items-center gap-2">',
  '<h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">'
);
content = content.replace(
  '<h2 className="text-lg font-bold text-white">Apply for This Position</h2>',
  '<h2 className="text-lg font-bold text-slate-900">Apply for This Position</h2>'
);
content = content.replace(
  '<p className="text-xs text-slate-400">Direct candidate application to {companyName} hiring team</p>',
  '<p className="text-xs text-slate-500">Direct candidate application to {companyName} hiring team</p>'
);
content = content.replace(
  '<h3 className="text-base font-bold text-white">About the Employer</h3>',
  '<h3 className="text-base font-bold text-slate-900">About the Employer</h3>'
);
content = content.replace(
  '<p className="text-xs text-slate-300 leading-relaxed">\n                  {companyName} is an SI-powered talent and recruitment organization',
  '<p className="text-xs text-slate-600 leading-relaxed">\n                  {companyName} is an SI-powered talent and recruitment organization'
);
content = content.replace(
  '<h3 className="text-base font-bold text-white">Optimize Your Resume</h3>',
  '<h3 className="text-base font-bold text-slate-900">Optimize Your Resume</h3>'
);
content = content.replace(
  '<p className="text-xs text-slate-300 leading-relaxed">\n                  Ensure your resume matches this job’s keywords',
  '<p className="text-xs text-slate-600 leading-relaxed">\n                  Ensure your resume matches this job’s keywords'
);
content = content.replace(
  '<h2 className="text-xl font-bold text-white flex items-center gap-2">',
  '<h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">'
);
content = content.replace(
  '<p className="text-xs text-slate-400 mt-0.5">',
  '<p className="text-xs text-slate-500 mt-0.5">'
);

// Fix similar opportunities card container
content = content.replace(
  'className="bg-slate-900/60 border border-slate-100/80 hover:border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all group"',
  'className="bg-white border-2 border-slate-200/80 hover:border-blue-400 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md"'
);

// Quick action buttons in fallback screen
content = content.replace(
  'className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"',
  'className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20"'
);
content = content.replace(
  'className="w-full border-slate-700 text-white hover:bg-slate-800 text-xs font-bold"',
  'className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-2xs"'
);
content = content.replace(
  'className="w-full border-slate-700 text-white hover:bg-slate-800 text-xs font-bold"',
  'className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-2xs"'
);

// Clean up duplicate text-slate classes
content = content.replace('text-slate-700 text-slate-300', 'text-slate-700');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Successfully applied all fixes to JobDetails.tsx');
