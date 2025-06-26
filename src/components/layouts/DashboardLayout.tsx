
import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';

interface DashboardLayoutProps {
  children?: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumb />
        <div className="mt-4">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};
