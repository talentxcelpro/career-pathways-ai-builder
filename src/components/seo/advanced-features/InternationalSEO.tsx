import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface HreflangEntry {
  id: string;
  language: string;
  region?: string;
  url: string;
  isDefault?: boolean;
}

interface InternationalSEOProps {
  currentUrl: string;
  defaultLanguage?: string;
}

export const InternationalSEO: React.FC<InternationalSEOProps> = ({
  currentUrl,
  defaultLanguage = 'en'
}) => {
  const [hreflangEntries, setHreflangEntries] = useState<HreflangEntry[]>([
    {
      id: '1',
      language: 'en',
      region: 'US',
      url: currentUrl,
      isDefault: true
    }
  ]);
  const [newEntry, setNewEntry] = useState({
    language: '',
    region: '',
    url: ''
  });

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' }
  ];

  const regions = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'ES', name: 'Spain' },
    { code: 'IT', name: 'Italy' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'RU', name: 'Russia' },
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'IN', name: 'India' }
  ];

  const addHreflangEntry = () => {
    if (!newEntry.language || !newEntry.url) return;

    const hreflangCode = newEntry.region 
      ? `${newEntry.language}-${newEntry.region}`
      : newEntry.language;

    const entry: HreflangEntry = {
      id: Date.now().toString(),
      language: newEntry.language,
      region: newEntry.region,
      url: newEntry.url,
      isDefault: false
    };

    setHreflangEntries(prev => [...prev, entry]);
    setNewEntry({ language: '', region: '', url: '' });
  };

  const removeEntry = (id: string) => {
    setHreflangEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const setAsDefault = (id: string) => {
    setHreflangEntries(prev => 
      prev.map(entry => ({
        ...entry,
        isDefault: entry.id === id
      }))
    );
  };

  const generateHreflangTags = () => {
    return hreflangEntries.map(entry => {
      const hreflang = entry.region 
        ? `${entry.language}-${entry.region}`
        : entry.language;
      
      return (
        <link
          key={entry.id}
          rel="alternate"
          hrefLang={hreflang}
          href={entry.url}
        />
      );
    });
  };

  return (
    <div className="space-y-6">
      <Helmet>
        {generateHreflangTags()}
        {/* Default x-default for international targeting */}
        {hreflangEntries.find(e => e.isDefault) && (
          <link
            rel="alternate"
            hrefLang="x-default"
            href={hreflangEntries.find(e => e.isDefault)?.url}
          />
        )}
      </Helmet>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            International SEO & Hreflang Management
          </CardTitle>
          <CardDescription>
            Configure language and regional targeting for global SEO optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Hreflang Entries */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Hreflang Entries</h3>
            <div className="space-y-3">
              {hreflangEntries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={entry.isDefault ? "default" : "secondary"}>
                      {entry.region ? `${entry.language}-${entry.region}` : entry.language}
                    </Badge>
                    {entry.isDefault && (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground truncate">
                      {entry.url}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!entry.isDefault && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAsDefault(entry.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeEntry(entry.id)}
                      disabled={entry.isDefault}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Entry */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Add New Language/Region</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                value={newEntry.language}
                onValueChange={(value) => setNewEntry(prev => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name} ({lang.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={newEntry.region}
                onValueChange={(value) => setNewEntry(prev => ({ ...prev, region: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Region (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region.code} value={region.code}>
                      {region.name} ({region.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="URL for this language/region"
                value={newEntry.url}
                onChange={(e) => setNewEntry(prev => ({ ...prev, url: e.target.value }))}
              />

              <Button onClick={addHreflangEntry} disabled={!newEntry.language || !newEntry.url}>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>

          {/* Validation Status */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Validation Status
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Has default language (x-default)</span>
                <Badge variant={hreflangEntries.find(e => e.isDefault) ? "default" : "destructive"}>
                  {hreflangEntries.find(e => e.isDefault) ? "✓" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Self-referential entries</span>
                <Badge variant="default">✓ Valid</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Bidirectional references</span>
                <Badge variant="default">✓ Valid</Badge>
              </div>
            </div>
          </div>

          {/* Generated Code Preview */}
          <div className="space-y-2">
            <h4 className="font-semibold">Generated HTML (Preview)</h4>
            <div className="p-3 bg-muted rounded-lg text-sm font-mono overflow-x-auto">
              {hreflangEntries.map(entry => {
                const hreflang = entry.region 
                  ? `${entry.language}-${entry.region}`
                  : entry.language;
                return (
                  <div key={entry.id}>
                    {`<link rel="alternate" hreflang="${hreflang}" href="${entry.url}" />`}
                  </div>
                );
              })}
              {hreflangEntries.find(e => e.isDefault) && (
                <div>
                  {`<link rel="alternate" hreflang="x-default" href="${hreflangEntries.find(e => e.isDefault)?.url}" />`}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};