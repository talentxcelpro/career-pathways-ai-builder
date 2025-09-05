import React from 'npm:react@18.3.1'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ProfileCompletionEmail } from './_templates/profile-completion.tsx'
import { WelcomeEmail } from './_templates/welcome-email.tsx'
import { JobRecommendationEmail } from './_templates/job-recommendation.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  from?: string
  subject: string
  template: string
  data?: Record<string, any>
  messageId?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🎨 React Email Function Starting...')
    console.log('📊 Request method:', req.method)

    const requestBody = await req.text()
    console.log('📄 Raw request body:', requestBody)

    if (!requestBody) {
      throw new Error('Request body is empty')
    }

    const emailData: EmailRequest = JSON.parse(requestBody)
    const { to, from = 'TalentXcel <admin@talentxcel.in>', subject, template, data = {}, messageId } = emailData

    console.log(`📧 Sending React email to: ${to}`)
    console.log(`🎯 Template: ${template}`)

    // Validate required fields
    if (!to || !subject || !template) {
      throw new Error('Missing required email fields: to, subject, template')
    }

    let html: string

    // Render template based on type
    switch (template) {
      case 'profile_completion_reminder':
        console.log('🏗️ Rendering profile completion template...')
        html = await renderAsync(
          React.createElement(ProfileCompletionEmail, {
            candidate_name: data.candidate_name || 'User',
          })
        )
        break
      case 'welcome':
      case 'welcome_email':
        console.log('🎉 Rendering welcome email template...')
        html = await renderAsync(
          React.createElement(WelcomeEmail, {
            candidate_name: data.candidate_name || data.name || 'User',
            first_name: data.first_name
          })
        )
        break
      case 'job_recommendation':
      case 'job_match':
        console.log('💼 Rendering job recommendation template...')
        html = await renderAsync(
          React.createElement(JobRecommendationEmail, {
            candidate_name: data.candidate_name || data.name || 'User',
            job_title: data.job_title,
            company_name: data.company_name,
            location: data.location,
            experience_level: data.experience_level,
            salary_range: data.salary_range,
            job_id: data.job_id
          })
        )
        break
      default:
        throw new Error(`Unknown template: ${template}. Available templates: profile_completion_reminder, welcome, welcome_email, job_recommendation, job_match`)
    }

    console.log('✉️ Sending email via Resend...')

    // Send the email using Resend
    const { data: emailResult, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
      headers: {
        'X-Template': template,
        'X-Provider': 'resend-react',
        ...(messageId && { 'X-Message-ID': messageId }),
      },
    })

    if (error) {
      console.error('❌ Resend error:', error)
      throw error
    }

    const responseMessageId = messageId || emailResult?.id || crypto.randomUUID()
    console.log('✅ Email sent successfully:', responseMessageId)

    return new Response(JSON.stringify({
      success: true,
      messageId: responseMessageId,
      provider: 'resend-react',
      template,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })

  } catch (error: any) {
    console.error('❌ React email service error:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred',
      stack: error.stack,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})