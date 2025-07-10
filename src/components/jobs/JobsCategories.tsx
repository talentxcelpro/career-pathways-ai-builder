
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Megaphone, 
  Palette, 
  TrendingUp, 
  Calculator,
  ChevronRight 
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface JobsCategoriesProps {
  categories: Category[];
  onCategoryClick?: (category: string) => void;
}

const categoryIcons = {
  'technology': Code,
  'marketing': Megaphone,
  'design': Palette,
  'sales': TrendingUp,
  'finance': Calculator,
};

export const JobsCategories: React.FC<JobsCategoriesProps> = ({ 
  categories, 
  onCategoryClick 
}) => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: Category) => {
    if (onCategoryClick) {
      onCategoryClick(category.name);
    } else {
      // Navigate to jobs with category filter
      navigate(`/jobs?category=${category.slug}`);
    }
  };

  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Browse by Category</h3>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((category) => {
            const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || Code;
            return (
              <Badge
                key={category.id}
                variant="outline"
                onClick={() => handleCategoryClick(category)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors group"
              >
                <IconComponent className="h-4 w-4" />
                {category.name}
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
};
