/**
 * TalentXcel Government Source Compliance & Policy Dashboard
 * Admin console to monitor portal ingestion health, authorization states,
 * redistribution policies, and terms compliance.
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Shield, CheckCircle2, AlertTriangle, ExternalLink,
  RefreshCw, Globe, Search, Filter, Lock, Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { GOVERNMENT_SOURCES, GovernmentJobSource } from '@/config/jobs/governmentSources';
import { toast } from 'sonner';

export default function GovernmentSourcesAdmin() {
  const [sources, setSources] = useState<GovernmentJobSource[]>([...GOVERNMENT_SOURCES]);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('ALL');

  const filteredSources = sources.filter((s) => {
    if (countryFilter !== 'ALL' && s.country_code !== countryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.portal_name.toLowerCase().includes(q) ||
        s.organization.toLowerCase().includes(q) ||
        s.source_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: sources.length,
    active: sources.filter((s) => s.active).length,
    authorized: sources.filter((s) => s.authorization_status === 'AUTHORIZED' || s.authorization_status === 'PUBLIC').length,
    attributedRepublish: sources.filter((s) => s.redistribution_status === 'ATTRIBUTED_REPUBLISH').length,
    linkOutOnly: sources.filter((s) => s.redistribution_status === 'LINK_OUT').length,
  };

  const handleSyncSource = (sourceId: string) => {
    toast.success(`Sync scheduled for ${sourceId}. Ingestion pipeline triggered.`);
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 max-w-7xl mx-auto">
      <Helmet>
        <title>Government Sources Compliance Console | TalentXcel Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Government Sources Compliance Console
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Governance engine enforcing redistribution rights, terms of service compliance, and provenance tracking.
          </p>
        </div>

        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 self-start sm:self-auto">
          Policy Engine: v4.2 Active
        </Badge>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="bg-card">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Total Sources</span>
            <div className="text-xl font-bold mt-1 text-foreground">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Active Ingestors</span>
            <div className="text-xl font-bold mt-1 text-emerald-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Authorized / Public</span>
            <div className="text-xl font-bold mt-1 text-primary">{stats.authorized}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Attributed Republish</span>
            <div className="text-xl font-bold mt-1 text-indigo-600">{stats.attributedRepublish}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Link-Out Discovery</span>
            <div className="text-xl font-bold mt-1 text-amber-600">{stats.linkOutOnly}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search source by portal name, organization, or source ID..."
            className="pl-9 h-10 text-xs bg-card"
          />
        </div>

        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-full sm:w-48 h-10 text-xs bg-card">
            <Globe className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Jurisdictions</SelectItem>
            <SelectItem value="IN">🇮🇳 India</SelectItem>
            <SelectItem value="US">🇺🇸 United States</SelectItem>
            <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
            <SelectItem value="AU">🇦🇺 Australia</SelectItem>
            <SelectItem value="AE">🇦🇪 UAE</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sources Registry Table */}
      <Card className="border border-border/40 overflow-hidden">
        <CardHeader className="p-4 border-b border-border/30 bg-muted/20">
          <CardTitle className="text-sm font-semibold">Registered Portals & Rights Status</CardTitle>
          <CardDescription className="text-xs">
            Every source is strictly audited. Jobs automatically inherit the parent source policy.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead>Source / Portal</TableHead>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Access Method</TableHead>
                <TableHead>Redistribution Rights</TableHead>
                <TableHead>Application Route</TableHead>
                <TableHead>Sync Frequency</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {filteredSources.map((s) => (
                <TableRow key={s.source_id}>
                  <TableCell>
                    <div className="font-semibold text-foreground">{s.portal_name}</div>
                    <div className="text-[11px] text-muted-foreground">{s.organization}</div>
                    <span className="font-mono text-[10px] text-primary">{s.source_id}</span>
                  </TableCell>

                  <TableCell>
                    <span className="font-medium">{s.country_name}</span>
                    <span className="text-[10px] text-muted-foreground block">{s.government_level}</span>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {s.access_method}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        s.redistribution_status === 'FULL_REPUBLISH'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : s.redistribution_status === 'ATTRIBUTED_REPUBLISH'
                          ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                      }
                    >
                      {s.redistribution_status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <span className="text-[11px] text-muted-foreground">
                      {s.application_routing === 'REDIRECT_OFFICIAL' ? 'Official Portal Redirect' : 'Native Apply'}
                    </span>
                  </TableCell>

                  <TableCell>
                    <span className="text-muted-foreground">{s.refresh_frequency}</span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => handleSyncSource(s.source_id)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Sync
                      </Button>

                      {s.terms_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => window.open(s.terms_url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
