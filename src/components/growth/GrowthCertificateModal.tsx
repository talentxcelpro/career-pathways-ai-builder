import React, { useState, useRef } from 'react';
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
  Award, 
  ExternalLink,
  Edit3,
  FileText,
  Flame,
  Globe
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface GrowthCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
  score?: number;
  velocity?: number;
  acceleration?: string;
  globalRank?: string;
  telemetryFidelity?: string;
  specialization?: string;
}

export const GrowthCertificateModal: React.FC<GrowthCertificateModalProps> = ({
  isOpen,
  onClose,
  candidateName = 'Arshid Wani',
  score = 823,
  velocity = 66,
  acceleration = '+8.2%',
  globalRank = '#853',
  telemetryFidelity = '98%',
  specialization = 'Principal Distributed Systems & Cloud Architecture'
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState(candidateName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const credentialId = `TXC-GRW-${score}-9481X`;
  const issueDate = 'September 23, 2026';
  const verificationUrl = `${window.location.origin}/grow?verify=${credentialId}`;

  const viralShareText = `🚀 Honored to receive the TalentXcel Verified Career Growth Certificate!

Through continuous autonomous telemetry, I\'ve accelerated my TalentScore to ${score} (Elite Tier • Top 8% Worldwide) with a 30-day velocity of +${velocity} points (${acceleration} acceleration).

📊 Verified Telemetry Highlights:
• Active TalentScore: ${score} / 1000 (Elite Tier)
• Global Standing: ${globalRank} in Systems & Cloud
• 30-Day Velocity: +${velocity} PTS (${acceleration})
• Telemetry Fidelity: ${telemetryFidelity} (Multi-source verified)

Verify credential: ${verificationUrl}

#TalentXcel #CareerGrowth #TechLeadership #DistributedSystems #TalentScore`;

  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;
    setIsExportingImage(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#070b14',
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `TalentXcel-Growth-Certificate-${score}-${name.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('🎉 High-Resolution Growth Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error generating certificate image:', error);
      toast.error('Failed to export certificate image. Please try again.');
    } finally {
      setIsExportingImage(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsExportingPDF(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#070b14',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`TalentXcel-Growth-Certificate-${score}-${name.replace(/\s+/g, '_')}.pdf`);

      toast.success('📄 Executive PDF Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error generating certificate PDF:', error);
      toast.error('Failed to export certificate PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleShareLinkedIn = () => {
    navigator.clipboard.writeText(viralShareText);
    toast.success('📋 Viral post copy copied to clipboard! Opening LinkedIn...');
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verificationUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const tweetText = `🚀 Reached a TalentScore of ${score} (Top 8% Worldwide) with +${velocity} pts 30-day velocity on @TalentXcel! Check out my verified growth credential: ${verificationUrl} #TalentXcel #TechLeadership`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    toast.success('🔗 Credential verification link copied!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPostText = () => {
    navigator.clipboard.writeText(viralShareText);
    setCopiedText(true);
    toast.success('📋 Viral momentum post text copied!');
    setTimeout(() => setCopiedText(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
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
                <p className="text-[11px] text-slate-400">Cryptographically signed & verified under TalentXcel Candidate OS</p>
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

          {/* Certificate View Area */}
          <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6 bg-[#04060d] flex flex-col items-center">
            
            {/* Customizer row */}
            <div className="w-full max-w-4xl flex items-center justify-between gap-3 mb-4 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <span>Certificate Recipient:</span>
                {isEditingName ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-7 w-48 text-xs bg-slate-900 border-slate-700 text-white"
                      placeholder="Candidate Name"
                      autoFocus
                    />
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      onClick={() => setIsEditingName(false)} 
                      className="h-7 px-2 text-[11px]"
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2"
                  >
                    <span>{name}</span>
                    <Edit3 className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-[11px] font-mono">ID: {credentialId}</span>
              </div>
            </div>

            {/* THE MASTER CERTIFICATE CANVAS */}
            <div
              ref={certificateRef}
              id="talentxcel-growth-certificate"
              className="relative w-[920px] min-h-[620px] p-10 bg-gradient-to-b from-[#0a0f1d] via-[#060a14] to-[#04060c] text-white rounded-xl shadow-2xl flex flex-col justify-between overflow-hidden select-none border-4 border-[#1e293b]"
              style={{
                boxShadow: '0 0 50px rgba(6, 182, 212, 0.12), inset 0 0 40px rgba(0, 0, 0, 0.8)'
              }}
            >
              {/* Outer Decorative Gold/Cyan Framing */}
              <div className="absolute inset-2 border-2 border-amber-500/40 rounded-lg pointer-events-none" />
              <div className="absolute inset-3 border border-cyan-500/30 rounded-md pointer-events-none" />
              
              {/* Corner Rosettes / Filigree Accents */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

              {/* Watermark Logo Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <img
                  src="/talentxcel-official-logo.png"
                  alt="TalentXcel Watermark"
                  className="w-[450px] h-[450px] object-contain grayscale"
                />
              </div>

              {/* Top Section: Official Brand & Registration Header */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 p-2 flex items-center justify-center shadow-lg">
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
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                      GLOBAL CAREER VELOCITY & TELEMETRY REGISTRY
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

              {/* Certificate Title & Presentation */}
              <div className="relative z-10 text-center my-4 space-y-2">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80 font-mono">
                  Autonomous Verification of Excellence
                </p>
                
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 font-serif drop-shadow-sm">
                  Executive Certificate of Career Velocity
                </h1>
                
                <p className="text-xs text-slate-400 italic">
                  This official empirical credential is appropriately awarded to
                </p>

                {/* Candidate Name in Big Glowing Type */}
                <div className="py-2">
                  <div className="inline-block relative">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-wide border-b-2 border-amber-400/70 pb-1 px-6 font-serif">
                      {name}
                    </span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-400 rotate-45" />
                  </div>
                  <p className="text-xs font-semibold text-cyan-400 mt-2 font-mono tracking-wide">
                    {specialization}
                  </p>
                </div>

                <p className="text-[11px] text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  For demonstrating continuous top-tier technical velocity, empirical distributed architecture validation, 
                  and verified multi-source executive leadership, accelerating to the top 5% peer acceleration cohort worldwide.
                </p>
              </div>

              {/* 4 Telemetry Invariant Badges */}
              <div className="relative z-10 grid grid-cols-4 gap-3 my-2">
                {/* 1. Score */}
                <div className="p-3 rounded-lg bg-slate-900/80 border border-cyan-500/30 text-center">
                  <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold flex items-center justify-center gap-1">
                    <span>TalentScore</span>
                  </div>
                  <div className="text-2xl font-black text-cyan-300 font-mono tracking-tight mt-0.5">
                    {score} <span className="text-xs text-slate-400">/ 1000</span>
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
                    +{velocity} <span className="text-xs text-emerald-300">PTS</span>
                  </div>
                  <div className="text-[10px] text-slate-300 font-medium">
                    {acceleration} Acceleration
                  </div>
                </div>

                {/* 3. Rank */}
                <div className="p-3 rounded-lg bg-slate-900/80 border border-purple-500/30 text-center">
                  <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold flex items-center justify-center gap-1">
                    <Globe className="w-3 h-3 text-purple-400" />
                    <span>Global Standing</span>
                  </div>
                  <div className="text-2xl font-black text-purple-300 font-mono tracking-tight mt-0.5">
                    {globalRank}
                  </div>
                  <div className="text-[10px] text-purple-400 font-medium">
                    Top 8% Worldwide
                  </div>
                </div>

                {/* 4. Fidelity */}
                <div className="p-3 rounded-lg bg-slate-900/80 border border-amber-500/30 text-center">
                  <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-400" />
                    <span>Fidelity</span>
                  </div>
                  <div className="text-2xl font-black text-amber-300 font-mono tracking-tight mt-0.5">
                    {telemetryFidelity}
                  </div>
                  <div className="text-[10px] text-amber-400 font-bold uppercase">
                    Max Integrity Verified
                  </div>
                </div>
              </div>

              {/* Bottom Row: Signatures, The Official Holographic Gold Seal & Cryptographic Stamp */}
              <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-end justify-between">
                
                {/* Authority Signature 1 */}
                <div className="space-y-1 w-48 text-left">
                  <div className="font-serif italic text-base text-cyan-300 font-semibold tracking-wider select-none">
                    Dr. Eric Vance
                  </div>
                  <div className="h-px w-36 bg-slate-700" />
                  <p className="text-[10px] text-slate-300 font-semibold">Autonomous Telemetry Director</p>
                  <p className="text-[9px] text-slate-500 font-mono">TalentXcel Core AI Lab</p>
                </div>

                {/* THE GOLD VERIFICATION SEAL & STAMP */}
                <div className="relative flex flex-col items-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    
                    {/* Outer Radiating Gold Glow */}
                    <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-lg animate-pulse" />

                    {/* SVG Metallic Gold Starburst Seal */}
                    <svg viewBox="0 0 160 160" className="w-28 h-28 drop-shadow-2xl">
                      <defs>
                        <radialGradient id="goldSealGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#FFFBEB" />
                          <stop offset="35%" stopColor="#FBBF24" />
                          <stop offset="70%" stopColor="#D97706" />
                          <stop offset="100%" stopColor="#78350F" />
                        </radialGradient>
                        <linearGradient id="goldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FDE68A" />
                          <stop offset="50%" stopColor="#B45309" />
                          <stop offset="100%" stopColor="#F59E0B" />
                        </linearGradient>
                      </defs>

                      {/* 32-point Starburst Outer Rim */}
                      <path
                        d="M 80,0 L 87,14 L 102,5 L 105,21 L 122,16 L 120,32 L 137,33 L 130,49 L 147,54 L 137,68 L 152,78 L 138,89 L 150,102 L 133,110 L 142,125 L 124,129 L 129,145 L 112,144 L 112,160 L 97,154 L 92,168 L 80,158 L 68,168 L 63,154 L 48,160 L 48,144 L 31,145 L 36,129 L 18,125 L 27,110 L 10,102 L 22,89 L 8,78 L 23,68 L 13,54 L 30,49 L 23,33 L 40,32 L 38,16 L 55,21 L 58,5 L 73,14 Z"
                        fill="url(#goldSealGrad)"
                        stroke="url(#goldRimGrad)"
                        strokeWidth="1.5"
                      />

                      {/* Concentric Golden Ring */}
                      <circle cx="80" cy="80" r="54" fill="#0b1329" stroke="url(#goldRimGrad)" strokeWidth="2.5" />
                      <circle cx="80" cy="80" r="49" fill="none" stroke="#FDE68A" strokeWidth="0.8" strokeDasharray="3 2" />

                      {/* Seal Inner Crest */}
                      <g transform="translate(80, 80)">
                        <path
                          d="M -16,-12 C -8,-22 8,-22 16,-12 C 16,10 0,22 0,22 C 0,22 -16,10 -16,-12 Z"
                          fill="url(#goldSealGrad)"
                          opacity="0.9"
                        />
                        <text
                          y="-2"
                          textAnchor="middle"
                          fill="#78350F"
                          fontSize="7"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          VERIFIED
                        </text>
                        <text
                          y="7"
                          textAnchor="middle"
                          fill="#78350F"
                          fontSize="6"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          2026
                        </text>
                        <text
                          y="14"
                          textAnchor="middle"
                          fill="#78350F"
                          fontSize="5"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          GOLD SEAL
                        </text>
                      </g>
                    </svg>
                  </div>
                  <div className="text-[8px] font-mono text-amber-300/90 tracking-widest uppercase mt-0.5 text-center font-bold">
                    OFFICIAL TALENTXCEL SEAL
                  </div>
                </div>

                {/* Authority Signature 2 & QR Telemetry Hash */}
                <div className="space-y-1 w-48 text-right">
                  <div className="font-serif italic text-base text-amber-300 font-semibold tracking-wider select-none">
                    Executive Registry
                  </div>
                  <div className="h-px w-36 bg-slate-700 ml-auto" />
                  <p className="text-[10px] text-slate-300 font-semibold">Global Candidate Telemetry Board</p>
                  <p className="text-[9px] text-slate-500 font-mono">Issued: {issueDate}</p>
                </div>
              </div>

              {/* Security & Verification Footer strip */}
              <div className="relative z-10 mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>SHA-256 HASH: 823f-e91b-42c0-8a71-d6023cb8f</span>
                </div>
                <div>
                  <span>VERIFICATION URL: talentxcel.in/grow?verify={credentialId}</span>
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
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </Button>
            </div>

            {/* Viral Momentum Share Hub */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-400 font-medium hidden md:inline">Viral Momentum:</span>
              
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
