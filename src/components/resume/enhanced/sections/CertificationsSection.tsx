import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Award, ExternalLink } from "lucide-react";
import { Certification } from "@/types/enhanced-resume";

interface CertificationsSectionProps {
  data: Certification[];
  onChange: (data: Certification[]) => void;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  data,
  onChange
}) => {
  const addCertification = () => {
    const newCertification: Certification = {
      id: crypto.randomUUID(),
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      url: '',
      skills: []
    };
    onChange([...data, newCertification]);
  };

  const updateCertification = (id: string, updates: Partial<Certification>) => {
    onChange(data.map(cert => 
      cert.id === id ? { ...cert, ...updates } : cert
    ));
  };

  const removeCertification = (id: string) => {
    onChange(data.filter(cert => cert.id !== id));
  };

  const updateSkills = (id: string, skillsStr: string) => {
    const skills = skillsStr.split(',').map(s => s.trim()).filter(s => s);
    updateCertification(id, { skills });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Certifications</h3>
        </div>
        <Button onClick={addCertification} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </div>

      {data.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No certifications yet</p>
            <Button onClick={addCertification} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Certification
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((certification, index) => (
            <Card key={certification.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Certification #{index + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(certification.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${certification.id}`}>Certification Name *</Label>
                    <Input
                      id={`name-${certification.id}`}
                      value={certification.name}
                      onChange={(e) => updateCertification(certification.id, { name: e.target.value })}
                      placeholder="e.g., AWS Certified Solutions Architect"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`issuer-${certification.id}`}>Issuing Organization *</Label>
                    <Input
                      id={`issuer-${certification.id}`}
                      value={certification.issuer}
                      onChange={(e) => updateCertification(certification.id, { issuer: e.target.value })}
                      placeholder="e.g., Amazon Web Services"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`issueDate-${certification.id}`}>Issue Date *</Label>
                    <Input
                      id={`issueDate-${certification.id}`}
                      type="month"
                      value={certification.issueDate}
                      onChange={(e) => updateCertification(certification.id, { issueDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`expiryDate-${certification.id}`}>Expiry Date</Label>
                    <Input
                      id={`expiryDate-${certification.id}`}
                      type="month"
                      value={certification.expiryDate}
                      onChange={(e) => updateCertification(certification.id, { expiryDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`credentialId-${certification.id}`}>Credential ID</Label>
                    <Input
                      id={`credentialId-${certification.id}`}
                      value={certification.credentialId}
                      onChange={(e) => updateCertification(certification.id, { credentialId: e.target.value })}
                      placeholder="e.g., AWA-1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`url-${certification.id}`}>Verification URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`url-${certification.id}`}
                        value={certification.url}
                        onChange={(e) => updateCertification(certification.id, { url: e.target.value })}
                        placeholder="https://..."
                      />
                      {certification.url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(certification.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`skills-${certification.id}`}>Related Skills</Label>
                  <Input
                    id={`skills-${certification.id}`}
                    value={certification.skills?.join(', ') || ''}
                    onChange={(e) => updateSkills(certification.id, e.target.value)}
                    placeholder="e.g., Cloud Computing, AWS Lambda, EC2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple skills with commas
                  </p>
                  {certification.skills && certification.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {certification.skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};