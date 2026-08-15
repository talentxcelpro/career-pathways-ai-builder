import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Palette, Check, ShieldCheck, Eye, ArrowLeft, Download, Printer, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';
import { TemplateRenderer } from "@/components/resume/templates/TemplateRenderer";

interface TemplateDefinition {
  id: string;
  name: string;
  family: string;
  category: string;
  description: string;
  atsScore: number;
  bestFor: string;
  colorPrimary: string;
}

interface IntelligentTemplateGalleryProps {
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  resumeData?: any;
}

export const IntelligentTemplateGallery: React.FC<IntelligentTemplateGalleryProps> = ({
  selectedTemplateId,
  onSelectTemplate,
  resumeData
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFamily, setActiveFamily] = useState<string>('all');
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.8);

  const templateDefinitions: TemplateDefinition[] = [
    // === ATS / CLASSIC (6) ===
    { id: 'ats-classic', name: 'ATS Classic', family: 'ats', category: 'ATS Safe', description: 'Single-column, maximum scanner safety. 100% parsing-compliant with zero graphics.', atsScore: 99, bestFor: 'Corporate HR & Mass ATS Gateways', colorPrimary: '#1f2937' },
    { id: 'ats-professional', name: 'ATS Professional', family: 'ats', category: 'ATS Safe', description: 'Clean serif typography, structured headings, no tables or columns.', atsScore: 98, bestFor: 'Finance, Legal & Government Roles', colorPrimary: '#374151' },
    { id: 'ats-compact', name: 'ATS Compact', family: 'ats', category: 'ATS Safe', description: 'Space-efficient 1-page layout maximizing content density within ATS constraints.', atsScore: 97, bestFor: 'Entry-Level & Early Career Roles', colorPrimary: '#1e40af' },
    { id: 'ats-executive-classic', name: 'ATS Executive Classic', family: 'ats', category: 'ATS Safe', description: 'Executive-scale content hierarchy within fully scanner-safe formatting.', atsScore: 96, bestFor: 'Executive & Director Applications', colorPrimary: '#1d4ed8' },
    { id: 'ats-minimal', name: 'ATS Minimal', family: 'ats', category: 'ATS Safe', description: 'Bare-minimum formatting for maximum ATS pass rate in any system.', atsScore: 100, bestFor: 'High-Volume Job Applications', colorPrimary: '#111827' },
    { id: 'ats-two-column', name: 'ATS Two Column', family: 'ats', category: 'ATS Safe', description: 'Structured two-column layout maintaining 95%+ parsing accuracy.', atsScore: 95, bestFor: 'Tech & Engineering ATS Systems', colorPrimary: '#0f172a' },

    // === MODERN PROFESSIONAL (6) ===
    { id: 'modern-blue', name: 'Modern Blue', family: 'modern', category: 'Modern', description: 'Bold blue accent with clean white space and sharp typographic hierarchy.', atsScore: 94, bestFor: 'Tech, Product & Strategy Roles', colorPrimary: '#2563eb' },
    { id: 'modern-gray', name: 'Modern Gray', family: 'modern', category: 'Modern', description: 'Slate gray professional palette with geometric accent lines.', atsScore: 93, bestFor: 'Operations, Management & Consulting', colorPrimary: '#475569' },
    { id: 'modern-split', name: 'Modern Split', family: 'modern', category: 'Modern', description: 'Two-pane layout: contact & skills left sidebar, experience right main panel.', atsScore: 88, bestFor: 'Design, Marketing & Creative Tech', colorPrimary: '#7c3aed' },
    { id: 'modern-clean', name: 'Modern Clean', family: 'modern', category: 'Modern', description: 'Minimal spacing, no borders, relies purely on typography weight and hierarchy.', atsScore: 95, bestFor: 'Startups, SaaS & Growth Roles', colorPrimary: '#059669' },
    { id: 'modern-professional', name: 'Modern Professional', family: 'modern', category: 'Modern', description: 'Balanced visual structure with top banner header and clear section dividers.', atsScore: 93, bestFor: 'General Professional Applications', colorPrimary: '#0891b2' },
    { id: 'modern-corporate', name: 'Modern Corporate', family: 'modern', category: 'Modern', description: 'Formal corporate aesthetic with logo-placement header and table-free layout.', atsScore: 94, bestFor: 'Enterprise, Banking & Professional Services', colorPrimary: '#1e3a5f' },

    // === EXECUTIVE (6) ===
    { id: 'executive-leadership', name: 'Executive Leadership', family: 'executive', category: 'Executive', description: 'Impact and scale hierarchy: P&L, headcount, revenue, and board-level outcomes first.', atsScore: 92, bestFor: 'Directors, VPs, C-Suite & Board Members', colorPrimary: '#1c1917' },
    { id: 'executive-board', name: 'Executive Board', family: 'executive', category: 'Executive', description: 'One-page executive summary followed by detailed evidence. Board bio format.', atsScore: 91, bestFor: 'Board Directors & Non-Executive Roles', colorPrimary: '#292524' },
    { id: 'executive-strategy', name: 'Executive Strategy', family: 'executive', category: 'Executive', description: 'Strategy & transformation emphasis: M&A, restructuring, growth, market entry.', atsScore: 90, bestFor: 'Chief Strategy & Transformation Officers', colorPrimary: '#1e1b4b' },
    { id: 'executive-pl', name: 'Executive P&L', family: 'executive', category: 'Executive', description: 'Revenue and EBITDA metrics block prominently featured before experience history.', atsScore: 90, bestFor: 'GMs, BU Heads, CFOs & Revenue Leaders', colorPrimary: '#14532d' },
    { id: 'executive-international', name: 'Executive International', family: 'executive', category: 'Executive', description: 'Multi-jurisdiction leadership: markets led, geographies managed, board roles.', atsScore: 89, bestFor: 'Global Executives & International Roles', colorPrimary: '#1e3a5f' },
    { id: 'executive-minimal', name: 'Executive Minimal', family: 'executive', category: 'Executive', description: 'Single-page minimal executive brief. Impact over volume.', atsScore: 92, bestFor: 'Senior Executives Targeting Board Roles', colorPrimary: '#0c0a09' },

    // === TECHNOLOGY (6) ===
    { id: 'tech-developer', name: 'Technical Developer', family: 'technical', category: 'Technical', description: 'Tech stack matrix grid, GitHub links, repository references, and project architecture blocks.', atsScore: 95, bestFor: 'Software Engineers & Full Stack Developers', colorPrimary: '#1d4ed8' },
    { id: 'tech-fullstack', name: 'Full Stack', family: 'technical', category: 'Technical', description: 'Frontend/backend split skills matrix with project-first layout.', atsScore: 95, bestFor: 'Full Stack & Polyglot Engineers', colorPrimary: '#7c3aed' },
    { id: 'tech-engmanager', name: 'Engineering Manager', family: 'technical', category: 'Technical', description: 'Balanced tech depth + people leadership: team size, delivery velocity, architecture decisions.', atsScore: 93, bestFor: 'Engineering Managers & Tech Leads', colorPrimary: '#0369a1' },
    { id: 'tech-data', name: 'Data / Analytics', family: 'technical', category: 'Technical', description: 'Data infrastructure, ML models, BI tools, and analytics outcomes prominently featured.', atsScore: 94, bestFor: 'Data Engineers, Analysts & ML Engineers', colorPrimary: '#b45309' },
    { id: 'tech-devops', name: 'DevOps / Cloud', family: 'technical', category: 'Technical', description: 'Cloud certifications, infrastructure metrics, uptime, CI/CD pipelines, and IaC highlighted.', atsScore: 95, bestFor: 'DevOps, SRE & Cloud Engineers', colorPrimary: '#0f766e' },
    { id: 'tech-product', name: 'Product / Technology', family: 'technical', category: 'Technical', description: 'Product outcome focus: MAU, NPS, feature delivery, cross-functional leadership.', atsScore: 93, bestFor: 'Product Managers & Product Leaders', colorPrimary: '#7e22ce' },

    // === FRESH GRADUATE (4) ===
    { id: 'grad-classic', name: 'Graduate Classic', family: 'graduate', category: 'Fresh Graduate', description: 'Education-first layout: GPA, honors, capstone projects, and internship emphasis.', atsScore: 96, bestFor: 'Recent Graduates & Final Year Students', colorPrimary: '#1d4ed8' },
    { id: 'grad-modern', name: 'Graduate Modern', family: 'graduate', category: 'Fresh Graduate', description: 'Project portfolio emphasis with clean modern design and skills matrix.', atsScore: 94, bestFor: 'STEM Graduates & CS Students', colorPrimary: '#7c3aed' },
    { id: 'grad-projects', name: 'Student Projects', family: 'graduate', category: 'Fresh Graduate', description: 'Projects above experience. Ideal for candidates with strong academic project history.', atsScore: 93, bestFor: 'Bootcamp Grads & Self-Taught Developers', colorPrimary: '#059669' },
    { id: 'grad-academic', name: 'Academic Starter', family: 'graduate', category: 'Fresh Graduate', description: 'Research-oriented layout: publications, thesis, academic awards, and GPA block.', atsScore: 95, bestFor: 'Research, PhD Candidates & Academics', colorPrimary: '#0f172a' },

    // === SALES / BUSINESS (4) ===
    { id: 'sales-enterprise', name: 'Enterprise Sales', family: 'sales', category: 'Sales & Business', description: 'Quota attainment % banner, ARR, account list, and win rate table prominently displayed.', atsScore: 93, bestFor: 'Enterprise AEs, Sales Directors & VP Sales', colorPrimary: '#b91c1c' },
    { id: 'sales-leadership', name: 'Sales Leadership', family: 'sales', category: 'Sales & Business', description: 'Team size, revenue targets, territory, and pipeline coverage metrics lead every role.', atsScore: 92, bestFor: 'Sales Managers & Sales Operations Leaders', colorPrimary: '#991b1b' },
    { id: 'sales-bizdev', name: 'Business Development', family: 'sales', category: 'Sales & Business', description: 'Partnership, channel, and BD-centric outcomes: deal size, pipeline built, partners onboarded.', atsScore: 91, bestFor: 'BDMs, Partnership & Channel Sales Roles', colorPrimary: '#92400e' },
    { id: 'sales-consulting', name: 'Consulting / Strategy', family: 'sales', category: 'Sales & Business', description: 'Engagement-based layout: client industry, problem solved, methodology, and business impact.', atsScore: 92, bestFor: 'Management Consultants & Strategy Leads', colorPrimary: '#1e3a5f' },

    // === FINANCE / OPERATIONS (4) ===
    { id: 'finance-professional', name: 'Finance Professional', family: 'finance', category: 'Finance & Ops', description: 'Certifications block (CPA/ACCA/CFA) prominently featured. Budget ownership and controls structured.', atsScore: 96, bestFor: 'Finance Managers, CPAs & Controllers', colorPrimary: '#065f46' },
    { id: 'finance-controller', name: 'Financial Controller', family: 'finance', category: 'Finance & Ops', description: 'SOX compliance, ERP systems, audit outcomes, and reporting hierarchy prominently featured.', atsScore: 95, bestFor: 'Financial Controllers & Finance Directors', colorPrimary: '#0f4c2a' },
    { id: 'ops-leader', name: 'Operations Leader', family: 'finance', category: 'Finance & Ops', description: 'Process improvement, supply chain, SLA metrics, and operational KPI improvement blocks.', atsScore: 94, bestFor: 'Operations Managers, SCM & Logistics Leaders', colorPrimary: '#7c2d12' },
    { id: 'hr-people', name: 'HR / People', family: 'finance', category: 'Finance & Ops', description: 'People ops focus: headcount, hiring metrics, retention, L&D programs, and HRBP experience.', atsScore: 93, bestFor: 'HR Business Partners, CHROs & Talent Leaders', colorPrimary: '#701a75' },
  ];

  const families = [
    { id: 'all', label: 'All (36)' },
    { id: 'ats', label: 'ATS Safe' },
    { id: 'modern', label: 'Modern' },
    { id: 'executive', label: 'Executive' },
    { id: 'technical', label: 'Technical' },
    { id: 'graduate', label: 'Fresh Graduate' },
    { id: 'sales', label: 'Sales & Business' },
    { id: 'finance', label: 'Finance & Ops' },
  ];

  const filteredTemplates = templateDefinitions.filter(t => {
    const matchesFamily = activeFamily === 'all' || t.family === activeFamily;
    const matchesSearch = !searchQuery || 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.bestFor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFamily && matchesSearch;
  });

  // Full-screen preview mode
  if (previewTemplateId) {
    const previewTemplate = templateDefinitions.find(t => t.id === previewTemplateId);
    return (
      <div className="flex flex-col space-y-4">
        {/* Preview Header */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card shadow-sm sticky top-0 z-10">
          <Button
            onClick={() => setPreviewTemplateId(null)}
            variant="ghost"
            size="sm"
            className="text-xs font-semibold gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Templates
          </Button>
          <div className="text-sm font-bold text-foreground">{previewTemplate?.name}</div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setZoom(z => Math.max(0.4, z - 0.1))}
              variant="ghost" size="sm" className="h-8 w-8 p-0"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
            <Button
              onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
              variant="ghost" size="sm" className="h-8 w-8 p-0"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </Button>
            <Button
              onClick={() => {
                onSelectTemplate(previewTemplateId);
                setPreviewTemplateId(null);
                toast.success(`Template "${previewTemplate?.name}" applied`);
              }}
              size="sm"
              className="text-xs font-bold gap-1.5 bg-primary text-primary-foreground"
            >
              <Check className="w-3.5 h-3.5" />
              Use This Template
            </Button>
            <Button
              onClick={() => toast.info('PDF export available via Save Master Profile')}
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              PDF
            </Button>
          </div>
        </div>

        {/* Full-Screen Resume Preview */}
        <div className="flex justify-center overflow-auto pb-8">
          <div
            className="bg-white shadow-2xl rounded border border-border/20"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              width: '794px',
              minHeight: '1123px',
            }}
          >
            {resumeData ? (
              <TemplateRenderer
                template={previewTemplateId}
                resumeData={resumeData}
                customization={{
                  colorScheme: {
                    id: 'preview',
                    name: 'Preview',
                    primary: previewTemplate?.colorPrimary || '#2563eb',
                    secondary: '#6b7280',
                    accent: '#10b981',
                    text: '#1f2937',
                    background: '#ffffff',
                    isDefault: false
                  },
                  fontFamily: 'Inter',
                  fontSize: 11,
                  spacing: 'normal',
                  sections: [],
                  layout: { headerStyle: 'centered', sectionSpacing: 'normal', borderStyle: 'subtle', iconStyle: 'minimal' }
                }}
                sectionOrder={['personalInfo', 'summary', 'experience', 'projects', 'education', 'skills', 'certifications']}
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground text-sm">
                No career data loaded yet. Add your career information in the MY CAREER tab first.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Template Gallery
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <div>
            <h3 className="text-base font-bold text-foreground">Resume Template Gallery</h3>
            <p className="text-xs text-muted-foreground">36 professionally crafted templates — data preserved across all template switches</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold">
          36 Templates · 8 Families
        </Badge>
      </div>

      {/* Search & Filter */}
      <div className="space-y-3">
        <Input
          placeholder="Search templates by name, role, or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 text-xs bg-background"
        />
        <div className="flex flex-wrap gap-2">
          {families.map(f => (
            <Button
              key={f.id}
              type="button"
              variant={activeFamily === f.id ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 font-semibold"
              onClick={() => setActiveFamily(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Data Preservation Notice */}
      <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 text-xs text-emerald-800 dark:text-emerald-300">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span><strong>Presentation vs Data Separation:</strong> Changing templates alters layout and styling ONLY. Your career history, skills, projects, and all facts remain 100% unchanged.</span>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTemplates.map((t) => {
          const isSelected = selectedTemplateId === t.id;
          return (
            <div
              key={t.id}
              className={`rounded-xl border p-4 cursor-pointer transition-all space-y-3 relative bg-background ${
                isSelected
                  ? 'ring-2 ring-primary border-primary shadow-md bg-primary/5'
                  : 'border-border/60 hover:border-primary/40 hover:shadow-sm'
              }`}
            >
              {/* Template Color Preview Bar */}
              <div
                className="h-2 rounded-full w-full"
                style={{ background: t.colorPrimary }}
              />

              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px] font-bold">{t.category}</Badge>
                <span className="text-xs font-bold" style={{ color: t.atsScore >= 95 ? '#16a34a' : '#d97706' }}>
                  ATS {t.atsScore}%
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-foreground">{t.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.description}</p>
              </div>

              <p className="text-[11px] text-muted-foreground border-t pt-2">
                Best for: <span className="font-medium text-foreground">{t.bestFor}</span>
              </p>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 h-7 text-xs gap-1 font-semibold"
                  onClick={() => setPreviewTemplateId(t.id)}
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className={`flex-1 h-7 text-xs gap-1 font-semibold ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => {
                    onSelectTemplate(t.id);
                    toast.success(`Template "${t.name}" applied`);
                  }}
                >
                  {isSelected ? <Check className="w-3 h-3" /> : null}
                  {isSelected ? 'Applied' : 'Use'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No templates match your search. Try a different keyword or clear the filter.
        </div>
      )}
    </div>
  );
};
