
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { FormData } from './types';

interface DeclarationStepProps {
  formData: FormData;
  onInputChange: (key: keyof FormData, value: any) => void;
}

export default function DeclarationStep({ formData, onInputChange }: DeclarationStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Step 4: Declaration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="info-confirmed"
            checked={formData.informationConfirmed}
            onCheckedChange={(checked) => onInputChange('informationConfirmed', !!checked)}
          />
          <Label htmlFor="info-confirmed" className="text-sm">
            I confirm that the above information is true to the best of my knowledge.
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="contact-authorized"
            checked={formData.contactAuthorized}
            onCheckedChange={(checked) => onInputChange('contactAuthorized', !!checked)}
          />
          <Label htmlFor="contact-authorized" className="text-sm">
            I authorize the company to contact me for job-related communication.
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
