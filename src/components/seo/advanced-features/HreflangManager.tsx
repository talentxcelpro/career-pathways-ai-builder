import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { 
  Globe, 
  Languages, 
  Link,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface HreflangRule {
  id: string;
  source_url: string;
  target_language: string;
  target_region?: string;
  target_url: string;
  is_default: boolean;
  status: 'active' | 'inactive' | 'error';
  last_validated: string;
  validation_errors: string[];
  traffic_data: {
    impressions: number;
    clicks: number;
    ctr: number;
  };
}

interface LanguageRegionPair {
  code: string;
  language: string;
  region?: string;
  flag: string;
  users: number;
  market_size: string;
}

export const HreflangManager = () => {
  const [hreflangRules, setHreflangRules] = useState<HreflangRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [newRule, setNewRule] = useState({
    source_url: '',
    target_language: '',
    target_region: '',
    target_url: '',
    is_default: false
  });

  const availableLanguages: LanguageRegionPair[] = [
    { code: 'en', language: 'English', flag: '🇺🇸', users: 1500000000, market_size: 'Global' },
    { code: 'en-IN', language: 'English', region: 'India', flag: '🇮🇳', users: 350000000, market_size: 'Large' },
    { code: 'hi-IN', language: 'Hindi', region: 'India', flag: '🇮🇳', users: 550000000, market_size: 'Large' },
    { code: 'es', language: 'Spanish', flag: '🇪🇸', users: 500000000, market_size: 'Global' },
    { code: 'fr', language: 'French', flag: '🇫🇷', users: 280000000, market_size: 'Large' },
    { code: 'de', language: 'German', flag: '🇩🇪', users: 130000000, market_size: 'Medium' },
    { code: 'pt-BR', language: 'Portuguese', region: 'Brazil', flag: '🇧🇷', users: 215000000, market_size: 'Large' },
    { code: 'ja', language: 'Japanese', flag: '🇯🇵', users: 125000000, market_size: 'Medium' },
    { code: 'ko', language: 'Korean', flag: '🇰🇷', users: 77000000, market_size: 'Medium' },
    { code: 'zh-CN', language: 'Chinese', region: 'China', flag: '🇨🇳', users: 900000000, market_size: 'Huge' },
    { code: 'ar', language: 'Arabic', flag: '🇸🇦', users: 400000000, market_size: 'Large' },
    { code: 'ru', language: 'Russian', flag: '🇷🇺', users: 260000000, market_size: 'Large' }
  ];

  useEffect(() => {
    loadHreflangRules();
  }, []);

  const loadHreflangRules = async () => {
    setLoading(true);
    try {
      // Simulate hreflang data
      const mockRules: HreflangRule[] = [
        {
          id: '1',
          source_url: '/jobs',
          target_language: 'en',
          target_url: '/jobs',
          is_default: true,
          status: 'active',
          last_validated: new Date().toISOString(),
          validation_errors: [],
          traffic_data: {
            impressions: 1250000,
            clicks: 87500,
            ctr: 7.0
          }
        },
        {
          id: '2',
          source_url: '/jobs',
          target_language: 'hi',
          target_region: 'IN',
          target_url: '/hi/jobs',
          is_default: false,
          status: 'active',
          last_validated: new Date().toISOString(),
          validation_errors: [],
          traffic_data: {
            impressions: 450000,
            clicks: 22500,
            ctr: 5.0
          }
        },
        {
          id: '3',
          source_url: '/jobs',
          target_language: 'es',
          target_url: '/es/jobs',
          is_default: false,
          status: 'error',
          last_validated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          validation_errors: ['404 error on target URL', 'Missing return hreflang link'],
          traffic_data: {
            impressions: 156000,
            clicks: 4680,
            ctr: 3.0
          }
        },
        {
          id: '4',
          source_url: '/companies',
          target_language: 'en',
          target_region: 'IN',
          target_url: '/companies',
          is_default: false,
          status: 'active',
          last_validated: new Date().toISOString(),
          validation_errors: [],
          traffic_data: {
            impressions: 234000,
            clicks: 11700,
            ctr: 5.0
          }
        }
      ];
      
      setHreflangRules(mockRules);
    } catch (error) {
      console.error('Error loading hreflang rules:', error);
      toast.error('Failed to load hreflang configuration');
    } finally {
      setLoading(false);
    }
  };

  const addRule = async () => {
    if (!newRule.source_url || !newRule.target_language || !newRule.target_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    const rule: HreflangRule = {
      id: Date.now().toString(),
      source_url: newRule.source_url,
      target_language: newRule.target_language,
      target_region: newRule.target_region || undefined,
      target_url: newRule.target_url,
      is_default: newRule.is_default,
      status: 'active',
      last_validated: new Date().toISOString(),
      validation_errors: [],
      traffic_data: {
        impressions: 0,
        clicks: 0,
        ctr: 0
      }
    };

    setHreflangRules(prev => [rule, ...prev]);
    setNewRule({
      source_url: '',
      target_language: '',
      target_region: '',
      target_url: '',
      is_default: false
    });
    setShowAddForm(false);
    toast.success('Hreflang rule added successfully');
  };

  const deleteRule = async (ruleId: string) => {
    setHreflangRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast.success('Hreflang rule deleted');
  };

  const validateRules = async () => {
    setLoading(true);
    try {
      // Simulate validation
      setHreflangRules(prev => prev.map(rule => ({
        ...rule,
        last_validated: new Date().toISOString(),
        status: Math.random() > 0.8 ? 'error' : 'active',
        validation_errors: Math.random() > 0.8 ? ['Simulated validation error'] : []
      })));
      
      toast.success('Hreflang rules validated');
    } catch (error) {
      console.error('Error validating rules:', error);
      toast.error('Failed to validate hreflang rules');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: HreflangRule['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getLanguageInfo = (langCode: string, region?: string) => {
    const fullCode = region ? `${langCode}-${region}` : langCode;
    return availableLanguages.find(lang => 
      lang.code === fullCode || lang.code === langCode
    ) || availableLanguages[0];
  };

  const activeRules = hreflangRules.filter(rule => rule.status === 'active').length;
  const errorRules = hreflangRules.filter(rule => rule.status === 'error').length;
  const totalImpressions = hreflangRules.reduce((sum, rule) => sum + rule.traffic_data.impressions, 0);
  const totalClicks = hreflangRules.reduce((sum, rule) => sum + rule.traffic_data.clicks, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hreflang Manager</h2>
          <p className="text-muted-foreground">Manage international and multi-language SEO targeting</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={validateRules} disabled={loading}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Validate Rules
          </Button>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">{activeRules}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">{errorRules}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold">{(totalImpressions / 1000000).toFixed(1)}M</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg CTR</p>
                <p className="text-2xl font-bold">{avgCTR.toFixed(1)}%</p>
              </div>
              <Globe className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Rule Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Hreflang Rule</CardTitle>
            <CardDescription>Configure language and region targeting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Source URL Pattern</label>
                <Input
                  placeholder="/jobs or /jobs/*"
                  value={newRule.source_url}
                  onChange={(e) => setNewRule(prev => ({ ...prev, source_url: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target URL</label>
                <Input
                  placeholder="/es/jobs or /jobs?lang=es"
                  value={newRule.target_url}
                  onChange={(e) => setNewRule(prev => ({ ...prev, target_url: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Language</label>
                <select
                  value={newRule.target_language}
                  onChange={(e) => setNewRule(prev => ({ ...prev, target_language: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">Select Language</option>
                  {availableLanguages.map(lang => (
                    <option key={lang.code} value={lang.language.toLowerCase().substring(0, 2)}>
                      {lang.flag} {lang.language} {lang.region && `(${lang.region})`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Region (Optional)</label>
                <Input
                  placeholder="IN, US, ES, etc."
                  value={newRule.target_region}
                  onChange={(e) => setNewRule(prev => ({ ...prev, target_region: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_default"
                checked={newRule.is_default}
                onChange={(e) => setNewRule(prev => ({ ...prev, is_default: e.target.checked }))}
              />
              <label htmlFor="is_default" className="text-sm">Set as default language</label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={addRule}>
                Add Rule
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Language Market Opportunities</CardTitle>
          <CardDescription>Potential markets for expansion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableLanguages.slice(0, 6).map((lang) => {
              const hasRule = hreflangRules.some(rule => 
                rule.target_language === lang.language.toLowerCase().substring(0, 2) ||
                rule.target_language === lang.code.substring(0, 2)
              );
              
              return (
                <div key={lang.code} className={`p-4 border rounded-lg ${hasRule ? 'bg-green-50 border-green-200' : 'hover:bg-muted/50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{lang.flag}</span>
                      <span className="font-medium">{lang.language}</span>
                      {lang.region && <span className="text-sm text-muted-foreground">({lang.region})</span>}
                    </div>
                    {hasRule ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        Opportunity
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Users:</span>
                      <span className="font-medium">{(lang.users / 1000000).toFixed(0)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market:</span>
                      <span className="font-medium">{lang.market_size}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hreflang Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Current Hreflang Rules</CardTitle>
          <CardDescription>Configured language and region targeting rules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hreflangRules.map((rule) => {
              const langInfo = getLanguageInfo(rule.target_language, rule.target_region);
              
              return (
                <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{langInfo.flag}</span>
                      <div>
                        <h4 className="font-semibold flex items-center gap-2">
                          {rule.source_url}
                          <Languages className="h-4 w-4 text-muted-foreground" />
                          {rule.target_url}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{langInfo.language}{rule.target_region && ` (${rule.target_region})`}</span>
                          {rule.is_default && <Badge variant="secondary">Default</Badge>}
                          <Badge className={getStatusColor(rule.status)}>
                            {rule.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div className="font-medium">
                        {(rule.traffic_data.impressions / 1000).toFixed(0)}K impressions
                      </div>
                      <div className="text-muted-foreground">
                        CTR: {rule.traffic_data.ctr.toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteRule(rule.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {hreflangRules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Languages className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hreflang rules configured yet.</p>
              <p className="text-sm">Add rules above to start international SEO targeting.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {errorRules > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Validation Errors
            </CardTitle>
            <CardDescription>Issues found with hreflang configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hreflangRules
                .filter(rule => rule.status === 'error')
                .map(rule => (
                  <div key={rule.id} className="p-3 border-l-4 border-red-500 bg-red-50">
                    <h4 className="font-medium">{rule.source_url} → {rule.target_url}</h4>
                    <div className="mt-1 space-y-1">
                      {rule.validation_errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600">• {error}</p>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};