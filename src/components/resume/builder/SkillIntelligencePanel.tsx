import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Wrench, 
  Plus, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  Code, 
  Users 
} from 'lucide-react';
import { toast } from 'sonner';

interface SkillIntelligencePanelProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  targetJobSkills?: string[];
}

export const SkillIntelligencePanel: React.FC<SkillIntelligencePanelProps> = ({
  skills = [],
  onChange,
  targetJobSkills = []
}) => {
  const [newSkillInput, setNewSkillInput] = useState('');

  // Canonicalize & Deduplicate Skills
  const deduplicateSkills = (skillArray: string[]): string[] => {
    const map = new Map<string, string>();
    skillArray.forEach(s => {
      if (!s || typeof s !== 'string') return;
      const trimmed = s.trim();
      if (trimmed.length < 2) return;
      const lower = trimmed.toLowerCase();
      if (!map.has(lower)) {
        map.set(lower, trimmed);
      }
    });
    return Array.from(map.values());
  };

  const currentSkills = deduplicateSkills(skills);

  const handleAddSkill = () => {
    const text = newSkillInput.trim();
    if (!text) return;
    if (!currentSkills.some(s => s.toLowerCase() === text.toLowerCase())) {
      const updated = deduplicateSkills([...currentSkills, text]);
      onChange(updated);
      toast.success(`Added skill: ${text}`);
    } else {
      toast.info(`Skill "${text}" already exists`);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = currentSkills.filter(s => s.toLowerCase() !== skillToRemove.toLowerCase());
    onChange(updated);
  };

  const handleAddMissingSkill = (missingSkill: string) => {
    if (!currentSkills.some(s => s.toLowerCase() === missingSkill.toLowerCase())) {
      const updated = deduplicateSkills([...currentSkills, missingSkill]);
      onChange(updated);
      toast.success(`Added missing skill: ${missingSkill}`);
    }
  };

  const handleNormalizeAll = () => {
    const normalized = deduplicateSkills(currentSkills);
    onChange(normalized);
    toast.success('Skill names normalized & deduplicated cleanly');
  };

  // Categorize skills
  const categorized = {
    technical: currentSkills.filter(s => /react|node|js|ts|python|java|sql|mongo|express|nest|azure|aws|docker|git|html|css|c\+\+|php/i.test(s)),
    domain: currentSkills.filter(s => /data center|m&e|lvap|hvap|bms|cmms|p&l|sox|cpa|audit|quota|saas|resilience|hvac|ups/i.test(s)),
    leadership: currentSkills.filter(s => /leadership|management|agile|scrum|strategy|team|operations|executive/i.test(s)),
    other: currentSkills.filter(s => !/react|node|js|ts|python|java|sql|mongo|express|nest|azure|aws|docker|git|html|css|c\+\+|php|data center|m&e|lvap|hvap|bms|cmms|p&l|sox|cpa|audit|quota|saas|resilience|hvac|ups|leadership|management|agile|scrum|strategy|team|operations|executive/i.test(s))
  };

  const missingSkills = targetJobSkills.filter(
    ts => !currentSkills.some(cs => cs.toLowerCase() === ts.toLowerCase())
  );

  return (
    <Card className="border-border/60 shadow-sm mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-primary" />
          <div>
            <CardTitle className="text-base font-bold text-foreground">Skills Intelligence & Categorization</CardTitle>
            <p className="text-xs text-muted-foreground">Canonical skills deduplicated with casing normalization</p>
          </div>
        </div>
        <Button onClick={handleNormalizeAll} variant="outline" size="sm" className="gap-1.5 text-xs font-medium border-primary/30 text-primary">
          <Sparkles className="w-3.5 h-3.5" />
          Normalize & Clean
        </Button>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Add Skill Input */}
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Type a skill (e.g. React, P&L Management, SAP ERP) and press Enter"
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            className="text-xs"
          />
          <Button onClick={handleAddSkill} size="sm" className="text-xs shrink-0 font-semibold gap-1">
            <Plus className="w-3.5 h-3.5" />
            Add Skill
          </Button>
        </div>

        {/* Missing Target Job Skills Notification */}
        {missingSkills.length > 0 && (
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Missing Target Job Skills ({missingSkills.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map((ms, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  onClick={() => handleAddMissingSkill(ms)}
                  className="text-xs border-amber-400/50 text-amber-900 dark:text-amber-200 bg-background/80 hover:bg-amber-500/20 cursor-pointer gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {ms}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Categorized Skills View */}
        <div className="space-y-4">
          {/* Technical Skills */}
          {categorized.technical.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-blue-500" />
                Technical & Engineering ({categorized.technical.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categorized.technical.map((s, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs gap-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20">
                    {s}
                    <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleRemoveSkill(s)} />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Domain Skills */}
          {categorized.domain.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                Domain & Specialized ({categorized.domain.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categorized.domain.map((s, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs gap-1.5 bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20">
                    {s}
                    <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleRemoveSkill(s)} />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Leadership Skills */}
          {categorized.leadership.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                Leadership & Strategy ({categorized.leadership.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categorized.leadership.map((s, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">
                    {s}
                    <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleRemoveSkill(s)} />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Other Skills */}
          {categorized.other.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                Core Professional ({categorized.other.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {categorized.other.map((s, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs gap-1.5 bg-muted text-foreground border-border/60">
                    {s}
                    <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => handleRemoveSkill(s)} />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
