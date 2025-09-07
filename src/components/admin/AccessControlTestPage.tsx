import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
// import { navItems } from '@/nav-items'; // Removed to prevent circular dependency
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { filterNavigationByPermissions } from '@/utils/navigationFilter';
import { Shield, Users, Zap, Eye, EyeOff } from 'lucide-react';

export const AccessControlTestPage: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading } = useAdminAccess();

  const permissions = {
    isAuthenticated: !!user,
    isAdmin,
    isLoading
  };

  // Mock data to avoid circular dependency with nav-items
  const mockPublicRoutes = [
    { title: "TalentXcel Resume Builder", to: "/", isPublic: true },
    { title: "Network", to: "/network", isPublic: true },
    { title: "Jobs", to: "/jobs", isPublic: true },
    { title: "Employer", to: "/employer", isPublic: true },
    { title: "About", to: "/about", isPublic: true },
  ];

  const mockAdminRoutes = [
    { title: "Admin Dashboard", to: "/admin", requiresAdminAccess: true },
    { title: "SEO Admin", to: "/admin/seo", requiresAdminAccess: true },
    { title: "Tools", to: "/tools", requiresAdminAccess: true },
    { title: "Learning", to: "/learning", requiresAdminAccess: true },
  ];

  const accessibleRoutes = [
    ...mockPublicRoutes,
    ...(isAdmin ? mockAdminRoutes : [])
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Access Control Test Dashboard</h1>
        <div className="flex gap-2 justify-center">
          <Badge variant={user ? "default" : "secondary"}>
            {user ? "Authenticated" : "Not Authenticated"}
          </Badge>
          <Badge variant={isAdmin ? "default" : "outline"}>
            {isAdmin ? "Admin" : "Regular User"}
          </Badge>
        </div>
      </div>

      {/* Current User Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current Access Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Authentication</p>
              <p className="text-sm text-muted-foreground">
                {user ? `Logged in as ${user.email}` : "Not authenticated"}
              </p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Role</p>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? "Administrator" : "Regular User"}
              </p>
            </div>
            <div className="text-center">
              <Zap className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Access Level</p>
              <p className="text-sm text-muted-foreground">
                {accessibleRoutes.length} routes accessible
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Route Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Public Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Eye className="h-5 w-5" />
              Public Routes ({mockPublicRoutes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockPublicRoutes.slice(0, 8).map((route, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm">{route.title}</span>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    Public
                  </Badge>
                </div>
              ))}
              {mockPublicRoutes.length > 8 && (
                <p className="text-sm text-muted-foreground">
                  +{mockPublicRoutes.length - 8} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Only Routes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <EyeOff className="h-5 w-5" />
              Admin Only ({mockAdminRoutes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockAdminRoutes.slice(0, 8).map((route, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                  <span className="text-sm">{route.title}</span>
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    Admin
                  </Badge>
                </div>
              ))}
              {mockAdminRoutes.length > 8 && (
                <p className="text-sm text-muted-foreground">
                  +{mockAdminRoutes.length - 8} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Your Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Zap className="h-5 w-5" />
              Your Access ({accessibleRoutes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {accessibleRoutes.slice(0, 8).map((route, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="text-sm">{route.title}</span>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    Accessible
                  </Badge>
                </div>
              ))}
              {accessibleRoutes.length > 8 && (
                <p className="text-sm text-muted-foreground">
                  +{accessibleRoutes.length - 8} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Navigation */}
      <Card>
        <CardHeader>
          <CardTitle>Test Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Try accessing these routes to test the access control:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/tools">Tools (Admin Only)</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/learning">Learning (Admin Only)</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/career-map">Career Map (Admin Only)</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/companies">Companies (Admin Only)</Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link to="/network">Network (Public)</Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link to="/jobs">Jobs (Public)</Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link to="/employer">Employer (Public)</Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link to="/colleges">Colleges (Public)</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};