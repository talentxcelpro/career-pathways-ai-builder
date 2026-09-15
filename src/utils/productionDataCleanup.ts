// Production data cleanup and mock detection
import { supabase } from '@/integrations/supabase/client';

interface CleanupResult {
  mockDataRemoved: number;
  inrReferencesFixed: number;
  testContentCleaned: number;
  productionReady: boolean;
}

// Detect and clean mock data
export const detectMockData = (content: string): boolean => {
  const mockPatterns = [
    /mock|dummy|placeholder|fake|sample|test.*data/i,
    /lorem.*ipsum/i,
    /example\.com|test\.com/i,
    /₹\d+.*LPA/g, // INR salary patterns
    /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/, // Hardcoded JWT
    /localhost:3000|http:\/\/localhost/i
  ];
  
  return mockPatterns.some(pattern => pattern.test(content));
};

// Clean INR references and convert to TXC
export const cleanCurrencyReferences = (content: string): string => {
  return content
    .replace(/₹(\d+(?:\.\d+)?)\s*(?:LPA|lpa)/g, '$1 TXC annually')
    .replace(/₹(\d+(?:,\d{3})*(?:\.\d+)?)/g, '$1 TXC')
    .replace(/INR|Indian Rupees?/gi, 'TXC')
    .replace(/\brupees?\b/gi, 'TXC');
};

// Remove console statements for production
export const removeConsoleStatements = (content: string): string => {
  return content
    .replace(/console\.(log|warn|error|debug|info)\([^)]*\);?\s*/g, '')
    .replace(/console\.(log|warn|error|debug|info)`[^`]*`;?\s*/g, '');
};

// Clean mock email templates
export const cleanEmailTemplate = (template: string): string => {
  let cleaned = template;
  
  // Replace mock salary data
  cleaned = cleanCurrencyReferences(cleaned);
  
  // Replace test email addresses
  cleaned = cleaned
    .replace(/test@example\.com/g, 'support@talentxcel.in')
    .replace(/admin@test\.com/g, 'admin@talentxcel.in');
    
  // Remove mock job data
  cleaned = cleaned.replace(/salary_range:\s*"₹\d+-\d+\s*LPA"/g, 'salary_range: "Competitive"');
  
  return cleaned;
};

// Comprehensive production cleanup
export const runProductionCleanup = async (): Promise<CleanupResult> => {
  let mockDataRemoved = 0;
  let inrReferencesFixed = 0;
  let testContentCleaned = 0;

  try {
    // Clean test users and dummy data
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .or('full_name.ilike.%test%,full_name.ilike.%dummy%,email.ilike.%test%,email.ilike.%example%');

    if (profiles) {
      for (const profile of profiles) {
        if (detectMockData(profile.full_name || '') || detectMockData(profile.email || '')) {
          // Mark as test data instead of deleting to preserve referential integrity
          await supabase
            .from('profiles')
            .update({ 
              full_name: '[Test User - Hidden]',
              about: '[Test content removed for production]'
            })
            .eq('id', profile.id);
          
          mockDataRemoved++;
        }
      }
    }

    // Clean job postings with INR references
    const { data: jobs } = await supabase
      .from('jobs')
      .select('id, description, salary_range')
      .or('description.ilike.%₹%,salary_range.ilike.%₹%,salary_range.ilike.%INR%');

    if (jobs) {
      for (const job of jobs) {
        const cleanedDescription = cleanCurrencyReferences(job.description || '');
        const cleanedSalary = cleanCurrencyReferences(job.salary_range || '');
        
        await supabase
          .from('jobs')
          .update({
            description: cleanedDescription,
            salary_range: cleanedSalary
          })
          .eq('id', job.id);
        
        inrReferencesFixed++;
      }
    }

    // Clean email templates
    const { data: templates } = await supabase
      .from('email_templates')
      .select('id, html_template, subject');

    if (templates) {
      for (const template of templates) {
        const cleanedHtml = cleanEmailTemplate(template.html_template || '');
        const cleanedSubject = cleanCurrencyReferences(template.subject || '');
        
        if (cleanedHtml !== template.html_template || cleanedSubject !== template.subject) {
          await supabase
            .from('email_templates')
            .update({
              html_template: cleanedHtml,
              subject: cleanedSubject
            })
            .eq('id', template.id);
          
          testContentCleaned++;
        }
      }
    }

    const productionReady = mockDataRemoved === 0 && inrReferencesFixed === 0;

    return {
      mockDataRemoved,
      inrReferencesFixed,
      testContentCleaned,
      productionReady
    };

  } catch (error) {
    console.error('Production cleanup error:', error);
    return {
      mockDataRemoved: 0,
      inrReferencesFixed: 0,
      testContentCleaned: 0,
      productionReady: false
    };
  }
};

// Production readiness check
export const checkProductionReadiness = async (): Promise<{
  ready: boolean;
  issues: string[];
  score: number;
}> => {
  const issues: string[] = [];
  let score = 100;

  try {
    // Check for test data
    const { count: testProfiles } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .or('full_name.ilike.%test%,email.ilike.%test%,email.ilike.%example%');

    if (testProfiles && testProfiles > 0) {
      issues.push(`${testProfiles} test profiles found`);
      score -= 20;
    }

    // Check for INR references
    const { count: inrJobs } = await supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .or('description.ilike.%₹%,salary_range.ilike.%INR%');

    if (inrJobs && inrJobs > 0) {
      issues.push(`${inrJobs} jobs with INR references`);
      score -= 15;
    }

    // Check for mock content
    const { count: mockContent } = await supabase
      .from('ai_content_library')
      .select('id', { count: 'exact', head: true })
      .or('content.ilike.%mock%,content.ilike.%dummy%,content.ilike.%placeholder%');

    if (mockContent && mockContent > 0) {
      issues.push(`${mockContent} pieces of mock content`);
      score -= 10;
    }

    return {
      ready: issues.length === 0,
      issues,
      score: Math.max(0, score)
    };

  } catch (error) {
    return {
      ready: false,
      issues: ['Database connectivity error'],
      score: 0
    };
  }
};