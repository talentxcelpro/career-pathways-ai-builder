import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { supabase } from "@/integrations/supabase/client";
import { useResumeData } from "@/hooks/useResumeData";
import { useResumeExport, ExportSettings } from "@/hooks/useResumeExport";
import { useSectionEnhancer } from "@/hooks/useSectionEnhancer";
import { useJobTargeting } from "@/hooks/useJobTargeting";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

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
  return (
    <aside className="w-72 border-r px-4 py-4 space-y-4">
      <section>
        <h2 className="text-sm font-medium">Templates</h2>
        <div className="mt-2 grid grid-cols-2 gap-2 max-h-56 overflow-auto pr-1">
          {templates.map((t) => (
            <button key={t.id} onClick={() => onSelectTemplate(t.id)}
              className={`border rounded p-2 text-left ${selectedTemplateId === t.id ? 'ring-2 ring-primary' : ''}`}
            >
              <div className="text-xs font-medium line-clamp-1">{t.name}</div>
              {t.preview_url && (
                <img src={t.preview_url} alt={`${t.name} resume template preview`} loading="lazy"
                  className="mt-1 h-16 w-full object-cover rounded" />
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="pt-2 border-t">
        <h2 className="text-sm font-medium">AI & ATS</h2>
        <div className="mt-2 flex flex-col gap-2">
          <button onClick={onRunATS} className="rounded border px-3 py-2">Run ATS Check</button>
          <button onClick={onImprove} disabled={!selectedSection} className="rounded border px-3 py-2 disabled:opacity-60">
            Improve Section {selectedSection ? `(${SECTION_LABELS[selectedSection] || selectedSection})` : ''}
          </button>
        </div>
      </section>

      <section className="pt-2 border-t">
        <h2 className="text-sm font-medium">Export</h2>
        <div className="mt-2 flex gap-2">
          <button onClick={() => onExport('pdf')} className="rounded border px-3 py-2" disabled={exportBusy}>PDF</button>
          <button onClick={() => onExport('docx')} className="rounded border px-3 py-2" disabled={exportBusy}>DOCX</button>
        </div>
      </section>
    </aside>
  );
};

const Preview = ({ data, templateId, variant = 'sidebar' }: { data: any; templateId?: string; variant?: 'sidebar' | 'full' }) => {
  const p = data?.personalInfo || data?.profile || {};
  const summary = data?.summary || data?.profileSummary || '';
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const skills = Array.isArray(data?.skills) ? data.skills : [];

  const Wrapper: React.ElementType = variant === 'sidebar' ? 'aside' : 'div';
  const wrapperCls = variant === 'sidebar'
    ? 'w-[38%] border-l px-5 py-5 overflow-auto'
    : 'flex-1 px-6 py-6 overflow-auto';

  return (
    <Wrapper className={wrapperCls}>
      <div className="max-w-3xl mx-auto bg-background shadow-sm rounded-md p-6">
        {templateId === 'two-col' ? (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <h1 className="text-2xl font-bold">{p.fullName || p.name || 'Your Name'}</h1>
              <div className="text-sm opacity-70">{p.title || 'Your Title'}</div>

              <section className="mt-4">
                <h3 className="font-semibold">Experience</h3>
                <div className="mt-2 space-y-3">
                  {experience.map((exp: any, i: number) => (
                    <article key={i} className="">
                      <div className="font-medium">{exp.role || exp.title} <span className="opacity-70">— {exp.company}</span></div>
                      {Array.isArray(exp.bullets) && (
                        <ul className="list-disc ml-5 text-sm mt-1">
                          {exp.bullets.map((b: string, idx: number) => (<li key={idx}>{b}</li>))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <div className="col-span-1">
              <section>
                <h3 className="font-semibold">Summary</h3>
                <p className="text-sm mt-2 whitespace-pre-line">{summary}</p>
              </section>

              <section className="mt-4">
                <h3 className="font-semibold">Skills</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {skills.map((s: any, i: number) => (
                    <span key={i} className="text-xs border rounded px-2 py-1">{typeof s === 'string' ? s : (s?.name || '')}</span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold">{p.fullName || p.name || 'Your Name'}</h1>
            <div className="text-sm opacity-70">{p.title || 'Your Title'}</div>

            <section className="mt-4">
              <h3 className="font-semibold">Summary</h3>
              <p className="mt-2 whitespace-pre-line">{summary}</p>
            </section>

            <section className="mt-4">
              <h3 className="font-semibold">Experience</h3>
              <div className="mt-2 space-y-3">
                {experience.map((exp: any, i: number) => (
                  <article key={i}>
                    <div className="font-medium">{exp.role || exp.title} <span className="opacity-70">— {exp.company}</span></div>
                    {Array.isArray(exp.bullets) && (
                      <ul className="list-disc ml-5 text-sm mt-1">
                        {exp.bullets.map((b: string, idx: number) => (<li key={idx}>{b}</li>))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </Wrapper>
  );
};

const SectionEditor = ({ section, data, onChange }: { section: string; data: any; onChange: (next: any) => void }) => {
  const [local, setLocal] = useState<any>(data || {});
  const { enhanceSection } = useSectionEnhancer();

  useEffect(() => setLocal(data || {}), [data]);

  const save = () => onChange(local);

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
                setLocal({ ...local, personalInfo: nextP });
              }} />
          </div>
          <div>
            <label className="text-sm">Title</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={p.title || ''}
              onChange={(e) => {
                const nextP = { ...p, title: e.target.value };
                setLocal({ ...local, personalInfo: nextP });
              }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Email</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={p.email || ''}
              onChange={(e) => setLocal({ ...local, personalInfo: { ...p, email: e.target.value } })} />
          </div>
          <div>
            <label className="text-sm">Phone</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={p.phone || ''}
              onChange={(e) => setLocal({ ...local, personalInfo: { ...p, phone: e.target.value } })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm">Location</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={p.location || ''}
              onChange={(e) => setLocal({ ...local, personalInfo: { ...p, location: e.target.value } })} />
          </div>
          <div>
            <label className="text-sm">LinkedIn</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={p.linkedin || ''}
              onChange={(e) => setLocal({ ...local, personalInfo: { ...p, linkedin: e.target.value } })} />
          </div>
        </div>
        <div>
          <label className="text-sm">Website/Portfolio</label>
          <input className="mt-1 w-full border rounded px-3 py-2" value={p.website || p.portfolio || ''}
            onChange={(e) => setLocal({ ...local, personalInfo: { ...p, website: e.target.value, portfolio: e.target.value } })} />
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
        setLocal({ ...local, summary: improved });
      } catch {}
    };
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm">Summary</label>
          <button onClick={enhance} className="text-xs inline-flex items-center gap-1 rounded border px-2 py-1"><Sparkles className="h-3 w-3" /> Enhance</button>
        </div>
        <textarea className="mt-1 w-full border rounded px-3 py-2 h-40" value={text}
          onChange={(e) => setLocal({ ...local, summary: e.target.value })} />
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
        <button className="rounded border px-3 py-2" onClick={() => setLocal({ ...local, education: [...list, { degree: '', school: '', startDate: '', endDate: '', gpa: '' }] })}>+ Add education</button>
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
        <label className="text-sm">Skills (comma separated)</label>
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
        <button className="rounded border px-3 py-2" onClick={() => setLocal({ ...local, [key]: [...list, { title: '', org: '', date: '', description: '' }] })}>+ Add {SECTION_LABELS[key] || key}</button>
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
                setLocal({ ...local, coverLetter: improved });
              } catch {}
            }}
          >
            <Sparkles className="h-3 w-3" /> Enhance
          </button>
        </div>
        <textarea className="mt-1 w-full border rounded px-3 py-2 h-80" value={local.coverLetter || ''}
          onChange={(e) => setLocal({ ...local, coverLetter: e.target.value })} />
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

  const { exportResume, isExporting } = useResumeExport();
  const { enhanceSection } = useSectionEnhancer();
  const { analyze } = useJobTargeting(resumeData);

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

  // Load templates
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase.from('resume_templates').select('*').eq('is_active', true).order('is_premium', { ascending: true });
      if (error) {
        console.error('Failed to load templates', error);
      } else if (mounted) {
        setTemplates(data as any);
        setSelectedTemplateId((data?.[0]?.id as string) || 'two-col');
      }
    })();
    return () => { mounted = false; };
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

  const handleATS = useCallback(async () => {
    const jd = prompt('Paste job description to analyze against your resume:');
    if (!jd) return;
    await analyze(jd);
  }, [analyze]);

  const onDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.indexOf(active.id);
    const newIndex = sections.indexOf(over.id);
    setSections((items) => arrayMove(items, oldIndex, newIndex));
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
              <h2 className="text-sm font-medium mb-3">Edit: {SECTION_LABELS[selectedSection] || selectedSection}</h2>
              <SectionEditor
                section={selectedSection}
                data={resumeData}
                onChange={(next) => setResumeData(next)}
              />
            </div>
          </div>
        ) : (
          <Preview data={resumeData} templateId={selectedTemplateId} variant="full" />
        )}
      </main>

      {mode === 'editor' && <Preview data={resumeData} templateId={selectedTemplateId} />}
    </div>
  );
};

export default ResumeEditorV1;
