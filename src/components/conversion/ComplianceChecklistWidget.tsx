// src/components/conversion/ComplianceChecklistWidget.tsx
// Above-the-fold PLG Conversion Widget for CA, Legal & Relocation Compliance Hubs
// Interactive readiness/compliance checklist -> 1-Click Career Passport / Expert Consultation signup

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scale, CheckCircle2, ShieldCheck, ArrowRight, Lock, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ComplianceChecklistWidgetProps {
  guideTitle?: string;
  region?: string;
  category?: 'visa' | 'tax' | 'incorporation' | 'placement';
  className?: string;
}

export const ComplianceChecklistWidget: React.FC<ComplianceChecklistWidgetProps> = ({
  guideTitle = 'Cross-Border Remote Contractor Tax & Legal Compliance',
  region = 'India / Global',
  category = 'tax',
  className = '',
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    0: true,
    1: true,
  });

  const checklistItems = [
    { id: 0, label: 'Form W-8BEN or Foreign Contractor Agreement Executed' },
    { id: 1, label: 'Cross-Border Invoicing with Inward Remittance Certificate (FIRC)' },
    { id: 2, label: 'Local Goods & Services Tax (GST) LUT Exemption Filed' },
    { id: 3, label: 'Verified Career Passport & KYC Identification Linked' },
  ];

  const total = checklistItems.length;
  const completed = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = Math.round((completed / total) * 100);

  const toggleItem = (id: number) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBookConsultationOrPassport = () => {
    if (user) {
      navigate('/services/ai-recruitment');
    } else {
      navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}&intent=compliance_consult`);
    }
  };

  return (
    <Card className={`border-2 border-purple-200/80 dark:border-purple-900/40 bg-gradient-to-br from-purple-50/40 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/20 shadow-md rounded-2xl overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-800 px-4 py-2 text-white flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-amber-300" />
          <span>TalentXcel Legal &amp; Relocation Regulatory Guard</span>
        </span>
        <Badge variant="outline" className="border-white/30 text-white bg-white/10 text-[10px]">
          {region}
        </Badge>
      </div>

      <CardContent className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-lg font-black text-foreground tracking-tight">
            {guideTitle}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Interactive readiness checklist based on 2026 international labor &amp; corporate statutory guidelines.
          </p>
        </div>

        {/* Readiness Meter */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-foreground">Compliance Readiness Score:</span>
            <span className="font-extrabold text-purple-600 dark:text-purple-400 text-sm">
              {progressPercent}% Complete
            </span>
          </div>
          <Progress value={progressPercent} className="h-2.5 bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Interactive Checklist */}
        <div className="space-y-2.5">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="flex items-start gap-2.5 p-2.5 rounded-lg border bg-white dark:bg-card hover:bg-slate-50 cursor-pointer transition-colors text-xs"
            >
              <Checkbox
                checked={Boolean(checkedItems[item.id])}
                onCheckedChange={() => toggleItem(item.id)}
                className="mt-0.5"
              />
              <span className={`leading-relaxed ${checkedItems[item.id] ? 'line-through text-muted-foreground' : 'font-medium text-foreground'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* 1-Click Action Button */}
        <div className="pt-1 space-y-2">
          <Button
            onClick={handleBookConsultationOrPassport}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs h-10 rounded-xl shadow-md gap-2"
          >
            {user ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Link Verified Career Passport &amp; Review With Specialist</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Save Checklist &amp; Claim Verified Career Passport (1-Click Google)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Trusted by cross-border contractors, founders, and international professionals.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceChecklistWidget;
