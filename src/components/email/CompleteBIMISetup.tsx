import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, ExternalLink, Copy, Check, Globe, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const CompleteBIMISetup = () => {
  const [uploading, setUploading] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [copied, setCopied] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);
  const { toast } = useToast();

  // TalentXcel BIMI-compliant SVG logo
  const talentxcelBIMISVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 100 100" 
     width="100" 
     height="100">
  <rect width="100" height="100" fill="#ffffff" rx="0"/>
  <g transform="translate(15, 15)">
    <path d="M35 10 
             C50 10, 60 20, 60 35
             C60 40, 58 45, 55 49
             L50 55
             C47 58, 43 60, 38 60
             L25 60
             L25 50
             L38 50
             C41 50, 43 48, 45 46
             L47 44
             C49 42, 50 39, 50 35
             C50 26, 43 20, 35 20
             C27 20, 20 26, 20 35
             L20 40
             L10 40
             L10 35
             C10 20, 20 10, 35 10 Z" 
          fill="#1e40af" 
          stroke="none"/>
  </g>
</svg>`;

  // Auto-setup on component mount
  useEffect(() => {
    setupBIMILogo();
  }, []);

  const setupBIMILogo = async () => {
    setUploading(true);
    
    try {
      // Convert SVG to blob
      const blob = new Blob([talentxcelBIMISVG], { type: 'image/svg+xml' });
      const fileName = 'talentxcel-bimi-logo.svg';

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('email-branding')
        .upload(fileName, blob, {
          cacheControl: '31536000', // 1 year cache
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('email-branding')
        .getPublicUrl(data.path);

      setSupabaseUrl(publicUrl);
      setSetupComplete(true);
      
      toast({
        title: "🎉 BIMI Logo Setup Complete!",
        description: "Your TalentXcel logo is ready for email branding.",
      });
      
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string, type: string) => {
    navigator.clipboard.writeText(url);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
    toast({
      title: "URL Copied!",
      description: `${type} URL copied to clipboard`,
    });
  };

  const downloadSVG = () => {
    const blob = new Blob([talentxcelBIMISVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'talentxcel-bimi-logo.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "SVG Downloaded",
      description: "Upload this file to your server as bimi-logo.svg",
    });
  };

  const testUrl = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Complete BIMI Setup for TalentXcel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploading && (
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                Setting up your BIMI logo... Please wait.
              </AlertDescription>
            </Alert>
          )}

          {setupComplete && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ BIMI logo setup complete! Your logo is ready for email branding.
              </AlertDescription>
            </Alert>
          )}

          {/* Logo Preview */}
          {supabaseUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo Preview:</label>
              <div className="border rounded-lg p-4 bg-gray-50 flex justify-center">
                <img
                  src={supabaseUrl}
                  alt="TalentXcel BIMI Logo"
                  className="w-16 h-16"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Option 1: Immediate Use */}
      {supabaseUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Check className="h-5 w-5" />
              Option 1: Use Immediately (Recommended)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ready-to-use BIMI URL:</label>
              <div className="flex gap-2">
                <input
                  value={supabaseUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm font-mono"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyUrl(supabaseUrl, 'Supabase')}
                >
                  {copied === 'Supabase' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => testUrl(supabaseUrl)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Globe className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>This URL works immediately!</strong> Add it to your email provider's BIMI settings now.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Option 2: Upload to Your Server */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Option 2: Upload to Your Server
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Target URL (after upload):</label>
            <div className="flex gap-2">
              <input
                value="https://talentxcel.in/bimi-logo.svg"
                readOnly
                className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm font-mono"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyUrl('https://talentxcel.in/bimi-logo.svg', 'Target')}
              >
                {copied === 'Target' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={downloadSVG} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download SVG File
          </Button>

          <Alert>
            <Server className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <strong>Upload Instructions:</strong>
                <ol className="list-decimal list-inside text-sm space-y-1">
                  <li>Download the SVG file above</li>
                  <li>Access your talentxcel.in hosting control panel</li>
                  <li>Upload the file to your root directory as <code>bimi-logo.svg</code></li>
                  <li>Test that <code>https://talentxcel.in/bimi-logo.svg</code> shows the logo</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Email Provider Configuration */}
      {supabaseUrl && (
        <Card>
          <CardHeader>
            <CardTitle>📧 Email Provider Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">For SendGrid:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Go to Settings → Sender Authentication</li>
                  <li>• Add BIMI Record</li>
                  <li>• Paste your logo URL</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">For Resend:</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Go to Domain Settings</li>
                  <li>• Add BIMI Configuration</li>
                  <li>• Enter your logo URL</li>
                </ul>
              </div>
            </div>

            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">
                <strong>Important:</strong> Make sure your domain has a proper DMARC policy for BIMI to work effectively.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};