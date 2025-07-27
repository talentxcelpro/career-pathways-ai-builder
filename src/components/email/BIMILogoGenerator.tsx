import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BIMILogoGeneratorProps {
  onLogoGenerated?: (svgContent: string) => void;
}

export const BIMILogoGenerator: React.FC<BIMILogoGeneratorProps> = ({
  onLogoGenerated
}) => {
  const [companyName, setCompanyName] = useState('');
  const [initials, setInitials] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#1a73e8');
  const [textColor, setTextColor] = useState('#ffffff');
  const [logoType, setLogoType] = useState<'text' | 'initials'>('initials');
  const { toast } = useToast();

  const generateSVG = () => {
    if (!companyName.trim() && !initials.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter company name or initials",
        variant: "destructive"
      });
      return;
    }

    const displayText = logoType === 'initials' 
      ? (initials || companyName.split(' ').map(word => word[0]).join('').toUpperCase())
      : companyName;

    const fontSize = logoType === 'initials' ? '48' : '24';
    const fontWeight = logoType === 'initials' ? 'bold' : 'normal';

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 100 100" 
     width="100" 
     height="100">
  <rect width="100" height="100" fill="${backgroundColor}" rx="8"/>
  <text x="50" y="50" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        font-weight="${fontWeight}"
        fill="${textColor}" 
        text-anchor="middle" 
        dominant-baseline="middle">
    ${displayText}
  </text>
</svg>`;

    onLogoGenerated?.(svgContent);
    return svgContent;
  };

  const downloadSVG = () => {
    const svgContent = generateSVG();
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${companyName.toLowerCase().replace(/\s+/g, '-')}-bimi-logo.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Logo Downloaded",
      description: "Your BIMI-compliant SVG logo has been downloaded.",
    });
  };

  const previewSVG = generateSVG();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          BIMI Logo Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name</Label>
            <Input
              id="company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="initials">Initials (Optional)</Label>
            <Input
              id="initials"
              value={initials}
              onChange={(e) => setInitials(e.target.value)}
              placeholder="e.g., TX"
              maxLength={3}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Logo Type</Label>
          <Select value={logoType} onValueChange={(value: 'text' | 'initials') => setLogoType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="initials">Initials Only</SelectItem>
              <SelectItem value="text">Full Company Name</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bg-color">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="bg-color"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#1a73e8"
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="text-color"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {(companyName || initials) && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded-lg p-4 bg-muted/50 flex justify-center">
              <div 
                className="w-20 h-20"
                dangerouslySetInnerHTML={{ __html: previewSVG }} 
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={downloadSVG} disabled={!companyName.trim() && !initials.trim()}>
            <Download className="h-4 w-4 mr-2" />
            Download SVG
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>BIMI Compliance:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Square aspect ratio (100x100)</li>
            <li>Clean SVG format</li>
            <li>No external dependencies</li>
            <li>Optimized for email display</li>
          </ul>
          <p className="mt-2">
            After downloading, upload this SVG to your server and use the HTTPS URL in your email service provider's BIMI configuration.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};