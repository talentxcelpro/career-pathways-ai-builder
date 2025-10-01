import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useResumeDownloads } from '@/hooks/useResumeDownloads';
import { exportResumeToDocx } from '@/utils/docxExport';
import type { ResumeJSON } from '@/hooks/useResumeParser';


const defaultResume: ResumeJSON = { profile: {}, summary: '', experience: [], education: [], skills: [] };

interface ResumeEditorPageProps { initialData?: any }

const normalizeResume = (input: any): ResumeJSON => {
  const safe = input?.enhancedContent ?? input;
  if (!safe || typeof safe !== 'object') return { ...defaultResume };
  const profileSrc: any = (safe as any).profile ?? (safe as any).personalInfo ?? {};
  const normalized: ResumeJSON = {
    profile: {
      name: profileSrc.name ?? profileSrc.fullName ?? '',
      email: profileSrc.email ?? '',
      phone: profileSrc.phone ?? '',
      location: profileSrc.location ?? ''
    },
    summary: (safe as any).summary ?? (safe as any).objective ?? (safe as any).professionalSummary ?? '',
    experience: [],
    education: [],
    skills: []
  };

  const expSrc: any[] = (safe as any).experience ?? (safe as any).workExperience ?? (safe as any).work_experience ?? [];
  if (Array.isArray(expSrc)) {
    normalized.experience = expSrc.slice(0, 8).map((e: any) => {
      const bullets = Array.isArray(e?.bullets)
        ? e.bullets
        : Array.isArray(e?.achievements)
          ? e.achievements
          : typeof e?.description === 'string'
            ? e.description.split(/[\n•-]+/).map((s: string) => s.trim()).filter(Boolean)
            : [];
      return {
        title: e?.title ?? e?.role ?? e?.position ?? '',
        company: e?.company ?? e?.organization ?? '',
        startDate: e?.startDate ?? e?.start_date ?? '',
        endDate: e?.endDate ?? e?.end_date ?? '',
        bullets: bullets.slice(0, 8)
      };
    });
  }

  const eduSrc: any[] = (safe as any).education ?? [];
  if (Array.isArray(eduSrc)) {
    normalized.education = eduSrc.slice(0, 6).map((ed: any) => ({
      school: ed?.school ?? ed?.institution ?? '',
      degree: ed?.degree ?? ed?.qualification ?? '',
      year: ed?.year ?? ed?.endDate ?? ed?.end_date ?? ed?.graduationDate ?? ''
    }));
  }

  const skillsSrc: any = (safe as any).skills ?? {};
  if (Array.isArray(skillsSrc)) {
    normalized.skills = skillsSrc.map((s: any) => (typeof s === 'string' ? s : s?.name ?? '')).filter(Boolean);
  } else if (skillsSrc && typeof skillsSrc === 'object') {
    normalized.skills = (Object.values(skillsSrc) as any[]).flat().map((s: any) => (typeof s === 'string' ? s : s?.name ?? '')).filter(Boolean);
  }
  normalized.skills = Array.from(new Set(normalized.skills)).slice(0, 50);

  return normalized;
};

export const ResumeEditorPage: React.FC<ResumeEditorPageProps> = ({ initialData: propInitialData }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stateInitial = (location.state as any)?.resumeData ?? (location.state as any)?.resumeData?.parsed;
  const initial = normalizeResume(propInitialData ?? stateInitial);
  const [resume, setResume] = useState<ResumeJSON>(initial);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { handleDownload, processing } = useResumeDownloads(0);

  // Load from DB if id provided
  useEffect(() => {
    const run = async () => {
      if (!id || id === 'new') return;
      const { data, error } = await supabase.from('ai_resumes').select('content').eq('id', id).maybeSingle();
      if (!error && data?.content) setResume(normalizeResume(data.content));
    };
    run();
  }, [id]);

  const save = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in');

      if (id && id !== 'new') {
        const { error } = await (supabase as any)
          .from('ai_resumes')
          .update({ content: resume as any, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { data: inserted, error } = await (supabase as any)
          .from('ai_resumes')
          .insert({ user_id: user.id, title: 'My Resume', content: resume as any, is_primary: false })
          .select('id')
          .single();
        if (error) throw error;
        const newId = inserted?.id as string | undefined;
        if (newId) {
          toast({ title: 'Saved', description: 'Redirecting to advanced editor…' });
          navigate(`/resume/editor/${newId}`);
          return;
        }
      }
      toast({ title: 'Saved', description: 'Your resume has been saved.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to save', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const startDownload = async () => {
    const resumeId = id || 'temp';
    const ok = await handleDownload(resumeId, async () => {
      await exportResumeToDocx(resume, 'resume.docx');
    });
    if (!ok) return;
  };

  const skillsText = useMemo(() => resume.skills?.join(', ') || '', [resume.skills]);

  return (
    <div className="container mx-auto px-4 py-6">
      <Helmet>
        <title>Resume Builder & Editor | TalentXcel</title>
        <meta name="description" content="Upload, edit, and download your resume. Parse PDF/DOCX, edit sections, and export." />
        <link rel="canonical" href="https://talentxcel.in/resume" />
      </Helmet>
      <h1 className="sr-only">Resume Builder and Editor</h1>
      

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Full name" value={resume.profile.name || ''} onChange={e => setResume(r => ({ ...r, profile: { ...r.profile, name: e.target.value } }))} />
              <Input placeholder="Email" value={resume.profile.email || ''} onChange={e => setResume(r => ({ ...r, profile: { ...r.profile, email: e.target.value } }))} />
              <Input placeholder="Phone" value={resume.profile.phone || ''} onChange={e => setResume(r => ({ ...r, profile: { ...r.profile, phone: e.target.value } }))} />
              <Input placeholder="Location" value={resume.profile.location || ''} onChange={e => setResume(r => ({ ...r, profile: { ...r.profile, location: e.target.value } }))} />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Summary</h2>
            <Textarea rows={4} value={resume.summary || ''} onChange={e => setResume(r => ({ ...r, summary: e.target.value }))} />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Skills</h2>
            <Input value={skillsText} onChange={e => setResume(r => ({ ...r, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
          </section>
        </div>

        <aside className="space-y-3">
          <Button onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</Button>
          <Button variant="secondary" onClick={startDownload} disabled={processing}>{processing ? 'Preparing…' : 'Download DOCX'}</Button>
        </aside>
      </div>
    </div>
  );
};
