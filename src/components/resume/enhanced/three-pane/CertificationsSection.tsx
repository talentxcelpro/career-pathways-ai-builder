import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { EditorCertificationItem } from '@/types/editor-resume';

interface CertificationsSectionProps {
  data: EditorCertificationItem[];
  onChange: (certifications: EditorCertificationItem[]) => void;
  selectedItemIndex?: number;
  onItemIndexChange?: (index: number) => void;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  data,
  onChange,
  selectedItemIndex = 0,
  onItemIndexChange
}) => {
  const addCertification = () => {
    const newCertification: EditorCertificationItem = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: ''
    };
    
    const updated = [...data, newCertification];
    onChange(updated);
    onItemIndexChange?.(updated.length - 1);
  };

  const updateCertification = (index: number, field: keyof EditorCertificationItem, value: string) => {
    const updated = data.map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    );
    onChange(updated);
  };

  const removeCertification = (index: number) => {
    const updated = data.filter((_, i) => i !== index);
    onChange(updated);
    if (selectedItemIndex >= updated.length && updated.length > 0) {
      onItemIndexChange?.(updated.length - 1);
    } else if (updated.length === 0) {
      onItemIndexChange?.(0);
    }
  };

  const selectedCert = data[selectedItemIndex];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Certifications</h3>
        <Button onClick={addCertification} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Certification
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No certifications added yet</p>
          <Button onClick={addCertification} variant="outline" className="mt-2">
            Add your first certification
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Certifications List */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Certifications ({data.length})</Label>
            {data.map((cert, index) => (
              <Card
                key={cert.id}
                className={`cursor-pointer transition-colors ${
                  selectedItemIndex === index
                    ? 'ring-2 ring-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onItemIndexChange?.(index)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {cert.name || 'Untitled Certification'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {cert.issuer || 'No issuer'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCertification(index);
                      }}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Certification Editor */}
          {selectedCert && (
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Edit Certification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Certification Name *</Label>
                      <Input
                        id="name"
                        value={selectedCert.name}
                        onChange={(e) => updateCertification(selectedItemIndex, 'name', e.target.value)}
                        placeholder="e.g., AWS Certified Solutions Architect"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="issuer">Issuing Organization *</Label>
                      <Input
                        id="issuer"
                        value={selectedCert.issuer}
                        onChange={(e) => updateCertification(selectedItemIndex, 'issuer', e.target.value)}
                        placeholder="e.g., Amazon Web Services"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="issueDate">Issue Date</Label>
                      <Input
                        id="issueDate"
                        type="month"
                        value={selectedCert.issueDate}
                        onChange={(e) => updateCertification(selectedItemIndex, 'issueDate', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        type="month"
                        value={selectedCert.expiryDate}
                        onChange={(e) => updateCertification(selectedItemIndex, 'expiryDate', e.target.value)}
                        placeholder="Leave empty if no expiry"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="credentialId">Credential ID</Label>
                      <Input
                        id="credentialId"
                        value={selectedCert.credentialId}
                        onChange={(e) => updateCertification(selectedItemIndex, 'credentialId', e.target.value)}
                        placeholder="Certification ID or number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="credentialUrl">Credential URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="credentialUrl"
                          value={selectedCert.credentialUrl}
                          onChange={(e) => updateCertification(selectedItemIndex, 'credentialUrl', e.target.value)}
                          placeholder="https://..."
                        />
                        {selectedCert.credentialUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="shrink-0"
                          >
                            <a
                              href={selectedCert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};