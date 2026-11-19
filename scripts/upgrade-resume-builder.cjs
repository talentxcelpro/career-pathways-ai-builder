const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/pages/resume/UnifiedResumeBuilder.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add imports for auth and telemetry
if (!code.includes('useAuth')) {
  code = code.replace(
    'import { useResumeData } from "@/hooks/useResumeData";',
    'import { useResumeData } from "@/hooks/useResumeData";\nimport { useAuth } from "@/contexts/AuthContext";\nimport { trackFunnelEvent } from "@/services/telemetry/funnelTracker";\nimport { supabase } from "@/integrations/supabase/client";'
  );
}

// 2. Add state inside UnifiedResumeBuilder
const oldStateAnchor = 'const [showExportModal, setShowExportModal] = useState(false);';
const newStateAdditions = `const [showExportModal, setShowExportModal] = useState(false);
  const { user } = useAuth();
  const { role: routeRole } = useParams<{ role?: string }>();
  const [showOAuthGate, setShowOAuthGate] = useState(false);
  const [pendingExportType, setPendingExportType] = useState<'pdf' | 'docx' | null>(null);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);`;

code = code.replace(oldStateAnchor, newStateAdditions);

// 3. Add effect to handle draft and post-auth export
const oldMountAnchor = 'const handleExperienceChange = (experiences: any[]) => {';
const newEffectsCode = `// Pre-fill target role from URL route parameter (e.g. /resume/software-engineer)
  useEffect(() => {
    if (routeRole && !targetJobTitle) {
      const formatted = routeRole.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      setTargetJobTitle(formatted);
      setLocalData((prev: any) => ({ ...prev, targetJobTitle: formatted }));
    }
  }, [routeRole]);

  // Continuous draft persistence
  useEffect(() => {
    if (localData) {
      try {
        localStorage.setItem('tx_pending_resume_draft', JSON.stringify({
          data: localData,
          updatedAt: Date.now()
        }));
      } catch (_) {}
    }
  }, [localData]);

  // Telemetry and post-auth pending export resume execution
  useEffect(() => {
    trackFunnelEvent('tool_started', { tool: 'resume-builder', role: routeRole });

    const pendingStr = localStorage.getItem('tx_pending_resume_draft');
    if (pendingStr) {
      try {
        const parsed = JSON.parse(pendingStr);
        if (user && parsed.pendingExport) {
          trackFunnelEvent('signup_completed', { trigger: 'resume_builder_export' });
          toast.success('Signed in! Downloading your ATS resume now...');
          localStorage.removeItem('tx_pending_resume_draft');
          setTimeout(() => {
            if (parsed.pendingExport === 'pdf') exportToPDF(parsed.data || localData);
            else if (parsed.pendingExport === 'docx') exportToDOCX(parsed.data || localData);
          }, 600);
        }
      } catch (_) {}
    }
  }, [user]);

  const handleOAuthExportConversion = async () => {
    setIsOAuthLoading(true);
    try {
      const returnUrl = window.location.href;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: returnUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in initiation failed.');
      setIsOAuthLoading(false);
    }
  };

  const handleExperienceChange = (experiences: any[]) => {`;

code = code.replace(oldMountAnchor, newEffectsCode);

// 4. Update handleExportPDF and handleExportDOCX to gate when !user
const oldExportPDF = 'const handleExportPDF = () => exportToPDF(localData);';
const oldExportDOCX = 'const handleExportDOCX = () => exportToDOCX(localData);';

const newExportPDF = `const handleExportPDF = () => {
    if (!user) {
      try {
        localStorage.setItem('tx_pending_resume_draft', JSON.stringify({
          data: localData,
          pendingExport: 'pdf',
          updatedAt: Date.now()
        }));
      } catch (_) {}
      trackFunnelEvent('oauth_gate_shown', { trigger: 'resume_export_pdf' });
      setPendingExportType('pdf');
      setShowOAuthGate(true);
      return;
    }
    exportToPDF(localData);
  };`;

const newExportDOCX = `const handleExportDOCX = () => {
    if (!user) {
      try {
        localStorage.setItem('tx_pending_resume_draft', JSON.stringify({
          data: localData,
          pendingExport: 'docx',
          updatedAt: Date.now()
        }));
      } catch (_) {}
      trackFunnelEvent('oauth_gate_shown', { trigger: 'resume_export_docx' });
      setPendingExportType('docx');
      setShowOAuthGate(true);
      return;
    }
    exportToDOCX(localData);
  };`;

code = code.replace(oldExportPDF, newExportPDF);
code = code.replace(oldExportDOCX, newExportDOCX);

// 5. Add the OAuth Gate Modal in JSX before closing PreFlightExportModal
const oldModalEnd = `      <PreFlightExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        resumeData={localData}
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
      />`;

const newModalEnd = `      <PreFlightExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        resumeData={localData}
        onExportPDF={handleExportPDF}
        onExportDOCX={handleExportDOCX}
      />

      {/* 1-Click Google OAuth Export Gate Modal */}
      {showOAuthGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5 relative">
            <button 
              onClick={() => setShowOAuthGate(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-bold p-2"
            >
              ✕
            </button>

            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg">
              <Download className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Free · ATS Optimized
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Download Your ATS Resume
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Connect with Google to download your ATS-ready {pendingExportType?.toUpperCase() || 'PDF'} resume and automatically link it to your verified Career Passport.
              </p>
            </div>

            <Button
              onClick={handleOAuthExportConversion}
              disabled={isOAuthLoading}
              className="w-full py-6 text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md flex items-center justify-center gap-3 transition"
            >
              {isOAuthLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting with Google...
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google in 1-Click</span>
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
              <span>Instant Download</span>
              <span>•</span>
              <span>No Password Needed</span>
              <span>•</span>
              <span>Zero Spam</span>
            </div>
          </div>
        </div>
      )}`;

code = code.replace(oldModalEnd, newModalEnd);

fs.writeFileSync(filePath, code, 'utf8');
console.log('✓ Successfully upgraded UnifiedResumeBuilder.tsx with 1-click OAuth export gate and draft persistence');
