import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, employerId, contactData, pipelineData } = await req.json();

    switch (action) {
      case 'create_contact': {
        const { data: contact, error } = await supabase
          .from('employer_crm_contacts')
          .insert({
            employer_id: employerId,
            ...contactData,
            contact_stage: 'lead'
          })
          .select()
          .single();

        if (error) throw error;

        // Create pipeline entry
        await supabase
          .from('employer_crm_pipeline')
          .insert({
            employer_id: employerId,
            contact_id: contact.id,
            stage: 'prospecting',
            probability: 25,
            notes: `New contact created: ${contact.name}`
          });

        return new Response(JSON.stringify({ success: true, contact }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_pipeline': {
        const { contactId, stage, probability, notes } = pipelineData;
        
        const { data: pipeline, error } = await supabase
          .from('employer_crm_pipeline')
          .update({
            stage,
            probability,
            notes,
            last_activity: new Date().toISOString()
          })
          .eq('employer_id', employerId)
          .eq('contact_id', contactId)
          .select()
          .single();

        if (error) throw error;

        // Update contact stage based on pipeline
        await supabase
          .from('employer_crm_contacts')
          .update({
            contact_stage: stage,
            last_interaction: new Date().toISOString()
          })
          .eq('id', contactId);

        return new Response(JSON.stringify({ success: true, pipeline }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_analytics': {
        const { data: contacts, error: contactsError } = await supabase
          .from('employer_crm_contacts')
          .select('contact_stage')
          .eq('employer_id', employerId);

        const { data: pipeline, error: pipelineError } = await supabase
          .from('employer_crm_pipeline')
          .select('stage, probability')
          .eq('employer_id', employerId);

        if (contactsError || pipelineError) {
          throw contactsError || pipelineError;
        }

        const analytics = {
          totalContacts: contacts.length,
          stageBreakdown: contacts.reduce((acc, contact) => {
            acc[contact.contact_stage] = (acc[contact.contact_stage] || 0) + 1;
            return acc;
          }, {}),
          averageProbability: pipeline.length > 0 
            ? pipeline.reduce((sum, p) => sum + (p.probability || 0), 0) / pipeline.length
            : 0,
          pipelineValue: pipeline.reduce((sum, p) => sum + (p.probability || 0), 0)
        };

        return new Response(JSON.stringify({ success: true, analytics }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('CRM manager error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});