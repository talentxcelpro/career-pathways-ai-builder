
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { UserAvatar } from '@/components/common/UserAvatar';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Eye, 
  Edit, 
  Shield,
  Mail,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { UsersPagination } from './UsersPagination';
import { ProfileCompletionBar } from './ProfileCompletionBar';
import { ProfileCompletionReminder } from './ProfileCompletionReminder';
import { toast } from 'sonner';

interface UsersListProps {
  users: any[];
  isLoading: boolean;
  handleUserAction: (userId: string, action: string) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  selectedUsers: any[];
  onUserSelect: (user: any, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
}

export const UsersList: React.FC<UsersListProps> = ({ 
  users, 
  isLoading, 
  handleUserAction,
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  selectedUsers,
  onUserSelect,
  onSelectAll
}) => {
  const [reminderUser, setReminderUser] = useState<any>(null);
  const [reminderPercentage, setReminderPercentage] = useState<number>(0);

  const handleSendReminder = (userId: string, completionPercentage: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setReminderUser(user);
      setReminderPercentage(completionPercentage);
    }
  };

  const handleReminderSent = () => {
    toast.success('Profile completion reminder sent successfully');
    setReminderUser(null);
    setReminderPercentage(0);
  };
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'employer': return 'bg-blue-100 text-blue-800';
      case 'job_seeker': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({totalCount || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all users"
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Completion
                </div>
              </TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id} className={selectedUsers.some(u => u.id === user.id) ? 'bg-muted/50' : ''}>
                <TableCell>
                  <Checkbox
                    checked={selectedUsers.some(u => u.id === user.id)}
                    onCheckedChange={(checked) => onUserSelect(user, checked as boolean)}
                    aria-label={`Select user ${user.full_name || 'Unknown'}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/30 p-2 rounded-md transition-colors" onClick={() => window.open(`/user/${user.username || user.id}`, '_blank')}>
                    <UserAvatar 
                      src={user.profile_picture_url}
                      userName={user.full_name}
                      size="md"
                    />
                    <div>
                      <p className="font-medium">{user.full_name || 'Unknown User'}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {/* Show admin role if user has admin privileges */}
                    {user.admin_roles && user.admin_roles.length > 0 ? (
                      user.admin_roles.map((roleData: any, index: number) => (
                        <Badge key={index} className="bg-red-100 text-red-800">
                          {roleData.role?.replace('_', ' ') || 'Admin'}
                        </Badge>
                      ))
                    ) : (
                      <Badge className={getRoleBadgeColor(user.user_role)}>
                        {user.user_role?.replace('_', ' ') || 'User'}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.profile_completed ? 'default' : 'secondary'}>
                    {user.profile_completed ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ProfileCompletionBar 
                    user={user} 
                    onSendReminder={handleSendReminder}
                    compact={false}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar className="h-3 w-3" />
                    {user.last_login_at 
                      ? new Date(user.last_login_at).toLocaleDateString()
                      : 'Never'
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUserAction(user.id, user.profile_completed ? 'deactivate' : 'activate')}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      {user.profile_completed ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <UsersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount || 0}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          isLoading={isLoading}
        />

        <ProfileCompletionReminder
          isOpen={!!reminderUser}
          onClose={() => setReminderUser(null)}
          user={reminderUser}
          completionPercentage={reminderPercentage}
          onReminderSent={handleReminderSent}
        />
      </CardContent>
    </Card>
  );
};
