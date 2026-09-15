import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye,
  Download,
  Mail,
  MapPin,
  Briefcase
} from 'lucide-react';

const TalentAnalytics = () => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Total Profiles</div>
                <div className="text-xs text-green-600">+0% this week</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Profile Views</div>
                <div className="text-xs text-green-600">+0% this week</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Download className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">CV Downloads</div>
                <div className="text-xs text-green-600">+0% this week</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Job Alerts Sent</div>
                <div className="text-xs text-green-600">+0% this week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Profile Views Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Chart will appear when data is available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Skills in Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-dashed border-gray-300 rounded">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                <p>Skills distribution chart</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Locations and Roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Top Candidate Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-2" />
                <p>Location data will appear when profiles are added</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Most Common Job Titles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-2" />
                <p>Job title analytics will appear when profiles are added</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Database Health */}
      <Card>
        <CardHeader>
          <CardTitle>Database Health & Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-green-600 mb-2">0%</div>
              <div className="text-sm text-muted-foreground">Complete Profiles</div>
              <Badge variant="outline" className="mt-2">All fields filled</Badge>
            </div>
            
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">0%</div>
              <div className="text-sm text-muted-foreground">Active Candidates</div>
              <Badge variant="outline" className="mt-2">Open to opportunities</Badge>
            </div>
            
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-purple-600 mb-2">0%</div>
              <div className="text-sm text-muted-foreground">Verified Profiles</div>
              <Badge variant="outline" className="mt-2">Email verified</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Analytics Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <Download className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold mb-2">Export Data</h3>
              <p className="text-sm text-muted-foreground mb-3">Download analytics reports</p>
              <button className="text-sm text-blue-600 hover:underline">Export CSV</button>
            </div>
            
            <div className="p-4 border rounded-lg text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-semibold mb-2">Generate Report</h3>
              <p className="text-sm text-muted-foreground mb-3">Create detailed analytics report</p>
              <button className="text-sm text-green-600 hover:underline">Generate</button>
            </div>
            
            <div className="p-4 border rounded-lg text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold mb-2">Trend Analysis</h3>
              <p className="text-sm text-muted-foreground mb-3">Analyze hiring trends</p>
              <button className="text-sm text-purple-600 hover:underline">View Trends</button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { TalentAnalytics };