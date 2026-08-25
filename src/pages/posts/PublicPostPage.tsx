import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft,
  MessageCircle,
  ThumbsUp,
  Share2,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  User,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getPublicPostUrl, getPublicProfileUrl } from '@/lib/seo/canonicalUrls';

export default function PublicPostPage() {
  const { slugOrId, id } = useParams<{ slugOrId?: string; id?: string }>();
  const postId = slugOrId || id;
  const [copied, setCopied] = useState(false);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['public-post', postId],
    queryFn: async () => {
      if (!postId) throw new Error('Post identifier is required');

      // 1. Query by ID
      const { data: postData, error: postErr } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .maybeSingle();

      if (postErr) throw postErr;
      if (!postData) return null;

      // 2. Fetch Author Profile
      const { data: authorData } = await supabase
        .from('profiles')
        .select('id, full_name, username, title, profile_picture_url')
        .eq('id', postData.author_id)
        .maybeSingle();

      return {
        ...postData,
        author: authorData,
      };
    },
    enabled: Boolean(postId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Skeleton className="h-6 w-32 bg-slate-800" />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full bg-slate-800" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 bg-slate-800" />
                <Skeleton className="h-3 w-28 bg-slate-800" />
              </div>
            </div>
            <Skeleton className="h-24 w-full bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-20 px-4 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-white">Post Not Found</h1>
          <p className="text-sm text-slate-400">
            This post may have been removed or is unavailable.
          </p>
          <Link to="/network">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Feed
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const canonicalUrl = getPublicPostUrl(post.id);
  const authorName = post.author?.full_name || 'Professional Member';
  const authorUsername = post.author?.username || post.author?.id || 'member';
  const authorTitle = post.author?.title || 'Verified Professional';
  const authorProfileUrl = getPublicProfileUrl(authorUsername);

  const cleanContent = (post.content || '').trim();
  const headline = cleanContent.slice(0, 100).replace(/\n/g, ' ') || 'TalentXcel Professional Update';
  const metaDescription = cleanContent.slice(0, 160).replace(/\n/g, ' ');
  const pageTitle = `${authorName}: "${headline}" | TalentXcel`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(canonicalUrl);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SocialMediaPosting',
    headline,
    articleBody: cleanContent,
    datePublished: post.created_at,
    dateModified: post.created_at,
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorProfileUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TalentXcel',
      url: 'https://talentxcel.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://talentxcel.in/talentxcel-official-logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://talentxcel.in',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Network Feed',
        item: 'https://talentxcel.in/network',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: authorName,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://talentxcel.in/talentxcel-official-logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbsSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-1.5">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/network" className="hover:text-white transition-colors">Network</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-purple-400 font-medium">Post</span>
          </nav>

          {/* Main Post Card */}
          <article className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-6">
            {/* Header: Author Info */}
            <div className="flex items-start justify-between gap-4">
              <Link
                to={`/@${authorUsername}`}
                className="flex items-center gap-3.5 group"
              >
                <Avatar className="w-12 h-12 border-2 border-purple-500/30 group-hover:border-purple-400 transition-colors">
                  <AvatarImage src={post.author?.profile_picture_url || undefined} alt={authorName} />
                  <AvatarFallback className="bg-purple-950 text-purple-200 font-bold">
                    {authorName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-white text-base group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                    {authorName}
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xs text-slate-400">
                    {authorTitle}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Published on {new Date(post.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </Link>

              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="border-slate-700 hover:bg-slate-800 text-xs text-slate-300 gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Share'}
              </Button>
            </div>

            {/* Post Content Body */}
            <div className="text-slate-200 text-base leading-relaxed whitespace-pre-line break-words">
              {post.content}
            </div>

            {/* Post Media Attachments (if any) */}
            {Array.isArray(post.media_urls) && post.media_urls.length > 0 && (
              <div className="grid grid-cols-1 gap-4 pt-2">
                {post.media_urls.map((url: string, idx: number) => {
                  const isVideo = url.endsWith('.mp4') || url.endsWith('.webm');
                  return isVideo ? (
                    <video
                      key={idx}
                      src={url}
                      controls
                      className="rounded-xl border border-slate-800 max-h-[500px] w-full bg-black"
                    />
                  ) : (
                    <img
                      key={idx}
                      src={url}
                      alt="Post visual"
                      className="rounded-xl border border-slate-800 max-h-[500px] object-cover w-full"
                    />
                  );
                })}
              </div>
            )}

            {/* Footer Stats & Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <ThumbsUp className="w-4 h-4 text-blue-400" /> {post.likes_count || 0} Likes
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-purple-400" /> {post.comments_count || 0} Comments
                </span>
              </div>

              <Link to="/network">
                <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 text-xs gap-1">
                  View Full Feed <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
