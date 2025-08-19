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

const navigationItems = [
  {
    title: 'Home',
    href: '/',
    icon: Home
  },
  {
    title: 'Network',
    href: '/network',
    icon: Users
  },
  {
    title: 'Jobs',
    href: '/jobs',
    icon: Briefcase
  },
  {
    title: 'Learn',
    href: '/learning',
    icon: GraduationCap
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User
  },
  {
    title: 'Passport',
    href: '/passport',
    icon: Award
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

  return (
    <nav className={cn(
      "flex gap-1",
      variant === 'vertical' ? "flex-col" : "flex-row",
      className
    )}>
      {navigationItems.map((item) => {
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