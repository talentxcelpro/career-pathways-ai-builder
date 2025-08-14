import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";
import { corsHeaders } from "../_shared/cors.ts";

interface QRGeneratorRequest {
  userId: string;
  profileData?: any;
  customUrl?: string;
}

interface QRGeneratorResponse {
  success: boolean;
  qrCodeData?: string;
  publicUrl?: string;
  error?: string;
  timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: QRGeneratorRequest;
    try {
      body = await req.json();
    } catch (err) {
      console.error("Invalid JSON:", err);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid JSON in request body",
          timestamp: new Date().toISOString()
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("QR Generator called:", body);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate unique public URL slug
    const publicSlug = body.customUrl || generateUniqueSlug(body.userId);
    const publicUrl = `https://talentxcel.lovable.app/passport/${publicSlug}`;

    // Generate QR code data (URL that points to the public profile)
    const qrData = generateQRCodeData(publicUrl);

    // Save/update public profile
    const { data: publicProfile, error: profileError } = await supabase
      .from('public_profiles')
      .upsert({
        user_id: body.userId,
        public_url_slug: publicSlug,
        qr_code_data: qrData,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      console.error("Public profile save error:", profileError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to save public profile',
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Log analytics event
    await supabase
      .from('platform_analytics')
      .insert({
        user_id: body.userId,
        event_type: 'qr_code_generated',
        module_name: 'passport',
        event_data: {
          public_url: publicUrl,
          slug: publicSlug
        }
      });

    console.log("QR code generated successfully:", publicProfile);

    const response: QRGeneratorResponse = {
      success: true,
      qrCodeData: qrData,
      publicUrl: publicUrl,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("QR Generator error:", error);
    
    const errorResponse: QRGeneratorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});

function generateUniqueSlug(userId: string): string {
  // Generate a user-friendly slug
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 6);
  const userPart = userId.substr(0, 8);
  
  return `${userPart}-${timestamp}-${randomPart}`;
}

function generateQRCodeData(url: string): string {
  // In a real implementation, you'd use a QR code library
  // For now, we'll return a data URL that represents a QR code
  // This could be enhanced to use an actual QR code generation service
  
  const qrCodeSvg = `
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <text x="100" y="90" font-family="Arial" font-size="12" text-anchor="middle" fill="black">
        TalentXcel Career Passport
      </text>
      <text x="100" y="110" font-family="Arial" font-size="8" text-anchor="middle" fill="gray">
        Scan to view profile
      </text>
      <rect x="20" y="20" width="160" height="160" fill="none" stroke="black" stroke-width="2"/>
      <!-- QR pattern placeholder -->
      <rect x="30" y="30" width="20" height="20" fill="black"/>
      <rect x="60" y="30" width="20" height="20" fill="black"/>
      <rect x="90" y="30" width="20" height="20" fill="black"/>
      <rect x="120" y="30" width="20" height="20" fill="black"/>
      <rect x="150" y="30" width="20" height="20" fill="black"/>
      
      <rect x="30" y="60" width="20" height="20" fill="black"/>
      <rect x="150" y="60" width="20" height="20" fill="black"/>
      
      <rect x="30" y="90" width="20" height="20" fill="black"/>
      <rect x="60" y="90" width="20" height="20" fill="black"/>
      <rect x="90" y="90" width="20" height="20" fill="black"/>
      <rect x="120" y="90" width="20" height="20" fill="black"/>
      <rect x="150" y="90" width="20" height="20" fill="black"/>
      
      <rect x="30" y="120" width="20" height="20" fill="black"/>
      <rect x="150" y="120" width="20" height="20" fill="black"/>
      
      <rect x="30" y="150" width="20" height="20" fill="black"/>
      <rect x="60" y="150" width="20" height="20" fill="black"/>
      <rect x="90" y="150" width="20" height="20" fill="black"/>
      <rect x="120" y="150" width="20" height="20" fill="black"/>
      <rect x="150" y="150" width="20" height="20" fill="black"/>
    </svg>
  `;

  // Convert SVG to base64 data URL
  const base64Svg = btoa(qrCodeSvg);
  return `data:image/svg+xml;base64,${base64Svg}`;
}