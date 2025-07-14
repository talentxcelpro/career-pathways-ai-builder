import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, UserPlus, Upload, Mail } from 'lucide-react';
import { ExportButton } from '@/components/admin/ExportButton';
import { AddUserModal } from './AddUserModal';
import { ImportUsersModal } from './ImportUsersModal';
import { EmailManagementPanel } from './EmailManagementPanel';

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  filteredUsers: any[];
  onUsersChanged: () => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  filteredUsers,
  onUsersChanged
}) => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEmailPanel, setShowEmailPanel] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search and Filters Row */}
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Roles</option>
                <option value="job_seeker">Job Seekers</option>
                <option value="employer">Employers</option>
                <option value="admin">Admins</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            {/* Action Buttons Row */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
              <ExportButton 
                data={filteredUsers} 
                filename="users-export" 
                format="csv"
              />
              <Dialog open={showEmailPanel} onOpenChange={setShowEmailPanel}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Management
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Email Management Panel</DialogTitle>
                  </DialogHeader>
                  <EmailManagementPanel />
                </DialogContent>
              </Dialog>
              <Button
                onClick={() => setShowAddUserModal(true)}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onUserAdded={() => {
          setShowAddUserModal(false);
          onUsersChanged();
        }}
      />

      <ImportUsersModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onUsersImported={() => {
          setShowImportModal(false);
          onUsersChanged();
        }}
      />
    </>
  );
};