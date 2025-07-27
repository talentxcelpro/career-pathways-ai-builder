import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Check, AlertTriangle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BIMILogoUploadProps {
  onLogoUploaded?: (logoUrl: string) => void;
  currentLogoUrl?: string;
}

export const BIMILogoUpload: React.FC<BIMILogoUploadProps> = ({
  onLogoUploaded,
  currentLogoUrl
}) => {
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl || '');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  const validateSVG = async (file: File): Promise<{ isValid: boolean; errors: string[] }> => {
    const errors: string[] = [];
    
    // Check file type
    if (file.type !== 'image/svg+xml') {
      errors.push('File must be an SVG (image/svg+xml)');
    }
    
    // Check file size (should be reasonable for email)
    if (file.size > 50 * 1024) { // 50KB limit
      errors.push('SVG file should be under 50KB for email compatibility');
    }
    
    // Read and validate SVG content
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'image/svg+xml');
      
      // Check for XML parsing errors
      const errorNode = doc.querySelector('parsererror');
      if (errorNode) {
        errors.push('Invalid SVG format');
      }
      
      // Check for SVG root element
      const svgElement = doc.querySelector('svg');
      if (!svgElement) {
        errors.push('File must contain a valid SVG root element');
      }
      
      // Check for square aspect ratio
      if (svgElement) {
        const viewBox = svgElement.getAttribute('viewBox');
        const width = svgElement.getAttribute('width');
        const height = svgElement.getAttribute('height');
        
        if (viewBox) {
          const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
          if (vbWidth !== vbHeight) {
            errors.push('SVG must have square aspect ratio (viewBox width must equal height)');
          }
        } else if (width && height) {
          const w = parseFloat(width);
          const h = parseFloat(height);
          if (Math.abs(w - h) > 0.1) {
            errors.push('SVG must have square aspect ratio (width must equal height)');
          }
        }
      }
      
      // Check for external dependencies (not recommended for BIMI)
      if (text.includes('<foreignObject') || text.includes('xlink:href')) {
        errors.push('SVG should not contain external references for BIMI compatibility');
      }
      
    } catch (error) {
      errors.push('Failed to validate SVG content');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setValidating(true);
    setValidationResult(null);
    
    // Validate SVG first
    const validation = await validateSVG(file);
    setValidationResult(validation);
    
    if (!validation.isValid) {
      setValidating(false);
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = 'svg';
      const fileName = `bimi-logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('email-branding')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('email-branding')
        .getPublicUrl(data.path);

      setLogoUrl(publicUrl);
      onLogoUploaded?.(publicUrl);
      
      toast({
        title: "BIMI Logo Uploaded",
        description: "Your logo has been uploaded successfully and is ready for BIMI configuration.",
      });
      
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload logo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setValidating(false);
    }
  };

  const testLogoUrl = async () => {
    if (!logoUrl) return;
    
    try {
      const response = await fetch(logoUrl, { method: 'HEAD' });
      if (response.ok) {
        toast({
          title: "Logo URL Valid",
          description: "Your BIMI logo URL is accessible via HTTPS.",
        });
      } else {
        toast({
          title: "URL Not Accessible",
          description: "The logo URL is not publicly accessible.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "URL Test Failed",
        description: "Failed to test logo URL accessibility.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          BIMI Logo Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>BIMI Logo Requirements</Label>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>SVG Tiny 1.2 format</li>
                <li>Square aspect ratio (1:1)</li>
                <li>Under 50KB file size</li>
                <li>No external references</li>
                <li>Must be hosted on HTTPS</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo-upload">Upload SVG Logo</Label>
          <Input
            id="logo-upload"
            type="file"
            accept=".svg,image/svg+xml"
            onChange={handleFileUpload}
            disabled={uploading || validating}
          />
        </div>

        {validationResult && !validationResult.isValid && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">Validation Errors:</div>
                <ul className="list-disc list-inside text-sm">
                  {validationResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {validationResult && validationResult.isValid && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              SVG validation passed! Ready for BIMI use.
            </AlertDescription>
          </Alert>
        )}

        {logoUrl && (
          <div className="space-y-2">
            <Label>BIMI Logo URL</Label>
            <div className="flex gap-2">
              <Input
                value={logoUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={testLogoUrl}
              >
                <ExternalLink className="h-4 w-4" />
                Test
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Use this URL in your email service provider's BIMI configuration.
            </p>
          </div>
        )}

        {logoUrl && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded-lg p-4 bg-muted/50">
              <img
                src={logoUrl}
                alt="BIMI Logo Preview"
                className="w-16 h-16 mx-auto"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Next Steps:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Copy the logo URL above</li>
            <li>Add it to your email service provider's BIMI settings</li>
            <li>Ensure your domain has proper DMARC policy</li>
            <li>Consider getting a VMC (Verified Mark Certificate) for better deliverability</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};