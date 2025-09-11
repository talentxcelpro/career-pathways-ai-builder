import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const NewsManagement: React.FC = () => {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: 'Press Release',
    image_url: '',
    published_status: 'draft',
  });

  const { data: articles } = useQuery({
    queryKey: ['admin-news-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title, url, published_status, published_at, created_at, category')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const slug = form.slug || form.title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 100);
      const payload: any = {
        title: form.title,
        url: slug,
        description: form.summary,
        content: form.content,
        category: form.category,
        image_url: form.image_url || null,
        published_status: form.published_status,
        type: 'news',
        author: 'Admin',
        source_name: 'TalentXcel',
        tags: [form.category.toLowerCase()],
      };
      // If publishing now, set published_at
      if (payload.published_status === 'published') payload.published_at = new Date().toISOString();

      const { error } = await supabase.from('news_articles').insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('News article created');
      setForm({ title: '', slug: '', summary: '', content: '', category: 'Press Release', image_url: '', published_status: 'draft' });
      qc.invalidateQueries({ queryKey: ['admin-news-list'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to create article'),
  });

  const handleGenerateRSS = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-rss-feed');
      if (error) throw error;
      toast.success('RSS feed generated');
      window.open('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/generate-rss-feed', '_blank');
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate RSS');
    }
  };

  const handleGenerateGoogleNews = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-news-sitemap');
      if (error) throw error;
      toast.success('Google News sitemap generated');
      window.open('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/google-news-sitemap', '_blank');
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate Google News sitemap');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">News Management</h1>
        <p className="text-sm text-muted-foreground">Create and manage News & Press Releases.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Article</CardTitle>
          <CardDescription>Quickly add a press release or news post</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="Slug (optional)" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
          </div>
          <Input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <Input placeholder="Image URL (optional)" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} />
          <Textarea placeholder="Summary" value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} />
          <Textarea placeholder="Content (HTML/Markdown)" rows={6} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
          <div className="flex items-center gap-2">
            <Button onClick={() => createMutation.mutate()} disabled={!form.title}>Save Draft</Button>
            <Button variant="secondary" onClick={() => { setForm({ ...form, published_status: 'published' }); createMutation.mutate(); }}>Publish</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Articles</CardTitle>
          <CardDescription>Latest created articles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {articles?.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground">/{a.url || 'no-url'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={a.published_status === 'published' ? 'secondary' : 'outline'}>{a.published_status}</Badge>
                  <a className="text-sm text-primary hover:underline" href={`/news/${a.id}/${a.url || 'view'}`} target="_blank">View</a>
                </div>
              </div>
            ))}
            {!articles?.length && (
              <div className="text-sm text-muted-foreground">No articles yet.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribution</CardTitle>
          <CardDescription>Generate feeds for syndication</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleGenerateRSS}>Generate RSS</Button>
          <Button variant="outline" onClick={handleGenerateGoogleNews}>Generate Google News Sitemap</Button>
          <a className="text-sm text-primary hover:underline" href="https://talentxcel.in/sitemap.xml" target="_blank" rel="noreferrer">Open Main Sitemap</a>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsManagement;
