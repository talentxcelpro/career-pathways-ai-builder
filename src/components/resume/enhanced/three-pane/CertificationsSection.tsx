
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Award, Calendar, ExternalLink } from "lucide-react";
import { EditorCertificationItem } from "@/types/editor-resume";

interface CertificationsSectionProps {
  data: EditorCertificationItem[];
  onChange: (data: EditorCertificationItem[]) => void;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  data,
  onChange,
}) => {
  const addCertification = () => {
    const newCertification: Certification = {
      id: crypto.randomUUID(),
      name: "",
      issuer: "",
      date: "",
      expirationDate: "",
      credentialId: "",
      url: "",
    };
    onChange([...data, newCertification]);
  };

  const updateCertification = (id: string, field: keyof Certification, value: any) => {
    onChange(
      data.map((cert) =>
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    );
  };

  const removeCertification = (id: string) => {
    onChange(data.filter((cert) => cert.id !== id));
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Certifications
        </CardTitle>
        <Button onClick={addCertification} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((certification, index) => (
          <Card key={certification.id} className="p-6 border-l-4 border-l-green-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Certification #{index + 1}
              </div>
              <Button
                onClick={() => removeCertification(certification.id)}
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor={`name-${certification.id}`}>Certification Name *</Label>
                <Input
                  id={`name-${certification.id}`}
                  value={certification.name}
                  onChange={(e) => updateCertification(certification.id, "name", e.target.value)}
                  placeholder="e.g., AWS Certified Solutions Architect"
                />
              </div>
              <div>
                <Label htmlFor={`issuer-${certification.id}`}>Issuing Organization *</Label>
                <Input
                  id={`issuer-${certification.id}`}
                  value={certification.issuer}
                  onChange={(e) => updateCertification(certification.id, "issuer", e.target.value)}
                  placeholder="e.g., Amazon Web Services"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor={`date-${certification.id}`}>Issue Date *</Label>
                <Input
                  id={`date-${certification.id}`}
                  type="month"
                  value={certification.date}
                  onChange={(e) => updateCertification(certification.id, "date", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`expiration-${certification.id}`}>Expiration Date</Label>
                <Input
                  id={`expiration-${certification.id}`}
                  type="month"
                  value={certification.expirationDate || ""}
                  onChange={(e) => updateCertification(certification.id, "expirationDate", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`credential-${certification.id}`}>Credential ID</Label>
                <Input
                  id={`credential-${certification.id}`}
                  value={certification.credentialId || ""}
                  onChange={(e) => updateCertification(certification.id, "credentialId", e.target.value)}
                  placeholder="e.g., ABC123DEF456"
                />
              </div>
              <div>
                <Label htmlFor={`url-${certification.id}`}>Verification URL</Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id={`url-${certification.id}`}
                    value={certification.url || ""}
                    onChange={(e) => updateCertification(certification.id, "url", e.target.value)}
                    placeholder="https://verify.certification.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </Card>
        ))}

        {data.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No certifications added yet.</p>
            <p className="text-sm">Click "Add Certification" to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
