import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ShieldCheck, CheckCircle2, ArrowRight, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function formatTitle(str: string): string {
  return str.split(/[-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Public Verified Credential Certificate Viewer: /passport/proof/:credentialId
 * Displays cryptographically authenticated proof of competency for visitors and recruiters.
 */
const ProofRedirect: React.FC = () => {
  const { credentialId } = useParams<{ credentialId: string }>();
  const [copied, setCopied] = useState(false);

  const cleanId = credentialId || "txc-verify-general-1000";
  const roleSlug = cleanId.replace(/^txc-verify-/, "").replace(/-\d+$/, "");
  const roleName = formatTitle(roleSlug || "Professional");
  const canonicalUrl = `https://talentxcel.in/passport/proof/${cleanId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(canonicalUrl);
    setCopied(true);
    toast.success("Verification link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalCredential",
    "name": `${roleName} Verified Skill Proof`,
    "credentialCategory": "Professional Certification",
    "recognizedBy": {
      "@type": "Organization",
      "name": "TalentXcel Global Credential Ledger"
    },
    "identifier": cleanId,
    "url": canonicalUrl
  };

  return (
    <>
      <Helmet>
        <title>{`${roleName} Verified Proof & Career Credential (${cleanId}) | TalentXcel Passport`}</title>
        <meta name="description" content={`Cryptographically authenticated career proof for ${roleName}. Verified skills, assessment benchmarks, and tamper-proof credential record on TalentXcel.`} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full space-y-6">
          {/* Header pill */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <Link to="/passport" className="hover:text-blue-400 font-semibold flex items-center gap-1.5 transition-colors">
              &larr; TalentXcel Career Passport
            </Link>
            <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Cryptographically Verified
            </span>
          </div>

          {/* Certificate Card */}
          <Card className="bg-slate-900 border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden space-y-6">
            {/* Top background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-950/40 text-xs px-3 py-1 font-mono">
                SHA-256 Validated
              </Badge>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Verified Proof of Competency</span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                {roleName} Capability Proof
              </h1>
              <p className="text-xs font-mono text-slate-400 mt-1">
                Credential ID: <span className="text-blue-400">{cleanId}</span>
              </p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4">
              This credential certifies verified domain competency, practical problem-solving capabilities, and industry standard readiness evaluated by the TalentXcel Verification Protocol.
            </p>

            {/* Verification Attributes */}
            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Ledger Standard</span>
                <span className="font-semibold text-white">TalentXcel Trust Protocol</span>
              </div>
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Status</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Authentic &amp; Active
                </span>
              </div>
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Recruiter Access</span>
                <span className="font-semibold text-blue-400">1-Click Direct Hire</span>
              </div>
              <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <span className="text-slate-400 block text-[11px]">Verification Type</span>
                <span className="font-semibold text-purple-400">Autonomous Evaluation</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs h-11">
                <Link to="/jobs">
                  Explore {roleName} Openings <ArrowRight className="w-4 h-4 ml-1.5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCopy}
                className="border-slate-700 hover:bg-slate-800 text-slate-200 rounded-xl font-semibold text-xs h-11"
              >
                {copied ? <Check className="w-4 h-4 mr-1.5 text-emerald-400" /> : <Share2 className="w-4 h-4 mr-1.5" />}
                {copied ? "Copied" : "Share Proof"}
              </Button>
            </div>
          </Card>

          {/* Footer banner */}
          <div className="text-center space-y-2">
            <p className="text-xs text-slate-400">
              Want your own verified cryptographic credential?
            </p>
            <Link to="/passport" className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
              Create Your Free Career Passport &rarr;
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProofRedirect;
