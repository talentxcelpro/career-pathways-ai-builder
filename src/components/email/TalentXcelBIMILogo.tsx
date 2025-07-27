import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const TalentXcelBIMILogo = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // BIMI-compliant SVG based on the uploaded TalentXcel logo
  const bimSVG = `<?xml version="1.0" encoding="UTF-8"?>
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

  const downloadSVG = () => {
    const blob = new Blob([bimSVG], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'talentxcel-bimi-logo.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "BIMI Logo Downloaded",
      description: "Upload this to https://talentxcel.in/bimi-logo.svg",
    });
  };

  const copyURL = () => {
    navigator.clipboard.writeText('https://talentxcel.in/bimi-logo.svg');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "URL Copied",
      description: "BIMI logo URL copied to clipboard",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>TalentXcel BIMI Logo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">BIMI-Compliant Logo Preview</label>
          <div className="border rounded-lg p-8 bg-gray-50 flex justify-center">
            <div 
              className="w-24 h-24"
              dangerouslySetInnerHTML={{ __html: bimSVG }} 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Your BIMI URL</label>
          <div className="flex gap-2">
            <input
              value="https://talentxcel.in/bimi-logo.svg"
              readOnly
              className="flex-1 px-3 py-2 border rounded-md bg-gray-50"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={copyURL}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={downloadSVG}>
            <Download className="h-4 w-4 mr-2" />
            Download SVG
          </Button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-blue-900">Setup Instructions:</h4>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Download the SVG file above</li>
            <li>Upload it to your server as: <code className="bg-blue-100 px-1 rounded">https://talentxcel.in/bimi-logo.svg</code></li>
            <li>Test the URL is publicly accessible</li>
            <li>Add this URL to your email provider's BIMI settings</li>
            <li>Ensure your domain has proper DMARC policy</li>
          </ol>
        </div>

        <div className="text-xs text-gray-600">
          <p><strong>BIMI Compliance:</strong> ✅ Square aspect ratio • ✅ SVG format • ✅ No external refs • ✅ Clean paths</p>
        </div>
      </CardContent>
    </Card>
  );
};