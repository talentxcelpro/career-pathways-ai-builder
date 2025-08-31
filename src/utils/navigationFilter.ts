import { NavItem } from "@/types/nav-item";

export interface UserPermissions {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

export const filterNavigationByPermissions = (
  navItems: NavItem[],
  permissions: UserPermissions
): NavItem[] => {
  const { isAuthenticated, isAdmin, isLoading } = permissions;

  // If still loading, return empty array to avoid flashing
  if (isLoading) {
    return [];
  }

  return navItems.filter((item) => {
    // Admin-only routes
    if (item.requiresAdminAccess) {
      return isAuthenticated && isAdmin;
    }

    // Public routes that require authentication
    if (item.isPublic && item.requiresAuth) {
      return isAuthenticated;
    }

    // Completely public routes
    if (item.isPublic || item.requiresAuth === false) {
      return true;
    }

    // Private routes (not marked as public)
    if (!item.isPublic) {
      // If not marked as admin-only but also not public, hide from regular users
      return isAuthenticated && isAdmin;
    }

    // Default to requiring authentication
    return isAuthenticated;
  });
};

export const shouldShowRoute = (
  item: NavItem,
  permissions: UserPermissions
): boolean => {
  const { isAuthenticated, isAdmin } = permissions;

  // Admin routes
  if (item.requiresAdminAccess) {
    return isAuthenticated && isAdmin;
  }

  // Public routes
  if (item.isPublic) {
    return item.requiresAuth ? isAuthenticated : true;
  }

  // Private routes (default behavior)
  return isAuthenticated;
};