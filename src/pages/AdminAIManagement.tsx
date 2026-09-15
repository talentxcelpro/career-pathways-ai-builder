import React from 'react';
import { AIManagementCommandCenter } from '@/components/admin/AIManagementDashboard';

const AdminAIManagement: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <AIManagementCommandCenter />
    </div>
  );
};

export default AdminAIManagement;

