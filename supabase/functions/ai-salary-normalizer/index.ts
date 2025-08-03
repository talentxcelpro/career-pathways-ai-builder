import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Salary normalization patterns and rules
const SALARY_PATTERNS = [
  // INR patterns
  { pattern: /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*-\s*₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(lpa|lakh|lakhs|per annum|annually)/i, currency: 'INR', frequency: 'yearly' },
  { pattern: /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(lpa|lakh|lakhs|per annum|annually)/i, currency: 'INR', frequency: 'yearly' },
  { pattern: /(\d+(?:,\d+)*(?:\.\d+)?)\s*-\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(lpa|lakh|lakhs)/i, currency: 'INR', frequency: 'yearly' },
  { pattern: /(\d+(?:,\d+)*(?:\.\d+)?)\s*(lpa|lakh|lakhs)/i, currency: 'INR', frequency: 'yearly' },
  { pattern: /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*-\s*₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(per month|monthly)/i, currency: 'INR', frequency: 'monthly' },
  { pattern: /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(per month|monthly)/i, currency: 'INR', frequency: 'monthly' },
  { pattern: /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*-\s*₹\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(per hour|hourly)/i, currency: 'INR', frequency: 'hourly' },
  
  // USD patterns
  { pattern: /\$\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*-\s*\$\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(per year|annually)/i, currency: 'USD', frequency: 'yearly' },
  { pattern: /\$\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*k\s*-\s*\$\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*k/i, currency: 'USD', frequency: 'yearly', multiplier: 1000 },
  { pattern: /\$\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(per hour|hourly)/i, currency: 'USD', frequency: 'hourly' },
  { pattern: /\$\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(per month|monthly)/i, currency: 'USD', frequency: 'monthly' },
  
  // Generic number patterns
  { pattern: /(\d+(?:,\d+)*(?:\.\d+)?)\s*-\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*k\s*(per year|annually)?/i, currency: 'INR', frequency: 'yearly', multiplier: 1000 },
  { pattern: /(\d+(?:,\d+)*(?:\.\d+)?)\s*k\s*(per year|annually)?/i, currency: 'INR', frequency: 'yearly', multiplier: 1000 }
];

// Convert various salary formats to normalized annual INR
function normalizeSalary(amount: number, frequency: string, currency: string = 'INR', multiplier: number = 1): number {
  let normalizedAmount = amount * multiplier;
  
  // Convert to INR if needed (rough conversion rates)
  if (currency === 'USD') {
    normalizedAmount *= 83; // 1 USD = 83 INR approximately
  }
  
  // Convert to annual
  switch (frequency.toLowerCase()) {
    case 'hourly':
      return normalizedAmount * 40 * 52; // 40 hours/week * 52 weeks
    case 'monthly':
      return normalizedAmount * 12;
    case 'yearly':
    case 'annually':
    default:
      return normalizedAmount;
  }
}

// Extract salary information using AI-powered parsing
async function aiParseSalary(salaryText: string): Promise<any> {
  if (!openAIApiKey) {
    console.log('⚠️ OpenAI API key not found, using pattern-based parsing only');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are a salary parsing expert. Extract salary information and return a JSON object with:
            {
              "min_salary": number (in original currency),
              "max_salary": number (in original currency, same as min if single value),
              "currency": "INR" | "USD" | "EUR",
              "frequency": "hourly" | "monthly" | "yearly",
              "confidence": 0-100,
              "reasoning": "explanation"
            }
            If no salary found, return null.`
          },
          {
            role: 'user',
            content: `Parse salary from: "${salaryText}"`
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`AI parsing failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResult = data.choices[0]?.message?.content;
    
    if (aiResult && aiResult !== 'null') {
      return JSON.parse(aiResult);
    }
  } catch (error) {
    console.error('❌ AI salary parsing error:', error);
  }
  
  return null;
}

// Pattern-based salary extraction
function patternParseSalary(salaryText: string): any {
  if (!salaryText) return null;
  
  const text = salaryText.toLowerCase().replace(/,/g, '');
  
  for (const rule of SALARY_PATTERNS) {
    const match = text.match(rule.pattern);
    if (match) {
      const min = parseFloat(match[1]);
      const max = match[2] ? parseFloat(match[2]) : min;
      
      return {
        min_salary: min,
        max_salary: max,
        currency: rule.currency,
        frequency: rule.frequency,
        multiplier: rule.multiplier || 1,
        confidence: 80,
        reasoning: `Pattern matched: ${rule.pattern}`
      };
    }
  }
  
  return null;
}

// Validate parsed salary for reasonableness
function validateSalary(parsed: any, jobData: any): { isValid: boolean; flags: string[]; adjustedConfidence: number } {
  const flags: string[] = [];
  let adjustedConfidence = parsed.confidence || 50;
  
  if (!parsed || !parsed.min_salary) {
    return { isValid: false, flags: ['no_salary_data'], adjustedConfidence: 0 };
  }
  
  // Normalize to annual INR for validation
  const minAnnual = normalizeSalary(parsed.min_salary, parsed.frequency, parsed.currency, parsed.multiplier);
  const maxAnnual = normalizeSalary(parsed.max_salary, parsed.frequency, parsed.currency, parsed.multiplier);
  
  // Validation rules
  if (minAnnual < 100000) {
    flags.push('salary_too_low');
    adjustedConfidence -= 30;
  }
  
  if (maxAnnual > 50000000) {
    flags.push('salary_too_high');
    adjustedConfidence -= 20;
  }
  
  if (maxAnnual < minAnnual) {
    flags.push('invalid_range');
    adjustedConfidence -= 40;
  }
  
  if (maxAnnual / minAnnual > 3) {
    flags.push('range_too_wide');
    adjustedConfidence -= 10;
  }
  
  // Experience level validation
  const experience = jobData.experience_level?.toLowerCase();
  if (experience === 'fresher' && minAnnual > 1000000) {
    flags.push('high_salary_for_fresher');
    adjustedConfidence -= 15;
  }
  
  if (experience === 'executive' && maxAnnual < 1500000) {
    flags.push('low_salary_for_executive');
    adjustedConfidence -= 15;
  }
  
  // Employment type validation
  const empType = jobData.employment_type?.toLowerCase();
  if (empType === 'internship' && minAnnual > 500000) {
    flags.push('high_salary_for_internship');
    adjustedConfidence -= 20;
  }
  
  return {
    isValid: adjustedConfidence > 30 && flags.length < 3,
    flags,
    adjustedConfidence: Math.max(0, Math.min(100, adjustedConfidence))
  };
}

async function processSalaryNormalization(jobIds?: string[], batchSize: number = 500) {
  console.log(`🤖 Starting AI salary normalization for ${jobIds ? jobIds.length : 'all'} jobs`);
  
  try {
    let query = supabase
      .from('jobs')
      .select('id, title, company_name, salary_range, salary_min, salary_max, experience_level, employment_type, description')
      .or('salary_min.is.null,salary_max.is.null,salary_range.neq.')
      .limit(batchSize);
    
    if (jobIds) {
      query = query.in('id', jobIds);
    }
    
    const { data: jobs, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }
    
    if (!jobs || jobs.length === 0) {
      return { processedJobs: 0, validatedJobs: 0, message: 'No jobs found for salary normalization' };
    }
    
    console.log(`📊 Processing ${jobs.length} jobs for salary normalization`);
    
    let processedCount = 0;
    let validatedCount = 0;
    const salaryValidations = [];
    
    // Process jobs in smaller batches to avoid timeouts
    const processingBatchSize = 20;
    for (let i = 0; i < jobs.length; i += processingBatchSize) {
      const jobBatch = jobs.slice(i, i + processingBatchSize);
      
      const batchPromises = jobBatch.map(async (job) => {
        try {
          const salaryText = job.salary_range || `${job.salary_min || ''}-${job.salary_max || ''}`.replace('null', '');
          
          if (!salaryText || salaryText.trim() === '' || salaryText === '-') {
            return null;
          }
          
          // Try AI parsing first, then fall back to pattern matching
          let parsed = await aiParseSalary(salaryText);
          if (!parsed) {
            parsed = patternParseSalary(salaryText);
          }
          
          if (!parsed) {
            return null;
          }
          
          // Validate the parsed salary
          const validation = validateSalary(parsed, job);
          
          if (validation.isValid) {
            // Normalize to annual INR
            const normalizedMin = normalizeSalary(
              parsed.min_salary, 
              parsed.frequency, 
              parsed.currency, 
              parsed.multiplier
            );
            const normalizedMax = normalizeSalary(
              parsed.max_salary, 
              parsed.frequency, 
              parsed.currency, 
              parsed.multiplier
            );
            
            // Update job with normalized salary
            await supabase
              .from('jobs')
              .update({
                salary_min: normalizedMin,
                salary_max: normalizedMax,
                updated_at: new Date().toISOString()
              })
              .eq('id', job.id);
            
            // Log salary validation
            salaryValidations.push({
              job_id: job.id,
              original_salary_text: salaryText,
              parsed_min_salary: parsed.min_salary,
              parsed_max_salary: parsed.max_salary,
              detected_frequency: parsed.frequency,
              normalized_annual_min: normalizedMin,
              normalized_annual_max: normalizedMax,
              confidence_score: validation.adjustedConfidence,
              validation_flags: validation.flags,
              ai_reasoning: parsed.reasoning || 'Pattern-based parsing'
            });
            
            validatedCount++;
          }
          
          processedCount++;
          return { jobId: job.id, success: validation.isValid };
          
        } catch (error) {
          console.error(`❌ Error processing job ${job.id}:`, error);
          processedCount++;
          return { jobId: job.id, success: false, error: error.message };
        }
      });
      
      await Promise.all(batchPromises);
      
      // Small delay between batches
      if (i + processingBatchSize < jobs.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Bulk insert salary validations
    if (salaryValidations.length > 0) {
      await supabase
        .from('salary_validations')
        .insert(salaryValidations);
    }
    
    console.log(`✅ Salary normalization completed: ${validatedCount}/${processedCount} jobs updated`);
    
    return {
      processedJobs: processedCount,
      validatedJobs: validatedCount,
      successRate: Math.round((validatedCount / processedCount) * 100),
      salaryValidations: salaryValidations.length
    };
    
  } catch (error) {
    console.error('❌ Salary normalization failed:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobIds, batchSize = 500, enableQualityValidation = true } = await req.json();
    
    console.log(`🎯 AI salary normalization request:`, { 
      jobCount: jobIds?.length || 'all',
      batchSize, 
      enableQualityValidation 
    });

    const result = await processSalaryNormalization(jobIds, batchSize);

    return new Response(JSON.stringify({
      success: true,
      message: `AI salary normalization completed successfully!`,
      ...result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('❌ AI salary normalization error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});