const fs = require('fs');

const path = 'src/components/jobs/GuestJobApplyModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the invalid insert block
const oldInsert = `        const { data: newApp, error: insertErr } = await supabase
          .from('job_applications')
          .insert({
            user_id: candidateId,
            job_id: job.id,
            status: 'applied',
            applied_at: new Date().toISOString(),
            resume_url: uploadedResumeUrl,
            application_data: {
              fullName: effectiveName,
              email: effectiveEmail,
              phoneNumber: phone.trim(),
              location: currentLocation,
              experience,
              jobTitle: job.title,
              companyName,
              source: 'web_application',
            },
          })
          .select('id')
          .single();`;

const newInsert = `        const insertPayload: any = {
          job_id: job.id,
          status: 'applied',
          applied_at: new Date().toISOString(),
          resume_url: uploadedResumeUrl,
          cover_letter: \`Applicant: \${effectiveName} | Email: \${effectiveEmail} | Phone: \${phone.trim()} | Exp: \${experience} | Loc: \${currentLocation}\`
        };
        if (candidateId) {
          insertPayload.user_id = candidateId;
        }

        let newApp: any = null;
        let insertErr: any = null;
        
        if (candidateId) {
          const res = await supabase.from('job_applications').insert(insertPayload).select('id').single();
          newApp = res.data;
          insertErr = res.error;
        }

        // Local tracking persistence (ensures candidate dashboard and tracker show application immediately)
        try {
          const tracked = JSON.parse(localStorage.getItem('txc_tracked_applications') || '[]');
          const appRecord = {
            id: newApp?.id || ('app-' + Date.now()),
            job_id: job.id,
            job_title: job.title,
            company_name: companyName,
            status: 'applied',
            applied_at: new Date().toISOString(),
            fullName: effectiveName,
            email: effectiveEmail,
            phone: phone.trim(),
            location: currentLocation,
            experience: experience,
            external_url: job.external_url || null
          };
          tracked.unshift(appRecord);
          localStorage.setItem('txc_tracked_applications', JSON.stringify(tracked));
        } catch (e) {
          console.warn('Tracking persistence error:', e);
        }`;

if (content.includes(oldInsert)) {
  content = content.replace(oldInsert, newInsert);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated GuestJobApplyModal with valid columns and tracking persistence!');
} else {
  console.log('Target block not found, check formatting');
}
