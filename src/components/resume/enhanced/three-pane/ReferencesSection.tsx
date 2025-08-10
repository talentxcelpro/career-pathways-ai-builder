import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Users } from "lucide-react";
import { Reference } from "@/types/enhanced-resume";

interface ReferencesSectionProps {
  data: Reference[];
  onChange: (data: Reference[]) => void;
}

export const ReferencesSection: React.FC<ReferencesSectionProps> = ({
  data,
  onChange
}) => {
  const addReference = () => {
    const newReference: Reference = {
      id: crypto.randomUUID(),
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      relationship: '',
      available: true
    };
    onChange([...data, newReference]);
  };

  const updateReference = (id: string, updates: Partial<Reference>) => {
    onChange(data.map(ref => 
      ref.id === id ? { ...ref, ...updates } : ref
    ));
  };

  const removeReference = (id: string) => {
    onChange(data.filter(ref => ref.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">References</h3>
        </div>
        <Button onClick={addReference} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Reference
        </Button>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">📋 Important Notes:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Always ask permission before listing someone as a reference</li>
          <li>• Provide your references with your resume and the job description</li>
          <li>• Consider using "References available upon request" instead of listing them</li>
          <li>• Choose references who can speak to different aspects of your work</li>
        </ul>
      </div>

      {data.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No references yet</p>
            <Button onClick={addReference} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Reference
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((reference, index) => (
            <Card key={reference.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Reference #{index + 1}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReference(reference.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`name-${reference.id}`}>Full Name *</Label>
                    <Input
                      id={`name-${reference.id}`}
                      value={reference.name}
                      onChange={(e) => updateReference(reference.id, { name: e.target.value })}
                      placeholder="e.g., John Smith"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`title-${reference.id}`}>Job Title *</Label>
                    <Input
                      id={`title-${reference.id}`}
                      value={reference.title}
                      onChange={(e) => updateReference(reference.id, { title: e.target.value })}
                      placeholder="e.g., Senior Software Manager"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`company-${reference.id}`}>Company/Organization *</Label>
                  <Input
                    id={`company-${reference.id}`}
                    value={reference.company}
                    onChange={(e) => updateReference(reference.id, { company: e.target.value })}
                    placeholder="e.g., TechCorp Inc."
                  />
                </div>

                <div>
                  <Label htmlFor={`relationship-${reference.id}`}>Relationship *</Label>
                  <Input
                    id={`relationship-${reference.id}`}
                    value={reference.relationship}
                    onChange={(e) => updateReference(reference.id, { relationship: e.target.value })}
                    placeholder="e.g., Former Manager, Colleague, Client"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`email-${reference.id}`}>Email</Label>
                    <Input
                      id={`email-${reference.id}`}
                      type="email"
                      value={reference.email}
                      onChange={(e) => updateReference(reference.id, { email: e.target.value })}
                      placeholder="john.smith@company.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`phone-${reference.id}`}>Phone</Label>
                    <Input
                      id={`phone-${reference.id}`}
                      value={reference.phone}
                      onChange={(e) => updateReference(reference.id, { phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`available-${reference.id}`}
                    checked={reference.available}
                    onCheckedChange={(checked) => 
                      updateReference(reference.id, { available: !!checked })
                    }
                  />
                  <Label htmlFor={`available-${reference.id}`} className="text-sm">
                    Available for contact
                  </Label>
                </div>

                {!reference.available && (
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      This reference is marked as unavailable. Consider updating their availability or removing them.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-2">💡 Reference Best Practices:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Include 3-5 professional references from different contexts</li>
          <li>• Mix supervisors, colleagues, and clients if possible</li>
          <li>• Ensure contact information is current and accurate</li>
          <li>• Brief your references about the specific role you're applying for</li>
          <li>• Thank your references and keep them updated on your job search</li>
        </ul>
      </div>
    </div>
  );
};