import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Redis } from "https://esm.sh/@upstash/redis@1.35.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const redis = new Redis({
      url: 'https://usw1-sacred-boa-34251.upstash.io',
      token: 'AYTyASQgNzI2YzM1YjItN2JjNy00Y2E0LWI1NDktOGY5ZWM3YzlhNWQ5ZjNlMGRjY2FiNDkyNDgzNzg5MGI5MDMzNWRlYjZmZWI=',
    });

    const { action, key, value, ttl, tag, keys } = await req.json();

    switch (action) {
      case 'get':
        const cachedValue = await redis.get(key);
        await redis.incr('cache:hits');
        return new Response(JSON.stringify({ success: true, data: cachedValue }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });

      case 'set':
        await redis.setex(key, ttl || 3600, JSON.stringify(value));
        
        // Store cache tags for invalidation
        if (tag) {
          await redis.sadd(`tag:${tag}`, key);
          await redis.expire(`tag:${tag}`, ttl || 3600);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });

      case 'del':
        await redis.del(key);
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });

      case 'invalidateByTag':
        const tagKeys = await redis.smembers(`tag:${tag}`);
        if (tagKeys.length > 0) {
          await redis.del(...tagKeys);
          await redis.del(`tag:${tag}`);
        }
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });

      case 'exists':
        const exists = await redis.exists(key);
        return new Response(JSON.stringify({ success: true, data: exists === 1 }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });

      case 'increment':
        const result = await redis.incrby(key, value || 1);
        return new Response(JSON.stringify({ success: true, data: result }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });

      case 'stats':
        const hits = await redis.get('cache:hits') || 0;
        const misses = await redis.get('cache:misses') || 0;
        const total = Number(hits) + Number(misses);
        const hitRate = total > 0 ? (Number(hits) / total) * 100 : 0;

        return new Response(JSON.stringify({
          success: true,
          data: {
            hits: Number(hits),
            misses: Number(misses),
            hitRate: Math.round(hitRate * 100) / 100
          }
        }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });

      case 'mget':
        const values = await redis.mget(...keys);
        return new Response(JSON.stringify({ success: true, data: values }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });

      case 'clear':
        // Clear cache by pattern or all
        await redis.flushall();
        return new Response(JSON.stringify({ success: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });

      default:
        return new Response(JSON.stringify({ success: false, error: 'Invalid action' }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
    }

  } catch (error: any) {
    console.error("Cache manager error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);