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
  Award, 
  ExternalLink,
  Edit3,
  FileText,
  Users,
  TrendingUp,
  Globe,
  Upload,
  RefreshCw,
  Camera
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface GrowthCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName?: string;
  role?: string;
  company?: string;
  avatarUrl?: string;
  score?: number;
  velocity?: number;
  acceleration?: string;
  globalRank?: string;
  telemetryFidelity?: string;
  specialization?: string;
  username?: string;
}

export const GrowthCertificateModal: React.FC<GrowthCertificateModalProps> = ({
  isOpen,
  onClose,
  candidateName = 'Arshid Hussain Wani',
  role: initialRole = 'Vice President, Operations',
  company: initialCompany = 'TalentXcel Services',
  avatarUrl: initialAvatar = '/assets/candidate-avatar-default.jpg',
  score = 823,
  velocity = 66,
  acceleration = '+8.2%',
  globalRank = '#853',
  telemetryFidelity = '98%',
  specialization = 'Operations & Global Talent Architecture',
  username: initialUsername
}) => {
  const { user } = useOptimizedAuth();
  const certificateRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(candidateName);
  const [role, setRole] = useState(initialRole);
  const [company, setCompany] = useState(initialCompany);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [passportUsername, setPassportUsername] = useState(initialUsername || user?.id || 'arshid-wani');
  
  const [isEditing, setIsEditing] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const issueDate = 'September 23, 2026';
  const passportUrl = `https://talentxcel.in/passport/${passportUsername}`;

  // Fetch real profile information if available
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, title, company, avatar_url, username')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          if (data.full_name && candidateName === 'Arshid Hussain Wani') setName(data.full_name);
          if (data.title && initialRole === 'Vice President, Operations') setRole(data.title);
          if (data.company && initialCompany === 'TalentXcel Services') setCompany(data.company);
          if (data.avatar_url) setAvatar(data.avatar_url);
          if (data.username) setPassportUsername(data.username);
        }
      } catch (err) {
        console.warn('Profile fetch for certificate:', err);
      }
    };
    loadProfile();
  }, [user]);

  // Generate QR Code with centered TalentXcel emblem
  useEffect(() => {
    const generatePassportQR = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;

        await QRCode.toCanvas(canvas, passportUrl, {
          width: 256,
          margin: 1,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#0F1E36',
            light: '#FFFFFF',
          },
        });

        const ctx = canvas.getContext('2d');
        if (ctx) {
          const center = 128;
          const radius = 22;

          // Outer white circular cushion
          ctx.beginPath();
          ctx.arc(center, center, radius + 3, 0, 2 * Math.PI);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          // Brand gradient circle
          const grad = ctx.createLinearGradient(center - radius, center - radius, center + radius, center + radius);
          grad.addColorStop(0, '#1D4ED8');
          grad.addColorStop(1, '#0284C7');
          ctx.beginPath();
          ctx.arc(center, center, radius, 0, 2 * Math.PI);
          ctx.fillStyle = grad;
          ctx.fill();

          // Inner white ring
          ctx.beginPath();
          ctx.arc(center, center, radius - 4, 0, 2 * Math.PI);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Text 'TX'
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('TX', center, center);
        }

        setQrCodeUrl(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('QR Code generation error:', err);
      }
    };

    generatePassportQR();
  }, [passportUrl]);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatar(previewUrl);
      toast.success('Certificate photo updated!');
    }
  };

  const viralShareText = `🌟 Honored to receive the Certified Global Career Leader recognition from TalentXcel!

Recognizing excellence in driving global talent opportunities and creating a more inclusive, skill-driven future for millions.

🏆 Verified Standing:
• Standing: Elite Tier (Top Global Talent)
• Growth Momentum: +${velocity} (Ahead of the Curve)
• Global Standing: ${globalRank} (Top Talent Worldwide)
• Trust & Reliability: ${telemetryFidelity}

Scan the QR code or view my live Career Passport profile:
${passportUrl}

#TalentXcel #CareerLeader #GlobalTalent #CareerPassport #ProfessionalExcellence`;

  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;
    setIsExportingImage(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FCFAF6',
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `TalentXcel-Global-Career-Leader-${name.replace(/\s+/g, '_')}.png`;
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

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsExportingPDF(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FCFAF6',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`TalentXcel-Global-Career-Leader-${name.replace(/\s+/g, '_')}.pdf`);

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
    toast.success('📋 Post copy copied to clipboard! Opening LinkedIn...');
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(passportUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const tweetText = `Honored to receive the Certified Global Career Leader recognition on @TalentXcel! 🌟 Check out my verified Career Passport: ${passportUrl} #TalentXcel #CareerGrowth`;
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
    toast.success('📋 Post text copied!');
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
          {/* Modal Header Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-md text-white font-bold text-xs">
                TX
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">Official Global Career Leader Certificate</h3>
                  <Badge className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] uppercase font-mono">
                    Verified Credential
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400">Honoring excellence in empowering global talent & transforming lives</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isEditing ? 'Done Editing' : 'Customize Certificate'}</span>
              </Button>

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

          {/* Quick Customization Row */}
          {isEditing && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 py-3 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center gap-4 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Name:</span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-7 w-44 text-xs bg-slate-800 border-slate-700 text-white"
                  placeholder="Full Name"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Role:</span>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-7 w-48 text-xs bg-slate-800 border-slate-700 text-white"
                  placeholder="Role / Title"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Company:</span>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-7 w-40 text-xs bg-slate-800 border-slate-700 text-white"
                  placeholder="Organization"
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 text-xs gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-500" />
                  <span>Change Photo</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Certificate View Container */}
          <div className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-6 bg-[#04060d] flex justify-center items-center">
            
            {/* THE MASTER LUXURY CERTIFICATE CANVAS (Matching Uploaded Design 1:1) */}
            <div
              ref={certificateRef}
              id="talentxcel-growth-certificate"
              className="relative w-[940px] min-w-[940px] min-h-[640px] p-8 sm:p-10 bg-[#FAF8F5] text-[#0F1E36] shadow-2xl flex flex-col justify-between overflow-hidden select-none"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45), inset 0 0 80px rgba(230, 220, 205, 0.35)'
              }}
            >
              {/* Outer Elegant Gold Frame */}
              <div className="absolute inset-2 border-[1.5px] border-[#C5A880] pointer-events-none" />
              {/* Inset Double Fine Border */}
              <div className="absolute inset-3 border-[0.75px] border-[#C5A880]/70 pointer-events-none" />

              {/* Classic Corner Filigree / Accent Brackets */}
              <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#A27B3D] pointer-events-none" />
              <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#A27B3D] pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#A27B3D] pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#A27B3D] pointer-events-none" />

              {/* Background World Map Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.09] pointer-events-none select-none overflow-hidden">
                <img 
                  src="/assets/world-map-watermark.svg" 
                  alt="" 
                  className="w-[92%] h-[92%] object-contain" 
                />
              </div>

              {/* 1. TOP HEADER SECTION */}
              <div className="relative z-10 flex items-start justify-between">
                {/* Brand Logo & Slogan */}
                <div className="flex items-center gap-3">
                  {/* TalentXcel Official Circular Icon */}
                  <div className="w-10 h-10 rounded-full bg-white border border-[#C5A880]/60 p-1 flex items-center justify-center shadow-sm">
                    <img 
                      src="/talentxcel-official-logo.png" 
                      alt="TalentXcel" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-[#0F1E36] font-sans">
                      Talent<span className="text-[#0284C7]">Xcel</span>
                    </h2>
                    <p className="text-[8.5px] tracking-[0.26em] text-[#64748B] font-semibold uppercase mt-0.5">
                      PEOPLE &nbsp;|&nbsp; OPPORTUNITIES &nbsp;|&nbsp; PROGRESS
                    </p>
                  </div>
                </div>

                {/* Right Top Header Taglines */}
                <div className="text-right">
                  <p className="text-[9.5px] font-bold tracking-[0.24em] text-[#1E293B] uppercase">
                    A GLOBAL PHENOMENON
                  </p>
                  <p className="text-[8.5px] font-medium tracking-[0.16em] text-[#A27B3D] uppercase mt-0.5">
                    EMPOWERING TALENT. TRANSFORMING LIVES.
                  </p>
                  <div className="w-14 h-[1.5px] bg-[#C5A880] ml-auto mt-1" />
                </div>
              </div>

              {/* 2. MAJESTIC TITLE BANNER */}
              <div className="relative z-10 text-center my-2 space-y-1">
                <p className="text-[11px] font-semibold tracking-[0.45em] text-[#A27B3D] uppercase">
                  C &nbsp;E &nbsp;R &nbsp;T &nbsp;I &nbsp;F &nbsp;I &nbsp;E &nbsp;D
                </p>
                <h1 className="text-3xl sm:text-[36px] font-bold uppercase tracking-wider text-[#0F2347] font-serif">
                  GLOBAL CAREER LEADER
                </h1>
                <p className="text-[9px] font-medium tracking-[0.22em] text-[#64748B] uppercase">
                  RECOGNIZING EXCELLENCE IN DRIVING OPPORTUNITIES WORLDWIDE
                </p>
              </div>

              {/* 3. HERO CANDIDATE & QR CODE SECTION */}
              <div className="relative z-10 grid grid-cols-12 gap-6 items-center my-2">
                
                {/* Left: Photo + Candidate Recognition Block */}
                <div className="col-span-8 flex items-center gap-5">
                  {/* Photo Frame in Gold Border */}
                  <div className="w-[124px] h-[138px] border-2 border-[#C5A880] p-1 bg-white shadow-sm flex-shrink-0 relative">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-full h-full object-cover object-top"
                      onError={() => setAvatar('/assets/avatar-placeholder.png')}
                    />
                  </div>

                  {/* Candidate Designation & Citation */}
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold font-serif text-[#0F2347] tracking-tight leading-tight">
                      {name}
                    </h2>
                    <p className="text-sm font-semibold text-[#334155]">
                      {role}
                    </p>
                    <p className="text-sm font-medium text-[#64748B]">
                      {company}
                    </p>
                    <p className="text-xs text-[#475569] leading-relaxed pt-2 max-w-md font-normal">
                      For outstanding contribution in enabling global talent opportunities 
                      and creating a more inclusive, skill-driven future for millions.
                    </p>
                  </div>
                </div>

                {/* Right: Career Passport QR Code */}
                <div className="col-span-4 flex flex-col items-center justify-center text-center pl-4 border-l border-slate-200/80">
                  <div className="w-[108px] h-[108px] bg-white p-1 border border-slate-200 rounded shadow-sm relative flex items-center justify-center">
                    {qrCodeUrl ? (
                      <img 
                        src={qrCodeUrl} 
                        alt="Career Passport QR" 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400 font-mono">
                        Generating...
                      </div>
                    )}
                  </div>
                  <span className="text-[9.5px] font-bold text-[#0F2347] tracking-wider uppercase mt-1.5 font-sans">
                    SCAN TO VIEW PROFILE
                  </span>
                  <span className="text-[8.5px] text-[#64748B] font-medium">
                    Connect &middot; Collaborate &middot; Create Opportunities
                  </span>
                  <span className="text-[9px] text-[#475569] italic mt-1 font-serif">
                    &ldquo;A world of opportunities begins with people.&rdquo;
                  </span>
                </div>
              </div>

              {/* 4. FOUR KEY PILLARS / METRICS (NO TECHNICAL JARGON) */}
              <div className="relative z-10 grid grid-cols-4 divide-x divide-slate-200/80 bg-white/70 backdrop-blur-xs border border-slate-200/80 rounded-lg py-2.5 my-2 shadow-xs">
                {/* Metric 1 */}
                <div className="text-center px-2">
                  <div className="w-8 h-8 rounded-full bg-[#EBF3FC] text-[#1D4ED8] flex items-center justify-center mx-auto mb-1 shadow-xs">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-[#0F2347] tracking-tight">
                    {score}
                  </div>
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#1E293B] mt-0.5">
                    ELITE TIER STANDING
                  </div>
                  <div className="text-[8.5px] text-[#64748B]">
                    Among Global Talent
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="text-center px-2">
                  <div className="w-8 h-8 rounded-full bg-[#EBF3FC] text-[#1D4ED8] flex items-center justify-center mx-auto mb-1 shadow-xs">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-[#0F2347] tracking-tight">
                    +{velocity}
                  </div>
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#1E293B] mt-0.5">
                    GROWTH MOMENTUM
                  </div>
                  <div className="text-[8.5px] text-[#64748B]">
                    Ahead of the Curve
                  </div>
                </div>

                {/* Metric 3 */}
                <div className="text-center px-2">
                  <div className="w-8 h-8 rounded-full bg-[#EBF3FC] text-[#1D4ED8] flex items-center justify-center mx-auto mb-1 shadow-xs">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-[#0F2347] tracking-tight">
                    {globalRank}
                  </div>
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#1E293B] mt-0.5">
                    GLOBAL STANDING
                  </div>
                  <div className="text-[8.5px] text-[#64748B]">
                    Top Talent Worldwide
                  </div>
                </div>

                {/* Metric 4 */}
                <div className="text-center px-2">
                  <div className="w-8 h-8 rounded-full bg-[#EBF3FC] text-[#1D4ED8] flex items-center justify-center mx-auto mb-1 shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xl font-black text-[#0F2347] tracking-tight">
                    {telemetryFidelity}
                  </div>
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-[#1E293B] mt-0.5">
                    TRUST & RELIABILITY
                  </div>
                  <div className="text-[8.5px] text-[#64748B]">
                    People Trust Our Impact
                  </div>
                </div>
              </div>

              {/* 5. SIGN-OFF, AUTHENTIC SEAL & SIGNATURE ROW */}
              <div className="relative z-10 pt-3 flex items-end justify-between">
                
                {/* Date of Issue */}
                <div className="text-left w-44">
                  <div className="text-xs font-semibold text-[#1E293B]">
                    {issueDate}
                  </div>
                  <div className="w-32 h-[1px] bg-slate-300 my-1" />
                  <p className="text-[8.5px] font-bold tracking-[0.2em] text-[#64748B] uppercase">
                    DATE OF ISSUE
                  </p>
                </div>

                {/* Signatory Center */}
                <div className="text-center w-56">
                  <div className="h-9 flex items-center justify-center mb-0.5">
                    <img 
                      src="/assets/signature-sample.png" 
                      alt="Signature" 
                      className="h-8 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="w-48 h-[1px] bg-slate-300 my-1 mx-auto" />
                  <p className="text-[9.5px] font-bold uppercase tracking-wider text-[#0F2347]">
                    ARSHID HUSSAIN WANI
                  </p>
                  <p className="text-[8.5px] font-semibold uppercase tracking-wide text-[#475569]">
                    VICE PRESIDENT, OPERATIONS
                  </p>
                  <p className="text-[8px] font-medium uppercase tracking-wider text-[#64748B]">
                    TALENTXCEL SERVICES
                  </p>
                </div>

                {/* The Authentic Circular Seal (Matching Reference Image 2) */}
                <div className="text-right w-44 flex justify-end items-center">
                  <div 
                    className="relative w-28 h-28 flex items-center justify-center transform -rotate-12 select-none pointer-events-none"
                    title="Official TalentXcel Global Talent Seal"
                  >
                    <img 
                      src="/assets/talentxcel-official-seal.png" 
                      alt="TalentXcel Official Seal" 
                      className="w-full h-full object-contain drop-shadow-xs" 
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 6. BOTTOM FOOTER RIBBON */}
              <div className="relative z-10 pt-2 border-t border-[#C5A880]/60 flex items-center justify-between text-[8.5px]">
                <div className="flex items-center gap-1.5 font-bold tracking-wider text-[#1E293B] uppercase">
                  <span className="w-3.5 h-[1.5px] bg-[#A27B3D] inline-block" />
                  <span>GLOBAL TALENT. REAL IMPACT.</span>
                </div>

                <div className="tracking-[0.24em] text-[#64748B] uppercase font-semibold hidden sm:block">
                  SKILLS &nbsp;|&nbsp; CAREERS &nbsp;|&nbsp; OPPORTUNITIES &nbsp;|&nbsp; A BRIGHTER TOMORROW
                </div>

                <div className="font-mono font-medium text-[#1E293B] text-[9.5px]">
                  www.talentxcel.in
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Action & Viral Share Bar */}
          <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/95 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                onClick={handleDownloadPNG}
                disabled={isExportingImage}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs gap-1.5 rounded-xl shadow-md shadow-blue-900/30"
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

            {/* Viral Share Links */}
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
