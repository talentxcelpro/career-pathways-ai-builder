import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sessionToken, action, data, context } = await req.json();

    // Validate session first
    const { data: session, error: sessionError } = await supabase
      .from('chrome_extension_sessions')
      .select('user_id, extension_id')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'validate_input': {
        const validationResults = {
          isValid: true,
          errors: [],
          sanitizedData: {},
          riskLevel: 'low'
        };

        // XSS Protection
        const xssPatterns = [
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          /javascript:/gi,
          /vbscript:/gi,
          /onload\s*=/gi,
          /onerror\s*=/gi,
          /onclick\s*=/gi,
          /onmouseover\s*=/gi
        ];

        // SQL Injection Protection
        const sqlPatterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
          /(--|\/\*|\*\/)/gi,
          /(\bOR\b.*\b=\b.*\bOR\b)/gi,
          /(\bAND\b.*\b=\b.*\bAND\b)/gi
        ];

        // Validate each field
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string') {
            let sanitized = value;
            let fieldErrors = [];

            // Length validation
            if (value.length > 10000) {
              fieldErrors.push(`${key}: Value too long (max 10000 characters)`);
              validationResults.riskLevel = 'high';
            }

            // XSS validation
            for (const pattern of xssPatterns) {
              if (pattern.test(value)) {
                fieldErrors.push(`${key}: Potentially dangerous script content detected`);
                validationResults.riskLevel = 'high';
                sanitized = value.replace(pattern, '');
              }
            }

            // SQL injection validation
            for (const pattern of sqlPatterns) {
              if (pattern.test(value)) {
                fieldErrors.push(`${key}: Potentially dangerous SQL patterns detected`);
                validationResults.riskLevel = 'high';
                sanitized = value.replace(pattern, '');
              }
            }

            // URL validation for external links
            if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
              try {
                const url = new URL(value);
                if (!['http:', 'https:'].includes(url.protocol)) {
                  fieldErrors.push(`${key}: Invalid URL protocol`);
                  validationResults.riskLevel = 'medium';
                }
              } catch {
                fieldErrors.push(`${key}: Invalid URL format`);
                validationResults.riskLevel = 'medium';
              }
            }

            // Email validation
            if (key.toLowerCase().includes('email')) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(value)) {
                fieldErrors.push(`${key}: Invalid email format`);
                validationResults.riskLevel = 'medium';
              }
            }

            (validationResults.sanitizedData as any)[key] = sanitized;
            (validationResults.errors as any[]).push(...fieldErrors);
          } else {
            (validationResults.sanitizedData as any)[key] = value;
          }
        }

        validationResults.isValid = validationResults.errors.length === 0;

        // Log security validation
        await supabase
          .from('security_validation_logs')
          .insert({
            user_id: session.user_id,
            extension_id: session.extension_id,
            validation_type: 'input_validation',
            risk_level: validationResults.riskLevel,
            errors_found: validationResults.errors.length,
            context: context || 'unknown',
            created_at: new Date().toISOString()
          });

        return new Response(
          JSON.stringify({
            success: true,
            validation: validationResults
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check_permissions': {
        const { requiredPermissions, currentUrl } = data;
        
        // Get user's permission settings
        const { data: userSettings, error: settingsError } = await supabase
          .from('extension_user_settings')
          .select('security_settings')
          .eq('user_id', session.user_id)
          .single();

        if (settingsError) {
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to check permissions' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const securitySettings = userSettings?.security_settings || {};
        const permissionResults = {};

        for (const permission of requiredPermissions) {
          switch (permission) {
            case 'profile_read':
              (permissionResults as any)[permission] = securitySettings.allow_profile_read !== false;
              break;
            case 'profile_write':
              (permissionResults as any)[permission] = securitySettings.allow_profile_write === true;
              break;
            case 'job_apply':
              (permissionResults as any)[permission] = securitySettings.allow_job_apply !== false;
              break;
            case 'network_access':
              (permissionResults as any)[permission] = securitySettings.allow_network_access !== false;
              break;
            case 'data_export':
              (permissionResults as any)[permission] = securitySettings.allow_data_export === true;
              break;
            default:
              (permissionResults as any)[permission] = false;
          }
        }

        // Log permission check
        await supabase
          .from('security_validation_logs')
          .insert({
            user_id: session.user_id,
            extension_id: session.extension_id,
            validation_type: 'permission_check',
            context: currentUrl,
            metadata: { requiredPermissions, results: permissionResults },
            created_at: new Date().toISOString()
          });

        return new Response(
          JSON.stringify({
            success: true,
            permissions: permissionResults,
            allGranted: Object.values(permissionResults).every(Boolean)
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'detect_threats': {
        const { pageContent, formData, userActions } = data;
        const threats = [];

        // Detect phishing attempts
        const phishingIndicators = [
          'urgent action required',
          'verify your account immediately',
          'suspended account',
          'click here to reactivate',
          'limited time offer'
        ];

        if (pageContent) {
          for (const indicator of phishingIndicators) {
            if (pageContent.toLowerCase().includes(indicator)) {
              threats.push({
                type: 'phishing',
                severity: 'high',
                description: `Potential phishing indicator: "${indicator}"`
              });
            }
          }
        }

        // Detect suspicious form fields
        if (formData) {
          const suspiciousFields = ['ssn', 'social_security', 'bank_account', 'credit_card'];
          for (const field of suspiciousFields) {
            if (Object.keys(formData).some(key => key.toLowerCase().includes(field))) {
              threats.push({
                type: 'data_harvest',
                severity: 'high',
                description: `Suspicious form field detected: ${field}`
              });
            }
          }
        }

        // Detect unusual user actions
        if (userActions && userActions.length > 100) {
          threats.push({
            type: 'automation_detected',
            severity: 'medium',
            description: 'Unusual number of rapid actions detected'
          });
        }

        // Log threat detection
        await supabase
          .from('security_validation_logs')
          .insert({
            user_id: session.user_id,
            extension_id: session.extension_id,
            validation_type: 'threat_detection',
            risk_level: threats.length > 0 ? 'high' : 'low',
            metadata: { threats },
            context: context || 'threat_scan',
            created_at: new Date().toISOString()
          });

        return new Response(
          JSON.stringify({
            success: true,
            threats,
            riskLevel: threats.length > 0 ? 'high' : 'low',
            recommendedAction: threats.length > 0 ? 'block' : 'allow'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Security validation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});