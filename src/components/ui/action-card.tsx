
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  gradient: string;
  featured?: boolean;
  badge?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  gradient,
  featured = false,
  badge
}) => {
  return (
    <Card 
      className={`relative cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02] ${
        featured ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      }`}
      onClick={onClick}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`}></div>
      <div className="relative z-10 p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
              {badge && (
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
