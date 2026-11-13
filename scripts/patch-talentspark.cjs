const fs = require('fs');
let code = fs.readFileSync('src/components/jobs/TalentSparkJobCard.tsx', 'utf8');

// 1. Add Linkedin and toast imports
if (!code.includes('Linkedin,')) {
  code = code.replace(/Send\r?\n\} from 'lucide-react';/, "Send,\n  Linkedin\n} from 'lucide-react';");
}
if (!code.includes("import { toast } from 'sonner';")) {
  code = code.replace(
    "import { getCompanyLogo, generateCompanyMonogram } from '@/utils/companyLogos';",
    "import { getCompanyLogo, generateCompanyMonogram } from '@/utils/companyLogos';\nimport { toast } from 'sonner';"
  );
}

// 2. Add props to interface
if (!code.includes('onApplyClick?:')) {
  code = code.replace(
    '  onQuickApply: (jobId: string) => void;',
    '  onQuickApply: (jobId: string) => void;\n  onApplyClick?: (job: any) => void;\n  onViewDetails?: (job: any) => void;'
  );
}

// 3. Destructure props
if (!code.includes('onApplyClick,')) {
  code = code.replace(
    /onQuickApply,\r?\n\s*onCompare,/,
    'onQuickApply,\n  onApplyClick,\n  onViewDetails,\n  onCompare,'
  );
}

// 4. Update formatSalary for multi-currency
const oldSalaryRegex = /const formatSalary = \(min\?: number, max\?: number\) => \{[\s\S]*?return `₹\$\{Math\.round\(val \/ 1000\)\}k\+`;[\s\S]*?return `₹\$\{\(val \/ 100000\)\.toFixed\(1\)\}L\+`;[\s\S]*?\};/;

const newFormatSalary = `const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Competitive Pay';
    const curr = ((job as any)?.salary_currency || '').toUpperCase();
    const loc = (job.location || '').toLowerCase();
    
    if (curr === 'AED' || loc.includes('dubai') || loc.includes('abu dhabi') || loc.includes('uae')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? \`AED \${minK}k - \${maxK}k / yr\` : \`AED \${minK}k / yr\`;
    }
    if (curr === 'USD' || loc.includes('usa') || loc.includes('united states')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? \`$\${minK}k - $\${maxK}k / yr\` : \`$\${minK}k / yr\`;
    }
    if (curr === 'SAR' || loc.includes('riyadh') || loc.includes('saudi')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? \`SAR \${minK}k - \${maxK}k / yr\` : \`SAR \${minK}k / yr\`;
    }
    if (curr === 'QAR' || loc.includes('doha') || loc.includes('qatar')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? \`QAR \${minK}k - \${maxK}k / yr\` : \`QAR \${minK}k / yr\`;
    }
    if (curr === 'OMR' || loc.includes('muscat') || loc.includes('oman')) {
      const minK = Math.round((min || 0) / 1000);
      const maxK = max ? Math.round(max / 1000) : null;
      return maxK && maxK !== minK ? \`OMR \${minK}k - \${maxK}k / yr\` : \`OMR \${minK}k / yr\`;
    }

    if (min && max) {
      if (max < 100000) {
        return \`₹\${Math.round(min / 1000)}k - ₹\${Math.round(max / 1000)}k\`;
      }
      return \`₹\${(min / 100000).toFixed(1)}L - ₹\${(max / 100000).toFixed(1)}L\`;
    }
    const val = min || max || 0;
    if (val < 100000) return \`₹\${Math.round(val / 1000)}k+\`;
    return \`₹\${(val / 100000).toFixed(1)}L+\`;
  };`;

code = code.replace(oldSalaryRegex, newFormatSalary);

// 5. Update handleViewJob to honor onViewDetails
code = code.replace(
  /const handleViewJob = \(\) => \{\r?\n\s*\/\/ Always navigate to TalentXcel detail page\r?\n\s*navigate\(getJobDetailUrl\(job\)\);\r?\n\s*\};/,
  `const handleViewJob = () => {
    if (onViewDetails) {
      onViewDetails(job);
      return;
    }
    navigate(getJobDetailUrl(job));
  };`
);

// 6. Add handleShareLinkedIn
if (!code.includes('handleShareLinkedIn')) {
  code = code.replace(
    'const handleShare = async () => {',
    `const handleShareLinkedIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = \`\${window.location.origin}\${getJobDetailUrl(job)}\`;
    const shareUrl = \`https://www.linkedin.com/sharing/share-offsite/?url=\${encodeURIComponent(url)}\`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    toast.success('Opening LinkedIn to share job...');
  };

  const handleShare = async () => {`
  );
}

// 7. In Default card view: Add LinkedIn icon on company name
const oldCompanyText = `<p className="text-xs sm:text-sm text-primary font-semibold truncate mt-0.5">\r?\n\\s*\\{job\\.companies\\?\\.name \\|\\| job\\.company_name\\}\r?\n\\s*<\\/p>`;
const newCompanyText = `<div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-xs sm:text-sm text-primary font-semibold truncate">
                  {job.companies?.name || job.company_name}
                </span>
                <a
                  href={\`https://www.linkedin.com/search/results/all/?keywords=\${encodeURIComponent(companyName)}\`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center text-[#0A66C2] hover:text-[#004182] hover:underline text-[11px] font-medium"
                  title={\`Find \${companyName} on LinkedIn\`}
                >
                  <Linkedin className="h-3 w-3 inline mr-0.5" />
                  <span className="hidden sm:inline">LinkedIn</span>
                </a>
              </div>`;

code = code.replace(new RegExp(oldCompanyText), newCompanyText);

// 8. In Default card view: Benefits include strip
const oldBenefitsText = `<span>•</span>\r?\n\\s*<span>Learning Budget<\\/span>\r?\n\\s*<\\/div>`;
const newBenefitsText = `<span>•</span>
            <span>Learning Budget</span>
            {(job as any)?.applicant_location_requirements?.includes('Visa Sponsored') && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-amber-700 font-bold">🇦🇪 UAE Visa Sponsored</span>
              </>
            )}
            {(job as any)?.applicant_location_requirements?.includes('US Work Authorization') && (
              <>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-blue-700 font-bold">🇺🇸 US Work Auth</span>
              </>
            )}
          </div>`;
code = code.replace(new RegExp(oldBenefitsText), newBenefitsText);

// 9. In Default card view: Actions row - Add LinkedIn share button and wire onApplyClick
if (!code.includes('onClick={handleShareLinkedIn}')) {
  const oldShareButton = `<Button\r?\n\\s*variant="ghost"\r?\n\\s*size="sm"\r?\n\\s*onClick=\\{\\(e\\) => \\{\r?\n\\s*e\\.stopPropagation\\(\\);\r?\n\\s*handleShare\\(\\);\r?\n\\s*\\}\\}\r?\n\\s*className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:bg-muted"\r?\n\\s*title="Share job"\r?\n\\s*>\r?\n\\s*<Share2 className="h-4 w-4" \\/>\r?\n\\s*<\\/Button>`;
  
  const newShareButtons = `<Button
              variant="ghost"
              size="sm"
              onClick={handleShareLinkedIn}
              className="h-8 w-8 p-0 rounded-lg text-[#0A66C2] hover:text-[#004182] hover:bg-blue-50"
              title="Share on LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:bg-muted"
              title="Share job"
            >
              <Share2 className="h-4 w-4" />
            </Button>`;
  code = code.replace(new RegExp(oldShareButton), newShareButtons);
}

// 10. Wire onApplyClick on Apply button
code = code.replace(
  /onClick=\{\(e\) => \{\r?\n\s*e\.stopPropagation\(\);\r?\n\s*setShowApplicationDialog\(true\);\r?\n\s*\}\}/g,
  `onClick={(e) => {
                e.stopPropagation();
                if (onApplyClick) {
                  onApplyClick(job);
                } else {
                  setShowApplicationDialog(true);
                }
              }}`
);

fs.writeFileSync('src/components/jobs/TalentSparkJobCard.tsx', code, 'utf8');
console.log('TalentSparkJobCard patched successfully');
