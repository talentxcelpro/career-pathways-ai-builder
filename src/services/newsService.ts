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
    let articles: NewsArticle[] = [...FOUNDATION_NEWS_ARTICLES];

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
