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
  certifications: "Certifications",
  achievements: "Achievements",
  projects: "Projects",
  languages: "Languages",
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
  "certifications",
  "achievements",
];

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

const Preview = ({ data, templateId }: { data: any; templateId?: string }) => {
  const p = data?.personalInfo || data?.profile || {};
  const summary = data?.summary || data?.profileSummary || '';
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const skills = Array.isArray(data?.skills) ? data.skills : [];

  return (
    <aside className="w-[38%] border-l px-5 py-5 overflow-auto">
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
    </aside>
  );
};

const SectionEditor = ({ section, data, onChange }: { section: string; data: any; onChange: (next: any) => void }) => {
  const [local, setLocal] = useState<any>(data || {});

  useEffect(() => setLocal(data || {}), [data]);

  const save = () => onChange(local);

  if (section === 'header') {
    const p = local.personalInfo || local.profile || {};
    return (
      <div className="space-y-3">
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
        <button onClick={save} className="rounded border px-3 py-2">Save</button>
      </div>
    );
  }

  if (section === 'summary') {
    return (
      <div className="space-y-3">
        <label className="text-sm">Summary</label>
        <textarea className="mt-1 w-full border rounded px-3 py-2 h-40" value={local.summary || ''}
          onChange={(e) => setLocal({ ...local, summary: e.target.value })} />
        <button onClick={save} className="rounded border px-3 py-2">Save</button>
      </div>
    );
  }

  if (section === 'experience') {
    const exp = Array.isArray(local.experience) ? local.experience : [];
    return (
      <div className="space-y-3">
        <button className="rounded border px-3 py-2" onClick={() => setLocal({ ...local, experience: [...exp, { role: '', company: '', bullets: [''] }] })}>+ Add role</button>
        <div className="space-y-3">
          {exp.map((item: any, i: number) => (
            <div key={i} className="border rounded p-3 space-y-2">
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
              <textarea placeholder="Bullet" className="w-full border rounded px-3 py-2 h-24" value={item.bullets?.[0] || ''}
                onChange={(e) => {
                  const next = [...exp];
                  next[i] = { ...next[i], bullets: [e.target.value] };
                  setLocal({ ...local, experience: next });
                }} />
            </div>
          ))}
        </div>
        <button onClick={save} className="rounded border px-3 py-2">Save</button>
      </div>
    );
  }

  // Basic editors for other sections
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

  const { exportResume, isExporting } = useResumeExport();
  const { enhanceSection } = useSectionEnhancer();
  const { analyze } = useJobTargeting(resumeData);

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

  if (error) {
    return <div className="p-8">Failed to load resume.</div>;
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
          <div className="flex gap-2">
            <button className="rounded border px-3 py-2" onClick={handleSave}>Save</button>
          </div>
        </header>

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
      </main>

      <Preview data={resumeData} templateId={selectedTemplateId} />
    </div>
  );
};

export default ResumeEditorV1;
