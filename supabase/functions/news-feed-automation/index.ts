import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get NewsAPI key from secrets
const newsApiKey = Deno.env.get('NEWS_API_KEY');

interface NewsArticle {
  title: string;
  description?: string;
  content?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    name: string;
  };
  author?: string;
}

async function fetchNewsArticles(): Promise<NewsArticle[]> {
  if (!newsApiKey) {
    console.warn('NEWS_API_KEY not found, skipping news fetch');
    return [];
  }

  try {
    // Fetch job and career-related news
    const queries = [
      'jobs AND career',
      'employment AND hiring',
      'workplace AND industry',
      'professional development',
      'job market AND recruitment'
    ];

    const allArticles: NewsArticle[] = [];

    for (const query of queries) {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=5&apiKey=${newsApiKey}`
      );

      if (!response.ok) {
        console.error(`Failed to fetch news for query "${query}":`, response.status, response.statusText);
        continue;
      }

      const data = await response.json();
      if (data.articles && data.articles.length > 0) {
        allArticles.push(...data.articles.slice(0, 3)); // Take top 3 from each query
      }
    }

    console.log(`Fetched ${allArticles.length} news articles`);
    return allArticles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

async function saveNewsArticles(articles: NewsArticle[]) {
  // Remove duplicates by URL to prevent conflict errors
  const uniqueArticles = articles.filter((article, index, self) => 
    index === self.findIndex(a => a.url === article.url)
  );

  console.log(`Deduped from ${articles.length} to ${uniqueArticles.length} articles`);

  const newsToInsert = uniqueArticles.map(article => ({
    title: article.title,
    description: article.description || '',
    content: article.content || '',
    url: article.url,
    source_name: article.source.name,
    author: article.author || '',
    published_at: article.publishedAt,
    category: 'career',
    tags: ['jobs', 'career', 'employment'],
    image_url: article.urlToImage || null,
    is_trending: Math.random() > 0.7, // Mark some as trending randomly
    engagement_score: Math.floor(Math.random() * 100)
  }));

  // Insert news articles (ignore duplicates based on URL)
  const { data: insertedNews, error } = await supabase
    .from('news_articles')
    .upsert(newsToInsert, { 
      onConflict: 'url',
      ignoreDuplicates: true 
    })
    .select();

  if (error) {
    console.error('Error saving news articles:', error);
    return [];
  }

  console.log(`Saved ${insertedNews?.length || 0} news articles`);
  return insertedNews || [];
}

async function createNewsPosts(newsArticles: any[]) {
  if (!newsArticles.length) return;

  // Get a bot user to post news as
  const { data: botUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('is_ai_bot', true)
    .limit(1)
    .single();

  const authorId = botUser?.id;
  if (!authorId) {
    console.warn('No bot user found, skipping news posts creation');
    return;
  }

  // Create posts for news articles
  const postsToInsert = newsArticles.slice(0, 5).map(article => ({
    author_id: authorId,
    user_id: authorId,
    headline: article.title,
    content: `${article.description}\n\nRead more: ${article.url}`,
    post_type: 'article',
    is_public: true,
    visibility: 'public',
    status: 'published',
    tags: ['news', 'career', 'industry'],
    news_article_id: article.id,
    is_bot_post: true,
    origin: 'news_automation'
  }));

  const { error: postsError } = await supabase
    .from('posts')
    .insert(postsToInsert);

  if (postsError) {
    console.error('Error creating news posts:', postsError);
  } else {
    console.log(`Created ${postsToInsert.length} news posts`);
  }
}

async function cleanupOldNews() {
  // Delete news older than 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { error } = await supabase
    .from('news_articles')
    .delete()
    .lt('published_at', sevenDaysAgo.toISOString());

  if (error) {
    console.error('Error cleaning up old news:', error);
  } else {
    console.log('Cleaned up old news articles');
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🗞️ Starting news feed automation...');

    // Fetch latest news articles
    const articles = await fetchNewsArticles();
    
    if (articles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No new articles found or API key missing',
          articlesProcessed: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Save articles to database
    const savedArticles = await saveNewsArticles(articles);

    // Create posts for news articles
    await createNewsPosts(savedArticles);

    // Clean up old news
    await cleanupOldNews();

    console.log('✅ News feed automation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'News feed updated successfully',
        articlesProcessed: savedArticles.length,
        postsCreated: Math.min(savedArticles.length, 5)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('❌ News automation error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to update news feed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
};

serve(handler);