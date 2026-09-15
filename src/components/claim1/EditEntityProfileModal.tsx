// src/components/claim1/EditEntityProfileModal.tsx
// Comprehensive edit modal for claimed entity profiles (Logos, Tagline, Socials, Company Details)

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  MessageSquare,
  Building2,
  Calendar,
  MapPin,
  Sparkles,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { useUpdateEntityProfile } from '@/hooks/useClaim1';
import { uploadEntityLogo } from '@/services/claim1Service';
import type { Claim1Entity } from '@/types/claim1';
import { toast } from 'sonner';

const COMPANY_SIZE_OPTIONS = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '500+ employees',
];

const SUGGESTED_TAGS = [
  'AI / ML',
  'Generative AI',
  'Enterprise SaaS',
  'EdTech',
  'Career Tech',
  'Developer Tools',
  'Fintech',
  'HealthTech',
  'Cybersecurity',
  'Web3',
];

interface EditEntityProfileModalProps {
  entity: Claim1Entity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEntityProfileModal({ entity, open, onOpenChange }: EditEntityProfileModalProps) {
  const updateMutation = useUpdateEntityProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName]                   = useState(entity.name || '');
  const [tagline, setTagline]             = useState(entity.tagline || '');
  const [description, setDescription]     = useState(entity.description || '');
  const [websiteUrl, setWebsiteUrl]       = useState(entity.website_url || '');
  const [logoUrl, setLogoUrl]             = useState(entity.logo_url || '');
  const [city, setCity]                   = useState(entity.city || '');
  const [countryName, setCountryName]     = useState(entity.country_name || '');
  const [companySize, setCompanySize]     = useState(entity.company_size || '');
  const [foundedYear, setFoundedYear]     = useState<string>(entity.founded_year ? String(entity.founded_year) : '');
  const [industryTags, setIndustryTags]   = useState<string[]>(entity.industry_tags || []);
  const [customTagInput, setCustomTagInput] = useState('');

  // Social Links
  const socials = entity.social_links || {};
  const [twitter, setTwitter]             = useState(socials.twitter || '');
  const [linkedin, setLinkedin]           = useState(socials.linkedin || '');
  const [github, setGithub]               = useState(socials.github || '');
  const [youtube, setYoutube]             = useState(socials.youtube || '');
  const [discord, setDiscord]             = useState(socials.discord || '');

  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const url = await uploadEntityLogo(file, entity.slug);
      setLogoUrl(url);
      toast.success('Logo uploaded! Preview updated.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleToggleTag = (tag: string) => {
    setIndustryTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault();
      const val = customTagInput.trim();
      if (!industryTags.includes(val)) {
        setIndustryTags((prev) => [...prev, val]);
      }
      setCustomTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const social_links: Record<string, string> = {};
    if (twitter.trim())   social_links.twitter = twitter.trim();
    if (linkedin.trim())  social_links.linkedin = linkedin.trim();
    if (github.trim())    social_links.github = github.trim();
    if (youtube.trim())   social_links.youtube = youtube.trim();
    if (discord.trim())   social_links.discord = discord.trim();

    await updateMutation.mutateAsync({
      entity_id: entity.id,
      name: name.trim(),
      tagline: tagline.trim() || undefined,
      description: description.trim() || undefined,
      website_url: websiteUrl.trim() || undefined,
      logo_url: logoUrl.trim() || undefined,
      city: city.trim() || undefined,
      country_name: countryName.trim() || undefined,
      company_size: companySize || undefined,
      founded_year: foundedYear ? parseInt(foundedYear, 10) : undefined,
      industry_tags: industryTags,
      social_links,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="w-5 h-5 text-primary" /> Edit Company Profile
          </DialogTitle>
          <DialogDescription>
            Update your public ranking profile, media, social links, and company details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-2">

          {/* Logo Upload Section */}
          <div className="flex items-start gap-4 p-4 border rounded-xl bg-muted/20">
            <div className="w-20 h-20 rounded-2xl border bg-background flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm relative group">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-3xl font-bold text-muted-foreground">{name.charAt(0) || '🏢'}</span>
              )}
              {uploadingLogo && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-sm font-semibold block">Company Logo</label>
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
                  className="gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  {uploadingLogo ? 'Uploading...' : 'Upload Image'}
                </Button>
                {logoUrl && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setLogoUrl('')}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </Button>
                )}
              </div>
              <Input
                placeholder="Or paste direct image URL (https://...)"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="text-xs h-8"
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Company Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Synthetix AI"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Tagline / Short Pitch</label>
              <Input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. The world's first AI career navigation operating system"
                maxLength={120}
              />
              <p className="text-[11px] text-muted-foreground mt-1">Shown right below your company title.</p>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">About / Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your company, product capabilities, mission, and achievements..."
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Quick Facts */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-1.5 text-foreground">
              <Building2 className="w-4 h-4 text-primary" /> Company Details (Optional)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Website URL</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://talentxcel.in"
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">HQ Location (City / Region)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru, India"
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Company Size</label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                >
                  <option value="">Select Team Size</option>
                  {COMPANY_SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block text-muted-foreground">Founded Year</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1900"
                    max="2030"
                    value={foundedYear}
                    onChange={(e) => setFoundedYear(e.target.value)}
                    placeholder="e.g. 2024"
                    className="pl-9 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Industry Tags */}
            <div>
              <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Industry & Category Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {SUGGESTED_TAGS.map((tag) => {
                  const isSelected = industryTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary font-medium'
                          : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{tag}
                    </button>
                  );
                })}
              </div>
              <Input
                placeholder="Type a custom tag and press Enter..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={handleAddCustomTag}
                className="text-xs h-8"
              />
            </div>
          </div>

          {/* Social Media Links */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-semibold text-sm text-foreground">Social & Community Links (Optional)</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Twitter className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="https://x.com/yourhandle"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <div className="relative">
                <Linkedin className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="https://linkedin.com/company/..."
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <div className="relative">
                <Github className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="https://github.com/..."
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <div className="relative">
                <Youtube className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="https://youtube.com/@..."
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>

              <div className="relative sm:col-span-2">
                <MessageSquare className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="https://discord.gg/... or Community URL"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Profile Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
