
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Ban, Mail, Calendar, MapPin } from 'lucide-react';

interface UsersListProps {
  users: any[];
  isLoading: boolean;
  handleUserAction: (userId: string, action: string) => void;
}

export const UsersList: React.FC<UsersListProps> = ({ 
  users, 
  isLoading, 
  handleUserAction 
}) => {
  const getUserStatusColor = (user: any) => {
    if (user.last_login_at) {
      const lastLogin = new Date(user.last_login_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return lastLogin > thirtyDaysAgo ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const getUserStatusText = (user: any) => {
    if (user.last_login_at) {
      const lastLogin = new Date(user.last_login_at);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return lastLogin > thirtyDaysAgo ? 'Active' : 'Inactive';
    }
    return 'Never logged in';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.full_name || 'No Name'}</h3>
                        <Badge className={getUserStatusColor(user)}>
                          {getUserStatusText(user)}
                        </Badge>
                        {user.is_employer && (
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">
                            Employer
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                        {user.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {user.location}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUserAction(user.id, 'Suspend')}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Suspend
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
