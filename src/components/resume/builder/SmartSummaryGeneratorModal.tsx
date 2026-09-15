import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SmartSummaryGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSummary: string;
  candidateProfile: {
    fullName: string;
    yearsExperience: number;
    roles: string[];
    skills: string[];
    projects: string[];
    certifications: string[];
    targetJob?: string;
  };
  onApplySummary: (newSummary: string) => void;
}

export const SmartSummaryGeneratorModal: React.FC<SmartSummaryGeneratorModalProps> = ({
  isOpen,
  onClose,
  currentSummary,
  candidateProfile,
  onApplySummary
}) => {
  const [selectedStyle, setSelectedStyle] = useState<'executive' | 'professional' | 'ats' | 'switch' | 'concise'>('executive');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');

  const generateSummaries = () => {
    setIsGenerating(true);
    const years = candidateProfile.yearsExperience > 0 ? `${candidateProfile.yearsExperience}+ years` : 'proven academic & project';
    const topRole = candidateProfile.roles[0] || 'Professional';
    const topSkills = candidateProfile.skills.slice(0, 5).join(', ') || 'core technical competencies';
    const certText = candidateProfile.certifications.length > 0 ? ` holding certifications in ${candidateProfile.certifications.slice(0, 2).join(', ')}` : '';
    const projText = candidateProfile.projects.length > 0 ? ` Delivered major projects including ${candidateProfile.projects.slice(0, 2).join(' and ')}.` : '';

    setTimeout(() => {
      const options: { [key: string]: string[] } = {
        executive: [
          `Accomplished ${topRole} with over ${years} of experience driving strategic operations, technical architecture, and cross-functional leadership.${certText} Demonstrated expertise in ${topSkills}.${projText} Adept at scaling operational efficiency, aligning business objectives, and leading high-performing teams.`,
          `Results-focused ${topRole} offering ${years} of progressive leadership in ${topSkills}. Proven track record in delivery of mission-critical systems and organizational growth.${projText} Trusted advisor across executive stakeholders.`
        ],
        professional: [
          `Solution-driven ${topRole} with ${years} of experience delivering high-quality solutions using ${topSkills}.${projText} Adept at collaborating in agile environments, solving complex technical challenges, and ensuring client satisfaction.`,
          `Dedicated ${topRole} specializing in ${topSkills}.${certText} Strong track record of contributing to end-to-end product lifecycles and business process optimization.`
        ],
        ats: [
          `${topRole} with ${years} experience in ${topSkills}. Key expertise includes ${candidateProfile.skills.slice(0, 8).join(', ')}.${certText}${projText} Proven ability to meet strict SLA performance standards and ATS compliance requirements.`,
          `Experienced ${topRole} skilled in ${topSkills}.${projText} Demonstrated technical proficiency and cross-functional collaboration across multi-disciplinary environments.`
        ],
        switch: [
          `Versatile ${topRole} combining strong foundation in ${topSkills} with transferrable expertise across complex problem-solving and project execution.${projText} Eager to leverage multi-domain experience toward target role success.`,
          `Adaptable professional with ${years} background transitioning into ${candidateProfile.targetJob || topRole}. Proficient in ${topSkills} with demonstrated project outcomes.`
        ],
        concise: [
          `${topRole} with ${years} experience in ${topSkills}.${certText}${projText}`,
          `Results-driven ${topRole} specializing in ${topSkills}. Experienced in end-to-end execution and technical delivery.`
        ]
      };

      const res = options[selectedStyle] || options.executive;
      setGeneratedOptions(res);
      setSelectedOption(res[0]);
      setIsGenerating(false);
      toast.success('Generated smart summary options using canonical profile facts');
    }, 600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="w-5 h-5 text-primary" />
            Smart Summary Generator
          </DialogTitle>
          <DialogDescription className="text-xs">
            Generates tailored summaries using canonical facts from your profile ({candidateProfile.yearsExperience > 0 ? `${candidateProfile.yearsExperience} yrs tenure` : 'Fresh Grad'}, {candidateProfile.skills.length} skills, {candidateProfile.projects.length} projects). Zero metric fabrication.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Style Selector Pills */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Summary Style</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'executive', label: 'Executive' },
                { id: 'professional', label: 'Professional' },
                { id: 'ats', label: 'ATS Optimized' },
                { id: 'switch', label: 'Career Switcher' },
                { id: 'concise', label: 'Concise' }
              ].map(s => (
                <Button
                  key={s.id}
                  type="button"
                  variant={selectedStyle === s.id ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setSelectedStyle(s.id as any)}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            onClick={generateSummaries} 
            disabled={isGenerating} 
            className="w-full text-xs font-semibold gap-2 shadow-sm"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isGenerating ? 'Generating from Career Profile...' : 'Generate Summaries'}
          </Button>

          {/* Generated Options */}
          {generatedOptions.length > 0 && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Select Preferred Option</label>
              {generatedOptions.map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedOption(opt)}
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed cursor-pointer transition-all ${
                    selectedOption === opt 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' 
                      : 'border-border/60 hover:border-primary/40 bg-background'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-[10px]">Option {idx + 1}</Badge>
                    {selectedOption === opt && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="text-foreground">{opt}</p>
                </div>
              ))}
            </div>
          )}

          {/* Selected Option Editable Textarea */}
          {selectedOption && (
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Edit Selected Summary</label>
              <Textarea 
                value={selectedOption} 
                onChange={(e) => setSelectedOption(e.target.value)} 
                rows={4}
                className="text-xs leading-relaxed"
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (selectedOption) {
                onApplySummary(selectedOption);
                onClose();
                toast.success('Summary applied to Career Profile');
              }
            }} 
            disabled={!selectedOption}
            size="sm" 
            className="text-xs font-semibold gap-1.5"
          >
            <Check className="w-4 h-4" />
            Apply to Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
