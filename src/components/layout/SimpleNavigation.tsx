import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  Briefcase, 
  GraduationCap, 
  User, 
  Settings,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAccess } from '@/hooks/useAdminAccess';
import { filterNavigationByPermissions } from '@/utils/navigationFilter';

const allNavigationItems = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
    isPublic: true,
    requiresAuth: false
  },
  {
    title: 'Network',
    href: '/network',
    icon: Users,
    isPublic: true,
    requiresAuth: true
  },
  {
    title: 'Jobs',
    href: '/jobs',
    icon: Briefcase,
    isPublic: true,
    requiresAuth: false
  },
  {
    title: 'Employer',
    href: '/employer',
    icon: Briefcase,
    isPublic: true,
    requiresAuth: false
  },
  {
    title: 'Colleges',
    href: '/colleges',
    icon: GraduationCap,
    isPublic: true,
    requiresAuth: false
  },
  {
    title: 'Passport',
    href: '/passport',
    icon: Award,
    isPublic: true,
    requiresAuth: true
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
    isPublic: true,
    requiresAuth: true
  },
  {
    title: 'Learn',
    href: '/learning',
    icon: GraduationCap,
    isPublic: false,
    requiresAdminAccess: true
  }
];

interface SimpleNavigationProps {
  className?: string;
  variant?: 'horizontal' | 'vertical';
}

export const SimpleNavigation: React.FC<SimpleNavigationProps> = ({ 
  className,
  variant = 'horizontal' 
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin, isLoading } = useAdminAccess();

  // Filter navigation items based on user permissions
  const visibleItems = allNavigationItems.filter(item => {
    // Admin-only routes
    if (item.requiresAdminAccess) {
      return user && isAdmin;
    }

    // Public routes that require authentication
    if (item.isPublic && item.requiresAuth) {
      return user;
    }

    // Completely public routes
    if (item.isPublic || item.requiresAuth === false) {
      return true;
    }

    // Default to requiring authentication
    return user;
  });

  return (
    <nav className={cn(
      "flex gap-1",
      variant === 'vertical' ? "flex-col" : "flex-row",
      className
    )}>
      {visibleItems.map((item) => {
        const isActive = location.pathname === item.href || 
          (item.href !== '/' && location.pathname.startsWith(item.href));
        
        return (
          <Button
            key={item.href}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            className={cn(
              "justify-start gap-2",
              variant === 'vertical' ? "w-full" : "",
              isActive && "bg-primary text-primary-foreground"
            )}
            asChild
          >
            <Link to={item.href}>
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
};