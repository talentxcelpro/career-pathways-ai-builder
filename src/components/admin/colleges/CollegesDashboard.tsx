import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCollegesManagement } from '@/hooks/useCollegesManagement';
import { 
  School, 
  Shield, 
  Crown, 
  MapPin,
  Users,
  TrendingUp,
  DollarSign,
  Calendar
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";

export const CollegesDashboard: React.FC = () => {
  const { collegeStats, isLoading } = useCollegesManagement();

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg"></div>
        ))}
      </div>
    </div>;
  }

  const stats = [
    {
      title: "Total Colleges",
      value: collegeStats?.totalColleges || 0,
      description: `${collegeStats?.verifiedColleges || 0} verified`,
      icon: School,
      color: "text-blue-600"
    },
    {
      title: "Verification Rate",
      value: `${collegeStats?.verificationRate || 0}%`,
      description: "Successfully verified",
      icon: Shield,
      color: "text-green-600"
    },
    {
      title: "Premium Colleges",
      value: collegeStats?.premiumColleges || 0,
      description: "Revenue generating",
      icon: Crown,
      color: "text-purple-600"
    },
    {
      title: "States Covered",
      value: collegeStats?.states?.length || 0,
      description: "Geographic reach",
      icon: MapPin,
      color: "text-orange-600"
    },
    {
      title: "Total Programs",
      value: collegeStats?.totalPrograms || 0,
      description: "Course offerings",
      icon: Users,
      color: "text-indigo-600"
    },
    {
      title: "Student Inquiries",
      value: collegeStats?.totalInquiries || 0,
      description: "This month",
      icon: TrendingUp,
      color: "text-pink-600"
    },
    {
      title: "Revenue Potential",
      value: `₹${((collegeStats?.premiumColleges || 0) * 25000).toLocaleString()}`,
      description: "Monthly premium revenue",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Upcoming Events",
      value: collegeStats?.totalEvents || 0,
      description: "College events",
      icon: Calendar,
      color: "text-red-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Verification Completion</span>
                <span>{collegeStats?.verificationRate}%</span>
              </div>
              <Progress value={collegeStats?.verificationRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Premium Adoption</span>
                <span>{collegeStats?.totalColleges ? Math.round((collegeStats.premiumColleges / collegeStats.totalColleges) * 100) : 0}%</span>
              </div>
              <Progress value={collegeStats?.totalColleges ? (collegeStats.premiumColleges / collegeStats.totalColleges) * 100 : 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Student Engagement</span>
                <span>78%</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Impact</CardTitle>
            <CardDescription>Revenue and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">₹{((collegeStats?.premiumColleges || 0) * 25000).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Monthly Premium Revenue</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold">{collegeStats?.totalInquiries || 0}</div>
                  <div className="text-xs text-muted-foreground">Student Inquiries</div>
                </div>
                <div>
                  <div className="text-xl font-bold">{collegeStats?.pendingVerification || 0}</div>
                  <div className="text-xs text-muted-foreground">Pending Review</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-100 hover:bg-blue-200 rounded-lg text-center transition-colors">
              <School className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <span className="text-sm font-medium">Add College</span>
            </button>
            <button className="p-4 bg-green-100 hover:bg-green-200 rounded-lg text-center transition-colors">
              <Shield className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <span className="text-sm font-medium">Verify Pending</span>
            </button>
            <button className="p-4 bg-purple-100 hover:bg-purple-200 rounded-lg text-center transition-colors">
              <Crown className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <span className="text-sm font-medium">Upgrade Premium</span>
            </button>
            <button className="p-4 bg-orange-100 hover:bg-orange-200 rounded-lg text-center transition-colors">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <span className="text-sm font-medium">View Analytics</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Premium Feature Highlight */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Premium Colleges Hub Benefits
          </CardTitle>
          <CardDescription>
            Complete ecosystem for colleges, students, and recruiters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">🎯 For Colleges</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Verified badge & premium listing</li>
                <li>• Student inquiry management</li>
                <li>• Analytics & insights dashboard</li>
                <li>• Virtual tours & media hosting</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">👨‍🎓 For Students</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Trusted, verified college directory</li>
                <li>• Direct college communication</li>
                <li>• Program & placement insights</li>
                <li>• Alumni network access</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">💼 For Recruiters</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Alumni database access</li>
                <li>• Campus recruitment events</li>
                <li>• Graduate skill mapping</li>
                <li>• Placement analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};