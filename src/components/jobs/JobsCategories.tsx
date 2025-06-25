
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface JobsCategoriesProps {
  categories: Array<{ id: string; name: string; slug: string }>;
}

export const JobsCategories: React.FC<JobsCategoriesProps> = ({ categories }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-lg font-semibold">Browse by Category</h2>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.slice(0, 10).map((category) => (
          <Badge
            key={category.id}
            variant="outline"
            className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
            onClick={() => navigate(`/jobs/categories?category=${category.slug}`)}
          >
            {category.name}
          </Badge>
        ))}
        {categories.length > 10 && (
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => navigate('/jobs/categories')}
          >
            +{categories.length - 10} more
          </Badge>
        )}
      </div>
    </div>
  );
};
