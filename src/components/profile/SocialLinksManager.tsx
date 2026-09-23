import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, ExternalLink, AlertCircle } from "lucide-react";
import { validateSocialUrl } from '@/utils/profileHelpers';
import { useToast } from '@/hooks/use-toast';

interface SocialLinksManagerProps {
  socialLinks: Record<string, string>;
  onSocialLinksChange: (links: Record<string, string>) => void;
}

export const SocialLinksManager: React.FC<SocialLinksManagerProps> = ({
  socialLinks,
  onSocialLinksChange
}) => {
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const platforms = ['linkedin', 'github', 'twitter', 'website'];

  const addSocialLink = () => {
    if (!newPlatform || !newUrl) {
      toast({
        title: "Missing information",
        description: "Please select a platform and enter a URL.",
        variant: "destructive"
      });
      return;
    }

    if (!validateSocialUrl(newPlatform, newUrl)) {
      toast({
        title: "Invalid URL",
        description: `Please enter a valid ${newPlatform} URL.`,
        variant: "destructive"
      });
      return;
    }

    const updatedLinks = { ...socialLinks, [newPlatform]: newUrl };
    onSocialLinksChange(updatedLinks);
    setNewPlatform('');
    setNewUrl('');
    setShowAddForm(false);
    
    toast({
      title: "Link added",
      description: `${newPlatform} profile added successfully.`
    });
  };

  const removeSocialLink = (platform: string) => {
    const updatedLinks = { ...socialLinks };
    delete updatedLinks[platform];
    onSocialLinksChange(updatedLinks);
    
    toast({
      title: "Link removed",
      description: `${platform} profile removed.`
    });
  };

  return (
    <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-xs rounded-2xl">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Social & External Links</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Connect your LinkedIn, GitHub, and personal portfolio</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)} 
            size="sm"
            disabled={showAddForm}
            className="h-8 px-3 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Link
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 pt-0 space-y-3">
        {/* Existing Links */}
        <div className="space-y-2">
          {Object.entries(socialLinks).map(([platform, url]) => (
            <div key={platform} className="flex items-center justify-between p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 text-xs">
              <div className="flex items-center space-x-2.5 min-w-0">
                <Badge variant="secondary" className="capitalize text-[10px] font-bold px-2 py-0.5">
                  {platform}
                </Badge>
                <a 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 truncate text-xs font-medium"
                >
                  <span className="truncate max-w-xs">{url}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSocialLink(platform)}
                className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Link Form */}
        {showAddForm && (
          <div className="p-3.5 border border-blue-200 dark:border-blue-900/60 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
            <h4 className="font-medium">Add Social Link</h4>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="">Select Platform</option>
                {platforms.filter(p => !socialLinks[p]).map(platform => (
                  <option key={platform} value={platform} className="capitalize">
                    {platform}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Enter URL"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">
                Please enter the full URL (including https://)
              </span>
            </div>
            <div className="flex space-x-2">
              <Button onClick={addSocialLink} size="sm">
                Add Link
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setNewPlatform('');
                  setNewUrl('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {Object.keys(socialLinks).length === 0 && !showAddForm && (
          <p className="text-gray-500 text-center py-4">
            No social links added yet. Click "Add Link" to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
