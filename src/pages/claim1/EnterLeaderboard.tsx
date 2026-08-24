import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  Circle,
  Globe,
  Building2,
  Package,
  User,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Upload,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  MessageSquare,
  Loader2,
  MapPin,
  Calendar,
  Users,
} from 'lucide-react';
import { useClaimProfile, useFounding100Count, useAvailableScopes, useMyEntities } from '@/hooks/useClaim1';
import { generateSlug, isSlugTaken, uploadEntityLogo } from '@/services/claim1Service';
import type { Claim1EntityType, Claim1Scope } from '@/types/claim1';
import { toast } from 'sonner';

const COUNTRY_OPTIONS = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'AE', name: 'UAE' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'SG', name: 'Singapore' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'OTHER', name: 'Other' },
];

const ENTITY_TYPES: { value: Claim1EntityType; label: string; icon: React.ReactNode }[] = [
  { value: 'company',  label: 'Company',  icon: <Building2 className="w-5 h-5" /> },
  { value: 'product',  label: 'Product',  icon: <Package className="w-5 h-5" /> },
  { value: 'service',  label: 'Service',  icon: <Globe className="w-5 h-5" /> },
  { value: 'person',   label: 'Person',   icon: <User className="w-5 h-5" /> },
];

export default function EnterLeaderboard() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const claimMutation = useClaimProfile();
  const { data: foundingCount = 0 } = useFounding100Count();
  const { data: scopes = [], isLoading: scopesLoading } = useAvailableScopes();
  const { data: myEntities = [] } = useMyEntities();

  const [step, setStep]                   = useState(1);
  const [name, setName]                   = useState('');
  const [slug, setSlug]                   = useState('');
  const [slugTaken, setSlugTaken]         = useState(false);
  const [slugChecking, setSlugChecking]   = useState(false);
  const [entityType, setEntityType]       = useState<Claim1EntityType>('company');
  const [tagline, setTagline]             = useState('');
  const [websiteUrl, setWebsiteUrl]       = useState('');
  const [logoUrl, setLogoUrl]             = useState('');
  const [description, setDescription]     = useState('');
  const [countryCode, setCountryCode]     = useState('IN');
  const [countryName, setCountryName]     = useState('India');
  const [city, setCity]                   = useState('');
  const [companySize, setCompanySize]     = useState('');
  const [foundedYear, setFoundedYear]     = useState('');
  const [twitter, setTwitter]             = useState('');
  const [linkedin, setLinkedin]           = useState('');
  const [github, setGithub]               = useState('');
  const [youtube, setYoutube]             = useState('');
  const [discord, setDiscord]             = useState('');
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFoundingEligible = foundingCount < 100;
  const remainingFoundingSlots = Math.max(0, 100 - foundingCount);

  // Default select global scope once scopes load
  useEffect(() => {
    if (scopes.length > 0 && selectedScopes.length === 0) {
      const globalScope = scopes.find((s) => s.scope_type === 'global') || scopes[0];
      if (globalScope) setSelectedScopes([globalScope.id]);
    }
  }, [scopes, selectedScopes.length]);

  // Auto-generate slug from name (debounced)
  useEffect(() => {
    if (!name) { setSlug(''); return; }
    const generated = generateSlug(name);
    setSlug(generated);
  }, [name]);

  // Check slug availability (debounced 600ms)
  const checkSlug = useCallback(async (s: string) => {
    if (!s) return;
    setSlugChecking(true);
    try {
      const taken = await isSlugTaken(s, user?.id);
      setSlugTaken(taken);
    } finally {
      setSlugChecking(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!slug) return;
    const timer = setTimeout(() => checkSlug(slug), 600);
    return () => clearTimeout(timer);
  }, [slug, checkSlug]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const url = await uploadEntityLogo(file, slug || 'company');
      setLogoUrl(url);
      toast.success('Logo uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const toggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((id) => id !== scopeId) : [...prev, scopeId]
    );
  };

  const handleCountryChange = (code: string) => {
    setCountryCode(code === 'OTHER' ? '' : code);
    setCountryName(COUNTRY_OPTIONS.find((c) => c.code === code)?.name ?? '');
  };

  const step1Valid = name.trim().length >= 2 && slug.length >= 2 && !slugTaken && !slugChecking;
  const step2Valid = selectedScopes.length > 0;

  const handleSubmit = async () => {
    if (!step1Valid || !step2Valid) return;

    const social_links: Record<string, string> = {};
    if (twitter.trim())   social_links.twitter = twitter.trim();
    if (linkedin.trim())  social_links.linkedin = linkedin.trim();
    if (github.trim())    social_links.github = github.trim();
    if (youtube.trim())   social_links.youtube = youtube.trim();
    if (discord.trim())   social_links.discord = discord.trim();

    const result = await claimMutation.mutateAsync({
      name:         name.trim(),
      slug,
      entity_type:  entityType,
      website_url:  websiteUrl || undefined,
      logo_url:     logoUrl    || undefined,
      description:  description|| undefined,
      tagline:      tagline    || undefined,
      city:         city       || undefined,
      country_code: countryCode|| undefined,
      country_name: countryName|| undefined,
      company_size: companySize|| undefined,
      founded_year: foundedYear ? parseInt(foundedYear, 10) : undefined,
      social_links: Object.keys(social_links).length > 0 ? social_links : undefined,
      scope_ids:    selectedScopes,
    });
    if (result) navigate('/claim1/dashboard');
  };

  const scopeLabel = (scope: Claim1Scope) => {
    if (scope.scope_type === 'global')   return '🌍 Global';
    if (scope.scope_type === 'emerging') return '✨ Emerging AI Products';
    return `${scope.country_name || scope.slug}`;
  };

  return (
    <>
      <Helmet>
        <title>Claim Your Position — TalentXcel Rankings</title>
        <meta name="description" content="Enter the TalentXcel global leaderboard. Claim your company profile and lock in Founding 100 benefits." />
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* Founding 100 Promo Banner */}
        {isFoundingEligible && (
          <Card className="p-4 bg-gradient-to-r from-amber-500/10 via-primary/5 to-background border-amber-500/30">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-foreground">🚀 Founding 100 Lifetime Benefit</h3>
                  <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-700 border-amber-500/40">
                    {remainingFoundingSlots} slots left
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  The first 100 claimed profiles lock in a permanent <strong>5% platform fee for life</strong> (standard platform fee: 10%).
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Progress Stepper */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step > s  ? 'bg-primary text-primary-foreground' :
                step === s? 'bg-primary text-primary-foreground' :
                            'bg-muted text-muted-foreground'
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={`h-0.5 w-8 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
          <span className="ml-2 text-sm text-muted-foreground font-medium">
            {step === 1 ? '1. Company Profile' : step === 2 ? '2. Select Boards' : '3. Review & Claim'}
          </span>
        </div>

        {/* Existing Owned Profile Banner */}
        {myEntities.length > 0 && step === 1 && (
          <Card className="p-4 bg-muted/40 border-primary/20 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-sm">
                You already own <span className="text-primary font-bold">"{myEntities[0].name}"</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Manage your ranking positions, place bids, and track competitors from your dashboard.
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/claim1/dashboard')} className="gap-1">
              Go to Dashboard <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </Card>
        )}

        {/* ── Step 1 ───────────────────────────────────────────────────── */}
        {step === 1 && (
          <Card className="p-6 space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Your Company or Product</h1>
              <p className="text-muted-foreground text-sm mt-1">This will be your authoritative public ranking profile.</p>
            </div>

            {/* Entity type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <div className="flex gap-2 flex-wrap">
                {ENTITY_TYPES.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setEntityType(value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                      entityType === value
                        ? 'border-primary bg-primary/5 text-primary font-medium'
                        : 'border-border text-muted-foreground hover:border-primary/40'
                    }`}
                  >
                    {icon}{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium mb-1 block">Name <span className="text-destructive">*</span></label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Synthetix AI"
                maxLength={80}
              />
            </div>

            {/* Slug preview */}
            {slug && (
              <div>
                <label className="text-sm font-medium mb-1 block">Public URL</label>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                  slugChecking ? 'border-muted-foreground' :
                  slugTaken    ? 'border-destructive bg-destructive/5' :
                                 'border-green-500/50 bg-green-500/5'
                }`}>
                  <span className="text-muted-foreground">talentxcel.com/company/</span>
                  <span className="font-medium">{slug}</span>
                  <span className="ml-auto text-xs font-semibold">
                    {slugChecking ? 'Checking…' : slugTaken ? '❌ Already Taken' : '✅ Available'}
                  </span>
                </div>
              </div>
            )}

            {/* Tagline */}
            <div>
              <label className="text-sm font-medium mb-1 block">Tagline / Short Pitch (optional)</label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Next-gen AI career operating system"
                maxLength={120}
              />
            </div>

            {/* Logo Upload / URL */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Company Logo (optional)</label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl border bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain p-1" />
                  ) : (
                    <span className="text-xl font-bold text-muted-foreground">{name.charAt(0) || '🏢'}</span>
                  )}
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="gap-1.5 text-xs h-8"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                    {logoUrl && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setLogoUrl('')}
                        className="text-xs h-8 text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <Input
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="Or paste direct image URL (https://...)"
                    className="text-xs h-7"
                  />
                </div>
              </div>
            </div>

            {/* Website */}
            <div>
              <label className="text-sm font-medium mb-1 block">Website URL (optional)</label>
              <Input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://synthetix.ai"
                type="url"
              />
            </div>

            {/* Country */}
            <div>
              <label className="text-sm font-medium mb-1 block">Country</label>
              <select
                value={countryCode || 'OTHER'}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-1 block">About / Short Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what your product solves..."
                rows={2}
                maxLength={300}
              />
            </div>

            {/* Optional More Details Toggle */}
            <div className="border-t pt-3">
              <button
                type="button"
                onClick={() => setShowMoreDetails(!showMoreDetails)}
                className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground hover:text-foreground py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" /> Social Links, Team Size & HQ (Optional)
                </span>
                {showMoreDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showMoreDetails && (
                <div className="mt-3 space-y-3 pt-2 border-t text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-muted-foreground mb-1 block">HQ City</label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Bengaluru"
                        className="text-xs h-8"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block">Founded Year</label>
                      <Input
                        type="number"
                        min="1900"
                        max="2030"
                        value={foundedYear}
                        onChange={(e) => setFoundedYear(e.target.value)}
                        placeholder="e.g. 2024"
                        className="text-xs h-8"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block">Company Size</label>
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full border rounded-lg px-2.5 py-1.5 text-xs bg-background h-8"
                      >
                        <option value="">Select Team Size</option>
                        <option value="1-10 employees">1-10 employees</option>
                        <option value="11-50 employees">11-50 employees</option>
                        <option value="51-200 employees">51-200 employees</option>
                        <option value="201-500 employees">201-500 employees</option>
                        <option value="500+ employees">500+ employees</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block">Twitter / X URL</label>
                      <Input
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="https://x.com/..."
                        className="text-xs h-8"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block">LinkedIn URL</label>
                      <Input
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/company/..."
                        className="text-xs h-8"
                      />
                    </div>
                    <div>
                      <label className="text-muted-foreground mb-1 block">GitHub URL</label>
                      <Input
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="https://github.com/..."
                        className="text-xs h-8"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full gap-2"
              disabled={!step1Valid}
              onClick={() => setStep(2)}
            >
              Next: Select Boards <ChevronRight className="w-4 h-4" />
            </Button>
          </Card>
        )}

        {/* ── Step 2 ───────────────────────────────────────────────────── */}
        {step === 2 && (
          <Card className="p-6 space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Select Category Boards</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Choose the leaderboards you want to enter. Initial entry is 100% free.
              </p>
            </div>

            {scopesLoading ? (
              <div className="space-y-3">
                {[1,2,3,4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {scopes.map((scope) => (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => toggleScope(scope.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-colors ${
                      selectedScopes.includes(scope.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {selectedScopes.includes(scope.id)
                        ? <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        : <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      }
                      <div>
                        <p className="font-medium text-sm">{scopeLabel(scope)}</p>
                        <p className="text-xs text-muted-foreground">
                          {scope.scope_type === 'emerging' ? 'Startups & products founded within 3 years' : 'Free entry · Bid to rank'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={scope.scope_type === 'global' ? 'default' : 'secondary'} className="text-xs">
                      {scope.scope_type === 'global' ? 'Global' : scope.scope_type === 'emerging' ? 'Emerging' : 'Country'}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(1)}>
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              <Button className="flex-1 gap-2" disabled={!step2Valid} onClick={() => setStep(3)}>
                Next: Review <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* ── Step 3 ───────────────────────────────────────────────────── */}
        {step === 3 && (
          <Card className="p-6 space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Review & Claim Profile</h1>
              <p className="text-muted-foreground text-sm mt-1">Confirm your profile details before claiming your spot.</p>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entity Name</span>
                <span className="font-medium">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Public URL</span>
                <span className="font-mono text-xs text-primary">/company/{slug}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">AI Products</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Selected Boards</span>
                <span className="font-medium">{selectedScopes.length} board(s)</span>
              </div>
            </div>

            {/* Founding 100 confirmation box */}
            {isFoundingEligible ? (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm space-y-1">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  Founding 100 Slot #{foundingCount + 1} Eligible
                </div>
                <p className="text-xs text-muted-foreground">
                  Your entity will permanently lock in a <strong>5% platform fee</strong> (vs standard 10%) for all future bids across all leaderboards.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border bg-muted/50 p-4 text-sm">
                <p className="font-semibold text-foreground">Standard Platform Fee: 10%</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Listing is free. Platform fee only applies to ranking bid transactions.
                </p>
              </div>
            )}

            <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4 text-sm">
              <p className="font-semibold text-green-700 dark:text-green-400">✅ 100% Free Initial Entry</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your profile will be created immediately. You can place bids at any time using Razorpay to climb the ranks.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setStep(2)}>
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                className="flex-1"
                disabled={claimMutation.isPending}
                onClick={handleSubmit}
              >
                {claimMutation.isPending ? 'Claiming...' : 'Confirm & Claim Profile'}
              </Button>
            </div>
          </Card>
        )}

      </div>
    </>
  );
}
