const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'src', 'components', 'products', 'JobMatchProduct.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add scroll lock effect for modals
const effectTarget = "  useEffect(() => {\n    conversionTelemetry.track('landing_view', { product: 'jobmatch_os', universe: 'JOBS' });\n    fetchJobs();\n  }, []);";

const effectReplacement = `  // Prevent background scroll and lock position so modal opens right in place
  useEffect(() => {
    if (aiMatchModalOpen || interviewModalOpen || selectedJobForDetail || selectedJobForApply) {
      const scrollY = window.scrollY;
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;
      const originalTop = document.body.style.top;
      const originalWidth = document.body.style.width;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = \`-\${scrollY}px\`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.top = originalTop;
        document.body.style.width = originalWidth;
        window.scrollTo(0, scrollY);
      };
    }
  }, [aiMatchModalOpen, interviewModalOpen, selectedJobForDetail, selectedJobForApply]);

  useEffect(() => {
    conversionTelemetry.track('landing_view', { product: 'jobmatch_os', universe: 'JOBS' });
    fetchJobs();
  }, []);`;

const normContent = content.replace(/\r\n/g, '\n');
const normEffectTarget = effectTarget.replace(/\r\n/g, '\n');

if (normContent.includes(normEffectTarget)) {
  const isCRLF = content.includes('\r\n');
  const finalReplacement = isCRLF ? effectReplacement.replace(/\n/g, '\r\n') : effectReplacement;
  const finalTarget = isCRLF ? effectTarget.replace(/\n/g, '\r\n') : normEffectTarget;
  content = content.replace(finalTarget, finalReplacement);
  console.log('✅ Added modal scroll lock and position freeze effect');
} else {
  console.error('❌ Could not find effectTarget');
}

// 2. Fix the H1 headline font and line wrapping
const h1Target = `<h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-[#111827] tracking-tight leading-[1.18]">
                      Find the Right Job<br />
                      for Your <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">Next Global Career Move</span>
                    </h1>`;

const h1Replacement = `<h1 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-black text-[#111827] tracking-tight leading-[1.25]">
                      Find the Right Job<br />
                      for Your <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">Next Global Career Move</span>
                    </h1>`;

const normH1Target = h1Target.replace(/\r\n/g, '\n');
const normH1Replacement = h1Replacement.replace(/\r\n/g, '\n');

if (normContent.includes(normH1Target)) {
  const isCRLF = content.includes('\r\n');
  const finalReplacement = isCRLF ? h1Replacement.replace(/\n/g, '\r\n') : normH1Replacement;
  const finalTarget = isCRLF ? h1Target.replace(/\n/g, '\r\n') : normH1Target;
  content = content.replace(finalTarget, finalReplacement);
  console.log('✅ Adjusted H1 headline font sizing and proportional leading');
} else {
  console.error('❌ Could not find h1Target');
}

// 3. Fix button click handlers to prevent default scrolling
const buttonsTarget = `<button
                        type="button"
                        onClick={() => setAiMatchModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>Run AI Compatibility Match</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openInterviewCoach()}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#7138E8] bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <GraduationCap className="w-4 h-4 text-[#7138E8]" />
                        <span>AI Interview Prep Coach</span>
                      </button>`;

const buttonsReplacement = `<button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAiMatchModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>Run AI Compatibility Match</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openInterviewCoach();
                        }}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#7138E8] bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center gap-2 cursor-pointer transition-all"
                      >
                        <GraduationCap className="w-4 h-4 text-[#7138E8]" />
                        <span>AI Interview Prep Coach</span>
                      </button>`;

const normButtonsTarget = buttonsTarget.replace(/\r\n/g, '\n');
const normButtonsReplacement = buttonsReplacement.replace(/\r\n/g, '\n');

if (normContent.includes(normButtonsTarget)) {
  const isCRLF = content.includes('\r\n');
  const finalReplacement = isCRLF ? buttonsReplacement.replace(/\n/g, '\r\n') : normButtonsReplacement;
  const finalTarget = isCRLF ? buttonsTarget.replace(/\n/g, '\r\n') : normButtonsTarget;
  content = content.replace(finalTarget, finalReplacement);
  console.log('✅ Updated action buttons to prevent default scroll');
} else {
  console.error('❌ Could not find buttonsTarget');
}

// 4. Update the modals' outer div to ensure fixed full screen overlay
content = content.replace(
  '<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">',
  '<div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">'
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('✅ JobMatchProduct.tsx patched successfully');
