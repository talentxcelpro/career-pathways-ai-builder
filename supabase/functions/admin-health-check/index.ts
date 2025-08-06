import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthCheckResult {
  service: string
  status: 'healthy' | 'warning' | 'error'
  message: string
  responseTime?: number
  details?: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🏥 Starting admin health check...')
    const startTime = Date.now()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const healthResults: HealthCheckResult[] = []
    
    // 1. Test Database Connection
    try {
      const dbStart = Date.now()
      const { data, error } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .limit(1)
      
      const dbTime = Date.now() - dbStart
      
      if (error) {
        healthResults.push({
          service: 'database',
          status: 'error',
          message: `Database connection failed: ${error.message}`,
          responseTime: dbTime
        })
      } else {
        healthResults.push({
          service: 'database',
          status: 'healthy',
          message: 'Database connection successful',
          responseTime: dbTime,
          details: { recordCount: data?.length || 0 }
        })
      }
    } catch (dbError) {
      healthResults.push({
        service: 'database',
        status: 'error',
        message: `Database test failed: ${dbError.message}`,
        details: dbError
      })
    }
    
    // 2. Test Email Function
    try {
      const emailStart = Date.now()
      const { data, error } = await supabase.functions.invoke('send-email-aws-ses', {
        body: {
          to: 'health-check@test.com',
          subject: 'Health Check',
          html: '<p>Test</p>',
          dryRun: true
        }
      })
      
      const emailTime = Date.now() - emailStart
      
      if (error) {
        healthResults.push({
          service: 'email',
          status: 'error',
          message: `Email function test failed: ${error.message}`,
          responseTime: emailTime
        })
      } else {
        healthResults.push({
          service: 'email',
          status: 'healthy',
          message: 'Email function accessible',
          responseTime: emailTime
        })
      }
    } catch (emailError) {
      healthResults.push({
        service: 'email',
        status: 'warning',
        message: `Email function test failed: ${emailError.message}`
      })
    }
    
    // 3. Test Job Scraper
    try {
      const scraperStart = Date.now()
      const { data, error } = await supabase.functions.invoke('real-job-scraper', {
        body: { limit: 1, healthCheck: true }
      })
      
      const scraperTime = Date.now() - scraperStart
      
      if (error) {
        healthResults.push({
          service: 'job-scraper',
          status: 'error',
          message: `Job scraper test failed: ${error.message}`,
          responseTime: scraperTime
        })
      } else {
        healthResults.push({
          service: 'job-scraper',
          status: 'healthy',
          message: 'Job scraper function accessible',
          responseTime: scraperTime
        })
      }
    } catch (scraperError) {
      healthResults.push({
        service: 'job-scraper',
        status: 'warning',
        message: `Job scraper test failed: ${scraperError.message}`
      })
    }
    
    // 4. Test Sitemap Generation
    try {
      const sitemapStart = Date.now()
      const { data, error } = await supabase.functions.invoke('optimized-sitemap')
      
      const sitemapTime = Date.now() - sitemapStart
      
      if (error) {
        healthResults.push({
          service: 'sitemap',
          status: 'error',
          message: `Sitemap generation test failed: ${error.message}`,
          responseTime: sitemapTime
        })
      } else {
        healthResults.push({
          service: 'sitemap',
          status: 'healthy',
          message: 'Sitemap generation accessible',
          responseTime: sitemapTime
        })
      }
    } catch (sitemapError) {
      healthResults.push({
        service: 'sitemap',
        status: 'warning',
        message: `Sitemap test failed: ${sitemapError.message}`
      })
    }
    
    // Calculate overall status
    const hasErrors = healthResults.some(r => r.status === 'error')
    const hasWarnings = healthResults.some(r => r.status === 'warning')
    
    const overallStatus = hasErrors ? 'error' : hasWarnings ? 'warning' : 'healthy'
    const totalTime = Date.now() - startTime
    
    const response = {
      timestamp: new Date().toISOString(),
      overallStatus,
      totalResponseTime: totalTime,
      services: healthResults,
      summary: {
        healthy: healthResults.filter(r => r.status === 'healthy').length,
        warnings: healthResults.filter(r => r.status === 'warning').length,
        errors: healthResults.filter(r => r.status === 'error').length
      }
    }
    
    console.log('🏥 Health check completed:', response)
    
    return new Response(JSON.stringify(response), {
      status: overallStatus === 'error' ? 503 : 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })

  } catch (error) {
    console.error('❌ Health check error:', error)
    return new Response(JSON.stringify({
      timestamp: new Date().toISOString(),
      overallStatus: 'error',
      error: 'Health check system failure',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})