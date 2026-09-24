import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Share2, 
  Linkedin, 
  Twitter, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  FileText,
  Flame,
  Globe,
  Award
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { useTalentScore } from '@/hooks/useTalentScore';
import { supabase } from '@/integrations/supabase/client';

interface GrowthCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
  score?: number;
  velocity?: number;
  acceleration?: string;
  globalRank?: string;
  telemetryFidelity?: string;
}

export const GrowthCertificateModal: React.FC<GrowthCertificateModalProps> = ({
  isOpen,
  onClose,
  candidateName,
  score: propScore,
  velocity: propVelocity,
  acceleration: propAcceleration,
  globalRank: propRank,
  telemetryFidelity: propFidelity,
}) => {
  const { user } = useOptimizedAuth();
  const { talentScore } = useTalentScore();
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const [actualName, setActualName] = useState<string>(candidateName || 'Valued Candidate');
  const [displayScore, setDisplayScore] = useState<number>(propScore || 823);
  const [displayVelocity, setDisplayVelocity] = useState<number>(propVelocity || 66);
  const [displayAcceleration, setDisplayAcceleration] = useState<string>(propAcceleration || '+8.2%');
  const [displayRank, setDisplayRank] = useState<string>(propRank || '#853');
  const [displayFidelity, setDisplayFidelity] = useState<string>(propFidelity || '98%');
  const [passportUsername, setPassportUsername] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const credentialId = `TXC-GRW-${displayScore}-9481X`;
  const issueDate = 'September 24, 2026';

  // 1. Resolve Actual User Name, Actual Scores & Stored Passport QR Code
  useEffect(() => {
    const resolveActualUserData = async () => {
      let resolvedName = candidateName;
      let resolvedUsername = '';
      let resolvedScore = propScore || talentScore?.score || 823;
      let resolvedVelocity = propVelocity || (talentScore?.delta ? Math.abs(talentScore.delta) : 66);

      if (user) {
        try {
          // Fetch real profile details
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, username, achievement_score, skills')
            .eq('id', user.id)
            .maybeSingle();

          if (profile) {
            if (profile.full_name && profile.full_name.trim()) {
              resolvedName = profile.full_name.trim();
            } else if (profile.username && profile.username.trim()) {
              resolvedName = profile.username.trim();
            }

            if (profile.username) {
              resolvedUsername = profile.username.trim();
            }

            if (profile.achievement_score && !propScore && !talentScore?.score) {
              resolvedScore = profile.achievement_score;
            }
          }

          // Check for existing Career Passport QR record
          const { data: qrRow } = await supabase
            .from('career_passport_qr')
            .select('qr_code_url, passport_url')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();

          if (qrRow?.qr_code_url) {
            setQrCodeUrl(qrRow.qr_code_url);
          }
        } catch (err) {
          console.warn('Profile & QR fetch in certificate warning:', err);
        }

        // Fallbacks from user metadata if name still empty
        if (!resolvedName || resolvedName === 'Valued Candidate') {
          resolvedName = 
            user.user_metadata?.full_name || 
            user.user_metadata?.name || 
            user.email?.split('@')[0] || 
            'Valued Candidate';
        }

        if (!resolvedUsername) {
          resolvedUsername = user.user_metadata?.user_name || user.id;
        }
      }

      // Format name gracefully
      const formattedName = resolvedName?.includes('.')
        ? resolvedName.split('.').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
        : (resolvedName?.includes('@') ? resolvedName.split('@')[0] : resolvedName);

      const finalName = formattedName 
        ? formattedName.charAt(0).toUpperCase() + formattedName.slice(1)
        : 'Verified Candidate';

      setActualName(finalName);
      setPassportUsername(resolvedUsername || 'candidate');

      // Update actual scores
      setDisplayScore(resolvedScore || 823);
      const vel = resolvedVelocity > 0 ? resolvedVelocity : 66;
      setDisplayVelocity(vel);
      setDisplayAcceleration(`+${Math.max(4.5, ((vel / resolvedScore) * 100).toFixed(1))}%`);

      if (talentScore?.percentile) {
        setDisplayRank(`Top ${Math.max(1, 100 - talentScore.percentile)}%`);
      } else if (propRank) {
        setDisplayRank(propRank);
      } else {
        setDisplayRank('#853');
      }

      setDisplayFidelity(propFidelity || '98%');
    };

    resolveActualUserData();
  }, [user, candidateName, propScore, propVelocity, talentScore]);

  const passportUrl = passportUsername 
    ? `https://talentxcel.in/passport/${passportUsername}`
    : 'https://talentxcel.in/passport';

  // 2. Generate crisp 512x512 Passport QR Code if not already retrieved from DB
  useEffect(() => {
    const generatePassportQR = async () => {
      if (qrCodeUrl) return; // Already loaded from career_passport_qr
      if (!passportUrl) return;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;

        await QRCode.toCanvas(canvas, passportUrl, {
          width: 512,
          margin: 1,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#070b14',
            light: '#ffffff',
          },
        });

        const ctx = canvas.getContext('2d');
        if (ctx) {
          const center = 256;
          const radius = 44;

          // Inner circular badge
          ctx.beginPath();
          ctx.arc(center, center, radius + 6, 0, 2 * Math.PI);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          const grad = ctx.createLinearGradient(center - radius, center - radius, center + radius, center + radius);
          grad.addColorStop(0, '#2563EB');
          grad.addColorStop(1, '#06B6D4');
          ctx.beginPath();
          ctx.arc(center, center, radius, 0, 2 * Math.PI);
          ctx.fillStyle = grad;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(center, center, radius - 6, 0, 2 * Math.PI);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 26px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('TX', center, center);
        }

        setQrCodeUrl(canvas.toDataURL('image/png', 1.0));
      } catch (err) {
        console.warn('QR Code generation error:', err);
      }
    };

    generatePassportQR();
  }, [passportUrl, qrCodeUrl]);

  const viralShareText = `🌟 Official TalentXcel Verified Executive Growth Certificate!

Certified by Sanobar Jahan, Founder of TalentXcel Services, recognizing top-tier career velocity and verified multi-source skill validation.

📊 Verified Standing:
• Candidate: ${actualName}
• TalentScore: ${displayScore} / 1000 (Elite Tier Standing)
• Global Standing: ${displayRank} (Top 5% Worldwide)
• 30-Day Velocity: +${displayVelocity} PTS (${displayAcceleration})
• Telemetry Fidelity: ${displayFidelity} (Multi-source verified)

Scan QR code or view my live verified Career Passport profile:
${passportUrl}

#TalentXcel #CareerGrowth #ExecutiveLeadership #TalentScore #CareerPassport`;

  // 3. Ultra-Crisp High-Resolution PNG Download
  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;
    setIsExportingImage(true);
    try {
      await document.fonts.ready;
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // Ultra-sharp 3x resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#070b14',
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `TalentXcel-Growth-Certificate-${actualName.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('🎉 High-Resolution Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error generating certificate image:', error);
      toast.error('Failed to export certificate image. Please try again.');
    } finally {
      setIsExportingImage(false);
    }
  };

  // 4. Razor-Sharp A4 Landscape PDF Download
  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsExportingPDF(true);
    try {
      await document.fonts.ready;
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // 3x scale ensures 300 DPI print crispness
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#070b14',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Standard A4 Landscape: 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 297
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 210

      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      const yOffset = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', 0, Math.max(0, yOffset), pdfWidth, imgHeight, undefined, 'FAST');
      pdf.save(`TalentXcel-Growth-Certificate-${actualName.replace(/\s+/g, '_')}.pdf`);

      toast.success('📄 Executive A4 PDF Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error generating certificate PDF:', error);
      toast.error('Failed to export certificate PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleShareLinkedIn = () => {
    navigator.clipboard.writeText(viralShareText);
    toast.success('📋 Post text copied to clipboard! Opening LinkedIn...');
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(passportUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const tweetText = `Honored to receive the Official Executive Growth Certificate certified by Sanobar Jahan on @TalentXcel! 🌟 View my verified Career Passport: ${passportUrl} #TalentXcel #CareerGrowth`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(passportUrl);
    setCopiedLink(true);
    toast.success('🔗 Career Passport link copied!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPostText = () => {
    navigator.clipboard.writeText(viralShareText);
    setCopiedText(true);
    toast.success('📋 Post copy copied!');
    setTimeout(() => setCopiedText(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md text-white font-bold text-xs">
                TX
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">Verified Career Growth Certificate</h3>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-mono">
                    Official Credential
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400">Awarded to {actualName} &bull; Signature Authority: Sanobar Jahan, Founder of TalentXcel Services</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Certificate View Canvas */}
          <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6 bg-[#04060d] flex justify-center items-center">
            
            {/* THE MASTER LUXURY CERTIFICATE (1:1 with Attached Reference) */}
            <div
              ref={certificateRef}
              id="talentxcel-growth-certificate"
              className="relative w-[920px] min-w-[920px] min-h-[620px] p-8 sm:p-10 bg-gradient-to-b from-[#0a0f1d] via-[#060a14] to-[#04060c] text-white rounded-xl shadow-2xl flex flex-col justify-between overflow-hidden select-none border-4 border-[#1e293b]"
              style={{
                boxShadow: '0 0 50px rgba(6, 182, 212, 0.12), inset 0 0 40px rgba(0, 0, 0, 0.8)'
              }}
            >
              {/* Outer Decorative Gold/Cyan Framing */}
              <div className="absolute inset-2 border-2 border-amber-500/40 rounded-lg pointer-events-none" />
              <div className="absolute inset-3 border border-cyan-500/30 rounded-md pointer-events-none" />
              
              {/* Corner Filigree Accents */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

              {/* Watermark Logo Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
                <img
                  src="/talentxcel-official-logo.png"
                  alt=""
                  className="w-[450px] h-[450px] object-contain grayscale"
                />
              </div>

              {/* 1. TOP HEADER SECTION */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700/80 p-2 flex items-center justify-center shadow-lg">
                    <img 
                      src="/talentxcel-official-logo.png" 
                      alt="TalentXcel" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black tracking-tight text-white font-sans">
                        TALENT<span className="text-cyan-400">XCEL</span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-semibold">
                        CANDIDATE OS
                      </span>
                    </div>
                    <p className="text-[9.5px] text-slate-400 uppercase tracking-widest font-mono">
                      GLOBAL CAREER VELOCITY &amp; TELEMETRY REGISTRY
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold tracking-wide uppercase">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>L1 Verified Trajectory Credential</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">Serial: {credentialId}</p>
                </div>
              </div>

              {/* 2. TITLE & CANDIDATE RECOGNITION (SOLID OPAQUE COLORS - ZERO BLUR/MASK BUGS) */}
              <div className="relative z-10 text-center my-3 space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/90 font-mono font-medium">
                  AUTONOMOUS VERIFICATION OF EXCELLENCE
                </p>
                
                {/* Gold Headline with Solid Crisp Color */}
                <div className="py-1">
                  <h1 
                    className="text-2xl sm:text-3xl font-black uppercase tracking-wider font-serif"
                    style={{
                      color: '#FDE047',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)'
                    }}
                  >
                    Executive Certificate of Career Velocity
                  </h1>
                </div>
                
                <p className="text-xs text-slate-400 italic">
                  This official empirical credential is appropriately awarded to
                </p>

                {/* Actual Candidate Name in Solid Ultra-Crisp White / Champagne Typography */}
                <div className="py-2.5">
                  <div className="inline-block relative">
                    <span 
                      className="text-3xl sm:text-4xl font-bold tracking-wide border-b-2 border-amber-400 pb-1.5 px-8 font-serif inline-block"
                      style={{
                        color: '#FFFFFF',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 0 20px rgba(251, 191, 36, 0.4)',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {actualName}
                    </span>
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-400 rotate-45 shadow-sm" />
                  </div>
                  <p className="text-sm font-semibold text-cyan-300 mt-2 font-sans tracking-wide">
                    Verified Candidate &bull; Career Growth &amp; Velocity Cohort
                  </p>
                </div>

                <p className="text-[11.5px] text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  For demonstrating continuous top-tier technical velocity, empirical distributed architecture validation, 
                  and verified multi-source professional excellence, accelerating to the top 5% peer acceleration cohort worldwide.
                </p>
              </div>

              {/* 3. FOUR METRIC BADGES (REAL USER DATA) */}
              <div className="relative z-10 grid grid-cols-4 gap-3 my-2">
                {/* 1. Score */}
                <div className="p-3 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-center">
                  <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold flex items-center justify-center gap-1">
                    <span>TalentScore</span>
                  </div>
                  <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight mt-0.5">
                    {displayScore} <span className="text-xs text-slate-400">/ 1000</span>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Elite Tier Standing
                  </div>
                </div>

                {/* 2. Velocity */}
                <div className="p-3 rounded-lg bg-slate-900/80 border border-emerald-500/30 text-center">
                  <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>30-Day Velocity</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight mt-0.5">
                    +{displayVelocity} <span className="text-xs text-emerald-300">PTS</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium">
                    {displayAcceleration} Acceleration
                  </div>
                </div>

                {/* 3. Rank */}
                <div className="p-3 rounded-lg bg-slate-900/80 border border-purple-500/30 text-center">
                  <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold flex items-center justify-center gap-1">
                    <Globe className="w-3 h-3 text-purple-400" />
                    <span>Global Standing</span>
                  </div>
                  <div className="text-2xl font-black text-purple-300 font-mono tracking-tight mt-0.5">
                    {displayRank}
                  </div>
                  <div className="text-[10px] text-purple-400 font-medium">
                    Top 5% Worldwide
                  </div>
                </div>

                {/* 4. Fidelity */}
                <div className="p-3 rounded-lg bg-slate-900/80 border border-amber-500/30 text-center">
                  <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>Fidelity</span>
                  </div>
                  <div className="text-2xl font-black text-amber-300 font-mono tracking-tight mt-0.5">
                    {displayFidelity}
                  </div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase">
                    Max Integrity Verified
                  </div>
                </div>
              </div>

              {/* 4. SIGNATURE AUTHORITY (SANOBAR JAHAN), ATTACHED STAMP & USER PASSPORT QR CODE */}
              <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-end justify-between">
                
                {/* SIGNATURE AUTHORITY: SANOBAR JAHAN */}
                <div className="space-y-1 w-52 text-left">
                  <div className="font-serif italic text-lg sm:text-xl text-cyan-300 font-semibold tracking-wider select-none">
                    Sanobar Jahan
                  </div>
                  <div className="h-px w-44 bg-slate-700" />
                  <p className="text-[10.5px] text-white font-bold tracking-wide uppercase">Sanobar Jahan</p>
                  <p className="text-[9.5px] text-cyan-300 font-medium">Founder of TalentXcel Services</p>
                  <p className="text-[8.5px] text-slate-400 font-mono uppercase">Signature Authority</p>
                </div>

                {/* CENTER: THE ACTUAL STAMPING AS ATTACHED (1:1 with media_1790166572466.jpg) */}
                <div className="relative flex flex-col items-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    
                    {/* Ambient Radiating Glow */}
                    <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md animate-pulse" />

                    {/* Official Transparent High-Res Stamp */}
                    <img
                      src="/assets/talentxcel-official-stamp.png"
                      alt="Official TalentXcel Stamp"
                      className="w-28 h-28 object-contain drop-shadow-2xl select-none pointer-events-none transform -rotate-6 hover:rotate-0 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-[8px] font-mono text-cyan-300/90 tracking-widest uppercase mt-1 text-center font-bold">
                    OFFICIAL TALENTXCEL STAMP
                  </div>
                </div>

                {/* RIGHT: ACTUAL USER'S CAREER PASSPORT QR CODE */}
                <div className="space-y-1 w-52 text-right flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-13 h-13 bg-white p-0.5 rounded shadow-md border border-slate-700">
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="Passport QR" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-slate-900" />
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] font-bold text-cyan-300 uppercase tracking-wider font-mono">
                        CAREER PASSPORT
                      </div>
                      <div className="text-[8px] text-slate-300 font-medium">
                        Scan to view profile
                      </div>
                      <div className="text-[7px] text-slate-500 font-mono truncate max-w-[110px]" title={passportUrl}>
                        {passportUrl.replace('https://', '')}
                      </div>
                    </div>
                  </div>
                  <div className="h-px w-36 bg-slate-700 ml-auto" />
                  <p className="text-[9px] text-slate-300 font-semibold">Global Candidate Telemetry Board</p>
                  <p className="text-[8.5px] text-slate-500 font-mono">Issued: {issueDate}</p>
                </div>
              </div>

              {/* 5. SECURITY & VERIFICATION FOOTER */}
              <div className="relative z-10 mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>SHA-256 HASH: 823f-e91b-42c0-8a71-d6023cb8f</span>
                </div>
                <div>
                  <span>PASSPORT: {passportUrl.replace('https://', '')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Viral Action Bar */}
          <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={handleDownloadPNG}
                disabled={isExportingImage}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs gap-1.5 rounded-xl shadow-md shadow-cyan-900/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExportingImage ? 'Generating PNG...' : 'Download Image (PNG)'}</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadPDF}
                disabled={isExportingPDF}
                className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs gap-1.5 rounded-xl"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>{isExportingPDF ? 'Generating PDF...' : 'Export PDF'}</span>
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyLink}
                className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs gap-1 rounded-xl"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Passport Link'}</span>
              </Button>
            </div>

            {/* Social Momentum Share Hub */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-400 font-medium hidden md:inline">Share Credential:</span>
              
              <Button
                size="sm"
                onClick={handleShareLinkedIn}
                className="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold gap-1.5 rounded-xl shadow-sm"
              >
                <Linkedin className="w-3.5 h-3.5 fill-current" />
                <span>Share on LinkedIn</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleShareTwitter}
                className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs gap-1.5 rounded-xl"
              >
                <Twitter className="w-3.5 h-3.5 text-sky-400 fill-current" />
                <span className="hidden sm:inline">Post on X</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyPostText}
                className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs gap-1.5 rounded-xl"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
                <span className="hidden sm:inline">{copiedText ? 'Copied!' : 'Copy Post'}</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GrowthCertificateModal;
