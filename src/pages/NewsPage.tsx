import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet-async';

const baseTitle = 'News & Press Releases | TalentXcel';
const baseDesc = 'Latest news, announcements, and press releases from TalentXcel.';

const NewsPage: React.FC = () => {
  const { slug } = useParams();

  const { data: article } = useQuery({
    queryKey: ['news-article', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title, description, content, image_url, category, published_at, created_at, url')
        .eq('url', slug)
        .eq('published_status', 'published')
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });

  const { data: list } = useQuery({
    queryKey: ['news-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_articles')
        .select('id, title, description, url, published_at, category, image_url')
        .eq('published_status', 'published')
        .order('published_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !slug,
  });

  if (!slug) {
    // List page
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Helmet>
          <title>{baseTitle}</title>
          <meta name="description" content={baseDesc} />
          <link rel="canonical" href="https://talentxcel.in/news" />
        </Helmet>
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">News & Press Releases</h1>
          <p className="text-muted-foreground">Empowering professionals through our latest updates.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list?.map((a: any) => (
            <Link key={a.id} to={`/news/${a.url}`} className="group border rounded-lg overflow-hidden hover:shadow transition">
              {a.image_url && (
                <img src={a.image_url} alt={a.title} className="h-44 w-full object-cover" loading="lazy" />
              )}
              <div className="p-4">
                <div className="text-xs text-muted-foreground">{new Date(a.published_at).toLocaleDateString()} • {a.category}</div>
                <h2 className="text-lg font-medium mt-1 group-hover:text-primary transition-colors">{a.title}</h2>
                {a.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description}</p>}
                <div className="text-sm text-primary mt-2">Read more →</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Article page
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Helmet>
        <title>{article?.title ? `${article.title} | TalentXcel` : baseTitle}</title>
        <meta name="description" content={article?.description || baseDesc} />
        <link rel="canonical" href={`https://talentxcel.in/news/${slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article?.title || 'News'} />
        <meta property="og:description" content={article?.description || baseDesc} />
        {article?.image_url && <meta property="og:image" content={article.image_url} />}
      </Helmet>
      <nav className="text-sm mb-4">
        <Link to="/news" className="text-muted-foreground hover:text-foreground">← Back to News</Link>
      </nav>
      <article>
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">{article?.title || 'News'}</h1>
          <div className="text-sm text-muted-foreground mt-1">
            {article?.published_at && new Date(article.published_at).toLocaleDateString()} {article?.category ? `• ${article.category}` : ''}
          </div>
        </header>
        {article?.image_url && (
          <img src={article.image_url} alt={article.title} className="w-full rounded-lg mb-6" loading="lazy" />
        )}
        {article?.content ? (
          <div className="prose prose-neutral dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        ) : (
          <p className="text-muted-foreground">Content coming soon.</p>
        )}
      </article>
    </div>
  );
};

export default NewsPage;
