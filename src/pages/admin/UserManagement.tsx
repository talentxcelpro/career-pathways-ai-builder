
import React from 'react';
import { UnifiedAdminLayout } from '@/components/admin/UnifiedAdminLayout';
import { UserStatsCards } from '@/components/admin/users/UserStatsCards';
import { UserFilters } from '@/components/admin/users/UserFilters';
import { UsersList } from '@/components/admin/users/UsersList';
import { useUserManagement } from '@/hooks/useUserManagement';

const UserManagement = () => {
  const {
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    isLoading,
    userStats,
    totalCount,
    totalPages,
    handleUserAction,
    filteredUsers,
    refetch
  } = useUserManagement();

  return (
    <UnifiedAdminLayout 
      title="User Management" 
      description="Manage and moderate all platform users"
    >
      <div className="space-y-8">
        <UserStatsCards userStats={userStats} />
        
        <UserFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          filteredUsers={filteredUsers}
          onUsersChanged={() => refetch()}
        />

        <UsersList
          users={filteredUsers}
          isLoading={isLoading}
          handleUserAction={handleUserAction}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalCount={totalCount || 0}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </UnifiedAdminLayout>
  );
};

export default UserManagement;
