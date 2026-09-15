import { supabase } from '@/integrations/supabase/client';
import { NewsArticle, NewsCategory, NewsArchetype } from '@/types/news';
import { FOUNDATION_NEWS_ARTICLES } from '@/data/newsArticles';
import { evaluateAndRefreshArticles, FreshnessEvaluationResult } from '@/services/news/newsFreshnessEngine';

export class NewsService {
  /**
   * Fetch list of articles with optional category, search, and archetype filters
   * Automatically applies the 15-day automated freshness & rewriter engine.
   */
  public async getArticles(
    category?: NewsCategory, 
    search?: string, 
    archetype?: NewsArchetype | 'All'
  ): Promise<NewsArticle[]> {
    let articles: NewsArticle[] = [];

    try {
      const { data, error } = await (supabase as any)
        .from('news_articles')
        .select('*')
        .eq('published_status', 'published')
        .order('published_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database records if available
        articles = data.map((d: any) => ({
          id: d.id,
          slug: d.slug || d.url || d.id,
          title: d.title,
          summary: d.summary || d.description || '',
          content: d.content || '',
          category: (d.category || 'Company News') as Exclude<NewsCategory, 'All'>,
          archetype: d.archetype as NewsArchetype | undefined,
          publishedAt: d.published_at || d.created_at,
          updatedAt: d.updated_at,
          lastRefreshedAt: d.last_refreshed_at || d.updated_at,
          editionVersion: d.edition_version || 'v1.0 - September 2026 Edition',
          refreshCadenceDays: d.refresh_cadence_days || 15,
          metricsSnapshot: d.metrics_snapshot,
          author: {
            name: d.author_name || 'TalentXcel Editorial Desk',
            role: d.author_role || 'Platform Intelligence',
            avatar: d.author_avatar || '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png'
          },
          imageUrl: (d.image_url && !d.image_url.includes('lovable-uploads') && !d.image_url.includes('placeholder'))
            ? d.image_url
            : (FOUNDATION_NEWS_ARTICLES.find(f => f.slug === (d.slug || d.url || d.id))?.imageUrl || '/images/news/sector-report-executives.jpg'),
          readTime: d.read_time || '4 min read',
          tags: d.tags || ['TalentXcel', 'Career News'],
          keyTakeaways: d.key_takeaways || [],
          isFeatured: d.is_featured || false
        }));
      } else {
        articles = FOUNDATION_NEWS_ARTICLES;
      }
    } catch {
      articles = FOUNDATION_NEWS_ARTICLES;
    }

    // 15-Day Automated Freshness Evaluation
    const freshness = evaluateAndRefreshArticles(articles);
    articles = freshness.articles;

    // Filter by Category
    if (category && category !== 'All') {
      articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Archetype
    if (archetype && archetype !== 'All') {
      articles = articles.filter(a => a.archetype === archetype);
    }

    // Filter by Search Query
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        (a.archetype && a.archetype.toLowerCase().includes(q)) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return articles;
  }

  /**
   * Get single article by slug (with automated 15-day freshness check)
   */
  public async getArticleBySlug(slug: string): Promise<NewsArticle | null> {
    const all = await this.getArticles();
    return all.find(a => a.slug === slug) || null;
  }

  /**
   * Trigger on-demand 15-day freshness cycle
   */
  public async triggerFreshnessCycle(forceAll = false): Promise<FreshnessEvaluationResult> {
    const articles = await this.getArticles();
    return evaluateAndRefreshArticles(articles, forceAll);
  }

  /**
   * Get related articles excluding current
   */
  public async getRelatedArticles(currentSlug: string, category: string, limit = 3): Promise<NewsArticle[]> {
    const all = await this.getArticles();
    return all
      .filter(a => a.slug !== currentSlug)
      .sort((a, b) => (a.category === category ? -1 : 1))
      .slice(0, limit);
  }
}

export const newsService = new NewsService();
