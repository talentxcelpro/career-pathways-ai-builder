import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { useResumeData } from "@/hooks/useResumeData";
import { useResumeExport, ExportSettings } from "@/hooks/useResumeExport";
import { useSectionEnhancer } from "@/hooks/useSectionEnhancer";
import { toast } from "sonner";
import { Sparkles, Download, Save, Target, FileText, Layout } from "lucide-react";
import { JobTargetingPanel } from "@/components/resume/enhanced/JobTargetingPanel";
import { TemplateRenderer } from "@/components/resume/templates/TemplateRenderer";
import { resumeTemplates } from "@/data/resumeTemplates";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Simple Sortable item for sections list
function SortableItem({ id, label, selected, onSelect }: { id: string; label: string; selected: boolean; onSelect: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <button ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onSelect(id)}
      className={`w-full text-left px-3 py-2 rounded border mb-2 ${selected ? 'bg-accent/10 border-accent' : 'hover:bg-muted/50'}`}
    >
      {label}
    </button>
  );
}

// Section keys and labels
const SECTION_LABELS: Record<string, string> = {
  header: "Header",
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  awards: "Awards",
  languages: "Languages",
  coverLetter: "Cover Letter",
};

// Template type
type ResumeTemplate = {
  id: string;
  name: string;
  preview_url?: string | null;
  template_config?: any;
  category?: string | null;
  is_premium?: boolean | null;
};

const DEFAULT_SECTIONS = [
  "header",
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "awards",
  "coverLetter",
];

const getDefaultResumeJSON = () => ({
  profile: { fullName: "", email: "", phone: "", location: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  awards: [],
  coverLetter: ""
});

const Toolbar = ({
  onExport,
  onRunATS,
  exportBusy,
  onImprove,
  selectedSection,
  templates,
  selectedTemplateId,
  onSelectTemplate,
}: {
  onExport: (format: 'pdf' | 'docx') => void;
  onRunATS: () => void;
  exportBusy: boolean;
  onImprove: () => void;
  selectedSection?: string | null;
  templates: ResumeTemplate[];
  selectedTemplateId?: string;
  onSelectTemplate: (id: string) => void;
}) => {
  const [activeTab, setActiveTab] = useState('edit');

  return (
    <aside className="w-80 border-r px-4 py-4 flex flex-col h-screen overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="edit" className="text-xs">
            <FileText className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="enhance" className="text-xs">
            <Sparkles className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="ats" className="text-xs">
            <Target className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">
            <Layout className="h-3 w-3" />
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="edit" className="mt-0 space-y-4">
            <section className="pt-2">
              <h2 className="text-sm font-medium mb-3">Edit Content</h2>
              <p className="text-xs text-muted-foreground">Select a section below to edit</p>
            </section>
          </TabsContent>

          <TabsContent value="enhance" className="mt-0 space-y-4">
            <section>
              <h2 className="text-sm font-medium mb-3">AI Enhance</h2>
              <Button onClick={onImprove} disabled={!selectedSection} size="sm" className="w-full">
                <Sparkles className="h-3 w-3 mr-2" />
                Improve {selectedSection ? SECTION_LABELS[selectedSection] : 'Section'}
              </Button>
            </section>
          </TabsContent>

          <TabsContent value="ats" className="mt-0 space-y-4">
            <section>
              <h2 className="text-sm font-medium mb-3">ATS Score</h2>
              <Button onClick={onRunATS} size="sm" className="w-full">
                <Target className="h-3 w-3 mr-2" />
                Run ATS Check
              </Button>
            </section>
          </TabsContent>

          <TabsContent value="templates" className="mt-0 space-y-3">
            <section>
              <h2 className="text-sm font-medium mb-3">Templates</h2>
              <p className="text-xs text-muted-foreground mb-4">Choose from {templates.length} professional templates</p>
              <div className="space-y-3">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplateId === template.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => onSelectTemplate(template.id)}
                  >
                    <div className="p-3 space-y-2">
                      <div className="aspect-[8.5/11] bg-gradient-to-br from-muted to-muted/50 rounded flex items-center justify-center text-xs text-muted-foreground">
                        {template.name}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm line-clamp-1">{template.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{(template as any).description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          ATS {(template as any).atsScore || 90}%
                        </Badge>
                        {selectedTemplateId === template.id && (
                          <Badge variant="default" className="text-xs">Selected</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>
        </div>

        <div className="pt-4 border-t space-y-2">
          <Button onClick={() => onExport('pdf')} variant="outline" size="sm" className="w-full" disabled={exportBusy}>
            <Download className="h-3 w-3 mr-2" />
            PDF
          </Button>
          <Button onClick={() => onExport('docx')} variant="outline" size="sm" className="w-full" disabled={exportBusy}>
            <Download className="h-3 w-3 mr-2" />
            DOCX
          </Button>
        </div>
      </Tabs>
    </aside>
  );
};

const defaultCustomization = {
  colors: {},
  typography: {},
  layout: {},
  sections: { showPhoto: false, showSummary: true }
};

const Preview = ({ data, templateId, variant = 'sidebar', sectionOrder }: { data: any; templateId?: string; variant?: 'sidebar' | 'full'; sectionOrder?: string[] }) => {
  const [showJSON, setShowJSON] = useState(false);
  const Wrapper: React.ElementType = variant === 'sidebar' ? 'aside' : 'div';
  const wrapperCls = variant === 'sidebar'
    ? 'w-[38%] border-l px-5 py-5 overflow-auto'
    : 'flex-1 px-6 py-6 overflow-auto';

  const buildRendererData = useCallback((source: any) => {
    if (!source) {
      return {
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          location: '',
          summary: '',
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
      };
    }

    const personal = source.personalInfo || source.profile || {};
    const experience = Array.isArray(source.experience) ? source.experience.map((it: any) => ({
      title: it.title || it.role || '',
      company: it.company || '',
      location: it.location || '',
      startDate: it.startDate || it.start || '',
      endDate: it.endDate || it.end || '',
      description: it.description || '',
      achievements: it.achievements || it.bullets || [],
      technologies: it.technologies || [],
    })) : [];

    const education = Array.isArray(source.education) ? source.education.map((it: any) => ({
      degree: it.degree || '',
      school: it.school || it.institution || '',
      location: it.location || '',
      startDate: it.startDate || '',
      endDate: it.endDate || it.dates || '',
      gpa: it.gpa || '',
      honors: it.honors || '',
    })) : [];

    const rawSkills = source.skills;
    const skills = Array.isArray(rawSkills)
      ? { technical: rawSkills }
      : (rawSkills || { technical: [] });

    const certifications = Array.isArray(source.certifications)
      ? source.certifications.map((c: any) => (typeof c === 'string' ? { name: c } : c))
      : [];

    return {
      personalInfo: {
        fullName: personal.fullName || personal.name || '',
        email: personal.email || '',
        phone: personal.phone || '',
        location: personal.location || '',
        summary: source.summary || personal.summary || '',
      },
      experience,
      education,
      skills: Array.isArray(rawSkills) ? rawSkills : [],
      projects: Array.isArray(source.projects) ? source.projects : [],
    };
  }, []);

  const rendererData = useMemo(() => buildRendererData(data), [buildRendererData, data]);

  return (
    <Wrapper className={wrapperCls}>
      <div className="max-w-3xl mx-auto bg-background shadow-sm rounded-md p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Preview</h2>
          <button className="text-xs rounded border px-2 py-1" onClick={() => setShowJSON(v => !v)}>
            {showJSON ? 'Hide' : 'Show'} parsed JSON
          </button>
        </div>
        <TemplateRenderer template={templateId || 'two-col'} resumeData={rendererData} customization={defaultCustomization} sectionOrder={sectionOrder} />
        {showJSON && (
          <div className="mt-4">
            <pre className="text-xs max-h-64 overflow-auto border rounded p-2 bg-muted/30">
              {JSON.stringify(rendererData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

const SectionEditor = ({ section, data, onChange, onLiveChange }: { section: string; data: any; onChange: (next: any) => void; onLiveChange?: (next: any) => void }) => {
  const [local, setLocal] = useState<any>(data || {});
  const { enhanceSection } = useSectionEnhancer();
  // Cover letter generator UI state (used only when editing cover letter)
  const [clCompany, setClCompany] = useState<string>('');
  const [clRole, setClRole] = useState<string>('');
  const [clTone, setClTone] = useState<'professional' | 'bold' | 'conservative'>('professional');
  const [clJD, setClJD] = useState<string>('');
  const [isGeneratingCL, setIsGeneratingCL] = useState<boolean>(false);

  useEffect(() => setLocal(data || {}), [data]);

  const save = () => onChange(local);
  
  // Real-time preview updates
  const updateLive = (newData: any) => {
    setLocal(newData);
    onLiveChange?.(newData);
  };

  if (section === 'header') {
    const p = local.personalInfo || local.profile || {};
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Full Name</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={p.fullName || p.name || ''}
              onChange={(e) => {
                const nextP = { ...p, fullName: e.target.value };
                const nextData = { ...local, personalInfo: nextP };
                updateLive(nextData);
              }} />
          </div>
          <div>
            <label className="text-sm">Title</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={p.title || ''}
              onChange={(e) => {
                const nextP = { ...p, title: e.target.value };
                const nextData = { ...local, personalInfo: nextP };
                updateLive(nextData);
              }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Email</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={p.email || ''}
              onChange={(e) => {
                const nextP = { ...p, email: e.target.value };
                const nextData = { ...local, personalInfo: nextP };
                updateLive(nextData);
              }} />
          </div>
          <div>
            <label className="text-sm">Phone</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={p.phone || ''}
              onChange={(e) => {
                const nextP = { ...p, phone: e.target.value };
                const nextData = { ...local, personalInfo: nextP };
                updateLive(nextData);
              }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Location</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={p.location || ''}
              onChange={(e) => {
                const nextP = { ...p, location: e.target.value };
                const nextData = { ...local, personalInfo: nextP };
                updateLive(nextData);
              }} />
          </div>
          <div>
            <label className="text-sm">LinkedIn</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={p.linkedin || ''}
              onChange={(e) => {
                const nextP = { ...p, linkedin: e.target.value };
                const nextData = { ...local, personalInfo: nextP };
                updateLive(nextData);
              }} />
          </div>
        </div>
        <div>
          <label className="text-sm">Website/Portfolio</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={p.website || p.portfolio || ''}
            onChange={(e) => {
              const nextP = { ...p, website: e.target.value, portfolio: e.target.value };
              const nextData = { ...local, personalInfo: nextP };
              updateLive(nextData);
            }} />
        </div>
        <button onClick={save} className="rounded border px-3 py-2">Save</button>
      </div>
    );
  }

  if (section === 'summary') {
    const text = local.summary || '';
    const enhance = async () => {
      try {
        const improved = await enhanceSection({ section: 'summary' as any, text, targetRole: undefined, atsJson: undefined });
        const nextData = { ...local, summary: improved };
        updateLive(nextData);
      } catch {}
    };
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm">Summary</label>
          <button onClick={enhance} className="text-xs inline-flex items-center gap-1 rounded border px-2 py-1"><Sparkles className="h-3 w-3" /> Enhance</button>
        </div>
        <textarea className="mt-1 w-full border rounded px-3 py-2 h-40" value={text}
          onChange={(e) => {
            const nextData = { ...local, summary: e.target.value };
            updateLive(nextData);
          }} />
        <button onClick={save} className="rounded border px-3 py-2">Save</button>
      </div>
    );
  }

  if (section === 'experience') {
    const exp = Array.isArray(local.experience) ? local.experience : [];
    return (
      <div className="space-y-3">
        <button className="rounded border px-3 py-2" onClick={() => setLocal({ ...local, experience: [...exp, { role: '', company: '', start: '', end: '', bullets: [''] }] })}>+ Add role</button>
        <div className="space-y-3">
          {exp.map((item: any, i: number) => (
            <div key={i} className="border rounded p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Role" className="w-full border rounded px-3 py-2" value={item.role || ''}
                  onChange={(e) => {
                    const next = [...exp];
                    next[i] = { ...next[i], role: e.target.value };
                    setLocal({ ...local, experience: next });
                  }} />
                <input placeholder="Company" className="w-full border rounded px-3 py-2" value={item.company || ''}
                  onChange={(e) => {
                    const next = [...exp];
                    next[i] = { ...next[i], company: e.target.value };
                    setLocal({ ...local, experience: next });
                  }} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Start (e.g., 2022-01)" className="w-full border rounded px-3 py-2" value={item.start || ''}
                  onChange={(e) => {
                    const next = [...exp];
                    next[i] = { ...next[i], start: e.target.value };
                    setLocal({ ...local, experience: next });
                  }} />
                <input placeholder="End (or Present)" className="w-full border rounded px-3 py-2" value={item.end || ''}
                  onChange={(e) => {
                    const next = [...exp];
                    next[i] = { ...next[i], end: e.target.value };
                    setLocal({ ...local, experience: next });
                  }} />
              </div>
              <div className="flex justify-end">
                <button
                  className="text-xs inline-flex items-center gap-1 rounded border px-2 py-1"
                  onClick={async () => {
                    try {
                      const improved = await enhanceSection({ section: 'experience' as any, field: 'bullets[0]', text: item.bullets?.[0] || '', targetRole: undefined, atsJson: undefined });
                      const next = [...exp];
                      next[i] = { ...next[i], bullets: [improved] };
                      setLocal({ ...local, experience: next });
                    } catch {}
                  }}
                >
                  <Sparkles className="h-3 w-3" /> Enhance bullet
                </button>
              </div>
              <textarea placeholder="Top bullet/achievement" className="w-full border rounded px-3 py-2 h-24" value={item.bullets?.[0] || ''}
                onChange={(e) => {
                  const next = [...exp];
                  next[i] = { ...next[i], bullets: [e.target.value] };
                  setLocal({ ...local, experience: next });
                }} />
              <div className="flex justify-end">
                <button className="text-xs text-destructive" onClick={() => setLocal({ ...local, experience: exp.filter((_: any, idx: number) => idx !== i) })}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={save} className="rounded border px-3 py-2">Save</button>
      </div>
    );
  }

  if (section === 'education') {
    const list = Array.isArray(local.education) ? local.education : [];
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button className="rounded border px-3 py-2" onClick={() => setLocal({ ...local, education: [...list, { degree: '', school: '', startDate: '', endDate: '', gpa: '' }] })}>+ Add education</button>
          <button
            className="text-xs inline-flex items-center gap-1 rounded border px-2 py-1"
            onClick={async () => {
              try {
                const educationText = list.map((item: any) => `${item.degree} at ${item.school}`).join(', ');
                const improved = await enhanceSection({ section: 'education' as any, field: 'education', text: educationText, targetRole: undefined, atsJson: undefined });
                toast.success('Education section enhanced');
              } catch {}
            }}
          >
            <Sparkles className="h-3 w-3" /> Enhance all
          </button>
        </div>
        <div className="space-y-3">
          {list.map((item: any, i: number) => (
            <div key={i} className="border rounded p-3 space-y-2">
              <input placeholder="Degree" className="w-full border rounded px-3 py-2" value={item.degree || ''}
                onChange={(e) => {
                  const next = [...list];
                  next[i] = { ...next[i], degree: e.target.value };
                  setLocal({ ...local, education: next });
                }} />
              <input placeholder="School" className="w-full border rounded px-3 py-2" value={item.school || ''}
                onChange={(e) => {
                  const next = [...list];
                  next[i] = { ...next[i], school: e.target.value };
                  setLocal({ ...local, education: next });
                }} />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Start" className="w-full border rounded px-3 py-2" value={item.startDate || ''}
                  onChange={(e) => {
                    const next = [...list];
                    next[i] = { ...next[i], startDate: e.target.value };
                    setLocal({ ...local, education: next });
                  }} />
                <input placeholder="End" className="w-full border rounded px-3 py-2" value={item.endDate || ''}
                  onChange={(e) => {
                    const next = [...list];
                    next[i] = { ...next[i], endDate: e.target.value };
                    setLocal({ ...local, education: next });
                  }} />
              </div>
              <input placeholder="GPA (optional)" className="w-full border rounded px-3 py-2" value={item.gpa || ''}
                onChange={(e) => {
                  const next = [...list];
                  next[i] = { ...next[i], gpa: e.target.value };
                  setLocal({ ...local, education: next });
                }} />
              <div className="flex justify-end">
                <button className="text-xs text-destructive" onClick={() => setLocal({ ...local, education: list.filter((_: any, idx: number) => idx !== i) })}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={save} className="rounded border px-3 py-2">Save</button>
      </div>
    );
  }

  if (section === 'skills') {
    const list = Array.isArray(local.skills) ? local.skills : [];
    const asText = list.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean).join(', ');
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm">Skills (comma separated)</label>
          <button
            className="text-xs inline-flex items-center gap-1 rounded border px-2 py-1"
            onClick={async () => {
              try {
                const improved = await enhanceSection({ section: 'skills' as any, field: 'skills', text: asText, targetRole: undefined, atsJson: undefined });
                const names = improved.split(',').map((x: string) => x.trim()).filter(Boolean);
                setLocal({ ...local, skills: names });
              } catch {}
            }}
          >
            <Sparkles className="h-3 w-3" /> Enhance skills
          </button>
        </div>
        <input className="mt-1 w-full border rounded px-3 py-2" defaultValue={asText}
          onBlur={(e) => {
            const names = e.target.value.split(',').map((x) => x.trim()).filter(Boolean);
            setLocal({ ...local, skills: names });
          }} />
        <div className="flex flex-wrap gap-1">
          {list.map((s: any, i: number) => (
            <span key={i} className="text-xs border rounded px-2 py-1">{typeof s === 'string' ? s : (s?.name || '')}</span>
          ))}
        </div>
        <button onClick={save} className="rounded border px-3 py-2">Save</button>
      </div>
    );
  }

  if (section === 'projects' || section === 'certifications' || section === 'awards') {
    const key = section;
    const list = Array.isArray(local[key]) ? local[key] : [];
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button className="rounded border px-3 py-2" onClick={() => setLocal({ ...local, [key]: [...list, { title: '', org: '', date: '', description: '' }] })}>+ Add {SECTION_LABELS[key] || key}</button>
          <button
            className="text-xs inline-flex items-center gap-1 rounded border px-2 py-1"
            onClick={async () => {
              try {
                const sectionText = list.map((item: any) => `${item.title || item.name} - ${item.description || ''}`).join('\n');
                const improved = await enhanceSection({ section: key as any, field: 'all', text: sectionText, targetRole: undefined, atsJson: undefined });
                toast.success(`${SECTION_LABELS[key]} section enhanced`);
              } catch {}
            }}
          >
            <Sparkles className="h-3 w-3" /> Enhance all
          </button>
        </div>
        <div className="space-y-3">
          {list.map((item: any, i: number) => (
            <div key={i} className="border rounded p-3 space-y-2">
              <input placeholder={section === 'certifications' ? 'Certification' : 'Title'} className="w-full border rounded px-3 py-2" value={item.title || item.name || ''}
                onChange={(e) => {
                  const next = [...list];
                  next[i] = { ...next[i], title: e.target.value, name: e.target.value };
                  setLocal({ ...local, [key]: next });
                }} />
              <input placeholder={section === 'awards' ? 'Issuer' : 'Organization'} className="w-full border rounded px-3 py-2" value={item.org || item.issuer || ''}
                onChange={(e) => {
                  const next = [...list];
                  next[i] = { ...next[i], org: e.target.value, issuer: e.target.value };
                  setLocal({ ...local, [key]: next });
                }} />
              <input placeholder="Date" className="w-full border rounded px-3 py-2" value={item.date || ''}
                onChange={(e) => {
                  const next = [...list];
                  next[i] = { ...next[i], date: e.target.value };
                  setLocal({ ...local, [key]: next });
                }} />
              <div className="flex justify-end">
                <button
                  className="text-xs inline-flex items-center gap-1 rounded border px-2 py-1"
                  onClick={async () => {
                    try {
                      const improved = await enhanceSection({ section: key as any, field: 'description', text: item.description || '', targetRole: undefined, atsJson: undefined });
                      const next = [...list];
                      next[i] = { ...next[i], description: improved };
                      setLocal({ ...local, [key]: next });
                    } catch {}
                    }}
                >
                  <Sparkles className="h-3 w-3" /> Enhance description
                </button>
              </div>
              <textarea placeholder="Description" className="w-full border rounded px-3 py-2 h-24" value={item.description || ''}
                onChange={(e) => {
                  const next = [...list];
                  next[i] = { ...next[i], description: e.target.value };
                  setLocal({ ...local, [key]: next });
                }} />
              <div className="flex justify-end">
                <button className="text-xs text-destructive" onClick={() => setLocal({ ...local, [key]: list.filter((_: any, idx: number) => idx !== i) })}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={save} className="rounded border px-3 py-2">Save</button>
      </div>
    );
  }

  if (section === 'coverLetter') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm">Cover Letter</label>
          <button
            className="text-xs inline-flex items-center gap-1 rounded border px-2 py-1"
            onClick={async () => {
              try {
                const improved = await enhanceSection({ section: 'coverLetter' as any, field: 'coverLetter', text: local.coverLetter || '', targetRole: undefined, atsJson: undefined });
                const nextData = { ...local, coverLetter: improved };
                updateLive(nextData);
              } catch {}
            }}
          >
            <Sparkles className="h-3 w-3" /> Enhance
          </button>
        </div>

        {/* Generator controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded border p-3 bg-muted/10">
          <input
            placeholder="Company (optional)"
            className="w-full border rounded px-3 py-2"
            value={clCompany}
            onChange={(e) => setClCompany(e.target.value)}
          />
          <input
            placeholder="Role (optional)"
            className="w-full border rounded px-3 py-2"
            value={clRole}
            onChange={(e) => setClRole(e.target.value)}
          />
          <div>
            <label className="text-xs text-muted-foreground">Tone</label>
            <select
              className="mt-1 w-full border rounded px-3 py-2"
              value={clTone}
              onChange={(e) => setClTone(e.target.value as any)}
            >
              <option value="professional">Professional</option>
              <option value="bold">Bold</option>
              <option value="conservative">Conservative</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground">Paste Job Description (optional)</label>
            <textarea
              className="mt-1 w-full border rounded px-3 py-2 h-28"
              placeholder="Paste the JD here to tailor the cover letter"
              value={clJD}
              onChange={(e) => setClJD(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              className="text-xs rounded border px-3 py-2"
              disabled={isGeneratingCL}
              onClick={async () => {
                try {
                  setIsGeneratingCL(true);
                  const { data, error } = await supabase.functions.invoke('ai-resume-enhancer', {
                    body: {
                      action: 'cover_letter',
                      resumeData: local,
                      jobDescription: clJD,
                      tone: clTone,
                      company: clCompany,
                      role: clRole,
                    },
                  });
                  if (error || !data?.success) throw error || new Error('Generation failed');
                  const text = data.coverLetter || data.content || '';
                  const nextData = { ...local, coverLetter: text };
                  updateLive(nextData);
                  toast.success('Cover letter generated');
                } catch (e) {
                  console.error(e);
                  toast.error('Failed to generate cover letter');
                } finally {
                  setIsGeneratingCL(false);
                }
              }}
            >
              {isGeneratingCL ? 'Generating…' : 'Generate from JD'}
            </button>
          </div>
        </div>

        <textarea
          className="mt-1 w-full border rounded px-3 py-2 h-80"
          value={local.coverLetter || ''}
          onChange={(e) => {
            const nextData = { ...local, coverLetter: e.target.value };
            updateLive(nextData);
          }}
        />
        <button onClick={save} className="rounded border px-3 py-2">Save</button>
      </div>
    );
  }

  // Fallback
  return (
    <div className="space-y-3">
      <div className="opacity-70 text-sm">Editor coming soon for: {SECTION_LABELS[section] || section}</div>
      <button onClick={save} className="rounded border px-3 py-2">Save</button>
    </div>
  );
};

const ResumeEditorV1: React.FC = () => {
  const { id } = useParams();
  const { resumeData, setResumeData, isLoading, error } = useResumeData();
  const [sections, setSections] = useState<string[]>(DEFAULT_SECTIONS);
  const [selectedSection, setSelectedSection] = useState<string>('summary');
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<'editor' | 'preview'>('editor');
  const [livePreviewData, setLivePreviewData] = useState<any>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { exportResume, isExporting } = useResumeExport();
  const { enhanceSection } = useSectionEnhancer();
  const [isATSOpen, setIsATSOpen] = useState(false);

  // Real-time preview data - updates immediately when editing
  const previewData = livePreviewData || resumeData;
  
  // Debounced autosave
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const triggerAutosave = useCallback(async () => {
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }
    autosaveTimeoutRef.current = setTimeout(async () => {
      if (hasUnsavedChanges && resumeData) {
        try {
          const { error } = await supabase.from('ai_resumes').update({ content: resumeData as any, updated_at: new Date().toISOString() }).eq('id', id as string);
          if (error) throw error;
          setHasUnsavedChanges(false);
          toast.success('Auto-saved');
        } catch (error) {
          console.error('Autosave failed:', error);
        }
      }
    }, 2000); // 2 second delay
  }, [hasUnsavedChanges, resumeData, id]);
  
  // Real-time section update handler
  const handleSectionLiveChange = useCallback((sectionData: any) => {
    setLivePreviewData(sectionData);
    setHasUnsavedChanges(true);
    triggerAutosave();
  }, [triggerAutosave]);

  // Resilient hydration: ensure resumeData is always set
  useEffect(() => {
    const loadResume = async () => {
      if (!id) {
        console.error("Missing resume ID");
        return;
      }
      if (resumeData) return;

      const { data, error: fetchError } = await supabase
        .from("ai_resumes")
        .select("content")
        .eq("id", id as string)
        .maybeSingle();

      if (fetchError) {
        console.error("Error loading resume:", fetchError);
        setResumeData(getDefaultResumeJSON() as any);
        return;
      }

      try {
        const content = (data as any)?.content;
        const parsed = content && typeof content === "string" ? JSON.parse(content) : (content || getDefaultResumeJSON());
        setResumeData(parsed as any);
      } catch (parseErr) {
        console.error("Invalid resume JSON:", parseErr);
        setResumeData(getDefaultResumeJSON() as any);
      }
    };

    loadResume();
    // Only run on id or initial load; resumeData guard prevents overwriting user's edits
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Load templates from static data instead of database
  useEffect(() => {
    setTemplates(resumeTemplates as any);
    setSelectedTemplateId(resumeTemplates[0]?.id || 'classic');
  }, []);

  // Save handler (updates ai_resumes.content)
  const handleSave = useCallback(async () => {
    try {
      if (!id || !resumeData) return;
      const { error } = await supabase.from('ai_resumes').update({ content: resumeData as any, updated_at: new Date().toISOString() }).eq('id', id as string);
      if (error) throw error;
      toast.success('Resume saved');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save');
    }
  }, [id, resumeData]);

  const handleExport = useCallback(async (format: 'pdf' | 'docx') => {
    if (!resumeData) return;
    const settings: ExportSettings = {
      format,
      template: selectedTemplateId || 'two-col',
      colorScheme: 'default',
      fontSize: 'medium',
      fontFamily: 'Inter',
      showBranding: false,
      includePhoto: true,
      pageMargins: 'normal',
      sectionOrder: sections,
    };
    const res = await exportResume(resumeData, settings);
    if (res.success && res.downloadUrl) {
      const a = document.createElement('a');
      a.href = res.downloadUrl;
      a.download = res.filename || `resume.${format}`;
      a.click();
    }
  }, [exportResume, resumeData, sections, selectedTemplateId]);

  const handleImprove = useCallback(async () => {
    if (!resumeData || !selectedSection) return;
    try {
      const targetText = selectedSection === 'summary' ? (((resumeData as any)?.summary) ?? (resumeData as any)?.profileSummary ?? '') : '';
      const improved = await enhanceSection({ resumeId: (id as string) || undefined, section: selectedSection as any, text: targetText, targetRole: undefined, atsJson: undefined });
      if (selectedSection === 'summary') {
        setResumeData((prev: any) => ({ ...(prev || {}), summary: improved }));
        toast.success('Summary improved');
      } else {
        toast.success('Section improved');
      }
    } catch (e) {
      console.error(e);
      toast.error('AI improvement failed');
    }
  }, [resumeData, selectedSection, enhanceSection, setResumeData]);

  const handleATS = useCallback(() => {
    setIsATSOpen(true);
  }, []);

  const onDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.indexOf(active.id);
    const newIndex = sections.indexOf(over.id);
    const newOrder = arrayMove(sections, oldIndex, newIndex);
    setSections(newOrder);
    
    // Persist section order to database
    try {
      const updatedContent = {
        ...(resumeData as any),
        sectionOrder: newOrder
      };
      
      const { error } = await supabase
        .from('ai_resumes')
        .update({ content: updatedContent as any })
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Section order saved');
    } catch (error) {
      console.error('Failed to save section order:', error);
      toast.error('Failed to save section order');
      // Revert on failure
      setSections(sections);
    }
  };

  const pageTitle = useMemo(() => `Resume Editor | Modern 3‑Pane Builder`, []);
  const pageDesc = useMemo(() => `Build and customize your resume with drag‑and‑drop sections, AI improvements, ATS check, and PDF/DOCX export.`, []);

  if (isLoading) {
    return (
      <div className="p-8">
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={pageDesc} />
          <link rel="canonical" href={`${window.location.origin}/resume/editor/${id || ''}`} />
        </Helmet>
        Loading editor...
      </div>
    );
  }


  return (
    <div className="flex h-screen">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={`${window.location.origin}/resume/editor/${id || ''}`} />
      </Helmet>

      <Toolbar
        onExport={handleExport}
        onRunATS={handleATS}
        exportBusy={isExporting}
        onImprove={handleImprove}
        selectedSection={selectedSection}
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        onSelectTemplate={setSelectedTemplateId}
      />

      <main className="flex-1 px-6 py-5 overflow-auto">
        <header className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Three‑Pane Resume Editor</h1>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded border overflow-hidden">
              <button
                className={`px-3 py-2 text-sm ${mode === 'editor' ? 'bg-primary/10' : ''}`}
                aria-pressed={mode === 'editor'}
                onClick={() => setMode('editor')}
              >
                Editor
              </button>
              <button
                className={`px-3 py-2 text-sm ${mode === 'preview' ? 'bg-primary/10' : ''}`}
                aria-pressed={mode === 'preview'}
                onClick={() => setMode('preview')}
              >
                Preview
              </button>
            </div>
            <button className="rounded border px-3 py-2" onClick={handleSave}>Save</button>
            <button className="rounded border px-3 py-2" onClick={() => {
              const input = window.prompt('Paste resume JSON');
              if (!input) return;
              try {
                const parsed = JSON.parse(input);
                // Transform section-array JSON into editor-friendly object if needed
                const toEditorShape = (arr: any[]): any => {
                  const obj: any = {};
                  for (const s of arr) {
                    const t = (s.type || '').toLowerCase();
                    if (t === 'header') {
                      obj.personalInfo = {
                        fullName: s.data?.name || '',
                        title: s.data?.title || '',
                        email: s.data?.email || '',
                        phone: s.data?.phone || '',
                        location: s.data?.location || '',
                        linkedin: s.data?.linkedin || '',
                      };
                    } else if (t === 'summary') {
                      obj.summary = s.data?.text || '';
                    } else if (t === 'experience') {
                      obj.experience = Array.isArray(s.data) ? s.data.map((it: any) => ({
                        role: it.role || '',
                        company: it.company || '',
                        location: it.location || '',
                        start: it.start || it.startDate || '',
                        end: it.end || it.endDate || '',
                        bullets: it.bullets || it.achievements || [],
                      })) : [];
                    } else if (t === 'education') {
                      obj.education = Array.isArray(s.data) ? s.data.map((it: any) => ({
                        degree: it.degree || '',
                        school: it.institution || it.school || '',
                        startDate: '',
                        endDate: it.dates || '',
                      })) : [];
                    } else if (t === 'skills') {
                      obj.skills = Array.isArray(s.data) ? s.data : [];
                    } else if (t === 'certifications') {
                      obj.certifications = Array.isArray(s.data) ? s.data : [];
                    } else if (t === 'awards') {
                      obj.awards = Array.isArray(s.data) ? s.data : [];
                    } else if (t === 'cover_letter') {
                      obj.coverLetter = s.data?.text || '';
                    }
                  }
                  return obj;
                };
                const next = Array.isArray(parsed) ? toEditorShape(parsed) : parsed;
                setResumeData(next);
                toast.success('Imported JSON');
              } catch (e) {
                console.error(e);
                toast.error('Invalid JSON');
              }
            }}>Import JSON</button>
          </div>
        </header>

        {error && (
          <div className="mb-3 rounded border px-3 py-2 text-sm">
            We couldn't load your stored resume; starting with a blank template.
          </div>
        )}
        {mode === 'editor' ? (
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-100px)]">
            <div className="col-span-4 border rounded p-3 overflow-auto">
              <h2 className="text-sm font-medium mb-2">Sections (drag to reorder)</h2>
              <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                  {sections.map((s) => (
                    <SortableItem key={s} id={s} label={SECTION_LABELS[s] || s} selected={selectedSection === s} onSelect={setSelectedSection} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            <div className="col-span-8 border rounded p-4 overflow-auto">
              <h2 className="text-sm font-medium mb-3">
                Edit: {SECTION_LABELS[selectedSection] || selectedSection}
                {hasUnsavedChanges && <span className="ml-2 text-xs text-orange-600">• Unsaved changes</span>}
              </h2>
              <SectionEditor
                section={selectedSection}
                data={resumeData}
                onChange={(next) => setResumeData(next)}
                onLiveChange={handleSectionLiveChange}
              />
            </div>
          </div>
        ) : (
          <Preview data={resumeData} templateId={selectedTemplateId} variant="full" sectionOrder={sections} />
        )}
      </main>

      {mode === 'editor' && <Preview data={previewData} templateId={selectedTemplateId} sectionOrder={sections} />}

      <JobTargetingPanel isOpen={isATSOpen} onClose={() => setIsATSOpen(false)} resumeData={resumeData} />
    </div>
  );
};

export default ResumeEditorV1;
