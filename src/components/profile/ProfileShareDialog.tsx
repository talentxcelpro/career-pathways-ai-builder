
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Check, Mail, MessageCircle, Facebook, Twitter, Linkedin } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface ProfileShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  userName: string;
}

export const ProfileShareDialog: React.FC<ProfileShareDialogProps> = ({
  isOpen,
  onClose,
  profileUrl,
  userName
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Profile URL copied to clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const shareViaEmail = () => {
    const subject = `Check out ${userName}'s profile`;
    const body = `Hi,\n\nI wanted to share ${userName}'s professional profile with you:\n\n${profileUrl}\n\nBest regards`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const shareViaSocial = (platform: string) => {
    const text = `Check out ${userName}'s professional profile`;
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`
    };
    
    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Profile</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Profile URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Profile URL</label>
            <div className="flex space-x-2">
              <Input value={profileUrl} readOnly className="flex-1" />
              <Button onClick={copyToClipboard} variant="outline">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Quick Share Options */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Share via</label>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={shareViaEmail} className="justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" onClick={() => shareViaSocial('linkedin')} className="justify-start">
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button variant="outline" onClick={() => shareViaSocial('twitter')} className="justify-start">
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button variant="outline" onClick={() => shareViaSocial('facebook')} className="justify-start">
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
            </div>
          </div>

          {/* Privacy Badge */}
          <div className="flex items-center justify-center pt-2">
            <Badge variant="secondary" className="text-xs">
              Only people with the link can view this profile
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
