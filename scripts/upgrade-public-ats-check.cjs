const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/pages/PublicAtsCheck.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add funnel telemetry import
if (!code.includes('trackFunnelEvent')) {
  code = code.replace(
    "import { recordUserIntent } from '@/utils/intentRouting';",
    "import { recordUserIntent } from '@/utils/intentRouting';\nimport { trackFunnelEvent } from '@/services/telemetry/funnelTracker';"
  );
}

// 2. Track tool_started and handle post-auth claim
const oldUseEffectRegex = /useEffect\(\(\) => \{[\s\S]*?if \(stored\) \{[\s\S]*?setHasScanned\(true\);[\s\S]*?\}\s*\}\s*catch \(_\) \{\}\s*\}\s*\}, \[searchParams\]\);/;

const newUseEffectCode = `useEffect(() => {
    trackFunnelEvent('tool_started', { tool: 'ats-check' });

    const claimedScan = searchParams.get('claimed');
    const stored = sessionStorage.getItem('tx_pending_ats_scan');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.rawText) {
          setResumeText(parsed.rawText);
          setTargetRole(parsed.targetRole || 'Full Stack Developer');
          setScore(parsed.score || 72);
          setParseHealth(parsed.parseHealth || null);
          setFoundKeywords(parsed.foundKeywords || []);
          setMissingKeywords(parsed.missingKeywords || []);
          setScanId(parsed.scanId || null);
          setHasScanned(true);

          // If user is authenticated, claim scan into Supabase
          if (user && parsed.scanId && parsed.sessionFingerprint) {
            supabase.rpc('claim_ats_scan', {
              p_scan_id: parsed.scanId,
              p_session_fingerprint: parsed.sessionFingerprint
            }).then(() => {
              trackFunnelEvent('signup_completed', { trigger: 'ats_check', scan_id: parsed.scanId });
            }).catch(err => {
              console.warn('[PublicAtsCheck] Scan claim notice:', err);
            });
          }
        }
      } catch (_) {}
    }
  }, [searchParams, user]);`;

code = code.replace(oldUseEffectRegex, newUseEffectCode);

// 3. Track ats_scan_completed inside runAtsAnalysis
const oldScanFinish = `setHasScanned(true);
      toast.success('ATS analysis complete!');`;

const newScanFinish = `setHasScanned(true);
      trackFunnelEvent('ats_scan_completed', { score: calculatedScore, role, wordCount });
      toast.success('ATS analysis complete!');`;

code = code.replace(oldScanFinish, newScanFinish);

// 4. Update the Conversion Gate vs Unlocked Report conditional rendering
const oldGateRegex = /{\/\* High-Intent Conversion Gate \*\/}[\s\S]*?{\/\* Sample Verified Live Vacancies Preview \*\/}/;

const newGateCode = `{/* High-Intent Conversion Gate OR Full Unlocked Diagnostics */}
            {!user ? (
              <div className="relative rounded-2xl overflow-hidden border border-blue-200 bg-gradient-to-b from-blue-50/40 via-white to-white p-6 sm:p-8 shadow-lg">
                {/* Blurred Locked Deliverables Background */}
                <div className="filter blur-sm select-none opacity-40 space-y-4 pointer-events-none">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="h-4 bg-slate-300 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-slate-200 rounded w-4/5"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white border border-slate-200 rounded-xl h-24"></div>
                    <div className="p-4 bg-white border border-slate-200 rounded-xl h-24"></div>
                  </div>
                </div>

                {/* Foreground Conversion Hook Card */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/80 backdrop-blur-[2px]">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md">
                    <Zap className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-slate-950 mb-2">
                    Unlock Full 18-Keyword Matrix & 47 Matching Jobs
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm max-w-lg mb-6 leading-relaxed">
                    Join 10,000+ candidates who get verified job matches tailored to their exact ATS score. 
                    Includes automated bullet rewrites and direct 1-click apply links.
                  </p>

                  {/* 1-Click Google OAuth Button */}
                  <div className="w-full max-w-sm space-y-3">
                    <Button
                      onClick={() => {
                        trackFunnelEvent('oauth_gate_shown', { trigger: 'ats_check_gate', score });
                        handleGoogleConversion();
                      }}
                      disabled={isOAuthLoading}
                      className="w-full py-6 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center justify-center gap-3 transition"
                    >
                      {isOAuthLoading ? (
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" /> Connecting with Google...
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
                          <span>Unlock with Google in 1-Click</span>
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Free Forever
                      </span>
                      <span>•</span>
                      <span>Zero spam</span>
                      <span>•</span>
                      <span>No passwords</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Unlocked Diagnostic Hub */
              <div className="bg-gradient-to-b from-blue-50/50 to-white border border-blue-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Full ATS Diagnostic Report Unlocked</h3>
                      <p className="text-xs text-slate-500">Linked to your authenticated TalentXcel Career Passport account.</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white text-xs px-3 py-1 font-semibold w-fit">
                    Verified Score: {score}/100
                  </Badge>
                </div>

                {/* All Missing Keywords Matrix */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    All Recommended Target Keywords for {targetRole}:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {missingKeywords.map((kw, idx) => (
                      <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-xs font-medium">
                        + Add: {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action CTA Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-blue-100">
                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-blue-600 uppercase">Interactive Studio</div>
                    <div className="text-sm font-bold text-slate-900">Auto-Fix in Live Resume Builder</div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Pre-load your score and detected keywords directly into the AI Resume Studio to reformat bullets automatically.
                    </p>
                    <a 
                      href={\`/resume-builder?from=ats&role=\${encodeURIComponent(targetRole)}\`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 pt-1"
                    >
                      Open Live Resume Builder &rarr;
                    </a>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="text-xs font-bold text-purple-600 uppercase">Career Passport</div>
                    <div className="text-sm font-bold text-slate-900">Add Verified ATS Badge to Passport</div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Showcase your verified {score}/100 ATS optimization badge on your public vanity profile.
                    </p>
                    <a 
                      href="/passport"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 pt-1"
                    >
                      Go to Career Passport &rarr;
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Sample Verified Live Vacancies Preview */}`;

code = code.replace(oldGateRegex, newGateCode);

fs.writeFileSync(filePath, code, 'utf8');
console.log('✓ Successfully upgraded PublicAtsCheck.tsx with funnel tracking and post-auth unlocked state');
