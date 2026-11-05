const fs = require('fs');
const path = require('path');

// 1. Patch UnifiedAuthForm.tsx
const uafPath = path.resolve(__dirname, '../src/components/auth/UnifiedAuthForm.tsx');
let uaf = fs.readFileSync(uafPath, 'utf8');
const uafTarget = 'if (data.user) {';
const uafReplacement = `if (data.user) {
          // Guarantee instant auto-connection with talentxcelpro
          try {
            supabase.from('connections').insert({
              requester_id: '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062',
              recipient_id: data.user.id,
              status: 'accepted',
              message: "Welcome to TalentXcel! We're excited to have you in our community.",
              connected_at: new Date().toISOString(),
            }).then(() => {});
          } catch {}`;

if (!uaf.includes("requester_id: '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062'")) {
  uaf = uaf.replace(uafTarget, uafReplacement);
  fs.writeFileSync(uafPath, uaf, 'utf8');
  console.log('✅ Patched UnifiedAuthForm.tsx');
}

// 2. Patch AuthPage.tsx
const apPath = path.resolve(__dirname, '../src/pages/auth/AuthPage.tsx');
let ap = fs.readFileSync(apPath, 'utf8');
const apTarget = "console.log('Signup successful:', data);";
const apReplacement = `console.log('Signup successful:', data);
        if (data.user?.id) {
          try {
            supabase.from('connections').insert({
              requester_id: '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062',
              recipient_id: data.user.id,
              status: 'accepted',
              message: "Welcome to TalentXcel! We're excited to have you in our community.",
              connected_at: new Date().toISOString(),
            }).then(() => {});
          } catch {}
        }`;

if (!ap.includes("requester_id: '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062'")) {
  ap = ap.replace(apTarget, apReplacement);
  fs.writeFileSync(apPath, ap, 'utf8');
  console.log('✅ Patched AuthPage.tsx');
}

// 3. Patch useOptimizedRegistration.ts
const uorPath = path.resolve(__dirname, '../src/hooks/useOptimizedRegistration.ts');
let uor = fs.readFileSync(uorPath, 'utf8');
const uorTarget = 'if (authError) {';
const uorReplacement = `if (authData?.user) {
        try {
          supabase.from('connections').insert({
            requester_id: '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062',
            recipient_id: authData.user.id,
            status: 'accepted',
            message: "Welcome to TalentXcel! We're excited to have you in our community.",
            connected_at: new Date().toISOString(),
          }).then(() => {});
        } catch {}
      }

      if (authError) {`;

if (!uor.includes("requester_id: '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062'")) {
  uor = uor.replace(uorTarget, uorReplacement);
  fs.writeFileSync(uorPath, uor, 'utf8');
  console.log('✅ Patched useOptimizedRegistration.ts');
}
