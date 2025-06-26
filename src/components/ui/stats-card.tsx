
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  gradient: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  gradient
}) => {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Icon className="h-6 w-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center text-xs font-medium ${
              trend.isPositive ? 'text-green-100' : 'text-red-100'
            }`}>
              {trend.value}
            </div>
          )}
        </div>
        <div className="text-white">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-2xl font-bold mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs opacity-75">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};
