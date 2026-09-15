import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Upload, Link as LinkIcon, CheckCircle2, Sparkles, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { resolveCompanyDomain, buildGoogleLogoUrl, saveCompanyLogoToDatabase } from '@/services/companyLogoService';

interface CompanyLogoPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  websiteUrl?: string;
  currentLogoUrl?: string;
  onLogoSaved: (newLogoUrl: string) => void;
}

export const CompanyLogoPromptModal: React.FC<CompanyLogoPromptModalProps> = ({
  isOpen,
  onClose,
  companyId,
  companyName,
  websiteUrl,
  currentLogoUrl,
  onLogoSaved
}) => {
  const initialDomain = resolveCompanyDomain(companyName, websiteUrl);
  const [domainInput, setDomainInput] = useState(initialDomain);
  const [googlePreviewUrl, setGooglePreviewUrl] = useState(buildGoogleLogoUrl(initialDomain));
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Re-fetch from Google when domain is modified
  const handleFetchFromGoogle = () => {
    if (!domainInput.trim()) {
      toast.error('Please enter a website or domain (e.g. company.com)');
      return;
    }
    const generated = buildGoogleLogoUrl(domainInput.trim());
    setGooglePreviewUrl(generated);
    toast.success(`Fetched logo preview from Google for ${domainInput.trim()}`);
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, SVG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedBase64(reader.result as string);
      toast.success('Image loaded successfully');
    };
    reader.readAsDataURL(file);
  };

  // Save selection
  const handleSave = async (chosenUrl: string) => {
    if (!chosenUrl || !chosenUrl.trim()) {
      toast.error('No logo URL to save');
      return;
    }

    setIsSaving(true);
    try {
      await saveCompanyLogoToDatabase(companyId, companyName, chosenUrl.trim());
      onLogoSaved(chosenUrl.trim());
      toast.success(`Logo updated for ${companyName}!`);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save logo');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] p-6 rounded-2xl">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
              <Building2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-base font-extrabold text-foreground">
              Add or Update Company Logo
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Auto-fetch the official logo from Google or upload a custom brand image for <strong className="text-foreground">{companyName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="google" className="w-full mt-2">
          <TabsList className="grid grid-cols-3 h-9 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <TabsTrigger value="google" className="text-xs font-semibold rounded-lg flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-blue-500" />
              Google Auto
            </TabsTrigger>
            <TabsTrigger value="upload" className="text-xs font-semibold rounded-lg flex items-center gap-1">
              <Upload className="h-3 w-3" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs font-semibold rounded-lg flex items-center gap-1">
              <LinkIcon className="h-3 w-3" />
              Paste URL
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Auto Fetch from Google */}
          <TabsContent value="google" className="space-y-4 pt-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Company Website or Domain</label>
              <div className="flex gap-2">
                <Input
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="e.g. savantis.com, chatr.chat"
                  className="h-9 text-xs rounded-xl"
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchFromGoogle()}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleFetchFromGoogle}
                  className="h-9 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl gap-1 shrink-0"
                >
                  <Search className="h-3.5 w-3.5" />
                  Fetch
                </Button>
              </div>
            </div>

            {/* Google Logo Live Preview */}
            <div className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900/60 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border shadow-xs p-2 flex items-center justify-center shrink-0">
                <img 
                  src={googlePreviewUrl} 
                  alt="Google Preview" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to S2 if v2 has an edge issue
                    (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${domainInput}&sz=128`;
                  }}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Ready to Apply
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Official high-resolution favicon fetched via Google's Global Brand CDN for {domainInput}.
                </p>
              </div>
            </div>

            <Button
              className="w-full h-9 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs"
              onClick={() => handleSave(googlePreviewUrl)}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Apply Google Logo'}
            </Button>
          </TabsContent>

          {/* TAB 2: Upload Image File */}
          <TabsContent value="upload" className="space-y-4 pt-3">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                id="company-logo-upload"
                className="hidden"
              />
              <label htmlFor="company-logo-upload" className="cursor-pointer space-y-2 block">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                  <Upload className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold text-foreground">Click to select logo image</div>
                <p className="text-[10px] text-muted-foreground">PNG, JPG, SVG or WebP up to 5MB</p>
              </label>
            </div>

            {uploadedBase64 && (
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900/60 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border p-1.5 flex items-center justify-center shrink-0">
                  <img src={uploadedBase64} alt="Upload preview" className="w-full h-full object-contain" />
                </div>
                <span className="text-xs font-semibold text-foreground truncate">Selected image file</span>
              </div>
            )}

            <Button
              className="w-full h-9 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
              disabled={!uploadedBase64 || isSaving}
              onClick={() => uploadedBase64 && handleSave(uploadedBase64)}
            >
              {isSaving ? 'Saving...' : 'Apply Uploaded Logo'}
            </Button>
          </TabsContent>

          {/* TAB 3: Paste Direct URL */}
          <TabsContent value="url" className="space-y-4 pt-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">Direct Image URL</label>
              <Input
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="h-9 text-xs rounded-xl"
              />
            </div>

            {customUrlInput && (
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900/60 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border p-1.5 flex items-center justify-center shrink-0">
                  <img src={customUrlInput} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <span className="text-xs text-muted-foreground truncate">{customUrlInput}</span>
              </div>
            )}

            <Button
              className="w-full h-9 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
              disabled={!customUrlInput.trim() || isSaving}
              onClick={() => handleSave(customUrlInput.trim())}
            >
              {isSaving ? 'Saving...' : 'Apply Custom URL'}
            </Button>
          </TabsContent>
        </Tabs>

        <DialogFooter className="sm:justify-end mt-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs rounded-xl">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
