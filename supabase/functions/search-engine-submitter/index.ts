import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Search engine submitter called');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, engine, urls, sitemap_url } = await req.json();

    let results = [];

    switch (action) {
      case 'submit_sitemap':
        results = await submitSitemap(engine, sitemap_url, supabase);
        break;
      case 'submit_urls':
        results = await submitUrls(engine, urls, supabase);
        break;
      case 'ping_engines':
        results = await pingSearchEngines(sitemap_url, supabase);
        break;
      case 'check_indexing':
        results = await checkIndexingStatus(urls, supabase);
        break;
      default:
        throw new Error('Invalid action specified');
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Search engine submission error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function submitSitemap(engine: string, sitemapUrl: string, supabase: any) {
  console.log(`Submitting sitemap to ${engine}: ${sitemapUrl}`);

  const submissionRecord = {
    engine_name: engine,
    submission_type: 'sitemap',
    target_url: sitemapUrl,
    status: 'pending',
    submitted_at: new Date().toISOString(),
    retry_count: 0
  };

  try {
    let success = false;
    let responseData = {};

    switch (engine.toLowerCase()) {
      case 'google':
        success = await submitToGoogle(sitemapUrl);
        break;
      case 'bing':
        success = await submitToBing(sitemapUrl);
        break;
      case 'yandex':
        success = await submitToYandex(sitemapUrl);
        break;
      default:
        throw new Error(`Unsupported search engine: ${engine}`);
    }

    submissionRecord.status = success ? 'submitted' : 'failed';
    submissionRecord.response_data = responseData;

    // Log submission to database
    await supabase.from('search_engine_submissions').insert(submissionRecord);

    return { engine, success, response: responseData };
  } catch (error) {
    submissionRecord.status = 'failed';
    submissionRecord.response_data = { error: error.message };
    
    await supabase.from('search_engine_submissions').insert(submissionRecord);
    
    return { engine, success: false, error: error.message };
  }
}

async function submitUrls(engine: string, urls: string[], supabase: any) {
  console.log(`Submitting ${urls.length} URLs to ${engine}`);
  
  const results = [];
  
  for (const url of urls) {
    const submissionRecord = {
      engine_name: engine,
      submission_type: 'url',
      target_url: url,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      retry_count: 0
    };

    try {
      let success = false;
      let responseData = {};

      switch (engine.toLowerCase()) {
        case 'google':
          success = await submitUrlToGoogle(url);
          break;
        case 'bing':
          success = await submitUrlToBing(url);
          break;
        default:
          throw new Error(`URL submission not supported for ${engine}`);
      }

      submissionRecord.status = success ? 'submitted' : 'failed';
      submissionRecord.response_data = responseData;

      await supabase.from('search_engine_submissions').insert(submissionRecord);
      results.push({ url, success, response: responseData });
    } catch (error) {
      submissionRecord.status = 'failed';
      submissionRecord.response_data = { error: error.message };
      
      await supabase.from('search_engine_submissions').insert(submissionRecord);
      results.push({ url, success: false, error: error.message });
    }
  }

  return results;
}

async function pingSearchEngines(sitemapUrl: string, supabase: any) {
  console.log(`Pinging search engines for sitemap: ${sitemapUrl}`);
  
  const engines = [
    { name: 'Google', url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` },
    { name: 'Bing', url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` }
  ];

  const results = [];

  for (const engine of engines) {
    try {
      const response = await fetch(engine.url, { method: 'GET' });
      const success = response.ok;
      
      const submissionRecord = {
        engine_name: engine.name.toLowerCase(),
        submission_type: 'ping',
        target_url: sitemapUrl,
        status: success ? 'submitted' : 'failed',
        response_data: { status_code: response.status },
        submitted_at: new Date().toISOString(),
        retry_count: 0
      };

      await supabase.from('search_engine_submissions').insert(submissionRecord);
      
      results.push({
        engine: engine.name,
        success,
        status_code: response.status
      });
    } catch (error) {
      const submissionRecord = {
        engine_name: engine.name.toLowerCase(),
        submission_type: 'ping',
        target_url: sitemapUrl,
        status: 'failed',
        response_data: { error: error.message },
        submitted_at: new Date().toISOString(),
        retry_count: 0
      };

      await supabase.from('search_engine_submissions').insert(submissionRecord);
      
      results.push({
        engine: engine.name,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

async function checkIndexingStatus(urls: string[], supabase: any) {
  console.log(`Checking indexing status for ${urls.length} URLs`);
  
  const results = [];
  
  for (const url of urls) {
    try {
      // Check Google indexing status
      const googleIndexed = await checkGoogleIndexing(url);
      const bingIndexed = await checkBingIndexing(url);
      
      const statusData = {
        url,
        google_indexed: googleIndexed,
        bing_indexed: bingIndexed,
        checked_at: new Date().toISOString()
      };

      // Store monitoring data
      await supabase.from('seo_monitoring').upsert({
        page_url: url,
        page_type: 'unknown',
        indexing_status: statusData,
        monitored_at: new Date().toISOString()
      }, {
        onConflict: 'page_url'
      });

      results.push(statusData);
    } catch (error) {
      results.push({
        url,
        error: error.message,
        checked_at: new Date().toISOString()
      });
    }
  }

  return results;
}

// Google Search Console API integration (requires authentication)
async function submitToGoogle(sitemapUrl: string): Promise<boolean> {
  // This would require Google Search Console API credentials
  // For now, we'll use the ping method
  console.log('Google Search Console API integration needed for direct submission');
  return false;
}

async function submitUrlToGoogle(url: string): Promise<boolean> {
  // This would require Google Indexing API
  console.log('Google Indexing API integration needed for URL submission');
  return false;
}

// Bing Webmaster Tools API integration
async function submitToBing(sitemapUrl: string): Promise<boolean> {
  // This would require Bing Webmaster Tools API credentials
  console.log('Bing Webmaster Tools API integration needed');
  return false;
}

async function submitUrlToBing(url: string): Promise<boolean> {
  // This would require Bing URL Submission API
  console.log('Bing URL Submission API integration needed');
  return false;
}

// Yandex Webmaster API integration
async function submitToYandex(sitemapUrl: string): Promise<boolean> {
  // This would require Yandex Webmaster API credentials
  console.log('Yandex Webmaster API integration needed');
  return false;
}

async function checkGoogleIndexing(url: string): Promise<boolean> {
  try {
    // Simple check using site: operator (not 100% accurate but useful indicator)
    const searchUrl = `https://www.google.com/search?q=site:${encodeURIComponent(url)}`;
    // This is a simplified check - in production, you'd use Google Search Console API
    return false; // Placeholder
  } catch (error) {
    console.error('Error checking Google indexing:', error);
    return false;
  }
}

async function checkBingIndexing(url: string): Promise<boolean> {
  try {
    // Simple check using site: operator
    const searchUrl = `https://www.bing.com/search?q=site:${encodeURIComponent(url)}`;
    // This is a simplified check - in production, you'd use Bing Webmaster Tools API
    return false; // Placeholder
  } catch (error) {
    console.error('Error checking Bing indexing:', error);
    return false;
  }
}