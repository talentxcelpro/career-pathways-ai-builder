import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, HelpCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface InteractiveBulletImproverModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalBullet: string;
  roleTitle?: string;
  companyName?: string;
  onApplyBullet: (improvedBullet: string) => void;
}

export const InteractiveBulletImproverModal: React.FC<InteractiveBulletImproverModalProps> = ({
  isOpen,
  onClose,
  originalBullet,
  roleTitle,
  companyName,
  onApplyBullet
}) => {
  const [metricInput, setMetricInput] = useState('');
  const [teamSizeInput, setTeamSizeInput] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');

  const metricText = metricInput.trim() ? `${metricInput.trim()}%` : 'measurable outcomes';
  const teamText = teamSizeInput.trim() ? `${teamSizeInput.trim()}-person` : 'cross-functional';

  const options = [
    {
      id: 'A',
      title: 'Impact & Metrics Driven',
      text: `Spearheaded ${originalBullet.toLowerCase().replace(/^[•\-*]\s*/, '').replace(/\.$/, '')}, improving performance by ${metricText} across ${teamText} operations.`
    },
    {
      id: 'B',
      title: 'Action & Execution Focused',
      text: `Led execution of ${originalBullet.toLowerCase().replace(/^[•\-*]\s*/, '').replace(/\.$/, '')} supporting ${teamText} team objectives and strict SLA compliance.`
    },
    {
      id: 'C',
      title: 'Strategic & Process Focused',
      text: `Designed and optimized ${originalBullet.toLowerCase().replace(/^[•\-*]\s*/, '').replace(/\.$/, '')}, delivering key operational efficiencies and stakeholder alignment.`
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="w-5 h-5 text-primary" />
            Interactive Bullet Improver
          </DialogTitle>
          <DialogDescription className="text-xs">
            Refines your responsibility bullets into impact-driven accomplishments. Provide optional metrics below to customize options without fabricating claims.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Original Bullet Box */}
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Original Bullet</span>
            <p className="text-xs text-foreground font-medium">{originalBullet || "No bullet selected"}</p>
          </div>

          {/* Interactive Metric Questions */}
          <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <HelpCircle className="w-4 h-4" />
              Add Optional Metrics (We never invent numbers)
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Improvement % or Savings</label>
                <Input 
                  placeholder="e.g. 25 or $50K" 
                  value={metricInput} 
                  onChange={(e) => setMetricInput(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-foreground">Team Size or Scope</label>
                <Input 
                  placeholder="e.g. 12 or regional" 
                  value={teamSizeInput} 
                  onChange={(e) => setTeamSizeInput(e.target.value)}
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>
          </div>

          {/* AI Suggestions Options A/B/C */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Select Improved Option</label>
            {options.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelectedOption(opt.text)}
                className={`p-3 rounded-xl border text-xs leading-relaxed cursor-pointer transition-all ${
                  selectedOption === opt.text 
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' 
                    : 'border-border/60 hover:border-primary/40 bg-background'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="secondary" className="text-[10px] font-bold">Option {opt.id}: {opt.title}</Badge>
                  {selectedOption === opt.text && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-foreground">{opt.text}</p>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button 
            onClick={() => {
              if (selectedOption) {
                onApplyBullet(selectedOption);
                onClose();
                toast.success('Bullet updated cleanly');
              }
            }} 
            disabled={!selectedOption}
            size="sm" 
            className="text-xs font-semibold gap-1.5"
          >
            <Check className="w-4 h-4" />
            Apply Bullet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
