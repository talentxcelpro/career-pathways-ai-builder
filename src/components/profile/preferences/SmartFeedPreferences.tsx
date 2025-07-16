import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SmartFeedPreferencesProps {
  preferences: any;
  onPreferencesChange: (preferences: any) => void;
}

const CONTENT_TYPES = [
  { id: 'career_tips', label: 'Career Tips', description: 'Professional advice and insights' },
  { id: 'job_posts', label: 'Job Posts', description: 'New opportunities and openings' },
  { id: 'industry_news', label: 'Industry News', description: 'Latest industry updates' },
  { id: 'peer_achievements', label: 'Peer Achievements', description: 'Success stories from your network' },
  { id: 'polls_opinions', label: 'Polls & Opinions', description: 'Community discussions and surveys' },
  { id: 'skill_recommendations', label: 'Skill/Course Recommendations', description: 'Learning opportunities' },
];

const POPULAR_TAGS = [
  'AI', 'Marketing', 'CareerSwitch', 'UXDesign', 'Leadership', 'RemoteWork', 
  'StartupLife', 'TechTrends', 'PersonalBrand', 'Networking', 'JobSearch', 
  'ProductManagement', 'SoftwareEngineering', 'DataScience', 'DigitalMarketing'
];

const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing', 
  'Retail', 'Construction', 'Transportation', 'Media', 'Government'
];

const ROLES = [
  'Software Engineer', 'Product Manager', 'Marketing Manager', 'Data Scientist', 
  'UX Designer', 'Project Manager', 'Sales Representative', 'HR Manager', 
  'Business Analyst', 'DevOps Engineer'
];

export const SmartFeedPreferences: React.FC<SmartFeedPreferencesProps> = ({ 
  preferences, 
  onPreferencesChange 
}) => {
  const [newTag, setNewTag] = useState('');
  const [newBlockedKeyword, setNewBlockedKeyword] = useState('');
  const { toast } = useToast();

  const handleContentTypeToggle = (contentType: string) => {
    const currentIncluded = preferences.include_content_types || [];
    const currentExcluded = preferences.exclude_content_types || [];
    
    if (currentIncluded.includes(contentType)) {
      // Move to excluded
      onPreferencesChange({
        ...preferences,
        include_content_types: currentIncluded.filter(t => t !== contentType),
        exclude_content_types: [...currentExcluded, contentType]
      });
    } else if (currentExcluded.includes(contentType)) {
      // Remove from excluded (neutral)
      onPreferencesChange({
        ...preferences,
        exclude_content_types: currentExcluded.filter(t => t !== contentType)
      });
    } else {
      // Add to included
      onPreferencesChange({
        ...preferences,
        include_content_types: [...currentIncluded, contentType]
      });
    }
  };

  const addTag = (tag: string, type: 'include' | 'exclude') => {
    if (!tag.trim()) return;
    
    const currentTags = preferences[`${type}_tags`] || [];
    if (!currentTags.includes(tag)) {
      onPreferencesChange({
        ...preferences,
        [`${type}_tags`]: [...currentTags, tag]
      });
    }
    setNewTag('');
  };

  const removeTag = (tag: string, type: 'include' | 'exclude') => {
    const currentTags = preferences[`${type}_tags`] || [];
    onPreferencesChange({
      ...preferences,
      [`${type}_tags`]: currentTags.filter(t => t !== tag)
    });
  };

  const addBlockedKeyword = () => {
    if (!newBlockedKeyword.trim()) return;
    
    const currentKeywords = preferences.blocked_keywords || [];
    if (!currentKeywords.includes(newBlockedKeyword)) {
      onPreferencesChange({
        ...preferences,
        blocked_keywords: [...currentKeywords, newBlockedKeyword]
      });
    }
    setNewBlockedKeyword('');
  };

  const removeBlockedKeyword = (keyword: string) => {
    const currentKeywords = preferences.blocked_keywords || [];
    onPreferencesChange({
      ...preferences,
      blocked_keywords: currentKeywords.filter(k => k !== keyword)
    });
  };

  const toggleArrayItem = (item: string, arrayKey: string) => {
    const currentArray = preferences[arrayKey] || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    
    onPreferencesChange({
      ...preferences,
      [arrayKey]: newArray
    });
  };

  const handleBehavioralSettingChange = (key: string, value: any) => {
    onPreferencesChange({
      ...preferences,
      [key]: value
    });
  };

  const getContentTypeStatus = (contentType: string) => {
    const included = preferences.include_content_types || [];
    const excluded = preferences.exclude_content_types || [];
    
    if (included.includes(contentType)) return 'included';
    if (excluded.includes(contentType)) return 'excluded';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      {/* Content Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Content Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CONTENT_TYPES.map(type => {
              const status = getContentTypeStatus(type.id);
              return (
                <div key={type.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Label className="font-medium">{type.label}</Label>
                      <Badge 
                        variant={status === 'included' ? 'default' : status === 'excluded' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {status === 'included' ? 'Show' : status === 'excluded' ? 'Hide' : 'Neutral'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContentTypeToggle(type.id)}
                  >
                    {status === 'included' ? 'Hide' : status === 'excluded' ? 'Show' : 'Show'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tags to Include */}
      <Card>
        <CardHeader>
          <CardTitle>Topics to Include</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag (e.g., AI, Marketing)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag(newTag, 'include')}
              />
              <Button onClick={() => addTag(newTag, 'include')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Popular Tags</Label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => addTag(tag, 'include')}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Your Included Tags</Label>
              <div className="flex flex-wrap gap-2">
                {(preferences.include_tags || []).map(tag => (
                  <Badge key={tag} variant="default" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag, 'include')}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags to Exclude */}
      <Card>
        <CardHeader>
          <CardTitle>Topics to Exclude</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag to exclude (e.g., Crypto, Politics)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag(newTag, 'exclude')}
              />
              <Button onClick={() => addTag(newTag, 'exclude')}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Your Excluded Tags</Label>
              <div className="flex flex-wrap gap-2">
                {(preferences.exclude_tags || []).map(tag => (
                  <Badge key={tag} variant="destructive" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag, 'exclude')}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Industries & Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Preferred Industries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {INDUSTRIES.map(industry => (
                <div key={industry} className="flex items-center justify-between">
                  <Label className="text-sm">{industry}</Label>
                  <Switch
                    checked={(preferences.preferred_industries || []).includes(industry)}
                    onCheckedChange={() => toggleArrayItem(industry, 'preferred_industries')}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferred Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ROLES.map(role => (
                <div key={role} className="flex items-center justify-between">
                  <Label className="text-sm">{role}</Label>
                  <Switch
                    checked={(preferences.preferred_roles || []).includes(role)}
                    onCheckedChange={() => toggleArrayItem(role, 'preferred_roles')}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blocking Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Block Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Block Keywords</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter keyword to block"
                  value={newBlockedKeyword}
                  onChange={(e) => setNewBlockedKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addBlockedKeyword()}
                />
                <Button onClick={addBlockedKeyword}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(preferences.blocked_keywords || []).map(keyword => (
                  <Badge key={keyword} variant="destructive" className="gap-1">
                    {keyword}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeBlockedKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Feed Behavior</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Prioritize Connections</Label>
                <p className="text-xs text-muted-foreground">Show posts from your network first</p>
              </div>
              <Switch
                checked={preferences.prioritize_connections !== false}
                onCheckedChange={(checked) => handleBehavioralSettingChange('prioritize_connections', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Show Trending Content</Label>
                <p className="text-xs text-muted-foreground">Include popular posts from the wider network</p>
              </div>
              <Switch
                checked={preferences.show_trending_content !== false}
                onCheckedChange={(checked) => handleBehavioralSettingChange('show_trending_content', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};