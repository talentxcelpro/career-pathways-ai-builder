import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LinkedInRecord {
  firstName: string
  lastName: string
  email: string
  linkedInUrl: string
  jobTitle: string
  company: string
  location: string
  skills: string
  experienceYears: string
  education: string
  phone: string
}

interface Database {
  public: {
    Tables: {
      profiles: {
        Insert: {
          id?: string
          full_name?: string
          email?: string
          title?: string
          location?: string
          linkedin_url?: string
          linkedin_headline?: string
          linkedin_skills?: string[]
          phone?: string
        }
      }
      linkedin_import_jobs: {
        Insert: {
          filename: string
          uploaded_by: string
          total_records: number
          status?: string
        }
        Update: {
          status?: string
          processed_records?: number
          successful_imports?: number
          failed_imports?: number
          tokens_awarded?: number
          error_message?: string
          completed_at?: string
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Check if user is admin
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!userRole || !['super_admin', 'admin'].includes(userRole.role)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const tokenRewardPerUser = parseInt(formData.get('tokenRewardPerUser') as string) || 10

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'No file provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`Processing LinkedIn import: ${file.name}`)

    // Read and parse CSV content
    const csvContent = await file.text()
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'CSV file appears to be empty or invalid' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const records: LinkedInRecord[] = []

    // Parse CSV records
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      if (values.length >= headers.length) {
        const record: any = {}
        headers.forEach((header, index) => {
          record[header] = values[index] || ''
        })
        
        // Map to expected fields
        const linkedinRecord: LinkedInRecord = {
          firstName: record['First Name'] || record['firstName'] || '',
          lastName: record['Last Name'] || record['lastName'] || '',
          email: record['Email'] || record['email'] || '',
          linkedInUrl: record['LinkedIn URL'] || record['linkedInUrl'] || '',
          jobTitle: record['Job Title'] || record['jobTitle'] || '',
          company: record['Company'] || record['company'] || '',
          location: record['Location'] || record['location'] || '',
          skills: record['Skills'] || record['skills'] || '',
          experienceYears: record['Experience Years'] || record['experienceYears'] || '',
          education: record['Education'] || record['education'] || '',
          phone: record['Phone'] || record['phone'] || ''
        }

        if (linkedinRecord.email && linkedinRecord.firstName && linkedinRecord.lastName) {
          records.push(linkedinRecord)
        }
      }
    }

    console.log(`Parsed ${records.length} valid records`)

    // Create import job record
    const { data: importJob, error: jobError } = await supabaseClient
      .from('linkedin_import_jobs')
      .insert({
        filename: file.name,
        uploaded_by: user.id,
        total_records: records.length,
        status: 'processing'
      })
      .select()
      .single()

    if (jobError) {
      console.error('Error creating import job:', jobError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create import job' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Process records in background
    const processImport = async () => {
      let successCount = 0
      let failCount = 0
      let tokensAwarded = 0

      for (const record of records) {
        try {
          // Check if profile already exists
          const { data: existingProfile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('email', record.email)
            .single()

          if (!existingProfile) {
            // Create auth user first (placeholder - in real implementation, you'd handle this differently)
            const fullName = `${record.firstName} ${record.lastName}`.trim()
            const skills = record.skills ? record.skills.split(';').map(s => s.trim()).filter(s => s) : []
            
            // Create profile
            const { error: profileError } = await supabaseClient
              .from('profiles')
              .insert({
                full_name: fullName,
                email: record.email,
                title: record.jobTitle,
                location: record.location,
                linkedin_url: record.linkedInUrl,
                linkedin_headline: record.jobTitle,
                linkedin_skills: skills,
                phone: record.phone
              })

            if (!profileError) {
              successCount++
              tokensAwarded += tokenRewardPerUser
              
              // Award tokens to the admin who imported
              await supabaseClient.functions.invoke('award-tokens', {
                body: {
                  userId: user.id,
                  amount: tokenRewardPerUser,
                  description: `LinkedIn import reward for ${fullName}`,
                  source: 'linkedin_import'
                }
              })
            } else {
              console.error('Error creating profile:', profileError)
              failCount++
            }
          } else {
            failCount++ // Already exists
          }

          // Update progress
          await supabaseClient
            .from('linkedin_import_jobs')
            .update({
              processed_records: successCount + failCount,
              successful_imports: successCount,
              failed_imports: failCount,
              tokens_awarded: tokensAwarded
            })
            .eq('id', importJob.id)

        } catch (error) {
          console.error('Error processing record:', error)
          failCount++
        }
      }

      // Mark job as completed
      await supabaseClient
        .from('linkedin_import_jobs')
        .update({
          status: 'completed',
          processed_records: successCount + failCount,
          successful_imports: successCount,
          failed_imports: failCount,
          tokens_awarded: tokensAwarded,
          completed_at: new Date().toISOString()
        })
        .eq('id', importJob.id)

      console.log(`Import completed: ${successCount} successful, ${failCount} failed, ${tokensAwarded} tokens awarded`)
    }

    // Start background processing
    processImport().catch(error => {
      console.error('Background import failed:', error)
      supabaseClient
        .from('linkedin_import_jobs')
        .update({
          status: 'failed',
          error_message: error.message,
          completed_at: new Date().toISOString()
        })
        .eq('id', importJob.id)
    })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Import started successfully',
        jobId: importJob.id,
        totalRecords: records.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in bulk-linkedin-import:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})