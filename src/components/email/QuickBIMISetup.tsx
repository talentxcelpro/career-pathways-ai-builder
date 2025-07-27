import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, ExternalLink, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const QuickBIMISetup = () => {
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // TalentXcel BIMI-compliant SVG
  const talentxcelSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 100 100" 
     width="100" 
     height="100">
  <rect width="100" height="100" fill="#ffffff" rx="0"/>
  <g transform="translate(20, 20)">
    <path d="M30 5 
             C45 5, 55 15, 55 30
             C55 35, 53 40, 50 44
             L45 50
             C42 53, 38 55, 33 55
             L20 55
             L20 45
             L33 45
             C36 45, 38 43, 40 41
             L42 39
             C44 37, 45 34, 45 30
             C45 21, 38 15, 30 15
             C22 15, 15 21, 15 30
             L15 35
             L5 35
             L5 30
             C5 15, 15 5, 30 5 Z" 
          fill="#1e3a8a" 
          stroke="none"/>
  </g>
</svg>`;

  const uploadToSupabase = async () => {
    setUploading(true);
    
    try {
      // Convert SVG string to blob
      const blob = new Blob([talentxcelSVG], { type: 'image/svg+xml' });
      const fileName = 'talentxcel-bimi-logo.svg';

      const { data, error } = await supabase.storage
        .from('email-branding')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true // Allow overwrite
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('email-branding')
        .getPublicUrl(data.path);

      setLogoUrl(publicUrl);
      
      toast({
        title: "BIMI Logo Ready!",
        description: "Your logo is now available at a public HTTPS URL.",
      });
      
    } catch (error: any) {
      toast({
        title: "Upload Failed", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = () => {
    if (logoUrl) {
      navigator.clipboard.writeText(logoUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "URL Copied",
        description: "BIMI logo URL copied to clipboard",
      });
    }
  };

  const testUrl = () => {
    if (logoUrl) {
      window.open(logoUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick BIMI Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Current Issue:</h4>
          <p className="text-sm text-blue-800">
            <code>https://talentxcel.in/bimi-logo.svg</code> shows blank because the file hasn't been uploaded to your server yet.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Option 1: Use Supabase Storage (Immediate)</h4>
          <Button 
            onClick={uploadToSupabase} 
            disabled={uploading}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload TalentXcel Logo to Supabase'}
          </Button>
          
          {logoUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Your BIMI URL (Ready to use):</label>
              <div className="flex gap-2">
                <input
                  value={logoUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
                />
                <Button variant="outline" size="sm" onClick={copyUrl}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={testUrl}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Option 2: Upload to your server</h4>
          <ol className="list-decimal list-inside text-sm space-y-1 text-gray-600">
            <li>Download the SVG using the component above</li>
            <li>Upload to your server as <code>/bimi-logo.svg</code></li>
            <li>Test that <code>https://talentxcel.in/bimi-logo.svg</code> works</li>
            <li>Use that URL in your email provider's BIMI settings</li>
          </ol>
        </div>

        {logoUrl && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">✅ Next Steps:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Copy the Supabase URL above</li>
              <li>• Add it to your email provider's BIMI configuration</li>
              <li>• Ensure your domain has proper DMARC policy</li>
              <li>• Test your emails to see the logo in recipients' inboxes</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};