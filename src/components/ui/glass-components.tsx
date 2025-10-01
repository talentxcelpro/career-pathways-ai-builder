import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className,
  hover = false,
  gradient = false 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'glass-card p-6',
        gradient && 'bg-gradient-to-br from-primary/10 via-transparent to-secondary/10',
        hover && 'hover:scale-[1.02] cursor-pointer',
        'smooth-transition gpu-accelerated',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

interface GlassButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  className,
  onClick,
  disabled,
  type = 'button'
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(
        'glass-button px-6 py-3 font-medium',
        variant === 'primary' && 'bg-primary/20 text-primary hover:bg-primary/30',
        variant === 'secondary' && 'bg-secondary/20 text-secondary-foreground hover:bg-secondary/30',
        variant === 'ghost' && 'hover:bg-white/10',
        'gpu-accelerated',
        className
      )}
    >
      {children}
    </motion.button>
  );
};

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const GlassInput: React.FC<GlassInputProps> = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        'glass-input w-full px-4 py-3 outline-none',
        'focus:ring-2 focus:ring-primary/50',
        'smooth-transition gpu-accelerated',
        className
      )}
      {...props}
    />
  );
};

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className, 
  count = 1 
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'glass rounded-lg animate-pulse',
            'h-24 w-full mb-4',
            className
          )}
        />
      ))}
    </>
  );
};

export const GlassNavbar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <nav className="glass-navbar">
      <div className="container mx-auto">
        {children}
      </div>
    </nav>
  );
};
