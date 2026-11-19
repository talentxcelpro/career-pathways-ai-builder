const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/pages/network/People.tsx');
let code = fs.readFileSync(filePath, 'utf8');

if (!code.includes('trackFunnelEvent')) {
  code = code.replace(
    "import { supabase } from '@/integrations/supabase/client';",
    "import { supabase } from '@/integrations/supabase/client';\nimport { trackFunnelEvent } from '@/services/telemetry/funnelTracker';"
  );
}

const oldConnect = `      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to send connection requests.");
        navigate('/auth');
        return;
      }`;

const newConnect = `      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        trackFunnelEvent('oauth_gate_shown', { trigger: 'network_connect', target_id: userId });
        toast.info("Sign in with Google in 1-click to connect with verified members.");
        navigate('/auth?returnTo=/network&flow=candidate');
        return;
      }

      trackFunnelEvent('network_connection_requested', { target_user_id: userId });`;

code = code.replace(oldConnect, newConnect);

fs.writeFileSync(filePath, code, 'utf8');
console.log('✓ Successfully enhanced handleConnect in People.tsx with telemetry and frictionless OAuth redirect');
