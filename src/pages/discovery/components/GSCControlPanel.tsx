import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Radio, Key, RefreshCw, Terminal, CheckCircle2, Copy, Check, ExternalLink } from 'lucide-react';

interface GscStatus {
  hasCredentials: boolean;
  propertyId: string;
  mode: string;
  serviceAccountEmail: string | null;
  clientId: string | null;
}

interface Props {
  gscStatus: GscStatus | null;
  onRefresh: () => void;
}

export const GSCControlPanel: React.FC<Props> = ({ gscStatus, onRefresh }) => {
  const [authMethod, setAuthMethod] = useState<'service_account' | 'oauth'>('service_account');
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
    '[INIT] Empirical seed active: 918 queries from gsc-full-dump.json.',
    '[SYSTEM] Warehouse target: dthlgsnakhoftinssokm ready.',
    '[TARGET] GSC Property: sc-domain:talentxcel.in'
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev.slice(0, 49)]);
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
      const data = await res.json();
      if (data.success) {
        addLog(`Credentials successfully stored: ${data.message}`);
        alert('GSC Credentials saved! Live sync is now enabled.');
        onRefresh();
      } else {
        addLog(`Save error: ${data.error}`);
        alert('Error: ' + data.error);
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
    addLog('Triggering live Google Search Console pull for sc-domain:talentxcel.in...');
    try {
      const res = await fetch('/api/discovery/trigger-sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addLog(`Sync complete! Ingested: ${data.result.rowsInserted} rows, Updated: ${data.result.rowsUpdated} rows.`);
        onRefresh();
      } else {
        addLog(`Sync probe: ${data.message || data.error}`);
      }
    } catch (err: any) {
      addLog(`Sync error: ${err.message}`);
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
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 flex-wrap">
              Google Search Console Live Wire: {gscStatus?.hasCredentials ? 'Live Sync Active' : 'Standby (Empirical Data)'}
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 bg-emerald-500/10 font-mono text-xs">
                {gscStatus?.propertyId || 'sc-domain:talentxcel.in'}
              </Badge>
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Currently running on <span className="text-emerald-400 font-semibold">918 queries</span> from empirical dump. Provide Google Cloud OAuth credentials below to activate daily automated background ingestion.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSync}
          disabled={syncing}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-9 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Trigger Daily Sync Now'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-slate-900/70 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                Provide GSC OAuth Access
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Paste credentials here. They are saved directly into your local server environment and encrypted in memory.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthMethod('service_account')}
                  className={`text-xs font-mono ${authMethod === 'service_account' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  Service Account JSON (Recommended)
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAuthMethod('oauth')}
                  className={`text-xs font-mono ${authMethod === 'oauth' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                >
                  OAuth 2.0 Web Client
                </Button>
              </div>

              {authMethod === 'service_account' ? (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Paste Service Account Key (JSON)</Label>
                    <Textarea
                      placeholder='{"type": "service_account", "project_id": "...", "private_key": "...", "client_email": "..."}'
                      value={saJson}
                      onChange={e => setSaJson(e.target.value)}
                      rows={7}
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

                  <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1.5 text-slate-400">
                    <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Setup in Google Cloud & Search Console:
                    </div>
                    <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-400">
                      <li>Enable <strong>Search Console API</strong> in Google Cloud Console.</li>
                      <li>In <strong>IAM & Admin &gt; Service Accounts</strong>, create a service account and export JSON key.</li>
                      <li>In <a href="https://search.google.com/search-console/users" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-1">GSC Users & permissions <ExternalLink className="w-3 h-3" /></a>, add the service account email as <strong>Owner</strong> or <strong>Full</strong>.</li>
                      <li>Paste JSON above and click Save.</li>
                    </ol>
                  </div>
                </div>
              ) : (
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
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 font-medium"
                >
                  {saving ? 'Validating & Saving...' : 'Save & Enable Live GSC Access'}
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
            </CardContent>
          </Card>
        </div>

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
                    {log.includes('error') || log.includes('issue') ? (
                      <span className="text-rose-400">{log}</span>
                    ) : log.includes('stored') || log.includes('complete') ? (
                      <span className="text-emerald-400">{log}</span>
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
