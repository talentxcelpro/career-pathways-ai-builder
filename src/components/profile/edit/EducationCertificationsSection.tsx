import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Award, Plus, Trash2, Calendar } from "lucide-react";

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_year?: string;
  end_year?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuing_org: string;
  issue_date?: string;
  credential_url?: string;
}

interface EducationCertificationsSectionProps {
  education: EducationItem[];
  certifications: CertificationItem[];
  onEducationChange: (items: EducationItem[]) => void;
  onCertificationsChange: (items: CertificationItem[]) => void;
}

export const EducationCertificationsSection: React.FC<EducationCertificationsSectionProps> = ({
  education,
  certifications,
  onEducationChange,
  onCertificationsChange,
}) => {
  const addEducation = () => {
    onEducationChange([
      ...education,
      {
        id: Date.now().toString(),
        institution: '',
        degree: '',
        field_of_study: '',
        start_year: '',
        end_year: '',
      },
    ]);
  };

  const updateEducation = (id: string, field: keyof EducationItem, val: string) => {
    onEducationChange(
      education.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const removeEducation = (id: string) => {
    onEducationChange(education.filter((item) => item.id !== id));
  };

  const addCertification = () => {
    onCertificationsChange([
      ...certifications,
      {
        id: Date.now().toString(),
        name: '',
        issuing_org: '',
        issue_date: '',
        credential_url: '',
      },
    ]);
  };

  const updateCertification = (id: string, field: keyof CertificationItem, val: string) => {
    onCertificationsChange(
      certifications.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const removeCertification = (id: string) => {
    onCertificationsChange(certifications.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Education Card */}
      <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-xs rounded-2xl">
        <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-blue-600" />
              Education & Degrees
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Highlight your academic background and degrees
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEducation}
            className="h-8 text-xs font-semibold rounded-lg gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Degree
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
          {education.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              No education listed. Click "Add Degree" to add your university or college.
            </p>
          ) : (
            education.map((edu, idx) => (
              <div
                key={edu.id || idx}
                className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-950/40 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Degree #{idx + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(edu.id)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      Institution / University *
                    </Label>
                    <Input
                      placeholder="e.g. Stanford University"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      Degree / Qualification *
                    </Label>
                    <Input
                      placeholder="e.g. Bachelor of Science"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      Field of Study
                    </Label>
                    <Input
                      placeholder="e.g. Computer Science"
                      value={edu.field_of_study || ''}
                      onChange={(e) => updateEducation(edu.id, 'field_of_study', e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        Start Year
                      </Label>
                      <Input
                        placeholder="2018"
                        value={edu.start_year || ''}
                        onChange={(e) => updateEducation(edu.id, 'start_year', e.target.value)}
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        Graduation Year
                      </Label>
                      <Input
                        placeholder="2022"
                        value={edu.end_year || ''}
                        onChange={(e) => updateEducation(edu.id, 'end_year', e.target.value)}
                        className="h-8 text-xs mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Certifications Card */}
      <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 shadow-xs rounded-2xl">
        <CardHeader className="p-4 sm:p-5 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Licenses & Certifications
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Showcase verified credentials and industry certifications
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCertification}
            className="h-8 text-xs font-semibold rounded-lg gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Certification
          </Button>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
          {certifications.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              No certifications listed. Click "Add Certification" to display verified badges.
            </p>
          ) : (
            certifications.map((cert, idx) => (
              <div
                key={cert.id || idx}
                className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-slate-50/50 dark:bg-slate-950/40 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Certification #{idx + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(cert.id)}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      Certification Name *
                    </Label>
                    <Input
                      placeholder="e.g. AWS Certified Solutions Architect"
                      value={cert.name}
                      onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      Issuing Organization *
                    </Label>
                    <Input
                      placeholder="e.g. Amazon Web Services"
                      value={cert.issuing_org}
                      onChange={(e) => updateCertification(cert.id, 'issuing_org', e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      Issue Date (or Year)
                    </Label>
                    <Input
                      placeholder="e.g. 2024"
                      value={cert.issue_date || ''}
                      onChange={(e) => updateCertification(cert.id, 'issue_date', e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-medium text-muted-foreground">
                      Credential URL or ID
                    </Label>
                    <Input
                      placeholder="https://credly.com/..."
                      value={cert.credential_url || ''}
                      onChange={(e) => updateCertification(cert.id, 'credential_url', e.target.value)}
                      className="h-8 text-xs mt-1"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
