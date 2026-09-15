
import React from 'react';

export interface NavItem {
  title: string;
  to: string;
  exact?: boolean;
  description?: string;
  icon?: React.ReactNode;
  page: React.ReactNode;
  children?: NavItem[];
  isNew?: boolean;
  requiresAuth?: boolean;
  requiresEmployerAccess?: boolean;
  requiresAdminAccess?: boolean;
  isPublic?: boolean;
}
