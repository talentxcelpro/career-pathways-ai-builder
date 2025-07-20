import React, { useState } from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdCampaigns, useCreateAdCampaign } from '@/hooks/useAdvancedAdmin';
import { Plus, Play, Pause, BarChart3, Target, Megaphone, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const AdCampaignManager = () => {
  const [selectedTab, setSelectedTab] = useState('campaigns');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: campaigns, isLoading } = useAdCampaigns();
  const createCampaign = useCreateAdCampaign();
  
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const campaignData = {
        ...data,
        content: {
          headlines: data.headlines?.split('\n').filter(Boolean),
          descriptions: data.descriptions?.split('\n').filter(Boolean),
          images: data.images?.split('\n').filter(Boolean),
          cta_text: data.cta_text,
        },
        targeting_rules: {
          user_roles: data.user_roles?.split(',').map((r: string) => r.trim()),
          locations: data.locations?.split(',').map((l: string) => l.trim()),
          age_range: data.age_range,
          devices: data.devices?.split(',').map((d: string) => d.trim()),
        },
        budget_settings: {
          budget: parseFloat(data.budget) || 0,
          budget_type: data.budget_type,
          bid_strategy: data.bid_strategy,
        },
      };

      await createCampaign.mutateAsync(campaignData);
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <UnifiedAdminLayout title="Ad Campaign Manager" description="Create and manage advertising campaigns">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </UnifiedAdminLayout>
    );
  }

  return (
    <UnifiedAdminLayout title="Ad Campaign Manager" description="Create and manage advertising campaigns">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline" size="sm">
              <Target className="h-4 w-4 mr-2" />
              Audience Insights
            </Button>
            <Button variant="outline" size="sm">
              <Megaphone className="h-4 w-4 mr-2" />
              Ad Preview
            </Button>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Ad Campaign</DialogTitle>
                <DialogDescription>
                  Create internal or external advertising campaigns
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campaign_name">Campaign Name</Label>
                    <Input
                      id="campaign_name"
                      placeholder="Campaign name..."
                      {...register('campaign_name', { required: true })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="campaign_type">Campaign Type</Label>
                    <Select onValueChange={(value) => setValue('campaign_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select campaign type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Internal Banner</SelectItem>
                        <SelectItem value="google_ads">Google Ads</SelectItem>
                        <SelectItem value="meta_ads">Meta Ads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Campaign Content</h4>
                  
                  <div>
                    <Label htmlFor="headlines">Headlines (one per line)</Label>
                    <Textarea
                      id="headlines"
                      placeholder="Boost Your Career with AI&#10;Find Your Dream Job Today&#10;Professional Resume Builder"
                      rows={3}
                      {...register('headlines')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="descriptions">Descriptions (one per line)</Label>
                    <Textarea
                      id="descriptions"
                      placeholder="Create stunning resumes with our AI-powered tools&#10;Connect with top employers and land your dream job&#10;Build your professional profile in minutes"
                      rows={3}
                      {...register('descriptions')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cta_text">Call to Action</Label>
                      <Input
                        id="cta_text"
                        placeholder="Get Started"
                        {...register('cta_text')}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="images">Image URLs (one per line)</Label>
                      <Textarea
                        id="images"
                        placeholder="https://example.com/ad1.jpg&#10;https://example.com/ad2.jpg"
                        rows={2}
                        {...register('images')}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Targeting & Budget</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="user_roles">Target User Roles</Label>
                      <Input
                        id="user_roles"
                        placeholder="job_seeker, employer, student"
                        {...register('user_roles')}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="locations">Target Locations</Label>
                      <Input
                        id="locations"
                        placeholder="India, USA, UK"
                        {...register('locations')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="budget">Budget ($)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="1000"
                        {...register('budget')}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="budget_type">Budget Type</Label>
                      <Select onValueChange={(value) => setValue('budget_type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Budget type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="total">Total</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="bid_strategy">Bid Strategy</Label>
                      <Select onValueChange={(value) => setValue('bid_strategy', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Bid strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpc">Cost Per Click</SelectItem>
                          <SelectItem value="cpm">Cost Per Mille</SelectItem>
                          <SelectItem value="cpa">Cost Per Action</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCampaign.isPending}>
                    {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="creative">Creative Assets</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>
                  Manage your advertising campaigns across all platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns?.map((campaign) => (
                    <div key={campaign.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{campaign.campaign_name}</h3>
                            <Badge className={getCampaignStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                            <Badge variant="outline">{campaign.campaign_type}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Budget</div>
                              <div className="font-medium">
                                ${campaign.budget_settings?.budget || 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Impressions</div>
                              <div className="font-medium">
                                {campaign.performance_data?.impressions || 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Clicks</div>
                              <div className="font-medium">
                                {campaign.performance_data?.clicks || 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">CTR</div>
                              <div className="font-medium">
                                {campaign.performance_data?.ctr || '0.00'}%
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className={campaign.status === 'active' ? 'text-orange-600' : 'text-green-600'}
                          >
                            {campaign.status === 'active' ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {(!campaigns || campaigns.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      No campaigns found. Create your first campaign to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Impressions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45,234</div>
                  <p className="text-sm text-green-600">+12% vs last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Clicks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-sm text-green-600">+8% vs last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">CTR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6.29%</div>
                  <p className="text-sm text-red-600">-2% vs last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Total Spend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$1,234</div>
                  <p className="text-sm text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Detailed performance metrics by campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Campaign</th>
                        <th className="text-left p-2">Type</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Impressions</th>
                        <th className="text-left p-2">Clicks</th>
                        <th className="text-left p-2">CTR</th>
                        <th className="text-left p-2">Spend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns?.map((campaign) => (
                        <tr key={campaign.id} className="border-b">
                          <td className="p-2 font-medium">{campaign.campaign_name}</td>
                          <td className="p-2">
                            <Badge variant="outline">{campaign.campaign_type}</Badge>
                          </td>
                          <td className="p-2">
                            <Badge className={getCampaignStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </td>
                          <td className="p-2">{campaign.performance_data?.impressions || 0}</td>
                          <td className="p-2">{campaign.performance_data?.clicks || 0}</td>
                          <td className="p-2">{campaign.performance_data?.ctr || '0.00'}%</td>
                          <td className="p-2">${campaign.performance_data?.spend || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="creative" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Creative Assets</CardTitle>
                <CardDescription>Manage ad creatives and assets library</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                      <span className="text-gray-500">Ad Creative 1</span>
                    </div>
                    <div className="text-sm font-medium">Resume Builder Banner</div>
                    <div className="text-xs text-muted-foreground">1200x628px</div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                      <span className="text-gray-500">Ad Creative 2</span>
                    </div>
                    <div className="text-sm font-medium">Job Search CTA</div>
                    <div className="text-xs text-muted-foreground">800x600px</div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                      <span className="text-gray-500">Ad Creative 3</span>
                    </div>
                    <div className="text-sm font-medium">Career Guidance</div>
                    <div className="text-xs text-muted-foreground">1080x1080px</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Audience Insights</CardTitle>
                <CardDescription>Understand your target audience performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Top Performing Segments</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>Job Seekers (25-34)</span>
                        <Badge variant="outline">8.2% CTR</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>Recent Graduates</span>
                        <Badge variant="outline">7.8% CTR</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>Career Changers</span>
                        <Badge variant="outline">6.5% CTR</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Geographic Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>India</span>
                        <div className="text-sm text-muted-foreground">12,450 impressions</div>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>United States</span>
                        <div className="text-sm text-muted-foreground">8,720 impressions</div>
                      </div>
                      <div className="flex justify-between items-center p-2 border rounded">
                        <span>United Kingdom</span>
                        <div className="text-sm text-muted-foreground">5,230 impressions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedAdminLayout>
  );
};

export default AdCampaignManager;