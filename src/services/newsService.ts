import { supabase } from '@/integrations/supabase/client';
import { NewsArticle, NewsCategory } from '@/types/news';
import { FOUNDATION_NEWS_ARTICLES } from '@/data/newsArticles';

export class NewsService {
  /**
   * Fetch list of articles with optional category and search filters
   */
  public async getArticles(category?: NewsCategory, search?: string): Promise<NewsArticle[]> {
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
          publishedAt: d.published_at || d.created_at,
          updatedAt: d.updated_at,
          author: {
            name: d.author_name || 'TalentXcel Editorial Desk',
            role: d.author_role || 'Platform Intelligence',
            avatar: d.author_avatar || '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png'
          },
          imageUrl: d.image_url || '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png',
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

    // Filter by Category
    if (category && category !== 'All') {
      articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Search Query
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return articles;
  }

  /**
   * Get single article by slug
   */
  public async getArticleBySlug(slug: string): Promise<NewsArticle | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('news_articles')
        .select('*')
        .or(`slug.eq.${slug},url.eq.${slug}`)
        .eq('published_status', 'published')
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          slug: data.slug || data.url || data.id,
          title: data.title,
          summary: data.summary || data.description || '',
          content: data.content || '',
          category: (data.category || 'Company News') as Exclude<NewsCategory, 'All'>,
          publishedAt: data.published_at || data.created_at,
          updatedAt: data.updated_at,
          author: {
            name: data.author_name || 'TalentXcel Editorial Desk',
            role: data.author_role || 'Platform Intelligence',
            avatar: data.author_avatar || '/lovable-uploads/6d89e12a-6a33-4059-acbe-49af3b255eb3.png'
          },
          imageUrl: data.image_url || '/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png',
          readTime: data.read_time || '4 min read',
          tags: data.tags || ['TalentXcel'],
          keyTakeaways: data.key_takeaways || [],
          isFeatured: data.is_featured || false
        };
      }
    } catch {
      // Fallback to in-memory foundation articles
    }

    return FOUNDATION_NEWS_ARTICLES.find(a => a.slug === slug) || null;
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
