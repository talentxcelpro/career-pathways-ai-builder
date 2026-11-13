const fs = require('fs');

let content = fs.readFileSync('src/components/products/jobmatch/InternationalJobLandingPage.tsx', 'utf8');

// 1. Add Linkedin to lucide-react imports
if (!content.includes('Linkedin,')) {
  content = content.replace(
    'GraduationCap\n} from \'lucide-react\';',
    'GraduationCap,\n  Linkedin\n} from \'lucide-react\';'
  );
}

// 2. Add company LinkedIn search link next to company name
const companyTarget = `<span className="font-semibold text-[#334155]">{job.company_name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />`;

const companyReplacement = `<span className="font-semibold text-[#334155]">{job.company_name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          <a
                            href={\`https://www.linkedin.com/company/\${encodeURIComponent(job.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-'))}\`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#0A66C2] hover:text-[#004182] inline-flex items-center gap-0.5 text-[11px] font-bold ml-1"
                            title={\`View \${job.company_name} on LinkedIn\`}
                          >
                            <Linkedin className="w-3 h-3 fill-current" />
                          </a>`;

content = content.replace(companyTarget, companyReplacement);

// 3. Add 1-click LinkedIn share button in right actions
const actionsTarget = `<Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => toggleSaveJob(job.id, e)}`;

const actionsReplacement = `<a
                        href={\`https://www.linkedin.com/sharing/share-offsite/?url=\${encodeURIComponent(\`https://jobs.talentxcel.in/jobs/\${job.seo_slug || job.id}\`)}\`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="h-9 w-9 rounded-xl border border-[#E2E8F0] hover:border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50/80 flex items-center justify-center transition-colors shrink-0"
                        title="Share on LinkedIn"
                      >
                        <Linkedin className="w-4 h-4 fill-current" />
                      </a>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => toggleSaveJob(job.id, e)}`;

content = content.replace(actionsTarget, actionsReplacement);

fs.writeFileSync('src/components/products/jobmatch/InternationalJobLandingPage.tsx', content, 'utf8');
console.log('Successfully wired LinkedIn interlinking into InternationalJobLandingPage.tsx');
