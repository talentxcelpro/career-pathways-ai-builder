import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useResumeDownloads } from '@/hooks/useResumeDownloads';
import { exportResumeToDocx } from '@/utils/docxExport';
import type { ResumeJSON } from '@/hooks/useResumeParser';
import { RazorpayScript } from '@/components/RazorpayScript';

const defaultResume: ResumeJSON = { profile: {}, summary: '', experience: [], education: [], skills: [] };

export const ResumeEditorPage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const initialData = (location.state as any)?.resumeData?.parsed as unknown as ResumeJSON | undefined;
  const [resume, setResume] = useState<ResumeJSON>(initialData || defaultResume);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { handleDownload, processing } = useResumeDownloads(0);

  // Load from DB if id provided
  useEffect(() => {
    const run = async () => {
      if (!id || id === 'new') return;
      const { data, error } = await supabase.from('ai_resumes').select('content').eq('id', id).maybeSingle();
      if (!error && data?.content) setResume(data.content as ResumeJSON);
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
        const { error } = await (supabase as any)
          .from('ai_resumes')
          .insert({ user_id: user.id, title: 'My Resume', content: resume as any, is_primary: false });
        if (error) throw error;
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
        <link rel="canonical" href="https://talentxcel.in/resume/new" />
      </Helmet>
      <h1 className="sr-only">Resume Builder and Editor</h1>
      <RazorpayScript />

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
