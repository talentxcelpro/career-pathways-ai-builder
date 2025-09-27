import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cache-control',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS, POST',
};

interface CacheEntry {
  data: Uint8Array;
  contentType: string;
  etag: string;
  lastModified: string;
  timestamp: number;
}

// In-memory cache with LRU eviction
class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private accessOrder = new Map<string, number>();
  private maxSize: number;
  private currentTime = 0;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired (24 hours)
    if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      return null;
    }

    // Update access order
    this.accessOrder.set(key, ++this.currentTime);
    return entry;
  }

  set(key: string, entry: CacheEntry): void {
    // If at capacity, remove least recently used
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      let oldestKey = '';
      let oldestTime = Infinity;
      
      for (const [k, time] of this.accessOrder) {
        if (time < oldestTime) {
          oldestTime = time;
          oldestKey = k;
        }
      }
      
      if (oldestKey) {
        this.cache.delete(oldestKey);
        this.accessOrder.delete(oldestKey);
      }
    }

    this.cache.set(key, entry);
    this.accessOrder.set(key, ++this.currentTime);
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}

const cache = new MemoryCache(150); // Cache up to 150 files

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    
    // Extract the storage path (everything after the first /)
    const storagePath = path.substring(1);
    
    if (!storagePath) {
      return new Response('Missing storage path', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Check cache first
    const cacheKey = storagePath;
    const cachedEntry = cache.get(cacheKey);
    
    if (cachedEntry) {
      // Check ETag for conditional requests
      const clientETag = req.headers.get('if-none-match');
      if (clientETag === cachedEntry.etag) {
        return new Response(null, {
          status: 304,
          headers: {
            ...corsHeaders,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'ETag': cachedEntry.etag,
            'X-Cache': 'HIT-304'
          }
        });
      }

      console.log(`Cache HIT for: ${storagePath}`);
      return new Response(new Uint8Array(cachedEntry.data), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': cachedEntry.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'ETag': cachedEntry.etag,
          'Last-Modified': cachedEntry.lastModified,
          'X-Cache': 'HIT',
          'X-Response-Time': `${Date.now() - startTime}ms`
        }
      });
    }

    console.log(`Cache MISS for: ${storagePath}`);

    // Initialize Supabase client with optimized settings
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: {
          'cache-control': 'no-cache'
        }
      }
    });

    // Parse storage path: bucket/path
    const pathParts = storagePath.split('/');
    const bucket = pathParts[0];
    const filePath = pathParts.slice(1).join('/');

    if (!bucket || !filePath) {
      return new Response('Invalid storage path format', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Fetch from Supabase storage with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath);

      clearTimeout(timeoutId);

      if (error) {
        console.error('Storage error:', error);
        return new Response('File not found', { 
          status: 404, 
          headers: corsHeaders 
        });
      }

      if (!data) {
        return new Response('File not found', { 
          status: 404, 
          headers: corsHeaders 
        });
      }

      // Convert blob to array buffer
      const arrayBuffer = await data.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      // Generate ETag and metadata
      const etag = `"${Array.from(new Uint8Array(await crypto.subtle.digest('SHA-1', arrayBuffer)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 16)}"`;
      
      const lastModified = new Date().toUTCString();
      const contentType = data.type || 'application/octet-stream';

      // Cache the result (only cache files < 5MB)
      if (fileData.length < 5 * 1024 * 1024) {
        cache.set(cacheKey, {
          data: fileData,
          contentType,
          etag,
          lastModified,
          timestamp: Date.now()
        });
      }

      // Optimize content type for web delivery
      let optimizedContentType = contentType;
      if (contentType.startsWith('image/') && !url.searchParams.has('original')) {
        // Suggest WebP for better compression
        if (req.headers.get('accept')?.includes('image/webp')) {
          optimizedContentType = 'image/webp';
        }
      }

      return new Response(fileData, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': optimizedContentType,
          'Content-Length': fileData.length.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'ETag': etag,
          'Last-Modified': lastModified,
          'X-Cache': 'MISS',
          'X-Response-Time': `${Date.now() - startTime}ms`,
          'X-Cache-Stats': JSON.stringify(cache.getStats()),
          'Vary': 'Accept'
        }
      });

    } catch (abortError: any) {
      clearTimeout(timeoutId);
      if (abortError.name === 'AbortError') {
        return new Response('Request timeout', { 
          status: 408, 
          headers: corsHeaders 
        });
      }
      throw abortError;
    }

  } catch (error: any) {
    console.error('Storage proxy error:', error);
    
    // Return appropriate error based on type
    if (error.name === 'AbortError') {
      return new Response('Request timeout', { 
        status: 408, 
        headers: corsHeaders 
      });
    }
    
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message,
      responseTime: `${Date.now() - startTime}ms`
    }), { 
      status: 500, 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});