import React from 'react';
import { Outlet } from 'react-router-dom';
import { PageSpecificBottomNav } from '@/components/navigation/PageSpecificBottomNav';

// Layout component that adds bottom navigation to all pages
export const AppLayoutWithBottomNav: React.FC = () => {
  return (
    <>
      <Outlet />
      <PageSpecificBottomNav />
    </>
  );
};