import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SwInfo {
  supported: boolean;
  controllerScriptUrl: string | null;
  registrationScope: string | null;
  state: string | null;
  cacheVersion: string | null;
  buildVersion: string | null;
}

interface CacheEntry {
  name: string;
  size: number;
  isCurrent: boolean;
}

const EXPECTED_CACHE_PREFIX = 'talentxcel-';

const SystemDiagnostics: React.FC = () => {
  const [sw, setSw] = useState<SwInfo | null>(null);
  const [caches_, setCaches] = useState<CacheEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const info: SwInfo = {
        supported: 'serviceWorker' in navigator,
        controllerScriptUrl: navigator.serviceWorker?.controller?.scriptURL ?? null,
        registrationScope: null,
        state: navigator.serviceWorker?.controller?.state ?? null,
        cacheVersion: null,
        buildVersion: (import.meta.env.VITE_BUILD_VERSION as string) || 'dev',
      };

      if (info.supported) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          info.registrationScope = reg.scope;
          info.state = reg.active?.state ?? info.state;
        }
      }

      // Inspect Cache Storage
      const entries: CacheEntry[] = [];
      if ('caches' in window) {
        const names = await caches.keys();
        let currentName: string | null = null;
        for (const n of names) {
          const c = await caches.open(n);
          const keys = await c.keys();
          if (n.startsWith(EXPECTED_CACHE_PREFIX)) currentName = n;
          entries.push({ name: n, size: keys.length, isCurrent: false });
        }
        // Mark the most recent talentxcel-* cache as current
        if (currentName) {
          entries.forEach((e) => (e.isCurrent = e.name === currentName));
          info.cacheVersion = currentName.replace(EXPECTED_CACHE_PREFIX, '');
        }
      }

      setSw(info);
      setCaches(entries);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const forceUpdate = async () => {
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      toast.info('No service worker registered.');
      return;
    }
    await reg.update();
    toast.success('Checked for updates. Reloading…');
    setTimeout(() => window.location.reload(), 800);
  };

  const clearAllCaches = async () => {
    if (!('caches' in window)) return;
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
    toast.success('Caches cleared. Reloading…');
    setTimeout(() => window.location.reload(), 600);
  };

  const unregisterSw = async () => {
    if (!('serviceWorker' in navigator)) return;
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
    toast.success('Service worker unregistered. Reloading…');
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">System Diagnostics</h1>
        <p className="text-sm text-muted-foreground">
          Verify you are running the latest version of TalentXcel.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Service Worker</CardTitle>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {!sw ? (
            <div>Loading…</div>
          ) : (
            <>
              <Row label="Supported">
                {sw.supported ? <OK>Yes</OK> : <Bad>No</Bad>}
              </Row>
              <Row label="Active script">
                <code className="text-xs break-all">{sw.controllerScriptUrl ?? '— (not controlling)'}</code>
              </Row>
              <Row label="State"><code>{sw.state ?? '—'}</code></Row>
              <Row label="Scope"><code className="text-xs">{sw.registrationScope ?? '—'}</code></Row>
              <Row label="Cache version">
                {sw.cacheVersion ? <Badge variant="secondary">{sw.cacheVersion}</Badge> : <Bad>none</Bad>}
              </Row>
              <Row label="Bundle build"><code>{sw.buildVersion}</code></Row>
            </>
          )}
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={forceUpdate}>Check for update</Button>
            <Button size="sm" variant="outline" onClick={unregisterSw}>Unregister SW</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Cache Storage</CardTitle>
          <Button size="sm" variant="destructive" onClick={clearAllCaches}>
            <Trash2 className="h-4 w-4 mr-2" /> Clear all
          </Button>
        </CardHeader>
        <CardContent>
          {caches_.length === 0 ? (
            <p className="text-sm text-muted-foreground">No caches present.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {caches_.map((c) => (
                <li key={c.name} className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    {c.isCurrent ? <OK>current</OK> : <Badge variant="outline">stale</Badge>}
                    <code className="text-xs">{c.name}</code>
                  </div>
                  <span className="text-muted-foreground">{c.size} entries</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    <div>{children}</div>
  </div>
);

const OK: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1 text-green-600">
    <CheckCircle2 className="h-4 w-4" /> {children}
  </span>
);

const Bad: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1 text-destructive">
    <AlertCircle className="h-4 w-4" /> {children}
  </span>
);

export default SystemDiagnostics;
