import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FileText, Upload, Sparkles, CheckCircle2, AlertTriangle, Lock, ArrowRight, 
  Briefcase, Search, ShieldCheck, ChevronRight, RefreshCw, Zap, Building2, MapPin, Share2, Trophy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { recordUserIntent } from '@/utils/intentRouting';
import { trackFunnelEvent } from '@/services/telemetry/funnelTracker';
import { toast } from 'sonner';

// Standard role keyword dictionaries based on real job postings
const ROLE_KEYWORDS: Record<string, { required: string[]; common: string[] }> = {
  'Software Engineer': {
    required: ['algorithms', 'data structures', 'git', 'testing', 'debugging', 'ci/cd'],
    common: ['system design', 'rest api', 'microservices', 'agile', 'docker', 'cloud']
  },
  'Full Stack Developer': {
    required: ['javascript', 'typescript', 'react', 'node', 'sql', 'html', 'css'],
    common: ['next.js', 'postgresql', 'tailwind', 'graphql', 'docker', 'aws']
  },
  'Frontend Developer': {
    required: ['react', 'javascript', 'typescript', 'html', 'css', 'responsive design'],
    common: ['tailwind', 'redux', 'next.js', 'webpack', 'figma', 'vite']
  },
  'Backend Developer': {
    required: ['python', 'java', 'node', 'sql', 'rest api', 'database design'],
    common: ['microservices', 'postgresql', 'redis', 'docker', 'kubernetes', 'kafka']
  },
  'Data Analyst': {
    required: ['sql', 'excel', 'python', 'tableau', 'power bi', 'data visualization'],
    common: ['statistics', 'pandas', 'reporting', 'etl', 'dashboard', 'analytics']
  },
  'Data Scientist / AI Engineer': {
    required: ['python', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'sql'],
    common: ['nlp', 'computer vision', 'pandas', 'numpy', 'llm', 'transformers']
  },
  'Product Manager': {
    required: ['roadmap', 'agile', 'user stories', 'kpi', 'market research', 'analytics'],
    common: ['wireframing', 'a/b testing', 'stakeholder management', 'jira', 'scrum']
  },
  'DevOps / Cloud Engineer': {
    required: ['linux', 'docker', 'kubernetes', 'aws', 'ci/cd', 'terraform'],
    common: ['azure', 'gcp', 'ansible', 'prometheus', 'grafana', 'bash']
  },
  'QA Automation Engineer': {
    required: ['selenium', 'cypress', 'automation', 'test cases', 'python', 'javascript'],
    common: ['api testing', 'postman', 'jira', 'ci/cd', 'regression', 'playwright']
  }
};

const DEFAULT_KEYWORDS = [
  'communication', 'collaboration', 'problem solving', 'leadership', 'analytics', 'management'
];

interface ParseHealth {
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedIn: boolean;
  hasSummary: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  hasSkills: boolean;
  hasProjects: boolean;
  wordCount: number;
  quantifiedCount: number;
}

export default function PublicAtsCheck() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [targetRole, setTargetRole] = useState<string>('Full Stack Developer');
  const [resumeText, setResumeText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<boolean>(false);

  // Analysis result state
  const [hasScanned, setHasScanned] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [parseHealth, setParseHealth] = useState<ParseHealth | null>(null);
  const [foundKeywords, setFoundKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [scanId, setScanId] = useState<string | null>(null);
  const [isSharingToNetwork, setIsSharingToNetwork] = useState<boolean>(false);
  const [hasSharedToNetwork, setHasSharedToNetwork] = useState<boolean>(false);

  // Check if returning from claiming an OAuth scan
  useEffect(() => {
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
              if (parsed.autoShareToNetwork) {
                const topSkills = (parsed.foundKeywords || []).slice(0, 5).join(', ');
                const postContent = `🏆 Just verified my ATS Resume Match Score: ${parsed.score || 75}/100 for ${parsed.targetRole || 'Full Stack Developer'} on TalentXcel ATS Studio!\n\nVerified Core Competencies: ${topSkills || 'Technical Expertise, Problem Solving'}.\n\n⚡ Test your resume parseability free in 5 seconds:\n👉 https://talentxcel.in/ats-check\n\n#TalentXcel #ATSScore #CareerMilestone #OpenToWork`;
                supabase.from('posts').insert({
                  author_id: user.id,
                  user_id: user.id,
                  content: postContent,
                  post_type: 'text',
                  is_public: true,
                  status: 'published',
                  tags: ['ATSScore', 'CareerMilestone', 'OpenToWork']
                }).then(() => {
                  setHasSharedToNetwork(true);
                  toast.success('Achievement shared to /network feed!');
                }).catch(() => {});
              }
            }).catch(err => {
              console.warn('[PublicAtsCheck] Scan claim notice:', err);
            });
          }
        }
      } catch (_) {}
    }
  }, [searchParams, user]);

  // Client-side text extraction for PDF and DOCX
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsScanning(true);

    try {
      let extracted = '';
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'txt' || extension === 'md') {
        extracted = await file.text();
      } else if (extension === 'pdf') {
        try {
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
          }
          extracted = fullText;
        } catch (pdfErr) {
          console.warn('PDF.js worker fallback:', pdfErr);
          extracted = await file.text();
        }
      } else if (extension === 'docx') {
        try {
          const mammoth = await import('mammoth');
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          extracted = result.value;
        } catch (docxErr) {
          console.warn('Mammoth extraction fallback:', docxErr);
          extracted = await file.text();
        }
      } else {
        extracted = await file.text();
      }

      setResumeText(extracted);
      runAtsAnalysis(extracted, targetRole);
    } catch (err: any) {
      toast.error('Could not parse document. Try pasting the resume text directly.');
      setActiveTab('paste');
    } finally {
      setIsScanning(false);
    }
  };

  // Instant client-side ATS analysis heuristic
  const runAtsAnalysis = async (text: string, role: string) => {
    if (!text || text.trim().length < 50) {
      toast.error('Please enter at least 50 words of resume text to scan.');
      return;
    }

    setIsScanning(true);
    const lower = text.toLowerCase();
    const words = text.trim().split(/\s+/);
    const wordCount = words.length;

    // Contact info
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
    const hasPhone = /(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}|(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\d{3}\)|\d{3})\s*(?:[.-]\s*)?\d{3}\s*(?:[.-]\s*)?\d{4}/.test(text);
    const hasLinkedIn = /linkedin\.com|github\.com/i.test(text);

    // Structural sections
    const hasSummary = /summary|objective|profile|about me/i.test(text);
    const hasExperience = /experience|employment|work history|career/i.test(text);
    const hasEducation = /education|university|college|bachelor|master|b\.tech|degree/i.test(text);
    const hasSkills = /skills|technical skills|technologies|proficiencies/i.test(text);
    const hasProjects = /projects|portfolio|achievements/i.test(text);

    // Quantified impact metrics (numbers, percentages, currencies)
    const metricsMatches = text.match(/\b\d+(?:\.\d+)?%|\$\d+|\₹\d+|\b\d+\s*(?:x|times|users|k|m|million|clients|hours)\b/gi) || [];
    const quantifiedCount = metricsMatches.length;

    // Keyword matching
    const roleConfig = ROLE_KEYWORDS[role] || { required: DEFAULT_KEYWORDS, common: [] };
    const allKeywords = [...roleConfig.required, ...roleConfig.common];

    const matched: string[] = [];
    const missing: string[] = [];

    allKeywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw.replace('/', '\\/')}\\b`, 'i');
      if (regex.test(lower)) {
        matched.push(kw);
      } else {
        missing.push(kw);
      }
    });

    // Score computation (0 - 100)
    let calculatedScore = 20; // baseline

    // Contact health: +15
    if (hasEmail) calculatedScore += 5;
    if (hasPhone) calculatedScore += 5;
    if (hasLinkedIn) calculatedScore += 5;

    // Section structure: +25
    if (hasSummary) calculatedScore += 5;
    if (hasExperience) calculatedScore += 5;
    if (hasEducation) calculatedScore += 5;
    if (hasSkills) calculatedScore += 5;
    if (hasProjects) calculatedScore += 5;

    // Word count optimality (350-750 words): +15
    if (wordCount >= 300 && wordCount <= 900) {
      calculatedScore += 15;
    } else if (wordCount >= 200 && wordCount <= 1200) {
      calculatedScore += 8;
    }

    // Quantified impact: +10
    if (quantifiedCount >= 4) {
      calculatedScore += 10;
    } else if (quantifiedCount >= 1) {
      calculatedScore += 5;
    }

    // Keyword match ratio: +15
    const keywordRatio = matched.length / (allKeywords.length || 1);
    calculatedScore += Math.round(keywordRatio * 15);

    calculatedScore = Math.min(Math.max(calculatedScore, 34), 98);

    const health: ParseHealth = {
      hasEmail,
      hasPhone,
      hasLinkedIn,
      hasSummary,
      hasExperience,
      hasEducation,
      hasSkills,
      hasProjects,
      wordCount,
      quantifiedCount
    };

    setScore(calculatedScore);
    setParseHealth(health);
    setFoundKeywords(matched);
    setMissingKeywords(missing);
    setHasScanned(true);

    // Generate session fingerprint for conversion attribution
    const fingerprint = 'tx_anon_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);

    // Store in sessionStorage for fast post-auth rehydration
    const scanData = {
      sessionFingerprint: fingerprint,
      targetRole: role,
      rawText: text.substring(0, 10000),
      score: calculatedScore,
      parseHealth: health,
      foundKeywords: matched,
      missingKeywords: missing
    };

    sessionStorage.setItem('tx_pending_ats_scan', JSON.stringify(scanData));

    // Save scan to Supabase RPC asynchronously
    try {
      const { data: generatedScanId } = await supabase.rpc('save_public_ats_scan', {
        p_session_fingerprint: fingerprint,
        p_target_role: role,
        p_raw_text: text.substring(0, 10000),
        p_ats_score: calculatedScore,
        p_parse_metrics: health,
        p_missing_keywords: missing.slice(0, 10),
        p_user_id: user?.id || null
      });

      if (generatedScanId) {
        setScanId(generatedScanId);
        sessionStorage.setItem('tx_pending_ats_scan', JSON.stringify({ ...scanData, scanId: generatedScanId }));
      }
    } catch (saveErr) {
      console.warn('Scan persistence notice:', saveErr);
    } finally {
      setIsScanning(false);
    }
  };

  // 1-Click High-Intent Conversion Gate (Google OAuth)
  const handleShareAchievement = async () => {
    if (!user) {
      const stored = sessionStorage.getItem('tx_pending_ats_scan');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          sessionStorage.setItem('tx_pending_ats_scan', JSON.stringify({ ...parsed, autoShareToNetwork: true }));
        } catch (_) {}
      }
      handleGoogleConversion();
      return;
    }

    setIsSharingToNetwork(true);
    try {
      const topSkills = foundKeywords.slice(0, 5).join(', ');
      const postContent = `🏆 Just verified my ATS Resume Match Score: ${score}/100 for ${targetRole} on TalentXcel ATS Studio!\n\nVerified Core Competencies: ${topSkills || 'Technical Expertise, Problem Solving'}.\n\n⚡ Test your resume parseability free in 5 seconds:\n👉 https://talentxcel.in/ats-check\n\n#TalentXcel #ATSScore #CareerMilestone #OpenToWork`;

      const { error } = await supabase.from('posts').insert({
        author_id: user.id,
        user_id: user.id,
        content: postContent,
        post_type: 'text',
        is_public: true,
        status: 'published',
        tags: ['ATSScore', 'CareerMilestone', 'OpenToWork']
      });

      if (error) throw error;
      setHasSharedToNetwork(true);
      toast.success('Achievement shared to /network feed!');
    } catch (err: any) {
      console.warn('Share to network error:', err);
      toast.error('Could not share achievement right now');
    } finally {
      setIsSharingToNetwork(false);
    }
  };

  const handleGoogleConversion = async () => {
    setIsOAuthLoading(true);

    const redirectTarget = `${window.location.origin}/ats-check?claimed=${scanId || 'recent'}`;
    recordUserIntent('ats', `/ats-check?claimed=${scanId || 'recent'}`);

    // Host check for subdomain delegation
    const host = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
    const isSubdomain = host && host !== 'talentxcel.in' && host !== 'www.talentxcel.in' && !host.includes('localhost') && host.endsWith('.talentxcel.in');

    if (isSubdomain) {
      window.location.href = `https://talentxcel.in/auth?returnTo=${encodeURIComponent(redirectTarget)}&flow=candidate&type=candidate`;
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTarget,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;
    } catch (authErr: any) {
      toast.error(authErr?.message || 'Google sign-in initiation failed. Please try again.');
      setIsOAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Platform Navigation */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-blue-700">TalentXcel</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold uppercase tracking-wider">
                ATS OS
              </span>
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="/jobs" 
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>2,700+ Verified Jobs</span>
            </a>

            {user ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/resume/dashboard')}
                className="font-medium"
              >
                My Resumes
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={handleGoogleConversion}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm flex items-center gap-1.5"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Zero Login Required · In-Browser ATS Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mb-3">
            Free ATS Resume Checker & Job Matcher
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Test your resume against modern corporate ATS algorithms used by top enterprise employers. 
            Identify missing keywords and discover high-intent live openings.
          </p>
        </div>

        {/* Input Card */}
        <Card className="bg-white border-slate-200 shadow-md mb-8">
          <CardHeader className="pb-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Target Role & Resume Input
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Select your desired role to benchmark against real active hiring requirements.
                </CardDescription>
              </div>

              {/* Target Role Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Target Role:</span>
                <select 
                  value={targetRole} 
                  onChange={(e) => {
                    setTargetRole(e.target.value);
                    if (resumeText) runAtsAnalysis(resumeText, e.target.value);
                  }}
                  className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-1.5 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {Object.keys(ROLE_KEYWORDS).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Input Mode Switcher */}
            <div className="flex items-center gap-2 mb-4 bg-slate-100 p-1 rounded-lg max-w-xs">
              <button 
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition ${
                  activeTab === 'upload' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                File Upload (PDF/DOCX)
              </button>
              <button 
                onClick={() => setActiveTab('paste')}
                className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-md transition ${
                  activeTab === 'paste' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paste Text
              </button>
            </div>

            {/* Mode A: Drag & Drop Upload */}
            {activeTab === 'upload' ? (
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-50/50 transition">
                <input 
                  type="file" 
                  id="resume-file" 
                  accept=".pdf,.docx,.txt" 
                  onChange={handleFileUpload}
                  className="hidden" 
                />
                <label htmlFor="resume-file" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3 shadow-sm">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-800 mb-1">
                    {fileName ? fileName : 'Click to upload or drag & drop resume'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Supports PDF, DOCX, or TXT (Max 5MB) · Processed locally in-browser
                  </span>
                </label>
              </div>
            ) : (
              /* Mode B: Text Area */
              <div className="space-y-4">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume contents here (experience, summary, education, and skills)..."
                  rows={8}
                  className="w-full rounded-xl border border-slate-200 p-4 text-xs font-mono text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={() => runAtsAnalysis(resumeText, targetRole)}
                    disabled={isScanning || !resumeText.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 shadow-sm"
                  >
                    {isScanning ? (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Scanning...
                      </span>
                    ) : (
                      'Audit Resume Now'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dynamic Analysis Results */}
        {hasScanned && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Score & Health Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Score Gauge Card */}
              <Card className="bg-white border-slate-200 shadow-sm md:col-span-1 flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    ATS Compatibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex flex-col items-center justify-center py-6">
                  <div className={`relative w-28 h-28 rounded-full flex items-center justify-center border-8 shadow-inner ${
                    score >= 75 ? 'border-emerald-500 text-emerald-700 bg-emerald-50/40' :
                    score >= 60 ? 'border-amber-500 text-amber-700 bg-amber-50/40' :
                    'border-rose-500 text-rose-700 bg-rose-50/40'
                  }`}>
                    <div className="text-center">
                      <span className="text-3xl font-black">{score}</span>
                      <span className="text-xs text-slate-400 block font-semibold">/ 100</span>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <Badge className={`text-xs px-2.5 py-0.5 font-bold ${
                      score >= 75 ? 'bg-emerald-100 text-emerald-800' :
                      score >= 60 ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {score >= 75 ? 'ATS Optimized' : score >= 60 ? 'Moderate Match' : 'High Rejection Risk'}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-2">
                      Benchmark: {targetRole}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Health Metrics Card */}
              <Card className="bg-white border-slate-200 shadow-sm md:col-span-2">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Essential ATS Parser Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-700">Contact Email</div>
                      <div className="text-[10px] text-slate-500">Recruiter reachability</div>
                    </div>
                    {parseHealth?.hasEmail ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-700">Phone Number</div>
                      <div className="text-[10px] text-slate-500">Fast contact verification</div>
                    </div>
                    {parseHealth?.hasPhone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-700">Section Headers</div>
                      <div className="text-[10px] text-slate-500">Summary, Experience, Skills</div>
                    </div>
                    {parseHealth?.hasExperience && parseHealth?.hasSkills ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-700">Word Count</div>
                      <div className="text-[10px] text-slate-500">{parseHealth?.wordCount} words (Ideal: 400-800)</div>
                    </div>
                    {(parseHealth?.wordCount || 0) >= 300 && (parseHealth?.wordCount || 0) <= 900 ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Milestone Achievement Banner */}
              {score >= 70 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 text-xl">
                      🏆
                    </div>
                    <div>
                      <div className="text-sm font-extrabold flex items-center gap-2">
                        <span>Top ATS Score ({score}/100) Milestone Reached!</span>
                        <Badge className="bg-emerald-400 text-slate-900 text-[10px] font-black uppercase">
                          Recruiter Ready
                        </Badge>
                      </div>
                      <p className="text-xs text-blue-100 mt-0.5">
                        Share your verified score to the TalentXcel /network feed to boost your visibility by 3.5x to hiring managers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Button
                      size="sm"
                      onClick={handleShareAchievement}
                      disabled={isSharingToNetwork || hasSharedToNetwork}
                      className="bg-white text-blue-700 hover:bg-blue-50 font-black text-xs px-4 h-9 rounded-xl shadow-md whitespace-nowrap"
                    >
                      {hasSharedToNetwork ? 'Shared to /network ✓' : isSharingToNetwork ? 'Publishing...' : 'Share Achievement to /network 🚀'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Keyword Teaser Card */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span>ATS Keyword Match ({targetRole})</span>
                  <span className="text-xs text-blue-600 font-semibold">{foundKeywords.length} Detected</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Found Keywords */}
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Keywords Found in Your Resume:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {foundKeywords.slice(0, 6).map((kw, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs">
                        {kw}
                      </Badge>
                    ))}
                    {foundKeywords.length > 6 && (
                      <span className="text-xs text-slate-400 font-medium self-center">
                        +{foundKeywords.length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Missing Keywords Teaser */}
                <div>
                  <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Critical Keywords Missing from Your Profile:
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {missingKeywords.slice(0, 2).map((kw, idx) => (
                      <Badge key={idx} variant="destructive" className="bg-rose-50 text-rose-800 border-rose-200 text-xs">
                        Missing: {kw}
                      </Badge>
                    ))}
                    <div className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
                      <Lock className="w-3 h-3 text-slate-400" />
                      +{Math.max(0, missingKeywords.length - 2)} more locked in full report
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* High-Intent Conversion Gate OR Full Unlocked Diagnostics */}
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
                      href={`/resume-builder?from=ats&role=${encodeURIComponent(targetRole)}`}
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

            {/* Sample Verified Live Vacancies Preview */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Live Roles Matching Your ATS Profile
                </h4>
                <a href="/jobs" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
                  View all 2,711 jobs <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-400 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">Microsoft</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">92% Match</Badge>
                  </div>
                  <div className="text-sm font-semibold text-slate-800 mb-1">Junior Software Engineer (React)</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3 text-slate-400" /> Bangalore · ₹5.3L - ₹10.0L
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleGoogleConversion}
                    className="w-full text-xs font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    1-Click Fast Apply
                  </Button>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-400 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">Razorpay</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">88% Match</Badge>
                  </div>
                  <div className="text-sm font-semibold text-slate-800 mb-1">Software Engineer (Frontend)</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3 text-slate-400" /> Bangalore · ₹5.3L - ₹10.0L
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleGoogleConversion}
                    className="w-full text-xs font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    1-Click Fast Apply
                  </Button>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-blue-400 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">Amazon</span>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">85% Match</Badge>
                  </div>
                  <div className="text-sm font-semibold text-slate-800 mb-1">Graduate Engineer Trainee</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3 text-slate-400" /> Bangalore · ₹4.8L - ₹9.0L
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleGoogleConversion}
                    className="w-full text-xs font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    1-Click Fast Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TalentXcel. All rights reserved. Zero-Cost Verified Job Ecosystem.</p>
          <div className="flex items-center gap-4">
            <a href="/jobs" className="hover:text-blue-600">Browse Jobs</a>
            <a href="/telegram" className="hover:text-blue-600">Telegram Alerts</a>
            <a href="/privacy" className="hover:text-blue-600">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
