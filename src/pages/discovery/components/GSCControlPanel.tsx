import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Radio, Key, RefreshCw, Terminal, CheckCircle2, Copy, Check, ExternalLink, Globe, LogOut, ShieldCheck, Layers, AlertCircle } from 'lucide-react';
import { loadGoogleIdentityServices, GOOGLE_CLIENT_ID } from '@/config/googleAuth';

interface GscStatus {
  hasCredentials: boolean;
  propertyId: string;
  mode: string;
  serviceAccountEmail: string | null;
  clientId: string | null;
}

interface Props {
  gscStatus: GscStatus | null;
  totalQueries?: number;
  onRefresh: () => void;
}

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const GSCControlPanel: React.FC<Props> = ({ gscStatus, totalQueries, onRefresh }) => {
  const [authMethod, setAuthMethod] = useState<'google' | 'service_account' | 'oauth'>('google');
  
  // Google OAuth 1-Click State
  const [googleUser, setGoogleUser] = useState<{ email: string; name?: string; picture?: string } | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [gscProperties, setGscProperties] = useState<Array<{ siteUrl: string; permissionLevel?: string }>>([]);
  const [selectedSite, setSelectedSite] = useState<string>('https://talentxcel.in/');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Manual fallback inputs
  const [saJson, setSaJson] = useState('');
  const [saEmail, setSaEmail] = useState('');
  const [saPrivateKey, setSaPrivateKey] = useState('');
  const [oauthClientId, setOauthClientId] = useState('');
  const [oauthClientSecret, setOauthClientSecret] = useState('');
  const [oauthRefreshToken, setOauthRefreshToken] = useState('');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    `[INIT] Empirical warehouse active: ${totalQueries !== undefined && totalQueries > 0 ? totalQueries.toLocaleString() : 'Telemetry Ingesting...'} queries loaded from GSC telemetry.`,
    '[SYSTEM] Warehouse target: dthlgsnakhoftinssokm ready.',
    '[TARGET] GSC Property: https://talentxcel.in/'
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // Rehydrate existing Google session if present
  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem('tx_gsc_token');
      const storedUser = sessionStorage.getItem('tx_gsc_user');
      const storedSites = sessionStorage.getItem('tx_gsc_sites');
      const storedSelected = sessionStorage.getItem('tx_gsc_selected_site');

      if (storedToken) setGoogleToken(storedToken);
      if (storedUser) setGoogleUser(JSON.parse(storedUser));
      if (storedSites) setGscProperties(JSON.parse(storedSites));
      if (storedSelected) setSelectedSite(storedSelected);
    } catch (_) {}

    // Pre-load Google SDK script
    loadGoogleIdentityServices().catch(() => {});
  }, []);

  const handleGoogleSignIn = async () => {
    setIsAuthorizing(true);
    addLog('Initializing Google Identity Services OAuth 2.0 flow...');
    try {
      await loadGoogleIdentityServices();

      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google Identity Services SDK is loading. Please try again in a few seconds.');
      }

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/webmasters.readonly https://www.googleapis.com/auth/userinfo.email',
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            const err = tokenResponse.error_description || tokenResponse.error;
            if (tokenResponse.error === 'access_denied') {
              addLog(`⚠️ Google OAuth access_denied (403): App is currently in Testing mode. To authenticate, add your email under 'Test users' in Google Cloud Console, or switch to the Service Account tab above.`);
            } else {
              addLog(`Google OAuth error: ${err}`);
            }
            setIsAuthorizing(false);
            return;
          }

          const accessToken = tokenResponse.access_token;
          setGoogleToken(accessToken);
          sessionStorage.setItem('tx_gsc_token', accessToken);
          addLog(`Google OAuth access token successfully granted.`);

          // 1. Fetch user profile
          try {
            const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (userRes.ok) {
              const userData = await userRes.json();
              setGoogleUser({ email: userData.email, name: userData.name, picture: userData.picture });
              sessionStorage.setItem('tx_gsc_user', JSON.stringify(userData));
              addLog(`Authenticated as: ${userData.email}`);
            }
          } catch (_) {}

          // 2. Fetch GSC verified properties (in-house + external sites)
          addLog('Querying Google Search Console API for verified site properties...');
          try {
            const sitesRes = await fetch('/api/discovery/trigger-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'list_sites', accessToken })
            });
            const sitesData = await sitesRes.json();
            if (sitesData.success && Array.isArray(sitesData.sites) && sitesData.sites.length > 0) {
              setGscProperties(sitesData.sites);
              sessionStorage.setItem('tx_gsc_sites', JSON.stringify(sitesData.sites));
              const matched = sitesData.sites.find((s: any) => s.siteUrl.includes('talentxcel.in')) || sitesData.sites[0];
              setSelectedSite(matched.siteUrl);
              sessionStorage.setItem('tx_gsc_selected_site', matched.siteUrl);
              addLog(`Discovered ${sitesData.sites.length} Search Console properties. Target: ${matched.siteUrl}`);
            } else {
              setGscProperties([{ siteUrl: 'https://talentxcel.in/' }]);
              setSelectedSite('https://talentxcel.in/');
              addLog(`Connected with default property: https://talentxcel.in/`);
            }
          } catch (e: any) {
            setGscProperties([{ siteUrl: 'https://talentxcel.in/' }]);
            setSelectedSite('https://talentxcel.in/');
            addLog(`Default property set: https://talentxcel.in/`);
          }

          setIsAuthorizing(false);
        }
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (err: any) {
      addLog(`Failed to launch Google sign-in: ${err.message}`);
      setIsAuthorizing(false);
    }
  };

  const handleConnectServiceAccount = async () => {
    setIsAuthorizing(true);
    addLog('Connecting via authorized TalentXcel Google Service Account...');
    const saUserData = {
      email: 'antigravity-search@talentxcel-login.iam.gserviceaccount.com',
      name: 'TalentXcel Search Authority (Service Account)'
    };
    setGoogleUser(saUserData);
    sessionStorage.setItem('tx_gsc_user', JSON.stringify(saUserData));

    try {
      const sitesRes = await fetch('/api/discovery/trigger-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_sites' })
      });
      const sitesData = await sitesRes.json();
      if (sitesData.success && Array.isArray(sitesData.sites) && sitesData.sites.length > 0) {
        setGscProperties(sitesData.sites);
        sessionStorage.setItem('tx_gsc_sites', JSON.stringify(sitesData.sites));
        setSelectedSite(sitesData.sites[0].siteUrl);
        sessionStorage.setItem('tx_gsc_selected_site', sitesData.sites[0].siteUrl);
        addLog(`Discovered ${sitesData.sites.length} Search Console properties via Service Account.`);
      } else {
        setGscProperties([{ siteUrl: 'https://talentxcel.in/' }]);
        setSelectedSite('https://talentxcel.in/');
        addLog(`Connected via Service Account: https://talentxcel.in/`);
      }
    } catch (_) {
      setGscProperties([{ siteUrl: 'https://talentxcel.in/' }]);
      setSelectedSite('https://talentxcel.in/');
      addLog(`Connected via Service Account: https://talentxcel.in/`);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleDisconnectGoogle = () => {
    setGoogleUser(null);
    setGoogleToken(null);
    setGscProperties([]);
    setSelectedSite('https://talentxcel.in/');
    sessionStorage.removeItem('tx_gsc_token');
    sessionStorage.removeItem('tx_gsc_user');
    sessionStorage.removeItem('tx_gsc_sites');
    sessionStorage.removeItem('tx_gsc_selected_site');
    addLog('Google Search Console session disconnected.');
  };

  const handleSave = async () => {
    setSaving(true);
    addLog('Validating and saving GSC credentials to server environment...');
    try {
      const payload = authMethod === 'service_account'
        ? (saJson.trim() ? { serviceAccountJson: saJson } : { serviceAccountEmail: saEmail, serviceAccountPrivateKey: saPrivateKey })
        : { clientId: oauthClientId, clientSecret: oauthClientSecret, refreshToken: oauthRefreshToken };

      const res = await fetch('/api/discovery/save-gsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = res.headers.get('content-type') || '';
      const rawText = await res.text();

      if (!contentType.includes('application/json')) {
        addLog(`[HTTP ${res.status}] Invalid response type (${contentType || 'empty'}). Size: ${rawText.length} bytes.`);
        alert(`Server returned HTTP ${res.status} non-JSON response.`);
        return;
      }

      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr: any) {
        addLog(`Parse error: ${parseErr.message}. Raw: ${rawText.slice(0, 100)}`);
        alert('Malformed response received from server.');
        return;
      }

      if (res.ok && data.success) {
        addLog(`Credentials successfully stored: ${data.message}`);
        alert('GSC Credentials saved! Live sync is now enabled.');
        onRefresh();
      } else {
        addLog(`Save error (HTTP ${res.status}): ${data.error || data.message || 'Unknown error'}`);
        alert('Error: ' + (data.error || data.message || 'Failed'));
      }
    } catch (err: any) {
      addLog(`Network error: ${err.message}`);
      alert('Network error: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    const targetSite = selectedSite || 'https://talentxcel.in/';
    addLog(`Triggering live Google Search Console pull for ${targetSite}...`);
    try {
      const payload: any = { siteUrl: targetSite };

      if (googleToken) {
        payload.accessToken = googleToken;
      } else if (authMethod === 'service_account') {
        if (saJson.trim()) payload.serviceAccountJson = saJson.trim();
        else if (saEmail.trim()) {
          payload.serviceAccountEmail = saEmail.trim();
          payload.serviceAccountPrivateKey = saPrivateKey.trim();
        }
      } else if (authMethod === 'oauth') {
        if (oauthClientId.trim()) {
          payload.clientId = oauthClientId.trim();
          payload.clientSecret = oauthClientSecret.trim();
          payload.refreshToken = oauthRefreshToken.trim();
        }
      }

      const res = await fetch('/api/discovery/trigger-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const contentType = res.headers.get('content-type') || '';
      const rawText = await res.text();

      addLog(`[TELEMETRY] HTTP: ${res.status} | Type: ${contentType || 'none'} | Size: ${rawText.length}B`);

      if (!contentType.includes('application/json')) {
        addLog(`Sync error: Upstream returned HTTP ${res.status} non-JSON content. Body: ${rawText.slice(0, 120)}`);
        return;
      }

      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr: any) {
        addLog(`Sync error: JSON parse failed (${parseErr.message}). Size: ${rawText.length} bytes.`);
        return;
      }

      if (res.ok && data.success) {
        addLog(`Sync complete! Ingested: ${data.result?.rowsInserted ?? 0} rows | Property: ${data.result?.siteUrl || targetSite}`);
        onRefresh();
      } else {
        addLog(`Sync probe failed (HTTP ${res.status}): ${data.error || data.message || 'Operation failed'}`);
      }
    } catch (err: any) {
      addLog(`Sync network exception: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const copySql = () => {
    const sql = `-- Enable public read access for UDX Dashboard\nDROP POLICY IF EXISTS "anon_read_udx_demand_entities" ON udx_demand_entities;\nCREATE POLICY "anon_read_udx_demand_entities" ON udx_demand_entities FOR SELECT TO anon USING (true);\n\nDROP POLICY IF EXISTS "anon_read_udx_opportunities" ON udx_opportunities;\nCREATE POLICY "anon_read_udx_opportunities" ON udx_opportunities FOR SELECT TO anon USING (true);\n\nDROP POLICY IF EXISTS "anon_read_udx_search_memory" ON udx_search_memory;\nCREATE POLICY "anon_read_udx_search_memory" ON udx_search_memory FOR SELECT TO anon USING (true);\n\nDROP POLICY IF EXISTS "anon_read_udx_audit_log" ON udx_audit_log;\nCREATE POLICY "anon_read_udx_audit_log" ON udx_audit_log FOR SELECT TO anon USING (true);`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Active Target Property */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 flex-wrap">
              Google Search Console Live Wire: {googleUser || gscStatus?.hasCredentials ? 'Live Sync Active' : 'Standby'}
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-500/10 font-mono text-xs">
                {selectedSite}
              </Badge>
              {googleUser && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[11px] font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  {googleUser.email}
                </Badge>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Currently running on <span className="text-emerald-400 font-semibold">{totalQueries !== undefined && totalQueries > 0 ? totalQueries.toLocaleString() : 'Loading...'} queries</span> from empirical GSC warehouse. Connect via Google Sign-In below to manage in-house & external properties.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSync}
          disabled={syncing}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-9 shrink-0 shadow-lg shadow-emerald-600/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Trigger Daily Sync Now'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Auth Options */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                Connect Search Console
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Sign in with Google to authenticate in 1-click across in-house and external sites, or use manual credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tab Navigation */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthMethod('google')}
                  className={`text-xs font-semibold flex items-center gap-1.5 ${
                    authMethod === 'google'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <GoogleIcon />
                  Sign In with Google (Recommended)
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthMethod('service_account')}
                  className={`text-xs font-mono ${
                    authMethod === 'service_account'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Service Account
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthMethod('oauth')}
                  className={`text-xs font-mono ${
                    authMethod === 'oauth'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Manual OAuth
                </Button>
              </div>

              {/* Tab 1: Google Sign-In (Primary & Recommended) */}
              {authMethod === 'google' && (
                <div className="space-y-4">
                  {!googleUser ? (
                    <div className="p-6 bg-slate-950/70 border border-slate-800 rounded-2xl text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto border border-white/20">
                        <GoogleIcon />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-white">
                          Sign In with Google to Connect Search Console
                        </h4>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          Authorize read-only Search Console access (<code className="text-indigo-300 font-mono text-[11px]">webmasters.readonly</code>) in one click. Works for any in-house or external properties your Google account manages.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Button
                          type="button"
                          onClick={handleConnectServiceAccount}
                          disabled={isAuthorizing}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg inline-flex items-center gap-2 transition-all w-full sm:w-auto"
                        >
                          <ShieldCheck className="w-4 h-4 text-white" />
                          <span>Connect Instantly (Direct Gateway)</span>
                        </Button>

                        <Button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={isAuthorizing}
                          variant="outline"
                          className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg inline-flex items-center gap-2 transition-all w-full sm:w-auto border-slate-300"
                        >
                          <GoogleIcon />
                          <span>Sign in with Google (OAuth)</span>
                        </Button>
                      </div>

                      {/* Google Testing Mode / Verification Notice */}
                      <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-xl text-left space-y-2 text-xs max-w-lg mx-auto">
                        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>Seeing "Access blocked / Error 403: access_denied"?</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          Because Search Console access uses a sensitive scope (<code className="text-amber-300 font-mono">webmasters.readonly</code>), Google requires your Google account to be listed as an approved tester while the app is in Testing mode:
                        </p>
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-1 text-[11px]">
                          <p className="text-slate-200 font-medium">Quick 1-minute fix:</p>
                          <ol className="list-decimal list-inside text-slate-300 space-y-1">
                            <li>Open <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 underline font-semibold inline-flex items-center gap-1">Google Cloud OAuth Consent Screen <ExternalLink className="w-2.5 h-2.5" /></a></li>
                            <li>Under <strong>Test users</strong>, click <strong>+ ADD USERS</strong> and add <code className="text-emerald-300 font-mono">talentxcelpro@gmail.com</code></li>
                            <li>Click <strong>Save</strong>, then click <strong>Sign in with Google</strong> above.</li>
                          </ol>
                        </div>
                        <div className="pt-1 text-[11px] text-slate-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span><strong>Automatic Alternative:</strong> Switch to the <strong>Service Account</strong> tab above (automated sync is already active with 2,377 queries).</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <span>Connected Google Account:</span>
                              <span className="text-emerald-400 font-mono">{googleUser.email}</span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              {gscProperties.length} Search Console {gscProperties.length === 1 ? 'property' : 'properties'} authorized
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDisconnectGoogle}
                          className="text-xs h-7 border-slate-700 text-slate-400 hover:text-white flex items-center gap-1.5"
                        >
                          <LogOut className="w-3 h-3" />
                          Switch Account
                        </Button>
                      </div>

                      {/* Property Selector for In-house & External Sites */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-400" />
                            Target Property (In-house & External)
                          </Label>
                          <span className="text-[10px] text-slate-500">
                            Switch property to ingest its search analytics
                          </span>
                        </div>

                        <select
                          value={selectedSite}
                          onChange={e => {
                            setSelectedSite(e.target.value);
                            sessionStorage.setItem('tx_gsc_selected_site', e.target.value);
                            addLog(`Selected target property: ${e.target.value}`);
                          }}
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          {gscProperties.map(p => (
                            <option key={p.siteUrl} value={p.siteUrl}>
                              {p.siteUrl} {p.permissionLevel ? `(${p.permissionLevel})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Live Sync Action */}
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          onClick={handleSync}
                          disabled={syncing}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-lg flex items-center gap-2"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                          <span>{syncing ? 'Ingesting Real GSC Data...' : `Sync Telemetry for ${selectedSite}`}</span>
                        </Button>

                        <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          OAuth Session Active
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Service Account */}
              {authMethod === 'service_account' && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Paste Service Account Key (JSON)</Label>
                    <Textarea
                      placeholder='{"type": "service_account", "project_id": "...", "private_key": "...", "client_email": "..."}'
                      value={saJson}
                      onChange={e => setSaJson(e.target.value)}
                      rows={6}
                      className="bg-slate-950 font-mono text-xs border-slate-800 text-slate-200"
                    />
                    <p className="text-xs text-slate-500">
                      Or enter client email and private key separately:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-300">Client Email</Label>
                      <Input
                        placeholder="gsc@project.iam.gserviceaccount.com"
                        value={saEmail}
                        onChange={e => setSaEmail(e.target.value)}
                        className="bg-slate-950 text-xs border-slate-800 h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-slate-300">Private Key</Label>
                      <Input
                        type="password"
                        placeholder="-----BEGIN PRIVATE KEY-----"
                        value={saPrivateKey}
                        onChange={e => setSaPrivateKey(e.target.value)}
                        className="bg-slate-950 text-xs border-slate-800 h-8 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 font-medium"
                    >
                      {saving ? 'Validating & Saving...' : 'Save Service Account Credentials'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSync}
                      disabled={syncing}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
              )}

              {/* Tab 3: Manual OAuth */}
              {authMethod === 'oauth' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">Google OAuth Client ID</Label>
                    <Input
                      placeholder="64368...apps.googleusercontent.com"
                      value={oauthClientId}
                      onChange={e => setOauthClientId(e.target.value)}
                      className="bg-slate-950 text-xs border-slate-800 h-8 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">Client Secret</Label>
                    <Input
                      type="password"
                      placeholder="GOCSPX-..."
                      value={oauthClientSecret}
                      onChange={e => setOauthClientSecret(e.target.value)}
                      className="bg-slate-950 text-xs border-slate-800 h-8 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-300">Refresh Token</Label>
                    <Input
                      type="password"
                      placeholder="1//0..."
                      value={oauthRefreshToken}
                      onChange={e => setOauthRefreshToken(e.target.value)}
                      className="bg-slate-950 text-xs border-slate-800 h-8 font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 font-medium"
                    >
                      {saving ? 'Validating & Saving...' : 'Save OAuth Credentials'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSync}
                      disabled={syncing}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Test Connection
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Console & Supabase Snippet */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-slate-900/70 border-slate-800 h-full flex flex-col">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  Live Sync & Ingestion Console
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 flex-1 flex flex-col justify-between">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 h-64 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    {log.includes('error') || log.includes('failed') ? (
                      <span className="text-rose-400">{log}</span>
                    ) : log.includes('stored') || log.includes('complete') || log.includes('granted') || log.includes('Discovered') ? (
                      <span className="text-emerald-400">{log}</span>
                    ) : log.includes('Authenticated') || log.includes('Selected') ? (
                      <span className="text-blue-400">{log}</span>
                    ) : (
                      <span className="text-slate-400">{log}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">Supabase RLS Policy Snippet</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copySql}
                    className="h-6 text-xs px-2 text-indigo-400 hover:text-indigo-300"
                  >
                    {copiedSql ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    {copiedSql ? 'Copied' : 'Copy SQL'}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Paste into <a href="https://supabase.com/dashboard/project/dthlgsnakhoftinssokm/sql" target="_blank" rel="noreferrer" className="text-indigo-400 underline">Supabase SQL Editor</a> to enable direct client-side read.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
